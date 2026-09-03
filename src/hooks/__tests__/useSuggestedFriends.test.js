import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";

// SUGGESTED-FRIENDS-001/SUG-002: useSuggestedFriends calls the real
// GET /friendship/suggestions endpoint. These tests cover the contract
// SuggestedFriends.js/SideBar.js depend on: initial load, "Show more" via
// the full cursor/seed/wrapped state (not cursor alone), session-level
// de-duplication as a defensive backstop, and Add only keeping its
// optimistic "Sent" state when sendFriendRequest actually succeeds.

const mockUser = { id: 99 };
let mockIsDemo = false;
jest.mock("../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser, isDemo: mockIsDemo }),
}));

const mockSendFriendRequest = jest.fn();
jest.mock("../../context/FriendshipProvider", () => ({
    useFriendship: () => ({ sendFriendRequest: mockSendFriendRequest }),
}));

const mockFetchWithAuth = jest.fn();
const mockSuggestedFriendsApi = jest.fn(
    (cursor, seed, wrapped, limit) => `/api/friendship/suggestions?cursor=${cursor}&seed=${seed}&wrapped=${wrapped}&limit=${limit}`
);
jest.mock("../../utils/Utils", () => ({
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
    SUGGESTED_FRIENDS_API: (...args) => mockSuggestedFriendsApi(...args),
}));

const useSuggestedFriends = require("../useSuggestedFriends").default;

function person(id) {
    return { id, fullName: `User ${id}`, username: `user${id}`, profilePictureUrl: "" };
}

function mockPage(users, { nextCursor = null, seed = 42, wrapped = false, hasMore = false } = {}) {
    return { ok: true, json: async () => ({ users, nextCursor, seed, wrapped, hasMore }) };
}

beforeEach(() => {
    mockFetchWithAuth.mockReset();
    mockSuggestedFriendsApi.mockClear();
    mockSendFriendRequest.mockReset();
    mockIsDemo = false;
});

// Demo Mode: GET /friendship/suggestions is not on the backend's Demo allowlist. Rather than an
// empty card, a small static mock list is shown - with no backend request at all.
describe("Demo Mode", () => {
    test("returns a populated mock list without ever calling the real suggestions endpoint", async () => {
        mockIsDemo = true;

        const { result } = renderHook(() => useSuggestedFriends());

        // Give any accidental effect a tick to fire before asserting it didn't.
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.suggestions.length).toBeGreaterThan(0);
        expect(result.current.disabled).toBe(true);
        expect(mockFetchWithAuth).not.toHaveBeenCalled();
        expect(mockSuggestedFriendsApi).not.toHaveBeenCalled();
    });

    test("onAdd/onShowMore are not provided, so a suggestion can never trigger a friend-request call", async () => {
        mockIsDemo = true;

        const { result } = renderHook(() => useSuggestedFriends());
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.onAdd).toBeUndefined();
        expect(result.current.onShowMore).toBeUndefined();
        expect(mockSendFriendRequest).not.toHaveBeenCalled();
    });
});

test("initial load requests the first page with no cursor/seed/wrapped and exposes the returned suggestions", async () => {
    mockFetchWithAuth.mockResolvedValue(
        mockPage([person(1), person(2), person(3)], { nextCursor: 103, seed: 42, wrapped: false, hasMore: true })
    );

    const { result } = renderHook(() => useSuggestedFriends());

    await waitFor(() => expect(result.current.suggestions).toHaveLength(3));
    expect(mockSuggestedFriendsApi).toHaveBeenCalledWith(null, null, null, 3);
    expect(result.current.suggestions.map((u) => u.id)).toEqual([1, 2, 3]);
    expect(result.current.onShowMore).toBeInstanceOf(Function);
});

test("onShowMore is not offered once the backend reports hasMore: false", async () => {
    mockFetchWithAuth.mockResolvedValue(mockPage([person(1)], { nextCursor: 1, hasMore: false }));

    const { result } = renderHook(() => useSuggestedFriends());

    await waitFor(() => expect(result.current.suggestions).toHaveLength(1));
    expect(result.current.onShowMore).toBeUndefined();
});

