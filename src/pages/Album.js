import React, { useEffect } from "react";
import { useLightbox } from "../context/LightBoxContext";
import { useUser } from "../context/UserProvider";
import { useParams } from "react-router-dom";
import NoAlbumYet from "../assets/loaders/NoAlbumYet";

function Album() {
    const { openLightbox } = useLightbox();
    const { userImages, fetchUserPostImages, user, otherUser } = useUser();
    const { userId } = useParams();

    useEffect(() => {
        if (userId) {
            fetchUserPostImages(userId);
        }
    }, [userId, fetchUserPostImages]);

    const currentUser = (user && Number(user.id) === Number(userId)) ? user : otherUser;

    return (
        <div className="flex-1 px-4 pt-8 min-h-screen">
            <h1 className="text-4xl font-extrabold text-center text-indigo-400 mb-8 drop-shadow-md">
                {currentUser ? `${currentUser.fullName}'s Album` : "Album"}
            </h1>

            {/* עטפתי את הגריד בפלקס כדי למרכז אותו */}
            <div className="flex justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto">
                    {userImages.length > 0 ? (
                        userImages.map((imageLink, index) => (
                            <div
                                key={index}
                                className="aspect-square overflow-hidden rounded-xl shadow-md bg-white cursor-pointer group"
                                onClick={() => openLightbox(userImages, index)}
                            >
                                <img
                                    src={imageLink}
                                    alt={`gallery-${index}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <NoAlbumYet />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Album;
