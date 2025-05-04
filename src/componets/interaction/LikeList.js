import React, { useState, useEffect } from "react";
import { Card, CardBody, Typography, Avatar, Button } from "@material-tailwind/react";
import { PROFILE_PAGE } from "../../utils/Utils";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserProvider";
import { useFriendship } from "../../context/FriendshipProvider";

function LikeList({ likedUsers, onClose }) {
    const { user } = useUser();
    const { sendFriendRequest, checkFriendStatus } = useFriendship();

    const [sentRequests, setSentRequests] = useState([]);
    const [friendStatuses, setFriendStatuses] = useState({}); 
    const [loadingStatuses, setLoadingStatuses] = useState(true);

    useEffect(() => {
        const fetchStatuses = async () => {
            if (!user) return;

            const statuses = {};
            for (const likedUser of likedUsers) {
                if (likedUser.userId !== user.id) {
                    try {
                        const status = await checkFriendStatus(user.id, likedUser.userId);
                        statuses[likedUser.userId] = status;
                    } catch (error) {
                        console.error("Error checking friend status:", error);
                        statuses[likedUser.userId] = null;
                    }
                }
            }
            setFriendStatuses(statuses);
            setLoadingStatuses(false); // סיימנו לטעון
        };

        fetchStatuses();
    }, [likedUsers, user]);

    // שליחת בקשת חברות
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

    // אם סטטוסים עוד נטענים
    if (loadingStatuses) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <Card className="w-96 max-h-[80vh] overflow-y-auto">
                    <CardBody>
                        <Typography variant="h6" color="blue-gray">
                            Loading friend statuses...
                        </Typography>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <Card
                className="w-96 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <CardBody>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray">
                            Users Who Liked This Post
                        </Typography>
                        <button onClick={onClose} className="text-gray-600 hover:text-black text-lg">
                            ✕
                        </button>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {likedUsers.map(({ userId, fullName, username, profilePictureUrl }, index) => {
                            const isCurrentUser = user?.id === userId;
                            const userFriendStatus = friendStatuses[String(userId)];

                            return (
                                <div key={index} className="flex items-center justify-between py-3">
                                    <Link to={PROFILE_PAGE(userId)} className="flex items-center gap-x-3">
                                        <Avatar size="sm" src={profilePictureUrl} alt={fullName} />
                                        <div>
                                            <Typography color="blue-gray" variant="h6">
                                                {fullName}
                                            </Typography>
                                            <Typography variant="small" color="gray">
                                                @{username}
                                            </Typography>
                                        </div>
                                    </Link>

                                    <div className="ml-4">
                                        {console.log("Check",userFriendStatus)}
                                        {!isCurrentUser && (

                                            userFriendStatus?.status === "ACCEPTED" ? (
                                                <Button size="sm" variant="filled" color="blue-gray" disabled>
                                                    Friend
                                                </Button>
                                            ) : userFriendStatus?.status === "PENDING" ? (
                                                <Button size="sm" variant="outlined" disabled>
                                                    Requested
                                                </Button>
                                            ) : sentRequests.includes(userId) ? (
                                                <Button size="sm" variant="outlined" disabled>
                                                    Requested
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outlined"
                                                    onClick={() => handleSendFriendRequest(userId)}
                                                >
                                                    Add Friend
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export default LikeList;
