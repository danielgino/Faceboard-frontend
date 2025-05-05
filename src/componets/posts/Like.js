import React, { useState } from "react";
import { useUser } from "../../context/UserProvider";
import { Tooltip, Typography } from "@material-tailwind/react";
import HeartIcon from "../../Icons/HeartIcon";
import { ADD_LIKE_API } from "../../utils/Utils";
import LikeList from "../../componets/interaction/LikeList"
function Like({ postId, likeCount, likedByCurrentUser }) {
    const [likes, setLikes] = useState(likeCount ?? 0);
    const [liked, setLiked] = useState(likedByCurrentUser ?? false);
    const [showLikeList, setShowLikeList] = useState(false);

    const handleLikes = async () => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            alert("User not authenticated");
            return;
        }

        const likeData = {
            post: { postId: postId }
        };

        try {
            const response = await fetch(ADD_LIKE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
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
        }
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center h-6">
                <HeartIcon liked={liked} handleLikes={handleLikes} />
            </div>
            <Tooltip content={`${likes} לייקים`}>
                <Typography
                    className="font-bold text-sm ml-1 text-gray-700 cursor-pointer hover:underline"
                    onClick={() => setShowLikeList(true)}
                >
                    {likes}
                </Typography>
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
