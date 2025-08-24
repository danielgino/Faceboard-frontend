import React, {useEffect, useRef, useState} from "react";

function SmartImg({ src, alt = "", onClick }) {
    const wrapRef = useRef(null);
    const [mode, setMode] = useState("cover");

    const handleLoad = (e) => {
        const img = e.currentTarget;
        const wrap = wrapRef.current;
        if (!wrap) return;
        const { width: cw, height: ch } = wrap.getBoundingClientRect();
        if (img.naturalWidth < cw || img.naturalHeight < ch) {
            setMode("contain");
        } else {
            setMode("cover");
        }
    };
    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const ro = new ResizeObserver(() => {
            const img = wrap.querySelector("img");
            if (img && img.complete) {
                handleLoad({ currentTarget: img });
            }
        });
        ro.observe(wrap);
        return () => ro.disconnect();
    }, []);

    return (
        <div
            ref={wrapRef}
            className="relative group cursor-pointer select-none aspect-square sm:h-full bg-gray-100 flex items-center justify-center overflow-hidden"
            onClick={onClick}
        >
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={handleLoad}
                className={
                    mode === "cover"
                        ? "w-full h-full object-cover object-center"   :
                        "max-w-full max-h-full w-auto h-auto object-contain"
                }
            />
        </div>
    );
}

export default function PostImages({ images = [], onImageClick }) {
    const count = images.length;
    if (!count) return null;

    const Tile = ({ url, index, overlayText }) => (
        <div className="relative">
            <SmartImg src={url} onClick={() => onImageClick(images, index)} />
            {overlayText && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-3xl sm:text-4xl font-semibold">
                    {overlayText}
                </div>
            )}
        </div>
    );

    if (count === 1) {
        return (
            <div className="mt-4 overflow-hidden rounded-lg">
                <div className="w-full flex items-center justify-center bg-gray-100 overflow-hidden">
                    <img
                        src={images[0]}
                        alt=""
                        loading="lazy"
                        onClick={() => onImageClick(images, 0)}
                        className="max-w-full h-auto max-h-[560px] md:max-h-[680px] object-contain cursor-pointer"
                    />
                </div>
            </div>
        );
    }
    if (count === 2) {
        return (
            <div className="mt-4 grid grid-cols-2 gap-1 sm:gap-2 overflow-hidden rounded-lg">
                {images.map((url, i) => (
                    <Tile key={i} url={url} index={i} />
                ))}
            </div>
        );
    }

    // 3
    if (count === 3) {
        return (
            <div className="mt-4 grid grid-cols-2 grid-rows-2 gap-1 sm:gap-2 overflow-hidden rounded-lg">
                <div className="row-span-2">
                    <Tile url={images[0]} index={0} />
                </div>
                <Tile url={images[1]} index={1} />
                <Tile url={images[2]} index={2} />
            </div>
        );
    }

    // 4+
    const toShow = images.slice(0, 4);
    const extra = count - 4;
    return (
        <div className="mt-4 grid grid-cols-2 grid-rows-2 gap-1 sm:gap-2 overflow-hidden rounded-lg">
            {toShow.map((url, i) => (
                <Tile
                    key={i}
                    url={url}
                    index={i}
                    overlayText={i === 3 && extra > 0 ? `+${extra}` : undefined}
                />
            ))}
        </div>
    );
}
