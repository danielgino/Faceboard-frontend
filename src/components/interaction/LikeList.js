import React, { useState, useEffect } from "react";
import { Card, CardBody, Typography, Avatar, Button } from "@material-tailwind/react";
import {GET_LIKED_USERS_API, PROFILE_PAGE} from "../../utils/Utils";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserProvider";
import { useFriendship } from "../../context/FriendshipProvider";
import LikeLoader from "../../assets/loaders/LikeLoader";
import FriendshipStatus from "../../utils/enums/FriendshipStatus";

function LikeList({ postId, onClose }) {
    const { user } = useUser();
    const { sendFriendRequest, checkFriendStatus } = useFriendship();

    const [likedUsers, setLikedUsers] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [friendStatuses, setFriendStatuses] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchStatuses = async (users) => {
        const statuses = {};
        for (const u of users) {
            if (u.userId !== user.id) {
                try {
                    const status = await checkFriendStatus(user.id, u.userId);
                    statuses[u.userId] = status;
                } catch {
                    statuses[u.userId] = null;
                }
            }
        }
        setFriendStatuses(statuses);
    };

    useEffect(() => {
        const fetchLikedUsers = async () => {
            const token = localStorage.getItem("jwtToken");
            try {
                const res = await fetch(GET_LIKED_USERS_API(postId), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to load liked users");
                const data = await res.json();
                setLikedUsers(data);
            } catch (error) {
                console.error("Error fetching liked users:", error);
            }
        };


        const init = async () => {
            await fetchLikedUsers();
        };

        init();
    }, [postId]);

    useEffect(() => {
        if (likedUsers.length > 0) {
            fetchStatuses(likedUsers).then(() => setLoading(false));
        }
    }, [likedUsers]);

    const handleSendFriendRequest = async (userId) => {
        try {
            await sendFriendRequest(user.id, userId);
            setSentRequests(prev => [...prev, userId]);
            setFriendStatuses(prev => ({
                ...prev,
                [userId]: { status: "PENDING", senderId: user.id, receiverId: userId }
            }));
        } catch (error) {
            console.error("Failed to send friend request:", error);
        }
    };

    if (loading) return <LikeLoader />;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50" onClick={onClose}>
            <Card className="w-96 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <CardBody>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray">Users Who Liked This Post</Typography>
                        <button onClick={onClose} className="text-gray-600 hover:text-black text-lg">✕</button>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {likedUsers.map(({ userId, fullName, username, profilePictureUrl }) => {
                            const isCurrentUser = user?.id === userId;
                            const userFriendStatus = friendStatuses[String(userId)];

                            return (
                                <div key={userId} className="flex items-center justify-between py-3">
                                    <Link to={PROFILE_PAGE(userId)} className="flex items-center gap-x-3">
                                        <Avatar size="sm" src={profilePictureUrl} alt={fullName} />
                                        <div>
                                            <Typography color="blue-gray" variant="h6">{fullName}</Typography>
                                            <Typography variant="small" color="gray">@{username}</Typography>
                                        </div>
                                    </Link>
                                    {!isCurrentUser && (
                                        userFriendStatus?.status ===  FriendshipStatus.ACCEPTED ? (
                                            <Button size="sm" variant="filled" color="blue-gray" disabled>Friend</Button>
                                        ) : userFriendStatus?.status === FriendshipStatus.PENDING || sentRequests.includes(userId) ? (
                                            <Button size="sm" variant="outlined" disabled>Requested</Button>
                                        ) : (
                                            <Button size="sm" variant="outlined" onClick={() => handleSendFriendRequest(userId)}>Add Friend</Button>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
export default LikeList