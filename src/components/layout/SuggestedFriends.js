import { Avatar as PrimitiveAvatar } from "../common/Avatar";

// Compact "Add" pill, matching LikeList's FriendshipActionSlot default state
// at a smaller size for this card. Kept local rather than reusing the full
// FriendshipActionButton, which needs a live FriendshipStatus plus
// accept/decline/remove wiring this sidebar preview doesn't have.
function AddButton({ pending, disabled, onClick }) {
    // Demo Mode: a genuinely disabled control (native `disabled`, not just styling) - clicking it
    // cannot fire onClick, so no friend-request API call can ever be sent from here. Distinct from
    // the `pending` ("Sent") state below, which would otherwise misleadingly imply a request had
    // already gone through.
    if (disabled) {
        return (
            <button
                type="button"
                disabled
                aria-disabled="true"
                title="Adding friends is disabled in Demo Mode."
                className="flex-shrink-0 h-7 px-3 rounded-control bg-dsNeutral-100 text-dsNeutral-300 text-[11px] font-semibold cursor-not-allowed"
            >
                Add
            </button>
        );
    }
    if (pending) {
        return (
            <span className="flex-shrink-0 h-7 px-3 rounded-control bg-white text-dsNeutral-300 border border-dsNeutral-100 text-[11px] font-semibold flex items-center cursor-not-allowed">
                Sent
            </span>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex-shrink-0 h-7 px-3 rounded-control bg-dsBrand-600 text-white text-[11px] font-semibold hover:bg-dsBrand-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing"
        >
            Add
        </button>
    );
}

// Desktop-sidebar card, visually matching FriendsCard/LikeList's row
// language (avatar + name + handle, bg-white/border-dsNeutral-100/
// rounded-ds-lg/p-[18px] shell). Pure presentation: takes already-resolved
// suggestion data + callbacks as props (see useSuggestedFriends, which owns
// the real GET /friendship/suggestions integration) rather than fetching
// anything itself - this component doesn't know or care where the data
// came from.
function SuggestedFriends({ suggestions = [], pendingIds = [], onAdd, onShowMore, disabled = false }) {
    if (suggestions.length === 0) return null;

    return (
        <div className="bg-white border border-dsNeutral-100 rounded-ds-lg p-[18px]">
            <h2 className="text-ds-card-title text-dsNeutral-900 mb-3">Suggested friends</h2>

            <div className="flex flex-col gap-3">
                {suggestions.slice(0, 3).map((person) => (
                    <div key={person.id} className="flex items-center gap-2.5">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <PrimitiveAvatar size={36} src={person.profilePictureUrl} name={person.fullName} alt={person.fullName} />
                            <div className="min-w-0">
                                <p className="text-ds-user-name text-dsNeutral-900 truncate">{person.fullName}</p>
                                <p className="text-ds-handle text-dsNeutral-500 truncate">@{person.username}</p>
                            </div>
                        </div>
                        <AddButton pending={pendingIds.includes(person.id)} disabled={disabled} onClick={() => onAdd?.(person.id)} />
                    </div>
                ))}
            </div>

            {onShowMore && (
                <button
                    type="button"
                    onClick={onShowMore}
                    className="mt-3 w-full text-center text-ds-caption font-semibold text-dsBrand-600 hover:text-dsBrand-700"
                >
                    Show more
                </button>
            )}
        </div>
    );
}

export default SuggestedFriends;
