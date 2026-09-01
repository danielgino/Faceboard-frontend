import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserProvider";
import { LOGIN_PAGE } from "../utils/Utils";

// HOOK-001: HeaderBar.js and SideBar.js each implemented an identical manual
// logout handler. Navigates to LOGIN_PAGE first (replace, with forceLogin
// state so RouteGuard's "already authenticated" redirect doesn't interfere
// while the token/user state briefly still exists), and only clears the
// actual session on a deferred setTimeout(0) so the navigation commits
// before UserProvider's state reset triggers a re-render of the
// about-to-unmount protected tree.
export function useLogout() {
    const navigate = useNavigate();
    const { logout } = useUser();

    return () => {
        navigate(LOGIN_PAGE, { replace: true, state: { forceLogin: true } });
        setTimeout(() => {
            logout();
        }, 0);
    };
}
