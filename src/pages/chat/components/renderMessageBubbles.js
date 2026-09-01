import { Avatar, Message, MessageSeparator } from "@chatscope/chat-ui-kit-react";
import { CheckCheck, Link2 } from "lucide-react";
import { extractSharedPostId, formatTime, getDaySeparatorLabel, isSameCalendarDay, POST_PAGE } from "../../../utils/Utils";
import PrimitiveAvatar from "../../../components/common/Avatar";

// Builds the message bubbles for the active conversation: real messages
// (sender/read-receipt formatting), calendar-day separators, plus the
// transient "sending..." ghost bubbles. Deliberately a plain function, not a
// component: chatscope's <MessageList> validates its children's element
// types, and only a flat array of <Message>/<MessageSeparator> elements
// passes that check - wrapping this in <RenderMessageBubbles/> JSX would
// fail it. Call as renderMessageBubbles({...}) inside <MessageList>, never
// as JSX.
//
// Day separators are purely derived from the already-ordered `messages`
// array passed in - one O(n) pass, no separator state, no backend
// separator objects, no mutation of `messages`. `messages[index - 1]` is
// the true previous chronological message (the array's own ordering -
// owned upstream by the backend query + MessageProvider's client-side
// re-sort on realtime insert - is trusted as-is, not re-sorted here), so a
// separator is inserted whenever index 0 is reached or the previous
// message falls on a different LOCAL calendar day (not a 24h-apart check:
// 23:59/00:01 the next day always split into two groups). Ghost bubbles are
// intentionally excluded from this - they're transient (auto-removed once
// the real, server-timestamped message arrives) and always represent "now".
function renderMessageBubbles({messages, sendingGhosts, user, currentUser}) {
    const messageBubbles = messages && messages.length > 0
        ? messages.flatMap((msg, index) => {
            // Share feature: a message whose entire content is exactly one of
            // this app's own /post/:id links (see extractSharedPostId) renders
            // as a small "shared post" bubble instead of the raw URL as plain
            // text. Everything else about the bubble (avatars, footer/read
            // receipt, day separators) is identical either way - only the
            // message body's type/content differs, reusing the same
            // type:"custom" + Message.CustomContent mechanism already used
            // below for the "sending..." ghost bubbles.
            const sharedPostId = extractSharedPostId(msg.message);
            const footer = (
                <Message.Footer>
                    {formatTime(msg.sentTime)}
                    {msg.senderId === user.id && (
                        <CheckCheck
                            size={12}
                            strokeWidth={2}
                            style={{marginLeft: "6px"}}
                            className={msg.isRead ? "cs-read-receipt cs-read-receipt--read" : "cs-read-receipt"}
                        />
                    )}
                </Message.Footer>
            );
            const avatars = (
                <>
                    <Avatar name={user?.fullName}>
                        <PrimitiveAvatar name={user?.fullName} src={user?.profilePictureUrl} size="100%" style={{width: "100%", height: "100%"}} />
                    </Avatar>
                    {msg.senderId !== user.id && (
                        <Avatar name={currentUser.fullName}>
                            <PrimitiveAvatar name={currentUser.fullName} src={currentUser?.profilePictureUrl} size="100%" style={{width: "100%", height: "100%"}} />
                        </Avatar>
                    )}
                </>
            );

            const bubble = sharedPostId ? (
                <Message
                    key={index}
                    model={{
                        type: "custom",
                        sentTime: msg.sentTime,
                        sender: msg.senderId === user.id ? "You" : "Other",
                        direction: msg.senderId === user.id ? 'outgoing' : 'incoming',
                        position: 'single',
                    }}
                >
                    {avatars}
                    <Message.CustomContent>
                        {/* Plain <a>, not react-router's <Link>: this file sits on Chat's
                            existing import chain, which several tests (see
                            ChatMessageRendering.test.js) exercise without mocking
                            react-router-dom - importing it here breaks Jest's module
                            resolution for jest 27/react-router-dom 7 (a pre-existing,
                            documented constraint elsewhere in this codebase). A normal
                            same-origin navigation is an acceptable tradeoff for a chat
                            link. */}
                        <a href={POST_PAGE(sharedPostId)} className="flex items-center gap-1.5 text-inherit no-underline hover:underline">
                            <Link2 size={14} strokeWidth={2} />
                            Shared a post
                        </a>
                    </Message.CustomContent>
                    {footer}
                </Message>
            ) : (
                <Message
                    key={index}
                    model={{
                        type: "text",
                        message: msg.message,
                        sentTime: msg.sentTime,
                        sender: msg.senderId === user.id ? "You" : "Other",
                        direction: msg.senderId === user.id ? 'outgoing' : 'incoming',
                        position: 'single',
                    }}
                >
                    {avatars}
                    {footer}
                </Message>
            );

            const previous = index > 0 ? messages[index - 1] : null;
            const needsSeparator = !previous || !isSameCalendarDay(msg.sentTime, previous.sentTime);
            if (!needsSeparator) return [bubble];

            return [
                <MessageSeparator key={`day-${index}`} content={getDaySeparatorLabel(msg.sentTime)} />,
                bubble,
            ];
        })
        : [];

    const ghostBubbles = currentUser
        ? sendingGhosts.map(id => (
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
        ))
        : [];

    return [...messageBubbles, ...ghostBubbles];
}

export default renderMessageBubbles;
