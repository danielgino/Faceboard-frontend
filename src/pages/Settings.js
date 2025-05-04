import {GlobalInput} from "../assets/inputs/GlobalInput";
import React, {useState} from "react";
import axios from "axios";
import EditableField from "../assets/inputs/EditableField";
import {useUser} from "../context/UserProvider";
import {useAutoSaveField} from "../context/useAutoSaveField";
import {Avatar, Button, Card, CardBody, Typography} from "@material-tailwind/react";

import RandomIcons from "../Icons/RandomIcons";
import useProfilePictureUpload from "../context/useProfilePictureUpload";
import {SETTINGS_API} from "../utils/Utils";



function Settings(){
    const [password,setPassword]=useState("")
    const [confirmPassword,setConfirmPassword]=useState("")
    const {user,setUser}=useUser();
    const { uploading, handleFileChange,handleRemoveProfilePicture } = useProfilePictureUpload(user, setUser);

    const [currentPassword, setCurrentPassword] = useState(null);
    const [errors,setErrors]=useState({})
    const { value: name, onSave: saveName } = useAutoSaveField(user.name, "name",setUser);
    const { value: lastname, onSave: saveLastname } = useAutoSaveField(user.lastname, "lastname",setUser);
    const { value: email, onSave: saveEmail } = useAutoSaveField(user.email, "email",setUser);
    const { value: bio, onSave: saveBio } = useAutoSaveField(user.bio, "bio",setUser);
    const { value: facebookUrl, onSave: saveFacebookUrl } = useAutoSaveField(user.facebookUrl , "facebookUrl",setUser);
    const { value: instagramUrl, onSave: saveInstagramUrl } = useAutoSaveField(user.instagramUrl , "instagramUrl",setUser);


    const handleSubmit = async () => {
        console.log("📤 facebookUrl:", facebookUrl);
        console.log("📤 instagramUrl:", instagramUrl);
        const payload = {
            name,
            lastname,
            bio: bio,
            facebookUrl,
            instagramUrl,
            email,
            currentPassword,
            newPassword: password,
        };
        console.log("🔍 Payload being sent:", payload);

        try {
            await axios.put(SETTINGS_API, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                    "Content-Type": "application/json"
                },
            });
            alert("Profile updated!");
        } catch (e) {
            console.log("🔥 Full server error:", e.response);
            console.log("🔥 Full data:", e.response?.data);
            alert(e.response?.data?.message || "Something went wrong.");
        }
    };

    const validate = (name,value) => {
        let message="";
        switch (name){

            case "password":
                if (value.length < 8) {
                    message = "Password must be at least 8 characters";
                }
                else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value)) {
                    message = "Password must include uppercase, lowercase, number and symbol";
                }
                break;
            case "confirmPassword":
                if (value !== password) {
                    message = "Passwords do not match";
                }
                break;


            default:
                break;
        }
        setErrors((prev) => ({ ...prev, [name]: message }));

    }

    return (
        <div className="flex justify-center items-start min-h-screen bg-gradient-to-tr from-gray-100 to-gray-200 p-6">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 space-y-8">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <Avatar size="xxl" src={user.profilePictureUrl} alt="avatar" className="border-4 border-white shadow-md" />
                        <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:scale-105 transition">
                            <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                            {uploading ? (
                                <span className="text-xs text-blue-500">...</span>
                            ) : (
                                <RandomIcons.Edit className="w-5 h-5 text-gray-600" />
                            )}
                        </label>
                        <button
                            onClick={handleRemoveProfilePicture}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                            title="Remove Profile Picture"
                        >
                            ×
                        </button>
                    </div>
                    <Typography variant="h4" color="blue-gray" className="mt-4">
                        {user.name}
                    </Typography>
                    <Typography variant="small" color="gray" className="text-center">
                        Manage your account settings
                    </Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableField label="Name" value={name} onSave={saveName} validate={(val) => val.length < 2 ? "Must be at least 2 characters" : ""} />
                    <EditableField label="Lastname" value={lastname} onSave={saveLastname} validate={(val) => val.length < 2 ? "Must be at least 2 characters" : ""} />
                    <EditableField label="Email" value={email} onSave={saveEmail} validate={(val) => !/\S+@\S+\.\S+/.test(val) ? "Invalid email" : ""} />
                    <EditableField label="Biography" value={bio} onSave={saveBio} multiline rows={3} validate={(val) => val.length > 200 ? "Only 200 characters allowed" : ""} />
                    <EditableField label="Facebook URL" value={facebookUrl} onSave={saveFacebookUrl} validate={(val) => val && !/^https?:\/\/(www\.)?facebook\.com\/[^\s]+$/.test(val) ? "Invalid Facebook URL" : ""} />
                    <EditableField label="Instagram URL" value={instagramUrl} onSave={saveInstagramUrl} validate={(val) => val && !/^https?:\/\/(www\.)?instagram\.com\/[^\s]+$/.test(val) ? "Invalid Instagram URL" : ""} />
                </div>

                <Card className="bg-gray-50 shadow-md rounded-xl">
                    <CardBody>
                        <Typography variant="h6" color="blue-gray" className="mb-4 text-center">
                            Change Password
                        </Typography>

                        <GlobalInput label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} error={errors.currentPassword} />
                        <GlobalInput label="New Password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); validate("password", e.target.value); }} error={errors.password} />
                        <GlobalInput label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); validate("confirmPassword", e.target.value); }} error={errors.confirmPassword} />

                        <div className="flex justify-center mt-6">
                            <Button onClick={handleSubmit} color="blue" size="lg">
                                Save Changes
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

export default Settings;