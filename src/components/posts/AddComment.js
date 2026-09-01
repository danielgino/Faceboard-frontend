import React, { useEffect, useRef, useState, useId } from "react";
import { Smile, Send } from "lucide-react";
import EmojiLibrary from "../interaction/EmojiLibrary";
import { ADD_COMMENT_API, fetchWithAuth, JWT_STORAGE_KEY } from "../../utils/Utils";
import Swal from "../../utils/swalTheme";
import LoadingSpinner from "../../assets/loaders/LoadingSpinner";
import { useUser } from "../../context/UserProvider";
import { Avatar as PrimitiveAvatar } from "../common/Avatar";

const MAX_TEXTAREA_HEIGHT = 120; // px — roughly 5-6 lines before it scrolls internally

function AddComment({ postId, onCommentAdded }) {
    const { user } = useUser();
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isComposing, setIsComposing] = useState(false);
    const textareaRef = useRef(null);
    const taUid = useId();                        // ✅ מזהה ייחודי
    const taId = `comment-text-${postId ?? ""}-${taUid.replace(/:/g, "")}`;

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }, [commentText]);

    const handleCommentChange = (e) => setCommentText(e.target.value);

    const handleSubmit = async (e) => {
        e?.preventDefault?.();

        if (isSubmitting) return;

        if (!commentText.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Empty Comment",
                text: "Please write something before submitting.",
            });
            return;
        }
        setIsSubmitting(true);

        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "User not authenticated",
            });
            setIsSubmitting(false);
            return;
        }

        // Comment-hijacking finding: the backend now binds this into an allowlisted
        // AddCommentRequestDTO (postId, text only) - a flat postId matches that contract exactly.
        const commentData = { text: commentText, postId };

        try {
            const response = await fetchWithAuth(ADD_COMMENT_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) throw new Error("Failed to add comment");

            const result = await response.json();
            onCommentAdded(result);
            setCommentText("");
            setError(null);

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

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !isComposing && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleEmojiClick = (emoji) => {
        setCommentText((prev) => prev + emoji.emoji);
        textareaRef.current?.focus();
    };

    const canSubmit = commentText.trim().length > 0 && !isSubmitting;

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-[90vw] sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[49rem] flex-grow order-2"
        >
            <div className="flex w-full flex-col gap-1">
                <div className="flex w-full flex-row items-end gap-2">
                <PrimitiveAvatar
                    size={30}
                    src={user?.profilePictureUrl}
                    name={user?.fullName}
                    alt=""
                    className="flex-shrink-0 mb-1.5"
                />
                <div className="flex w-full flex-row items-end gap-1.5 rounded-3xl border border-dsNeutral-200 bg-dsNeutral-canvas px-2 py-1.5 transition-colors focus-within:border-dsBrand-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-dsFocusRing">
                    <EmojiLibrary
                        icon={Smile}
                        triggerClassName="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-dsNeutral-500 hover:bg-dsNeutral-200/70 hover:text-dsNeutral-600 active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dsBrand-600"
                        triggerLabel="Choose emoji"
                        onEmojiClick={handleEmojiClick}
                    />

                    <label htmlFor={taId} className="sr-only">Add a comment</label>
                    <textarea
                        ref={textareaRef}
                        id={taId}
                        name="comment-text"
                        value={commentText}
                        onChange={handleCommentChange}
                        onKeyDown={handleKeyDown}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        rows={1}
                        placeholder="Write a comment..."
                        aria-label="Comment text"
                        aria-describedby={`${taId}-help`}
                        className="flex-1 min-w-0 resize-none bg-transparent border-0 outline-none focus:ring-0 text-ds-body text-dsNeutral-900 placeholder:text-dsNeutral-500 py-1.5 max-h-[120px] overflow-y-auto leading-5"
                    />
                    <span id={`${taId}-help`} className="sr-only">
                        Press Enter to submit, Shift and Enter for a new line
                    </span>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        aria-label="Post comment"
                        title="Post comment"
                        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-dsBrand-600 hover:bg-dsBrand-50 active:scale-95 transition disabled:opacity-40 disabled:hover:bg-transparent disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-dsBrand-600"
                    >
                        {isSubmitting ? (
                            <LoadingSpinner className="w-4 h-4 text-dsBrand-600" />
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </div>
                </div>
                {error && <p className="text-xs text-dsDestructive px-3">{error}</p>}
            </div>
        </form>
    );
}

export default AddComment;
