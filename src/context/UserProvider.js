import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import {AUTH_ME_API, GET_USER_DETAILS_BY_ID, GET_USER_FRIENDS_API, GET_USER_IMAGES_API} from "../utils/Utils";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [token, setToken] = useState(null);
    const [userImages, setUserImages] = useState([]);

    const fetchUserDetails = async (token) => {

        try {

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
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            setToken(token);
        }
    }, []);

    useEffect(() => {
        if (token && !user &&!otherUser) {
            fetchUserDetails(token).catch((error) => {
                console.error("Error fetching user details:", error);
            });
        }
    }, [token, user,otherUser]);


    const fetchUserPostImages = async (userId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) throw new Error("User Not Authenticated");

            const response = await axios.get(GET_USER_IMAGES_API(userId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUserImages(response.data);
        } catch (error) {
            console.error("Error fetching images with Axios:", error);
        }
    };

    const fetchUserFriendsById = async (userId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) throw new Error("User Not Authenticated");

            const response = await axios.get(GET_USER_FRIENDS_API(userId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data; // מחזיר את רשימת החברים
        } catch (error) {
            console.error("Error fetching user friends:", error);
            throw error;
        }
    };
    const clearOtherUser = () => {
        setOtherUser(null);
    };
    return (
        <UserContext.Provider value={{ user, setUser, error,userImages
            ,clearOtherUser,fetchUserPostImages , updateUserProfilePicture
            ,otherUser,fetchUserDetails, fetchUserDetailsById,fetchUserFriendsById }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
