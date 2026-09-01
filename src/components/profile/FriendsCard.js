import { FRIENDS_BTN_TEXT, FRIENDS_PAGE, getRandomUsers, PROFILE_PAGE} from "../../utils/Utils";
import {Link} from "react-router-dom";
import React, {useMemo} from "react";
import {Avatar as PrimitiveAvatar} from "../common/Avatar";

// Fidelity reconciliation (Phase G): rebuilt against the Design System's
// Friends preview card (#profile) - header row (title+count, "View all"),
// overlapping avatar cluster with a "+N" overflow tile, instead of a 3-col
// photo grid. Also fixes a real markup bug: a <button> was nested inside a
// <Link> for the header (invalid interactive-in-interactive nesting) - the
// Link alone now owns that control.
function FriendsCard({user}){
    const randomFriends = useMemo(() => {
        return getRandomUsers(user.friendsList, 6);
    }, [user]);

    const overflowCount = Math.max(0, user.friendsList.length - randomFriends.length);

    return (
        <div className="w-full bg-white border border-dsNeutral-100 rounded-ds-lg p-[18px]">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-ds-card-title text-dsNeutral-900">
                    {FRIENDS_BTN_TEXT} · {user.friendsList.length}
                </h2>
                {user.friendsList.length > 0 && (
                    <Link to={FRIENDS_PAGE(user.id)} className="text-ds-caption font-semibold text-dsBrand-600 hover:text-dsBrand-700">
                        View all
                    </Link>
                )}
            </div>

            {randomFriends.length === 0 ? (
                <p className="text-ds-body text-dsNeutral-500">No friends yet</p>
            ) : (
                <div className="flex">
                    {randomFriends.map((friend, index) => (
                        <Link
                            key={friend.id}
                            to={PROFILE_PAGE(friend.id)}
                            className={`block rounded-full ring-2 ring-white hover:z-10 transition ${index > 0 ? "-ml-2.5" : ""}`}
                            title={friend.fullName}
                            aria-label={friend.fullName}
                        >
                            <PrimitiveAvatar src={friend.profilePictureUrl} name={friend.fullName} alt={friend.fullName} size={36} />
                        </Link>
                    ))}
                    {overflowCount > 0 && (
                        <span className="flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white bg-dsNeutral-100 text-dsNeutral-600 text-[11px] font-bold -ml-2.5">
                            +{overflowCount}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export default FriendsCard