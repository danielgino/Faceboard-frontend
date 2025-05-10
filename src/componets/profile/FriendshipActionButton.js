import { Button } from "@material-tailwind/react";
import Swal from "sweetalert2";
import FriendshipStatus from "../../enums/FriendshipStatus";

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
            <Button disabled color="blue">
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
            color="blue"
        >
            {buttonText}
        </Button>
    );
}

export default FriendshipActionButton;
