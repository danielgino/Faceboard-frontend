import React, { createContext, useContext, useState } from "react";
import PostLoader from "../assets/loaders/PostLoader";

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

            const response = await fetch(`http://localhost:8080/post/posts?userId=${userId}`, {
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

            const response = await fetch(`http://localhost:8080/post/feed`, {
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

            const url = isFeed
                ? `http://localhost:8080/post/feed?page=${page}&size=${size}`
                : `http://localhost:8080/post/posts?userId=${userId}&page=${page}&size=${size}`;

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
            const res = await fetch(`http://localhost:8080/post/delete/${postId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                // מחק בהצלחה מה־state
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
            const response = await fetch(`http://localhost:8080/post/edit/${postId}`, {
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

            // מעדכן את הפוסט ב־posts
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === updatedPost.id ? { ...post, content: updatedPost.content, edited: updatedPost.edited } : post
                )
            );

            // אם אתה משתמש גם ב־feed, עדכן גם שם
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
    const deleteComment = async (commentId,postId) => {
        const token = localStorage.getItem("jwtToken");

        try {
            const res = await fetch(`http://localhost:8080/comments/delete/${commentId}`, {
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
