import React from "react";
import { render, act } from "@testing-library/react";

// M-GAL2: the full "View all" Album page (src/pages/Album.js) previously had its own,
// completely independent data-fetching path that never checked Demo Mode at all - it always
// called the excluded GET /post/{userId}/all-post-images, which 403s under Demo, leaving the
// page stuck on "0 photos"/"No Photos Yet" regardless of how correct the profile-preview
// (UserDetails/ProfileGallery) path was. These tests cover the fix: Album.js now shares
// UserProvider's getDemoGalleryImages helper, resolves the VIEWED profile's username reliably
// (own id needs no extra request; any other id via the same safe GET /user/by-id path
// fetchUserDetailsById already uses), and never touches the excluded endpoint for a Demo session.
//
// react-router-dom is mocked (virtual: true) for the same reason documented in Album.test.js:
// v7's package.json "main" points at a file absent from the installed version.
let mockUserId;
jest.mock("react-router-dom", () => ({
    useParams: () => ({ userId: mockUserId }),
}), { virtual: true });

jest.mock("../../context/LightBoxContext", () => ({
    useLightbox: () => ({ openLightbox: jest.fn() }),
}));

const DEMO_SESSION = { id: 42, username: "demo_user", fullName: "Demo User", demo: true };
let mockUser = DEMO_SESSION;
let mockOtherUser = null;
const mockFetchUserDetailsById = jest.fn();

jest.mock("../../context/UserProvider", () => ({
    // getDemoGalleryImages is the REAL shared helper (not re-mocked) - these tests exercise the
    // actual mapping, not a stand-in for it, so Album.js and UserProvider.js can never silently
    // drift apart.
    ...jest.requireActual("../../context/UserProvider"),
    useUser: () => ({ user: mockUser, otherUser: mockOtherUser, fetchUserDetailsById: mockFetchUserDetailsById }),
}));

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
    GET_USER_IMAGES_API: (userId) => `/api/images/${userId}`,
}));

const Album = require("../Album").default;

async function flush() {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
}

function imgSrcs(container) {
    return Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("src"));
}

beforeEach(() => {
    mockUser = DEMO_SESSION;
    mockOtherUser = null;
    mockFetchUserDetailsById.mockReset();
    mockFetchWithAuth.mockReset();
});

test("demo_user's own Album: title, count, and all 8 local images render, with no all-post-images request and no extra profile lookup", async () => {
    mockUserId = "42";
    const { container } = render(<Album />);
    await flush();

    expect(container.textContent).toContain("Demo User's Album");
    expect(container.textContent).toContain("8 photos");
    expect(imgSrcs(container)).toEqual([
        "/demo-assets/gallery/demo-gallery-01.jpg",
        "/demo-assets/gallery/demo-gallery-02.jpg",
        "/demo-assets/gallery/demo-gallery-03.jpg",
        "/demo-assets/gallery/demo-gallery-04.jpg",
        "/demo-assets/gallery/demo-gallery-05.jpg",
        "/demo-assets/gallery/demo-gallery-06.jpg",
        "/demo-assets/gallery/demo-gallery-07.jpg",
        "/demo-assets/gallery/demo-gallery-08.jpg",
    ]);
    expect(container.textContent).not.toContain("No Photos Yet");
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    // Own id is already known from the session - no need to re-resolve it via a lookup.
    expect(mockFetchUserDetailsById).not.toHaveBeenCalled();
});

test("Alex's Album: 1 photo (city-night.png), resolved via fetchUserDetailsById, no all-post-images request", async () => {
    mockUserId = "2";
    mockFetchUserDetailsById.mockResolvedValue({ id: 2, username: "demo_alex", fullName: "Alex Rivera" });

    const { container } = render(<Album />);
    await flush();

    expect(container.textContent).toContain("1 photo");
    expect(container.textContent).not.toContain("1 photos");
    expect(imgSrcs(container)).toEqual(["/demo-assets/posts/city-night.png"]);
    expect(container.textContent).not.toContain("No Photos Yet");
    expect(mockFetchUserDetailsById).toHaveBeenCalledWith("2");
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
});

test("Jamie's Album: 2 photos (coffee-workspace.png, travel-street.png), no all-post-images request", async () => {
    mockUserId = "3";
    mockFetchUserDetailsById.mockResolvedValue({ id: 3, username: "demo_jamie", fullName: "Jamie Chen" });

    const { container } = render(<Album />);
    await flush();

    expect(container.textContent).toContain("2 photos");
    expect(imgSrcs(container).sort()).toEqual(
        ["/demo-assets/posts/coffee-workspace.png", "/demo-assets/posts/travel-street.png"].sort()
    );
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
});

