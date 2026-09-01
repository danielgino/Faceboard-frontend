import React from "react";
import { render, act } from "@testing-library/react";

// EFFECT-001 regression suite: Album previously had no stale-response
// protection, so a slow response for a previously-viewed album (e.g. user
// opens /album/5, then quickly navigates to /album/6 before request 5
// finishes) could resolve after the newer request and overwrite the shared
// userImages array with the wrong user's photos. The fix fetches into local
// state, guarded by an ignore flag set on cleanup (mirroring the existing
// pattern in SinglePostPage.js), so a late-resolving stale request can no
// longer overwrite what's displayed.
//
// react-router-dom is mocked (virtual: true) for the same reason documented
// in the other test files in this repo: v7's package.json "main" points at a
// file absent from the installed version, which this project's Jest resolver
// can't work around.
let mockUserId;
jest.mock("react-router-dom", () => ({
    useParams: () => ({ userId: mockUserId }),
}), { virtual: true });

jest.mock("../../context/LightBoxContext", () => ({
    useLightbox: () => ({ openLightbox: jest.fn() }),
}));

const mockUser = { id: 1 };
jest.mock("../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser, otherUser: null }),
}));

let pendingResolvers;
const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
    GET_USER_IMAGES_API: (userId) => `/api/images/${userId}`,
}));

const Album = require("../Album").default;

function jsonResponse(body) {
    return { ok: true, json: async () => body };
}

async function flush() {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
}

beforeEach(() => {
    // react-scripts' default Jest config sets resetMocks: true, which wipes
    // any implementation given to jest.fn(impl) before every test - including
    // ones baked in at module scope inside a jest.mock() factory. The
    // implementation has to be (re-)established here, after that reset, via
    // mockImplementation - not passed to jest.fn() directly - or it silently
    // returns undefined instead of ever running.
    pendingResolvers = {};
    mockFetchWithAuth.mockImplementation((url) => new Promise((resolve) => {
        pendingResolvers[url] = resolve;
    }));
});

test("a slow response for a previously-viewed album does not overwrite a newer, already-loaded album", async () => {
    mockUserId = "5";
    const { rerender, container } = render(<Album />);
    expect(mockFetchWithAuth).toHaveBeenCalledWith("/api/images/5");

    // User navigates to /album/6 before the request for user 5 resolves.
    mockUserId = "6";
    rerender(<Album />);
    expect(mockFetchWithAuth).toHaveBeenCalledWith("/api/images/6");

    // The newer request (user 6) resolves first.
    pendingResolvers["/api/images/6"](jsonResponse(["user6-a.jpg", "user6-b.jpg"]));
    await flush();

    // The older, now-stale request (user 5) resolves after.
    pendingResolvers["/api/images/5"](jsonResponse(["user5-a.jpg"]));
    await flush();

    const renderedSrcs = Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("src"));
    expect(renderedSrcs).toEqual(["user6-a.jpg", "user6-b.jpg"]);
});

test("the same protection holds regardless of resolution order (stale resolves first)", async () => {
    mockUserId = "5";
    const { rerender, container } = render(<Album />);
    expect(mockFetchWithAuth).toHaveBeenCalledWith("/api/images/5");

    mockUserId = "6";
    rerender(<Album />);
    expect(mockFetchWithAuth).toHaveBeenCalledWith("/api/images/6");

    // This time the older, stale request (user 5) happens to resolve first.
    pendingResolvers["/api/images/5"](jsonResponse(["user5-a.jpg"]));
    await flush();

    // Then the newer, correct request (user 6) resolves.
    pendingResolvers["/api/images/6"](jsonResponse(["user6-a.jpg", "user6-b.jpg"]));
    await flush();

    const renderedSrcs = Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("src"));
    expect(renderedSrcs).toEqual(["user6-a.jpg", "user6-b.jpg"]);
});
