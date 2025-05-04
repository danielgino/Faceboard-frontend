import React, { createContext, useContext, useState } from "react";
import PostLoader from "../assets/loaders/PostLoader";
import {
    DELETE_COMMENT_API,
    DELETE_POST_API,
    EDIT_POST_API,
    GET_FEED_POSTS_API,
    GET_PAGINATED_POSTS_API, GET_USER_POSTS_API
} from "../utils/Utils";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [feed,setFeed]=useState([])
    const [feedPage, setFeedPage] = useState(0);

    const [loading, setLoading] = useState(true);

    const fetchUserPosts = async (userId) => {
        try {
            const token=localStorage.getItem("jwtToken");
            if (!token){
                throw new Error("User Not Authenticated!")
            }

            const response = await fetch(GET_USER_POSTS_API(userId), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user posts');
            }

            const postsData = await response.json();
            setPosts(postsData);
            setLoading(false)
        } catch (err) {
            console.error('Error fetching user posts:', err);
            setLoading(false)
        }
    };

    const fetchFeedPosts = async ( ) => {
        try {
            const token=localStorage.getItem("jwtToken");
            if (!token){
                throw new Error("User Not Authenticated!")
            }

            const response = await fetch(GET_FEED_POSTS_API, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }

            const feedData = await response.json();
            setFeed(feedData);
            console.log("Feed data:", feedData);

            setLoading(false)
        } catch (err) {
            console.error('Error fetching  posts:', err);
            setLoading(false)
        }
    };
    const fetchPagePosts = async ({ page = 0, size = 10, isFeed = true, userId = null }) => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) throw new Error("User Not Authenticated!");

            const url = GET_PAGINATED_POSTS_API({ userId, page, size, isFeed });

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch posts');

            const newPosts = await response.json();
            return newPosts;
        } catch (err) {
            console.error('Error fetching paginated posts:', err);
            return [];
        }
    };

    const deletePost = async (postId) => {
        const token = localStorage.getItem("jwtToken");

        try {
            const res = await fetch(DELETE_POST_API(postId), {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setPosts((prev) => prev.filter((p) => p.postId !== postId));
            } else {
                const err = await res.text();
                console.error("Delete failed:", err);
            }
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    const editPost = async (postId, newContent) => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            console.error("User not authenticated");
            return;
        }

        try {
            const response = await fetch(EDIT_POST_API(postId), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newContent }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to edit post');
            }

            const updatedPost = await response.json();
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === updatedPost.id ? { ...post, content: updatedPost.content, edited: updatedPost.edited } : post
                )
            );
            setFeed((prevFeed) =>
                prevFeed.map((post) =>
                    post.id === updatedPost.id ? { ...post, content: updatedPost.content, edited: updatedPost.edited } : post
                )
            );

            return updatedPost;

        } catch (err) {
            console.error("Error editing post:", err);
        }
    };

    const addPost = (newPost) => {
        setPosts((prevPosts) => [...prevPosts, newPost]);
    };

    const setUpdatePosts = (newPosts) => {
        setPosts(newPosts);
    };
    const deleteComment = async (commentId) => {
        const token = localStorage.getItem("jwtToken");

        try {
            const res = await fetch(DELETE_COMMENT_API(commentId), {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                console.log(`Comment ${commentId} deleted successfully.`);
            } else {
                const err = await res.text();
                console.error("Delete comment failed:", err);
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };
    return (
        <PostContext.Provider value={{ posts,feed,loading,editPost,
            fetchPagePosts,fetchFeedPosts,fetchUserPosts, addPost,
            setUpdatePosts,setPosts,deletePost,deleteComment }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePosts = () => useContext(PostContext);
