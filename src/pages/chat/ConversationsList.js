import React, {useState,useEffect} from "react";
import {
    Sidebar,
    Search,
    ConversationList,
    Conversation,
    Avatar,
} from "@chatscope/chat-ui-kit-react";
import {useMessages} from "../../context/MessageProvider";
import PrimitiveAvatar from "../../components/common/Avatar";
import {formatTime} from "../../utils/Utils";

function ConversationsList({friendsList, currentUser, onSelect }) {
    const { messages,unreadByUser  } = useMessages();
    const [version, setVersion] = useState(0);
    const [sortedFriends, setSortedFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const getUnreadCount = (friendId) => {
        const mapVal = unreadByUser[String(friendId)];
        if (mapVal != null) return mapVal;
        const userMessages = messages[friendId] || [];
        return userMessages.filter(m => !m.isRead && m.senderId === friendId).length;
    };

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
        <Sidebar className="my-sidebar" position="left">
            <Search placeholder="Search..."
                    value={searchTerm}
                    onChange={(value) => setSearchTerm(value)}

            />
            <ConversationList key={version}>
                {filteredFriends.map((friend) => {
                    const lastMsg = messages[friend.id]?.[messages[friend.id].length - 1];
                    const lastContent = lastMsg ? lastMsg.message : friend.lastMessageContent;
                    const lastTime = lastMsg?.sentTime || friend.lastMessageTime;
                    const unreadCount = getUnreadCount(friend.id);

                    return (
                        <Conversation
                            key={friend.id}
                            name={friend.fullName}
                            info={lastContent}
                            lastActivityTime={unreadCount === 0 && lastTime ? formatTime(lastTime) : undefined}
                            unreadCnt={unreadCount > 0 ? unreadCount : undefined}
                            active={currentUser?.id === friend.id}
                            onClick={() => onSelect(friend)}
                        >
                            <Avatar name={friend.fullName}>
                                <PrimitiveAvatar name={friend.fullName} src={friend.profilePictureUrl} size="100%" style={{width: "100%", height: "100%"}} />
                            </Avatar>
                        </Conversation>
                    );
                })}
            </ConversationList>
        </Sidebar>
    );
}

export default ConversationsList;
