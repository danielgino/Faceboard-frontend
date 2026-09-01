import { useCallback, useLayoutEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 720; // matches Tailwind `md` (this project's compiled value via withMT, not the stock 768)
const DESKTOP_HEIGHT = 750;     // unchanged desktop chat height
const MIN_MOBILE_HEIGHT = 320;  // safety floor against transient near-0 reads during layout thrash

/**
 * Height for the chat MainContainer.
 *
 * Desktop (>=720px): always DESKTOP_HEIGHT, identical to the previous
 * hardcoded inline style.
 *
 * Mobile (<720px): tracks window.visualViewport, the only API that reliably
 * reflects the iOS on-screen keyboard shrinking the visible viewport (dvh/vh
 * do not track the keyboard consistently). Available height is computed as
 * "how much of the visible viewport remains below this container's current
 * top edge" so it self-corrects for header clearance without a hardcoded
 * offset, and re-adjusts when the keyboard opens/closes.
 *
 * The container's own CSS height (set via Tailwind calc() in Chat.js) already
 * subtracts the fixed header, the fixed mobile bottom nav, and both safe-area
 * insets — none of that is duplicated here. We just take whichever of the two
 * is smaller: the CSS-resolved height (correct at rest) or the visualViewport-
 * derived height (correct once the keyboard opens and shrinks the viewport).
 */
export default function useChatViewportHeight(containerRef) {
    const [state, setState] = useState({ height: DESKTOP_HEIGHT, isMobile: false });

    const recompute = useCallback(() => {
        const mobile = window.innerWidth < DESKTOP_BREAKPOINT;
        if (!mobile) {
            setState({ height: DESKTOP_HEIGHT, isMobile: false });
            return;
        }

        const vv = window.visualViewport;
        const el = containerRef.current;
        if (!vv || !el) {
            setState({ height: window.innerHeight, isMobile: true });
            return;
        }

        const rect = el.getBoundingClientRect();
        const visibleTop = rect.top - vv.offsetTop;
        const viewportAvailable = vv.height - visibleTop;
        const available = Math.round(Math.min(viewportAvailable, rect.height));

        setState({ height: Math.max(MIN_MOBILE_HEIGHT, available), isMobile: true });
    }, [containerRef]);

    useLayoutEffect(() => {
        recompute();
        const vv = window.visualViewport;

        if (vv) {
            vv.addEventListener("resize", recompute);
            vv.addEventListener("scroll", recompute);
        }
        window.addEventListener("resize", recompute);
        window.addEventListener("orientationchange", recompute);

        return () => {
            if (vv) {
                vv.removeEventListener("resize", recompute);
                vv.removeEventListener("scroll", recompute);
            }
            window.removeEventListener("resize", recompute);
            window.removeEventListener("orientationchange", recompute);
        };
    }, [recompute]);

    return state;
}
