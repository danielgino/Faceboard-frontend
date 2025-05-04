import React, { useEffect, useState } from "react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MainContainer,
    ChatContainer,
    MessageInput, Avatar, ConversationHeader, MessageList, Message
} from "@chatscope/chat-ui-kit-react";
import ConversationsList from "./ConversationsList";
import { useUser } from "../context/UserProvider";
import { useMessages } from "../context/MessageProvider";
import {formatDate, formatTime} from "../utils/Utils";

import {useLocation} from "react-router-dom";
import {useWebSocketContext} from "../context/WebSocketProvider";

function Chat() {
    const { user } = useUser();
    const [currentUser, setCurrentUser] = useState(null);
   // const { fetchUserMessages, messages,sendMessage,setMessages  } = useMessages();
    const location = useLocation();
    //const { sendMarkAsRead, sendActiveChatStatus } = useWebSocketContext();
    const { fetchConversationMessages, messages, setMessages } = useMessages();
    const { sendMessage, sendMarkAsRead, sendActiveChatStatus } = useWebSocketContext();
    // useEffect(() => {
    //     if (currentUser) {
    //         fetchUserMessages(currentUser.id);
    //     }
    // }, [currentUser]);

    useEffect(() => {
        console.log("Messages updated for currentUser:", messages[currentUser?.id]);
    }, [messages, currentUser]);


    useEffect(() => {
        if (currentUser) {
            sendActiveChatStatus(user.id, currentUser.id);
            sendMarkAsRead(currentUser.id, user.id);

        }

        return () => {
            sendActiveChatStatus(user.id, null);
        };
    }, [currentUser]);



    useEffect(() => {
        if (user && currentUser) {
            sendActiveChatStatus(user.id, currentUser.id);
        }
    }, []); // ⬅️ רץ פעם אחת בלבד (ברגע טעינת הקומפוננטה)


    useEffect(() => {
        return () => {
            // יישלח ברגע שעוזבים את עמוד הצ'אט (unmount של קומפוננטת Chat)
            sendActiveChatStatus(user.id, null);
            console.log("📤 User left Chat page – activeChat cleared");
        };
    }, [location.pathname]);



    // const handleSelectUser = (selectedUser) => {
    //     if (currentUser && currentUser.id !== selectedUser.id) {
    //         sendActiveChatStatus(user.id, null); // ⬅️ עוזב שיחה קודמת
    //     }
    //
    //     if (!messages[selectedUser.id]) {
    //         fetchUserMessages(selectedUser.id);
    //     }
    //
    //     setCurrentUser(selectedUser);
    // };

    const handleSelectUser = async (selectedUser) => {
        if (currentUser && currentUser.id !== selectedUser.id) {
            sendActiveChatStatus(user.id, null); // יוצא משיחה קודמת
        }

        // אם אין הודעות קודמות, שלוף מהשרת
        if (!messages[selectedUser.id]) {
            await fetchConversationMessages(user.id, selectedUser.id);
        }

        // סימון הודעות כנקראו בשרת
        sendMarkAsRead(selectedUser.id, user.id);

        // עדכון מקומי של ההודעות
        setMessages(prev => {
            if (!prev[selectedUser.id]) return prev;

            const updated = prev[selectedUser.id].map(msg =>
                msg.senderId === selectedUser.id ? { ...msg, isRead: true } : msg
            );

            return {
                ...prev,
                [selectedUser.id]: updated
            };
        });
        setCurrentUser(selectedUser);
    };

    const handleSend = (message) => {
        if (currentUser) {
            sendMessage({
                senderId: user.id,
                receiverId: currentUser.id,
                message,
                sentTime: new Date().toISOString()
            });
        }
    };
    const handleBack = () => {
        setCurrentUser(null);
    };

    const userMessages = currentUser ? messages[currentUser.id] : [];
    console.log("📥 Displaying messages for current user:", currentUser?.id, userMessages);

    return (
        <div>
            <MainContainer responsive style={{ height: "600px" }}>
                <ConversationsList
                    friendsList={user.friendsList}
                    onSelect={handleSelectUser}
                    currentUser={currentUser}
                    messages={messages}
                />
                <ChatContainer>
                    {currentUser ? (
                        <ConversationHeader>
                            <ConversationHeader.Back onClick={handleBack} />
                            <Avatar
                                src={currentUser.profilePictureUrl}
                                name={currentUser.fullName}
                            />
                            <ConversationHeader.Content
                                userName={currentUser.fullName}

                                info={currentUser.lastMessageTime !==null ?"Last Active: "+formatDate(currentUser.lastMessageTime) : "No Info yet" }
                            />
                        </ConversationHeader>
                    ) : null}
                    <MessageList>
                        {userMessages && userMessages.length > 0 ? (
                            userMessages.map((msg, index) => (
                                <Message
                                    key={index}
                                    model={{
                                        message: msg.message,
                                        sentTime: msg.sentTime,
                                        sender: msg.senderId === user.id ? "You" : "Other",
                                        direction: msg.senderId === user.id ? 'outgoing' : 'incoming',
                                        position: 'single',
                                    }}
                                >
                                    <Avatar src={user?.profilePictureUrl} name={currentUser.fullName} />
                                    {msg.senderId !== user.id && (
                                        <Avatar src={currentUser?.profilePictureUrl} name={currentUser.fullName} />
                                    )}
                                    <Message.Footer>
                                        {formatTime(msg.sentTime)}
                                        {msg.senderId === user.id && (
                                            <span
                                                style={{
                                                    marginLeft: "8px",
                                                    fontSize: "14px",
                                                    color: msg.isRead ? "green" : "gray"
                                                }}
                                            >
                                                            ✓✓
                                                    </span>
                                        )}

                                    </Message.Footer>
                                </Message>
                            ))
                        ) : null}
                    </MessageList>
                    <MessageInput placeholder="Type message here..." onSend={handleSend} />
                </ChatContainer>
            </MainContainer>
        </div>
    );
}

export default Chat;