import { Button } from "@material-tailwind/react";
import Swal from "sweetalert2";
import FriendshipStatus from "../../utils/enums/FriendshipStatus";

function FriendshipActionButton({user, otherUser, friendStatus, isLoading,
                                    onAccept, onDecline, onSendRequest, onRemove,}) {
    const handleClick = async () => {
        if (friendStatus?.status === FriendshipStatus.ACCEPTED) {
            const result = await Swal.fire({
                title: "Unfriend?",
                text: `Are you sure you want to cancel friendship with ${otherUser.name}?`,
                icon: "warning",
                showCancelButton: true,
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
            <Button disabled className="normal-case bg-gray-200 text-gray-800 border border-gray-300 font-medium px-6 py-2 rounded-xl shadow-sm flex items-center gap-2"
            >
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                </div>
            </Button>
        );
    }

    if (
        friendStatus?.status === FriendshipStatus.PENDING &&
        friendStatus.senderId !== user.id
    ) {
        return (
            <div className="flex gap-2">
                <Button
                    onClick={() => onAccept(user.id, otherUser.id)}
                    color="green"
                    variant="gradient"
                >
                    Accept
                </Button>
                <Button
                    onClick={async () => {
                        const result = await Swal.fire({
                            title: "Reject Request?",
                            text: `Are you sure to reject request from ${otherUser.name}?`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes, Reject",
                            cancelButtonText: "Cancel",
                        });

                        if (result.isConfirmed) {
                            await onDecline(user.id, otherUser.id);
                        }
                    }}
                    color="red"
                    variant="gradient"
                >
                    Reject
                </Button>
            </div>
        );
    }

    const buttonText =
        friendStatus?.status === FriendshipStatus.PENDING
            ? "Requested"
            : friendStatus?.status === FriendshipStatus.ACCEPTED
                ? "Friends"
                : "Add Friend";

    return (
        <Button
            onClick={handleClick}
            className="normal-case  bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-200 font-medium px-6 py-2 rounded-xl shadow-sm transition-all duration-200"
            variant="text"        >
            {buttonText}
        </Button>
    );
}

export default FriendshipActionButton;
