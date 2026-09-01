import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Link2, Check, Search, Send } from "lucide-react";
import { sharePostUrl } from "../../utils/Utils";
import { useUser } from "../../context/UserProvider";
import { useWebSocketContext } from "../../context/WebSocketProvider";
import { Avatar as PrimitiveAvatar } from "../common/Avatar";
import Swal from "../../utils/swalTheme";

// Modeled on LikeList.js's overlay/dialog chrome (scrim, header with icon +
// title + close button, scrollable row list) - kept deliberately simpler:
// no pagination/infinite-scroll (a friends list is already fully loaded via
// user.friendsList) and no focus-trap (Escape-to-close + backdrop-click are
// enough for a small, short-lived picker like this).
function SharePostModal({ postId, onClose }) {
    const { user } = useUser();
    const { sendMessage } = useWebSocketContext();

    const [copied, setCopied] = useState(false);
    const [query, setQuery] = useState("");
    const [sentTo, setSentTo] = useState(new Set());

    const dialogRef = useRef(null);
    const closeButtonRef = useRef(null);

    const shareUrl = useMemo(() => sharePostUrl(postId), [postId]);

    const friends = useMemo(() => user?.friendsList ?? [], [user]);
    const filteredFriends = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return friends;
        return friends.filter((friend) => friend.fullName?.toLowerCase().includes(q));
    }, [friends, query]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        closeButtonRef.current?.focus();
    }, []);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy share link:", error);
        }
    };

    // sendMessage publishes over STOMP with no server ACK/response - this
    // only confirms the client handed the message to the WebSocket client
    // for publishing, not that the server persisted or delivered it. The
    // success feedback below is worded accordingly (a local "sent" signal,
    // not a delivery confirmation).
    const handleSendToFriend = (friend) => {
        sendMessage({
            senderId: user.id,
            receiverId: friend.id,
            message: shareUrl,
            sentTime: new Date().toISOString(),
        });
        setSentTo((prev) => new Set(prev).add(friend.id));
        Swal.fire({ title: "Post shared", text: `Sent to ${friend.fullName}.`, icon: "success" });
    };

    return (
        <div
            className="fixed inset-0 bg-dsScrim flex justify-center items-center z-[9999] p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Share post"
            ref={dialogRef}
        >
            <div
                className="w-full max-w-sm max-h-[80vh] bg-white rounded-ds-lg shadow-ds-modal overflow-y-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-start gap-2.5 bg-white px-[18px] pt-[18px] pb-4 border-b border-dsNeutral-100">
                    <span className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 bg-dsBrand-50">
                        <Link2 size={15} strokeWidth={2} className="text-dsBrand-600" />
                    </span>
                    <h2 className="flex-1 pt-1 text-ds-card-title text-dsNeutral-900">Share post</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-dsNeutral-100 hover:bg-dsNeutral-200 transition flex items-center justify-center flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing"
                        aria-label="Close"
                        ref={closeButtonRef}
                    >
                        <X size={14} strokeWidth={2} className="text-dsNeutral-600" />
                    </button>
                </div>

                <div className="px-[18px] pt-4 pb-3 border-b border-dsNeutral-100">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="flex-1 min-w-0 h-9 px-3 rounded-control border border-dsNeutral-200 text-ds-caption text-dsNeutral-600 bg-dsNeutral-50 truncate"
                            onFocus={(e) => e.target.select()}
                        />
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="flex-shrink-0 h-9 px-3.5 rounded-control bg-dsBrand-600 text-white text-xs font-semibold hover:bg-dsBrand-700 transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing"
                        >
                            {copied ? <Check size={14} strokeWidth={2.5} /> : <Link2 size={14} strokeWidth={2} />}
                            {copied ? "Copied" : "Copy link"}
                        </button>
                    </div>
                </div>

                <div className="px-[18px] pt-3 pb-1">
                    <p className="text-ds-caption font-semibold text-dsNeutral-500 mb-2">Send to a friend</p>
                    {friends.length > 4 && (
                        <div className="relative mb-2">
                            <Search size={14} strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dsNeutral-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search friends"
                                className="w-full h-8 pl-8 pr-3 rounded-control border border-dsNeutral-200 text-ds-caption text-dsNeutral-900 outline-none focus:border-dsBrand-600 focus:ring-4 focus:ring-dsFocusRing"
                            />
                        </div>
                    )}
                </div>

                {filteredFriends.length === 0 ? (
                    <div className="px-[18px] py-8 text-center">
                        <p className="text-ds-body text-dsNeutral-500">
                            {friends.length === 0 ? "You have no friends to share with yet." : "No friends match your search."}
                        </p>
                    </div>
                ) : (
                    <div className="px-[18px] pb-[18px] divide-y divide-dsNeutral-100">
                        {filteredFriends.map((friend) => (
                            <div key={friend.id} className="flex items-center gap-3 py-2.5">
                                <PrimitiveAvatar size={36} src={friend.profilePictureUrl} name={friend.fullName} alt={friend.fullName} />
                                <p className="flex-1 min-w-0 text-ds-user-name text-dsNeutral-900 truncate">{friend.fullName}</p>
                                <button
                                    type="button"
                                    onClick={() => handleSendToFriend(friend)}
                                    disabled={sentTo.has(friend.id)}
                                    className="flex-shrink-0 h-8 px-3 rounded-control bg-dsBrand-600 text-white text-xs font-semibold hover:bg-dsBrand-700 transition disabled:bg-dsNeutral-100 disabled:text-dsNeutral-400 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing"
                                >
                                    {sentTo.has(friend.id) ? <Check size={13} strokeWidth={2.5} /> : <Send size={13} strokeWidth={2} />}
                                    {sentTo.has(friend.id) ? "Sent" : "Send"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SharePostModal;
