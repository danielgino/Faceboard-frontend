import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {GET_NOTIFICATIONS_API, GET_UNREAD_NOTIFICATIONS_API, MARK_NOTIFICATIONS_AS_READ_API} from "../utils/Utils";
import {useUser} from "./UserProvider";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const {user}=useUser();
    const fetchNotifications = async () => {
        if (!user) return null;
        try {
            const token=localStorage.getItem("jwtToken");
            if (!token){
                throw new Error("User Not Authenticated!")
            }

            const response = await fetch(GET_NOTIFICATIONS_API, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user posts');
            }

            const notificationData = await response.json();
            setNotifications(notificationData);
        } catch (err) {
            console.error('Error fetching user posts:', err);
        }
    };
    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) return;

            const res = await axios.get(GET_UNREAD_NOTIFICATIONS_API, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUnreadCount(res.data);
        } catch (err) {
            console.error('Error fetching unread notifications', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) return;

            await axios.post(MARK_NOTIFICATIONS_AS_READ_API, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking read Notifications', err);
        }
    };
    const addNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [user]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                fetchNotifications,
                fetchUnreadCount,
                markAllAsRead,
                addNotification
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
