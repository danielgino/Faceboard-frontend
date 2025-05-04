import React from 'react';
import { useUser } from '../context/UserProvider';
import { useNavigate} from 'react-router-dom';
import {useState,useEffect} from "react";

import Feed from "../componets/layout/Feed";
import HeaderBar from "../componets/layout/HeaderBar";

import { IconHome,  IconUserBolt, IconSettings } from "@tabler/icons-react";

import {FRIENDS_PAGE, LOGIN_PAGE, PROFILE_PAGE_LINK} from "../utils/Utils";
import {usePosts} from "../context/PostProvider";

import MainLayout from "../componets/layout/MainLayout";
import StoryBar from "../componets/interaction/StoryBar";

function Home() {
    const { user, error } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const {feed,fetchFeedPosts}=usePosts()

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
        return <p>Loading user details...</p>;
    }
    const dummyStoriesData = [
        {
            profilePictureUrl: "https://randomuser.me/api/portraits/men/1.jpg",
            fullName: "Daniel Gino",
            stories: [
                { url: "https://picsum.photos/300/500?random=1" },
                { url: "https://picsum.photos/300/500?random=2" },
            ],
        },
        {
            profilePictureUrl: "https://randomuser.me/api/portraits/women/2.jpg",
            fullName: "Shilat Butz",
            stories: [
                { url: "https://picsum.photos/300/500?random=3" },
                { url: "https://picsum.photos/300/500?random=4" },
            ],
        },
        {
            profilePictureUrl: "https://randomuser.me/api/portraits/men/3.jpg",
            fullName: "Sagiv Sal",
            stories: [
                { url: "https://picsum.photos/300/500?random=5" },
            ],
        },
        {
            profilePictureUrl: "https://randomuser.me/api/portraits/men/4.jpg",
            fullName: "Yosi Shitrit",
            stories: [
                { url: "https://picsum.photos/300/500?random=6" },
            ],
        },
    ];
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