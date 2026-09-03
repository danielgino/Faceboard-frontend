import {Camera, Trash2} from "lucide-react";
import {Typography} from "@material-tailwind/react";
import SectionCard from "../common/SectionCard";
import DemoReadOnlyNotice from "../common/DemoReadOnlyNotice";

// Avatar display (with initials fallback) + upload/remove controls. Owns
// the remove-picture confirm dialog since it's local to this button; the
// actual upload/remove API calls stay owned by useProfilePictureUpload in
// Settings, passed down already-bound.
function ProfilePictureSettings({user, uploading, onFileChange, onRemove, disabled = false}) {
    const handleRemoveClick = () => {
        if (disabled) return;
        if (window.confirm("Remove your profile picture?")) {
            onRemove();
        }
    };

    return (
        <SectionCard>
            <div className="flex flex-col items-center">
                {/* Fixed-px Avatar primitive can't express this element's
                    responsive 96px->112px (sm+) sizing without a one-off
                    responsive-size prop, so this stays raw markup rather
                    than distorting the primitive (see Phase C consumer
                    mapping) — only the fallback color and controls are
                    retoned to the shared Avatar's own token pairing for
                    visual consistency. */}
                {user.profilePictureUrl ? (
                    <img
                        src={user.profilePictureUrl}
                        alt=""
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-ds-low"
                    />
                ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-dsBrand-100 border-4 border-white shadow-ds-low flex items-center justify-center text-dsBrand-700 text-3xl font-bold">
                        {(user.name?.[0] ?? "")}{(user.lastname?.[0] ?? "")}
                    </div>
                )}
                <Typography variant="h4" color="blue-gray" className="mt-4">
                    {user.fullName}
                </Typography>
                <Typography variant="small" color="gray" className="text-center">
                    Manage your account settings
                </Typography>

                <div className="flex gap-3 mt-4">
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-full bg-dsNeutral-100 hover:bg-dsNeutral-200 text-dsNeutral-600 text-sm font-medium transition cursor-pointer ${(uploading || disabled) ? "opacity-60 pointer-events-none" : ""}`}>
                        <input type="file" onChange={onFileChange} className="hidden" accept="image/*" disabled={uploading || disabled} />
                        <Camera size={16} />
                        {uploading ? "Uploading..." : "Change profile picture"}

                    </label>
                    <button
                        onClick={handleRemoveClick}
                        disabled={uploading || disabled}
                        title={disabled ? "Editing your profile picture is disabled in Demo Mode." : undefined}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-dsDestructive hover:bg-dsDestructive/10 text-sm font-medium transition disabled:opacity-60"
                    >
                        <Trash2 size={16} />
                        Remove
                    </button>
                </div>
                {disabled && <DemoReadOnlyNotice message="Demo Mode — profile picture cannot be edited." />}
            </div>
        </SectionCard>
    );
}

export default ProfilePictureSettings;
