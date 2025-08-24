import React from 'react';
import { useUser } from '../context/UserProvider';
import { useNavigate} from 'react-router-dom';
import {useState,useEffect} from "react";
import Feed from "../components/layout/Feed";
import {LOGIN_PAGE} from "../utils/Utils";
import {usePosts} from "../context/PostProvider";
import StoryBar from "../components/interaction/StoryBar";
import PostLoader from "../assets/loaders/PostLoader";

function Home() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const {fetchFeedPosts}=usePosts()

    useEffect(() => {
        if (user) {
            fetchFeedPosts();
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            navigate(LOGIN_PAGE);
        } else {
            setLoading(false);
        }
    }, [user, navigate]);

    if (loading) {
        return <PostLoader/>
    }

    return (
        <div>


            <div className="ml-10 max-w-7xl">
                <StoryBar />
                <Feed isFeed={true}/>
            </div>


        </div>
    );
}

export default Home;