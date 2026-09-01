import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, X, Check } from "lucide-react";
import {fetchWithAuth, GET_LIKED_USERS_API, LIKES_PAGE_SIZE, PROFILE_PAGE} from "../../utils/Utils";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserProvider";
import { useFriendship } from "../../context/FriendshipProvider";
import { Avatar as PrimitiveAvatar } from "../common/Avatar";
import LikeLoader from "../../assets/loaders/LikeLoader";
import LoadingSpinner from "../../assets/loaders/LoadingSpinner";
import FriendshipStatus from "../../utils/enums/FriendshipStatus";

// Fidelity reconciliation (Phase F): rebuilt against the Design System's
// Modal foundation (#overlay - icon badge + title + close-X header, scrim,
// 16px radius) and LikerRow (#people - 40px avatar, name+handle, trailing
// FriendshipAction) instead of Material Card/Avatar/Button. Every handler/
// ref below (pagination, IntersectionObserver, focus trap, Escape, focus
// return, friend-status checks) is unchanged - only the JSX shape changed.
function FriendshipActionSlot({ status, sending, onAdd }) {
    if (status === FriendshipStatus.ACCEPTED) {
        return (
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-control bg-dsBrand-50 text-dsBrand-700 border border-dsBrand-600 text-xs font-semibold">
                <Check size={13} strokeWidth={2.5} /> Friends
            </span>
        );
    }
    if (status === FriendshipStatus.PENDING || sending) {
        return (
            <span className="flex-shrink-0 h-8 px-3.5 rounded-control bg-white text-dsNeutral-300 border border-dsNeutral-100 text-xs font-semibold flex items-center cursor-not-allowed">
                Requested
            </span>
        );
    }
    return (
        <button
            type="button"
            onClick={onAdd}
            className="flex-shrink-0 h-8 px-3.5 rounded-control bg-dsBrand-600 text-white text-xs font-semibold hover:bg-dsBrand-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing"
        >
            Add
        </button>
    );
}

