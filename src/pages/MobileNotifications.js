import {useNotifications} from "../context/NotificationProvider";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Avatar, ListItem, ListItemPrefix, Typography} from "@material-tailwind/react";
import InfiniteScroll from "react-infinite-scroll-component";
import {formatDate, HOME_PAGE} from "../utils/Utils";


function MobileNotifications(){


    const { notifications } = useNotifications();
    const [visibleCount, setVisibleCount] = useState(10);
    const fetchMore = () => setVisibleCount((prev) => prev + 5);
    const visible = notifications.slice(0, visibleCount);
    const hasMore = visible.length < notifications.length;
    const navigate = useNavigate();


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                navigate(HOME_PAGE); 
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [navigate]);


    return (
        <div
            id="mobile-notification-scroll"
            className="fixed top-0 bottom-0 left-0 right-0 bg-white z-[9999] overflow-y-auto"
        >
            <div className="flex justify-between items-center px-4 py-3 border-b">
                <h2 className="text-lg font-bold">Notifications</h2>
                <button
                    onClick={() => navigate(-1)}
                    aria-label="Back"
                    className="text-2xl text-gray-600 font-bold focus:outline-none"
                >
                    ×
                </button>
            </div>

            <div className="p-4">
                <InfiniteScroll
                    dataLength={visible.length}
                    next={fetchMore}
                    hasMore={hasMore}
                    loader={<p className="text-center text-sm text-gray-500 py-2">Loading...</p>}
                    endMessage={<p className="text-center text-xs text-gray-400 py-2">No more notifications📢</p>}
                    scrollableTarget="mobile-notification-scroll"
                >
                    {visible.length === 0 ? (
                        <Typography variant="small" color="gray" className="text-center py-2">
                           No Notifications Yet💫
                        </Typography>
                    ) : (
                        visible.map((notification) => (
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
        </div>
    );

}

export default MobileNotifications