test("Show More echoes back the full cursor/seed/wrapped state from the previous response, not just the cursor", async () => {
    mockFetchWithAuth.mockResolvedValueOnce(
        mockPage([person(101)], { nextCursor: -1, seed: 500, wrapped: true, hasMore: true })
    );

    const { result } = renderHook(() => useSuggestedFriends());
    await waitFor(() => expect(result.current.suggestions).toHaveLength(1));

    mockFetchWithAuth.mockResolvedValueOnce(mockPage([person(3)], { nextCursor: 3, seed: 500, wrapped: true, hasMore: false }));

    await act(async () => {
        result.current.onShowMore();
    });

    // The wrapped=true/seed=500 the first response returned must be echoed
    // back verbatim, not silently dropped in favor of cursor alone - that is
    // exactly what protects phase B from climbing back above the seed.
    expect(mockSuggestedFriendsApi).toHaveBeenLastCalledWith(-1, 500, true, 3);
    // Show More replaces the visible batch (just the new page), not [101, 3].
    await waitFor(() => expect(result.current.suggestions.map((u) => u.id)).toEqual([3]));
});

// SHOWMORE-001: the visible card is always the CURRENT batch, never every
// page accumulated - the component itself only ever renders suggestions[0..3).
test("Show More REPLACES the visible batch instead of appending to it", async () => {
    mockFetchWithAuth.mockResolvedValueOnce(mockPage([person(1), person(2), person(3)], { nextCursor: 3, hasMore: true }));

    const { result } = renderHook(() => useSuggestedFriends());
    await waitFor(() => expect(result.current.suggestions).toHaveLength(3));
    expect(result.current.suggestions.map((u) => u.id)).toEqual([1, 2, 3]);

    mockFetchWithAuth.mockResolvedValueOnce(mockPage([person(4), person(5), person(6)], { nextCursor: 6, hasMore: true }));

    await act(async () => {
        result.current.onShowMore();
    });

    // Visible batch is exactly the new page - NOT [1,2,3,4,5,6].
    await waitFor(() => expect(result.current.suggestions.map((u) => u.id)).toEqual([4, 5, 6]));

    mockFetchWithAuth.mockResolvedValueOnce(mockPage([person(7), person(8)], { nextCursor: 8, hasMore: false }));

    await act(async () => {
        result.current.onShowMore();
    });

    // A third batch with fewer than 3 users still just replaces, in full.
    await waitFor(() => expect(result.current.suggestions.map((u) => u.id)).toEqual([7, 8]));
    expect(result.current.onShowMore).toBeUndefined(); // hasMore: false on the last page
});

test("Show More drops any duplicate user id from the new batch as a defensive backstop", async () => {
    mockFetchWithAuth.mockResolvedValueOnce(mockPage([person(1), person(2), person(3)], { nextCursor: 3, hasMore: true }));

    const { result } = renderHook(() => useSuggestedFriends());
    await waitFor(() => expect(result.current.suggestions).toHaveLength(3));

    // id 3 was already shown in the first batch - seenIdsRef (kept across
    // pages, never reset on Show More) must filter it back out even though
    // it's no longer part of the visible `suggestions` array.
    mockFetchWithAuth.mockResolvedValueOnce(mockPage([person(3), person(4), person(5)], { nextCursor: 5, hasMore: false }));

    await act(async () => {
        result.current.onShowMore();
    });

    await waitFor(() => expect(result.current.suggestions.map((u) => u.id)).toEqual([4, 5]));
});

test("Add keeps the pending/'Sent' state once sendFriendRequest actually succeeds", async () => {
    mockFetchWithAuth.mockResolvedValue(mockPage([person(7)], { nextCursor: 7, hasMore: false }));
    mockSendFriendRequest.mockResolvedValue(true);

    const { result } = renderHook(() => useSuggestedFriends());
    await waitFor(() => expect(result.current.suggestions).toHaveLength(1));

    await act(async () => {
        await result.current.onAdd(7);
    });

    expect(mockSendFriendRequest).toHaveBeenCalledWith(99, 7);
    expect(result.current.pendingIds).toContain(7);
});

