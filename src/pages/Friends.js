import { Card, CardBody, CardFooter, CardHeader, Tooltip, Typography } from "@material-tailwind/react";
import { useUser } from "../context/UserProvider";
import SearchInput from "../assets/inputs/SearchInput";
import { useEffect, useState } from "react";
import { getRandomUsers } from "../utils/Utils";
import { useNavigate, useParams } from "react-router-dom";
import FriendsSkeleton from "../assets/loaders/FriendsSkeleton";

function Friends() {
    const { userId } = useParams();
    const { fetchUserFriendsById } = useUser();
    const [friendsData, setFriendsData] = useState(null);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadFriends = async () => {
            try {
                const data = await fetchUserFriendsById(userId);
                setFriendsData(data);
            } catch (error) {
                console.error('Failed to load friends:', error);
            }
        };

        if (userId) {
            loadFriends();
        }
    }, [userId, fetchUserFriendsById]);

    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
        } else if (friendsData?.friendList) {
            const filteredByName = friendsData.friendList.filter(friend =>
                friend.fullName.toLowerCase().includes(search.toLowerCase())
            );
            setResults(filteredByName);
        }
    }, [search, friendsData]);

    if (!friendsData) {
        return <div className="flex justify-center items-center h-screen"><FriendsSkeleton/></div>;
    }

    return (
        <div className="px-6 pt-6 bg-gray-100 w-full min-h-screen">
            <Typography variant="h5" color="blue-gray" className="text-center mb-6">
                Friends of {friendsData.fullName}
            </Typography>

            <div className="flex justify-center mb-6">
                <SearchInput onChange={(e) => setSearch(e.target.value)} />
            </div>

            {friendsData.friendList.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-6">
                    {(results.length > 0 ? results : (!search ? getRandomUsers(friendsData.friendList, 20) : [])).map((friend, index) => (
                        <Card
                            key={friend.id }
                            className="w-40 shadow-md cursor-pointer"
                            onClick={() => navigate(`/profile/${friend.id}`)}
                        >
                            <CardHeader floated={false} className="h-42">
                                <img
                                    className="w-full aspect-square object-contain rounded-md"
                                    src={friend.profilePictureUrl}
                                    alt="profile-picture"
                                />
                            </CardHeader>
                            <CardBody className="text-center h-20">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    {friend.fullName}
                                </Typography>
                                <Typography color="indigo" variant="small" className="font-small">
                                    @{friend.username}
                                </Typography>
                            </CardBody>
                            <CardFooter className="flex justify-center gap-7 pt-2" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                        alt="No Friends"
                        className="w-32 h-32 mb-4 opacity-70"
                    />
                    <Typography variant="h5" className="text-center">
                        No friends found
                    </Typography>
                </div>
            )}
        </div>
    );
}

export default Friends;
