import { Button, IconButton, Textarea } from "@material-tailwind/react";
import React, { useState, useId } from "react";
import RandomIcons from "../../Icons/RandomIcons";
import EmojiLibrary from "../interaction/EmojiLibrary";
import { ADD_COMMENT_API } from "../../utils/Utils";
import Swal from "sweetalert2";

function AddComment({ postId, onCommentAdded }) {
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const taUid = useId();                        // ✅ מזהה ייחודי
    const taId = `comment-text-${postId ?? ""}-${taUid.replace(/:/g, "")}`;

    const handleCommentChange = (e) => setCommentText(e.target.value);

    const handleSubmit = async (e) => {
        e?.preventDefault?.();

        if (!commentText.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Empty Comment",
                text: "Please write something before submitting.",
            });
            return;
        }
        setIsSubmitting(true);

        const token = localStorage.getItem("jwtToken");
        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "User not authenticated",
            });
            setIsSubmitting(false);
            return;
        }

        const commentData = { text: commentText, post: { postId } };

        try {
            const response = await fetch(ADD_COMMENT_API, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) throw new Error("Failed to add comment");

            const result = await response.json();
            onCommentAdded(result);
            setCommentText("");

            Swal.fire({
                icon: "success",
                title: "Comment Added",
                text: "Your comment was successfully added!",
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: "center",
            });
        } catch (err) {
            setError(err.message);
            console.error("Error adding comment:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-[90vw] sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[49rem] flex-grow order-2"
        >
            <div
                className="flex w-full flex-row items-center gap-2 rounded-[99px] border border-gray-900/10 bg-gray-900/5 p-2">
                <div className="flex">
                    <button
                        type="button"
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Attach image"
                        title="Attach image"
                    >
                        <RandomIcons.PhotoIcon/>
                    </button>

                    <EmojiLibrary onEmojiClick={(emoji) => setCommentText((prev) => prev + emoji.emoji)}/>
                </div>
                <label htmlFor={taId} className="sr-only">Add a comment</label>
                <Textarea
                    id={taId}
                    name="comment-text"
                    value={commentText}
                    onChange={handleCommentChange}
                    rows={1}
                    resize={false}
                    placeholder="Enter a Comment..."
                    className="min-h-full !border-0 focus:border-transparent rounded-md"
                    containerProps={{className: "grid h-full rounded-md"}}
                    aria-label="Comment text"
                    aria-describedby={`${taId}-help`}
                    label=" "
                    labelProps={{ htmlFor: taId, className: "sr-only",  role: "presentation"}}
                />
                <span id={`${taId}-help`} className="sr-only">
          Type your comment and press Enter to submit
        </span>

                <div>
                    <button
                        type="submit"
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                        aria-label="Post comment"
                        title="Post comment"
                        disabled={isSubmitting}
                    >
                        <RandomIcons.PostComment/>
                    </button>
                </div>
            </div>
        </form>
    );
}

export default AddComment;