test("Add rolls back the optimistic pending state when sendFriendRequest fails", async () => {
    mockFetchWithAuth.mockResolvedValue(mockPage([person(8)], { nextCursor: 8, hasMore: false }));
    mockSendFriendRequest.mockResolvedValue(false);

    const { result } = renderHook(() => useSuggestedFriends());
    await waitFor(() => expect(result.current.suggestions).toHaveLength(1));

    await act(async () => {
        await result.current.onAdd(8);
    });

    expect(mockSendFriendRequest).toHaveBeenCalledWith(99, 8);
    expect(result.current.pendingIds).not.toContain(8);
});

test("a backend/network failure on initial load leaves an empty suggestion list instead of throwing", async () => {
    mockFetchWithAuth.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useSuggestedFriends());

    await waitFor(() => expect(result.current.suggestions).toEqual([]));
    expect(result.current.onShowMore).toBeUndefined();
});

// RACE-001 regression: React.StrictMode double-mounts every component in
// development, firing the initial-load effect twice. Both calls are
// identical "first page" requests, so seenIdsRef dedup means whichever
// response lands *second* comes back with an empty `fresh` list even
// though it succeeded - previously that got applied verbatim
// (isFirstPage replaces, not appends), wiping out suggestions the first
// response had already shown. requestIdRef must make the stale response a
// no-op instead.
test("StrictMode's duplicate initial-load request does not wipe the suggestions the other one already showed", async () => {
    let resolveFirstCall;
    let resolveSecondCall;
    const responses = [
        new Promise((resolve) => { resolveFirstCall = resolve; }),
        new Promise((resolve) => { resolveSecondCall = resolve; }),
    ];
    let callIndex = 0;
    mockFetchWithAuth.mockImplementation(() => responses[callIndex++]);

    const { result } = renderHook(() => useSuggestedFriends(), { wrapper: React.StrictMode });

    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalledTimes(2));

    // The second (most recently started) request - the one that must win -
    // resolves first with real data.
    await act(async () => {
        resolveSecondCall(mockPage([person(1), person(2), person(3)], { nextCursor: 3, hasMore: true }));
    });
    await waitFor(() => expect(result.current.suggestions).toHaveLength(3));

    // The now-stale first request resolves afterward. In production this
    // would come back with the exact same 3 users (identical query), which
    // seenIdsRef would already have fully deduped into an empty `fresh`
    // list - exactly the shape that used to wipe the card.
    await act(async () => {
        resolveFirstCall(mockPage([], { nextCursor: 3, hasMore: true }));
    });

    expect(result.current.suggestions).toHaveLength(3);
    expect(result.current.suggestions.map((u) => u.id)).toEqual([1, 2, 3]);
});

// Same StrictMode double-mount, but the stale (first) request FAILS instead
// of resolving empty - the literal "request A fails later, its catch clears
// state" scenario. isFirstPage is true for both duplicated calls, so this is
// the one realistic path where a failure's setSuggestions([]) could wipe
// data a newer request already showed; the guard must stop it.
test("StrictMode's duplicate initial-load request failing after the other already succeeded does not clear the result", async () => {
    let resolveSecondCall;
    let rejectFirstCall;
    const responses = [
        new Promise((_resolve, reject) => { rejectFirstCall = reject; }),
        new Promise((resolve) => { resolveSecondCall = resolve; }),
    ];
    let callIndex = 0;
    mockFetchWithAuth.mockImplementation(() => responses[callIndex++]);

    const { result } = renderHook(() => useSuggestedFriends(), { wrapper: React.StrictMode });
    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalledTimes(2));

    // The second (most recently started) request succeeds first.
    await act(async () => {
        resolveSecondCall(mockPage([person(1), person(2)], { nextCursor: 2, hasMore: false }));
    });
    await waitFor(() => expect(result.current.suggestions).toHaveLength(2));

    // The now-stale first request rejects afterward - must not wipe the display.
    await act(async () => {
        rejectFirstCall(new Error("network flake"));
    });

    expect(result.current.suggestions).toHaveLength(2);
    expect(result.current.suggestions.map((u) => u.id)).toEqual([1, 2]);
});
