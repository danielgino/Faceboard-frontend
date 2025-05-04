import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const token=localStorage.getItem("jwtToken");
            if (!token){
                throw new Error("User Not Authenticated!")
            }

            const response = await fetch(`http://localhost:8080/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user posts');
            }

            const notificationData = await response.json();
            setNotifications(notificationData);
           // setLoading(false)
        } catch (err) {
            console.error('Error fetching user posts:', err);
          //  setLoading(false)
        }
    };
    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) return;

            const res = await axios.get('http://localhost:8080/notifications/unread-count', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUnreadCount(res.data);
        } catch (err) {
            console.error('שגיאה בשליפת כמות התראות שלא נקראו:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) return;

            await axios.post('http://localhost:8080/notifications/mark-all-as-read', null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('שגיאה בסימון התראות כנקראו:', err);
        }
    };
    const addNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
    };
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

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
