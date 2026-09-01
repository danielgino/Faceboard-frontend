import { Check } from "lucide-react";
import { useUser } from "../context/UserProvider";
import SearchInput from "../assets/inputs/SearchInput";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FriendsSkeleton from "../assets/loaders/FriendsSkeleton";
import { PROFILE_PAGE } from "../utils/Utils";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";
import LoadingSpinner from "../assets/loaders/LoadingSpinner";
import { Avatar as PrimitiveAvatar } from "../components/common/Avatar";
import { UserX } from "lucide-react";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function Friends() {
    const { userId } = useParams();
    const { fetchUserFriendsPage } = useUser();

    const [ownerName, setOwnerName] = useState('');
    const [friends, setFriends] = useState([]);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [firstLoadDone, setFirstLoadDone] = useState(false);
    const [hasAnyFriends, setHasAnyFriends] = useState(null);

    const pageRef = useRef(0);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const requestIdRef = useRef(0);
    const searchRef = useRef('');
    const sentinelRef = useRef(null);
    const prevUserIdRef = useRef(null);

    const debouncedSetSearch = useDebouncedCallback((value) => {
        searchRef.current = value;
        setDebouncedSearch(value);
    }, SEARCH_DEBOUNCE_MS);

    useEffect(() => {
        debouncedSetSearch(search.trim());
    }, [search, debouncedSetSearch]);

    const loadPage = useCallback(async (pageToLoad) => {
        if (!userId || loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        const requestId = ++requestIdRef.current;
        const query = searchRef.current;

        try {
            const data = await fetchUserFriendsPage({ userId, page: pageToLoad, size: PAGE_SIZE, query });
            if (requestId !== requestIdRef.current) return;

            const newFriends = data.friendList || [];
            setOwnerName(data.fullName || '');

            setFriends(prev => {
                const existingIds = new Set(prev.map(f => f.id));
                const deduped = newFriends.filter(f => !existingIds.has(f.id));
                return [...prev, ...deduped];
            });

            if (pageToLoad === 0 && !query) {
                setHasAnyFriends(newFriends.length > 0);
            }

            pageRef.current = pageToLoad + 1;
            hasMoreRef.current = newFriends.length === PAGE_SIZE;
        } catch (error) {
            console.error('Failed to load friends:', error);
            if (requestId === requestIdRef.current) {
                hasMoreRef.current = false;
            }
        } finally {
            if (requestId === requestIdRef.current) {
                loadingRef.current = false;
                setLoading(false);
                setFirstLoadDone(true);
            }
        }
    }, [userId, fetchUserFriendsPage]);

    useEffect(() => {
        if (!userId) return;

        if (prevUserIdRef.current !== userId) {
            setHasAnyFriends(null);
            prevUserIdRef.current = userId;
        }

        loadingRef.current = false;
        hasMoreRef.current = true;
        pageRef.current = 0;
        setFriends([]);
        setFirstLoadDone(false);
        loadPage(0);
    }, [userId, debouncedSearch, loadPage]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
                loadPage(pageRef.current);
            }
        }, { rootMargin: '200px' });

        observer.observe(node);
        return () => observer.disconnect();
    }, [loadPage, firstLoadDone, hasAnyFriends]);

    if (!firstLoadDone) {
        return <div className="flex justify-center items-center min-h-[60vh]"><FriendsSkeleton/></div>;
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-10">
            <h1 className="text-center text-ds-page-title text-dsNeutral-900 mb-5">
                Friends of {ownerName}
            </h1>

            <div className="flex justify-center mb-5">
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {hasAnyFriends === false ? (
                <div className="flex flex-col items-center justify-center text-center py-14 bg-white border border-dsNeutral-100 rounded-ds-lg">
                    <UserX className="w-8 h-8 text-dsNeutral-200 mb-2" strokeWidth={1.75} />
                    <p className="text-ds-body text-dsNeutral-500">No friends found.</p>
                </div>
            ) : (
                <>
                    {/* Fidelity reconciliation (Phase G): rebuilt against the Design
                        System's FriendRow (#people) - one row shape at every viewport
                        (avatar+name/handle+status), instead of a desktop grid-of-cards
                        vs. a separately-built mobile list. Each row is now a real <Link>
                        (was a <div onClick>/<Card onClick>), same PROFILE_PAGE
                        destination. The trailing "Friends" pill is new: purely
                        informational (no handler, no new API), true by definition since
                        everyone in this list already is a friend - not a new
                        interactive affordance. */}
                    <div className="flex flex-col divide-y divide-dsNeutral-100 bg-white rounded-ds-lg border border-dsNeutral-100 overflow-hidden">
                        {friends.map((friend) => (
                            <Link
                                key={friend.id}
                                to={PROFILE_PAGE(friend.id)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-dsNeutral-canvas transition-colors"
                            >
                                <PrimitiveAvatar size={40} src={friend.profilePictureUrl} name={friend.fullName} alt={friend.fullName} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-ds-user-name text-dsNeutral-900 truncate">{friend.fullName}</p>
                                    <p className="text-ds-handle text-dsNeutral-500 truncate">@{friend.username}</p>
                                </div>
                                <span className="flex-shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-control bg-dsBrand-50 text-dsBrand-700 border border-dsBrand-600 text-xs font-semibold">
                                    <Check size={13} strokeWidth={2.5} /> Friends
                                </span>
                            </Link>
                        ))}
                    </div>

                    <div ref={sentinelRef} className="h-1 w-full" />

                    {loading && (
                        <div className="flex justify-center py-6">
                            <LoadingSpinner className="w-6 h-6 text-dsBrand-600" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Friends;
