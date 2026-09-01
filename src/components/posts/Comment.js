import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import Swal from "../../utils/swalTheme";

import {Typography} from "@material-tailwind/react";
import {COMMENTS_PAGE_SIZE, fetchWithAuth, formatDate, GET_COMMENTS_BY_POST, PROFILE_PAGE, SWAL_DESTRUCTIVE_CONFIRM_CLASS} from "../../utils/Utils";
import {usePosts} from "../../context/PostProvider";
import {useUser} from "../../context/UserProvider";
import RandomIcons from "../../Icons/RandomIcons";
import CommentLoader from "../../assets/loaders/CommentLoader";
import {Avatar as PrimitiveAvatar} from "../common/Avatar";


// Fidelity reconciliation: rebuilt to match the Design System's CommentItem
// composition (28px avatar, name+time inline, delete icon conditional) —
// dropped Material's Card/CardHeader/CardBody (its baked-in pt-0/pb-8 never
// matched the design's compact rhythm) for a flat avatar+bubble row. All
// state/handlers below are unchanged from the pre-reconciliation version.
function Comment({ postId, postOwnerId,newComment  }) {
    const { user } = useUser();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { deleteComment } = usePosts();
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    // L-DB4C: the initial (no-params) fetch returns only the newest COMMENTS_PAGE_SIZE
    // comments now, instead of the whole history. nextOlderPage/hasMoreOlder track whether
    // an older batch is available so "Load previous comments" only appears when it is.
    const [nextOlderPage, setNextOlderPage] = useState(1);
    const [hasMoreOlder, setHasMoreOlder] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetchWithAuth(GET_COMMENTS_BY_POST(postId));
                if (!response.ok) {
                    throw new Error("Failed to fetch comments");
                }
                const data = await response.json();
                setComments(data);
                setHasMoreOlder(data.length >= COMMENTS_PAGE_SIZE);
                setNextOlderPage(1);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    const handleLoadOlderComments = async () => {
        setLoadingOlder(true);
        try {
            const response = await fetchWithAuth(GET_COMMENTS_BY_POST(postId, nextOlderPage));
            if (!response.ok) {
                throw new Error("Failed to fetch older comments");
            }
            const olderBatch = await response.json();
            setComments(prev => {
                const existingIds = new Set(prev.map(c => c.commentId));
                const deduped = olderBatch.filter(c => !existingIds.has(c.commentId));
                return [...deduped, ...prev];
            });
            setHasMoreOlder(olderBatch.length >= COMMENTS_PAGE_SIZE);
            setNextOlderPage(prev => prev + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingOlder(false);
        }
    };
    const handleDeleteComment = async (commentId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This comment will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            ...SWAL_DESTRUCTIVE_CONFIRM_CLASS,
            confirmButtonText: "Yes, delete it!",
        });



        if (!result.isConfirmed) return;
        setDeletingCommentId(commentId);
        setTimeout(async () => {
            try {
                await deleteComment(commentId, postId);
                setComments(prev => prev.filter(c => c.commentId !== commentId));
                 Swal.fire("Deleted!", "Your comment has been deleted.", "success");
            } catch (err) {
                 Swal.fire("Error!", "Failed to delete comment.", "error");
            } finally {
                setDeletingCommentId(null);
            }
        }, 600);

    };

    useEffect(() => {
        if (newComment) {
            setComments(prev => [...prev, newComment]);
        }
    }, [newComment]);
    if (loading) {
        return (
            <>
                <CommentLoader />
            </>
        );
    }

    if (error) {
        return <div className="text-ds-body text-dsDestructive"> Error Loading Comments {error}</div>;
    }

    return (
        <div>
            {loading && <div className="text-ds-body text-dsNeutral-500">Loading Comments...</div>}
            {error && <div>Error Loading Comments {error}</div>}
            <div className="max-h-[600px] overflow-y-auto pr-2" role="list">

                {hasMoreOlder && (
                    <button
                        type="button"
                        onClick={handleLoadOlderComments}
                        disabled={loadingOlder}
                        className="w-full text-center text-sm text-dsNeutral-600 hover:text-dsNeutral-900 mb-4 disabled:opacity-50"
                    >
                        {loadingOlder ? "Loading..." : "Load previous comments"}
                    </button>
                )}

                {comments.map((comment) => (

                    <div
                        key={comment.commentId}
                        id={`comment-text-${comment.commentId}`}
                        role="listitem"
                        className={`
        flex w-full max-w-[48rem] items-start gap-2.5 mb-3
        transition-all duration-500 ease-in-out overflow-hidden
        ${deletingCommentId === comment.commentId ? "opacity-0 max-h-0 scale-95" : "opacity-100 max-h-[500px]"}
    `}
                    >
                        <Link to={PROFILE_PAGE(comment.userId)} className="flex-shrink-0">
                            <PrimitiveAvatar
                                size={28}
                                src={comment.profilePicture}
                                name={comment.fullName}
                                alt={comment.fullName}
                            />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col rounded-ds-lg bg-dsNeutral-canvas px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                                <Link to={PROFILE_PAGE(comment.userId)} className="min-w-0">
                                    <Typography className="truncate text-ds-label font-semibold text-dsNeutral-900">
                                        {comment.fullName}
                                    </Typography>
                                </Link>
                                <div className="flex flex-shrink-0 items-center gap-x-2">
                                    <time
                                        dateTime={new Date(comment.createdAt).toISOString()}
                                        className="text-xs text-dsNeutral-500"
                                        aria-label={`Posted on ${formatDate(comment.createdAt)}`}>
                                        {formatDate(comment.createdAt)}
                                    </time>
                                    {(user?.id === comment.userId || user?.id === postOwnerId) && (
                                        <button type="button" onClick={() => handleDeleteComment(comment.commentId)} aria-label="Delete comment">
                                            <RandomIcons.TrashIcon className="w-3.5 h-3.5 text-dsNeutral-500 hover:text-dsDestructive"/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* @username has no equivalent in the design's CommentItem example;
                                kept as real product content per Post.js's same precedent, not dropped. */}
                            <Typography className="text-ds-caption text-dsNeutral-500">@{comment.username}</Typography>
                            <Typography className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-ds-body text-dsNeutral-900">{comment.commentText}</Typography>
                        </div>
                    </div>
                ))}
            </div>


            </div>
            );
            }

            export default Comment;