test("Sam's Album: 1 photo (hiking-view.png), no all-post-images request", async () => {
    mockUserId = "4";
    mockFetchUserDetailsById.mockResolvedValue({ id: 4, username: "demo_sam", fullName: "Sam Okafor" });

    const { container } = render(<Album />);
    await flush();

    expect(container.textContent).toContain("1 photo");
    expect(imgSrcs(container)).toEqual(["/demo-assets/posts/hiking-view.png"]);
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
});

test("direct route (no prior profile visit): otherUser is null/stale and the Album still resolves Alex's own images correctly", async () => {
    mockUserId = "2";
    mockOtherUser = null; // never populated - simulates a fresh page load/refresh straight on /album/2
    mockFetchUserDetailsById.mockResolvedValue({ id: 2, username: "demo_alex", fullName: "Alex Rivera" });

    const { container } = render(<Album />);
    await flush();

    expect(imgSrcs(container)).toEqual(["/demo-assets/posts/city-night.png"]);
    expect(container.textContent).not.toContain("No Photos Yet");
});

test("direct route where otherUser happens to be stale (a DIFFERENT profile's leftover data) does not leak into this Album", async () => {
    mockUserId = "3"; // viewing Jamie
    mockOtherUser = { id: 4, username: "demo_sam", fullName: "Sam Okafor" }; // stale leftover from a previous view
    mockFetchUserDetailsById.mockResolvedValue({ id: 3, username: "demo_jamie", fullName: "Jamie Chen" });

    const { container } = render(<Album />);
    await flush();

    // Images must come from the freshly-resolved profile (Jamie), never the stale otherUser (Sam).
    expect(imgSrcs(container).sort()).toEqual(
        ["/demo-assets/posts/coffee-workspace.png", "/demo-assets/posts/travel-street.png"].sort()
    );
});

test("race safety: navigating /album/A -> /album/B before A's Demo profile lookup resolves never lets A overwrite B", async () => {
    mockUserId = "2"; // Alex
    let resolveAlex;
    mockFetchUserDetailsById.mockImplementationOnce(
        () => new Promise((resolve) => { resolveAlex = resolve; })
    );

    const { rerender, container } = render(<Album />);
    await act(async () => { await Promise.resolve(); }); // let the effect kick off the pending fetch

    // Navigate to Sam's album before Alex's lookup resolves.
    mockUserId = "4";
    mockFetchUserDetailsById.mockResolvedValueOnce({ id: 4, username: "demo_sam", fullName: "Sam Okafor" });
    rerender(<Album />);
    await flush();

    expect(imgSrcs(container)).toEqual(["/demo-assets/posts/hiking-view.png"]);

    // Alex's now-stale lookup resolves late - must not overwrite Sam's already-displayed Album.
    resolveAlex({ id: 2, username: "demo_alex", fullName: "Alex Rivera" });
    await flush();

    expect(imgSrcs(container)).toEqual(["/demo-assets/posts/hiking-view.png"]);
});

test("a normal (non-demo) user's Album is completely unaffected - still calls GET_USER_IMAGES_API exactly as before", async () => {
    mockUserId = "7";
    mockUser = { id: 7, username: "regular_jane", fullName: "Jane Doe", demo: false };
    mockFetchWithAuth.mockResolvedValue({ ok: true, json: async () => ["real-photo-1.jpg", "real-photo-2.jpg"] });

    const { container } = render(<Album />);
    await flush();

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/api/images/7");
    expect(imgSrcs(container)).toEqual(["real-photo-1.jpg", "real-photo-2.jpg"]);
    expect(mockFetchUserDetailsById).not.toHaveBeenCalled();
});

test("every Demo Album image resolves to a local path only, never Cloudinary or any external host", () => {
    const { getDemoGalleryImages } = jest.requireActual("../../context/UserProvider");
    for (const username of ["demo_user", "demo_alex", "demo_jamie", "demo_sam"]) {
        for (const url of getDemoGalleryImages(username)) {
            expect(url.startsWith("/demo-assets/")).toBe(true);
            expect(url.toLowerCase()).not.toContain("cloudinary");
            expect(url.toLowerCase()).not.toMatch(/^https?:\/\//);
        }
    }
});
