import React, {useEffect, useRef, useState} from 'react';
import Post from "../posts/Post";
import AddPost from "../posts/AddPost";
import { usePosts } from "../../context/PostProvider";
import ImageLightbox from "../../assets/imagelightbox/ImageLightBox";
import PostLoader from "../../assets/loaders/PostLoader";
import InfiniteScroll from "react-infinite-scroll-component";
import {useUser} from "../../context/UserProvider";
import NoPostsYet from "../../assets/loaders/NoPostsYet";

function Feed({ isFeed = false, userId = null }) {
    const { fetchPagePosts } = usePosts();
    const pageRef = useRef(0);
    const loadedPages = useRef(new Set());
    const [posts, setLocalPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const existingPostIds = useRef(new Set());
    const [hasMore, setHasMore] = useState(true);
    const { user } = useUser();

    const openLightbox = (images, index) => {
        setLightboxImages(images);
        setCurrentImageIndex(index);
        setIsLightboxOpen(true);
    };
    const resetFeed = () => {
        setLocalPosts([]);
        existingPostIds.current.clear();
        loadedPages.current.clear();
        pageRef.current = 0;
    };
    const loadMorePosts = async () => {
        console.log("📦 Loading posts for userId:", userId);

        const currentPage = pageRef.current;
        if (loading || loadedPages.current.has(currentPage)) return;

        setLoading(true);
        try {
            const newPosts = await fetchPagePosts({ page: currentPage, isFeed, userId });
            setLocalPosts(prev => [...prev, ...newPosts]);
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
    };


    useEffect(() => {
        console.log("🔥 useEffect fired!", { isFeed, userId });
        resetFeed();
        loadMorePosts();
    }, [isFeed, userId]);



    const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        // <div className="w-full max-w-3xl mx-auto px-4 py-4">

        <div className="flex flex-col items-center w-full">
            <div className="w-full px-4 sm:px-6 lg:px-0 max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
                {(isFeed || Number(userId) === user?.id) && <AddPost />}


                <InfiniteScroll
                    dataLength={posts.length}
                    next={loadMorePosts}
                    hasMore={hasMore}
                    loader={
                        <div className="flex justify-center mt-4">
                            <PostLoader/>
                        </div>
                    }
                    endMessage={
                        <p style={{textAlign: 'center', marginTop: '1rem'}}>
                            <b> You have reached the end of the feed 🎉</b>
                        </p>
                    }
                >
                    {sortedPosts.length === 0 && !loading ? (
                        <div className="my-10">
                            <NoPostsYet />
                        </div>
                    ) : (
                        sortedPosts.map((post) => (
                            <Post key={post.id} post={post} onImageClick={openLightbox}
                                  onDelete={(postId) =>
                                      setLocalPosts((prev) => prev.filter((p) => p.postId !== postId))
                                  }/>
                        ))
                    )}
                </InfiniteScroll>
            </div>
                <ImageLightbox
                    images={lightboxImages}
                    isOpen={isLightboxOpen}
                    onClose={() => setIsLightboxOpen(false)}
                    currentIndex={currentImageIndex}/>
            </div>
            );
            }

            export default Feed;


