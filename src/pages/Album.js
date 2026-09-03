import React, {useEffect, useState} from "react";
import { Maximize2 } from "lucide-react";
import { useLightbox } from "../context/LightBoxContext";
import { useUser, getDemoGalleryImages } from "../context/UserProvider";
import { useParams } from "react-router-dom";
import NoAlbumYet from "../assets/loaders/NoAlbumYet";
import AlbumPageLoader from "../assets/loaders/AlbumPageLoader";
import { fetchWithAuth, GET_USER_IMAGES_API } from "../utils/Utils";

function Album() {
    const { openLightbox } = useLightbox();
    const { user, otherUser, fetchUserDetailsById } = useUser();
    const { userId } = useParams();
    const [userImages, setUserImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetches this page's own copy of the images directly, into local state,
    // instead of via the shared UserProvider.fetchUserPostImages/userImages.
    // That shared method has no request-cancellation and unconditionally
    // overwrites the shared userImages array whenever its request resolves -
    // so if a user opens /album/5 then quickly navigates to /album/6 before
    // request 5 finishes, request 5's later, stale resolution can overwrite
    // the shared array with user 5's photos while this page still shows user
    // 6. Fetching locally with the same ignore-flag pattern SinglePostPage.js
    // already uses (rather than relying on shared state a stale response
    // could clobber from outside this component) closes that race without
    // touching UserProvider itself. The Demo branch below reuses the same
    // `ignore` guard for its own async profile-resolution step.
    useEffect(() => {
        if (!userId) return;
        let ignore = false;

        setIsLoading(true);
        (async () => {
            try {
                if (user?.demo) {
                    // Demo Mode: GET /post/{userId}/all-post-images stays excluded from the Demo
                    // allowlist - never called here. Resolves the viewed profile's username
                    // directly (never from possibly-stale `otherUser`, which a direct/refreshed
                    // /album/:userId visit may never have populated): own id needs no extra
                    // request; any other id uses the same GET /user/by-id path UserDetails uses.
                    const profileUsername = (Number(userId) === Number(user.id))
                        ? user.username
                        : (await fetchUserDetailsById(userId))?.username;
                    if (!ignore) {
                        setUserImages(getDemoGalleryImages(profileUsername));
                    }
                    return;
                }

                const response = await fetchWithAuth(GET_USER_IMAGES_API(userId));
                if (!response.ok) throw new Error("Failed to fetch album images");
                const images = await response.json();
                if (!ignore) {
                    setUserImages(images);
                }
            } catch (err) {
                console.error("Error fetching album images:", err);
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            ignore = true;
        };
    }, [userId, user?.demo, user?.id, user?.username, fetchUserDetailsById]);
    const currentUser = (user && Number(user.id) === Number(userId)) ? user : otherUser;

    if (isLoading) {
        return <AlbumPageLoader count={20} withTitle />;
    }
    return (
        <div className="pt-6 pb-10">
            <div className="border-b border-dsNeutral-100 pb-4 mb-6 text-center">
                <h1 className="text-ds-page-title text-dsNeutral-900">
                    {currentUser ? `${currentUser.fullName}'s Album` : "Album"}
                </h1>
                <p className="text-ds-body text-dsNeutral-500 mt-1">
                    {userImages.length} photo{userImages.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Pre-existing bug found and fixed during Phase G verification
                (not introduced by this pass, but squarely in this pass's
                Gallery-responsive scope): the old lg:grid-cols-[repeat(
                auto-fit,minmax(180px,1fr))] miscalculated at exactly
                1024px, computing 5 full 180px tracks (900px) inside a
                container narrower than that and overflowing the page
                horizontally. Fixed columns per breakpoint are predictable
                and match the pattern already used at smaller breakpoints -
                purely a CSS/layout fix, no behavior touched. A plain
                max-w-6xl mx-auto replaces the old per-breakpoint max-width
                stack so the gallery stays contained at 1920/2560 too. */}
            {userImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 max-w-6xl mx-auto">
                    {userImages.map((imageLink, index) => (
                        <button
                            type="button"
                            key={imageLink || index}
                            className="relative aspect-square overflow-hidden rounded-ds-md border border-dsNeutral-100 bg-dsNeutral-100 cursor-pointer group active:scale-[0.97] transition-transform p-0"
                            onClick={() => openLightbox(userImages, index)}
                            aria-label={`View photo ${index + 1} of ${userImages.length}`}
                        >
                            <img
                                src={imageLink}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dsScrimStrong to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <Maximize2 className="w-6 h-6 text-white" />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <NoAlbumYet />
            )}
        </div>
    );
}

export default Album;
