import React from 'react';
import { useUser } from '../context/UserProvider';
import { useNavigate} from 'react-router-dom';
import {useState,useEffect} from "react";
import Feed from "../components/layout/Feed";
import {LOGIN_PAGE} from "../utils/Utils";
import StoryBar from "../components/interaction/StoryBar";
import PostLoader from "../assets/loaders/PostLoader";

function Home() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Feed (rendered below with isFeed={true}) already owns loading/paginating
    // the feed itself via fetchPagePosts, writing into the same shared `feed`
    // context state. This page used to also call the unpaginated fetchFeedPosts()
    // here, which raced Feed's own paginated load against the same state -
    // whichever resolved last won, sometimes replacing the paginated feed with
    // an unpaginated one and breaking InfiniteScroll. Feed is the single owner
    // of feed loading now; this page only handles the auth redirect below.
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


            <div className="md:ml-10 max-w-7xl">
                <StoryBar />
                <Feed isFeed={true}/>
            </div>


        </div>
    );
}

export default Home;