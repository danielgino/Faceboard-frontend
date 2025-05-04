
import React, {useEffect, useMemo, useState} from 'react';
import {Avatar, Button, Card, CardBody, CardFooter, CardHeader, Tooltip, Typography} from "@material-tailwind/react";
import Comment from "./Comment";
import AddComment from "./AddComment";
import Like from "./Like";
import {Link} from "react-router-dom";
import {formatDate, getRandomUsers, PROFILE_PAGE} from "../../utils/Utils";
import { Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";

import RandomIcons from "../../Icons/RandomIcons";
//import HeartLike from "public/animations/HeartLike.json";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";
import { HeartLike } from "../../animations";

import {usePosts} from "../../context/PostProvider";
import Swal from "sweetalert2";
import {useUser} from "../../context/UserProvider";

function Post({post,onImageClick,onDelete} ){
    const [showComments,setShowComment]=useState(false)
    const [comments, setComments] = useState(post.comments);
    const {user}=useUser()
    const { editPost, deletePost } = usePosts();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const handleCommentsIcon=()=>{
        setShowComment(!showComments);
    }

    const handleCommentAdded = (newComment) => {
        setComments(prevComments => [...prevComments, newComment]);
        setShowComment(true);
    };
    const handleDeleteComment = (commentId) => {
        setComments(prev => prev.filter(c => c.commentId !== commentId));
    };
    const handleSaveEdit = async () => {
        if (!editedContent.trim()) {
            alert("Content cannot be empty!");
            return;
        }
        const updated = await editPost(post.id, editedContent);
        if (updated) {
            setIsEditing(false);
            post.content = editedContent;  // עידכון מיידי
            post.edited = true;
        }
    };

    const  handleDeletePost = async () => {
        console.log("🧪 Trying to delete post:", post);

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This post will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        await deletePost(post.id);

        Swal.fire("Deleted!", "Your post has been deleted.", "success");

        if (onDelete) {
            onDelete(post.postId);
        }
    };
    const randomLikedUsers = useMemo(() => {
        return getRandomUsers(post.likedUsers, 2);
    }, [post.likedUsers]);
    return (
<div className="w-full flex justify-center">
    {/*<Card className="mt-6 w-[42rem]">*/}
    <Card className="mt-6 w-full max-w-4xl px-4 sm:px-6">

    <CardBody>
            <CardHeader
                color="transparent"
                floated={false}
                shadow={false}
                className="mx-0 flex items-center gap-4 pt-0 pb-8"
            >
                <Link to={PROFILE_PAGE(post.userId)}>

                <Avatar
                    size="lg"
                    variant="circular"
                    src={post.profilePictureUrl}
                    alt="User Profile Pic"
                />
                </Link>
                <div className="flex w-full flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                        <Link to={PROFILE_PAGE(post.userId)}>
                        <Typography variant="h6" color="blue-gray">
                            {post.fullName}
                        </Typography>
                        </Link>
                        <div className="5 flex items-center gap-0">
                            {formatDate(post.createdAt).toLocaleString()}
                            {user.id === post.userId && (

                                <Menu placement="bottom-end">
                                    <MenuHandler>
                                        <button className="p-2 rounded-full hover:bg-gray-100">
                                            <RandomIcons.MoreIcon/>
                                        </button>
                                    </MenuHandler>
                                    <MenuList>
                                        <MenuItem onClick={() => setIsEditing(true)}>
                                            ✏️ Edit
                                        </MenuItem>
                                        <MenuItem onClick={handleDeletePost}>
                                            🗑️ Delete
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            )}
                        </div>
                    </div>
                    <Typography color="gray" variant="small" textGradient>@{post.username}</Typography>
                    <Typography className="font-bold text-xs" color="gray"  textGradient>{post.edited ===true ? "Edited": ""}</Typography>
                </div>
            </CardHeader>


        <div>
            {/*{post.content}*/}
            <div className="mt-2">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
      <textarea
          className="w-full p-2 border rounded"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
      />
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSaveEdit}
                                color="green"
                                variant="gradient"
                                size="sm"
                            >
                                Save
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedContent(post.content);
                                }}
                                color="gray"
                                variant="outlined"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {post.content}
                    </div>
                )}
            </div>
            {post.imageUrls.length > 0 ?
                (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
                        {post.imageUrls.map((imageUrl, index) => (
                            <div key={index}>
                                <img
                                    onClick={() => onImageClick(post.imageUrls, index)}
                                    className=" w-full max-w-[700px] max-h-[300px] aspect-square object-contain object-center rounded-md "
                                    src={imageUrl}
                                    alt={post.fullName + " Photo"}
                                />
                            </div>
                        ))}
                    </div>
                    // </div>
                ) : null}
        </div>
    </CardBody>

        <CardFooter className="pt-0">
            <div className="flex items-center -space-x-3">
                {randomLikedUsers.map((user, index) => (
                    <Tooltip key={user.id || index} content={user.fullName}>
                        <Avatar
                            size="sm"
                            variant="circular"
                            alt={user.fullName}
                            src={user.profilePictureUrl}
                            className="border-2 border-white hover:z-10"
                        />
                    </Tooltip>
                ))}
            </div>
            <br/>
            <div className="flex items-center gap-x-4">
                <div className="flex items-center justify-center w-8 h-8">
                    <Like post={post}/>
                </div>

                <div className="flex items-center justify-center w-8 h-8" onClick={handleCommentsIcon}>
                    <RandomIcons.Comment/>
                    <Typography className="font-bold text-sm ml-0">{comments.length}</Typography>
                </div>

                <div className="flex items-center justify-center w-8 h-8">
                    <RandomIcons.Share/>
                </div>
            </div>


                <div className="flex flex-col space-y-4">

                    <Link onClick={handleCommentsIcon}>
                        {showComments ? "Hide Comments" : "Show Comments"}
                    </Link>
                    {comments.length > 0 && showComments
                        ? comments.map((comment) => {

                            return <Comment key={comment.commentId} postId={post.id}
                                            postOwnerId={post.userId}
                                            comment={comment}
                                            onDelete={handleDeleteComment}/>;
                        })
                        : ""}
                    <AddComment post={post} onCommentAdded={handleCommentAdded}/>
                </div>


        </CardFooter>
    </Card>


</div>
);

}

export default Post
