import { render, act, screen } from "@testing-library/react";
import { UserProvider, useUser } from "../UserProvider";

// Phase 8C: fetchUserDetailsById used to have an empty `finally {}` block,
// so isOtherUserLoading (read by UserDetails) was declared but never
// actually set - always false. These tests pin down that the flag now
// tracks the real request lifecycle, and never gets stuck true on either
// the success or the failure path.

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    ...jest.requireActual("../../utils/Utils"),
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));
jest.mock("../../utils/authCleanup", () => ({
    clearStoredSession: jest.fn(),
}));

function Consumer() {
    const { isOtherUserLoading, otherUser, fetchUserDetailsById } = useUser();
    return (
        <div>
            <span data-testid="loading">{String(isOtherUserLoading)}</span>
            <span data-testid="other">{otherUser ? otherUser.id : "none"}</span>
            <button onClick={() => fetchUserDetailsById(42)}>fetch</button>
            <button onClick={() => fetchUserDetailsById(7)}>fetch7</button>
            <button onClick={() => fetchUserDetailsById(99)}>fetch99</button>
        </div>
    );
}

beforeEach(() => {
    mockFetchWithAuth.mockReset();
});

test("isOtherUserLoading becomes true while the request is in flight and false again on success", async () => {
    let resolveFetch;
    mockFetchWithAuth.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));

    render(<UserProvider><Consumer /></UserProvider>);
    expect(screen.getByTestId("loading").textContent).toBe("false");

    act(() => {
        screen.getByText("fetch").click();
    });
    expect(screen.getByTestId("loading").textContent).toBe("true");

    await act(async () => {
        resolveFetch({ ok: true, json: async () => ({ id: 42 }) });
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("other").textContent).toBe("42");
});

test("isOtherUserLoading returns to false on a failed request (finally protects the failure path)", async () => {
    let resolveFetch;
    mockFetchWithAuth.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));

    render(<UserProvider><Consumer /></UserProvider>);

    act(() => {
        screen.getByText("fetch").click();
    });
    expect(screen.getByTestId("loading").textContent).toBe("true");

    await act(async () => {
        resolveFetch({ ok: false });
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("other").textContent).toBe("none");
});

// Phase 10: fetchUserDetailsById had no guard against out-of-order
// responses. Navigating profile A -> profile B before A's request resolved
// let A's late response overwrite otherUser after B's had already committed
// (see the identity-guard fix in UserProvider.js, and the analogous
// already-fixed race this mirrors in pages/Album.js).
test("a late response for an earlier-requested user does not overwrite a newer request's result", async () => {
    let resolveFirst;
    let resolveSecond;
    mockFetchWithAuth
        .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
        .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));

    render(<UserProvider><Consumer /></UserProvider>);

    act(() => {
        screen.getByText("fetch7").click();
    });
    act(() => {
        screen.getByText("fetch99").click();
    });

    // The second (99) request resolves first...
    await act(async () => {
        resolveSecond({ ok: true, json: async () => ({ id: 99 }) });
    });
    expect(screen.getByTestId("other").textContent).toBe("99");

    // ...then the stale first (7) request resolves late. It must not clobber 99.
    await act(async () => {
        resolveFirst({ ok: true, json: async () => ({ id: 7 }) });
    });
    expect(screen.getByTestId("other").textContent).toBe("99");
});
