import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWithAuth, SUGGESTED_FRIENDS_API } from "../utils/Utils";
import { useUser } from "../context/UserProvider";
import { useFriendship } from "../context/FriendshipProvider";

// SUGGESTED-FRIENDS-001: real data boundary for the desktop sidebar's
// "Suggested friends" card, backed by GET /friendship/suggestions (keyset
// pagination - see FriendshipService.getSuggestedFriends on the backend).
// SuggestedFriends.js itself stays pure presentation and is unchanged by
// this - it already treats `onShowMore` as optional (only rendering the
// button when it's truthy), which is exactly how this hook signals
// "nothing left to page through" (passing undefined once hasMore is false)
// without needing any new prop on that component.
const SUGGESTIONS_PAGE_SIZE = 3;

export function useSuggestedFriends() {
    const { user } = useUser();
    const { sendFriendRequest } = useFriendship();

    const [suggestions, setSuggestions] = useState([]);
    const [pendingIds, setPendingIds] = useState([]);
    const [hasMore, setHasMore] = useState(false);

    // SUG-002: the traversal's full cursor state, round-tripped verbatim
    // from the last response - `cursor` alone is not enough to page safely
    // (see the backend's own contract comment), `seed`/`wrapped` must travel
    // with it so phase B never crosses back into ids phase A already
    // returned. { cursor: null, seed: null, wrapped: null } means "no
    // traversal started yet" - the very first fetch omits all three.
    const cursorStateRef = useRef({ cursor: null, seed: null, wrapped: null });

    // Every user id already shown in this browsing session. With seed/wrapped
    // now carried through, one traversal is already guaranteed not to repeat
    // an id on its own - this stays only as a defensive backstop (e.g. a
    // brand-new user id created mid-traversal), not the primary
    // correctness mechanism.
    const seenIdsRef = useRef(new Set());

    // RACE-001: React.StrictMode (index.js) intentionally mounts every
    // component twice in development, which fires the initial-load effect
    // below twice in quick succession - two concurrent, identical "first
    // page" requests. Whichever one's response arrived *second* would
    // otherwise still be treated as authoritative even though it wasn't the
    // most recently started request: both pass isFirstPage=true, but by the
    // time the second response lands, seenIdsRef already contains every id
    // from the first (successful) response, so its own `fresh` list comes
    // back empty - and isFirstPage's "replace, not append" branch then did
    // `setSuggestions([])`, wiping out the valid data the first response had
    // just shown moments earlier. That's the exact appear-then-disappear
    // sequence.
    //
    // requestIdRef guards against this in general (StrictMode's double
    // mount, a rapid double-click on "Show more", a slow response arriving
    // after a faster later one, etc.): only the outcome (success or
    // failure) of the most recently *started* request is ever allowed to
    // touch state. Any earlier request's response, whenever it actually
    // arrives, is silently discarded instead of overwriting whatever a
    // newer request already produced.
    const requestIdRef = useRef(0);

    const fetchPage = useCallback(async (cursor, seed, wrapped, isFirstPage) => {
        const requestId = ++requestIdRef.current;
        try {
            const response = await fetchWithAuth(SUGGESTED_FRIENDS_API(cursor, seed, wrapped, SUGGESTIONS_PAGE_SIZE));
            if (!response.ok) {
                throw new Error("Failed to load suggested friends");
            }
            const data = await response.json();
            if (requestId !== requestIdRef.current) return; // superseded by a newer request - stale, ignore

            const fresh = (data.users || []).filter((u) => !seenIdsRef.current.has(u.id));
            fresh.forEach((u) => seenIdsRef.current.add(u.id));

            // SHOWMORE-001: SuggestedFriends.js always renders the current
            // suggestions[0..3) - it's a fixed-size "current batch" card, not
            // an infinite list. Accumulating every fetched page into
            // suggestions (the old [...prev, ...fresh] append) grew the
            // array correctly but never changed what's visible, since the
            // component only ever looked at the first 3 entries - "Show
            // more" appeared to do nothing. Each successful fetch (first
            // load or "Show more" alike) now REPLACES the visible batch with
            // exactly what it returned; seenIdsRef (populated above,
            // unconditionally) still remembers every id ever shown across
            // every page, so a later page can't bring back a user from an
            // earlier one even though the earlier batch is no longer kept
            // around in `suggestions` itself.
            setSuggestions(fresh);
            cursorStateRef.current = {
                cursor: data.nextCursor ?? null,
                seed: data.seed ?? null,
                wrapped: Boolean(data.wrapped),
            };
            setHasMore(Boolean(data.hasMore));
        } catch (error) {
            if (requestId !== requestIdRef.current) return; // superseded by a newer request - stale, ignore even the failure

            // Fail quietly: never let a backend/network error reach the UI as
            // raw error text, and never break the rest of the Sidebar. A
            // failed "Show more" just leaves the existing suggestions and
            // cursor state untouched (safe to retry); a failed first load
            // resets to the clean empty state, which SuggestedFriends.js
            // already renders as nothing.
            console.error("Error loading suggested friends:", error);
            if (isFirstPage) {
                setSuggestions([]);
                cursorStateRef.current = { cursor: null, seed: null, wrapped: null };
                setHasMore(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchPage(null, null, null, true);
    }, [fetchPage]);

    const onAdd = async (id) => {
        setPendingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        // Optimistic "Sent" state, rolled back below if the request actually
        // failed - sendFriendRequest now reports success/failure via its
        // return value instead of always resolving silently (see
        // FriendshipProvider), so this never has to guess.
        const succeeded = await sendFriendRequest(user.id, id);
        if (!succeeded) {
            setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id));
        }
    };

    const onShowMore = hasMore
        ? () => {
              const { cursor, seed, wrapped } = cursorStateRef.current;
              fetchPage(cursor, seed, wrapped, false);
          }
        : undefined;

    return { suggestions, pendingIds, onAdd, onShowMore };
}

export default useSuggestedFriends;
