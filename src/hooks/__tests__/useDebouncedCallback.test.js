import { renderHook, act } from "@testing-library/react";
import { useDebouncedCallback } from "../useDebouncedCallback";

jest.useFakeTimers();

describe("useDebouncedCallback", () => {
    it("returns a referentially stable function across re-renders", () => {
        const { result, rerender } = renderHook(
            ({ cb, delay }) => useDebouncedCallback(cb, delay),
            { initialProps: { cb: () => {}, delay: 300 } }
        );

        const first = result.current;
        rerender({ cb: () => {}, delay: 300 });
        const second = result.current;

        expect(first).toBe(second);
    });

    it("invokes the latest callback after the delay, not a stale one", () => {
        const firstCallback = jest.fn();
        const secondCallback = jest.fn();

        const { result, rerender } = renderHook(
            ({ cb, delay }) => useDebouncedCallback(cb, delay),
            { initialProps: { cb: firstCallback, delay: 300 } }
        );

        rerender({ cb: secondCallback, delay: 300 });

        act(() => {
            result.current("value");
        });

        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(firstCallback).not.toHaveBeenCalled();
        expect(secondCallback).toHaveBeenCalledWith("value");
    });

    it("cancels a pending call when invoked again before the delay elapses", () => {
        const callback = jest.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        act(() => {
            result.current("a");
        });
        act(() => {
            jest.advanceTimersByTime(200);
        });
        act(() => {
            result.current("b");
        });
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("b");
    });

    it("clears the pending timer on unmount", () => {
        const callback = jest.fn();
        const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300));

        act(() => {
            result.current("value");
        });
        unmount();
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(callback).not.toHaveBeenCalled();
    });
});
