import {
    ChatContainer, ConversationHeader, MessageList, MessageInput, Avatar
} from "@chatscope/chat-ui-kit-react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { formatDate } from "../../../utils/Utils";
import renderMessageBubbles from "./renderMessageBubbles";
import PrimitiveAvatar from "../../../components/common/Avatar";

// Owns the entire right-hand chat pane (header, message list, composer).
// chatscope's ChatContainer/ConversationHeader match their header/list/
// input/back/avatar/content slots by direct child element-type identity, so
// none of ConversationHeader, MessageList, or MessageInput can be wrapped in
// a further custom component without breaking that recognition - that's why
// they stay inline here. renderMessageBubbles is called as a plain function
// (see its own file) so MessageList receives a flat <Message> array, the
// only child shape its own validator accepts.
function ChatConversationPane({currentUser, onBack, messages, sendingGhosts, user, onSend, onLoadOlder, hasMoreOlder, loadingOlder}) {
    return (
        <ChatContainer>
            {currentUser ? (
                <ConversationHeader>
                    <ConversationHeader.Back>
                        <button type="button" onClick={onBack} aria-label="Back to conversations" className="cs-back-btn">
                            <ArrowLeft size={16} strokeWidth={2} />
                        </button>
                    </ConversationHeader.Back>
                    <Avatar name={currentUser.fullName}>
                        <PrimitiveAvatar name={currentUser.fullName} src={currentUser.profilePictureUrl} size="100%" style={{width: "100%", height: "100%"}} />
                    </Avatar>
                    <ConversationHeader.Content
                        userName={currentUser.fullName}

                        info={currentUser.lastMessageTime !==null ?"Last Active: "+formatDate(currentUser.lastMessageTime) : "No Info yet" }
                    />
                </ConversationHeader>
            ) : null}
            {/* Chat pagination follow-up: onYReachStart fires when the user scrolls to the top
                of the message list; only wired while an older page is actually known to exist,
                so scrolling to the top of a fully-loaded conversation never issues a request.
                loadingMorePosition="top" matches where the older messages actually appear. */}
            <MessageList
                loadingMore={loadingOlder}
                loadingMorePosition="top"
                onYReachStart={hasMoreOlder ? onLoadOlder : undefined}
            >
                {currentUser ? renderMessageBubbles({messages, sendingGhosts, user, currentUser}) : (
                    <MessageList.Content className="cs-chat-empty-state">
                        <MessageCircle size={32} strokeWidth={1.5} />
                        <p>Select a conversation to start chatting</p>
                    </MessageList.Content>
                )}
            </MessageList>
            {/* attachButton={false}: Chatscope's own supported prop for
                removing the control from the DOM entirely (not just
                disabling it) - no attachment feature exists, so a
                visible-but-inert paperclip icon is not shipped (Phase J). */}
            <MessageInput placeholder="Type message here..." onSend={onSend} disabled={!currentUser} attachButton={false} />
        </ChatContainer>
    );
}

export default ChatConversationPane;
