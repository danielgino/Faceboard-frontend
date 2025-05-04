import React, { createContext, useContext, useState } from "react";

const FriendshipContext = createContext();

export const FriendshipProvider = ({ children }) => {
    const [friendStatus, setFriendStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkFriendStatus = async (userId, friendId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(`http://localhost:8080/friendship/status/${userId}/${friendId}`, {
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
            await fetch(`http://localhost:8080/friendship/send/${userId}/${otherUserId}`, {
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
            await fetch(`http://localhost:8080/friendship/accept/${userId}/${otherUserId}`, {
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

            // המרה בטוחה ל-Number בתחילת הפונקציה
            const senderId = Number(otherUserId);
            const receiverId = Number(userId);

            console.log("🚀 Declining with:", { senderId, receiverId });

            await fetch(`http://localhost:8080/friendship/decline`, {
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

            // גם פה תשתמש במספרים המומרים
            setFriendStatus({ senderId, receiverId, status: "DECLINED" });

        } catch (err) {
            console.error("Error declining friend request", err);
        }
    };


    const removeFriendship = async (userId, otherUserId) => {
        try {
            const token = localStorage.getItem("jwtToken");
            await fetch(`http://localhost:8080/friendship/remove/${userId}/${otherUserId}`, {
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
