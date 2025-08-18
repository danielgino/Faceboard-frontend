import React, {useEffect, useState} from 'react';
import Swal from "sweetalert2";

import {Avatar, Typography, Card,
    CardHeader,
    CardBody,
    } from "@material-tailwind/react";
import {formatDate, GET_COMMENTS_BY_POST, PROFILE_PAGE} from "../../utils/Utils";
import {usePosts} from "../../context/PostProvider";
import {useUser} from "../../context/UserProvider";
import RandomIcons from "../../Icons/RandomIcons";
import CommentLoader from "../../assets/loaders/CommentLoader";


function Comment({ postId, postOwnerId,newComment  }) {
    const { user } = useUser();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { deleteComment } = usePosts();
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            const token = localStorage.getItem("jwtToken");
            try {
                const response = await fetch(GET_COMMENTS_BY_POST(postId), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch comments");
                }
                const data = await response.json();
                setComments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);
    const handleDeleteComment = async (commentId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This comment will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
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
        return <div> Error Loading Comments {error}</div>;
    }

    return (
        <div>
            {loading && <div>Loading Comments...</div>}
            {error && <div>Error Loading Comments {error}</div>}
            <div className="max-h-[600px] overflow-y-auto pr-2">

                {comments.map((comment) => (

                    <Card
                        key={comment.commentId}
                        shadow={false}
                        className={`
        w-full max-w-[48rem] bg-gray-50 px-4 py-2 mb-4
        transition-all duration-500 ease-in-out overflow-hidden
        ${deletingCommentId === comment.commentId ? "opacity-0 max-h-0 p-0 m-0 scale-95" : "opacity-100 max-h-[500px]"}
    `}
                    > <CardHeader
                        color="transparent"
                        floated={false}
                        shadow={false}
                        className="mx-0 flex items-center gap-4 pt-0 pb-8"
                    >
                        <a href={PROFILE_PAGE(comment.userId)}>
                            <Avatar
                                size="md"
                                variant="circular"
                                src={comment.profilePicture}
                                alt={comment.fullName}
                            />
                        </a>
                        <div className="flex w-full flex-col gap-0.5">
                            <div className="flex items-center justify-between">
                                <a href={PROFILE_PAGE(comment.userId)}>
                                    <Typography variant="h6" color="blue-gray">
                                        {comment.fullName}
                                    </Typography>
                                </a>
                                <div className="flex items-center gap-x-2">
                                    {formatDate(comment.createdAt).toLocaleString()}
                                    {(user?.id === comment.userId || user?.id === postOwnerId) && (
                                        <button onClick={() => handleDeleteComment(comment.commentId)}>
                                            <RandomIcons.TrashIcon className="w-4 h-4"/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <a href={PROFILE_PAGE(comment.userId)}>
                                <Typography className="font-bold text-xs text-gray-700">@{comment.username}</Typography>
                            </a>
                        </div>
                    </CardHeader>
                        <CardBody className="mb-6 p-0">
                            <Typography>{comment.commentText}</Typography>
                        </CardBody>
                    </Card>
                ))}
            </div>


            </div>
            );
            }

            export default Comment;