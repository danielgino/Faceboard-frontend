import { render, act, screen, fireEvent } from "@testing-library/react";
import { UserProvider, useUser } from "../UserProvider";

// M-GAL1: fetchUserPostImages decides the Demo gallery source from the VIEWED profile's own
// username (passed explicitly by the caller - see UserDetails.js), not from the logged-in
// session's own id/username, and not from GET /post/{userId}/all-post-images (deliberately
// excluded from the Demo allowlist - unbounded, not worth re-scoping for a preview card). Each
// of the 4 seed usernames must resolve to ONLY that account's own images - no profile may
// inherit another's.

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    ...jest.requireActual("../../utils/Utils"),
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));
jest.mock("../../utils/authCleanup", () => ({
    clearStoredSession: jest.fn(),
}));

const DEMO_USER_GALLERY = [
    "/demo-assets/gallery/demo-gallery-01.jpg",
    "/demo-assets/gallery/demo-gallery-02.jpg",
    "/demo-assets/gallery/demo-gallery-03.jpg",
    "/demo-assets/gallery/demo-gallery-04.jpg",
    "/demo-assets/gallery/demo-gallery-05.jpg",
    "/demo-assets/gallery/demo-gallery-06.jpg",
    "/demo-assets/gallery/demo-gallery-07.jpg",
    "/demo-assets/gallery/demo-gallery-08.jpg",
];
const ALEX_GALLERY = ["/demo-assets/posts/city-night.png"];
const JAMIE_GALLERY = ["/demo-assets/posts/coffee-workspace.png", "/demo-assets/posts/travel-street.png"];
const SAM_GALLERY = ["/demo-assets/posts/hiking-view.png"];

function Consumer() {
    const { userImages, fetchUserPostImages, setUser } = useUser();
    return (
        <div>
            <div data-testid="images">{userImages.join(",")}</div>
            <button onClick={() => setUser({ id: 1, username: "demo_user", demo: true })}>become-demo</button>
            <button onClick={() => setUser({ id: 1, username: "regular_jane", demo: false })}>become-normal</button>
            <button onClick={() => fetchUserPostImages(1, "demo_user")}>fetch-demo-user</button>
            <button onClick={() => fetchUserPostImages(2, "demo_alex")}>fetch-alex</button>
            <button onClick={() => fetchUserPostImages(3, "demo_jamie")}>fetch-jamie</button>
            <button onClick={() => fetchUserPostImages(4, "demo_sam")}>fetch-sam</button>
            <button onClick={() => fetchUserPostImages(9, "some_unrecognized_username")}>fetch-unknown</button>
        </div>
    );
}

beforeEach(() => {
    mockFetchWithAuth.mockReset();
});

async function fetchAs(buttonText) {
    await act(async () => {
        fireEvent.click(screen.getByText(buttonText));
    });
}

test("demo_user's viewed profile resolves to the dedicated 8-image gallery, with no backend call", async () => {
    render(<UserProvider><Consumer /></UserProvider>);
    fireEvent.click(screen.getByText("become-demo"));

    await fetchAs("fetch-demo-user");

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    expect(screen.getByTestId("images").textContent).toBe(DEMO_USER_GALLERY.join(","));
});

test("Alex's viewed profile resolves to ONLY his own post image, with no backend call", async () => {
    render(<UserProvider><Consumer /></UserProvider>);
    fireEvent.click(screen.getByText("become-demo"));

    await fetchAs("fetch-alex");

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    expect(screen.getByTestId("images").textContent).toBe(ALEX_GALLERY.join(","));
});

test("Jamie's viewed profile resolves to ONLY her own two post images, with no backend call", async () => {
    render(<UserProvider><Consumer /></UserProvider>);
    fireEvent.click(screen.getByText("become-demo"));

    await fetchAs("fetch-jamie");

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    expect(screen.getByTestId("images").textContent).toBe(JAMIE_GALLERY.join(","));
});

test("Sam's viewed profile resolves to ONLY his own post image, with no backend call", async () => {
    render(<UserProvider><Consumer /></UserProvider>);
    fireEvent.click(screen.getByText("become-demo"));

    await fetchAs("fetch-sam");

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    expect(screen.getByTestId("images").textContent).toBe(SAM_GALLERY.join(","));
});

test("no Demo profile inherits another's images - switching viewed profile replaces, never merges, the gallery", async () => {
    render(<UserProvider><Consumer /></UserProvider>);
    fireEvent.click(screen.getByText("become-demo"));

    await fetchAs("fetch-demo-user");
    expect(screen.getByTestId("images").textContent).toBe(DEMO_USER_GALLERY.join(","));

    await fetchAs("fetch-alex");
    expect(screen.getByTestId("images").textContent).toBe(ALEX_GALLERY.join(","));
    expect(screen.getByTestId("images").textContent).not.toContain("demo-gallery");

    await fetchAs("fetch-jamie");
    expect(screen.getByTestId("images").textContent).toBe(JAMIE_GALLERY.join(","));
    expect(screen.getByTestId("images").textContent).not.toContain("city-night");

    await fetchAs("fetch-sam");
    expect(screen.getByTestId("images").textContent).toBe(SAM_GALLERY.join(","));
    expect(screen.getByTestId("images").textContent).not.toContain("coffee-workspace");
});

test("an unrecognized username under a Demo session falls back to an empty gallery, never the backend", async () => {
    render(<UserProvider><Consumer /></UserProvider>);
    fireEvent.click(screen.getByText("become-demo"));

    await fetchAs("fetch-unknown");

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
    expect(screen.getByTestId("images").textContent).toBe("");
});

test("every Demo gallery path is local (/demo-assets/...), never Cloudinary or any external host", () => {
    for (const url of [...DEMO_USER_GALLERY, ...ALEX_GALLERY, ...JAMIE_GALLERY, ...SAM_GALLERY]) {
        expect(url.startsWith("/demo-assets/")).toBe(true);
        expect(url.toLowerCase()).not.toContain("cloudinary");
        expect(url.toLowerCase()).not.toMatch(/^https?:\/\//);
    }
});

test("a normal (non-demo) session is completely unaffected - still calls the real endpoint, even if the viewed username happens to match a seed username", async () => {
    mockFetchWithAuth.mockResolvedValue({ ok: true, json: async () => ["a.jpg", "b.jpg"] });
    render(<UserProvider><Consumer /></UserProvider>);
    fireEvent.click(screen.getByText("become-normal"));

    await fetchAs("fetch-demo-user");

    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);
    expect(mockFetchWithAuth.mock.calls[0][0]).toContain("all-post-images");
    expect(screen.getByTestId("images").textContent).toBe("a.jpg,b.jpg");
});
