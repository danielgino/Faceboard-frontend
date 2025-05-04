import React, { createContext, useContext, useState, useEffect } from "react";
//import useWebSocket from "../service/WebSocketService";
import { useUser } from "./UserProvider";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState({});
    const { user } = useUser();

    const addMessage = (msg) => {
        setMessages((prev) => {
            const chatKey = msg.senderId === user.id ? msg.receiverId : msg.senderId;
            const existing = prev[chatKey] || [];
            const exists = existing.some(
                m => m.sentTime === msg.sentTime && m.message === msg.message
            );
            if (exists) return prev;

            return {
                ...prev,
                [chatKey]: [...existing, msg].sort(
                    (a, b) => new Date(a.sentTime) - new Date(b.sentTime)
                )
            };
        });
    };

    const fetchConversationMessages = async (userId, otherUserId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) throw new Error("Missing token");

            const response = await fetch(`http://localhost:8080/messages/conversation/${userId}/${otherUserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const messagesData = await response.json();

            setMessages((prev) => ({
                ...prev,
                [otherUserId]: messagesData
            }));

        } catch (err) {
            console.error('❌ Error fetching conversation messages:', err);
        }
    };

    return (
        <MessageContext.Provider value={{ messages, setMessages, fetchConversationMessages,addMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessages = () => useContext(MessageContext);
