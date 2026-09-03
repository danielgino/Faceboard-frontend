import React from "react";
import { render, waitFor } from "@testing-library/react";
import { UserProvider } from "../../../context/UserProvider";
import UserDetails from "../UserDetails";

// M-GAL1 integration coverage: renders the REAL UserProvider + REAL UserDetails + REAL
// ProfileGallery together (not UserProvider in isolation) to prove the 8 local demo_user images -
// and each other seed user's own post images - actually reach the visible Gallery grid, for the
// exact reason a unit test of UserProvider alone couldn't catch the original bug: the failure was
// in the DATA FLOW between UserProvider and UserDetails (a race on the session's own `user`
// loading before the profile fetch fired), not in what UserProvider computes once called
// correctly.
//
// Waits below poll via plain `container.querySelector`/`querySelectorAll` rather than
// `screen.getByRole`/`getByText` - this component tree renders several Material Tailwind
// Tooltip/FloatingPortal instances (ProfileSocialLinks) that re-render on their own timers during
// the wait window, and RTL's accessible-name-computing role/text queries proved unreliable
// (intermittently throwing) amid that unrelated churn. Plain DOM queries aren't affected by it.

jest.mock("react-router-dom", () => ({
    Link: ({ to, children, className }) => <a href={typeof to === "string" ? to : "#"} className={className}>{children}</a>,
}), { virtual: true });

jest.mock("../../../context/LightBoxContext", () => ({
    useLightbox: () => ({ openLightbox: jest.fn() }),
}));

jest.mock("../../../context/useProfilePictureUpload", () => () => ({
    uploading: false,
    handleFileChange: jest.fn(),
    handleRemoveProfilePicture: jest.fn(),
}));

jest.mock("../../../context/FriendshipProvider", () => ({
    useFriendship: () => ({
        checkFriendStatus: jest.fn().mockResolvedValue(null),
        sendFriendRequest: jest.fn(),
        acceptFriendRequest: jest.fn(),
        declineFriendRequest: jest.fn(),
        removeFriendship: jest.fn(),
    }),
}));

jest.mock("../../../utils/swalTheme", () => ({
    __esModule: true,
    default: { fire: jest.fn(() => Promise.resolve({})) },
}));

