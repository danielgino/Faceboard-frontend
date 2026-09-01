import React, { createContext, useCallback, useContext, useState } from "react";
import {
    DELETE_COMMENT_API,
    DELETE_POST_API,
    EDIT_POST_API,
    fetchWithAuth,
    GET_PAGINATED_POSTS_API, GET_USER_POSTS_API,
    JWT_STORAGE_KEY, POSTS_PAGE_SIZE
} from "../utils/Utils";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [feed,setFeed]=useState([])

    const fetchUserPosts = async (userId) => {
        try {
            const token=localStorage.getItem(JWT_STORAGE_KEY);
            if (!token){
                throw new Error("User Not Authenticated!")
            }

            const response = await fetchWithAuth(GET_USER_POSTS_API(userId));
            if (!response.ok) {
                throw new Error('Failed to fetch user posts');
            }

            const postsData = await response.json();
            setPosts(postsData);
        } catch (err) {
            console.error('Error fetching user posts:', err);
        }
    };

    const fetchPagePosts = useCallback(async ({ page = 0, size = POSTS_PAGE_SIZE, isFeed = true, userId = null }) => {
        try {
            const token = localStorage.getItem(JWT_STORAGE_KEY);
            if (!token) throw new Error("User Not Authenticated!");

            const url = GET_PAGINATED_POSTS_API({ userId, page, size, isFeed });

            const response = await fetchWithAuth(url);

            if (!response.ok) throw new Error('Failed to fetch posts');

            const newPosts = await response.json();
            return newPosts;
        } catch (err) {
            console.error('Error fetching paginated posts:', err);
            return [];
        }
    }, []);

    const deletePost = async (postId) => {
        try {
            const res = await fetchWithAuth(DELETE_POST_API(postId), {
                method: "DELETE",
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
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (!token) {
            console.error("User not authenticated");
            return;
        }

        try {
            const response = await fetchWithAuth(EDIT_POST_API(postId), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
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

    const addPost = (newPost, currentUserId) => {
        setFeed((prev) => [newPost, ...prev]);
        if (newPost.userId === currentUserId) {
            setPosts((prev) => [newPost, ...prev]);
        }
    };

    const deleteComment = async (commentId) => {
        try {
            const res = await fetchWithAuth(DELETE_COMMENT_API(commentId), {
                method: "DELETE",
            });

            if (!res.ok) {
                const err = await res.text();
                console.error("Delete comment failed:", err);
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };
    return (
        <PostContext.Provider value={{ posts,feed,setFeed,editPost,
            fetchPagePosts,fetchUserPosts, addPost,
            setPosts,deletePost,deleteComment }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePosts = () => useContext(PostContext);
