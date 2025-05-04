import React, {useState,useEffect} from 'react';
import Feed from "../componets/layout/Feed";
import SideBar from "../componets/layout/SideBar";
import UserDetails from "../componets/profile/UserDetails";
import HeaderBar from "../componets/layout/HeaderBar";
import { useUser } from "../context/UserProvider";
import { useParams } from "react-router-dom";
import {usePosts} from "../context/PostProvider";
import PostLoader from "../assets/loaders/PostLoader";
import MainLayout from "../componets/layout/MainLayout";
import AddPost from "../componets/posts/AddPost";

function Profile() {
    const { userId } = useParams(); // מקבל את ה-userId מה-URL

    return (
        <div className="flex flex-col lg:flex-row-reverse w-full px-2 sm:px-4 lg:px-8 gap-12">
            <div className="w-full lg:max-w-sm xl:max-w-md 2xl:max-w-lg lg:ml-auto">

                    <UserDetails otherUserId={userId}/>

            </div>
            <div className="w-full lg:w-2/3">
                <Feed userId={userId} className="pointer-events-auto"/>
            </div>
        </div>
    );
}

export default Profile;
