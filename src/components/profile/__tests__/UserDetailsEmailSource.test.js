import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";

// Public-profile finding: the backend's GET /user/by-id response (which populates `otherUser`,
// including when viewing your OWN profile via the /profile/:userId route) no longer carries an
// email field at all - only the authenticated `user` state (GET /auth/me) does. This proves the
// component was updated to read email from `user`, never from `otherUser`/`currentUser`.

global.IS_REACT_ACT_ENVIRONMENT = true;

// { virtual: true } is required in addition to the mock itself: react-router-dom@7's
// package.json "main" points at "./dist/main.js", which doesn't exist in the installed
// package (only dist/index.js|.mjs do) - so Jest's resolver can't locate the real module
// to register the mock against, even though the mock never needs the real module's code.
// virtual:true tells Jest not to try resolving the real path at all.
jest.mock("react-router-dom", () => ({
    Link: ({ to, children }) => <a href={typeof to === "string" ? to : "#"}>{children}</a>,
}), { virtual: true });

jest.mock("../../../Icons/RandomIcons", () => ({
    Edit: () => <button aria-label="EditIcon" />,
    TrashIcon: () => <svg aria-label="TrashIcon" />,
}));

let mockUser;
let mockOtherUser;
const mockFetchUserDetailsById = jest.fn(async () => {});
const mockClearOtherUser = jest.fn();
const mockFetchUserDetails = jest.fn();
const mockSetUser = jest.fn();
const mockFetchUserPostImages = jest.fn(async () => {});

jest.mock("../../../context/UserProvider", () => ({
    useUser: () => ({
        user: mockUser,
        otherUser: mockOtherUser,
        fetchUserDetailsById: mockFetchUserDetailsById,
        clearOtherUser: mockClearOtherUser,
        isOtherUserLoading: false,
        fetchUserDetails: mockFetchUserDetails,
        setUser: mockSetUser,
        fetchUserPostImages: mockFetchUserPostImages,
        userImages: [],
    }),
}));

jest.mock("../../../context/useProfilePictureUpload", () => () => ({
    uploading: false,
    handleFileChange: jest.fn(),
    handleRemoveProfilePicture: jest.fn(),
}));

jest.mock("../../../context/LightBoxContext", () => ({
    useLightbox: () => ({ openLightbox: jest.fn() }),
}));

jest.mock("../../../context/FriendshipProvider", () => ({
    useFriendship: () => ({
        friendStatus: null,
        checkFriendStatus: jest.fn(),
        sendFriendRequest: jest.fn(),
        acceptFriendRequest: jest.fn(),
        declineFriendRequest: jest.fn(),
        removeFriendship: jest.fn(),
    }),
}));

const UserDetails = require("../UserDetails").default;

// Matches the real PublicUserProfileDTO/PublicFriendDTO shape - deliberately no `email` key at
// all, the same as the actual backend response since this batch's fix.
function makePublicProfile(overrides = {}) {
    return {
        id: 1,
        name: "Alice",
        fullName: "Alice Doe",
        bio: "",
        gender: "FEMALE",
        birthDate: "2000-01-01",
        profilePictureUrl: "",
        friendsList: [],
        facebookUrl: "",
        instagramUrl: "",
        ...overrides,
    };
}

let container;
let root;

beforeEach(() => {
    jest.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => {
        root.unmount();
    });
    container.remove();
    container = null;
    root = null;
});

test("own profile (via /profile/:userId) displays email from the authenticated user state, not from the public otherUser response", () => {
    // Mirrors visiting your own profile route: otherUserId === user.id, so `otherUser` (the
    // public-profile response, no email field) is what UserDetails reads for everything except
    // the email line.
    mockUser = { id: 1, email: "real-self-email@example.com" };
    mockOtherUser = makePublicProfile({ id: 1 });

    act(() => {
        root.render(<UserDetails otherUserId={1} />);
    });

    // Cleanup Batch 2: ProfilePersonalDetails' PersonalDetailRow renders the
    // label and value as separate stacked <p> elements (Design System
    // #profile), not a concatenated "Label: value" string - so
    // container.textContent runs them together with no separator.
    expect(container.textContent).toContain("Emailreal-self-email@example.com");
});

test("another user's profile never renders an email line, and the public response needs none", () => {
    mockUser = { id: 1, email: "self@example.com" };
    mockOtherUser = makePublicProfile({ id: 2, name: "Bob", fullName: "Bob Smith" });

    act(() => {
        root.render(<UserDetails otherUserId={2} />);
    });

    expect(container.textContent).not.toContain("Email:");
    expect(container.textContent).not.toContain("self@example.com");
});
