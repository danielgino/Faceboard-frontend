import { renderHook, act } from "@testing-library/react";
import { FriendshipProvider, useFriendship } from "../FriendshipProvider";

// SUG-002: sendFriendRequest now reports whether the POST actually succeeded
// instead of always resolving silently, so a caller (useSuggestedFriends)
// can roll back an optimistic "Sent" state on failure instead of showing it
// for a request that never went through. It must still never throw, so
// existing callers (LikeList.js/UserDetails.js), which only ever `await` it
// with no try/catch of their own around it, keep working unchanged.

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
    CHECK_FRIENDS_STATUS_API: (userId, friendId) => `/api/friendship/status/${userId}/${friendId}`,
    SEND_FRIEND_REQUEST_API: (userId, otherUserId) => `/api/friendship/send/${userId}/${otherUserId}`,
    ACCEPT_FRIEND_REQUEST_API: (userId, otherUserId) => `/api/friendship/accept/${userId}/${otherUserId}`,
    REMOVE_FRIEND_API: (userId, otherUserId) => `/api/friendship/remove/${userId}/${otherUserId}`,
    DECLINE_FRIEND_REQUEST_API: "/api/friendship/decline",
}));

beforeEach(() => {
    mockFetchWithAuth.mockReset();
});

function renderFriendship() {
    return renderHook(() => useFriendship(), { wrapper: FriendshipProvider });
}

test("sendFriendRequest returns true when the backend responds ok", async () => {
    mockFetchWithAuth.mockResolvedValue({ ok: true });
    const { result } = renderFriendship();

    let succeeded;
    await act(async () => {
        succeeded = await result.current.sendFriendRequest(1, 2);
    });

    expect(succeeded).toBe(true);
});

test("sendFriendRequest returns false (without throwing) when the backend responds non-ok", async () => {
    mockFetchWithAuth.mockResolvedValue({ ok: false, status: 400 });
    const { result } = renderFriendship();

    let succeeded;
    await act(async () => {
        succeeded = await result.current.sendFriendRequest(1, 2);
    });

    expect(succeeded).toBe(false);
});

test("sendFriendRequest returns false (without throwing) on a network error", async () => {
    mockFetchWithAuth.mockRejectedValue(new Error("network down"));
    const { result } = renderFriendship();

    let succeeded;
    await act(async () => {
        succeeded = await result.current.sendFriendRequest(1, 2);
    });

    expect(succeeded).toBe(false);
});
