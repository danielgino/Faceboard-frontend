import { Users, MessageCircle, Settings, Search } from "lucide-react";
import HeaderBarIcons from "../Icons/HeaderBarIcons"
import React from "react";

const SideBarIcons = {
    Profile: (props) => <HeaderBarIcons.Profile {...props}/>,
    Friends: (props) => <Users size={24} strokeWidth={1.75} {...props}/>,
    Inbox: (props) => <MessageCircle size={24} strokeWidth={1.75} {...props}/>,
    Settings: (props) => <Settings size={24} strokeWidth={1.75} {...props}/>,
    Search: (props) => <Search size={24} strokeWidth={1.75} {...props}/>,
    Logout: (props) => <HeaderBarIcons.Logout {...props}/>,
};

export default SideBarIcons;
