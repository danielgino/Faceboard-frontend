import React, { createContext, useContext, useState } from "react";
import {
    ACCEPT_FRIEND_REQUEST_API,
    CHECK_FRIENDS_STATUS_API, DECLINE_FRIEND_REQUEST_API,
    REMOVE_FRIEND_API,
    SEND_FRIEND_REQUEST_API
} from "../utils/Utils";

const FriendshipContext = createContext();

export const FriendshipProvider = ({ children }) => {
    const [friendStatus, setFriendStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkFriendStatus = async (userId, friendId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(CHECK_FRIENDS_STATUS_API(userId,friendId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 404 || response.status === 400) {
                console.log(`ℹ️ No friendship found between ${userId} and ${friendId}`);
                setFriendStatus(null);
                return null;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch friend status");
            }

            const data = await response.json();
            setFriendStatus(data);
            return data;
        } catch (error) {
            console.error("Error checking friend status:", error);
            setFriendStatus(null);
            return null;
        }
    };


    const sendFriendRequest = async (userId, otherUserId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            await fetch(SEND_FRIEND_REQUEST_API(userId,otherUserId), {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            setFriendStatus({ senderId: userId, receiverId: otherUserId, status: "PENDING" });
        } catch (err) {
            console.error("Error sending friend request", err);
        }
    };

    const acceptFriendRequest = async (userId, otherUserId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            await fetch(ACCEPT_FRIEND_REQUEST_API(userId,otherUserId), {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            setFriendStatus({ senderId: otherUserId, receiverId: userId, status: "ACCEPTED" });
        } catch (err) {
            console.error("Error accepting friend request", err);
        }
    };

    const declineFriendRequest = async (userId, otherUserId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            const senderId = Number(otherUserId);
            const receiverId = Number(userId);

            console.log("🚀 Declining with:", { senderId, receiverId });

            await fetch(DECLINE_FRIEND_REQUEST_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    senderId,
                    receiverId,
                }),
            });
            setFriendStatus({ senderId, receiverId, status: "DECLINED" });

        } catch (err) {
            console.error("Error declining friend request", err);
        }
    };


    const removeFriendship = async (userId, otherUserId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            await fetch(REMOVE_FRIEND_API(userId,otherUserId), {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFriendStatus(null);
        } catch (err) {
            console.error("Error removing friendship:", err);
        }
    };


    return (
        <FriendshipContext.Provider
            value={{
                friendStatus,
                loading,
                checkFriendStatus,
                sendFriendRequest,
                acceptFriendRequest,
                declineFriendRequest,
                removeFriendship
            }}
        >
            {children}
        </FriendshipContext.Provider>
    );
};

export const useFriendship = () => useContext(FriendshipContext);
