import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

// HOOK-003: Notification.js and SearchPage.js each implemented an identical
// "viewport narrower than 768px" listener (check on mount, update on
// resize, clean up on unmount). MobileNotifications.js's resize handling is
// a different concept (redirecting away from a mobile-only page once the
// viewport crosses the breakpoint, not exposing an isMobile render flag) and
// intentionally does not use this hook.
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    return isMobile;
}
