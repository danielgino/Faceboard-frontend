import React, { useState } from "react";
import { Tooltip } from "@material-tailwind/react";
import HeartIcon from "../../Icons/HeartIcon";
import { ADD_LIKE_API, fetchWithAuth, JWT_STORAGE_KEY } from "../../utils/Utils";
import LikeList from "../interaction/LikeList"
import { useUser } from "../../context/UserProvider";
function Like({ postId, likeCount, likedByCurrentUser }) {
    const { isDemo } = useUser();
    const [likes, setLikes] = useState(likeCount ?? 0);
    const [liked, setLiked] = useState(likedByCurrentUser ?? false);
    const [showLikeList, setShowLikeList] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLikes = async () => {
        if (loading || isDemo) return;
        setLoading(true);

        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (!token) {
            alert("User not authenticated");
            setLoading(false);
            return;
        }

        const likeData = {
            post: { postId: postId }
        };

        try {
            const response = await fetchWithAuth(ADD_LIKE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(likeData)
            });

            const result = await response.text();
            if (!response.ok) throw new Error(result);

            if (liked) {
                setLikes(prev => Math.max(prev - 1, 0));
                setLiked(false);
            } else {
                setLikes(prev => prev + 1);
                setLiked(true);
            }

        } catch (err) {
            console.error("Error toggling like:", err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex items-center gap-1.5">
            <HeartIcon
                liked={liked}
                handleLikes={handleLikes}
                loading={loading}
                disabled={isDemo}
                title={isDemo ? "Liking is disabled in Demo Mode." : undefined}
            />
            <Tooltip content={`${likes} Likes`}>
                <button
                    type="button"
                    className="text-ds-caption font-semibold text-dsNeutral-600 hover:underline border-0 bg-transparent p-0 cursor-pointer"
                    onClick={() => setShowLikeList(true)}
                    aria-label={`View who liked this post (${likes})`}
                >
                    {likes}
                </button>
            </Tooltip>
            {showLikeList && (
                <LikeList
                    postId={postId}
                    onClose={() => setShowLikeList(false)}
                />
            )}
        </div>
    );
}

export default Like;
