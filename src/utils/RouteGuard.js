import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserProvider";
import React from "react";
import GeneralLoadingLogo from "../assets/loaders/GeneralLoadingLogo";
import { JWT_STORAGE_KEY, LOGIN_PAGE, UNAUTHORIZED_PAGE } from "./Utils";

function RouteGuard({
                        auth = "protected",
                        redirectTo = UNAUTHORIZED_PAGE,
                        redirectIfAuthedTo = LOGIN_PAGE,
                    }) {
    const { user, isUserLoading } = useUser();
    const isAuthed = !!(user && user.id);
    const location = useLocation();
    const hasToken = !!localStorage.getItem(JWT_STORAGE_KEY);
    if (auth === "public") {
        if (location.state?.forceLogin) return <Outlet />;
        if (isAuthed) return <Navigate to={redirectIfAuthedTo} replace />;
        return <Outlet />;
    }
    if (!isAuthed) {
        if (!isUserLoading) return <Navigate to={redirectTo} replace />;
        if (!hasToken) return <Navigate to={redirectTo} replace />;
        return (
           <GeneralLoadingLogo/>

        );}
    return <Outlet/>;}

    export default RouteGuard;
