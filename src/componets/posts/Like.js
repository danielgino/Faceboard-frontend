import React, {useState, useRef, useEffect} from "react";
import {useUser} from "../../context/UserProvider";
import LikeList from "../interaction/LikeList";
import {Tooltip, Typography} from "@material-tailwind/react";
import HeartIcon from "../../Icons/HeartIcon";
import {ADD_LIKE_API} from "../../utils/Utils";

function Like({post}){
    const {user} = useUser();
    const [likes,setLikes]=useState(post.likeCount)
    const [liked, setLiked] = useState(post.likedByCurrentUser ?? false);
    const [showFriendList, setShowFriendList] = useState(false);



    const handleLikes = async (likedNow) => {

        const token = localStorage.getItem('jwtToken');  // שולפים את הטוקן מהמקומי (אם נשמר)
        if (!token) {
            alert('User not authenticated');
            return;
        }
        const likeData = {
            user : {
                userId: user.id,
            },
            post: {
                postId: post.id
            }
        };
        try {
            const response = await fetch(ADD_LIKE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(likeData),
            });
            const result = await response.text();

            if (!response.ok) {
                throw new Error(result);
            }

            console.log("Start Likes:",post.likeCount)
            if (!likedNow) {
                setLikes(prev => (prev > 0 ? prev - 1 : 0));
                setLiked(false);
               console.log("Tempremovelike:",post.likeCount)
            }
            else {

               setLikes(prev => prev + 1);
               setLiked(true);
                console.log("tempAddlike:",post.likeCount)

            }
            console.log('like added:', result);
        } catch (err) {
            console.error( err);
        }
    };


    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center h-6">
                <HeartIcon liked={liked} handleLikes={handleLikes}/>
            </div>
            {post.likedUsers.length > 0 ? (
                <Typography
                    onClick={() => setShowFriendList(true)}
                    className="font-bold text-sm ml-0"  >{likes}</Typography>

            ) : (
                <Tooltip content="No likes yet">
                    <span className="font-bold text-sm ml-1 text-gray-500" style={{marginLeft: "4px", color: "#999"}}>{likes}</span>
                </Tooltip>
            )}

            {showFriendList && post.likedUsers.length > 0 && (
                <LikeList
                    likedUsers={post.likedUsers}
                    onClose={() => setShowFriendList(false)}
                />
            )}
        </div>
    );

}

export default Like;