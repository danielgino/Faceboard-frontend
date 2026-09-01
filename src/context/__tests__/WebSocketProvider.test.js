import { render, act } from "@testing-library/react";
import { WebSocketProvider, useWebSocketContext } from "../WebSocketProvider";

// Phase 8D: WebSocketProvider's connect() used to guard purely on
// `clientRef.current` existing, not on WHICH user it belonged to. If the
// authenticated user changed while a client from the previous user was
// still connected, connect() silently no-op'd - the stale client (and its
// stale connectHeaders/identity) lived on, and the new user never got a
// fresh, correctly-authenticated connection. These tests pin down the
// exact Client construct/activate/deactivate counts for every lifecycle
// transition now that identity (not mere existence) drives reconnection.

jest.mock("@stomp/stompjs", () => ({
    Client: jest.fn(),
}));
import { Client } from "@stomp/stompjs";

let mockUser = null;
jest.mock("../UserProvider", () => ({
    useUser: () => ({ user: mockUser }),
}));

let latestCtx = null;
function Consumer() {
    latestCtx = useWebSocketContext();
    return null;
}

function makeInstance(config) {
    let resolveDeactivate;
    const deactivatePromise = new Promise((resolve) => { resolveDeactivate = resolve; });
    return {
        config,
        connected: false,
        activate: jest.fn(),
        deactivate: jest.fn(() => deactivatePromise),
        resolveDeactivate: () => resolveDeactivate(),
        publish: jest.fn(),
    };
}

beforeEach(() => {
    mockUser = null;
    latestCtx = null;
    Client.mockReset();
    Client.mockImplementation((config) => makeInstance(config));
});

test("null -> A: creates and activates exactly one client, authenticated as A", async () => {
    mockUser = { id: 1 };

    await act(async () => {
        render(<WebSocketProvider><Consumer /></WebSocketProvider>);
    });

    expect(Client).toHaveBeenCalledTimes(1);
    const instanceA = Client.mock.results[0].value;
    expect(instanceA.activate).toHaveBeenCalledTimes(1);
    expect(instanceA.deactivate).not.toHaveBeenCalled();
    expect(instanceA.config.connectHeaders.userId).toBe("1");
    expect(latestCtx.clientRef.current).toBe(instanceA);
});

test("A -> same A (unrelated re-render): does not reconnect", async () => {
    mockUser = { id: 1 };
    let rerender;

    await act(async () => {
        const result = render(<WebSocketProvider><Consumer /></WebSocketProvider>);
        rerender = result.rerender;
    });
    const instanceA = Client.mock.results[0].value;
    expect(Client).toHaveBeenCalledTimes(1);

    // A brand-new `user` object with the same id - simulates an unrelated
    // UserProvider re-render (e.g. profile picture update), not a real
    // identity change.
    mockUser = { id: 1 };
    await act(async () => {
        rerender(<WebSocketProvider><Consumer /></WebSocketProvider>);
    });

    expect(Client).toHaveBeenCalledTimes(1);
    expect(instanceA.activate).toHaveBeenCalledTimes(1);
    expect(instanceA.deactivate).not.toHaveBeenCalled();
    expect(latestCtx.clientRef.current).toBe(instanceA);
});

test("A -> B: deactivates A's client and creates+activates a fresh client authenticated as B", async () => {
    mockUser = { id: 1 };
    let rerender;

    await act(async () => {
        const result = render(<WebSocketProvider><Consumer /></WebSocketProvider>);
        rerender = result.rerender;
    });
    const instanceA = Client.mock.results[0].value;
    expect(Client).toHaveBeenCalledTimes(1);

    mockUser = { id: 2 };
    await act(async () => {
        rerender(<WebSocketProvider><Consumer /></WebSocketProvider>);
    });

    expect(instanceA.deactivate).toHaveBeenCalledTimes(1);
    expect(Client).toHaveBeenCalledTimes(2);
    const instanceB = Client.mock.results[1].value;
    expect(instanceB.activate).toHaveBeenCalledTimes(1);
    expect(instanceB.config.connectHeaders.userId).toBe("2");
    expect(latestCtx.clientRef.current).toBe(instanceB);
    expect(latestCtx.clientRef.current).not.toBe(instanceA);
});

test("A -> null (logout): deactivates A's client and creates no replacement", async () => {
    mockUser = { id: 1 };
    let rerender;

    await act(async () => {
        const result = render(<WebSocketProvider><Consumer /></WebSocketProvider>);
        rerender = result.rerender;
    });
    const instanceA = Client.mock.results[0].value;
    expect(Client).toHaveBeenCalledTimes(1);

    mockUser = null;
    await act(async () => {
        rerender(<WebSocketProvider><Consumer /></WebSocketProvider>);
    });

    expect(instanceA.deactivate).toHaveBeenCalledTimes(1);
    expect(Client).toHaveBeenCalledTimes(1);
    expect(latestCtx.clientRef.current).toBeNull();
});

test("a late deactivate on the OLD client cannot clear the ref pointing at the NEW client", async () => {
    mockUser = { id: 1 };
    let rerender;

    await act(async () => {
        const result = render(<WebSocketProvider><Consumer /></WebSocketProvider>);
        rerender = result.rerender;
    });
    const instanceA = Client.mock.results[0].value;

    mockUser = { id: 2 };
    await act(async () => {
        rerender(<WebSocketProvider><Consumer /></WebSocketProvider>);
    });
    const instanceB = Client.mock.results[1].value;

    // Simulate A's deactivate() promise finally settling well after B took
    // over - it must not be able to touch clientRef/connectedUserIdRef.
    await act(async () => {
        instanceA.resolveDeactivate();
        await Promise.resolve();
    });

    expect(latestCtx.clientRef.current).toBe(instanceB);
});

test("connect() called twice for the same identity before onConnect fires still delivers both callbacks exactly once each", async () => {
    mockUser = { id: 1 };

    await act(async () => {
        render(<WebSocketProvider><Consumer /></WebSocketProvider>);
    });
    const instance = Client.mock.results[0].value;

    const first = jest.fn();
    const second = jest.fn();
    act(() => {
        latestCtx.connect(first);
        latestCtx.connect(second);
    });

    // Still only ever one client for this identity.
    expect(Client).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    act(() => {
        instance.connected = true;
        instance.config.onConnect();
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
});
