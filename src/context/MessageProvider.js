import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "./UserProvider";
import { GET_CONVERSATION_BETWEEN_USERS_API, MESSAGES_PAGE_SIZE, API_BASE_URL, fetchWithAuth } from "../utils/Utils";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState({});
    const [unreadByUser, setUnreadByUser] = useState({});
    // Chat pagination follow-up: per-peer { nextPage, hasMore } once the initial (page-0) batch
    // has loaded. Absent entry = no initial fetch has completed yet for that peer, so
    // fetchOlderMessages has nothing to page past.
    const [olderMessagesMeta, setOlderMessagesMeta] = useState({});
    const [loadingOlderByPeer, setLoadingOlderByPeer] = useState({});
    // Synchronous in-flight guard: setState above is async, so two onYReachStart events firing
    // back-to-back (fast scroll) could both read stale loadingOlderByPeer===false before either
    // state update lands. This ref is updated immediately, not on the next render.
    const loadingOlderRef = useRef({});
    const { user } = useUser();
    const fetchedForRef = useRef(null);
    const pendingCtrl = useRef(null);

    const setUnreadMap = (summary) => {
        const sanitized = Object.fromEntries(
            Object.entries(summary || {}).map(([k, v]) => [String(k), v ?? 0])
        );
        setUnreadByUser(sanitized);
    };

    const resetUnreadFor = (peerId) => {
        setUnreadByUser((prev) => ({ ...prev, [String(peerId)]: 0 }));
    };

    const markThreadRead = (peerId) => {
        resetUnreadFor(peerId);
        setMessages((prev) => {
            const arr = prev[peerId] || [];
            const updated = arr.map((m) =>
                m.senderId === peerId ? { ...m, isRead: true } : m
            );
            return { ...prev, [peerId]: updated };
        });
    };

    const addMessage = useCallback((msg) => {
        setMessages((prev) => {
            const chatKey = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
            const existing = prev[chatKey] || [];
            const exists = existing.some(
                (m) => m.sentTime === msg.sentTime && m.message === msg.message
            );
            if (exists) return prev;

            return {
                ...prev,
                [chatKey]: [...existing, msg].sort(
                    (a, b) => new Date(a.sentTime) - new Date(b.sentTime)
                ),
            };
        });

        if (user?.id && msg.receiverId === user.id && msg.senderId !== user.id) {
            setUnreadByUser((prev) => {
                const key = String(msg.senderId);
                return { ...prev, [key]: (prev[key] || 0) + 1 };
            });
        }
    }, [user?.id]);

    const fetchConversationMessages = async (userId, otherUserId) => {
        try {
            const res = await fetchWithAuth(GET_CONVERSATION_BETWEEN_USERS_API(userId, otherUserId));
            const messagesData = await res.json();

            setMessages((prev) => ({ ...prev, [otherUserId]: messagesData }));
            setOlderMessagesMeta((prev) => ({
                ...prev,
                [otherUserId]: { nextPage: 1, hasMore: messagesData.length >= MESSAGES_PAGE_SIZE },
            }));
        } catch (err) {
            console.error("Error fetching conversation messages:", err);
        }
    };

    // Chat pagination follow-up: fetches the next older page (backend already supports
    // page/size - see M-DB2), prepends it before the already-loaded (chronologically ASC)
    // messages, and stops once a page comes back smaller than MESSAGES_PAGE_SIZE. chatscope's
    // MessageList already preserves scroll position on its own when content is prepended while
    // scrollTop is 0 (see its componentDidUpdate), so no manual scroll-position bookkeeping is
    // needed here - only the data side (fetch, dedupe, order, exhaustion) is this function's job.
    const fetchOlderMessages = useCallback(async (userId, otherUserId) => {
        const meta = olderMessagesMeta[otherUserId];
        if (!meta || !meta.hasMore) return;
        if (loadingOlderRef.current[otherUserId]) return;

        loadingOlderRef.current[otherUserId] = true;
        setLoadingOlderByPeer((prev) => ({ ...prev, [otherUserId]: true }));

        try {
            const res = await fetchWithAuth(
                GET_CONVERSATION_BETWEEN_USERS_API(userId, otherUserId, meta.nextPage)
            );
            const olderBatch = await res.json();

            setMessages((prev) => {
                const existing = prev[otherUserId] || [];
                const existingIds = new Set(existing.map((m) => m.id));
                const deduped = olderBatch.filter((m) => !existingIds.has(m.id));
                return { ...prev, [otherUserId]: [...deduped, ...existing] };
            });
            setOlderMessagesMeta((prev) => ({
                ...prev,
                [otherUserId]: {
                    nextPage: meta.nextPage + 1,
                    hasMore: olderBatch.length >= MESSAGES_PAGE_SIZE,
                },
            }));
        } catch (err) {
            console.error("Error fetching older conversation messages:", err);
        } finally {
            loadingOlderRef.current[otherUserId] = false;
            setLoadingOlderByPeer((prev) => ({ ...prev, [otherUserId]: false }));
        }
    }, [olderMessagesMeta]);

    const hasMoreOlderMessages = (otherUserId) => !!olderMessagesMeta[otherUserId]?.hasMore;
    const isLoadingOlderMessages = (otherUserId) => !!loadingOlderByPeer[otherUserId];

    const refreshUnreadSummary = useCallback(async () => {
        if (!user?.id) return;

        pendingCtrl.current?.abort();
        const ctrl = new AbortController();
        pendingCtrl.current = ctrl;

        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/messages/unread-summary/${user.id}`, {
                signal: ctrl.signal,
            });
            if (!res.ok) {
                console.warn("unread-summary failed:", res.status);
                return;
            }
            const data = await res.json();
            setUnreadMap(data);
        } catch (e) {
            if (e.name !== "AbortError") console.error("Unread summary fetch failed:", e);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;
        if (fetchedForRef.current === user.id) return;
        fetchedForRef.current = user.id;
        refreshUnreadSummary();
    }, [user?.id, refreshUnreadSummary]);

    return (
        <MessageContext.Provider
            value={{
                messages,
                setMessages,
                fetchConversationMessages,
                fetchOlderMessages,
                hasMoreOlderMessages,
                isLoadingOlderMessages,
                addMessage,
                unreadByUser,
                refreshUnreadSummary,
                resetUnreadFor,
                markThreadRead,
            }}
        >
            {children}
        </MessageContext.Provider>
    );
};

export const useMessages = () => useContext(MessageContext);
