import { useCallback, useEffect } from "react";
import { useWebSocketContext } from "../context/WebSocketProvider";
import { useUser } from "../context/UserProvider";
import { useMessages } from "../context/MessageProvider";
import { useNotifications } from "../context/NotificationProvider";
import { Avatar } from "@material-tailwind/react";

// Pure/stateless - no component closure needed, so it lives outside the
// component rather than needing its own useCallback dependency handling.
function playSound(src) {
    const audio = new Audio(src);
    void audio.play().catch(() => {});
}

export default function WebSocketHandler() {
    const { user } = useUser();
    const { addMessage, setMessages } = useMessages();
    const { addNotification } = useNotifications();
    const { clientRef, connect } = useWebSocketContext();

    const playMessageSound = useCallback(() => playSound("/sounds/messageSound.mp3"), []);
    const playNotificationSound = useCallback(() => playSound("/sounds/notificationSound.mp3"), []);
    useEffect(() => {
        if (!user?.id) return;

        // connect()'s onConnect callback fires asynchronously once the STOMP
        // handshake completes, which can happen after this effect's cleanup
        // has already run (e.g. user?.id changes again, or the component
        // unmounts, while the connection is still being established). The
        // `disposed` flag stops a late callback from subscribing on behalf of
        // an effect run that's already been torn down. Subscriptions created
        // by *this* effect run are tracked in `subscriptions` and explicitly
        // unsubscribed on cleanup - the shared client itself is left alone,
        // since WebSocketProvider owns its connect/deactivate lifecycle.
        let disposed = false;
        const subscriptions = [];

        const onConnect = () => {
            if (disposed) return;
            const client = clientRef.current;
            if (!client) return;
            subscriptions.push(client.subscribe(`/topic/messages/${user.id}`, (msg) => {
                const messages = Array.isArray(JSON.parse(msg.body)) ? JSON.parse(msg.body) : [JSON.parse(msg.body)];
                messages.forEach((message) => {
                    if (message.senderId !== user.id) {
                        playMessageSound();
                    }
                    addMessage(message);
                });
            }));

            subscriptions.push(client.subscribe(`/topic/notifications/${user.id}`, (msg) => {
                const notification = JSON.parse(msg.body);
                addNotification(notification);
                playNotificationSound()

                if (window.toastRef?.current) {

                    window.toastRef.current.show({
                        summary: 'New Notification 🔔',
                        detail: (
                            <div className="flex items-center gap-2">
                                <Avatar
                                    src={notification.senderProfilePicture}
                                    alt="user"
                                    size="sm"
                                    className="border border-dsNeutral-surface shadow-ds-low"
                                />
                                <span>{notification.content}</span>
                            </div>
                        ),
                        life: 5000,
                        className: 'bg-dsNeutral-surface/80 backdrop-blur-md shadow-ds-floating rounded-ds-lg'
                    });
                }
            }));

            subscriptions.push(client.subscribe(`/topic/message-read/${user.id}`, (msg) => {
                const readerId = parseInt(msg.body.split(":")[1]);
                setMessages((prev) => {
                    const chatMessages = prev[readerId] || [];
                    const updated = chatMessages.map(m =>
                        m.senderId === user.id ? { ...m, isRead: true } : m
                    );
                    return { ...prev, [readerId]: updated };
                });
            }));
        };

        connect(onConnect);

        return () => {
            disposed = true;
            subscriptions.forEach((subscription) => subscription?.unsubscribe());
        };
    }, [user?.id, clientRef, connect, addMessage, addNotification, playMessageSound, playNotificationSound, setMessages]);

    return null;
}
