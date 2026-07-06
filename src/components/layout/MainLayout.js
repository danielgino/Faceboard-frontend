import React, {useEffect, useRef} from "react";
import HeaderBar from "./HeaderBar";
import SideBar from "./SideBar";
import { Toast } from 'primereact/toast';
import {useUser} from "../../context/UserProvider";
import { Outlet, useLocation } from "react-router-dom";
import {useNotifications} from "../../context/NotificationProvider";
import {CHAT_PAGE} from "../../utils/Utils";
function MainLayout() {
    const { user, fetchUserDetails } = useUser();
    const { fetchNotifications } = useNotifications();
    const toastRef = useRef(null);
    const location = useLocation();
    const isChatPage = location.pathname === CHAT_PAGE;
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
        <div className="flex min-h-dvh">
            <Toast ref={toastRef} position="bottom-right"/>

            <SideBar/>
            <div className="flex-1 flex flex-col">
                <HeaderBar/>

                <main className={`pt-[calc(110px+env(safe-area-inset-top))] flex-1 bg-gray-100 ${isChatPage ? "pb-0 md:pb-[calc(5rem+env(safe-area-inset-bottom))]" : "pb-[calc(5rem+env(safe-area-inset-bottom))]"}`}>
                    <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4">
                        <Outlet/>
                    </div>
                </main>
            </div>

        </div>
    );
}

export default MainLayout;
