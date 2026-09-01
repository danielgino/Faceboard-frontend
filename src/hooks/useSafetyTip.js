import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWithAuth, SAFETY_TIP_API } from "../utils/Utils";

// TIP-001: real data boundary for the desktop sidebar's "Safety Tip" card,
// backed by GET /safety-tips/random - a curated static pool served from
// SafetyTipService, no Gemini/AI, no external API, no API key. SafetyTip.js
// itself stays pure presentation and is unchanged by this.
//
// requestIdRef follows the same stale-response guard already used in
// useSuggestedFriends: React.StrictMode double-mounts every component in
// development, firing the initial-load effect below twice - only the
// outcome of the most recently *started* request is ever allowed to touch
// state, so an older, slower response can never clobber a newer one.
export function useSafetyTip() {
    const [tip, setTip] = useState(null);
    const [loading, setLoading] = useState(false);
    const requestIdRef = useRef(0);

    const fetchTip = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const response = await fetchWithAuth(SAFETY_TIP_API);
            if (!response.ok) {
                throw new Error("Failed to load a safety tip");
            }
            const data = await response.json();
            if (requestId !== requestIdRef.current) return; // superseded by a newer request - stale, ignore

            if (data.tip) {
                setTip(data.tip);
            }
        } catch (error) {
            // Fail quietly: never surface a raw backend/network error in the
            // Sidebar, and never clear a tip that's already on screen - a
            // failed refresh just leaves the current tip visible (safe to
            // retry via "Another tip" again).
            console.error("Error loading safety tip:", error);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchTip();
    }, [fetchTip]);

    return { tip, loading, onNext: fetchTip };
}

export default useSafetyTip;
