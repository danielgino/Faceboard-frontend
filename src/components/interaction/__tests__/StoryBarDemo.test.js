import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StoryBar from "../StoryBar";
import { getDemoStories } from "../../../context/demoStories";

// M-STORY1: Demo Mode Stories, integration-level - proves the ACTUAL StoryBar UI (not just
// StoryProvider's data) renders the 4 mock Demo Stories as clickable circles, opens the real
// Story viewer on click, and makes the upload ("Your story") control genuinely non-interactive.

jest.mock("react-insta-stories", () => ({
    __esModule: true,
    default: () => <button type="button">story-content-button</button>,
    WithHeader: ({ children }) => <>{children}</>,
}));

const mockOpenStoryUploadDialog = jest.fn();
jest.mock("../../profile/StoryUploadDialog", () => ({
    __esModule: true,
    default: (...args) => mockOpenStoryUploadDialog(...args),
}));

let mockUser;
jest.mock("../../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser, isDemo: !!mockUser?.demo }),
}));

const mockUploadStory = jest.fn();
const mockFetchStories = jest.fn();
jest.mock("../../../context/StoryProvider", () => ({
    useStories: () => ({
        stories: jest.requireActual("../../../context/demoStories").getDemoStories(),
        loading: false,
        uploadStory: mockUploadStory,
        fetchStories: mockFetchStories,
    }),
}));

beforeEach(() => {
    mockUser = { id: 1, fullName: "Demo User", profilePictureUrl: "/demo-assets/profiles/demo-user.jpeg", demo: true };
    mockOpenStoryUploadDialog.mockReset();
    mockUploadStory.mockReset();
    mockFetchStories.mockReset();
});

test("all 4 Demo Stories render as clickable circles, one per author", () => {
    render(<StoryBar />);

    for (const story of getDemoStories()) {
        expect(screen.getByText(story.fullName)).toBeInTheDocument();
    }
});

test("clicking a Demo Story circle opens the real Story viewer", async () => {
    render(<StoryBar />);

    const trigger = screen.getByText("Alex Rivera").closest("button");
    fireEvent.click(trigger);

    expect(await screen.findByRole("dialog", { name: "Story viewer" })).toBeInTheDocument();
    expect(screen.getByText("story-content-button")).toBeInTheDocument();
});

test("'Your story' is disabled for a Demo session and never opens the upload dialog", () => {
    render(<StoryBar />);

    const yourStory = screen.getByText("Your story").closest("button");
    expect(yourStory).toBeDisabled();
    expect(yourStory).toHaveAttribute("title", "Story uploads are disabled in Demo Mode.");

    fireEvent.click(yourStory);

    expect(mockOpenStoryUploadDialog).not.toHaveBeenCalled();
});

test("a normal (non-demo) user's 'Your story' button is unaffected - still opens the upload dialog", () => {
    mockUser = { id: 1, fullName: "Jane Doe", profilePictureUrl: "", demo: false };
    render(<StoryBar />);

    const yourStory = screen.getByText("Your story").closest("button");
    expect(yourStory).not.toBeDisabled();

    fireEvent.click(yourStory);

    expect(mockOpenStoryUploadDialog).toHaveBeenCalledWith(mockUploadStory, mockFetchStories);
});
