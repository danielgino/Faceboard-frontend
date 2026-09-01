import { useCallback, useEffect, useRef } from "react";

// HOOK-004: Search.js declared this locally; Friends.js implemented an
// equivalent setTimeout-based debounce inline via its own effect. Shared
// here so both go through the same debounce mechanics. `delay` stays a
// parameter (not a shared constant) since each caller intentionally passes
// its own value. The unmount-cleanup effect is new relative to Search.js's
// original local version (which had none) - a pure safety addition, not a
// behavior removal - and is what lets Friends.js's existing "cancel the
// pending debounce on unmount" guarantee carry over unchanged.
//
// `callback`/`delay` are tracked via refs rather than captured directly so
// the returned function can have a stable identity (useCallback with an
// empty dep array) without going stale: every invocation reads the latest
// callback/delay through the ref, not whatever was passed on the render
// that produced the returned function.
export function useDebouncedCallback(callback, delay) {
    const timer = useRef();
    const callbackRef = useRef(callback);
    const delayRef = useRef(delay);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        delayRef.current = delay;
    }, [delay]);

    useEffect(() => {
        return () => clearTimeout(timer.current);
    }, []);

    return useCallback((...args) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delayRef.current);
    }, []);
}
