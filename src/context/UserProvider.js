import React, {createContext, useState, useContext, useEffect, useCallback, useRef} from 'react';
import {
    AUTH_ME_API,
    fetchWithAuth,
    GET_USER_DETAILS_BY_ID,
    GET_USER_FRIENDS_PAGE_API,
    GET_USER_IMAGES_API,
    JWT_STORAGE_KEY
} from "../utils/Utils";
import { clearStoredSession } from "../utils/authCleanup";

const UserContext = createContext();

// Demo Mode Gallery: GET /post/{userId}/all-post-images is deliberately excluded from the Demo
// allowlist (unbounded, no per-resource authorization), so this fixed local mapping stands in
// for it with no backend request at all.
//
// Keyed by USERNAME, not id: PublicUserProfileDTO (GET /user/by-id, which identifies the VIEWED
// profile here) has no `demo` field - only UserDTO (GET /auth/me, the session's own account)
// does. username is present on both and DB-unique, so it's the only value that safely
// distinguishes "which Demo profile is this" without a backend change. Each seed username maps
// to that account's own images only - demo_alex/demo_jamie/demo_sam must never inherit
// demo_user's dedicated 8-image set, and vice versa (demo_user's own post image is deliberately
// excluded from her gallery entry).
const DEMO_USERNAME_GALLERY = {
    demo_user: [
        "/demo-assets/gallery/demo-gallery-01.jpg",
        "/demo-assets/gallery/demo-gallery-02.jpg",
        "/demo-assets/gallery/demo-gallery-03.jpg",
        "/demo-assets/gallery/demo-gallery-04.jpg",
        "/demo-assets/gallery/demo-gallery-05.jpg",
        "/demo-assets/gallery/demo-gallery-06.jpg",
        "/demo-assets/gallery/demo-gallery-07.jpg",
        "/demo-assets/gallery/demo-gallery-08.jpg",
    ],
    demo_alex: ["/demo-assets/posts/city-night.png"],
    demo_jamie: ["/demo-assets/posts/coffee-workspace.png", "/demo-assets/posts/travel-street.png"],
    demo_sam: ["/demo-assets/posts/hiking-view.png"],
};

// Single source of truth for "what does this Demo username's gallery contain" - shared by
// fetchUserPostImages below (the profile preview card) AND Album.js (the full "View all" page),
// so the two can never disagree. A username with no entry (shouldn't happen for a Demo session,
// since DemoScope only ever lets one reach the 4 seed profiles) resolves to an empty gallery.
export function getDemoGalleryImages(username) {
    return DEMO_USERNAME_GALLERY[username] ?? [];
}

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [token, setToken] = useState(null);
    const [userImages, setUserImages] = useState([]);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [isOtherUserLoading, setIsOtherUserLoading] = useState(false);
    // Phase 10: identity guards for the "other user" (profile-page) fetches.
    // UserDetails.js's own effect re-calls these whenever otherUserId
    // changes, with no cancellation on the previous in-flight request - so
    // navigating profile A -> profile B before A's request resolves could
    // let A's late response overwrite the shared otherUser/userImages state
    // while the UI is already showing B (the exact class of race Album.js's
    // own local-fetch workaround was written to avoid for its own data -
    // see the comment in pages/Album.js). Each ref tracks which userId its
    // fetch was most recently called for; a response only commits state if
    // it's still the most recent request for that ref.
    const otherUserRequestIdRef = useRef(null);
    const userImagesRequestIdRef = useRef(null);

    const fetchUserDetails = async (token) => {
        try {
            setIsUserLoading(true)
            const response = await fetchWithAuth(AUTH_ME_API, { method: 'GET' });

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const userData = await response.json();
            setUser(userData);

        } catch (err) {
            console.error('Error fetching user details:', err);
        } finally {
            setIsUserLoading(false);

        }
    };

    const updateUserProfilePicture = (newProfilePictureUrl) => {
        setUser(prevUser => ({ ...prevUser, profilePictureUrl: newProfilePictureUrl }));
    };

    // Returns the fetched profile DTO (or null on failure) so a caller can act on the FRESH
    // response directly, instead of the `otherUser` state - which only commits one render later
    // and would otherwise race concurrent updates (e.g. the session's own /auth/me resolving).
    const fetchUserDetailsById = useCallback(async (userId) => {
        otherUserRequestIdRef.current = userId;
        try {
            setIsOtherUserLoading(true);
            const response = await fetchWithAuth(GET_USER_DETAILS_BY_ID(userId));

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const userData = await response.json();
            if (otherUserRequestIdRef.current === userId) {
                setOtherUser(userData);
            }
            return userData;
        } catch (err) {
            console.error('Error fetching other user details:', err);
            return null;
        } finally {
            if (otherUserRequestIdRef.current === userId) {
                setIsOtherUserLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (token) {
            setToken(token);
        }
    }, []);
    useEffect(() => {
        if (token) {
            fetchUserDetails(token);
        }
    }, [token]);

    // `profileUsername` identifies the VIEWED profile - passed explicitly by the caller (the
    // just-fetched DTO, e.g. UserDetails.js using fetchUserDetailsById's return value) rather
    // than read from `otherUser` state here, to avoid the same race fetchUserDetailsById itself
    // avoids above. `user?.demo` (the SESSION's own flag) gates the mapping: a real user browsing
    // to a seed Demo account's public profile must still get its real gallery via the real
    // endpoint, not this local one - DemoScope only restricts Demo sessions, not what a real
    // session can view.
    const fetchUserPostImages = useCallback(async (userId, profileUsername) => {
        userImagesRequestIdRef.current = userId;
        // Demo-owned profile -> served from getDemoGalleryImages with no request at all (the
        // same helper Album.js's "View all" page uses, so the two can never disagree).
        if (user?.demo) {
            setUserImages(getDemoGalleryImages(profileUsername));
            return;
        }
        try {
            const response = await fetchWithAuth(GET_USER_IMAGES_API(userId));
            if (!response.ok) {
                throw new Error("Failed to fetch user images");
            }
            const images = await response.json();
            if (userImagesRequestIdRef.current === userId) {
                setUserImages(images);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    }, [user?.demo]);

    const fetchUserFriendsPage = async ({ userId, page = 0, size = 20, query = '' }) => {
        try {
            const response = await fetchWithAuth(GET_USER_FRIENDS_PAGE_API({ userId, page, size, query }));
            if (!response.ok) {
                throw new Error("Failed to fetch paginated user friends");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching paginated user friends:", error);
            throw error;
        }
    };

    const clearOtherUser = useCallback(() => {
        setOtherUser(null);
    }, []);

    const logout = () => {
        clearStoredSession();
        setUser(null);
        setOtherUser(null);
        setUserImages([]);
        setToken(null);
    };



    // Demo Mode: UserDTO.demo (JSON key "demo", from the Lombok/Jackson isDemo() accessor - see
    // backend dto/UserDTO.java) surfaced as a plain boolean so components can gate UX without
    // reaching into `user` directly. Backend enforcement (DemoAccessFilter) is authoritative
    // regardless of this value - this only drives non-authoritative UI treatment.
    const isDemo = !!user?.demo;

    return (
        <UserContext.Provider value={{ user,logout,isUserLoading, setUser,userImages, isOtherUserLoading
            ,clearOtherUser,fetchUserPostImages , updateUserProfilePicture
            ,otherUser,fetchUserDetails, fetchUserDetailsById,fetchUserFriendsPage, isDemo }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
