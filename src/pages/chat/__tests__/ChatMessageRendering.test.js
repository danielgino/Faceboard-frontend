import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";

// chatscope's <MessageList> uses a compound CSS selector (via
// getSnapshotBeforeUpdate/getLastMessageOrGroup) to find the last message
// for its auto-scroll behavior. jsdom's selector engine (nwsapi) in this
// project's installed versions throws a SyntaxError on that selector - an
// unrelated environment limitation, not anything to do with the F1
// rendering fix under test (chatscope's own code treats a null/undefined
// result from this lookup as a normal "nothing to scroll to yet" case, so
// swallowing the error and returning null is safe). ChatContainer matches
// MessageList by direct component-reference identity, so MessageList
// itself cannot be swapped for a stub without breaking that recognition -
// patching querySelector is the smallest viable workaround.
const originalQuerySelector = Element.prototype.querySelector;
beforeAll(() => {
    Element.prototype.querySelector = function (selector) {
        try {
            return originalQuerySelector.call(this, selector);
        } catch (e) {
            if (e instanceof DOMException && /last-of-type/.test(selector)) {
                return null;
            }
            throw e;
        }
    };
});
afterAll(() => {
    Element.prototype.querySelector = originalQuerySelector;
});

// F1 regression suite (see BACKEND_DEEP_AUDIT-adjacent frontend audit): the
// chatscope <Message> component defaults to type="html" and renders its
// payload via dangerouslySetInnerHTML when no explicit type is supplied.
// Chat.js must render every message (sent or received) as plain text.

let mockUser;
let mockMessagesState;
let mockUnreadByUser;
const mockFetchConversationMessages = jest.fn(async () => {});
const mockFetchOlderMessages = jest.fn(async () => {});
const mockHasMoreOlderMessages = jest.fn(() => false);
const mockIsLoadingOlderMessages = jest.fn(() => false);
const mockSetMessages = jest.fn();
const mockMarkThreadRead = jest.fn();
const mockSendMessage = jest.fn();
const mockSendMarkAsRead = jest.fn();
const mockSendActiveChatStatus = jest.fn();

jest.mock("../../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUser }),
}));

jest.mock("../../../context/MessageProvider", () => ({
    useMessages: () => ({
        messages: mockMessagesState,
        setMessages: mockSetMessages,
        fetchConversationMessages: mockFetchConversationMessages,
        fetchOlderMessages: mockFetchOlderMessages,
        hasMoreOlderMessages: mockHasMoreOlderMessages,
        isLoadingOlderMessages: mockIsLoadingOlderMessages,
        markThreadRead: mockMarkThreadRead,
        unreadByUser: mockUnreadByUser,
    }),
}));

jest.mock("../../../context/WebSocketProvider", () => ({
    useWebSocketContext: () => ({
        sendMessage: mockSendMessage,
        sendMarkAsRead: mockSendMarkAsRead,
        sendActiveChatStatus: mockSendActiveChatStatus,
    }),
}));

jest.mock("../useChatViewportHeight", () => () => ({ height: 600, isMobile: false }));

const Chat = require("../Chat").default;

const FRIEND = { id: 2, fullName: "Bob", profilePictureUrl: "" };

function makeUser(overrides = {}) {
    return {
        id: 1,
        fullName: "Alice",
        profilePictureUrl: "",
        friendsList: [FRIEND],
        ...overrides,
    };
}

let container;
let root;

beforeEach(() => {
    jest.clearAllMocks();
    mockUser = makeUser();
    mockUnreadByUser = {};
    mockMessagesState = {};
    window.__xssFired = undefined;
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
    delete window.__xssFired;
});

function renderChat() {
    act(() => {
        root.render(<Chat />);
    });
}

// Selects the (only) friend in the conversation list, mirroring a real
// user opening a thread. Uses the chatscope "cs-conversation" class since
// no assertion/query library (e.g. @testing-library) is available in this
// repo's current dependency set.
function openConversationWithFriend() {
    const conversationEl = container.querySelector(".cs-conversation");
    expect(conversationEl).not.toBeNull();
    act(() => {
        conversationEl.click();
    });
}

