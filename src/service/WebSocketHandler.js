// WebSocketHandler.js
import { useEffect } from "react";
import { useWebSocketContext } from "../context/WebSocketProvider";
import { useUser } from "../context/UserProvider";
import { useMessages } from "../context/MessageProvider";
import { useNotifications } from "../context/NotificationProvider";
import { Avatar } from "@material-tailwind/react";

export default function WebSocketHandler() {
    const { user } = useUser();
    const { addMessage, setMessages } = useMessages();
    const { addNotification } = useNotifications();
    const { clientRef, connect } = useWebSocketContext();

    const playMessageSound = () => {
        console.log("🔔 playMessageSound called");
        const audio = new Audio("/sounds/messageSound.mp3");

        audio.play()
            .then(() => {
                console.log("✅ Sound played successfully");
            })
            .catch((error) => {
                console.error("❌ Failed to play sound:", error.message);
            });
    };
    const playNotificationSound = () => {
        console.log("🔔 playMessageSound called");
        const audio = new Audio("/sounds/notificationSound.mp3");

        audio.play()
            .then(() => {
                console.log("✅ NOTIFICATION played successfully");
            })
            .catch((error) => {
                console.error("❌ Failed to play sound:", error.message);
            });
    };

    useEffect(() => {
        if (!user?.id) return;

        const onConnect = () => {
            const client = clientRef.current;
            if (!client) return;

            console.log("📞 Subscribing to WebSocket topics");

            client.subscribe(`/topic/messages/${user.id}`, (msg) => {
                const messages = Array.isArray(JSON.parse(msg.body)) ? JSON.parse(msg.body) : [JSON.parse(msg.body)];
                messages.forEach((message) => {
                    // ⬇️ נגן סאונד רק אם השולח הוא לא אני
                    if (message.senderId !== user.id) {
                        playMessageSound();
                    }
                    addMessage(message);
                });
                // messages.forEach(addMessage);
            });

            client.subscribe(`/topic/notifications/${user.id}`, (msg) => {
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
                                    className="border border-white shadow-md"
                                />
                                <span>{notification.content}</span>
                            </div>
                        ),
                        life: 4000,
                        className: 'bg-white/80 backdrop-blur-md shadow-lg rounded-lg'
                    });
                }
            });

            client.subscribe(`/topic/message-read/${user.id}`, (msg) => {
                const readerId = parseInt(msg.body.split(":")[1]);
                setMessages((prev) => {
                    const chatMessages = prev[readerId] || [];
                    const updated = chatMessages.map(m =>
                        m.senderId === user.id ? { ...m, isRead: true } : m
                    );
                    return { ...prev, [readerId]: updated };
                });
            });
        };

        connect(onConnect);

    }, [user?.id]);

    return null;
}
