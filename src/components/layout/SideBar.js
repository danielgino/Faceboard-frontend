
import {useLocation, useNavigate} from "react-router-dom";
import {
    CHAT_PAGE,
    FEED_BTN_TEXT, FRIENDS_BTN_TEXT, FRIENDS_PAGE,
    HOME_PAGE,
    INBOX_BTN_TEXT,
    LOGOUT_BTN_TEXT, MOBILE_NOTIFICATIONS_PAGE, NOTIFICATIONS_BTN_TEXT,
    PROFILE_BTN_TEXT,
    PROFILE_PAGE,
    SETTINGS_PAGE
} from "../../utils/Utils";
import {useUser} from "../../context/UserProvider";
import SideBarIcons from "../../Icons/SideBarIcons";
import {useMessages} from "../../context/MessageProvider";
import HeaderBarIcons from "../../Icons/HeaderBarIcons";
import {useNotifications} from "../../context/NotificationProvider";
import {useLogout} from "../../hooks/useLogout";
import NavigationItem from "./NavigationItem";
import SuggestedFriends from "./SuggestedFriends";
import {useSuggestedFriends} from "../../hooks/useSuggestedFriends";
import SafetyTip from "./SafetyTip";
import {useSafetyTip} from "../../hooks/useSafetyTip";
import {fluid} from "./navFluid";

// Fidelity reconciliation (Navigation micro-pass): rebuilt against the
// Design System's actual Desktop Sidebar / Mobile Bottom Navigation
// compositions (#nav) instead of retoned Material List/ListItem/Chip — a
// plain rail of NavigationItems (Profile/Friends/Chat+badge/Settings/
// Logout) and a plain row of NavigationItems for the bottom nav. Dropping
// Material's List/ListItem here is what makes NavigationItem shareable
// across all three shells in the first place (the Phase D note about
// differing interactive-element semantics no longer applies once every
// shell renders a real <Link>/<button>).

export function SideBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const{user}=useUser()
    const { messages ,unreadByUser } = useMessages();
    const { notifications, unreadCount: notifUnreadCount, markAllAsRead } = useNotifications();
    const { suggestions, pendingIds, onAdd: onAddSuggestedFriend, onShowMore: onShowMoreSuggestedFriends } = useSuggestedFriends();
    const { tip: safetyTip, loading: safetyTipLoading, onNext: onNextSafetyTip } = useSafetyTip();

    const unreadNotifications =
        typeof notifUnreadCount === "number"
            ? notifUnreadCount
            : (notifications?.filter(n => !n.read).length || 0);

    const getTotalUnread = () => {
        const keys = Object.keys(unreadByUser || {});
        if (keys.length) {
            return keys.reduce((sum, k) => sum + (unreadByUser[k] || 0), 0);
        }
        let count = 0;
        Object.values(messages).forEach(arr => {
            arr.forEach(m => { if (!m.isRead && m.senderId !== user.id) count++; });
        });
        return count;
    };

    const unreadTotal = getTotalUnread();

    const handleOpenNotifications = async () => {
        try { markAllAsRead?.(); } catch (_) {}
        navigate(MOBILE_NOTIFICATIONS_PAGE);
    };
    const handleLogout = useLogout();

    const isProfileActive = location.pathname === PROFILE_PAGE(user.id);
    const isFriendsActive = location.pathname === FRIENDS_PAGE(user.id);
    const isChatActive = location.pathname === CHAT_PAGE;
    const isSettingsActive = location.pathname === SETTINGS_PAGE;
    const isFeedActive = location.pathname === HOME_PAGE;
    const isNotificationsActive = location.pathname === MOBILE_NOTIFICATIONS_PAGE;

    return (
        <>
        <aside
            className="hidden md:flex md:flex-col gap-4 sticky top-[calc(65px+env(safe-area-inset-top))] h-[calc(100vh-81px-env(safe-area-inset-top))] ml-8 flex-shrink-0 overflow-y-auto"
            style={{ width: fluid(208, 288) }}
        >
            <div className="bg-white border border-dsNeutral-100 rounded-ds-lg flex flex-col flex-shrink-0" style={{ padding: fluid(10, 15), gap: fluid(2, 5) }}>
                <NavigationItem to={PROFILE_PAGE(user.id)} icon={SideBarIcons.Profile} label={PROFILE_BTN_TEXT} active={isProfileActive} variant="rail" />
                <NavigationItem to={FRIENDS_PAGE(user.id)} icon={SideBarIcons.Friends} label={FRIENDS_BTN_TEXT} active={isFriendsActive} variant="rail" />
                <NavigationItem to={CHAT_PAGE} icon={SideBarIcons.Inbox} label={INBOX_BTN_TEXT} active={isChatActive} badge={unreadTotal} variant="rail" />
                <NavigationItem to={SETTINGS_PAGE} icon={SideBarIcons.Settings} label="Settings" active={isSettingsActive} variant="rail" />
                <NavigationItem onClick={handleLogout} icon={SideBarIcons.Logout} label={LOGOUT_BTN_TEXT} variant="rail" destructive />
            </div>

            {/* Data comes from useSuggestedFriends, which fetches real
                suggestions from GET /friendship/suggestions (cursor/seed/wrapped
                keyset pagination; "Show more" pages through it). This component
                stays pure presentation. */}
            <SuggestedFriends suggestions={suggestions} pendingIds={pendingIds} onAdd={onAddSuggestedFriend} onShowMore={onShowMoreSuggestedFriends} />

            {/* Data comes from useSafetyTip, which fetches a real tip from
                GET /safety-tips/random (a curated static pool served by the
                backend - no AI/Gemini, no external API, no API key). "Another
                tip" refetches; a failed refetch keeps the current tip. */}
            <SafetyTip tip={safetyTip} loading={safetyTipLoading} onNext={onNextSafetyTip} />
        </aside>

            {/* Bottom Navigation for Mobile — also shown on /chat; Chat's own
                height calculation reserves space for this bar so it never
                covers the message composer. */}
            <nav
                aria-label="Primary"
                className="fixed bottom-0 left-0 right-0 bg-white border-t border-dsNeutral-100 flex items-stretch h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] md:hidden z-50">
                <NavigationItem to={PROFILE_PAGE(user.id)} icon={SideBarIcons.Profile} label={PROFILE_BTN_TEXT} active={isProfileActive} variant="bottom" />
                <NavigationItem onClick={handleOpenNotifications} icon={HeaderBarIcons.Notification} label={NOTIFICATIONS_BTN_TEXT} active={isNotificationsActive} badge={unreadNotifications} variant="bottom" />
                <NavigationItem to={HOME_PAGE} icon={HeaderBarIcons.Feed} label={FEED_BTN_TEXT} active={isFeedActive} variant="bottom" />
                <NavigationItem to={CHAT_PAGE} icon={SideBarIcons.Inbox} label={INBOX_BTN_TEXT} active={isChatActive} badge={unreadTotal} variant="bottom" />
                <NavigationItem onClick={handleLogout} icon={SideBarIcons.Logout} label={LOGOUT_BTN_TEXT} variant="bottom" destructive />
            </nav>
        </>
    );
}

export default SideBar