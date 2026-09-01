import {useUser} from "../../context/UserProvider";
import {useEffect, useState} from "react";
import CardSkeletonLoader from "../../assets/loaders/CardSkeletonLoader";
import FriendsCard from "./FriendsCard";
import useProfilePictureUpload from "../../context/useProfilePictureUpload";
import { useFriendship } from "../../context/FriendshipProvider";
import Swal from "../../utils/swalTheme";
import FriendshipStatus from "../../utils/enums/FriendshipStatus";
import FriendshipActionButton from "./FriendshipActionButton";
import ProfileAvatar from "./user-details/ProfileAvatar";
import ProfilePersonalDetails from "./user-details/ProfilePersonalDetails";
import ProfileSocialLinks from "./user-details/ProfileSocialLinks";
import ProfileGallery from "./user-details/ProfileGallery";
import {fluid} from "../layout/navFluid";

// Single-column width cap (Profile page threshold micro-pass): below the
// 2xl two-column activation point, UserDetails is a plain block child of a
// single grid column that's often 900-1000px+ wide (it shares the same
// track as Feed there) - with no max-width of its own, the compact
// Identity/About/Gallery+Friends cards were stretching to that full width
// instead of keeping Claude Design's intentional compact proportions.
// Deliberately the *same* fluid(384,560) formula the 2xl+ grid track in
// Profile.js uses for this column (not a competing value): below 2xl it
// centers a compact card in the single-column track; at 2xl+ it exactly
// matches the grid track's own width, so `mx-auto` there has nothing left
// to center (zero-effect, not a fight with the explicit track).
const DETAILS_MAX_WIDTH = fluid(384, 560);

 function UserDetails({otherUserId}) {
    const { user, otherUser, fetchUserDetails, fetchUserDetailsById,clearOtherUser,isOtherUserLoading ,fetchUserPostImages,userImages} = useUser();
     const {  uploading, handleFileChange,handleRemoveProfilePicture } = useProfilePictureUpload();
     const {checkFriendStatus, sendFriendRequest, acceptFriendRequest, declineFriendRequest,removeFriendship} = useFriendship();
     const [isFriendStatusLoading, setIsFriendStatusLoading] = useState(false);
     // Phase 10: FriendshipProvider no longer holds a shared friendStatus slot
     // (it was corrupted whenever LikeList's per-liker checkFriendStatus loop
     // ran concurrently with this profile being open - see FriendshipProvider.js).
     // This is the one component that actually needs to react to it, so it
     // owns the state locally instead.
     const [friendStatus, setFriendStatus] = useState(null);


     useEffect(() => {
         const fetchData = async () => {
             if (otherUserId) {
                 clearOtherUser();
                 await fetchUserDetailsById(otherUserId);
                 await fetchUserPostImages(otherUserId);
             }
         };

         fetchData();
     }, [otherUserId, clearOtherUser, fetchUserDetailsById, fetchUserPostImages]);

     const currentUser = otherUserId ? otherUser : user;
     const isOwnProfile = user && Number(user.id) === Number(otherUserId);
     useEffect(() => {
         const fetchFriendStatus = async () => {
             if (user && otherUser && user.id !== otherUser.id) {
                 setIsFriendStatusLoading(true);
                 const status = await checkFriendStatus(user.id, otherUser.id);
                 setFriendStatus(status);
                 setIsFriendStatusLoading(false);
             }
         };

         fetchFriendStatus();
     }, [user, otherUser, checkFriendStatus]);

     const handleSendFriendRequest = async (userId, otherUserId) => {
         await sendFriendRequest(userId, otherUserId);
         setFriendStatus({ senderId: userId, receiverId: otherUserId, status: FriendshipStatus.PENDING });
     };

     const handleAcceptFriendRequest = async (userId, otherUserId) => {
         await acceptFriendRequest(userId, otherUserId);
         setFriendStatus({ senderId: otherUserId, receiverId: userId, status: FriendshipStatus.ACCEPTED });
     };

     const handleDeclineFriendRequest = async (userId, otherUserId) => {
         await declineFriendRequest(userId, otherUserId);
         setFriendStatus({ senderId: Number(otherUserId), receiverId: Number(userId), status: FriendshipStatus.DECLINED });
     };

     const handleRemoveFriendship = async (userId, otherUserId) => {
         try {
             await removeFriendship(userId, otherUserId);
         } catch (err) {
             console.error("Error removing friendship:", err);
             await Swal.fire({
                 title: "Error!",
                 text: "Failed to remove friendship. Please try again.",
                 icon: "error",
             });
             return;
         }

         setFriendStatus(null);
         await fetchUserDetailsById(otherUserId);
         await fetchUserDetails();
     };



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

     // Public-profile finding: the backend's public-profile response (used
     // whenever otherUserId is set, including on your own profile route) no
     // longer carries email - it must come from the authenticated `user`
     // state (GET /auth/me), never from `currentUser`/`otherUser`. UserDetails
     // is the only place this self-vs-other decision is made; children only
     // ever receive the already-resolved value.
     const emailValue = isOwnProfile ? user.email : null;

    return (
        <div className="w-full mx-auto flex flex-col gap-5" style={{maxWidth: DETAILS_MAX_WIDTH}}>
            {/* Fidelity reconciliation (Phase G): rebuilt against the Design
                System's ProfileIdentity + PersonalDetailRow + Gallery/Friends
                preview cards (#profile) - a centered circular-avatar identity
                card followed by a responsive grid of compact info cards,
                instead of three full-width Material Cards stacked with a raw
                gray-50 bio box. Every handler/state passed to children below
                is unchanged - only composition/tokens changed. */}
            <div className="w-full bg-white border border-dsNeutral-100 rounded-ds-lg p-6 flex flex-col items-center text-center">
                <ProfileAvatar
                    imageUrl={currentUser.profilePictureUrl}
                    name={currentUser.name}
                    isOwnProfile={isOwnProfile}
                    uploading={uploading}
                    onFileChange={handleFileChange}
                    onRemovePicture={handleRemoveProfilePicture}
                />

                <p className="mt-3 text-ds-section-title text-dsNeutral-900">
                    {currentUser.fullName}
                </p>

                {currentUser.id === 1 && (
                    <span className="mt-1.5 inline-block text-ds-caption font-semibold text-dsNeutral-600 bg-dsNeutral-100 rounded-control px-2.5 py-0.5">
                        Faceboard Founder
                    </span>
                )}

                {Number(otherUserId) !== Number(user.id) && (
                    <div className="mt-3.5">
                        <FriendshipActionButton
                            user={user}
                            otherUser={otherUser}
                            friendStatus={friendStatus}
                            isLoading={isFriendStatusLoading}
                            onAccept={handleAcceptFriendRequest}
                            onDecline={handleDeclineFriendRequest}
                            onSendRequest={handleSendFriendRequest}
                            onRemove={handleRemoveFriendship}
                        />
                    </div>
                )}
            </div>

            <div className="w-full bg-white border border-dsNeutral-100 rounded-ds-lg p-[18px]">
                <h2 className="text-ds-card-title text-dsNeutral-900 mb-2">About {currentUser.name}</h2>

                <p className="text-ds-body text-dsNeutral-600 whitespace-pre-line break-words">
                    {currentUser.bio || "No bio yet"}
                </p>

                <ProfilePersonalDetails
                    gender={currentUser.gender}
                    birthDate={currentUser.birthDate}
                    email={emailValue}
                />

                <ProfileSocialLinks facebookUrl={currentUser.facebookUrl} instagramUrl={currentUser.instagramUrl}/>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ProfileGallery images={userImages} userId={currentUser.id}/>
                <FriendsCard user={currentUser}/>
            </div>
        </div>
    );
}
export default UserDetails
