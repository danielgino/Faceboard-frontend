import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { NotificationProvider, useNotifications } from "../NotificationProvider";
import { JWT_STORAGE_KEY } from "../../utils/Utils";

// Notification pagination follow-up: NotificationProvider.fetchMoreNotifications now requests
// real backend pages (page 1, 2, ...) instead of the old client-side re-slicing of a single,
// already-fully-fetched batch. These tests pin down the same contract already proven for chat
// pagination: initial load = page 0, de-duplicated appends, and stop-when-exhausted.

let mockUser = { id: 1 };
jest.mock("../UserProvider", () => ({
    useUser: () => ({ user: mockUser }),
}));

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    ...jest.requireActual("../../utils/Utils"),
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
}));

function makeNotification(id) {
    return { id, type: "LIKE", content: `notif-${id}`, read: false, createdAt: "2024-01-01T00:00:00Z" };
}

function makeBatch(ids) {
    return ids.map(makeNotification);
}

let notificationResponses;

function queueNotificationResponse(batch) {
    notificationResponses.push(batch);
}

function Consumer() {
    const { notifications, fetchMoreNotifications, hasMoreNotifications, loadingMoreNotifications } =
        useNotifications();

    return (
        <div>
            <div data-testid="ids">{notifications.map((n) => n.id).join(",")}</div>
            <div data-testid="hasMore">{String(hasMoreNotifications)}</div>
            <div data-testid="loading">{String(loadingMoreNotifications)}</div>
            <button onClick={() => fetchMoreNotifications()}>more</button>
        </div>
    );
}

beforeEach(() => {
    mockUser = { id: 1 };
    notificationResponses = [];
    // fetchNotifications/fetchMoreNotifications both fail fast with "User Not Authenticated!"
    // when no token is present - matching real logged-in behavior so the fetch path under test
    // actually runs.
    localStorage.setItem(JWT_STORAGE_KEY, "test-token");
    mockFetchWithAuth.mockReset();
    mockFetchWithAuth.mockImplementation(async (url) => {
        if (url.includes("unread-count")) {
            return { ok: true, json: async () => 0 };
        }
        const next = notificationResponses.shift() || [];
        return { ok: true, json: async () => next };
    });
});

test("a full initial page reports hasMore=true", async () => {
    queueNotificationResponse(makeBatch(Array.from({ length: 50 }, (_, i) => i + 1)));

    await act(async () => {
        render(
            <NotificationProvider>
                <Consumer />
            </NotificationProvider>
        );
    });

    expect(screen.getByTestId("hasMore").textContent).toBe("true");
    expect(screen.getByTestId("ids").textContent.split(",")).toHaveLength(50);
});

test("a short initial page reports hasMore=false", async () => {
    queueNotificationResponse(makeBatch([1, 2, 3]));

    await act(async () => {
        render(
            <NotificationProvider>
                <Consumer />
            </NotificationProvider>
        );
    });

    expect(screen.getByTestId("hasMore").textContent).toBe("false");
});

test("fetchMoreNotifications appends the next page, de-duplicated by id, and stops once exhausted", async () => {
    queueNotificationResponse(makeBatch(Array.from({ length: 50 }, (_, i) => i + 1))); // page 0
    queueNotificationResponse(makeBatch([50, 51, 52])); // page 1: id 50 overlaps -> must dedupe

    await act(async () => {
        render(
            <NotificationProvider>
                <Consumer />
            </NotificationProvider>
        );
    });
    expect(screen.getByTestId("hasMore").textContent).toBe("true");

    await act(async () => {
        fireEvent.click(screen.getByText("more"));
    });

    const ids = screen.getByTestId("ids").textContent.split(",").map(Number);
    expect(ids).toHaveLength(52); // 50 + (51, 52) - the duplicate 50 was filtered out
    expect(ids.filter((id) => id === 50)).toHaveLength(1);
    // Page 1 was short (3 < 50) -> exhausted.
    expect(screen.getByTestId("hasMore").textContent).toBe("false");

    const callsBeforeExtraClick = mockFetchWithAuth.mock.calls.length;
    await act(async () => {
        fireEvent.click(screen.getByText("more"));
    });
    expect(mockFetchWithAuth.mock.calls.length).toBe(callsBeforeExtraClick);
});

test("does not issue a second overlapping request while one is already in flight", async () => {
    queueNotificationResponse(makeBatch(Array.from({ length: 50 }, (_, i) => i + 1)));

    await act(async () => {
        render(
            <NotificationProvider>
                <Consumer />
            </NotificationProvider>
        );
    });

    let resolveMoreFetch;
    const moreFetchPromise = new Promise((resolve) => {
        resolveMoreFetch = resolve;
    });
    mockFetchWithAuth.mockImplementationOnce(() => moreFetchPromise);

    const callsBeforeClicks = mockFetchWithAuth.mock.calls.length;
    act(() => {
        fireEvent.click(screen.getByText("more"));
        fireEvent.click(screen.getByText("more"));
    });

    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(mockFetchWithAuth.mock.calls.length).toBe(callsBeforeClicks + 1);

    await act(async () => {
        resolveMoreFetch({ ok: true, json: async () => makeBatch([51, 52]) });
        await moreFetchPromise;
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
});
