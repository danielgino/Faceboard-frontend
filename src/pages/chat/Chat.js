import React, { useEffect, useRef, useState } from "react";
import { MainContainer } from "@chatscope/chat-ui-kit-react";
import "../../assets/styles/ChatOverride.css"
import ConversationsList from "./ConversationsList";
import useChatViewportHeight from "./useChatViewportHeight";
import { useUser } from "../../context/UserProvider";
import { useMessages } from "../../context/MessageProvider";
import {useWebSocketContext} from "../../context/WebSocketProvider";
import ChatConversationPane from "./components/ChatConversationPane";

function Chat() {
    const { user } = useUser();
    const [currentUser, setCurrentUser] = useState(null);
    const {
        fetchConversationMessages,
        fetchOlderMessages,
        hasMoreOlderMessages,
        isLoadingOlderMessages,
        messages,
        setMessages,
        markThreadRead,
    } = useMessages();
    const { sendMessage, sendMarkAsRead, sendActiveChatStatus } = useWebSocketContext();
    const [sendingGhosts, setSendingGhosts] = useState([]);
    const chatRootRef = useRef(null);
    const { height: chatHeight } = useChatViewportHeight(chatRootRef);


    // Sole owner of the active-chat-status and mark-as-read WebSocket events:
    // every currentUser transition (selecting a conversation, closing one via
    // handleBack, or unmounting) flows through this one effect instead of
    // also being sent imperatively from the triggering handler, so each
    // transition produces exactly one STOMP send instead of two. The early
    // return (no cleanup registered) when currentUser is null matters just as
    // much as the send itself: without it, the very first selection (and an
    // unmount with no conversation open) would register a leave-signal
    // cleanup for a conversation that was never actually active.
    useEffect(() => {
        if (!currentUser) {
            return;
        }

        sendActiveChatStatus(user.id, currentUser.id);
        sendMarkAsRead(currentUser.id, user.id);

        return () => {
            sendActiveChatStatus(user.id, null);
        };
    }, [currentUser, sendActiveChatStatus, sendMarkAsRead, user.id]);

    const handleSelectUser = async (selectedUser) => {
        if (!messages[selectedUser.id]) {
            await fetchConversationMessages(user.id, selectedUser.id);
        }
        markThreadRead(selectedUser.id);

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
    const handleLoadOlderMessages = () => {
        if (currentUser) {
            fetchOlderMessages(user.id, currentUser.id);
        }
    };
    const userMessages = currentUser ? messages[currentUser.id] : [];

    return (
        <div
            ref={chatRootRef}
            className="h-[calc(100dvh-80px-4rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-hidden md:h-auto md:overflow-visible md:min-h-[calc(100dvh-6rem)]"
        >
            <MainContainer   responsive style={{ height: `${chatHeight}px` }}>
                <ConversationsList
                    friendsList={user.friendsList}
                    onSelect={handleSelectUser}
                    currentUser={currentUser}
                    messages={messages}
                />
                <ChatConversationPane
                    currentUser={currentUser}
                    onBack={handleBack}
                    messages={userMessages}
                    sendingGhosts={sendingGhosts}
                    user={user}
                    onSend={handleSend}
                    onLoadOlder={handleLoadOlderMessages}
                    hasMoreOlder={currentUser ? hasMoreOlderMessages(currentUser.id) : false}
                    loadingOlder={currentUser ? isLoadingOlderMessages(currentUser.id) : false}
                />
            </MainContainer>
        </div>
    );
}

export default Chat;
