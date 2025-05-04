import {
    Popover,
    PopoverHandler,
    PopoverContent,
    Avatar,
    Button,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
} from "@material-tailwind/react";
import HeaderBarIcons from "../../Icons/HeaderBarIcons";
import React, {useEffect, useState} from "react";
import {useNotifications} from "../../context/NotificationProvider";
import {formatDate, NOTIFICATIONS_BTN_TEXT} from "../../utils/Utils";
import InfiniteScroll from "react-infinite-scroll-component";

function Notification({ open, onClose,showLabel = true }){
    const { notifications,unreadCount, markAllAsRead } = useNotifications();
    const [visibleCount, setVisibleCount] = useState(5);
    const fetchMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    const visibleNotifications = notifications.slice(0, visibleCount);
    const hasMore = visibleNotifications.length < notifications.length;
    const [showMobile, setShowMobile] = useState(false);
    const [isMobile, setIsMobile] = useState(false);



    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);
    return(
        <div>
            {isMobile ? (
                <>
                    {/* כפתור לפתיחה */}
                    <div
                        className={`cursor-pointer ${isMobile ? 'flex flex-col items-center text-xs' : 'flex items-center gap-2'}`}
                        onClick={() => setShowMobile(true)}
                    >
                        <div className="relative">
                        <HeaderBarIcons.Notification />
                            {unreadCount > 0 && (
                                <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-md px-1 py-1px shadow-sm">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                            )}
                        </div>
                        <span>{NOTIFICATIONS_BTN_TEXT}</span>
                    </div>

                    {showMobile && (
                        <div     id="mobile-notification-scroll"
                                 className="fixed top-0 bottom-16 left-0 right-0 bg-white z-[9999] p-4 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Notifications</h2>
                                <Button onClick={() => setShowMobile(false)}>סגור</Button>
                            </div>
                            {/*{console.log("Total notifications:", notifications.length)}*/}
                            {/*{console.log("Visible notifications:", visibleNotifications.length)}*/}
                            {/*{console.log("Has more?", hasMore)}*/}
                            <InfiniteScroll
                                dataLength={visibleNotifications.length}
                                next={fetchMore}
                                hasMore={hasMore}
                                loader={<p className="text-center text-sm text-gray-500 py-2">טוען עוד...</p>}
                                endMessage={<p className="text-center text-xs text-gray-400 py-2">אין עוד התראות</p>}
                            >
                                {visibleNotifications.length === 0 ? (
                                    <Typography variant="small" color="gray" className="text-center py-2">
                                        אין התראות חדשות 🙌
                                    </Typography>
                                ) : (
                                    visibleNotifications.map((notification) => (
                                        <ListItem key={notification.id} className="hover:bg-blue-gray-50">
                                            <ListItemPrefix>
                                                <Avatar src={notification.senderProfilePicture} alt="avatar" />
                                            </ListItemPrefix>
                                            <div>
                                                <Typography variant="small" color="blue-gray">
                                                    {notification.content}
                                                </Typography>
                                                <Typography variant="small" color="gray">
                                                    {formatDate(notification.createdAt)}
                                                </Typography>
                                            </div>
                                        </ListItem>
                                    ))
                                )}
                            </InfiniteScroll>
                        </div>
                    )}
                </>
            ) : (


            <Popover  placement="bottom-end">
                <PopoverHandler   onClick={() => {
                    markAllAsRead();
                }}>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                            <HeaderBarIcons.Notification/>
                            {unreadCount > 0 && (
                                <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-md px-1 py-1px shadow-sm">
                           {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>

                        <span>Notification</span>
                    </div>
                </PopoverHandler>
                <PopoverContent
                    id="notification-scroll"
                    className="w-72 max-h-80 overflow-y-auto z-[9999]"
                >
                    <div className="mb-4 flex items-center gap-4 border-b border-blue-gray-50 pb-4">
                        <Avatar src="https://res.cloudinary.com/dfembms4i/image/upload/v1744712350/Megaphone_qrqiqr.jpg" alt="Megaphone" />
                        <div>
                            <Typography variant="h6" color="blue-gray">
                                Notifications
                            </Typography>
                            <Typography
                                variant="small"
                                color="gray"
                                className="font-medium text-blue-gray-500"
                            >
                                Last notifications
                            </Typography>
                        </div>
                    </div>
                    <InfiniteScroll
                        dataLength={visibleNotifications.length}
                        next={fetchMore}
                        hasMore={hasMore}
                        loader={
                            <p className="text-center text-sm text-gray-500 py-2">טוען עוד...</p>
                        }
                        endMessage={
                            <p className="text-center text-xs text-gray-400 py-2">אין עוד התראות</p>
                        }
                        scrollableTarget="notification-scroll"
                    >
                        {visibleNotifications.length === 0 ? (
                            <Typography variant="small" color="gray" className="text-center py-2">
                                אין התראות חדשות 🙌
                            </Typography>
                        ) : (
                            visibleNotifications.map((notification) => (
                                <ListItem key={notification.id} className="hover:bg-blue-gray-50">
                                    <ListItemPrefix>
                                        <Avatar src={notification.senderProfilePicture} alt="avatar" />
                                    </ListItemPrefix>
                                    <div>
                                        <Typography variant="small" color="blue-gray">
                                            {notification.content}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            {formatDate(notification.createdAt)}
                                        </Typography>
                                    </div>
                                </ListItem>
                            ))
                        )}
                    </InfiniteScroll>
                </PopoverContent>
            </Popover>
                )}
        </div>


    )
}
export default Notification