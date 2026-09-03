import {Avatar as PrimitiveAvatar} from "../../common/Avatar";
import RandomIcons from "../../../Icons/RandomIcons";

// Fidelity reconciliation (Phase G): rebuilt against the Design System's
// ProfileIdentity (#profile) - a centered 96px circular avatar, not the
// full-width rectangular cover-photo banner this rendered before (the same
// profilePictureUrl stretched into a `w-full h-full object-cover` header;
// there's no separate cover-photo feature in this app, so that banner
// treatment never matched any real Faceboard concept). Upload/remove
// handlers are unchanged, just repositioned as small circular buttons
// against the avatar's edge instead of floating over a banner corner.
function ProfileAvatar({imageUrl, name, isOwnProfile, uploading, onFileChange, onRemovePicture}) {
    return (
        <div className="flex flex-col items-center pt-6">
            <div className="relative">
                <PrimitiveAvatar src={imageUrl} name={name} alt={`${name}'s profile picture`} size={96} className="shadow-[0_0_0_4px_#fff]" />

                {isOwnProfile && (
                    <div className="absolute -bottom-1 right-0 flex items-center gap-1.5">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                onChange={onFileChange}
                                className="sr-only"
                                accept="image/*"
                                aria-label="Change profile picture"
                            />
                            <div className="p-1.5 bg-white border border-dsNeutral-100 shadow-ds-low rounded-full hover:bg-dsNeutral-100 transition" aria-hidden="true">
                                <RandomIcons.Edit className="size-4 text-dsNeutral-600"/>
                            </div>
                        </label>

                        <button
                            type="button"
                            onClick={onRemovePicture}
                            aria-label="Remove profile picture"
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing rounded-full"
                        >
                            <div className="p-1.5 bg-white border border-dsNeutral-100 shadow-ds-low rounded-full hover:bg-dsNeutral-100 transition">
                                <RandomIcons.TrashIcon className="size-4 text-dsDestructive"/>
                            </div>
                        </button>
                    </div>
                )}
            </div>
            {uploading && <p className="mt-2 text-ds-caption text-dsNeutral-500">Uploading…</p>}
        </div>
    );
}

export default ProfileAvatar;
