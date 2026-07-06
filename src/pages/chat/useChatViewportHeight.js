import { useCallback, useLayoutEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 768; // matches Tailwind `md`
const DESKTOP_HEIGHT = 750;     // unchanged desktop chat height
const MIN_MOBILE_HEIGHT = 320;  // safety floor against transient near-0 reads during layout thrash

/**
 * Height for the chat MainContainer.
 *
 * Desktop (>=768px): always DESKTOP_HEIGHT, identical to the previous
 * hardcoded inline style.
 *
 * Mobile (<768px): tracks window.visualViewport, the only API that reliably
 * reflects the iOS on-screen keyboard shrinking the visible viewport (dvh/vh
 * do not track the keyboard consistently). Available height is computed as
 * "how much of the visible viewport remains below this container's current
 * top edge" so it self-corrects for header clearance without a hardcoded
 * offset, and re-adjusts when the keyboard opens/closes.
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

        const rectTop = el.getBoundingClientRect().top;
        const visibleTop = rectTop - vv.offsetTop;
        const available = Math.round(vv.height - visibleTop);

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
