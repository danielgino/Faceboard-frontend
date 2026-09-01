import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";

// EFFECT-003 regression suite: Chat.js previously sent sendActiveChatStatus
// and sendMarkAsRead both imperatively (from handleSelectUser) AND reactively
// (from the currentUser-keyed effect that setCurrentUser(...) triggers),
// producing two identical STOMP sends per transition. A second effect keyed
// off location.pathname also duplicated the first effect's unmount cleanup,
// since /chat is a static route (location.pathname never changes while Chat
// stays mounted) - so unmount fired the "leave" signal twice too. The fix
// makes the currentUser effect the sole owner of both events for every
// currentUser transition (select, handleBack, unmount) and removes the
// second, always-redundant effect.

// Same querySelector patch as ChatMessageRendering.test.js - chatscope's
// <MessageList> auto-scroll lookup uses a selector jsdom's nwsapi throws on;
// unrelated to what's under test here.
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

const FRIEND_A = { id: 2, fullName: "Bob", profilePictureUrl: "" };
const FRIEND_B = { id: 3, fullName: "Carol", profilePictureUrl: "" };

let container;
let root;

beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 1, fullName: "Alice", profilePictureUrl: "", friendsList: [FRIEND_A, FRIEND_B] };
    // Pre-populated (rather than empty) so handleSelectUser's
    // `if (!messages[selectedUser.id]) await fetchConversationMessages(...)`
    // branch is skipped - keeping handleSelectUser fully synchronous so the
    // sync act() in openConversationAt actually captures its state updates,
    // mirroring the existing convention in ChatMessageRendering.test.js.
    mockMessagesState = { [FRIEND_A.id]: [], [FRIEND_B.id]: [] };
    mockUnreadByUser = {};
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
});

afterEach(() => {
    if (root) {
        act(() => {
            root.unmount();
        });
    }
    container.remove();
    container = null;
    root = null;
});

function renderChat() {
    act(() => {
        root.render(<Chat />);
    });
}

function openConversationAt(index) {
    const conversationEls = container.querySelectorAll(".cs-conversation");
    expect(conversationEls.length).toBeGreaterThan(index);
    act(() => {
        conversationEls[index].click();
    });
}

test("selecting the first conversation sends enter-status and mark-as-read once each, with no spurious leave signal first", () => {
    renderChat();
    openConversationAt(0);

    const leaveCalls = mockSendActiveChatStatus.mock.calls.filter(([, chattingWith]) => chattingWith === null);
    const enterCalls = mockSendActiveChatStatus.mock.calls.filter(([, chattingWith]) => chattingWith === FRIEND_A.id);
    expect(leaveCalls).toHaveLength(0);
    expect(enterCalls).toHaveLength(1);
    expect(mockSendMarkAsRead).toHaveBeenCalledTimes(1);
    expect(mockSendMarkAsRead).toHaveBeenCalledWith(FRIEND_A.id, mockUser.id);
});

test("switching conversations sends exactly one leave, one enter, and one mark-as-read for the new conversation", () => {
    renderChat();
    openConversationAt(0);
    mockSendActiveChatStatus.mockClear();
    mockSendMarkAsRead.mockClear();

    openConversationAt(1);

    const leaveCalls = mockSendActiveChatStatus.mock.calls.filter(([, chattingWith]) => chattingWith === null);
    const enterBCalls = mockSendActiveChatStatus.mock.calls.filter(([, chattingWith]) => chattingWith === FRIEND_B.id);
    expect(leaveCalls).toHaveLength(1);
    expect(enterBCalls).toHaveLength(1);
    expect(mockSendMarkAsRead).toHaveBeenCalledTimes(1);
    expect(mockSendMarkAsRead).toHaveBeenCalledWith(FRIEND_B.id, mockUser.id);
});

test("unmounting while a conversation is open sends exactly one leave (active=null) event", () => {
    renderChat();
    openConversationAt(0);
    mockSendActiveChatStatus.mockClear();

    act(() => {
        root.unmount();
    });
    root = null; // already unmounted here - afterEach's guard skips a second unmount

    const leaveCalls = mockSendActiveChatStatus.mock.calls.filter(([, chattingWith]) => chattingWith === null);
    expect(leaveCalls).toHaveLength(1);
});

test("unmounting with no conversation ever selected sends no leave signal", () => {
    renderChat();

    act(() => {
        root.unmount();
    });
    root = null; // already unmounted here - afterEach's guard skips a second unmount

    expect(mockSendActiveChatStatus).not.toHaveBeenCalled();
});
