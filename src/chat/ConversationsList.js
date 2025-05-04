import React, {useState,useEffect} from "react";
import {
    Sidebar,
    Search,
    ConversationList,
    Conversation,
    Avatar,
} from "@chatscope/chat-ui-kit-react";
import {useMessages} from "../context/MessageProvider";

function ConversationsList({friendsList, currentUser, onSelect }) {
    const { messages } = useMessages();
    const [version, setVersion] = useState(0);
    const [sortedFriends, setSortedFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const getUnreadCount = (friendId) => {
        if (currentUser?.id === friendId) return 0;
        const userMessages = messages[friendId] || [];

        return userMessages.filter(msg => !msg.isRead && msg.senderId === friendId).length;
    };
    // useEffect(() => {
    //     // כל שינוי ב־messages יגרום לרינדור מחדש ע"י עדכון version
    //     setVersion(v => v + 1);
    // }, [messages]);
    useEffect(() => {
        const sorted = [...friendsList].sort((a, b) => {
            const lastA = messages[a.id]?.[messages[a.id].length - 1]?.sentTime || a.lastMessageTime;
            const lastB = messages[b.id]?.[messages[b.id].length - 1]?.sentTime || b.lastMessageTime;
            return new Date(lastB) - new Date(lastA);
        });
        setSortedFriends(sorted);
        setVersion(v => v + 1);
    }, [friendsList, messages]);

    const filteredFriends = sortedFriends.filter(friend =>
        friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <Sidebar position="left">
            <Search placeholder="Search..."
                    value={searchTerm}
                    onChange={(value) => setSearchTerm(value)}
            />
            <ConversationList key={version}>
                {filteredFriends.map((friend) => {
                    const lastMsg = messages[friend.id]?.[messages[friend.id].length - 1];
                    const lastContent = lastMsg ? lastMsg.message : friend.lastMessageContent;
                    const unreadCount = getUnreadCount(friend.id);

                    return (
                        <Conversation
                            key={friend.id}
                            name={friend.fullName}
                            lastSenderName={friend.sentByCurrentUser ? "You" : friend.name}
                            info={lastContent}
                            unreadCnt={unreadCount > 0 ? unreadCount : undefined}
                            unreadDot={unreadCount > 0}
                            onClick={() => onSelect(friend)}
                        >
                            <Avatar name={friend.name} src={friend.profilePictureUrl} />
                        </Conversation>
                    );
                })}
            </ConversationList>
        </Sidebar>
    );
}

export default ConversationsList;
