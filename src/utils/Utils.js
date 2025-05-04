import {Route} from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import SignUp from "../pages/SignUp";

import { useNavigate } from "react-router-dom";
import React, {useState} from "react";
export const useNavigateToProfile = () => {
    const navigate = useNavigate();

    return (userId) => {
        navigate(PROFILE_PAGE(userId));
    };
};

export const getRandomUsers = (users, count) => {
    if (!users || users.length === 0) return [];
    const shuffled = [...users].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
export const getRandomPictures = (images, count) => {
    if (!images || images.length === 0) return [];
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};




export const getAge = (birthDateStr) => {
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const formatDate = (utcTime) => {
    const now = new Date();
    const date = new Date(utcTime);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const isLastYear = now.getFullYear() !== date.getFullYear();

    if (diffInMs < 1000 * 60) {
        return "Just now";
    } else if (diffInMs < 1000 * 60 * 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInMs < 1000 * 60 * 60 * 24) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    if (isLastYear) {
        return date.toLocaleDateString('he-IL', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

    if (diffInDays === 1) {
        return "Yesterday";
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else if (diffInDays < 14) {
        return "A week ago";
    } else if (diffInDays < 21) {
        return "2 weeks ago";
    } else if (diffInDays < 30) {
        return "3 weeks ago";
    } else if (diffInDays < 60) {
        return "A month ago";
    } else {
        return date.toLocaleDateString('he-IL', {
            day: '2-digit',
            month: 'long',
        });
    }
};
export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("jwtToken");

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    return response;
};
// export const formatTime = (utcTime) => {
//     const date = new Date(utcTime + "Z"); // הוספת Z מכריחה אותו לפרש כ־UTC
//     return date.toLocaleTimeString("he-IL", {
//         timeZone: "Asia/Jerusalem",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false
//     });
// };
export const formatTime = (utcTime) => {
    const date = new Date(utcTime.includes("Z") ? utcTime : utcTime + "Z");
    return date.toLocaleTimeString("he-IL", {
        timeZone: "Asia/Jerusalem",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};
export const isMobile = window.innerWidth < 768;


export const LOGIN_PAGE="/"
export const SIGNUP_PAGE="/signup"
export const HOME_PAGE="/home"
export const SEARCH_PAGE="/search-page"
export const CHAT_PAGE="/chat"
export const SETTINGS_PAGE="/settings"
export const ALBUM_PAGE_LINK="/album/:userId"
export const FRIENDS_PAGE_LINK="/friends/:userId"
export const PROFILE_PAGE_LINK="/profile/:userId"
export const FRIENDS_PAGE=(userId)=> `/friends/${userId}`
export const PROFILE_PAGE = (userId) => `/profile/${userId}`;
export const ALBUM_PAGE= (userId) => `/album/${userId}`;





//API
export const SIGNUP_API="http://localhost:8080/user/register"
export const LOGIN_API="http://localhost:8080/auth/login"
export const SETTINGS_API="http://localhost:8080/user/settings"
//API FOR POSTS
export const ADD_POST_API="http://localhost:8080/post/add"
export const ADD_COMMENT_API="http://localhost:8080/comments/add-comment"
export const ADD_LIKE_API="http://localhost:8080/likes/add-like"
//API PROVIDERS

export const WEBSITE_NAME="Faceboard"
    //BUTTONS

export const PROFILE_BTN_TEXT="Profile";
export const FEED_BTN_TEXT="Feed";
export const NOTIFICATIONS_BTN_TEXT="Notifications"
export const FRIENDS_BTN_TEXT="Friends"
export const SEARCH_BTN_TEXT="Search"

export const SETTINGS_BTN_TEXT="Settings"
export const LOGOUT_BTN_TEXT="Log Out";
export const ABOUT_BTN_TEXT="About"
///SideBar
export const INBOX_BTN_TEXT="Chat"

//COLORS
//ENUMS
export const GenderEnum = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
};

///My Personal Links

export const DANIEL_FACEBOOK_ACCOUNT="https://www.facebook.com/Daniegino"
export const DANIEL_LINKEDIN_ACCOUNT="https://www.linkedin.com/in/daniel-gino-2b6350345/"
export const DANIEL_INSTAGRAM_ACCOUNT="https://www.instagram.com/daniel_gino"
export const DANIEL_GITHUB_ACCOUNT="https://github.com/danielgino"