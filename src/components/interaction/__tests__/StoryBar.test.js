import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StoryBar from "../StoryBar";

// Phase 12: the story viewer already had role="dialog"/focus entry/return
// (Phase 9). This covers the newly-added Tab-containment trap. The
// react-insta-stories mock itself renders a focusable element, proving the
// trap is library-agnostic - it queries generically for whatever's
// focusable inside the dialog at trap time, rather than depending on
// react-insta-stories' internals (which expose no focus-related API at all
// per its installed type defs/README).

jest.mock("react-insta-stories", () => ({
    __esModule: true,
    default: () => <button type="button">story-content-button</button>,
    WithHeader: ({ children }) => <>{children}</>,
}));

jest.mock("../../profile/StoryUploadDialog", () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockUser = { id: 1, profilePictureUrl: "" };
jest.mock("../../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser }),
}));

jest.mock("../../../context/StoryProvider", () => ({
    useStories: () => ({
        stories: [
            { fullName: "Bob", profilePictureUrl: "", imageUrl: "bob.jpg", caption: "" },
        ],
        uploadStory: jest.fn(),
        fetchStories: jest.fn(),
    }),
}));

function openViewer() {
    render(<StoryBar />);
    const trigger = screen.getByText("Bob").closest("button");
    // jsdom doesn't focus a button on click the way a real browser does, so
    // this focuses it explicitly first - matching a keyboard user tabbing
    // to the trigger and activating it - which is exactly the scenario the
    // focus-return test below needs document.activeElement to reflect.
    trigger.focus();
    fireEvent.click(trigger);
    return trigger;
}

test("Tab wraps from the close button back to the story content instead of escaping the dialog", async () => {
    openViewer();

    const closeButton = await screen.findByRole("button", { name: "Close story" });
    expect(closeButton).toHaveFocus();

    const contentButton = screen.getByText("story-content-button");
    fireEvent.keyDown(window, { key: "Tab" });
    await waitFor(() => expect(contentButton).toHaveFocus());
});

test("Escape closes the viewer and returns focus to the story that opened it", async () => {
    const storyTrigger = openViewer();

    await screen.findByRole("dialog");

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(storyTrigger).toHaveFocus();
});
