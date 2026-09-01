import React, { createContext, useCallback, useContext, useRef, useState, useEffect } from 'react';
import {fetchWithAuth, GET_NOTIFICATIONS_API, GET_UNREAD_NOTIFICATIONS_API, JWT_STORAGE_KEY, MARK_NOTIFICATIONS_AS_READ_API, NOTIFICATIONS_PAGE_SIZE} from "../utils/Utils";
import {useUser} from "./UserProvider";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    // Notification pagination follow-up: real backend paging (page 0 on initial load, then
    // page 1, 2, ... on demand) instead of the old client-side re-slicing of a single,
    // already-fully-fetched batch, which silently couldn't reach anything past the backend's
    // default cap. loadingMoreRef is a synchronous in-flight guard (state alone can't prevent
    // two rapid-fire "next" calls from react-infinite-scroll-component both reading stale
    // loadingMore===false before either state update lands).
    const [nextPage, setNextPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadingMoreRef = useRef(false);
    const {user}=useUser();
    const fetchNotifications = useCallback(async () => {
        if (!user) return null;
        try {
            const token=localStorage.getItem(JWT_STORAGE_KEY);
            if (!token){
                throw new Error("User Not Authenticated!")
            }

            const response = await fetchWithAuth(GET_NOTIFICATIONS_API());
            if (!response.ok) {
                throw new Error('Failed to fetch user posts');
            }

            const notificationData = await response.json();
            setNotifications(notificationData);
            setHasMore(notificationData.length >= NOTIFICATIONS_PAGE_SIZE);
            setNextPage(1);
        } catch (err) {
            console.error('Error fetching user posts:', err);
        }
    }, [user]);

    // Requests the next older page and appends it, de-duplicated by id. Stops (hasMore=false)
    // once a page comes back smaller than NOTIFICATIONS_PAGE_SIZE, matching the same
    // stop-when-exhausted contract already used for chat/comments/likes pagination.
    const fetchMoreNotifications = useCallback(async () => {
        if (!hasMore || loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        try {
            const response = await fetchWithAuth(GET_NOTIFICATIONS_API(nextPage));
            if (!response.ok) {
                throw new Error('Failed to fetch more notifications');
            }
            const olderBatch = await response.json();
            setNotifications((prev) => {
                const existingIds = new Set(prev.map((n) => n.id));
                const deduped = olderBatch.filter((n) => !existingIds.has(n.id));
                return [...prev, ...deduped];
            });
            setHasMore(olderBatch.length >= NOTIFICATIONS_PAGE_SIZE);
            setNextPage((p) => p + 1);
        } catch (err) {
            console.error('Error fetching more notifications:', err);
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [hasMore, nextPage]);
    const fetchUnreadCount = useCallback(async () => {
        try {
            const token = localStorage.getItem(JWT_STORAGE_KEY);
            if (!token) return;

            const res = await fetchWithAuth(GET_UNREAD_NOTIFICATIONS_API);
            if (!res.ok) {
                throw new Error("Failed to fetch unread notifications");
            }

            setUnreadCount(await res.json());
        } catch (err) {
            console.error('Error fetching unread notifications', err);
        }
    }, []);

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem(JWT_STORAGE_KEY);
            if (!token) return;

            const response = await fetchWithAuth(MARK_NOTIFICATIONS_AS_READ_API, { method: "POST" });
            if (!response.ok) {
                throw new Error("Failed to mark notifications as read");
            }

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking read Notifications', err);
        }
    };
    const addNotification = useCallback((notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [user, fetchNotifications, fetchUnreadCount]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAllAsRead,
                addNotification,
                fetchMoreNotifications,
                hasMoreNotifications: hasMore,
                loadingMoreNotifications: loadingMore,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
