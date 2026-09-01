import React, { useMemo, useState } from 'react';
import {
    Menu, MenuHandler, MenuList, MenuItem, Tooltip, Typography
} from "@material-tailwind/react";
import { MessageSquare } from "lucide-react";
import Comment from "./Comment";
import AddComment from "./AddComment";
import Like from "./Like";
import { Link } from "react-router-dom";
import { formatDate, getRandomUsers, PROFILE_PAGE, SWAL_DESTRUCTIVE_CONFIRM_CLASS } from "../../utils/Utils";
import RandomIcons from "../../Icons/RandomIcons";
import { usePosts } from "../../context/PostProvider";
import Swal from "../../utils/swalTheme";
import { useUser } from "../../context/UserProvider";
import PostImages from "./PostImages";
import { Button as PrimitiveButton } from "../common/Button";
import { Avatar as PrimitiveAvatar } from "../common/Avatar";
import SharePostModal from "./SharePostModal";

// Fidelity reconciliation: rebuilt to match the Design System's PostCard
// composition (header: avatar + name/time stacked, more-button flush
// right; body; media; like-summary; a single bordered actions row with a
// heart/count, a message-square button whose label switches between
// "Hide comments" and "N comments", and a dimmed share-2; then inline
// comments/composer) instead of Material's Card/CardHeader/CardFooter
// spacing, which never matched the design's rhythm. Every handler/state
// below is identical to the pre-reconciliation version - only the JSX
// shape changed. @username has no equivalent in the design's PostCard
// example; kept (real product content) as a small secondary line rather
// than dropped.
function Post({ post, onDelete }) {
    const [showComments, setShowComments] = useState(false);
    const { user } = useUser();
    const { editPost, deletePost } = usePosts();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const [newestComment, setNewestComment] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);


    const handleCommentsIcon = () => {
        setShowComments(!showComments);
    };

    const handleSaveEdit = async () => {
        if (!editedContent.trim()) {
            Swal.fire("Post can't  be empty!", "Please fill your post with something", "error");

            return;
        }
        const updated = await editPost(post.id, editedContent);
        if (updated) {
            setIsEditing(false);
            post.content = editedContent;
            post.edited = true;
        }
    };

    const handleDeletePost = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This post will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            ...SWAL_DESTRUCTIVE_CONFIRM_CLASS,
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;
        setIsDeleting(true);
        setTimeout(async () => {
            await deletePost(post.id);
            if (onDelete) {
                onDelete(post.id);
            }
             Swal.fire("Deleted!", "Your post has been deleted.", "success");
        }, 500);
    };

    const randomLikedUsers = useMemo(() => {
        return getRandomUsers(post.likedUsers, 2);
    }, [post.likedUsers]);

    // Presentation only, derived entirely from already-fetched post data
    // (no new API call/state) - mirrors the design's "Name and N others"
    // LikeSummary phrasing.
    const likeSummaryText = (() => {
        if (!post.likeCount || post.likeCount < 1 || randomLikedUsers.length === 0) return null;
        const first = randomLikedUsers[0]?.fullName;
        if (!first) return null;
        if (post.likeCount === 1) return first;
        return `${first} and ${post.likeCount - 1} other${post.likeCount - 1 === 1 ? "" : "s"}`;
    })();

    return (
        <div
            className={`w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-4xl mb-8 mx-auto transition-all duration-500 ease-in-out rounded-ds-lg shadow-ds-low border border-dsNeutral-100 bg-white p-4 sm:p-[18px]
  ${isDeleting ? "opacity-0 max-h-0 p-0 m-0 scale-95 overflow-hidden" : "opacity-100"}`}>

            <div className="flex items-start gap-3">
                <Link to={PROFILE_PAGE(post.userId)} className="flex-shrink-0">
                    <PrimitiveAvatar
                        size="md"
                        src={post.profilePictureUrl}
                        name={post.fullName}
                        alt={post.fullName}
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <Link to={PROFILE_PAGE(post.userId)} className="flex items-center">
                        <Typography className="text-ds-user-name text-dsNeutral-900">
                            {post.fullName}
                        </Typography>
                    </Link>
                    <Typography className="text-ds-caption text-dsNeutral-500">@{post.username}</Typography>
                    <Typography className="text-ds-timestamp text-dsNeutral-500">
                        {formatDate(post.createdAt)}{post.edited ? " · Edited" : ""}
                    </Typography>
                </div>
                {user.id === post.userId && (
                    <Menu placement="bottom-end">
                        <MenuHandler>
                            <button type="button" className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-dsNeutral-100 hover:bg-dsNeutral-200 transition" aria-label="Post options">
                                <RandomIcons.MoreIcon className="w-4 h-4 text-dsNeutral-600"/>
                            </button>
                        </MenuHandler>
                        <MenuList>
                            <MenuItem onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                                <RandomIcons.Edit className="w-4 h-4"/> Edit
                            </MenuItem>
                            <MenuItem onClick={handleDeletePost} className="flex items-center gap-2 text-dsDestructive">
                                <RandomIcons.TrashIcon className="w-4 h-4"/> Delete
                            </MenuItem>
                        </MenuList>
                    </Menu>
                )}
            </div>

            <div className="mt-3">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                <textarea
                    className="w-full p-2 border border-dsNeutral-200 rounded-control outline-none transition focus:border-dsBrand-600 focus:ring-4 focus:ring-dsFocusRing"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                />
                        <div className="flex gap-2">
                            <PrimitiveButton onClick={handleSaveEdit}>Save</PrimitiveButton>
                            <PrimitiveButton variant="text" onClick={() => setIsEditing(false)}>Cancel</PrimitiveButton>
                        </div>
                    </div>
                ) : (
                    <Typography className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-ds-body text-dsNeutral-900">{post.content}</Typography>
                )}
            </div>

            {post.imageUrls.length > 0 && (
                <PostImages images={post.imageUrls} />)}

            {likeSummaryText && (
                <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center -space-x-2">
                        {randomLikedUsers.map((likedUser, index) => (
                            <Tooltip key={likedUser.id || index} content={likedUser.fullName}>
                                <span className="inline-flex">
                                    <PrimitiveAvatar
                                        size={22}
                                        alt={likedUser.fullName}
                                        name={likedUser.fullName}
                                        src={likedUser.profilePictureUrl}
                                        className="border-2 border-white hover:z-10"
                                    />
                                </span>
                            </Tooltip>
                        ))}
                    </div>
                    <Typography className="text-ds-caption text-dsNeutral-600">{likeSummaryText}</Typography>
                </div>
            )}

            <div className="flex items-center gap-5 py-3 mt-3 border-t border-b border-dsNeutral-100">
                <Like postId={post.id} likeCount={post.likeCount} likedByCurrentUser={post.likedByCurrentUser} />

                <button
                    type="button"
                    onClick={handleCommentsIcon}
                    disabled={post.commentCount === 0}
                    className="flex items-center gap-1.5 text-dsNeutral-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <MessageSquare size={18} strokeWidth={1.75}/>
                    <span className="text-ds-caption font-semibold">
                        {showComments ? "Hide comments" : `${post.commentCount} comments`}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1.5 text-dsNeutral-600 hover:text-dsNeutral-900 transition"
                    aria-label="Share this post"
                >
                    <RandomIcons.Share/>
                </button>
            </div>

            {showShareModal && (
                <SharePostModal
                    postId={post.id}
                    onClose={() => setShowShareModal(false)}
                />
            )}

            <div className="flex flex-col space-y-4 pt-1">
                {showComments && (
                    <Comment
                        postId={post.id}
                        postOwnerId={post.userId}
                        newComment={newestComment}

                    />
                )}
                <AddComment
                    postId={post.id}
                    onCommentAdded={(newComment) => {
                        setNewestComment(newComment);
                        post.commentCount += 1;
                        setShowComments(true);
                    }}
                />
            </div>
        </div>
    );
}

export default Post;
