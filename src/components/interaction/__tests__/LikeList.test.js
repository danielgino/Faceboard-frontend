import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LikeList from "../LikeList";

// Phase 9 micro-close: this custom fixed-overlay dialog already had
// role="dialog"/aria-modal/an accessible name and Escape-to-close (Phase 9's
// original A11Y-005 fix). What it was missing was focus entry/return, which
// is what these tests cover - not every aria-label already in place.

// react-router-dom@7's package.json can't be resolved by this project's
// Jest resolver at all (see the same workaround/explanation in
// UserDetailsSocialLinks.test.js); LikeList only renders <Link>.
jest.mock("react-router-dom", () => ({
    Link: ({ to, children }) => <a href={typeof to === "string" ? to : "#"}>{children}</a>,
}), { virtual: true });

jest.mock("../../../utils/Utils", () => ({
    ...jest.requireActual("../../../utils/Utils"),
    fetchWithAuth: jest.fn(),
}));

const mockUser = { id: 1, fullName: "Ada Lovelace" };
jest.mock("../../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser }),
}));

// A stable module-level mock (not a fresh jest.fn() per useFriendship()
// call) so tests can assert call counts across re-renders/effect re-runs.
const mockCheckFriendStatus = jest.fn().mockResolvedValue(null);
jest.mock("../../../context/FriendshipProvider", () => ({
    useFriendship: () => ({
        sendFriendRequest: jest.fn(),
        checkFriendStatus: mockCheckFriendStatus,
    }),
}));

const { fetchWithAuth } = require("../../../utils/Utils");

function mockLikedUsers(users = []) {
    fetchWithAuth.mockResolvedValue({
        ok: true,
        json: async () => users,
    });
}

function makeUsers(count, offset = 0) {
    return Array.from({ length: count }, (_, i) => ({
        userId: offset + i + 2,
        fullName: `User ${offset + i}`,
        username: `user${offset + i}`,
        profilePictureUrl: "",
    }));
}

afterEach(() => {
    fetchWithAuth.mockReset();
    mockCheckFriendStatus.mockClear();
    delete window.IntersectionObserver;
});

test("moves focus to the close button once the dialog finishes loading", async () => {
    mockLikedUsers([{ userId: 2, fullName: "Bob", username: "bob", profilePictureUrl: "" }]);

    render(<LikeList postId={1} onClose={jest.fn()} />);

    const closeButton = await screen.findByRole("button", { name: "Close" });
    expect(closeButton).toHaveFocus();
});

test("a post with zero likes still exits loading and shows the dialog", async () => {
    // Regression test: the friend-status effect only cleared `loading` once
    // it had liked users to check statuses for, so a 0-like post left the
    // dialog stuck on LikeLoader forever. Fixed by clearing `loading`
    // directly once the (empty) liked-users fetch resolves.
    mockLikedUsers([]);

    render(<LikeList postId={1} onClose={jest.fn()} />);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.queryByText(/loading likes/i)).not.toBeInTheDocument();
});

test("returns focus to the element that opened the dialog once it unmounts", async () => {
    // NOTE: uses a non-empty list here only because this test's own
    // assertions need a real "opener" focus target unrelated to the
    // zero-likes case covered above.
    mockLikedUsers([{ userId: 2, fullName: "Bob", username: "bob", profilePictureUrl: "" }]);

    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(<LikeList postId={1} onClose={jest.fn()} />);

    await screen.findByRole("dialog");
    unmount();
    expect(opener).toHaveFocus();

    document.body.removeChild(opener);
});

test("Escape still closes the dialog", async () => {
    mockLikedUsers([{ userId: 2, fullName: "Bob", username: "bob", profilePictureUrl: "" }]);
    const onClose = jest.fn();

    render(<LikeList postId={1} onClose={onClose} />);

    await screen.findByRole("dialog");
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
});

test("Tab wraps from the last focusable element back to the close button", async () => {
    mockLikedUsers([{ userId: 2, fullName: "Bob", username: "bob", profilePictureUrl: "" }]);

    render(<LikeList postId={1} onClose={jest.fn()} />);

    const closeButton = await screen.findByRole("button", { name: "Close" });
    // FriendshipActionSlot's button text is just "Add", not "Add Friend".
    const addFriendButton = await screen.findByRole("button", { name: "Add" });

    addFriendButton.focus();
    expect(addFriendButton).toHaveFocus();

    fireEvent.keyDown(window, { key: "Tab" });
    await waitFor(() => expect(closeButton).toHaveFocus());
});

// Phase 15: LikeList already had server-backed pagination (page/size query
// params) from earlier external work; these tests cover the sentinel-driven
// load-more path and the friend-status-only-for-new-users fix, not the
// pagination engine itself (already proven by the fetch/dedupe logic below).
function installMockIntersectionObserver() {
    let callback;
    class MockIntersectionObserver {
        constructor(cb) {
            callback = cb;
        }
        observe() {}
        disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver;
    return (entries) => act(() => callback(entries));
}

test("loads the next page when the sentinel intersects, only checks friend status for the newly loaded users, and stops once hasMore is false", async () => {
    const triggerIntersection = installMockIntersectionObserver();

    const page0 = makeUsers(50, 0);
    const page1 = makeUsers(10, 50);
    fetchWithAuth
        .mockResolvedValueOnce({ ok: true, json: async () => page0 })
        .mockResolvedValueOnce({ ok: true, json: async () => page1 });

    render(<LikeList postId={1} onClose={jest.fn()} />);

    await screen.findByRole("dialog");
    await waitFor(() => expect(mockCheckFriendStatus).toHaveBeenCalledTimes(50));
    expect(fetchWithAuth).toHaveBeenCalledTimes(1);

    triggerIntersection([{ isIntersecting: true }]);

    await waitFor(() => expect(fetchWithAuth).toHaveBeenCalledTimes(2));
    // Only the 10 newly-appended users get a friend-status check, not all 60.
    await waitFor(() => expect(mockCheckFriendStatus).toHaveBeenCalledTimes(60));

    // page1 has only 10 users (< LIKES_PAGE_SIZE), so hasMore is now false;
    // a further intersection must not trigger a third request.
    triggerIntersection([{ isIntersecting: true }]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchWithAuth).toHaveBeenCalledTimes(2);
});

test("does not start a second page request while one is already in flight", async () => {
    const triggerIntersection = installMockIntersectionObserver();

    const page0 = makeUsers(50, 0);
    fetchWithAuth.mockResolvedValueOnce({ ok: true, json: async () => page0 });
    let resolvePage1;
    fetchWithAuth.mockImplementationOnce(
        () => new Promise((resolve) => { resolvePage1 = resolve; })
    );

    render(<LikeList postId={1} onClose={jest.fn()} />);

    await screen.findByRole("dialog");
    await waitFor(() => expect(mockCheckFriendStatus).toHaveBeenCalledTimes(50));
    expect(fetchWithAuth).toHaveBeenCalledTimes(1);

    triggerIntersection([{ isIntersecting: true }]);
    await waitFor(() => expect(fetchWithAuth).toHaveBeenCalledTimes(2));

    // The second page's fetch is still pending (resolvePage1 hasn't been
    // called yet); further intersections must not fire a third request.
    triggerIntersection([{ isIntersecting: true }]);
    triggerIntersection([{ isIntersecting: true }]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchWithAuth).toHaveBeenCalledTimes(2);

    await act(async () => {
        resolvePage1({ ok: true, json: async () => makeUsers(10, 50) });
    });
    await waitFor(() => expect(mockCheckFriendStatus).toHaveBeenCalledTimes(60));
});
