import  {useState, useRef} from "react";
import EditableField from "../assets/inputs/EditableField";
import {useUser} from "../context/UserProvider";
import {useAutoSaveField} from "../context/useAutoSaveField";
import {Button} from "../components/common/Button";
import SectionCard from "../components/common/SectionCard";

import useProfilePictureUpload from "../context/useProfilePictureUpload";
import {FACEBOOK_URL_REGEX, INSTAGRAM_URL_REGEX} from "../utils/Utils";
import {isValidEmail} from "../utils/emailValidation";
import ProfilePictureSettings from "../components/settings/ProfilePictureSettings";
import PasswordSettings from "../components/settings/PasswordSettings";
import DemoReadOnlyNotice from "../components/common/DemoReadOnlyNotice";



function Settings(){
    const {user,setUser,isDemo}=useUser();
    const { uploading, handleFileChange,handleRemoveProfilePicture } = useProfilePictureUpload();
    const { value: name, onSave: saveName, loading: nameLoading } = useAutoSaveField(user.name, "name",setUser);
    const { value: lastname, onSave: saveLastname, loading: lastnameLoading } = useAutoSaveField(user.lastname, "lastname",setUser);
    const { value: email, onSave: saveEmail, loading: emailLoading } = useAutoSaveField(user.email, "email",setUser);
    const { value: bio, onSave: saveBio, loading: bioLoading } = useAutoSaveField(user.bio, "bio",setUser);
    const { value: facebookUrl, onSave: saveFacebookUrl, loading: facebookUrlLoading } = useAutoSaveField(user.facebookUrl , "facebookUrl",setUser);
    const { value: instagramUrl, onSave: saveInstagramUrl, loading: instagramUrlLoading } = useAutoSaveField(user.instagramUrl , "instagramUrl",setUser);

    const [isEditingFields, setIsEditingFields] = useState(false);
    const [savingFields, setSavingFields] = useState(false);

    const nameRef = useRef(null);
    const lastnameRef = useRef(null);
    const emailRef = useRef(null);
    const bioRef = useRef(null);
    const facebookUrlRef = useRef(null);
    const instagramUrlRef = useRef(null);

    const editableFields = [
        { ref: nameRef, onSave: saveName },
        { ref: lastnameRef, onSave: saveLastname },
        { ref: emailRef, onSave: saveEmail },
        { ref: bioRef, onSave: saveBio },
        { ref: facebookUrlRef, onSave: saveFacebookUrl },
        { ref: instagramUrlRef, onSave: saveInstagramUrl },
    ];

    const handleEditFieldsClick = () => {
        if (isDemo) return;
        setIsEditingFields(true);
    };

    const handleSaveFieldsClick = async () => {
        const validated = editableFields.map(({ ref, onSave }) => ({
            onSave,
            result: ref.current?.validateAndGetValue(),
        }));

        const hasInvalid = validated.some(({ result }) => !result || !result.valid);
        if (hasInvalid) return;

        setSavingFields(true);
        try {
            // BUG (multi-field PATCH regression): these must run sequentially,
            // not concurrently via Promise.all. Each field's onSave is its own
            // independent PUT /user/settings request, and the backend's
            // updateUserDetails does a non-atomic read-modify-write of the
            // whole User row (no @Version/@DynamicUpdate). Firing them all at
            // once let two in-flight requests each read the row before the
            // other's write had landed, so whichever request's save committed
            // last would persist its own now-stale snapshot of the field the
            // other request had just changed - silently losing that update.
            // Awaiting them one at a time guarantees each request's read
            // reflects every previous request's already-committed write.
            const results = [];
            for (const { onSave, result } of validated) {
                results.push(await onSave(result.value));
            }
            const allSucceeded = results.every(Boolean);
            if (allSucceeded) {
                setIsEditingFields(false);
            }
        } finally {
            setSavingFields(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto py-6 sm:py-10 space-y-6">
            <ProfilePictureSettings
                user={user}
                uploading={uploading}
                onFileChange={handleFileChange}
                onRemove={handleRemoveProfilePicture}
                disabled={isDemo}
            />

            <SectionCard title="Profile Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <EditableField ref={nameRef} id="name" label="Name" value={name} editing={isEditingFields} saveInProgress={nameLoading} validate={(val) => val.length < 2 ? "Must be at least 2 characters" : ""} />
                    <EditableField ref={lastnameRef} id="lastname" label="Lastname" value={lastname} editing={isEditingFields} saveInProgress={lastnameLoading} validate={(val) => val.length < 2 ? "Must be at least 2 characters" : ""} />
                    <EditableField ref={emailRef} id="email" label="Email" value={email} editing={isEditingFields} saveInProgress={emailLoading} validate={(val) => !isValidEmail(val) ? "Invalid email" : ""} />
                    <div className="sm:col-span-2">
                        <EditableField ref={bioRef} id="bio" label="Biography" value={bio} editing={isEditingFields} saveInProgress={bioLoading} multiline rows={3} maxLength={150} validate={(val) => val.length > 150 ? "Only 150 characters allowed" : ""} />
                    </div>
                </div>

                {/* Social Links subsection - same card as Profile Information,
                    not a separate SectionCard, so it reads as one unified
                    "form" rather than two cards pasted together. Reuses the
                    in-card section-break convention from
                    ProfilePersonalDetails.js (border-t border-dsNeutral-100)
                    instead of SectionCard's own header treatment, which is
                    sized for a top-level card title. */}
                <div className="mt-6 pt-6 border-t border-dsNeutral-100">
                    <h3 className="text-ds-label font-semibold text-dsNeutral-600 mb-4">Social Links</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <EditableField ref={facebookUrlRef} id="facebookurl" label="Facebook URL" value={facebookUrl} editing={isEditingFields} saveInProgress={facebookUrlLoading} validate={(val) => val && !FACEBOOK_URL_REGEX.test(val) ? "Invalid Facebook URL" : ""} />
                        <EditableField ref={instagramUrlRef} id="instagramurl"  label="Instagram URL" value={instagramUrl} editing={isEditingFields} saveInProgress={instagramUrlLoading} validate={(val) => val && !INSTAGRAM_URL_REGEX.test(val) ? "Invalid Instagram URL" : ""} />
                    </div>
                </div>

                <div className="flex justify-center pt-6">
                    <Button
                        onClick={isEditingFields ? handleSaveFieldsClick : handleEditFieldsClick}
                        disabled={savingFields || isDemo}
                        loading={savingFields}
                        variant="primary"
                        className="w-full sm:w-auto"
                    >
                        {isEditingFields ? (savingFields ? "Saving..." : "Save") : "Edit"}
                    </Button>
                </div>
                {isDemo && <DemoReadOnlyNotice message="Demo Mode — profile details cannot be edited." />}
            </SectionCard>

            <PasswordSettings />
        </div>
    );
}

export default Settings;
