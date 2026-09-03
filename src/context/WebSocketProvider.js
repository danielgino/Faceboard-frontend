import React, { createContext, useCallback, useContext, useRef, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { useUser } from "./UserProvider";
import { JWT_STORAGE_KEY } from "../utils/Utils";

const WebSocketContext = createContext();
export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const { user } = useUser();
    const clientRef = useRef(null);
    // Tracks which authenticated user.id clientRef.current actually belongs
    // to, so identity (not mere existence) drives reconnect decisions - see
    // the account-switch fix below.
    const connectedUserIdRef = useRef(null);
    // Both WebSocketProvider's own effect and WebSocketHandler call connect()
    // for the same identity, in an order React doesn't guarantee. The STOMP
    // client's own onConnect only fires once per (re)connect, so binding it
    // to whichever caller happened to be the one that constructed the client
    // would silently drop the OTHER caller's callback depending on race
    // order. Queueing every registered callback here and firing all of them
    // from onConnect makes connect() safe to call from multiple places in
    // any order - see the two branches below.
    const pendingOnConnectRef = useRef([]);

    const connect = useCallback((onConnectCallback) => {
        // Demo Mode: the backend rejects every STOMP CONNECT for a demo session outright (see
        // JwtChannelInterceptor.java) - never attempt one, regardless of caller, so stompjs's
        // reconnectDelay never retries a connection that can only ever fail.
        if (!user?.id || user?.demo) return;

        if (clientRef.current && connectedUserIdRef.current === user.id) {
            // Already connected (or connecting) as this exact user -
            // idempotent: no new client, no re-activate. If a caller still
            // wants to know when the connection is ready, either fire
            // immediately (already connected) or queue for the next
            // onConnect (still connecting).
            if (onConnectCallback) {
                if (clientRef.current.connected) {
                    onConnectCallback();
                } else {
                    pendingOnConnectRef.current.push(onConnectCallback);
                }
            }
            return;
        }

        // Either there's no client yet, or the existing one belongs to a
        // different, now-stale identity (an account switch). Capture and
        // clear it BEFORE creating the replacement: deactivate() is async,
        // and only ever touching a locally-captured reference means a late
        // deactivate callback from the OLD client can never reach back and
        // clear state that has since moved on to the NEW client.
        const staleClient = clientRef.current;
        clientRef.current = null;
        connectedUserIdRef.current = null;
        if (staleClient) {
            staleClient.deactivate();
        }

        // console.log(" Opening WebSocket...");
        // console.log(" brokerURL:", process.env.REACT_APP_WS_URL);
        const token = localStorage.getItem(JWT_STORAGE_KEY);

        pendingOnConnectRef.current = onConnectCallback ? [onConnectCallback] : [];

        const client = new Client({
            brokerURL:  process.env.REACT_APP_WS_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
                userId: user.id.toString(),
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            // debug: (str) => console.log("📡", str),
            onConnect: (frame) => {
                // console.log(" WebSocket connected"); //checks
                const callbacks = pendingOnConnectRef.current;
                pendingOnConnectRef.current = [];
                callbacks.forEach((cb) => cb());
            },
        });

        client.activate();
        clientRef.current = client;
        connectedUserIdRef.current = user.id;
    }, [user?.id, user?.demo]);

    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                connectedUserIdRef.current = null;
                pendingOnConnectRef.current = [];
            }
        };
    }, []);

    useEffect(() => {
        if (user?.id) {
            connect();
        } else if (clientRef.current) {
            // Logout (or any user -> null transition): don't leave an
            // authenticated client alive under a session that no longer
            // exists client-side. Neither this effect's own [user?.id]
            // guard nor WebSocketHandler's mirror-image guard ever calls
            // connect() with no user, so this is the one place that has to
            // own tearing the client down.
            const staleClient = clientRef.current;
            clientRef.current = null;
            connectedUserIdRef.current = null;
            pendingOnConnectRef.current = [];
            staleClient.deactivate();
        }
    }, [user?.id, connect]);

    // clientRef is a stable ref (never reassigned), so these only ever read
    // call-time arguments - none of them need `user` or any other reactive
    // value, hence the empty/[send] deps. Stabilizing them lets consumers
    // like Chat.js's active-chat-status effect depend on them without
    // triggering extra sends on unrelated re-renders.
    const send = useCallback((destination, body) => {
        if (!clientRef.current?.connected) {
           console.warn("WebSocket not connected");
            return;
        }

        clientRef.current.publish({
            destination,
            body: JSON.stringify(body),
        });
    }, []);

    const sendMessage = useCallback((message) => send("/app/sendMessage", message), [send]);

    const sendMarkAsRead = useCallback((senderId, receiverId) =>
        send("/app/markAsRead", { senderId, receiverId }), [send]);

    const sendActiveChatStatus = useCallback((userId, chattingWith) =>
        send("/app/activeChat", { userId, chattingWith }), [send]);

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
