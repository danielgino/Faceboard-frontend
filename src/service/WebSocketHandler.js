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

    const playSound = (src) => {
        const audio = new Audio(src);
        void audio.play().catch(() => {});
    };

    const playMessageSound = () => playSound("/sounds/messageSound.mp3");
    const playNotificationSound = () => playSound("/sounds/notificationSound.mp3");
    useEffect(() => {
        if (!user?.id) return;

        const onConnect = () => {
            const client = clientRef.current;
            if (!client) return;
            client.subscribe(`/topic/messages/${user.id}`, (msg) => {
                const messages = Array.isArray(JSON.parse(msg.body)) ? JSON.parse(msg.body) : [JSON.parse(msg.body)];
                messages.forEach((message) => {
                    if (message.senderId !== user.id) {
                        playMessageSound();
                    }
                    addMessage(message);
                });
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
                        life: 5000,
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
