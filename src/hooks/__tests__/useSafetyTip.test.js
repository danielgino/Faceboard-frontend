import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";

// TIP-001: useSafetyTip calls the real GET /safety-tips/random endpoint (a
// curated static pool server-side, no Gemini/AI). These tests cover the
// contract SafetyTip.js/SideBar.js depend on: initial load, "Another tip"
// replacing the displayed tip, a failed request preserving the current tip,
// and the same requestIdRef stale-response guard already used in
// useSuggestedFriends.

const mockFetchWithAuth = jest.fn();
jest.mock("../../utils/Utils", () => ({
    fetchWithAuth: (...args) => mockFetchWithAuth(...args),
    SAFETY_TIP_API: "/api/safety-tips/random",
}));

const useSafetyTip = require("../useSafetyTip").default;

function mockTipResponse(tip) {
    return { ok: true, json: async () => ({ tip }) };
}

beforeEach(() => {
    mockFetchWithAuth.mockReset();
});

test("initial load fetches one tip", async () => {
    mockFetchWithAuth.mockResolvedValue(mockTipResponse("Use a strong, unique password."));

    const { result } = renderHook(() => useSafetyTip());

    await waitFor(() => expect(result.current.tip).toBe("Use a strong, unique password."));
    expect(mockFetchWithAuth).toHaveBeenCalledWith("/api/safety-tips/random");
});

test("clicking 'Another tip' (onNext) replaces the displayed tip", async () => {
    mockFetchWithAuth.mockResolvedValueOnce(mockTipResponse("Tip one."));

    const { result } = renderHook(() => useSafetyTip());
    await waitFor(() => expect(result.current.tip).toBe("Tip one."));

    mockFetchWithAuth.mockResolvedValueOnce(mockTipResponse("Tip two."));

    await act(async () => {
        await result.current.onNext();
    });

    expect(result.current.tip).toBe("Tip two.");
    expect(mockFetchWithAuth).toHaveBeenCalledTimes(2);
});

test("a failed 'Another tip' request keeps the current tip instead of clearing the card", async () => {
    mockFetchWithAuth.mockResolvedValueOnce(mockTipResponse("Still here."));

    const { result } = renderHook(() => useSafetyTip());
    await waitFor(() => expect(result.current.tip).toBe("Still here."));

    mockFetchWithAuth.mockResolvedValueOnce({ ok: false });

    await act(async () => {
        await result.current.onNext();
    });

    expect(result.current.tip).toBe("Still here.");
    expect(result.current.loading).toBe(false);
});

test("a failed initial load leaves tip null (renders nothing) without throwing", async () => {
    mockFetchWithAuth.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useSafetyTip());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tip).toBeNull();
});

// RACE-001-style guard, same pattern as useSuggestedFriends: React.StrictMode
// double-mounts every component in development, firing the initial-load
// effect twice. The stale (first-started) response arriving after the newer
// one already succeeded must not overwrite it.
test("StrictMode's duplicate initial-load request does not overwrite the newer tip", async () => {
    let resolveFirstCall;
    let resolveSecondCall;
    const responses = [
        new Promise((resolve) => { resolveFirstCall = resolve; }),
        new Promise((resolve) => { resolveSecondCall = resolve; }),
    ];
    let callIndex = 0;
    mockFetchWithAuth.mockImplementation(() => responses[callIndex++]);

    const { result } = renderHook(() => useSafetyTip(), { wrapper: React.StrictMode });

    await waitFor(() => expect(mockFetchWithAuth).toHaveBeenCalledTimes(2));

    // The second (most recently started) request resolves first.
    await act(async () => {
        resolveSecondCall(mockTipResponse("Newer tip."));
    });
    await waitFor(() => expect(result.current.tip).toBe("Newer tip."));

    // The now-stale first request resolves afterward with a different tip -
    // must be ignored.
    await act(async () => {
        resolveFirstCall(mockTipResponse("Stale tip."));
    });

    expect(result.current.tip).toBe("Newer tip.");
});
