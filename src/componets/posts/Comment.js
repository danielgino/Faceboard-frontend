import React from 'react';
import {Link} from "react-router-dom";
import Swal from "sweetalert2";

import {Avatar, Typography, Card,
    CardHeader,
    CardBody,
    } from "@material-tailwind/react";
import {formatDate, PROFILE_PAGE} from "../../utils/Utils";
import {usePosts} from "../../context/PostProvider";
import {useUser} from "../../context/UserProvider";
import RandomIcons from "../../Icons/RandomIcons";


function Comment({ comment, postId, postOwnerId ,onDelete }) {
    const { deleteComment } = usePosts();
    const {user}=useUser()

    // const handleDeleteComment = async () => {
    //     await deleteComment(comment.commentId, postId);
    //     if (onDelete) onDelete(comment.commentId); // ⬅️ מחיקה מיידית מה־UI
    // };
    const handleDeleteComment = async () => {
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

        await deleteComment(comment.commentId, postId);

        if (onDelete) onDelete(comment.commentId);

        Swal.fire("Deleted!", "Your comment has been deleted.", "success");
    };
    return (

            <Card  shadow={false} className=" w-full max-w-[48rem] bg-gray-50 px-4 py-2">
                <CardHeader
                    color="transparent"
                    floated={false}
                    shadow={false}
                    className="mx-0 flex items-center gap-4 pt-0 pb-8"
                >
                    <Link to={PROFILE_PAGE(comment.userId)}>
                    <Avatar
                        size="md"
                        variant="circular"
                        src={comment.profilePicture}
                        alt={comment.fullName}
                    />
                    </Link>
                    <div className="flex w-full flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                            <Link to={PROFILE_PAGE(comment.userId)}>
                            <Typography variant="h6" color="blue-gray">
                                {comment.fullName}
                            </Typography>
                            </Link>
                            <div className="flex items-center gap-x-2">
                                {formatDate(comment.createdAt).toLocaleString()}
                                {(user?.id === comment.userId || user?.id === postOwnerId) && (
                                    <button onClick={handleDeleteComment}><RandomIcons.TrashIcon className="w-4 h-4"/></button>
                                )}
                            </div>
                        </div>
                        <Link to={PROFILE_PAGE(comment.userId)}>
                        <Typography className="font-bold text-xs text-gray-700 " >@{comment.username}</Typography>
                            </Link>
                    </div>
                </CardHeader>
                <CardBody className="mb-6 p-0">
                    <Typography>
                        {comment.commentText}
                    </Typography>
                </CardBody>
            </Card>


    );
}

export default Comment;
