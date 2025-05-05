import {Card, CardHeader, CardBody, CardFooter, Typography, Tooltip,Avatar,Button} from "@material-tailwind/react";
import {useUser} from "../../context/UserProvider";
import { useEffect ,useMemo} from "react";
import { Link } from "react-router-dom";
import CardSkeletonLoader from "../../assets/loaders/CardSkeletonLoader";
import {ALBUM_PAGE, GenderEnum} from "../../utils/Utils";
import FriendsCard from "./FriendsCard";
import useProfilePictureUpload from "../../context/useProfilePictureUpload";
import RandomIcons from "../../Icons/RandomIcons";
import {useLightbox} from "../../context/LightBoxContext";
import TryButt from "../../assets/buttons/TryButt";
import noPhotosYet from "../../assets/photos/noPhotosYet.png"
import { useFriendship } from "../../context/FriendshipProvider";
import Swal from 'sweetalert2'
import FriendshipStatus from "../../enums/FriendshipStatus";

 function UserDetails({otherUserId}) {
    const { user, otherUser, fetchUserDetailsById,clearOtherUser,isOtherUserLoading ,fetchUserDetails,setUser,fetchUserPostImages,userImages} = useUser();
     const {  uploading, handleFileChange,handleRemoveProfilePicture } = useProfilePictureUpload(user, setUser);
     const { openLightbox } = useLightbox();
     const {friendStatus, checkFriendStatus, sendFriendRequest, acceptFriendRequest, declineFriendRequest,removeFriendship} = useFriendship();

     const handleImageClick = (index) => {
         openLightbox(userImages, index);
     };
     useEffect(() => {
         const token = localStorage.getItem('jwtToken');
         if (token && !user) {
             fetchUserDetails(token);
         }
     }, [user, fetchUserDetails]);

     useEffect(() => {
         if (otherUserId && user) {
             clearOtherUser();
             fetchUserPostImages(otherUserId)
             fetchUserDetailsById(otherUserId);
         }
     }, [otherUserId, user]);


     const latestImages = useMemo(() => {
         if (!userImages) return [];
         return [...userImages].slice(-4).reverse();
     }, [userImages]);

     const currentUser = otherUserId ? otherUser : user;
     const isOwnProfile = user && Number(user.id) === Number(otherUserId);


     useEffect(() => {
         if (user && otherUser && user.id !== otherUser.id) {
             checkFriendStatus(user.id, otherUser.id);
         }
     }, [user, otherUser]);

     // const isLoading = !user || !currentUser;
     const isLoading = !user || !currentUser || (otherUserId && isOtherUserLoading);

     if (isLoading) {
         return (
             <div className="w-full flex flex-col gap-6">
                 <CardSkeletonLoader />
                 <CardSkeletonLoader />
                 <CardSkeletonLoader />
             </div>
         );
     }

    return (
        <div className="w-full flex flex-col gap-6">
            <Card className="mt-6 w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <CardHeader floated={false} className="overflow-hidden rounded-t-lg" >
                    <div className="relative w-full h-full">
                        <img src={currentUser.profilePictureUrl} alt={currentUser.name+ "Profile Picture"} className="w-full h-full object-cover"
                        />

                        {isOwnProfile && (
                            <div className="absolute bottom-2 right-2 flex flex-row items-center gap-2">
                                <label className="cursor-pointer">
                                    {uploading ? "Uploading..." : ""}
                                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*"/>
                                    <div className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                                        <RandomIcons.Edit/>
                                    </div>
                                </label>


                                <button
                                    onClick={handleRemoveProfilePicture}
                                    className="mt-1 text-red-600 hover:text-red-800"
                                    title="Remove Profile Picture"
                                >
                                    <div className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                                        <RandomIcons.TrashIcon className="size-6"/>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

            </CardHeader>
                <CardBody className="text-center">
                    <Typography variant="h4" color="blue-gray" className="mb-2">
                       {currentUser.fullName}
                    </Typography>

                    <Typography  color="indigo" className="font-medium font-bold" textGradient>
                        {currentUser.id === 1 ? "CEO / Co-Founder" : ""}
                    </Typography>

                    {/* הצג כפתורי חברות רק אם זה לא הפרופיל של המשתמש עצמו */}
                    {Number(otherUserId) !== Number(user.id) && (
                        <div className="flex flex-col items-center gap-2 mt-4">

                            {friendStatus?.status === FriendshipStatus.PENDING && friendStatus.senderId !== user.id ? (
                                <div>
                                    <Typography variant="h6"> Sent you a Friend Request</Typography>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => acceptFriendRequest(user.id, otherUser.id)}
                                        color="green"
                                        variant="gradient"
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: "Reject Request?",
                                                text: `Are you sure to reject request from ${currentUser.name}?`,
                                                icon: "warning",
                                                showCancelButton: true,
                                                confirmButtonText: "Yes,Reject",
                                                cancelButtonText: "Cancel",
                                            });

                                            if (result.isConfirmed) {
                                                console.log("Declining friend request", { senderId: otherUserId, receiverId: user.id });
                                                await declineFriendRequest(user.id, otherUser.id);
                                            }
                                        }}
                                        color="red"
                                        variant="gradient"
                                    >
                                        Reject
                                    </Button>
                                </div>
                                </div>

                            ) : (
                                <Button
                                    onClick={async () => {
                                        if (friendStatus?.status === FriendshipStatus.ACCEPTED) {
                                            const result = await Swal.fire({
                                                title: "Unfriend?",
                                                text: `Are You Sure you want to cancel Friendship with ${currentUser.name}?`,
                                                icon: "warning",
                                                showCancelButton: true,
                                                confirmButtonText: "Yes,Remove",
                                                cancelButtonText: "Cancel",
                                            });

                                            if (result.isConfirmed) {
                                                await removeFriendship(user.id, otherUser.id);
                                            }
                                        } else if (
                                            !friendStatus ||
                                            friendStatus.status !== FriendshipStatus.PENDING
                                        ) {
                                            await sendFriendRequest(user.id, otherUser.id);
                                        }
                                    }}
                                    color="blue"
                                >
                                    {friendStatus?.status === FriendshipStatus.PENDING
                                        ? friendStatus.senderId === user.id
                                            ? "Requested"
                                            : "Awaiting Response"
                                        : friendStatus?.status === FriendshipStatus.ACCEPTED
                                            ? "Friends"
                                            : "Add Friend"}
                                </Button>
                            )}
                        </div>
                    )}
                </CardBody>

        </Card>

            <Card className="mt-6 w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
                <CardBody>
                    <Typography variant="h5" color="blue-gray" className="mb-2">About {currentUser.name}</Typography>

                    <div
                        className="bg-gray-50 rounded-md p-2 max-h-32 overflow-y-auto whitespace-pre-line break-words">
                        {currentUser.bio || "No bio yet"}
                    </div>
                    <p>Gender: {currentUser.gender === GenderEnum.MALE ? "Male" : "Female"}</p>
                    <p>Age: {currentUser.birthDate}</p>
                    {isOwnProfile && <p>Email: {currentUser.email}</p>}
                    {/*<p>Joined on {currentUser.createdAt}</p>*/}


                </CardBody>
                <CardFooter className="flex justify-center gap-7 pt-2">
                    <Tooltip content="Facebook Profile">
                        <Typography as="a" href="#facebook" variant="lead" color="blue" textGradient>
                            <i className="fab fa-facebook text-4xl" />
                        </Typography>
                    </Tooltip>
                    <Tooltip content="Follow on Instagram">
                        <Typography as="a" href="#instagram" variant="lead" color="purple" textGradient>
                            <i className="fab fa-instagram text-4xl" />
                        </Typography>
                    </Tooltip>
                    <Tooltip content="Follow">
                        <Typography as="a" href="#twitter" variant="lead" color="light-blue" textGradient>
                            <i className="fab fa-twitter text-4xl" />
                        </Typography>
                    </Tooltip>
                </CardFooter>
            </Card>

            <Card className="mt-6 w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
                <CardBody>
                    <Typography variant="h5" color="blue-gray" className="mb-2">
                        <Link to={ALBUM_PAGE(currentUser.id)}>
                            <button>Photos</button>
                        </Link>
                        {userImages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-60 bg-gray-100 rounded-md">
                                <img
                                    src={noPhotosYet}
                                    alt="No photos yet"
                                    className="w-24 h-24 object-contain opacity-60"
                                />
                                <p className="text-gray-500 mt-2 text-sm">No photos uploaded yet</p>
                            </div>
                        ) : (
                            <div className="relative grid grid-cols-2 gap-3">
                                {latestImages.map((image, index) => {
                                    const realIndex = userImages.findIndex(img => img === image);
                                    return (
                                    <div key={index}
                                         className="group relative overflow-hidden rounded-xl shadow-sm border border-gray-200"
                                         onClick={()=>handleImageClick(realIndex)}
                                    >
                                        <img

                                            className="w-full h-40 object-contain transform group-hover:scale-105 transition duration-300"
                                            src={image}
                                            alt=""
                                        />
                                    </div>);
                                })}
                            </div>
                        )}
                        <Typography as="div" variant="small" color="blue-gray" className="mb-2">
                        {userImages.length>4 &&(

                            <Link to={ALBUM_PAGE(currentUser.id)}>
                   <TryButt text="View all" fontSize="14px"/>
                            </Link>
                        )}
                        </Typography>
                    </Typography>
                </CardBody>
            </Card>
           <FriendsCard user={currentUser}/>

        </div>
    );
}
export default UserDetails