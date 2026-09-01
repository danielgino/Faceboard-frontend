import React from "react";

export default function AlbumPageLoader({ count = 20, withTitle = true }) {
    return (
        <div className="pt-6 pb-10" aria-busy="true" aria-live="polite">
            {withTitle && (
                <div className="relative mx-auto mb-8 h-7 w-56 overflow-hidden rounded-ds-md bg-dsNeutral-100">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-5 max-w-6xl mx-auto">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className="relative aspect-square min-h-28 sm:min-h-32 md:min-h-36 overflow-hidden rounded-ds-md bg-dsNeutral-100"
                    >
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                ))}
            </div>
        </div>
    );
}
