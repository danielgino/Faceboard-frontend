import {Avatar as PrimitiveAvatar} from "../common/Avatar";
import {formatDate} from "../../utils/Utils";

// Shared row presentation for both the desktop popover (Notification.js)
// and the mobile fullscreen route (MobileNotifications.js) - the two
// already rendered near-identical Material ListItem/Avatar/Typography rows
// independently (confirmed duplication, not speculative), so this
// consolidates the JSX only. Each caller keeps its own click behavior
// (desktop navigates by type and closes the popover; mobile is
// non-interactive today) via the optional `onClick` prop - never owns it.
//
// Unread treatment: `read` is the canonical flag - it's the only field any
// real code path writes (NotificationProvider.markAllAsRead sets `n.read`);
// `isRead` was a mismatched fallback left over from the chat/message domain
// (msg.isRead is a real field there, notifications never had one) and has
// been removed here and from SideBar.js's unread-count fallback (Phase J).
function NotificationRow({notification, onClick}) {
    const isUnread = !notification.read;
    const Wrapper = onClick ? "button" : "div";

    return (
        <Wrapper
            type={onClick ? "button" : undefined}
            onClick={onClick ? () => onClick(notification) : undefined}
            className={`w-full flex items-center gap-3 rounded-ds-md px-3 py-2.5 text-left transition ${
                isUnread ? "bg-dsBrand-50 border border-dsBrand-100" : "bg-white border border-transparent"
            } ${onClick ? "hover:bg-dsNeutral-100 cursor-pointer" : ""}`}
        >
            <PrimitiveAvatar
                src={notification.senderProfilePicture}
                name={notification.senderName}
                alt=""
                size={36}
                className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <p className="text-ds-label text-dsNeutral-900 break-words">{notification.content}</p>
                <p className="text-ds-caption text-dsNeutral-500 mt-0.5">{formatDate(notification.createdAt)}</p>
            </div>
            {isUnread && (
                <span className="w-1.5 h-1.5 rounded-full bg-dsBrand-600 flex-shrink-0" aria-hidden="true" />
            )}
        </Wrapper>
    );
}

export default NotificationRow;
