import { render, act, fireEvent, screen } from "@testing-library/react";
import { StoryProvider, useStories } from "../StoryProvider";
import { getDemoStories } from "../demoStories";

// Phase 8C: StoryProvider used to run fetchStories from two separate effects
// (one [user]-driven, one mount-only), which could both fire on the same
// render when `user` was already available at mount - a real double-fetch
// risk (e.g. logging back in without a full page reload). These tests pin
// down the exact request count per lifecycle scenario now that a single
// effect owns fetching.

let mockUser = null;
jest.mock("../UserProvider", () => ({
    useUser: () => ({ user: mockUser }),
}));

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    ...jest.requireActual("../../utils/Utils"),
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));

function Consumer() {
    const { stories, uploadStory } = useStories();
    return (
        <div>
            <div data-testid="count">{stories.length}</div>
            <div data-testid="urls">{stories.map((s) => s.imageUrl).join(",")}</div>
            <button onClick={() => uploadStory(new File(["x"], "x.jpg"), "caption")}>upload</button>
        </div>
    );
}

beforeEach(() => {
    mockUser = null;
    mockFetchWithAuth.mockReset();
    mockFetchWithAuth.mockResolvedValue({ ok: true, json: async () => [] });
});

test("does not fetch stories when no user is authenticated at mount", async () => {
    mockUser = null;

    await act(async () => {
        render(<StoryProvider><Consumer /></StoryProvider>);
    });

    expect(mockFetchWithAuth).not.toHaveBeenCalled();
});

test("fetches stories exactly once when a user is already authenticated at mount", async () => {
    mockUser = { id: 1 };

    await act(async () => {
        render(<StoryProvider><Consumer /></StoryProvider>);
    });

    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);
});

test("fetches stories exactly once when the user becomes authenticated after mount", async () => {
    mockUser = null;
    let rerender;

    await act(async () => {
        const result = render(<StoryProvider><Consumer /></StoryProvider>);
        rerender = result.rerender;
    });
    expect(mockFetchWithAuth).not.toHaveBeenCalled();

    mockUser = { id: 1 };
    await act(async () => {
        rerender(<StoryProvider><Consumer /></StoryProvider>);
    });

    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);
});

test("refetches exactly once when the authenticated user identity changes", async () => {
    mockUser = { id: 1 };
    let rerender;

    await act(async () => {
        const result = render(<StoryProvider><Consumer /></StoryProvider>);
        rerender = result.rerender;
    });
    expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);

    mockUser = { id: 2 };
    await act(async () => {
        rerender(<StoryProvider><Consumer /></StoryProvider>);
    });

    expect(mockFetchWithAuth).toHaveBeenCalledTimes(2);
});

// M-STORY1: Demo Mode Stories. GET /api/stories/friends is not on the Demo allowlist, so a Demo
// session must never call it at all - the local mock dataset (demoStories.js) is the sole source.
describe("Demo Mode", () => {
    test("a Demo session's stories come from the local mock dataset, with no backend call at all", async () => {
        mockUser = { id: 1, demo: true };

        await act(async () => {
            render(<StoryProvider><Consumer /></StoryProvider>);
        });

        expect(mockFetchWithAuth).not.toHaveBeenCalled();
        expect(screen.getByTestId("count").textContent).toBe("4");
        expect(screen.getByTestId("urls").textContent).toBe(
            getDemoStories().map((s) => s.imageUrl).join(",")
        );
    });

    test("Demo Stories remain present regardless of timestamps - the mock dataset is static, not filtered by age", async () => {
        mockUser = { id: 1, demo: true };

        await act(async () => {
            render(<StoryProvider><Consumer /></StoryProvider>);
        });

        // No expiresAt/createdAt on any mock story (see demoStories.test.js) means there is
        // nothing here that could ever filter them out by age - the count is simply always 4.
        expect(screen.getByTestId("count").textContent).toBe("4");
    });

    test("uploadStory is a no-op for a Demo session - resolves to null, never calls the backend", async () => {
        mockUser = { id: 1, demo: true };

        await act(async () => {
            render(<StoryProvider><Consumer /></StoryProvider>);
        });
        mockFetchWithAuth.mockClear();

        await act(async () => {
            fireEvent.click(screen.getByText("upload"));
        });

        expect(mockFetchWithAuth).not.toHaveBeenCalled();
        // The mock dataset must be unchanged - no story was prepended.
        expect(screen.getByTestId("count").textContent).toBe("4");
    });

    test("a normal (non-demo) user is completely unaffected - still calls the real Story endpoint", async () => {
        mockUser = { id: 1, demo: false };
        mockFetchWithAuth.mockResolvedValue({ ok: true, json: async () => [{ imageUrl: "real.jpg" }] });

        await act(async () => {
            render(<StoryProvider><Consumer /></StoryProvider>);
        });

        expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("count").textContent).toBe("1");
        expect(screen.getByTestId("urls").textContent).toBe("real.jpg");
    });
});
