import React, { createContext, useContext, useRef, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { useUser } from "./UserProvider";

const WebSocketContext = createContext();
export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const { user } = useUser();
    const clientRef = useRef(null);
    const connect = (onConnectCallback) => {
        if (!user?.id || clientRef.current) return;

        console.log("🔌 Opening WebSocket...");
        const token = localStorage.getItem("jwtToken");

        const client = new Client({
            brokerURL:  () => new SockJS(process.env.REACT_APP_WS_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
                userId: user.id.toString(),
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => console.log("📡", str),
            onConnect: (frame) => {
                console.log("✅ WebSocket connected");
                if (onConnectCallback) onConnectCallback();
            },
        });

        client.activate();
        clientRef.current = client;
    };

    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (user?.id) {
            connect();
        }
    }, [user]);

    const send = (destination, body) => {
        if (!clientRef.current?.connected) {
            console.warn("⚠️ WebSocket not connected");
            return;
        }

        clientRef.current.publish({
            destination,
            body: JSON.stringify(body),
        });
    };

    const sendMessage = (message) => send("/app/sendMessage", message);

    const sendMarkAsRead = (senderId, receiverId) =>
        send("/app/markAsRead", { senderId, receiverId });

    const sendActiveChatStatus = (userId, chattingWith) =>
        send("/app/activeChat", { userId, chattingWith });

    return (
        <WebSocketContext.Provider value={{
            connect,
            send,
            sendMessage,
            sendMarkAsRead,
            sendActiveChatStatus,
            clientRef
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};
