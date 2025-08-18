
import React from "react";
import { useLightbox } from "../../context/LightBoxContext";
import ImageLightbox from "./ImageLightBox";
const GlobalImageLightbox = () => {
    const { isOpen, images, currentIndex, closeLightbox } = useLightbox();

    return (
        <ImageLightbox
            images={images}
            isOpen={isOpen}
            onClose={closeLightbox}
            currentIndex={currentIndex}
        />
    );
};

export default GlobalImageLightbox;
