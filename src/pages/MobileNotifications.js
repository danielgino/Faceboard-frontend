import {useNotifications} from "../context/NotificationProvider";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {X, Bell} from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import {HOME_PAGE} from "../utils/Utils";
import NotificationRow from "../components/interaction/NotificationRow";
import LoadingSpinner from "../assets/loaders/LoadingSpinner";


function MobileNotifications(){

    // Notification pagination follow-up: real backend paging via NotificationProvider, instead
    // of client-side re-slicing of a single already-fully-fetched batch.
    const { notifications, fetchMoreNotifications, hasMoreNotifications, loadingMoreNotifications } = useNotifications();
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
            <div className="flex justify-between items-center px-4 py-3 border-b border-dsNeutral-100">
                <h2 className="text-ds-card-title text-dsNeutral-900">Notifications</h2>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    aria-label="Back"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-dsNeutral-100 text-dsNeutral-600 hover:bg-dsNeutral-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing"
                >
                    <X size={16} strokeWidth={2} />
                </button>
            </div>

            <div className="p-3">
                <InfiniteScroll
                    dataLength={notifications.length}
                    next={fetchMoreNotifications}
                    hasMore={hasMoreNotifications}
                    loader={<p className="text-center text-ds-caption text-dsNeutral-500 py-2">Loading...</p>}
                    endMessage={
                        notifications.length > 0 && (
                            <p className="text-center text-ds-caption text-dsNeutral-300 py-2">No more notifications</p>
                        )
                    }
                    scrollableTarget="mobile-notification-scroll"
                    className="flex flex-col gap-1"
                >
                    {notifications.length === 0 ? (
                        <div className="text-center py-10">
                            <Bell className="w-7 h-7 text-dsNeutral-200 mx-auto mb-2" strokeWidth={1.75} />
                            <p className="text-ds-body text-dsNeutral-500">No notifications yet.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <NotificationRow key={notification.id} notification={notification} />
                        ))
                    )}
                    {loadingMoreNotifications && (
                        <div className="flex justify-center py-2">
                            <LoadingSpinner className="w-4 h-4 text-dsNeutral-500" />
                        </div>
                    )}
                </InfiniteScroll>
            </div>
        </div>
    );

}

export default MobileNotifications