import React from "react";
import Lightbox from "yet-another-react-lightbox";
import { Counter } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/ImageLightboxOverride.css";

function ImageLightbox({ images, isOpen, onClose, currentIndex }) {
    if (!images || images.length === 0) return null;

    const slides = images.map((url) => ({ src: url }));

    return (
        <Lightbox
            open={isOpen}
            close={onClose}
            index={currentIndex}
            slides={slides}
            plugins={[Counter]}
            animation={{ fade: 250, swipe: 300 }}
            carousel={{ finite: true }}
            controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
            render={{
                iconPrev: () => <ChevronLeft size={30} strokeWidth={2.25} />,
                iconNext: () => <ChevronRight size={30} strokeWidth={2.25} />,
                iconClose: () => <X size={26} strokeWidth={2.25} />,
            }}
        />
    );
}

export default ImageLightbox;
