import { useState } from "react";
import { useUser } from "../context/UserProvider";
import {usePosts} from "./PostProvider";
import {DELETE_PROFILE_PIC_API, UPLOAD_PROFILE_PIC_API} from "../utils/Utils";

const useProfilePictureUpload = () => {
    const { user,setUser, updateUserProfilePicture,fetchUserDetails } = useUser();
    const [uploading, setUploading] = useState(false);
    const {  fetchUserPosts } = usePosts();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleUpload = async (file) => {
        if (!file) {
            alert("Please select an image");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(UPLOAD_PROFILE_PIC_API(user.id), {
                method: "POST",
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to upload image");
            }

            const imageUrl = await response.text();
            updateUserProfilePicture(imageUrl);
            setUser(prevUser => ({
                ...prevUser,
                profilePictureUrl: imageUrl
            }));
            fetchUserDetails(localStorage.getItem('jwtToken'));
            fetchUserPosts(user.id);


        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setUploading(false);
        }
    };
    const handleRemoveProfilePicture = async () => {
        try {
            const response = await fetch(DELETE_PROFILE_PIC_API(user.id), {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to remove profile picture");
            }

            const defaultImageUrl = await response.text();
            updateUserProfilePicture(defaultImageUrl);
            setUser(prevUser => ({
                ...prevUser,
                profilePictureUrl: defaultImageUrl
            }));
            fetchUserDetails(localStorage.getItem('jwtToken'));
            fetchUserPosts(user.id);

        } catch (error) {
            console.error("Error removing profile picture:", error);
        }
    };
    return { uploading, handleFileChange,handleRemoveProfilePicture };
};

export default useProfilePictureUpload;
