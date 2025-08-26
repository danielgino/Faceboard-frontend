import React from "react";

const HeaderBarIcons = {

    Feed: () => (

        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
             className="icon icon-tabler icons-tabler-outline icon-tabler-home"><path stroke="none"
                                                                                      d="M0 0h24v24H0z" fill="none"/><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>
    )  ,

    Notification: ()=> (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
             className="icon icon-tabler icons-tabler-outline icon-tabler-bell">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/>
            <path d="M9 17v1a3 3 0 0 0 6 0v-1"/>
        </svg>
    ),

    Profile: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
             className="icon icon-tabler icons-tabler-outline icon-tabler-user-circle">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
            <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
            <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/>
        </svg>
    ),
        Logout: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                 className="icon icon-tabler icons-tabler-outline icon-tabler-power">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M7 6a7.75 7.75 0 1 0 10 0"/>
                <path d="M12 4l0 8"/>
            </svg>
        ),
        About: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                 className="icon icon-tabler icons-tabler-outline icon-tabler-code">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M7 8l-4 4l4 4"/>
                <path d="M17 8l4 4l-4 4"/>
                <path d="M14 4l-4 16"/>
            </svg>
        ),

    Gallery: ()=> (
        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
             className="icon icon-tabler icons-tabler-outline icon-tabler-photo">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M15 8h.01"/>
            <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/>
            <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/>
            <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>
        </svg>
    )

    }
;

export default HeaderBarIcons;

