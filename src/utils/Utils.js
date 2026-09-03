import { handleUnauthorized, JWT_STORAGE_KEY } from "./authCleanup";
import Swal from "./swalTheme";

export { JWT_STORAGE_KEY };

// Demo Mode: backend-authoritative denial codes from DemoAccessFilter (see
// DemoAccessFilter.java) - DEMO_READ_ONLY for any mutation attempt, DEMO_ACCESS_DENIED for a
// read outside the Demo allowlist. Centralized here (fetchWithAuth is the one choke point nearly
// every API call already goes through) instead of touching every mutation component
// individually - real users never see this, since the backend never returns these codes for a
// ROLE_USER session.
const DEMO_DENIAL_MESSAGES = {
    DEMO_READ_ONLY: "Demo mode is read-only.",
    DEMO_ACCESS_DENIED: "This isn't available in Demo mode.",
};

const showDemoDenialToast = (message) => {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: message,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
    });
};

export const getRandomUsers = (users, count) => {
    if (!users || users.length === 0) return [];
    const shuffled = [...users].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const getAge = (birthDateStr) => {
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// Wraps text in a Unicode directional isolate (RLI ... PDI) so the browser's
// bidi algorithm resolves it as one self-contained right-to-left run instead
// of reordering its numeric segments against whatever precedes/follows it.
// Works in every context formatDate's return value ends up in - JSX text,
// aria-label/attribute strings, and plain string concatenation alike - since
// (unlike a <bdi> element) it travels with the string itself. This is
// display-only formatting: it never touches the underlying Date/timestamp.
const isolateRTL = (text) => `⁧${text}⁩`;

// Shared full-date formatter (day/month/year, no relative-time logic) - the
// deterministic-locale + isolateRTL convention below is the same one
// formatDate already uses for its two absolute-date branches. Fixing the
// locale to 'he-IL' rather than the browser's own (`undefined`) is
// deliberate: leaving it to `undefined` made the same date render
// differently (and sometimes visually mis-ordered once RTL-embedded)
// depending on the viewer's OS/browser locale. Reused directly by formatDate
// below and by any other full-date display (e.g. profile birthday) instead
// of each call site inventing its own toLocaleDateString options.
const toDate = (value) => (value instanceof Date ? value : new Date(value));

export const formatFullDate = (dateValue, options = {day: '2-digit', month: 'long', year: 'numeric'}) => {
    const date = toDate(dateValue);
    return isolateRTL(date.toLocaleDateString('he-IL', options));
};

// Local-calendar-day comparison (the viewer's own timezone, via the Date
// object's local getters - not UTC, not the server's timezone). Chat day
// separators use this to detect a calendar-day boundary between consecutive
// messages: NOT a "more than 24h apart" comparison - 23:59 and 00:01 the
// next day are always two different days, and two messages 20 hours apart
// on the same calendar day are always one.
export const isSameCalendarDay = (a, b) => {
    const dateA = toDate(a);
    const dateB = toDate(b);
    return dateA.getFullYear() === dateB.getFullYear()
        && dateA.getMonth() === dateB.getMonth()
        && dateA.getDate() === dateB.getDate();
};

// Chat day-separator label for a message timestamp: "today"/"yesterday" in
// Hebrew, or a deterministic full Hebrew date (reusing formatFullDate above
// rather than a second date-formatting utility) for anything older.
export const getDaySeparatorLabel = (dateValue) => {
    const date = toDate(dateValue);
    const now = new Date();
    if (isSameCalendarDay(date, now)) return isolateRTL('היום');

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameCalendarDay(date, yesterday)) return isolateRTL('אתמול');

    return formatFullDate(date);
};

export const formatDate = (utcTime) => {
    const now = new Date();
    const date = new Date(utcTime);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const isLastYear = now.getFullYear() !== date.getFullYear();

    if (diffInMs < 1000 * 60) {
        return "Just now";
    } else if (diffInMs < 1000 * 60 * 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInMs < 1000 * 60 * 60 * 24) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    if (isLastYear) {
        return formatFullDate(date);
    }

    if (diffInDays === 1) {
        return "Yesterday";
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else if (diffInDays < 14) {
        return "A week ago";
    } else if (diffInDays < 21) {
        return "2 weeks ago";
    } else if (diffInDays < 30) {
        return "3 weeks ago";
    } else if (diffInDays < 60) {
        return "A month ago";
    } else {
        return formatFullDate(date, {day: '2-digit', month: 'long'});
    }
};
// Single reusable authenticated-fetch path (JWT audit, Option A). Reads the
// current token at request time (not captured once at import/render time),
// attaches it as a Bearer header, and preserves every other caller-supplied
// option/header untouched. Never sets Content-Type for a FormData body (that
// would strip the browser's auto-generated multipart boundary) and never
// overrides a Content-Type the caller already set. On a 401 it triggers the
// shared, idempotent unauthorized-cleanup path as a side effect, then still
// returns the original Response unchanged - callers' existing
// `if (!response.ok) throw ...` handling continues to work exactly as before
// for 401 and for every other non-2xx status; network errors and non-401
// HTTP errors are never translated or swallowed here.
export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    const { headers: callerHeaders, ...restOptions } = options;
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const hasContentType = callerHeaders && Object.keys(callerHeaders).some(
        (key) => key.toLowerCase() === "content-type"
    );

    const headers = {
        ...(callerHeaders || {}),
        Authorization: `Bearer ${token}`,
    };
    if (!isFormData && !hasContentType) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...restOptions,
        headers,
    });

    if (response.status === 401) {
        handleUnauthorized(LOGIN_PAGE);
    }

    if (response.status === 403) {
        // Read via a clone so the original response body stream is left untouched for the
        // caller - fetchWithAuth's contract is to hand back the real Response unmodified.
        try {
            const body = await response.clone().json();
            const message = body && DEMO_DENIAL_MESSAGES[body.code];
            if (message) {
                showDemoDenialToast(message);
            }
        } catch (e) {
            // Not a JSON body (e.g. a non-Demo 403) - nothing to surface here, caller's own
            // error handling takes over as before.
        }
    }

    return response;
};

