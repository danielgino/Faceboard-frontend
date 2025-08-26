import './App.css';
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import Album from "./pages/Album";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {UserProvider} from "./context/UserProvider";
import { PostProvider } from './context/PostProvider';
import MainLayout from "./components/layout/MainLayout";
import {
    ABOUT_PAGE,
    ALBUM_PAGE_LINK,
    CHAT_PAGE, FORGOT_PASSWORD_PAGE,
    FRIENDS_PAGE_LINK,
    HOME_PAGE,
    LOGIN_PAGE,
    MOBILE_NOTIFICATIONS_PAGE,
    PROFILE_PAGE_LINK, RESET_PASSWORD_PAGE,
    SEARCH_PAGE,
    SETTINGS_PAGE,
    SIGNUP_PAGE, SINGLE_POST_PAGE_LINK,
    UNAUTHORIZED_PAGE
} from "./utils/Utils";
import {SearchProvider} from "./context/SearchProvider";
import SearchPage from "./pages/SearchPage";
import Settings from  "./pages/Settings";
import 'animate.css';
import Chat from "./pages/chat/Chat";
import {MessageProvider} from "./context/MessageProvider";
import Friends from "./pages/Friends";
import {LightboxProvider} from "./context/LightBoxContext";
import GlobalImageLightbox from "./assets/imagelightbox/GlobalImageLightbox";
import {NotificationProvider} from "./context/NotificationProvider";
import {WebSocketProvider} from "./context/WebSocketProvider";
import WebSocketHandler from "./service/WebSocketHandler";
import {FriendshipProvider} from "./context/FriendshipProvider";
import {StoryProvider} from "./context/StoryProvider";
import MobileNotifications from "./pages/MobileNotifications";
import RouteGuard from "./utils/RouteGuard";
import Unauthorized from "./pages/Unauthorized";
import Page404 from "./pages/Page404";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SinglePostPage from "./pages/SinglePostPage";
import About from "./pages/About";

function App() {
    return (
        <UserProvider>
            <LightboxProvider>
                <GlobalImageLightbox/>
                <Router>
                    <SearchProvider>
                        <Routes>
                            <Route element={<RouteGuard auth="public" redirectIfAuthedTo={HOME_PAGE} />}>
                                <Route path={SIGNUP_PAGE} element={<SignUp/>}/>
                                <Route path={LOGIN_PAGE} element={<Login />} />
                                <Route path={FORGOT_PASSWORD_PAGE} element={<ForgotPassword/>} />
                                <Route path={RESET_PASSWORD_PAGE} element={<ResetPassword/>} />
                                <Route path={ABOUT_PAGE} element={<About/>}/>
                            </Route>
                            <Route element={<RouteGuard auth="protected" redirectTo={UNAUTHORIZED_PAGE}/>}>
                                <Route element={
                                    <FriendshipProvider>
                                        <NotificationProvider>
                                            <MessageProvider>
                                                <WebSocketProvider>
                                                    <WebSocketHandler />
                                                    <StoryProvider>
                                                        <PostProvider>
                                                            <MainLayout />
                                                        </PostProvider>
                                                    </StoryProvider>
                                                </WebSocketProvider>
                                            </MessageProvider>
                                        </NotificationProvider>
                                    </FriendshipProvider>
                                }>
                                    <Route path={HOME_PAGE} element={<Home />} />
                                    <Route path={FRIENDS_PAGE_LINK} element={<Friends />} />
                                    <Route path={MOBILE_NOTIFICATIONS_PAGE} element={<MobileNotifications/>} />
                                    <Route path={CHAT_PAGE} element={<Chat />} />
                                    <Route path={PROFILE_PAGE_LINK} element={<Profile />} />
                                    <Route path={ALBUM_PAGE_LINK} element={<Album />} />
                                    <Route path={SEARCH_PAGE} element={<SearchPage />} />
                                    <Route path={SETTINGS_PAGE} element={<Settings />} />
                                    <Route path={SINGLE_POST_PAGE_LINK} element={<SinglePostPage />} />

                                </Route>
                            </Route>
                            <Route path={UNAUTHORIZED_PAGE} element={<Unauthorized />} />
                            <Route path="*" element={<Page404 />} />
                        </Routes>
                    </SearchProvider>
                </Router>
            </LightboxProvider>
        </UserProvider>
    );
}

export default App;
