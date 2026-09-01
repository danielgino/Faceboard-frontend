import React from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useUser} from "../../context/UserProvider";
import {
    GALLERY_BTN_TEXT,
    ALBUM_PAGE,
    FEED_BTN_TEXT,
    HOME_PAGE,
    PROFILE_BTN_TEXT,
    PROFILE_PAGE,
    SEARCH_PAGE,
    SETTINGS_PAGE
} from "../../utils/Utils";
import Search from "../interaction/Search";
import HeaderBarIcons from "../../Icons/HeaderBarIcons.js"
import SideBarIcons from "../../Icons/SideBarIcons";
import Notification from "../interaction/Notification";
import NavigationItem from "./NavigationItem";
import logoPNG from "../../assets/photos/logo/logoPNG.png";
import {Avatar} from "../common/Avatar";
import {fluid} from "./navFluid";

// Fidelity reconciliation (Navigation micro-pass): rebuilt against the
// Design System's actual Desktop/Mobile Header compositions (#nav) instead
// of a retoned Material Navbar — logo mark + compact nav-item row + search
// pill + avatar-only identity on desktop; logo + avatar + search/settings
// icon buttons on mobile, no nav-item row (BottomNav owns primary nav there).
// Active-route styling stays exact-path match only (not prefix matching), so
// e.g. viewing someone else's profile never highlights "Profile" — that nav
// item only ever targets the signed-in user's own profile page.

 function HeaderBar() {
    const navigate = useNavigate();
    const {user} = useUser();
    const location = useLocation();

    const handleSearchButton = () => {
        navigate(SEARCH_PAGE);
    };

    const handleSettingsButton = () => {
        navigate(SETTINGS_PAGE);
    };

    const isFeedActive = location.pathname === HOME_PAGE;
    const isProfileActive = location.pathname === PROFILE_PAGE(user.id);
    const isGalleryActive = location.pathname === ALBUM_PAGE(user.id);

    return (
        <header className="fixed top-0 left-0 w-full z-[9999] bg-white border-b border-dsNeutral-100 pt-[env(safe-area-inset-top)]">
            <div
                className="max-w-screen-2xl mx-auto flex items-center px-3 py-2 sm:px-4 md:py-2.5"
                style={{ columnGap: fluid(8, 20) }}
            >
                <Link to={HOME_PAGE} className="flex-shrink-0 hidden md:block" aria-label="Faceboard home">
                    <img src={logoPNG} alt="" className="w-auto object-contain" style={{ height: fluid(24, 32) }} />
                </Link>
                <Link to={HOME_PAGE} className="flex-shrink-0 md:hidden" aria-label="Faceboard home">
                    <img src={logoPNG} alt="" className="h-5 w-auto object-contain" />
                </Link>

                <nav aria-label="Primary" className="hidden md:flex items-center" style={{ gap: fluid(4, 8) }}>
                    <NavigationItem to={HOME_PAGE} icon={HeaderBarIcons.Feed} label={FEED_BTN_TEXT} active={isFeedActive} variant="header" />
                    <Notification />
                    <NavigationItem to={PROFILE_PAGE(user.id)} icon={HeaderBarIcons.Profile} label={PROFILE_BTN_TEXT} active={isProfileActive} variant="header" />
                    <NavigationItem to={ALBUM_PAGE(user.id)} icon={HeaderBarIcons.Gallery} label={GALLERY_BTN_TEXT} active={isGalleryActive} variant="header" />
                </nav>

                <div className="flex-1" />

                <div className="hidden md:block" style={{ width: fluid(160, 340), flexShrink: 0 }}>
                    <Search/>
                </div>

                {/* Touch-target fix carried over from Phase D: 40x40px hit
                    area even though the design shows a 36px circle, icon
                    glyphs stay at the design's 16px so nothing looks
                    oversized. */}
                <div className="flex items-center gap-2 md:hidden">
                    <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-dsNeutral-100 text-dsNeutral-600 hover:bg-dsNeutral-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing"
                        onClick={handleSearchButton}
                        aria-label="Search"
                    >
                        <SideBarIcons.Search size={16} />
                    </button>
                    <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-dsNeutral-100 text-dsNeutral-600 hover:bg-dsNeutral-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing"
                        onClick={handleSettingsButton}
                        aria-label="Settings"
                    >
                        <SideBarIcons.Settings size={16} />
                    </button>
                </div>

                <Link to={PROFILE_PAGE(user.id)} className="flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing md:hidden" aria-label={user ? `${user.fullName}'s profile` : "Your profile"}>
                    <Avatar src={user?.profilePictureUrl} name={user?.fullName} alt="" size={34}/>
                </Link>
                <Link to={PROFILE_PAGE(user.id)} className="flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing hidden md:block" aria-label={user ? `${user.fullName}'s profile` : "Your profile"}>
                    <Avatar src={user?.profilePictureUrl} name={user?.fullName} alt="" size={fluid(34, 42)}/>
                </Link>
            </div>
        </header>
    );
 }

export default HeaderBar