export const formatTime = (utcTime) => {
    const date = new Date(utcTime.includes("Z") ? utcTime : utcTime + "Z");
    return date.toLocaleTimeString("he-IL", {
        timeZone: "Asia/Jerusalem",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};
// Phase J: the static (module-load-time, non-reactive) isMobile export that
// used to live here was removed - its one production consumer (StoryBar.js)
// migrated to the reactive useIsMobile() hook, and no other file referenced
// it (repo-wide reference check, zero remaining production/test usages).
export const UNAUTHORIZED_PAGE="/Unauthorized"
export const LOGIN_PAGE="/"
export const SIGNUP_PAGE="/signup"
export const ABOUT_PAGE="/about"
export const HOME_PAGE="/home"
export const SEARCH_PAGE="/search-page"
export const CHAT_PAGE="/chat"
export const MOBILE_NOTIFICATIONS_PAGE="/notifications"
export const SETTINGS_PAGE="/settings"
export const FORGOT_PASSWORD_PAGE="/forgot-password"
export const RESET_PASSWORD_PAGE="/reset-password"
    //
export const ALBUM_PAGE_LINK="/album/:userId"
export const FRIENDS_PAGE_LINK="/friends/:userId"
export const PROFILE_PAGE_LINK="/profile/:userId"
export const SINGLE_POST_PAGE_LINK="/post/:postId"
export const FRIENDS_PAGE=(userId)=> `/friends/${userId}`
export const PROFILE_PAGE = (userId) => `/profile/${userId}`;
export const ALBUM_PAGE= (userId) => `/album/${userId}`;
export const POST_PAGE = (postId) => `/post/${postId}`;

// Share feature: single source of truth for building/recognizing this app's
// own shareable post links, so the modal that builds the link and the chat
// renderer that recognizes it can never drift out of sync with each other.
export const sharePostUrl = (postId) => `${window.location.origin}${POST_PAGE(postId)}`;

// Deliberately an exact, whole-message match against the CURRENT origin
// (not a generic URL/host regex) - a shared-post message is never anything
// but this app's own link, so this must never treat an ordinary text
// message (even one that happens to contain an unrelated URL) as a shared
// post. Returns the postId string, or null if messageText isn't exactly one
// of these links.
export const extractSharedPostId = (messageText) => {
    if (typeof messageText !== "string") return null;
    const prefix = `${window.location.origin}/post/`;
    if (!messageText.startsWith(prefix)) return null;
    const rest = messageText.slice(prefix.length);
    return /^\d+$/.test(rest) ? rest : null;
};

export const API_BASE_URL = process.env.REACT_APP_API_URL;


//API


//PASSWORD RESET

export const RESET_PASSWORD_API=`${API_BASE_URL}/auth/reset-password`
export const FORGOT_PASSWORD_API=`${API_BASE_URL}/auth/forgot-password`

//API PROVIDERS
export const SIGNUP_API       = `${API_BASE_URL}/user/register`;
export const LOGIN_API        = `${API_BASE_URL}/auth/login`;
export const DEMO_LOGIN_API   = `${API_BASE_URL}/auth/demo`;
export const SETTINGS_API     = `${API_BASE_URL}/user/settings`;
//USER PROVIDERS

export const GET_USER_DETAILS_BY_ID=(userId)=> `${API_BASE_URL}/user/by-id?id=${userId}`
export const GET_USER_IMAGES_API = (userId) => `${API_BASE_URL}/post/${userId}/all-post-images`;
export const GET_USER_FRIENDS_PAGE_API=({ userId, page = 0, size = 20, query = '' })=>
    `${API_BASE_URL}/user/${userId}/friends/page?page=${page}&size=${size}${query ? `&query=${encodeURIComponent(query)}` : ''}`
export const AUTH_ME_API=`${API_BASE_URL}/auth/me`
//Profile Picture Provider

export const UPLOAD_PROFILE_PIC_API=(userId)=>`${API_BASE_URL}/user/${userId}/profile-picture`
export const DELETE_PROFILE_PIC_API=(userId)=>`${API_BASE_URL}/user/${userId}/profile-picture`
//Update Settings

export const UPDATE_SETTINGS_API=`${API_BASE_URL}/user/settings`
//Stories Apis

export const GET_FRIENDS_STORIES_API=`${API_BASE_URL}/api/stories/friends`
export const UPLOAD_STORY_API=`${API_BASE_URL}/api/stories/upload`

//Post Provider
export const GET_USER_POSTS_API=(userId)=> `${API_BASE_URL}/post/posts?userId=${userId}`
export const DELETE_POST_API=(postId)=>`${API_BASE_URL}/post/delete/${postId}`
export const EDIT_POST_API=(postId)=>`${API_BASE_URL}/post/edit/${postId}`
export const DELETE_COMMENT_API=(commentId)=>`${API_BASE_URL}/comments/delete/${commentId}`
// Shared by fetchPagePosts (PostProvider.js) and this URL builder - both
// represent the same logical setting (post-page request size) and must stay
// in sync; the effective value in production today is 10 (Feed.js never
// overrides it), so that's what this constant preserves.
export const POSTS_PAGE_SIZE = 10;
export const GET_PAGINATED_POSTS_API = ({ userId = null, page = 0, size = POSTS_PAGE_SIZE, isFeed = true }) =>
    isFeed
        ? `${API_BASE_URL}/post/feed?page=${page}&size=${size}`
        : `${API_BASE_URL}/post/posts?userId=${userId}&page=${page}&size=${size}`;
export const GET_POST_BY_ID = (id) => `${API_BASE_URL}/post/${id}`;

//Search
export const SEARCH_USERS_BY_NAME_API = (query) =>
    `${API_BASE_URL}/user/name?name=${encodeURIComponent(query)}`;
//Notifications
// Notification pagination follow-up: page/size are optional so the initial load (no params)
// keeps requesting exactly what it always has (newest NOTIFICATIONS_PAGE_SIZE). Mirrors the
// backend's NotificationService.DEFAULT_NOTIFICATIONS_PAGE_SIZE default.
export const NOTIFICATIONS_PAGE_SIZE = 50;
export const GET_NOTIFICATIONS_API = (page, size) =>
    `${API_BASE_URL}/notifications${page != null ? `?page=${page}${size != null ? `&size=${size}` : ""}` : ""}`
export const GET_UNREAD_NOTIFICATIONS_API =`${API_BASE_URL}/notifications/unread-count`
export const MARK_NOTIFICATIONS_AS_READ_API =`${API_BASE_URL}/notifications/mark-all-as-read`
//Friendship Provider
export const CHECK_FRIENDS_STATUS_API=(userId,friendId)=>`${API_BASE_URL}/friendship/status/${userId}/${friendId}`
export const SEND_FRIEND_REQUEST_API=(userId,otherUserId)=>`${API_BASE_URL}/friendship/send/${userId}/${otherUserId}`
export const ACCEPT_FRIEND_REQUEST_API=(userId,otherUserId)=>`${API_BASE_URL}/friendship/accept/${userId}/${otherUserId}`
export const REMOVE_FRIEND_API=(userId,otherUserId)=>`${API_BASE_URL}/friendship/remove/${userId}/${otherUserId}`
export const DECLINE_FRIEND_REQUEST_API=`${API_BASE_URL}/friendship/decline`
// SUG-002: cursor/seed/wrapped together are one traversal's cursor state - the caller must echo
// back exactly what the previous response returned for all three (see
// SuggestedFriendsResponseDTO/FriendshipService.getSuggestedFriends on the backend). Omit all
// three for the very first call of a fresh traversal.
export const SUGGESTED_FRIENDS_API=(cursor,seed,wrapped,limit)=>
    `${API_BASE_URL}/friendship/suggestions?${cursor != null ? `cursor=${cursor}&` : ""}${seed != null ? `seed=${seed}&` : ""}${wrapped != null ? `wrapped=${wrapped}&` : ""}limit=${limit}`
// TIP-001: no Gemini/AI involved - a curated static pool served from SafetyTipService.
export const SAFETY_TIP_API = `${API_BASE_URL}/safety-tips/random`;
// Posts
export const ADD_POST_API     = `${API_BASE_URL}/post/add`;
export const ADD_COMMENT_API  = `${API_BASE_URL}/comments/add-comment`;
export const ADD_LIKE_API     = `${API_BASE_URL}/likes/add-like`;
// L-DB4C: page/size are optional - omitting them keeps the previous default (newest bounded
// batch) behavior; callers pass them explicitly only when loading an older page. Sizes below
// mirror the backend defaults (CommentService/LikeService) so the frontend can detect
// exhaustion via `returnedItems.length < PAGE_SIZE` without extra response metadata.
export const COMMENTS_PAGE_SIZE = 20;
export const LIKES_PAGE_SIZE = 50;
export const GET_LIKED_USERS_API=(postId,page,size) =>`${API_BASE_URL}/likes/post/${postId}${page!=null?`?page=${page}${size!=null?`&size=${size}`:""}`:""}`
export const GET_COMMENTS_BY_POST=(postId,page,size)=>`${API_BASE_URL}/comments/post/${postId}${page!=null?`?page=${page}${size!=null?`&size=${size}`:""}`:""}`
//Messages

// M-DB2 frontend follow-up: page/size are optional so the initial load (no params) keeps
// requesting exactly what it always has (newest MESSAGES_PAGE_SIZE, chronological ASC) - only
// MessageProvider's fetchOlderMessages passes an explicit page, to walk further back in history.
// Mirrors the backend's MessageService.DEFAULT_CONVERSATION_PAGE_SIZE default.
export const MESSAGES_PAGE_SIZE = 50;
export const GET_CONVERSATION_BETWEEN_USERS_API=(userId,otherUserId,page,size)=>`${API_BASE_URL}/messages/conversation/${userId}/${otherUserId}${page!=null?`?page=${page}${size!=null?`&size=${size}`:""}`:""}`


//BUTTONS
export const PROFILE_BTN_TEXT="Profile";
export const FEED_BTN_TEXT="Feed";
export const NOTIFICATIONS_BTN_TEXT="Notifications"
export const FRIENDS_BTN_TEXT="Friends"
export const SEARCH_BTN_TEXT="Search"
export const SETTINGS_BTN_TEXT="Settings"
export const LOGOUT_BTN_TEXT="Log Out";
export const GALLERY_BTN_TEXT="Gallery"
///SideBar
export const INBOX_BTN_TEXT="Chat"
//ENUMS
export const GenderEnum = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
};


export const WEBSITE_NAME="Faceboard"
export const ALT_RANDOM_USERS="Random User"
///My Personal Links

export const DANIEL_FACEBOOK_ACCOUNT="https://www.facebook.com/Daniegino"
export const DANIEL_LINKEDIN_ACCOUNT="https://www.linkedin.com/in/daniel-gino-2b6350345/"
export const DANIEL_INSTAGRAM_ACCOUNT="https://www.instagram.com/daniel_gino"
export const DANIEL_GITHUB_ACCOUNT="https://github.com/danielgino"
export const DANIEL_EMAIL="Danielgino3@gmail.com"

// Single source of truth for the profile social-link policy (F2): empty,
// or HTTPS with the exact facebook.com/instagram.com host - textually
// mirrors the backend's UpdateUserDTO @Pattern constraints. Used both for
// input validation (Settings.js) and, combined with an explicit non-empty
// check, for deciding whether a stored value is safe to render as a
// clickable link (UserDetails.js) - so legacy/invalid stored values (e.g.
// scheme-less, accepted by the pattern this replaces) never render.
export const FACEBOOK_URL_REGEX = /^$|^https:\/\/(www\.)?facebook\.com\/[^\s]+$/;
export const INSTAGRAM_URL_REGEX = /^$|^https:\/\/(www\.)?instagram\.com\/[^\s]+$/;

// Shared SweetAlert2 styling for destructive "are you sure?" confirmations
// (post/comment deletion, unfriending, rejecting a friend request) - retones
// the confirm button red and swaps the icon badge/glyph to the design's
// DestructiveDialog trash icon (see utils/swalTheme.js for the glyph swap,
// keyed off customClass.icon). Both class names here are additive modifiers
// on top of SweetAlert2's own always-present .swal2-confirm/.swal2-icon
// (see SwalDesignTheme.css) - never a full customClass replacement, since a
// call site's customClass replaces the mixin's wholesale rather than
// merging with it.
export const SWAL_DESTRUCTIVE_CONFIRM_CLASS = {
    customClass: {
        confirmButton: "ds-swal-confirm--destructive",
        icon: "ds-swal-icon--destructive",
    },
};

