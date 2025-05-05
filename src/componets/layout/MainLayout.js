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

function MainLayout() {
    const { user, fetchUserDetails } = useUser();
    const { fetchNotifications } = useNotifications();
    const toastRef = useRef(null);
    const { fetchUserMessages} = useMessages();
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token && !user) {
            fetchUserDetails(token); // ✅ נטען מהשרת
            fetchNotifications();
        }
    }, [user]);



    useEffect(() => {
        window.toastRef = toastRef;
    }, []);

    if (!user || !user.id) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">טוען פרטי משתמש...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Toast ref={toastRef} position="bottom-right" />

                <SideBar/>
            <div className="flex-1 flex flex-col">
                <HeaderBar/>

                {/*<main className="  pt-4 pb-20 flex-1 overflow-visible bg-gray-100 ">*/}
                <main className="pt-[110px] pb-20 flex-1 overflow-visible bg-gray-100">

                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <Outlet/>
                    </div>
                </main>
                {/*<Footer/>*/}
            </div>

        </div>
    );
}

export default MainLayout;
