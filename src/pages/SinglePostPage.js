import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { GET_POST_BY_ID } from "../utils/Utils";
import Post from "../components/posts/Post";
import PostLoader from "../assets/loaders/PostLoader";
import NoPostsYet from "../assets/loaders/NoPostsYet";

export default function SinglePostPage() {
    const { postId } = useParams();
    const location = useLocation();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(GET_POST_BY_ID(postId), {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwtToken") || ""}`,
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch post");
                const data = await res.json();
                if (!ignore) setPost(data);
            } catch (e) {
                if (!ignore) setErr(e.message);
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => (ignore = true);
    }, [postId]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const commentId = params.get("comment") || location.state?.commentId;
        if (commentId) {
            const el = document.getElementById(`comment-${commentId}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add("ring-2", "ring-blue-500");
                setTimeout(() => el.classList.remove("ring-2", "ring-blue-500"), 2000);
            }
        }
    }, [location, post]);

    if (loading) return (
        <div className="w-full max-w-[100vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 sm:px-4">
            <PostLoader />
        </div>
    );
    if (err || !post) return (
        <div className="w-full max-w-[100vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 sm:px-4">
            <NoPostsYet title="Post not found" text="The post does not exist or may be deleted"/>
        </div>
    );

    return (
        <div className="relative min-h-svh overflow-visible">
            <div className="max-w-2xl mx-auto p-2 mt-20">
                <Post post={post}/>
            </div>
            </div>
            );
            }
