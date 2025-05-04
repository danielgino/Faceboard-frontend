
import {Card, Typography, List, ListItem, ListItemPrefix, ListItemSuffix, Chip,} from "@material-tailwind/react";
import {PresentationChartBarIcon, ShoppingBagIcon, UserCircleIcon, Cog6ToothIcon, InboxIcon, PowerIcon,} from "@heroicons/react/24/solid";
import {useNavigate} from "react-router-dom";
import {
    CHAT_PAGE,
    FRIENDS_BTN_TEXT, FRIENDS_PAGE,
    INBOX_BTN_TEXT,
    LOGOUT_BTN_TEXT, NOTIFICATIONS_BTN_TEXT,
    PROFILE_BTN_TEXT,
    PROFILE_PAGE,
    PROFILE_PAGE_LINK, SEARCH_BTN_TEXT, SEARCH_PAGE, SETTINGS_BTN_TEXT, SETTINGS_PAGE, WEBSITE_NAME
} from "../../utils/Utils";
import {useUser} from "../../context/UserProvider";
import SideBarIcons from "../../Icons/SideBarIcons";
import logoPNG from "../../assets/logo/logoPNG.png"
import Notification from "../interaction/Notification";
import React, {useState} from "react";
import {useMessages} from "../../context/MessageProvider";

export function SideBar() {
    const navigate = useNavigate();
    const{user}=useUser()
    const [open, setOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const { messages } = useMessages(); // כאן מוסיפים

    const getTotalUnread = () => {
        let count = 0;
        Object.values(messages).forEach(msgArray => {
            msgArray.forEach(msg => {
                if (!msg.isRead && msg.senderId !== user.id) {
                    count++;
                }
            });
        });
        return count;
    };

    const unreadTotal = getTotalUnread();

    const handleProfile=()=>{
        navigate(PROFILE_PAGE(user.id))
    }
    const handleFriends=()=>{
        navigate(FRIENDS_PAGE(user.id))
    }
    const handleChatPage=()=>{
        navigate(CHAT_PAGE)
    }
    const handleSearchPage=()=>{
        navigate(SEARCH_PAGE)
    }
    const handleSettingsPage=()=> {
        navigate(SETTINGS_PAGE)
    }

  const handleLogout = (e) => {
      e.preventDefault();
      localStorage.removeItem('jwtToken');
      navigate('/');
  }

    return (
        <>
       
        <Card className="hidden md:block sticky top-24 h-[calc(100vh-1rem)] w-64 ml-8 p-4 shadow-xl  shadow-blue-gray-900/5">


        <div className="mb-2 p-4">
            <img src={logoPNG} alt="Faceboard logo" />
                {/*<Typography variant="h5" color="blue-gray">*/}

                {/*    {WEBSITE_NAME}*/}
                {/*</Typography>*/}
            {/*<img src={FaceBoardLogo} alt="logo" style={{ width: '200px', height: '200px' }}/>*/}
        </div>
            <List>
                <ListItem onClick={handleProfile} >
                    <ListItemPrefix>
                        <SideBarIcons.profile className="h-5 w-5" />
                    </ListItemPrefix>
                    {PROFILE_BTN_TEXT}
                </ListItem>

                <ListItem  onClick={handleFriends}>
                    <ListItemPrefix>
                        <SideBarIcons.friends className="h-5 w-5" />
                    </ListItemPrefix>
                    {FRIENDS_BTN_TEXT}
                </ListItem>

                <ListItem onClick={handleChatPage}>
                    <ListItemPrefix>
                        <SideBarIcons.inbox className="h-5 w-5"/>
                    </ListItemPrefix>
                    {INBOX_BTN_TEXT}


                    <ListItemSuffix>
                        {unreadTotal > 0 && (
                            <Chip value={unreadTotal} size="sm" variant="ghost" color="blue-gray" className="rounded-full" />
                        )}
                        {/*<Chip value="14" size="sm" variant="ghost" color="blue-gray" className="rounded-full"/>*/}
                    </ListItemSuffix>


                </ListItem>

                <ListItem onClick={handleSettingsPage}>
                    <ListItemPrefix>
                        <SideBarIcons.settings className="h-5 w-5"/>
                    </ListItemPrefix>
                    Settings
                </ListItem>
                <ListItem onClick={handleLogout}>
                    <ListItemPrefix>
                        <SideBarIcons.logout className="h-5 w-5"/>
                    </ListItemPrefix>
                    {LOGOUT_BTN_TEXT}
                </ListItem>
            </List>
        </Card>

            {/* Bottom Navigation for Mobile */}
            <div
                className="fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around items-center h-16 md:hidden z-50">
                <button onClick={handleProfile} className="flex flex-col items-center text-xs">
                    <SideBarIcons.profile className="h-5 w-5 mb-1"/>
                    {PROFILE_BTN_TEXT}
                </button>


                <button className="flex flex-col items-center text-xs">
                        <Notification showLabel={false} />
                </button>
                <button onClick={handleSearchPage} className="flex flex-col items-center text-xs">
                    <SideBarIcons.search className="h-5 w-5 mb-1"/>
                    {SEARCH_BTN_TEXT}
                </button>
                <button onClick={handleChatPage} className="flex flex-col items-center text-xs relative">
                    <SideBarIcons.inbox className="h-5 w-5 mb-1"/>
                    {INBOX_BTN_TEXT}
                    <span
                        className="absolute -top-1 -right-2 bg-blue-600 text-white text-[10px] rounded-full px-1">14</span>
                </button>
                <button onClick={handleSettingsPage} className="flex flex-col items-center text-xs relative">
                    <SideBarIcons.settings className="h-5 w-5 mb-1"/>
                    {SETTINGS_BTN_TEXT}
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center text-xs">
                    <SideBarIcons.logout className="h-5 w-5 mb-1"/>
                    {LOGOUT_BTN_TEXT}
                </button>

            </div>
        </>
    );
}

export default SideBar