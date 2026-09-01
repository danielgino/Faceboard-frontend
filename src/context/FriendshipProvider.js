import React, { createContext, useCallback, useContext } from "react";
import {
    ACCEPT_FRIEND_REQUEST_API,
    CHECK_FRIENDS_STATUS_API, DECLINE_FRIEND_REQUEST_API,
    fetchWithAuth,
    REMOVE_FRIEND_API,
    SEND_FRIEND_REQUEST_API
} from "../utils/Utils";

const FriendshipContext = createContext();

export const FriendshipProvider = ({ children }) => {
    // Phase 10: this provider used to also hold a single shared `friendStatus`
    // slot, set as a side effect of every one of these calls. That's global
    // state for what is actually a per-call, per-target result - and since
    // checkFriendStatus is called for many different target users at once
    // (e.g. LikeList checks every liker on a post in a loop) while
    // UserDetails/FriendshipActionButton reactively renders whatever
    // `friendStatus` last happened to hold, the two consumers stomped on each
    // other whenever both were mounted at once (opening a post's like list
    // while viewing that post's owner's profile - Profile.js renders both
    // UserDetails and Feed/Like/LikeList simultaneously). Each function here
    // now just performs its request and returns/resolves; the one real
    // reactive consumer (UserDetails.js) owns its own local friendStatus
    // state instead.
    const checkFriendStatus = useCallback(async (userId, friendId) => {
        try {
            const response = await fetchWithAuth(CHECK_FRIENDS_STATUS_API(userId,friendId));

            if (response.status === 404 || response.status === 400) {
                // 404/400 = no friendship record between these two users (not an error)
                return null;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch friend status");
            }

            return await response.json();
        } catch (error) {
            console.error("Error checking friend status:", error);
            return null;
        }
    }, []);


    // SUG-002: now returns whether the request actually succeeded, instead of always resolving
    // (even on a non-2xx response) with no way for a caller to tell. This is a safe,
    // backward-compatible contract change: existing callers (LikeList.js, UserDetails.js) only
    // ever `await` this and never inspected its return value, so their behavior is unchanged;
    // useSuggestedFriends is the first caller to actually check it, to roll back its optimistic
    // "Sent" state on failure instead of showing "Sent" for a request that never went through.
    // Still never throws - a network error is reported the same way as a non-2xx response
    // (false), not as an exception a caller would need a new try/catch to handle.
    const sendFriendRequest = async (userId, otherUserId) => {
        try {
            const response = await fetchWithAuth(SEND_FRIEND_REQUEST_API(userId,otherUserId), {
                method: "POST",
            });
            return response.ok;
        } catch (err) {
            console.error("Error sending friend request", err);
            return false;
        }
    };

    const acceptFriendRequest = async (userId, otherUserId) => {
        try {
            await fetchWithAuth(ACCEPT_FRIEND_REQUEST_API(userId,otherUserId), {
                method: "POST",
            });
        } catch (err) {
            console.error("Error accepting friend request", err);
        }
    };

    const declineFriendRequest = async (userId, otherUserId) => {
        try {
            const senderId = Number(otherUserId);
            const receiverId = Number(userId);

            await fetchWithAuth(DECLINE_FRIEND_REQUEST_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    senderId,
                    receiverId,
                }),
            });
        } catch (err) {
            console.error("Error declining friend request", err);
        }
    };


    const removeFriendship = async (userId, otherUserId) => {
        const response = await fetchWithAuth(REMOVE_FRIEND_API(userId,otherUserId), {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to remove friendship");
        }
    };


    return (
        <FriendshipContext.Provider
            value={{
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
