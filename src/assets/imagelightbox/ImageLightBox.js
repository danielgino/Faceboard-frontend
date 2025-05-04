import React from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import {Thumbnails} from "yet-another-react-lightbox/plugins";
import "../../styles/ImageLightboxOverride.css";

function ImageLightbox({ images, isOpen, onClose, currentIndex }) {
    if (!images || images.length === 0) return null;

    const slides = images.map((url) => ({ src: url }));

    return (
        <Lightbox
            open={isOpen}
            close={onClose}
            index={currentIndex}
            slides={slides}
            plugins={[Thumbnails]} // 🔥 Thumbnails מופעלים!
            closeOnBackdropClick={true}
            closeOnClick={true}
            controller={{ closeOnBackdropClick: true, closeOnPullDown: true, closeOnClick: true }}

        />
    );
}

export default ImageLightbox;
