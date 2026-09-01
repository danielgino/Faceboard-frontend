import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";

// F2 fix: facebookUrl/instagramUrl must only render as a clickable link
// when they satisfy the HTTPS + exact-domain policy (FACEBOOK_URL_REGEX /
// INSTAGRAM_URL_REGEX in src/utils/Utils.js). This exercises the real
// UserDetails component so a future edit to that render logic is caught.

global.IS_REACT_ACT_ENVIRONMENT = true;

// react-router-dom@7's package.json "main" points at a file absent from
// the installed version, which the exports-map-blind Jest 27 resolver
// (bundled with this project's react-scripts@5) can't work around; see the
// same workaround/explanation in src/pages/chat/__tests__/ChatMessageRendering.test.js.
// UserDetails/FriendsCard only use <Link>, so only that is mocked. virtual:true is
// required too, since Jest still tries to resolve the real path to register a
// mock against unless told not to - the mock's own code never needs that path.
jest.mock("react-router-dom", () => ({
    Link: ({ to, children }) => <a href={typeof to === "string" ? to : "#"}>{children}</a>,
}), { virtual: true });

// UserDetails only renders RandomIcons.Edit/TrashIcon, so the whole module
// is stubbed rather than rendering RandomIcons' real (unrelated) icon set
// for this test.
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

function makePerson(overrides = {}) {
    return {
        id: 1,
        name: "Alice",
        lastname: "Doe",
        fullName: "Alice Doe",
        bio: "",
        gender: "FEMALE",
        birthDate: "2000-01-01",
        email: "alice@example.com",
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

// UserDetails always reads from `otherUser` (not `user`) once an
// otherUserId prop is passed, even when it refers to your own profile - so
// the profile data under test is set on otherUser, with otherUserId ===
// user.id to view it (mirrors visiting your own profile via its route).
function renderProfile(personOverrides) {
    mockUser = makePerson({ id: 1 });
    mockOtherUser = makePerson({ id: 1, ...personOverrides });
    act(() => {
        root.render(<UserDetails otherUserId={1} />);
    });
}

// Cleanup Batch 2: ProfileSocialLinks was redesigned from Font Awesome
// glyphs (`.fa-facebook`/`.fa-instagram`) to lucide-react icons - there is no
// icon element to query by class anymore. A valid link now renders as an
// <a aria-label="Facebook Profile"|"Follow on Instagram">; an invalid one
// renders the same icon badge with no wrapping <a> at all, so absence of
// that anchor is itself the correct "no href" signal.
function socialLinkHref(platform) {
    const label = platform === "facebook" ? "Facebook Profile" : "Follow on Instagram";
    const anchor = container.querySelector(`a[aria-label="${label}"]`);
    return anchor ? anchor.getAttribute("href") : null;
}

describe("F2 - profile social links only render as clickable for HTTPS + exact-domain values", () => {
    test("valid https:// facebook.com and instagram.com URLs render and navigate correctly", () => {
        renderProfile({
            facebookUrl: "https://facebook.com/john",
            instagramUrl: "https://www.instagram.com/john",
        });

        expect(socialLinkHref("facebook")).toBe("https://facebook.com/john");
        expect(socialLinkHref("instagram")).toBe("https://www.instagram.com/john");
    });

    test("empty values render with no href (not a broken/unsafe link)", () => {
        renderProfile({ facebookUrl: "", instagramUrl: "" });

        expect(socialLinkHref("facebook")).toBeNull();
        expect(socialLinkHref("instagram")).toBeNull();
    });

    test.each([
        ["scheme-less legacy value", "facebook.com/john"],
        ["http:// (no longer allowed)", "http://facebook.com/john"],
        ["javascript: scheme", "javascript:alert(1)"],
        ["data: scheme", "data:text/html,<script>alert(1)</script>"],
        ["protocol-relative", "//facebook.com/john"],
        ["deceptive subdomain", "https://facebook.com.evil.com/john"],
    ])("invalid/legacy stored facebookUrl (%s) does not render as a clickable link", (_label, value) => {
        renderProfile({ facebookUrl: value, instagramUrl: "" });

        expect(socialLinkHref("facebook")).toBeNull();
    });

    test.each([
        ["scheme-less legacy value", "instagram.com/john"],
        ["http:// (no longer allowed)", "http://instagram.com/john"],
        ["javascript: scheme", "javascript:alert(1)"],
        ["deceptive subdomain", "https://instagram.com.evil.com/john"],
    ])("invalid/legacy stored instagramUrl (%s) does not render as a clickable link", (_label, value) => {
        renderProfile({ facebookUrl: "", instagramUrl: value });

        expect(socialLinkHref("instagram")).toBeNull();
    });
});
