import React, { useCallback, useEffect, useRef, useState } from 'react';
import Post from "../posts/Post";
import AddPost from "../posts/AddPost";
import { usePosts } from "../../context/PostProvider";
import PostLoader from "../../assets/loaders/PostLoader";
import InfiniteScroll from "react-infinite-scroll-component";
import { useUser } from "../../context/UserProvider";
import NoPostsYet from "../../assets/loaders/NoPostsYet";
import { useLocation } from "react-router-dom";

function Feed({ isFeed = false, userId = null }) {
    const {
        posts, setPosts,
        feed, setFeed,
        fetchPagePosts
    } = usePosts();

    const pageRef = useRef(0);
    const loadedPages = useRef(new Set());
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(loading);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useUser();
    const location = useLocation();
    const [readyToLoad, setReadyToLoad] = useState(false);

    const isProfileView = !isFeed && userId !== null;
    const activePosts = isProfileView ? posts : feed;
    const setActivePosts = isProfileView ? setPosts : setFeed;

    // Mirrors `loading` into a ref so loadMorePosts can guard against
    // concurrent calls without needing `loading` in its own useCallback
    // deps - including it there would give loadMorePosts a new identity on
    // every setLoading(true)/setLoading(false) it triggers, which would
    // re-fire the [readyToLoad, loadMorePosts] effect below on every load
    // and risk a request-count-changing feedback loop.
    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    const resetPosts = useCallback(() => {
        setActivePosts([]);
        loadedPages.current.clear();
        pageRef.current = 0;
        setHasMore(true);
    }, [setActivePosts]);

    const loadMorePosts = useCallback(async () => {
        const currentPage = pageRef.current;
        if (loadingRef.current || loadedPages.current.has(currentPage)) return;

        setLoading(true);
        try {
            const newPosts = await fetchPagePosts({ page: currentPage, isFeed, userId });

            setActivePosts(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const filtered = newPosts.filter(p => !existingIds.has(p.id));
                return [...prev, ...filtered];
            });

            loadedPages.current.add(currentPage);
            pageRef.current += 1;

            if (newPosts.length === 0) {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Failed to load posts:", err);
        } finally {
            setLoading(false);
        }
    }, [fetchPagePosts, isFeed, userId, setActivePosts]);

    useEffect(() => {
        setReadyToLoad(false);
        resetPosts();
        setTimeout(() => {
            setReadyToLoad(true);
        }, 0);
    }, [userId, isFeed, location.pathname, resetPosts]);

    useEffect(() => {
        if (readyToLoad) {
            loadMorePosts();
        }
    }, [readyToLoad, loadMorePosts]);

    return (
        <div className="flex flex-col items-center w-full overflow-x-hidden">
            <div
                className="w-full max-w-[100vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 sm:px-4 overflow-x-hidden">

                {(isFeed || Number(userId) === user?.id) && <AddPost/>}

                <InfiniteScroll
                    dataLength={activePosts.length}
                    next={loadMorePosts}
                    hasMore={hasMore}
                    loader={<div className="flex justify-center mt-4"><PostLoader/></div>}
                    endMessage={
                        <p className="text-center mt-4 text-dsNeutral-600">
                            <b>You have reached the end of the feed 🎉</b>
                        </p>
                    }
                >
                    {activePosts.length === 0 && !loading ? (
                        <div className="my-10"><NoPostsYet title="No posts yet" text="Posts will appear here"/></div>
                    ) : (
                        activePosts.map((post) => (
                            <Post
                                key={post.id}
                                post={post}
                                onDelete={(postId) =>
                                    setActivePosts(prev => prev.filter(p => p.id !== postId))
                                }
                            />
                        ))
                    )}
                </InfiniteScroll>
            </div>
        </div>
    );
}

export default Feed;