function LikeList({ postId, onClose }) {
    const { user } = useUser();
    const { sendFriendRequest, checkFriendStatus } = useFriendship();

    const [likedUsers, setLikedUsers] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [friendStatuses, setFriendStatuses] = useState({});
    const [loading, setLoading] = useState(true);
    // L-DB4C: the initial (no-params) fetch returns only the newest LIKES_PAGE_SIZE likers now,
    // instead of the whole list. nextPage/hasMore track whether another batch is available so
    // the modal can request it on demand instead of loading every liker up front.
    const [nextPage, setNextPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const dialogRef = useRef(null);
    const closeButtonRef = useRef(null);
    const previouslyFocusedElementRef = useRef(null);
    // Phase 15: scrollable Card (root for the infinite-scroll sentinel below)
    // and the sentinel itself, plus which liker ids have already had a
    // friend-status check run for them, so appending a page doesn't re-check
    // everyone loaded so far.
    const scrollContainerRef = useRef(null);
    const sentinelRef = useRef(null);
    const checkedUserIdsRef = useRef(new Set());

    useEffect(() => {
        const fetchLikedUsers = async () => {
            try {
                const res = await fetchWithAuth(GET_LIKED_USERS_API(postId));
                if (!res.ok) throw new Error("Failed to load liked users");
                const data = await res.json();
                setLikedUsers(data);
                setHasMore(data.length >= LIKES_PAGE_SIZE);
                setNextPage(1);
                // The friend-status effect below only clears `loading` once it has
                // liked users to check statuses for; with zero likes it never runs,
                // so the dialog would stay stuck on LikeLoader forever otherwise.
                if (data.length === 0) setLoading(false);
            } catch (error) {
                console.error("Error fetching liked users:", error);
            }
        };


        const init = async () => {
            await fetchLikedUsers();
        };

        init();
    }, [postId]);

    // Phase 15: guarded so a rapid-fire IntersectionObserver (unlike the
    // disabled "Load more" button this replaces) can't start a second
    // request while one is already in flight, or after the last page.
    const handleLoadMoreLikers = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const res = await fetchWithAuth(GET_LIKED_USERS_API(postId, nextPage));
            if (!res.ok) throw new Error("Failed to load more liked users");
            const moreUsers = await res.json();
            setLikedUsers(prev => {
                const existingIds = new Set(prev.map(u => u.userId));
                const deduped = moreUsers.filter(u => !existingIds.has(u.userId));
                return [...prev, ...deduped];
            });
            setHasMore(moreUsers.length >= LIKES_PAGE_SIZE);
            setNextPage(prev => prev + 1);
        } catch (error) {
            console.error("Error fetching more liked users:", error);
        } finally {
            setLoadingMore(false);
        }
    }, [postId, nextPage, loadingMore, hasMore]);

    // Infinite-scroll trigger: observes a sentinel at the end of the liker
    // list against the Card's own scroll container (the dialog itself is
    // full-viewport and doesn't scroll - the Card does), matching the
    // IntersectionObserver-sentinel pattern already used for pagination in
    // Friends.js. Guarded on `loading` too, not just `hasMore`: the sentinel
    // and its scroll container only exist in the DOM once the loading dialog
    // is replaced by the real one, and `loading` isn't otherwise a dep here,
    // so without this guard the effect can run once while both refs are
    // still null (during the initial load) and then never run again once
    // they're actually populated.
    useEffect(() => {
        if (!hasMore || loading) return;
        const node = sentinelRef.current;
        const root = scrollContainerRef.current;
        if (!node || !root) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleLoadMoreLikers();
                }
            },
            { root, rootMargin: "100px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [hasMore, loading, handleLoadMoreLikers]);

    // Phase 15: only checks status for users this effect hasn't seen yet, so
    // appending a page of new likers doesn't re-check everyone already
    // resolved from earlier pages (checkedUserIdsRef persists across
    // re-runs; it isn't reactive state, so marking ids in it doesn't itself
    // trigger a re-run).
    useEffect(() => {
        if (likedUsers.length === 0) return;

        const usersNeedingStatus = likedUsers.filter(
            (u) => u.userId !== user.id && !checkedUserIdsRef.current.has(u.userId)
        );

        if (usersNeedingStatus.length === 0) {
            setLoading(false);
            return;
        }

        usersNeedingStatus.forEach((u) => checkedUserIdsRef.current.add(u.userId));

        const fetchStatuses = async (users) => {
            const statuses = {};
            for (const u of users) {
                try {
                    const status = await checkFriendStatus(user.id, u.userId);
                    statuses[u.userId] = status;
                } catch {
                    statuses[u.userId] = null;
                }
            }
            setFriendStatuses((prev) => ({ ...prev, ...statuses }));
        };

        fetchStatuses(usersNeedingStatus).then(() => setLoading(false));
    }, [likedUsers, user.id, checkFriendStatus]);

    // Phase 9: this is a custom fixed-overlay modal (no modal library), so
    // Escape-to-close and Tab-containment have to be added explicitly.
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key === "Tab" && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll(
                    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Focus entry/return: remember what opened the dialog, restore it on
    // unmount (covers the close button, Escape, and backdrop click, since
    // they all unmount LikeList via onClose).
    useEffect(() => {
        previouslyFocusedElementRef.current = document.activeElement;
        return () => {
            previouslyFocusedElementRef.current?.focus?.();
        };
    }, []);

    // The dialog markup (and the close button) only exists once loading
    // finishes, so move focus in once it actually renders.
    useEffect(() => {
        if (!loading) {
            closeButtonRef.current?.focus();
        }
    }, [loading]);

    const handleSendFriendRequest = async (userId) => {
        try {
            await sendFriendRequest(user.id, userId);
            setSentRequests(prev => [...prev, userId]);
            setFriendStatuses(prev => ({
                ...prev,
                [userId]: { status: FriendshipStatus.PENDING, senderId: user.id, receiverId: userId }
            }));
        } catch (error) {
            console.error("Failed to send friend request:", error);
        }
    };

    if (loading) return <LikeLoader />;

    return (
        // Phase 12: z-[9999] matches HeaderBar's fixed z-index (was z-50,
        // which sat behind it) and StoryBar's viewer, so all three
        // full-viewport overlays behave the same way.
        <div
            className="fixed inset-0 bg-dsScrim flex justify-center items-center z-[9999] p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Users who liked this post"
            ref={dialogRef}
        >
            <div
                ref={scrollContainerRef}
                className="w-full max-w-sm max-h-[80vh] bg-white rounded-ds-lg shadow-ds-modal overflow-y-auto flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-start gap-2.5 bg-white px-[18px] pt-[18px] pb-4 border-b border-dsNeutral-100">
                    <span className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0" style={{background: "oklch(95% 0.03 12)"}}>
                        <Heart size={15} strokeWidth={2} className="text-dsLike" fill="currentColor" />
                    </span>
                    <h2 className="flex-1 pt-1 text-ds-card-title text-dsNeutral-900">Likes</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-dsNeutral-100 hover:bg-dsNeutral-200 transition flex items-center justify-center flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing"
                        aria-label="Close"
                        ref={closeButtonRef}
                    >
                        <X size={14} strokeWidth={2} className="text-dsNeutral-600" />
                    </button>
                </div>

                {likedUsers.length === 0 ? (
                    <div className="px-[18px] py-10 text-center">
                        <Heart size={26} strokeWidth={1.75} className="mx-auto mb-2 text-dsNeutral-200" />
                        <p className="text-ds-body text-dsNeutral-500">No likes yet.</p>
                    </div>
                ) : (
                    <div className="px-[18px] divide-y divide-dsNeutral-100">
                        {likedUsers.map(({ userId, fullName, username, profilePictureUrl }) => {
                            const isCurrentUser = user?.id === userId;
                            const userFriendStatus = friendStatuses[String(userId)];

                            return (
                                <div key={userId} className="flex items-center gap-3 py-3">
                                    <Link to={PROFILE_PAGE(userId)} className="flex items-center gap-3 flex-1 min-w-0">
                                        <PrimitiveAvatar size={40} src={profilePictureUrl} name={fullName} alt={fullName} />
                                        <div className="min-w-0">
                                            <p className="text-ds-user-name text-dsNeutral-900 truncate">{fullName}</p>
                                            <p className="text-ds-handle text-dsNeutral-500 truncate">@{username}</p>
                                        </div>
                                    </Link>
                                    {!isCurrentUser && (
                                        <FriendshipActionSlot
                                            status={userFriendStatus?.status}
                                            sending={sentRequests.includes(userId)}
                                            onAdd={() => handleSendFriendRequest(userId)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {hasMore && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}
                {loadingMore && (
                    <div className="flex justify-center py-3">
                        <LoadingSpinner className="w-5 h-5 text-dsNeutral-500" />
                    </div>
                )}
            </div>
        </div>
    );
}
export default LikeList