const mockFetchWithAuth = jest.fn();
jest.mock("../../../utils/Utils", () => ({
    ...jest.requireActual("../../../utils/Utils"),
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));

const { AUTH_ME_API, GET_USER_DETAILS_BY_ID, JWT_STORAGE_KEY } = require("../../../utils/Utils");

jest.setTimeout(20000);

const DEMO_SESSION_ID = 42;

function demoSessionDto(overrides = {}) {
    return {
        id: DEMO_SESSION_ID,
        username: "demo_user",
        name: "Demo",
        lastname: "User",
        fullName: "Demo User",
        bio: "bio",
        gender: "FEMALE",
        birthDate: "1995-01-01",
        profilePictureUrl: "/demo-assets/profiles/demo-user.jpeg",
        friendsList: [],
        demo: true,
        ...overrides,
    };
}

// Matches the real PublicUserProfileDTO shape (GET /user/by-id) - no `demo` field at all, which
// is exactly why the fix keys off `username` instead (see UserProvider.js's DEMO_USERNAME_GALLERY
// comment).
function publicProfileDto(overrides = {}) {
    return {
        id: DEMO_SESSION_ID,
        username: "demo_user",
        name: "Demo",
        fullName: "Demo User",
        bio: "bio",
        gender: "FEMALE",
        birthDate: "1995-01-01",
        profilePictureUrl: "/demo-assets/profiles/demo-user.jpeg",
        friendsList: [],
        ...overrides,
    };
}

function setUpDemoSession(viewedProfile) {
    localStorage.setItem(JWT_STORAGE_KEY, "fake-demo-token");
    mockFetchWithAuth.mockImplementation(async (url) => {
        if (url === AUTH_ME_API) {
            return { ok: true, json: async () => demoSessionDto() };
        }
        if (url === GET_USER_DETAILS_BY_ID(viewedProfile.id)) {
            return { ok: true, json: async () => viewedProfile };
        }
        // In particular, /post/{id}/all-post-images must never be reached for a Demo session.
        return { ok: false, status: 403, json: async () => ({ code: "DEMO_ACCESS_DENIED" }) };
    });
}

beforeEach(() => {
    mockFetchWithAuth.mockReset();
    localStorage.clear();
});

// Scoped to gallery/post images only - excludes the profile-avatar <img> (also under
// /demo-assets/, at /demo-assets/profiles/...), which is a different card entirely.
function galleryImgSrcs(container) {
    return Array.from(container.querySelectorAll("img"))
        .map((img) => img.getAttribute("src"))
        .filter((src) => src && (src.startsWith("/demo-assets/gallery/") || src.startsWith("/demo-assets/posts/")));
}

test("demo_user viewing their OWN profile: the real Gallery grid renders the 8-image set (last 4 shown, View all reaches all 8), with no all-post-images request", async () => {
    setUpDemoSession(publicProfileDto({ id: DEMO_SESSION_ID, username: "demo_user" }));

    const { container } = render(
        <UserProvider>
            <UserDetails otherUserId={String(DEMO_SESSION_ID)} />
        </UserProvider>
    );

    await waitFor(() => {
        expect(galleryImgSrcs(container).length).toBe(4); // ProfileGallery's own preview grid shows the last 4 of the array
    });

    const srcs = galleryImgSrcs(container);
    srcs.forEach((src) => expect(src).toMatch(/^\/demo-assets\/gallery\/demo-gallery-0[5-8]\.jpg$/));
    const viewAllLink = container.querySelector(`a[href="/album/${DEMO_SESSION_ID}"]`);
    expect(viewAllLink).not.toBeNull();

    const calledUrls = mockFetchWithAuth.mock.calls.map(([url]) => url);
    expect(calledUrls.some((url) => url.includes("all-post-images"))).toBe(false);
});

test("Alex's profile: the real Gallery grid renders ONLY his own city-night.png, with no all-post-images request", async () => {
    setUpDemoSession(publicProfileDto({ id: 2, username: "demo_alex", name: "Alex", fullName: "Alex Rivera" }));

    const { container } = render(
        <UserProvider>
            <UserDetails otherUserId="2" />
        </UserProvider>
    );

    await waitFor(() => {
        expect(galleryImgSrcs(container).length).toBeGreaterThan(0);
    });

    expect(galleryImgSrcs(container)).toEqual(["/demo-assets/posts/city-night.png"]);
    // 1 image <= 4, so no "View all" link should render at all.
    expect(container.querySelector('a[href^="/album/"]')).toBeNull();

    const calledUrls = mockFetchWithAuth.mock.calls.map(([url]) => url);
    expect(calledUrls.some((url) => url.includes("all-post-images"))).toBe(false);
});

test("Jamie's profile: the real Gallery grid renders ONLY her own two post images, with no all-post-images request", async () => {
    setUpDemoSession(publicProfileDto({ id: 3, username: "demo_jamie", name: "Jamie", fullName: "Jamie Chen" }));

    const { container } = render(
        <UserProvider>
            <UserDetails otherUserId="3" />
        </UserProvider>
    );

    await waitFor(() => {
        expect(galleryImgSrcs(container).length).toBe(2);
    });

    const srcs = galleryImgSrcs(container);
    expect(srcs.sort()).toEqual(["/demo-assets/posts/coffee-workspace.png", "/demo-assets/posts/travel-street.png"].sort());

    const calledUrls = mockFetchWithAuth.mock.calls.map(([url]) => url);
    expect(calledUrls.some((url) => url.includes("all-post-images"))).toBe(false);
});

test("Sam's profile: the real Gallery grid renders ONLY his own hiking-view.png, with no all-post-images request", async () => {
    setUpDemoSession(publicProfileDto({ id: 4, username: "demo_sam", name: "Sam", fullName: "Sam Okafor" }));

    const { container } = render(
        <UserProvider>
            <UserDetails otherUserId="4" />
        </UserProvider>
    );

    await waitFor(() => {
        expect(galleryImgSrcs(container).length).toBeGreaterThan(0);
    });

    expect(galleryImgSrcs(container)).toEqual(["/demo-assets/posts/hiking-view.png"]);

    const calledUrls = mockFetchWithAuth.mock.calls.map(([url]) => url);
    expect(calledUrls.some((url) => url.includes("all-post-images"))).toBe(false);
});

test("no Demo profile inherits another's images - each of the 4 seed profiles renders a disjoint, correctly-scoped set", async () => {
    const expectations = [
        [publicProfileDto({ id: DEMO_SESSION_ID, username: "demo_user" }), String(DEMO_SESSION_ID), 8],
        [publicProfileDto({ id: 2, username: "demo_alex" }), "2", 1],
        [publicProfileDto({ id: 3, username: "demo_jamie" }), "3", 2],
        [publicProfileDto({ id: 4, username: "demo_sam" }), "4", 1],
    ];
    const seen = new Set();

    for (const [profile, otherUserId, expectedCount] of expectations) {
        setUpDemoSession(profile);
        const { container, unmount } = render(
            <UserProvider>
                <UserDetails otherUserId={otherUserId} />
            </UserProvider>
        );

        await waitFor(() => {
            expect(galleryImgSrcs(container).length).toBe(Math.min(expectedCount, 4));
        });

        for (const src of galleryImgSrcs(container)) {
            expect(seen.has(src)).toBe(false); // never rendered by a different profile in this loop
            seen.add(src);
        }

        unmount();
    }
});

test("a normal (non-demo) user's own profile Gallery is completely unaffected - still fetched via the real backend endpoint", async () => {
    localStorage.setItem(JWT_STORAGE_KEY, "fake-normal-token");
    const normalUser = { id: 7, username: "regular_jane", name: "Jane", fullName: "Jane Doe", demo: false, friendsList: [] };
    const normalProfile = publicProfileDto({ id: 7, username: "regular_jane", name: "Jane", fullName: "Jane Doe", profilePictureUrl: "" });

    mockFetchWithAuth.mockImplementation(async (url) => {
        if (url === AUTH_ME_API) return { ok: true, json: async () => normalUser };
        if (url === GET_USER_DETAILS_BY_ID(7)) return { ok: true, json: async () => normalProfile };
        if (url.includes("all-post-images")) return { ok: true, json: async () => ["real-photo-1.jpg", "real-photo-2.jpg"] };
        return { ok: false, status: 404, json: async () => ({}) };
    });

    const { container } = render(
        <UserProvider>
            <UserDetails otherUserId="7" />
        </UserProvider>
    );

    await waitFor(() => {
        const srcs = Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("src"));
        expect(srcs).toContain("real-photo-1.jpg");
    });

    const srcs = Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("src"));
    expect(srcs).toEqual(expect.arrayContaining(["real-photo-1.jpg", "real-photo-2.jpg"]));

    const calledUrls = mockFetchWithAuth.mock.calls.map(([url]) => url);
    expect(calledUrls.some((url) => url.includes("all-post-images"))).toBe(true);
});
