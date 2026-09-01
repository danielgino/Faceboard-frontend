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
        } catch (err) {
            console.error('Error fetching other user details:', err);
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

    const fetchUserPostImages = useCallback(async (userId) => {
        userImagesRequestIdRef.current = userId;
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
    }, []);

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



    return (
        <UserContext.Provider value={{ user,logout,isUserLoading, setUser,userImages, isOtherUserLoading
            ,clearOtherUser,fetchUserPostImages , updateUserProfilePicture
            ,otherUser,fetchUserDetails, fetchUserDetailsById,fetchUserFriendsPage }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
