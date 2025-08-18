import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserProvider";
import React from "react";
import GeneralLoadingLogo from "../assets/loaders/GeneralLoadingLogo";

function RouteGuard({
                        auth = "protected",
                        redirectTo = "/unauthorized",
                        redirectIfAuthedTo = "/",
                    }) {
    const { user, isUserLoading } = useUser();
    const isAuthed = !!(user && user.id);
    const location = useLocation();
    const hasToken = !!localStorage.getItem("jwtToken");
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
