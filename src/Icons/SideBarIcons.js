import {
    PresentationChartBarIcon,
    ShoppingBagIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    InboxIcon,
    PowerIcon
} from "@heroicons/react/24/solid";
import HeaderBarIcons from "../Icons/HeaderBarIcons"
import React from "react";

const SideBarIcons = {
    profile: () => <HeaderBarIcons.Profile/>,
    friends: () =>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
             className="icon icon-tabler icons-tabler-outline icon-tabler-users">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>
        </svg>
    ,
    inbox: () =>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
             className="icon icon-tabler icons-tabler-outline icon-tabler-message">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M8 9h8"/>
            <path d="M8 13h6"/>
            <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"/>
        </svg>
    ,
    settings: () =>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
             className="icon icon-tabler icons-tabler-outline icon-tabler-settings">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path
                d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/>
            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>
        </svg>
    ,
    search: () =>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
             className="icon icon-tabler icons-tabler-outline icon-tabler-search">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/>
            <path d="M21 21l-6 -6"/>
        </svg>,
    logout: () =>
        <HeaderBarIcons.Logout/>
    ,
};

export default SideBarIcons;
