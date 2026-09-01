import { useState } from "react";
import { useUser } from "../context/UserProvider";
import {usePosts} from "./PostProvider";
import {DELETE_PROFILE_PIC_API, fetchWithAuth, JWT_STORAGE_KEY, UPLOAD_PROFILE_PIC_API} from "../utils/Utils";
import {validateUploadFile, describeRejectionReason} from "../utils/uploadValidation";

const useProfilePictureUpload = () => {
    const { user,setUser, updateUserProfilePicture,fetchUserDetails } = useUser();
    const [uploading, setUploading] = useState(false);
    const {  fetchUserPosts } = usePosts();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        event.target.value = "";
        if (!file) return;

        const validation = validateUploadFile(file);
        if (!validation.valid) {
            alert(describeRejectionReason(validation.reason));
            return;
        }

        handleUpload(file);
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
            const response = await fetchWithAuth(UPLOAD_PROFILE_PIC_API(user.id), {
                method: "POST",
                body: formData,
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
            fetchUserDetails(localStorage.getItem(JWT_STORAGE_KEY));
            fetchUserPosts(user.id);


        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setUploading(false);
        }
    };
    const handleRemoveProfilePicture = async () => {
        try {
            const response = await fetchWithAuth(DELETE_PROFILE_PIC_API(user.id), {
                method: "DELETE",
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
            fetchUserDetails(localStorage.getItem(JWT_STORAGE_KEY));
            fetchUserPosts(user.id);

        } catch (error) {
            console.error("Error removing profile picture:", error);
        }
    };
    return { uploading, handleFileChange,handleRemoveProfilePicture };
};

export default useProfilePictureUpload;
