import {
    Popover,
    PopoverHandler,
    PopoverContent,
} from "@material-tailwind/react";
import {Bell} from "lucide-react";
import HeaderBarIcons from "../../Icons/HeaderBarIcons";
import "./NotificationOverride.css";
import React, {useState} from "react";
import {useNotifications} from "../../context/NotificationProvider";
import {POST_PAGE, PROFILE_PAGE} from "../../utils/Utils";
import InfiniteScroll from "react-infinite-scroll-component";
import {useNavigate} from "react-router-dom";
import {fluid} from "../layout/navFluid";
import NotificationRow from "./NotificationRow";
import LoadingSpinner from "../../assets/loaders/LoadingSpinner";

function Notification(){
    // Notification pagination follow-up: notifications/hasMore/fetchMore now come straight from
    // NotificationProvider's real backend paging - no more local visibleCount re-slicing of an
    // already-fully-fetched array.
    const { notifications, unreadCount, markAllAsRead, fetchMoreNotifications, hasMoreNotifications, loadingMoreNotifications } = useNotifications();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleItemClick = (n) => {
        switch (n.type) {
            case "FRIEND_REQUEST":
            case "FRIEND_ACCEPTED":
                if (n.senderId) {
                    navigate(PROFILE_PAGE(n.senderId));
                    setOpen(false);
                }
                break;

            case "LIKE":
            case "COMMENT":
                if (n.postId) {
                    navigate(POST_PAGE(n.postId));
                    setOpen(false);
                }
                break;

            default:
                setOpen(false);
                break;
        }
    };

    return(
        <div>
            <Popover open={open} handler={setOpen}  placement="bottom-end">
                <PopoverHandler onClick={() => {
                    markAllAsRead();
                }}>
                    <button
                        type="button"
                        className={`relative flex items-center rounded-lg text-[13px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing ${open ? "bg-dsBrand-100 text-dsBrand-700" : "text-dsNeutral-600 hover:bg-dsNeutral-100"}`}
                        style={{ gap: fluid(6, 8), paddingInline: fluid(10, 14), paddingBlock: fluid(6, 9), fontSize: fluid(13, 14.5) }}
                        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
                    >
                        <span className="relative inline-flex flex-shrink-0" style={{ width: fluid(16, 19), height: fluid(16, 19) }}>
                            <HeaderBarIcons.Notification className="w-full h-full"/>
                            {unreadCount > 0 && (
                                <span
                                    aria-hidden="true"
                                    className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] rounded-full bg-dsDestructive ring-1 ring-white"
                                />
                            )}
                        </span>
                        <span>Notifications</span>
                    </button>
                </PopoverHandler>
                {/* Accessibility follow-up: material-tailwind's Popover already wires
                    Escape-to-close, click-outside-to-close, focus-trap, and focus-return-to-
                    trigger via its underlying floating-ui primitives (FloatingFocusManager,
                    useDismiss, useRole) with no custom code needed here - the one real gap was
                    an accessible name, since PopoverContent's own aria-labelledby points at an
                    id nothing in this component ever sets. aria-label supplies that name
                    directly. */}
                <PopoverContent
                    id="notification-scroll"
                    aria-label="Notifications"
                    className="notif-scrollbar w-80 max-h-80 sm:max-h-96 overflow-y-auto rounded-ds-lg border border-dsNeutral-100 shadow-ds-floating z-[9999] p-3"
                >
                    <div className="mb-2 px-1">
                        <span className="text-ds-label font-bold text-dsNeutral-900">Notifications</span>
                    </div>
                    <InfiniteScroll
                        dataLength={notifications.length}
                        next={fetchMoreNotifications}
                        hasMore={hasMoreNotifications}
                        loader={
                            <p className="text-center text-ds-caption text-dsNeutral-500 py-2">טוען עוד...</p>
                        }
                        endMessage={
                            notifications.length > 0 && (
                                <p className="text-center text-ds-caption text-dsNeutral-300 py-2">אין עוד התראות</p>
                            )
                        }
                        scrollableTarget="notification-scroll"
                        className="flex flex-col gap-1"
                    >
                        {notifications.length === 0 ? (
                            <div className="text-center py-8">
                                <Bell className="w-6 h-6 text-dsNeutral-200 mx-auto mb-2" strokeWidth={1.75} />
                                <p className="text-ds-caption text-dsNeutral-500">No notifications yet.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <NotificationRow
                                    key={notification.id}
                                    notification={notification}
                                    onClick={handleItemClick}
                                />
                            ))
                        )}
                        {loadingMoreNotifications && (
                            <div className="flex justify-center py-2">
                                <LoadingSpinner className="w-4 h-4 text-dsNeutral-500" />
                            </div>
                        )}
                    </InfiniteScroll>
                </PopoverContent>
            </Popover>
        </div>
    )
}
export default Notification