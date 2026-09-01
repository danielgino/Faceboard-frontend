import {useMemo} from "react";
import {Link} from "react-router-dom";
import {ALBUM_PAGE} from "../../../utils/Utils";
import noPhotosYet from "../../../assets/photos/noPhotosYet.png";
import {useLightbox} from "../../../context/LightBoxContext";

// Fidelity reconciliation (Phase G): rebuilt against the Design System's
// Gallery preview card (#profile) - header row (title + "View all"), 2x2
// tile grid. Also fixes a real markup bug: the old version nested a <div>
// grid and a second <Typography> block inside an <h5>-rendering Typography,
// which is invalid HTML (block content inside a heading). Photos preview
// card: heading/link to the full album, the last-4-images grid (or an
// empty state), and a "View all" link once there are more than 4. Owns the
// lightbox interaction directly since opening it on a thumbnail click has
// no other consumer in UserDetails.
function ProfileGallery({images, userId}) {
    const {openLightbox} = useLightbox();

    const latestImages = useMemo(() => {
        if (!images) return [];
        return [...images].slice(-4).reverse();
    }, [images]);

    const handleImageClick = (index) => {
        openLightbox(images, index);
    };

    return (
        <div className="w-full bg-white border border-dsNeutral-100 rounded-ds-lg p-[18px]">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-ds-card-title text-dsNeutral-900">Gallery</h2>
                {images.length > 4 && (
                    <Link to={ALBUM_PAGE(userId)} className="text-ds-caption font-semibold text-dsBrand-600 hover:text-dsBrand-700">
                        View all
                    </Link>
                )}
            </div>

            {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 bg-dsNeutral-canvas rounded-ds-md">
                    <img src={noPhotosYet} alt="" className="w-16 h-16 object-contain opacity-70" />
                    <p className="text-ds-caption text-dsNeutral-500 mt-2">No photos uploaded yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {latestImages.map((image, index) => {
                        const realIndex = images.findIndex(img => img === image);
                        return (
                            <button
                                type="button"
                                key={index}
                                className="group relative overflow-hidden rounded-ds-md border border-dsNeutral-100 p-0 aspect-square"
                                onClick={() => handleImageClick(realIndex)}
                                aria-label={`View photo ${realIndex + 1}`}
                            >
                                <img
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                                    src={image}
                                    alt=""
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ProfileGallery;
