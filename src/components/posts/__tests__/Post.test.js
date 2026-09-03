import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Post from "../Post";

// Demo Mode: the Share button must be genuinely disabled (native `disabled`, not just styled)
// for a demo session - clicking it must never open SharePostModal and must never issue any
// request. A real user's Share button must be completely unaffected.

// react-router-dom isn't resolvable as a real module in this project's Jest setup (see
// Login.test.js's identical mock) - only the bits Post.js actually uses are needed here.
jest.mock("react-router-dom", () => ({
    Link: ({ to, children, ...rest }) => <a href={typeof to === "string" ? to : "#"} {...rest}>{children}</a>,
}), { virtual: true });

jest.mock("../SharePostModal", () => (props) => (
    <div data-testid="share-modal" onClick={props.onClose}>share-modal-open</div>
));

jest.mock("../Like", () => () => <div>like-stub</div>);
jest.mock("../AddComment", () => () => <div>add-comment-stub</div>);
jest.mock("../Comment", () => () => <div>comment-stub</div>);
jest.mock("../PostImages", () => () => null);

const mockEditPost = jest.fn();
const mockDeletePost = jest.fn();
jest.mock("../../../context/PostProvider", () => ({
    usePosts: () => ({ editPost: mockEditPost, deletePost: mockDeletePost }),
}));

let mockUser;
jest.mock("../../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser, isDemo: !!mockUser?.demo }),
}));

jest.mock("../../../utils/swalTheme", () => ({
    __esModule: true,
    default: { fire: jest.fn(() => Promise.resolve({ isConfirmed: false })) },
}));

function makePost(overrides = {}) {
    return {
        id: 1,
        userId: 2, // deliberately not the viewer's own post, so the owner-only Menu doesn't render
        fullName: "Alex Rivera",
        username: "demo_alex",
        content: "Hello from Demo Mode",
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        likedByCurrentUser: false,
        imageUrls: [],
        likedUsers: [],
        edited: false,
        ...overrides,
    };
}

function renderPost(post) {
    return render(<Post post={post} />);
}

beforeEach(() => {
    mockEditPost.mockReset();
    mockDeletePost.mockReset();
});

test("Demo Mode: the Share button is disabled, and clicking it never opens SharePostModal", () => {
    mockUser = { id: 1, demo: true };
    renderPost(makePost());

    const shareButton = screen.getByLabelText("Share this post");
    expect(shareButton).toBeDisabled();
    expect(shareButton).toHaveAttribute("title", "Sharing is disabled in Demo Mode.");

    fireEvent.click(shareButton);

    expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();
});

test("a normal user's Share button is enabled and opens SharePostModal on click", () => {
    mockUser = { id: 1, demo: false };
    renderPost(makePost());

    const shareButton = screen.getByLabelText("Share this post");
    expect(shareButton).not.toBeDisabled();
    expect(shareButton).not.toHaveAttribute("title");

    fireEvent.click(shareButton);

    expect(screen.getByTestId("share-modal")).toBeInTheDocument();
});
