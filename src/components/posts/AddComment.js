import {Button, IconButton, Textarea} from "@material-tailwind/react";
import {useUser} from "../../context/UserProvider";
import React, {useState} from "react";
import RandomIcons from "../../Icons/RandomIcons";
import EmojiLibrary from "../interaction/EmojiLibrary";
import {ADD_COMMENT_API} from "../../utils/Utils";
import Swal from 'sweetalert2';

function AddComment({postId,onCommentAdded}){
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);


    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Empty Comment',
                text: 'Please write something before submitting.',
            });
            return;
        }
        setCommentText("");
        setIsSubmitting(true);

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'User not authenticated',
            });
            setIsSubmitting(false);
            return;
        }
        const commentData = {
            text: commentText,
            post: {
                postId: postId
            }
        };
        try {
            const response = await fetch(ADD_COMMENT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            const result = await response.json();
            onCommentAdded(result)
            setCommentText('');
            Swal.fire({
                icon: 'success',
                title: 'Comment Added',
                text: 'Your comment was successfully added!',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'center',
            });

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