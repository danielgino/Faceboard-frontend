import { render, act } from "@testing-library/react";
import { StoryProvider, useStories } from "../StoryProvider";

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
    const { stories } = useStories();
    return <div data-testid="count">{stories.length}</div>;
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
