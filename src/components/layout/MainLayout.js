import React, {useEffect, useRef} from "react";
import HeaderBar from "./HeaderBar";
import SideBar from "./SideBar";
import { Toast } from 'primereact/toast';
import { Outlet, useLocation } from "react-router-dom";
import {CHAT_PAGE} from "../../utils/Utils";
import {fluid} from "./navFluid";

// Content column stays at today's max-w-screen-xl (1280px) through normal
// desktop sizes, then grows gently past 1440px so large/ultrawide monitors
// don't read as a small fixed layout floating in empty space next to a now-
// wider Sidebar - capped well short of full-bleed so it stays "contained,"
// not "stretched."
const CONTENT_MAX_WIDTH = fluid(1280, 1520, 1440, 2560);

function MainLayout() {
    const toastRef = useRef(null);
    const location = useLocation();
    const isChatPage = location.pathname === CHAT_PAGE;

    useEffect(() => {
        window.toastRef = toastRef;
    }, []);


    return (
        // No background here: the desktop left rail (Sidebar) is meant to
        // read as one continuous white navigation column, so it relies on
        // this wrapper's default (white) rather than an explicit color.
        // <main> below carries its own explicit bg-dsNeutral-canvas, which
        // is what actually keeps the Feed/content column gray.
        <div className="flex min-h-dvh">
            <Toast ref={toastRef} position="bottom-right"/>

            <SideBar/>
            <div className="flex-1 flex flex-col">
                <HeaderBar/>

                <main className={`${isChatPage ? "pt-[calc(56px+env(safe-area-inset-top))] md:pt-[calc(60px+env(safe-area-inset-top))]" : "pt-[calc(56px+env(safe-area-inset-top))] md:pt-[calc(60px+env(safe-area-inset-top))]"} flex-1 bg-dsNeutral-canvas ${isChatPage ? "pb-0 md:pb-[calc(5rem+env(safe-area-inset-bottom))]" : "pb-[calc(5rem+env(safe-area-inset-bottom))]"}`}>
                    <div className="w-full mx-auto px-2 sm:px-4" style={{ maxWidth: CONTENT_MAX_WIDTH }}>
                        <Outlet/>
                    </div>
                </main>
            </div>

        </div>
    );
}

export default MainLayout;
