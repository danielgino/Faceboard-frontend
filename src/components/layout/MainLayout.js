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
import LogoLoading from "../../assets/photos/logo/LogoLoading.png"
import {API_BASE_URL} from "../../utils/Utils";
function MainLayout() {
    const { user, fetchUserDetails } = useUser();
    const { fetchNotifications } = useNotifications();
    const toastRef = useRef(null);
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


    return (
        <div className="flex min-h-screen">
            <Toast ref={toastRef} position="bottom-right"/>

            <SideBar/>
            <div className="flex-1 flex flex-col">
                <HeaderBar/>

                <main className="pt-[110px] pb-20 flex-1 bg-gray-100 ">
                    <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4">
                        <Outlet/>
                    </div>
                </main>
            </div>

        </div>
    );
}

export default MainLayout;
