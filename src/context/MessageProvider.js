import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "./UserProvider";
import { GET_CONVERSATION_BETWEEN_USERS_API, API_BASE_URL } from "../utils/Utils";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState({});
    const [unreadByUser, setUnreadByUser] = useState({});
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

    const addMessage = (msg) => {
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
    };

    const fetchConversationMessages = async (userId, otherUserId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) throw new Error("Missing token");

            const res = await fetch(GET_CONVERSATION_BETWEEN_USERS_API(userId, otherUserId), {
                headers: { Authorization: `Bearer ${token}` },
            });
            const messagesData = await res.json();

            setMessages((prev) => ({ ...prev, [otherUserId]: messagesData }));
        } catch (err) {
            console.error("Error fetching conversation messages:", err);
        }
    };

    const refreshUnreadSummary = async () => {
        const token = localStorage.getItem("jwtToken");
        if (!token || !user?.id) return;

        pendingCtrl.current?.abort();
        const ctrl = new AbortController();
        pendingCtrl.current = ctrl;

        try {
            const res = await fetch(`${API_BASE_URL}/messages/unread-summary/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
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
    };

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (!token || !user?.id) return;
        if (fetchedForRef.current === user.id) return;
        fetchedForRef.current = user.id;
        refreshUnreadSummary();
    }, [user?.id]);

    return (
        <MessageContext.Provider
            value={{
                messages,
                setMessages,
                fetchConversationMessages,
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
