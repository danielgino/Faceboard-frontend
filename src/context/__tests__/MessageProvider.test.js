import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MessageProvider, useMessages } from "../MessageProvider";

// Chat pagination follow-up: MessageProvider.fetchOlderMessages fetches the next older page
// (backend already supports page/size - see BACKEND_DEEP_AUDIT.md M-DB2), prepends it before
// the already-loaded messages, de-duplicates by id, and stops once a page comes back smaller
// than MESSAGES_PAGE_SIZE. These tests pin down exactly that contract.

let mockUser = { id: 1 };
jest.mock("../UserProvider", () => ({
    useUser: () => ({ user: mockUser }),
}));

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    ...jest.requireActual("../../utils/Utils"),
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));

const PEER_ID = 2;

function makeMessage(id) {
    return {
        id,
        message: `msg-${id}`,
        sentTime: `2024-01-01T00:00:${String(id).padStart(2, "0")}Z`,
        senderId: PEER_ID,
        receiverId: 1,
        isRead: true,
    };
}

function makeBatch(ids) {
    return ids.map(makeMessage);
}

let conversationResponses;

function queueConversationResponse(batch) {
    conversationResponses.push(batch);
}

function Consumer() {
    const {
        messages,
        fetchConversationMessages,
        fetchOlderMessages,
        hasMoreOlderMessages,
        isLoadingOlderMessages,
    } = useMessages();
    const peerMessages = messages[PEER_ID] || [];

    return (
        <div>
            <div data-testid="ids">{peerMessages.map((m) => m.id).join(",")}</div>
            <div data-testid="hasMore">{String(hasMoreOlderMessages(PEER_ID))}</div>
            <div data-testid="loading">{String(isLoadingOlderMessages(PEER_ID))}</div>
            <button onClick={() => fetchConversationMessages(1, PEER_ID)}>initial</button>
            <button onClick={() => fetchOlderMessages(1, PEER_ID)}>older</button>
        </div>
    );
}

beforeEach(() => {
    mockUser = { id: 1 };
    conversationResponses = [];
    mockFetchWithAuth.mockReset();
    mockFetchWithAuth.mockImplementation(async (url) => {
        if (url.includes("unread-summary")) {
            return { ok: true, json: async () => ({}) };
        }
        const next = conversationResponses.shift() || [];
        return { ok: true, json: async () => next };
    });
});

test("initial load with a full page reports hasMore=true", async () => {
    queueConversationResponse(makeBatch(Array.from({ length: 50 }, (_, i) => i + 51))); // ids 51..100

    render(
        <MessageProvider>
            <Consumer />
        </MessageProvider>
    );
    await act(async () => {
        fireEvent.click(screen.getByText("initial"));
    });

    expect(screen.getByTestId("hasMore").textContent).toBe("true");
});

test("initial load smaller than a full page reports hasMore=false", async () => {
    queueConversationResponse(makeBatch([98, 99, 100]));

    render(
        <MessageProvider>
            <Consumer />
        </MessageProvider>
    );
    await act(async () => {
        fireEvent.click(screen.getByText("initial"));
    });

    expect(screen.getByTestId("hasMore").textContent).toBe("false");
});

test("fetchOlderMessages prepends the older page before existing messages, preserving order, and de-duplicates overlapping ids", async () => {
    // Initial batch must be a full page (hasMore=true) for fetchOlderMessages to proceed at all.
    const initialIds = Array.from({ length: 50 }, (_, i) => i + 51); // 51..100
    queueConversationResponse(makeBatch(initialIds));
    // Older page: includes id 51 again (defensive overlap) which must be filtered out.
    queueConversationResponse(makeBatch([49, 50, 51]));

    render(
        <MessageProvider>
            <Consumer />
        </MessageProvider>
    );
    await act(async () => {
        fireEvent.click(screen.getByText("initial"));
    });
    expect(screen.getByTestId("ids").textContent).toBe(initialIds.join(","));

    await act(async () => {
        fireEvent.click(screen.getByText("older"));
    });

    // Older messages prepended, chronological order preserved end-to-end, no duplicate 51.
    expect(screen.getByTestId("ids").textContent).toBe(["49", "50", ...initialIds].join(","));
});

test("stops requesting once a returned page is smaller than the page size", async () => {
    queueConversationResponse(makeBatch(Array.from({ length: 50 }, (_, i) => i + 51))); // full initial page
    queueConversationResponse(makeBatch([1, 2])); // older page, short -> exhausted

    render(
        <MessageProvider>
            <Consumer />
        </MessageProvider>
    );
    await act(async () => {
        fireEvent.click(screen.getByText("initial"));
    });
    expect(screen.getByTestId("hasMore").textContent).toBe("true");

    await act(async () => {
        fireEvent.click(screen.getByText("older"));
    });
    expect(screen.getByTestId("hasMore").textContent).toBe("false");

    const callsBeforeExtraClick = mockFetchWithAuth.mock.calls.length;
    await act(async () => {
        fireEvent.click(screen.getByText("older"));
    });

    // hasMore is false, so clicking "older" again must not issue another request.
    expect(mockFetchWithAuth.mock.calls.length).toBe(callsBeforeExtraClick);
});

test("does not issue a second overlapping request while one is already in flight", async () => {
    queueConversationResponse(makeBatch(Array.from({ length: 50 }, (_, i) => i + 51)));

    let resolveOlderFetch;
    const olderFetchPromise = new Promise((resolve) => {
        resolveOlderFetch = resolve;
    });

    render(
        <MessageProvider>
            <Consumer />
        </MessageProvider>
    );
    await act(async () => {
        fireEvent.click(screen.getByText("initial"));
    });

    // Swap the mock so the *next* call (the older-page fetch) hangs until we resolve it,
    // simulating a slow network response the user could plausibly scroll-trigger twice for.
    mockFetchWithAuth.mockImplementationOnce(() => olderFetchPromise);

    const callsBeforeOlderClicks = mockFetchWithAuth.mock.calls.length;
    act(() => {
        fireEvent.click(screen.getByText("older"));
        fireEvent.click(screen.getByText("older"));
    });

    expect(screen.getByTestId("loading").textContent).toBe("true");
    // Only one new request should have gone out despite two rapid triggers.
    expect(mockFetchWithAuth.mock.calls.length).toBe(callsBeforeOlderClicks + 1);

    await act(async () => {
        resolveOlderFetch({ ok: true, json: async () => makeBatch([49, 50]) });
        await olderFetchPromise;
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
});
