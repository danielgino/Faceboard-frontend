import React, {useEffect, useState} from "react";
import { useLightbox } from "../context/LightBoxContext";
import { useUser } from "../context/UserProvider";
import { useParams } from "react-router-dom";
import NoAlbumYet from "../assets/loaders/NoAlbumYet";
import AlbumPageLoader from "../assets/loaders/AlbumPageLoader";

function Album() {
    const { openLightbox } = useLightbox();
    const { userImages, fetchUserPostImages, user, otherUser } = useUser();
    const { userId } = useParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        setIsLoading(true);
        (async () => {
            await fetchUserPostImages(userId);
            setIsLoading(false);
        })();
    }, [userId])
    const currentUser = (user && Number(user.id) === Number(userId)) ? user : otherUser;

    if (isLoading) {
        return <AlbumPageLoader count={20} withTitle />;
    }
    return (
        <div className="flex-1 px-4 pt-8 min-h-screen">
            <h1 className="text-2xl font-bold text-center text-indigo-800 mb-8 drop-shadow-md">
                {currentUser ? `${currentUser.fullName}  Album` : "Album"}
            </h1>

            <div className="flex justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto">
                    {userImages.length > 0 ? (
                        userImages.map((imageLink, index) => (
                            <div
                                key={imageLink || index}
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
