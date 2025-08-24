import { Card, CardBody, Typography} from "@material-tailwind/react";
import { FRIENDS_BTN_TEXT, FRIENDS_PAGE, getRandomUsers, PROFILE_PAGE} from "../../utils/Utils";
import {Link} from "react-router-dom";
import React, {useMemo} from "react";

function FriendsCard({user}){
const visibleFriends=getRandomUsers(user.friendsList,6);
const hasMoreFriends=user.friendsList.length>6;

    const randomFriends = useMemo(() => {
        return getRandomUsers(user.friendsList, 6);
    }, [user]);
    return (
        <div>
            <Card className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-md mx-auto px-2 sm:px-4">
            <CardBody>
                    <Typography variant="h5" color="blue-gray" className="mb-2">
                            <Link to={FRIENDS_PAGE(user.id)}>
                            <button>{FRIENDS_BTN_TEXT}</button>
                        </Link>
                         ({user.friendsList.length})
                    </Typography>
                    <div className="grid grid-cols-3 gap-4">
                        {visibleFriends.length > 0 ? randomFriends.map((friend) => (
                            <div key={friend.id} className="text-center">
                                <Link to={PROFILE_PAGE(friend.id)}>
                                    <img
                                        className="w-full aspect-square object-contain object-center rounded-md transition-transform duration-300 hover:scale-105"
                                        src={friend.profilePictureUrl}
                                        alt={`${friend.fullName}`}
                                    />
                                </Link>
                                <Link
                                    className="block mt-2 text-sm hover:underline"
                                    to={PROFILE_PAGE(friend.id)}
                                >
                                    {friend.fullName}
                                </Link>
                            </div>

                        )) : "No Friends yet"}
                    </div>
                    {hasMoreFriends && (
                        <div className="mt-4 text-center">
                            <Link
                                to={FRIENDS_PAGE(user.id)}
                                className="text-blue-500 hover:underline text-sm"
                            >
                                View all friends
                            </Link>
                            </div>
                        )}
                </CardBody>
            </Card>
        </div>

);
}

export default FriendsCard