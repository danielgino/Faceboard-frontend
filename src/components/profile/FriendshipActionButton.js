import { Check } from "lucide-react";
import Swal from "../../utils/swalTheme";
import FriendshipStatus from "../../utils/enums/FriendshipStatus";
import LoadingSpinner from "../../assets/loaders/LoadingSpinner";
import { SWAL_DESTRUCTIVE_CONFIRM_CLASS } from "../../utils/Utils";

// Fidelity reconciliation (Phase G): rebuilt against the Design System's
// FriendshipAction states (#people) - Add friend (brand-filled), Requested
// (muted/disabled), Accept+Reject pair, Friends (brand-outline + check),
// Sending (brand-filled + spinner) - instead of generic gray Material
// buttons. Every handler/state below (handleClick, the three onAccept/
// onDecline/onRemove callbacks, isLoading) is unchanged - only the JSX
// shape and button tokens changed.
const BASE_BTN = "h-9 px-4 rounded-control text-ds-label font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing inline-flex items-center gap-1.5";

function FriendshipActionButton({user, otherUser, friendStatus, isLoading,
                                    onAccept, onDecline, onSendRequest, onRemove,}) {
    const handleClick = async () => {
        if (friendStatus?.status === FriendshipStatus.ACCEPTED) {
            const result = await Swal.fire({
                title: "Unfriend?",
                text: `Are you sure you want to cancel friendship with ${otherUser.name}?`,
                icon: "warning",
                showCancelButton: true,
                ...SWAL_DESTRUCTIVE_CONFIRM_CLASS,
                confirmButtonText: "Yes, Remove",
                cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
                await onRemove(user.id, otherUser.id);
            }
        } else if (!friendStatus || friendStatus.status !== FriendshipStatus.PENDING) {
            await onSendRequest(user.id, otherUser.id);
        }
    };

    if (isLoading) {
        return (
            <span className={`${BASE_BTN} bg-dsBrand-600 text-white/75 cursor-default`}>
                <LoadingSpinner className="w-3.5 h-3.5 text-white" />
                Loading…
            </span>
        );
    }

    if (
        friendStatus?.status === FriendshipStatus.PENDING &&
        friendStatus.senderId !== user.id
    ) {
        return (
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => onAccept(user.id, otherUser.id)}
                    className={`${BASE_BTN} bg-dsBrand-600 text-white hover:bg-dsBrand-700`}
                >
                    Accept
                </button>
                <button
                    type="button"
                    onClick={async () => {
                        const result = await Swal.fire({
                            title: "Reject Request?",
                            text: `Are you sure to reject request from ${otherUser.name}?`,
                            icon: "warning",
                            showCancelButton: true,
                            ...SWAL_DESTRUCTIVE_CONFIRM_CLASS,
                            confirmButtonText: "Yes, Reject",
                            cancelButtonText: "Cancel",
                        });

                        if (result.isConfirmed) {
                            await onDecline(user.id, otherUser.id);
                        }
                    }}
                    className={`${BASE_BTN} bg-dsNeutral-100 text-dsNeutral-900 hover:bg-dsNeutral-200`}
                >
                    Reject
                </button>
            </div>
        );
    }

    if (friendStatus?.status === FriendshipStatus.ACCEPTED) {
        return (
            <button
                type="button"
                onClick={handleClick}
                className={`${BASE_BTN} bg-dsBrand-50 text-dsBrand-700 border border-dsBrand-600`}
            >
                <Check size={14} strokeWidth={2.5} /> Friends
            </button>
        );
    }

    if (friendStatus?.status === FriendshipStatus.PENDING) {
        return (
            <span className={`${BASE_BTN} bg-white text-dsNeutral-300 border border-dsNeutral-100 cursor-not-allowed`}>
                Requested
            </span>
        );
    }

    return (
        <button type="button" onClick={handleClick} className={`${BASE_BTN} bg-dsBrand-600 text-white hover:bg-dsBrand-700`}>
            Add Friend
        </button>
    );
}

export default FriendshipActionButton;
