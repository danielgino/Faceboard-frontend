import React from "react";
import { render } from "@testing-library/react";

// SEC-001 regression suite: WebSocketHandler previously subscribed to three
// STOMP topics inside connect()'s onConnect callback but never unsubscribed
// them - neither on unmount nor when the effect re-ran for a different
// user?.id, and a late-resolving onConnect (the STOMP handshake is async)
// could subscribe on behalf of an effect run that had already been cleaned
// up. The fix tracks the subscription objects returned by client.subscribe()
// and unsubscribes them on effect cleanup, guarded by a `disposed` flag.

jest.mock("@material-tailwind/react", () => ({
    Avatar: () => null,
}));

let mockUserId;
jest.mock("../../context/UserProvider", () => ({
    useUser: () => ({ user: mockUserId ? { id: mockUserId } : null }),
}));

jest.mock("../../context/MessageProvider", () => ({
    useMessages: () => ({ addMessage: jest.fn(), setMessages: jest.fn() }),
}));

jest.mock("../../context/NotificationProvider", () => ({
    useNotifications: () => ({ addNotification: jest.fn() }),
}));

let capturedOnConnect;
const mockConnect = jest.fn();
const mockClientRef = { current: null };
jest.mock("../../context/WebSocketProvider", () => ({
    useWebSocketContext: () => ({
        clientRef: mockClientRef,
        connect: (...args) => mockConnect(...args),
    }),
}));

const WebSocketHandler = require("../WebSocketHandler").default;

function makeClient() {
    const subscriptions = [];
    return {
        subscribe: jest.fn((destination) => {
            const sub = { unsubscribe: jest.fn() };
            subscriptions.push({ destination, sub });
            return sub;
        }),
        _subscriptions: subscriptions,
    };
}

beforeEach(() => {
    // react-scripts' default Jest config sets resetMocks: true, which wipes
    // any implementation given to jest.fn(impl) before every test - including
    // ones baked in at module scope inside a jest.mock() factory. The
    // implementation has to be (re-)established here, after that reset, via
    // mockImplementation - not passed to jest.fn() directly.
    capturedOnConnect = undefined;
    mockConnect.mockImplementation((onConnect) => {
        capturedOnConnect = onConnect;
    });
    mockClientRef.current = makeClient();
});

test("unmounting unsubscribes every STOMP subscription created by this component", () => {
    mockUserId = 1;
    const { unmount } = render(<WebSocketHandler />);
    capturedOnConnect();

    const client = mockClientRef.current;
    expect(client.subscribe).toHaveBeenCalledTimes(3);
    const subs = client._subscriptions.map(({ sub }) => sub);
    subs.forEach((sub) => expect(sub.unsubscribe).not.toHaveBeenCalled());

    unmount();

    subs.forEach((sub) => expect(sub.unsubscribe).toHaveBeenCalledTimes(1));
});

test("switching users unsubscribes the old user's topics and subscribes the new user's topics", () => {
    mockUserId = 1;
    const { rerender } = render(<WebSocketHandler />);
    capturedOnConnect();

    const client = mockClientRef.current;
    const userASubs = client._subscriptions.map(({ sub }) => sub);
    const userATopics = client._subscriptions.map(({ destination }) => destination);
    expect(userATopics.every((topic) => topic.endsWith("/1"))).toBe(true);

    mockUserId = 2;
    rerender(<WebSocketHandler />);

    // Effect cleanup for user 1 runs synchronously as part of the re-render.
    userASubs.forEach((sub) => expect(sub.unsubscribe).toHaveBeenCalledTimes(1));

    // capturedOnConnect now holds the callback registered for user 2.
    capturedOnConnect();
    const newSubs = client._subscriptions.slice(3);
    expect(newSubs).toHaveLength(3);
    expect(newSubs.every(({ destination }) => destination.endsWith("/2"))).toBe(true);
    newSubs.forEach(({ sub }) => expect(sub.unsubscribe).not.toHaveBeenCalled());
});

test("a connect() callback that resolves after cleanup does not create stale subscriptions", () => {
    mockUserId = 1;
    const { unmount } = render(<WebSocketHandler />);
    // Simulate the STOMP handshake still being in flight when cleanup runs.
    const lateOnConnect = capturedOnConnect;

    unmount();

    // The async connect callback finally resolves after the component (and
    // its effect) is already gone.
    lateOnConnect();

    expect(mockClientRef.current.subscribe).not.toHaveBeenCalled();
});
