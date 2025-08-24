import React, { useEffect, useState } from "react";
import {
    MainContainer,
    ChatContainer,
    MessageInput, Avatar, ConversationHeader, MessageList, Message,TypingIndicator
} from "@chatscope/chat-ui-kit-react";
import "../../assets/styles/ChatOverride.css"
import ConversationsList from "./ConversationsList";
import { useUser } from "../../context/UserProvider";
import { useMessages } from "../../context/MessageProvider";
import {formatDate, formatTime} from "../../utils/Utils";
import {useLocation} from "react-router-dom";
import {useWebSocketContext} from "../../context/WebSocketProvider";

function Chat() {
    const { user } = useUser();
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();
    const { fetchConversationMessages, messages, setMessages ,markThreadRead } = useMessages();
    const { sendMessage, sendMarkAsRead, sendActiveChatStatus } = useWebSocketContext();
    const [sendingGhosts, setSendingGhosts] = useState([]);
     const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
      useEffect(() => {
           const onResize = () => setIsMobile(window.innerWidth < 768);
           window.addEventListener("resize", onResize);
           return () => window.removeEventListener("resize", onResize);
         }, []);



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
    }, []);


    useEffect(() => {
        return () => {
            sendActiveChatStatus(user.id, null);
        };
    }, [location.pathname]);


    const handleSelectUser = async (selectedUser) => {
        if (currentUser && currentUser.id !== selectedUser.id) {
            sendActiveChatStatus(user.id, null);
        }

        if (!messages[selectedUser.id]) {
            await fetchConversationMessages(user.id, selectedUser.id);
        }
        markThreadRead(selectedUser.id);
        sendMarkAsRead(selectedUser.id, user.id);

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

            const ghostId = `${currentUser.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                setSendingGhosts(g => [...g, ghostId]);
               setTimeout(() => {
                   setSendingGhosts(g => g.filter(id => id !== ghostId));
                    }, 1200);

            sendMessage({
                senderId: user.id,
                receiverId: currentUser.id,
                message,
                sentTime: new Date().toISOString()
            });
        }
    };
    const handleBack = () => {
        setSendingGhosts([])
        setCurrentUser(null);
    };
    const userMessages = currentUser ? messages[currentUser.id] : [];

    return (
        <div className="min-h-[calc(100dvh-6rem)]">
            <MainContainer   responsive style={{ height: "750px"}}>
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
                                                }}>✓✓</span> )}

                                    </Message.Footer>
                                </Message>
                            ))
                        ) : null}


                        {currentUser && sendingGhosts.map(id => (
                            <Message
                                key={`ghost-${id}`}
                                model={{
                                    type: "custom",
                                    sender: "You",
                                    direction: "outgoing",
                                    position: "single",
                                    sentTime: new Date().toISOString()
                                }}>
                                <Avatar
                                    src={user?.profilePictureUrl}
                                    name={user?.fullName}
                                />
                                <Message.CustomContent>
                                    <div className="pending-bubble">
                                        <span className="dot" />
                                        <span className="dot" style={{ animationDelay: ".15s" }} />
                                        <span className="dot" style={{ animationDelay: ".3s" }} />
                                    </div>
                                </Message.CustomContent>

                                <Message.Footer>Sending…</Message.Footer>
                            </Message>
                        ))}

                    </MessageList>
                    <MessageInput placeholder="Type message here..." onSend={handleSend} />
                </ChatContainer>
            </MainContainer>
        </div>
    );
}

export default Chat;