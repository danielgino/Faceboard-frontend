import React, {createContext, useState, useContext, useEffect, useCallback} from 'react';
import axios from 'axios';
import {
    AUTH_ME_API,
    GET_USER_DETAILS_BY_ID,
    GET_USER_FRIENDS_API,
    GET_USER_IMAGES_API,
    LOGIN_PAGE
} from "../utils/Utils";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [token, setToken] = useState(null);
    const [userImages, setUserImages] = useState([]);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [isOtherUserLoading, setIsOtherUserLoading] = useState(false);

    const fetchUserDetails = async (token) => {
        try {
            setIsUserLoading(true)
            const response = await fetch(AUTH_ME_API, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const userData = await response.json();
            setUser(userData);

        } catch (err) {
            console.error('Error fetching user details:', err);
            setError('Error fetching user details');
        } finally {
            setIsUserLoading(false);

        }
    };

    const updateUserProfilePicture = (newProfilePictureUrl) => {
        console.log("🔄 Updating user profile picture in context:", newProfilePictureUrl);
        setUser(prevUser => ({ ...prevUser, profilePictureUrl: newProfilePictureUrl }));
    };

    const fetchUserDetailsById = async (userId) => {
        try {
            const token = localStorage.getItem("jwtToken");

            const response = await fetch(GET_USER_DETAILS_BY_ID(userId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const userData = await response.json();
            setOtherUser(userData);
        } catch (err) {
            console.error('Error fetching other user details:', err);
            setError('Error fetching other user details');
        } finally {
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            setToken(token);
        }
    }, []);
    useEffect(() => {
        if (token) {
            fetchUserDetails(token);
        }
    }, [token]);

    useEffect(() => {
        const interceptorId = axios.interceptors.response.use(null, (error) => {
            const status = error.response?.status;
            if ((status === 401 || status === 403) && window.location.pathname !== LOGIN_PAGE) {
                localStorage.removeItem("jwtToken");
                setUser(null);
                setOtherUser(null);
                setUserImages([]);
                setToken(null);
                window.location.replace(LOGIN_PAGE);
            }
            return Promise.reject(error);
        });
        return () => axios.interceptors.response.eject(interceptorId);
    }, []);

    const fetchUserPostImages = useCallback(async (userId) => {
          try {
                 const token = localStorage.getItem("jwtToken");
                 if (!token) throw new Error("User Not Authenticated");

                     const response = await axios.get(GET_USER_IMAGES_API(userId), {
                        headers: { Authorization: `Bearer ${token}` },
                  });

                      setUserImages(response.data);
          } catch (error) {
            console.error("Error fetching images with Axios:", error);
                }
         }, []);

    const fetchUserFriendsById = async (userId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) throw new Error("User Not Authenticated");

            const response = await axios.get(GET_USER_FRIENDS_API(userId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error("Error fetching user friends:", error);
            throw error;
        }
    };
    const clearOtherUser = () => {
        setOtherUser(null);
    };

    const logout = () => {
        localStorage.removeItem("jwtToken");
        setUser(null);
        setOtherUser(null);
        setUserImages([]);
        setToken(null);
    };



    return (
        <UserContext.Provider value={{ user,logout,isUserLoading, setUser, error,userImages, isOtherUserLoading
            ,clearOtherUser,fetchUserPostImages , updateUserProfilePicture
            ,otherUser,fetchUserDetails, fetchUserDetailsById,fetchUserFriendsById }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
