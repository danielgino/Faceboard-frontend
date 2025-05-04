import {Button, IconButton, Textarea} from "@material-tailwind/react";
import {useUser} from "../../context/UserProvider";
import React, {useState} from "react";
import RandomIcons from "../../Icons/RandomIcons";
import EmojiLibrary from "../interaction/EmojiLibrary";
import {ADD_COMMENT_API} from "../../utils/Utils";

function AddComment({post,onCommentAdded}){
    const user=useUser();
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);


    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commentText) {
            alert("Please enter a comment.");
            return;
        }
        setCommentText("");
        setIsSubmitting(true);

        const token = localStorage.getItem('jwtToken');  // שולפים את הטוקן מהמקומי (אם נשמר)
        if (!token) {
            alert('User not authenticated');
            return;
        }
        const commentData = {
            text: commentText,
            post: {
                postId: post.id // שולח אובייקט שלם עם postId
            }
        };
        try {
            const response = await fetch(ADD_COMMENT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // הוספת הטוקן לכותרת Authorization
                },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            const result = await response.json();
            onCommentAdded(result)
            setCommentText('');

            console.log('Comment added:', result);
          // onCommentAdded(result);

        } catch (err) {
            setError(err.message);
            console.error('Error adding comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (

        <div className="w-full max-w-[90vw] sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[49rem] flex-grow order-2">
            <div
                className="flex w-full flex-row items-center gap-2 rounded-[99px] border border-gray-900/10 bg-gray-900/5 p-2">
                <div className="flex">
                    <RandomIcons.PhotoIcon/>
                    <EmojiLibrary onEmojiClick={(emoji) => setCommentText(prev => prev + emoji.emoji)} />

                </div>
                <Textarea
                    value={commentText}
                    onChange={handleCommentChange}
                    rows={1}
                    resize={false}
                    placeholder="Enter a Comment..."
                    className="min-h-full !border-0 focus:border-transparent rounded-md"
                    containerProps={{
                        className: "grid h-full rounded-md",
                    }}
                    labelProps={{
                        className: "before:content-none after:content-none",
                    }}
                />
                <div>
                    <RandomIcons.PostComment handleSubmit={handleSubmit}/>
                </div>
            </div>

        </div>
    )
}

export default AddComment;