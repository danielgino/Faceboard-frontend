import React from "react";
import { House, Bell, User, LogOut, Code, Image } from "lucide-react";

const HeaderBarIcons = {

    Feed: (props) => <House size={24} strokeWidth={1.75} {...props}/>,

    Notification: (props) => <Bell size={24} strokeWidth={1.75} {...props}/>,

    Profile: (props) => <User size={24} strokeWidth={1.75} {...props}/>,

    Logout: (props) => <LogOut size={24} strokeWidth={1.75} {...props}/>,

    About: (props) => <Code size={23} strokeWidth={1.75} {...props}/>,

    // design: `image` (singular) - was Images (the multi-photo-stack glyph)
    Gallery: (props) => <Image size={24} strokeWidth={1.75} {...props}/>

};

export default HeaderBarIcons;
