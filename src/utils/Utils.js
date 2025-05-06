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
//l



export const API_BASE_URL = process.env.REACT_APP_API_URL;
// const url = isFeed
//     ? `http://localhost:8080/post/feed?page=${page}&size=${size}`
//     : `http://localhost:8080/post/posts?userId=${userId}&page=${page}&size=${size}`;

//API

//API PROVIDERS
export const SIGNUP_API       = `${API_BASE_URL}/user/register`;
export const LOGIN_API        = `${API_BASE_URL}/auth/login`;
export const SETTINGS_API     = `${API_BASE_URL}/user/settings`;
//USER PROVIDERS
export const GET_USER_DETAILS_BY_ID=(userId)=> `${API_BASE_URL}/user/by-id?id=${userId}`
export const GET_USER_IMAGES_API = (userId) => `${API_BASE_URL}/post/${userId}/all-post-images`;
export const GET_USER_FRIENDS_API=(userId)=> `${API_BASE_URL}/user/${userId}/friends`
export const AUTH_ME_API=`${API_BASE_URL}/auth/me`
//Profile Picture Provider
export const UPLOAD_PROFILE_PIC_API=(userId)=>`${API_BASE_URL}/user/${userId}/profile-picture`
export const DELETE_PROFILE_PIC_API=(userId)=>`${API_BASE_URL}/user/${userId}/profile-picture`
//Update Settings
export const UPDATE_SETTINGS_API=`${API_BASE_URL}/user/settings`
//Stories Apis
export const GET_FRIENDS_STORIES_API=`${API_BASE_URL}/api/stories/friends`
export const UPLOAD_STORY_API=`${API_BASE_URL}/api/stories/upload`
//Post Provider
export const GET_USER_POSTS_API=(userId)=> `${API_BASE_URL}/post/posts?userId=${userId}`
export const GET_FEED_POSTS_API=`${API_BASE_URL}/post/feed`
export const DELETE_POST_API=(postId)=>`${API_BASE_URL}/post/delete/${postId}`
export const EDIT_POST_API=(postId)=>`${API_BASE_URL}/post/edit/${postId}`
export const DELETE_COMMENT_API=(commentId)=>`${API_BASE_URL}/comments/delete/${commentId}`
export const GET_PAGINATED_POSTS_API = ({ userId = null, page = 0, size = 5, isFeed = true }) =>
    isFeed
        ? `${API_BASE_URL}/post/feed?page=${page}&size=${size}`
        : `${API_BASE_URL}/post/posts?userId=${userId}&page=${page}&size=${size}`;

//Search
export const SEARCH_USERS_BY_NAME_API = (query) =>
    `${API_BASE_URL}/user/name?name=${encodeURIComponent(query)}`;
//Notifications
export const GET_NOTIFICATIONS_API =`${API_BASE_URL}/notifications`
export const GET_UNREAD_NOTIFICATIONS_API =`${API_BASE_URL}/notifications/unread-count`
export const MARK_NOTIFICATIONS_AS_READ_API =`${API_BASE_URL}/notifications/mark-all-as-read`
//Friendship Provider
export const CHECK_FRIENDS_STATUS_API=(userId,friendId)=>`${API_BASE_URL}/friendship/status/${userId}/${friendId}`
export const SEND_FRIEND_REQUEST_API=(userId,otherUserId)=>`${API_BASE_URL}/friendship/send/${userId}/${otherUserId}`
export const ACCEPT_FRIEND_REQUEST_API=(userId,otherUserId)=>`${API_BASE_URL}/friendship/accept/${userId}/${otherUserId}`
export const REMOVE_FRIEND_API=(userId,otherUserId)=>`${API_BASE_URL}/friendship/remove/${userId}/${otherUserId}`

export const DECLINE_FRIEND_REQUEST_API=`${API_BASE_URL}/friendship/decline`
// Posts
export const ADD_POST_API     = `${API_BASE_URL}/post/add`;
export const ADD_COMMENT_API  = `${API_BASE_URL}/comments/add-comment`;
export const ADD_LIKE_API     = `${API_BASE_URL}/likes/add-like`;
export const GET_LIKED_USERS_API=(postId) =>`${API_BASE_URL}/likes/post/${postId}`
export const GET_COMMENTS_BY_POST=(postId)=>`${API_BASE_URL}/comments/post/${postId}`
//Messages

export const GET_CONVERSATION_BETWEEN_USERS_API=(userId,otherUserId)=>`${API_BASE_URL}/messages/conversation/${userId}/${otherUserId}`

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