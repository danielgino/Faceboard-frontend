import React, {useEffect, useRef} from "react";
import HeaderBar from "./HeaderBar";
import SideBar from "./SideBar";
import GlobalImageLightbox from "../../assets/imagelightbox/GlobalImageLightbox";
import { Toast } from 'primereact/toast';
import {useUser} from "../../context/UserProvider";
import { Outlet } from "react-router-dom";
import {useNotifications} from "../../context/NotificationProvider";
import {useMessages} from "../../context/MessageProvider";
import Search from "../interaction/Search";
import Footer from "./Footer";
import LogoLoading from "../../assets/logo/LogoLoading.png"
function MainLayout() {
    const { user,isUserLoading, fetchUserDetails } = useUser();
    const { fetchNotifications } = useNotifications();
    const toastRef = useRef(null);
    const { fetchUserMessages} = useMessages();
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token && !user) {
            fetchUserDetails(token);
            fetchNotifications();
        }
    }, [user]);



    useEffect(() => {
        window.toastRef = toastRef;
    }, []);

    if (!user || !user.id || isUserLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <img
                        src={LogoLoading}
                        alt="Faceboard Logo"
                        className="w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] mx-auto mb-6 animate-pulse"
                    />
                    {/*<h1 className="text-6xl font-extrabold tracking-widest text-purple-600 drop-shadow-lg animate-pulse">*/}
                    {/*    LOADING...*/}
                    {/*</h1>*/}
                    {/*<p className="text-gray-600 text-xxl">Loading...</p>*/}
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Toast ref={toastRef} position="bottom-right"/>

            <SideBar/>
            <div className="flex-1 flex flex-col">
                <HeaderBar/>

                {/*<main className="pt-[110px] pb-20 flex-1 overflow-visible bg-gray-100">*/}

                {/*    /!*<div className="w-full px-4 sm:px-6 lg:px-8">*!/*/}
                {/*    <Outlet/>*/}
                {/*    /!*</div>*!/*/}
                {/*</main>*/}

                <main className="pt-[110px] pb-20 flex-1 bg-gray-100 ">
                    <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4">
                        <Outlet/>
                    </div>
                </main>

                {/*<Footer/>*/}
            </div>

        </div>
    );
}

export default MainLayout;
