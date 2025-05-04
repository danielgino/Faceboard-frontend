
import React, { createContext, useContext, useState } from "react";

const LightBoxContext = createContext();

export const useLightbox = () => useContext(LightBoxContext);

export const LightboxProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (imgs, index = 0) => {
        setImages(imgs);
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
    };

    return (
        <LightBoxContext.Provider value={{ isOpen, images, currentIndex, openLightbox, closeLightbox }}>
            {children}
        </LightBoxContext.Provider>
    );
};