// Simulates typing into chatscope's contentEditable composer and pressing
// the send button, the same way a real user (and MessageInput's own event
// wiring) would drive it: mutate the contentEditable DOM node directly,
// then fire the native "input" event React listens for.
function typeIntoComposerAndSend(text) {
    const editable = container.querySelector(".cs-message-input__content-editor");
    expect(editable).not.toBeNull();
    act(() => {
        editable.innerHTML = text;
        editable.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const sendButton = container.querySelector(".cs-button--send");
    expect(sendButton).not.toBeNull();
    expect(sendButton.disabled).toBe(false);
    act(() => {
        sendButton.click();
    });
}

describe("F1 - chat message content renders as plain text, never as HTML", () => {
    test("HTML-like message content is displayed literally, not parsed as markup", () => {
        const payload = '<img data-testid="xss-probe" src="invalid">';
        mockMessagesState = {
            2: [
                {
                    senderId: 2,
                    receiverId: 1,
                    message: payload,
                    sentTime: new Date().toISOString(),
                    isRead: true,
                },
            ],
        };

        renderChat();
        openConversationWithFriend();

        expect(container.querySelector('[data-testid="xss-probe"]')).toBeNull();
        expect(container.querySelector(".cs-message__html-content")).toBeNull();
        expect(container.querySelector(".cs-message__text-content")).not.toBeNull();
        expect(container.textContent).toContain(payload);
    });

    test("no img, script, iframe, svg, or event-handler element is created from message content", () => {
        const payloads = [
            "<img src=x onerror=\"window.__xssFired = 'img'\">",
            "<svg onload=\"window.__xssFired = 'svg'\"></svg>",
            "<script>window.__xssFired = 'script'</script>",
            "<iframe src=\"javascript:window.__xssFired='iframe'\"></iframe>",
        ];
        mockMessagesState = {
            2: payloads.map((message, i) => ({
                senderId: 2,
                receiverId: 1,
                message,
                sentTime: new Date(Date.now() + i).toISOString(),
                isRead: true,
            })),
        };

        renderChat();
        openConversationWithFriend();

        // Scoped to the message content wrapper (.cs-message__content) so
        // this doesn't false-positive on legitimate <img>/<svg> elements
        // elsewhere in the UI (avatars, the conversation search icon, etc).
        expect(
            container.querySelector(
                ".cs-message__content img, .cs-message__content script, .cs-message__content iframe, .cs-message__content svg, .cs-message__content [onerror], .cs-message__content [onload]"
            )
        ).toBeNull();
        expect(window.__xssFired).toBeUndefined();
        payloads.forEach((payload) => {
            expect(container.textContent).toContain(payload);
        });
    });

    test("ordinary text, Hebrew, English and emojis still render correctly", () => {
        const text = "Hello 👋 שלום, how are you? 😀";
        mockMessagesState = {
            2: [
                {
                    senderId: 1,
                    receiverId: 2,
                    message: text,
                    sentTime: new Date().toISOString(),
                    isRead: true,
                },
            ],
        };

        renderChat();
        openConversationWithFriend();

        expect(container.textContent).toContain(text);
        expect(container.querySelector(".cs-message__text-content")).not.toBeNull();
    });

    test("incoming WebSocket-shaped messages (senderId = other user) render through the same safe path", () => {
        const payload = '<img src="x" onerror="window.__xssFired = true">';
        mockMessagesState = {
            2: [
                {
                    senderId: 2, // matches WebSocketHandler.addMessage's shape for a message *from* the peer
                    receiverId: 1,
                    message: payload,
                    sentTime: new Date().toISOString(),
                    isRead: false,
                },
            ],
        };

        renderChat();
        openConversationWithFriend();

        const incomingBubbles = container.querySelectorAll(".cs-message--incoming");
        expect(incomingBubbles.length).toBeGreaterThan(0);
        // Scoped to the message content wrapper - avatars legitimately
        // render <img> tags elsewhere in the same message bubble.
        expect(container.querySelector(".cs-message__content img")).toBeNull();
        expect(container.querySelector(".cs-message__html-content")).toBeNull();
        expect(window.__xssFired).toBeUndefined();
    });

    test("existing chat send behavior remains functional: composing and sending calls sendMessage with the typed text", () => {
        mockMessagesState = { 2: [] };

        renderChat();
        openConversationWithFriend();
        typeIntoComposerAndSend("Hi there");

        expect(mockSendMessage).toHaveBeenCalledTimes(1);
        const sentPayload = mockSendMessage.mock.calls[0][0];
        expect(sentPayload.message).toBe("Hi there");
        expect(sentPayload.senderId).toBe(1);
        expect(sentPayload.receiverId).toBe(2);
    });
});
