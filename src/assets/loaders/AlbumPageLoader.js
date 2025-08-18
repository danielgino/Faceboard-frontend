import React from "react";

export default function AlbumPageLoader({ count = 20, withTitle = true }) {
    return (
        <div className="flex-1 px-4 pt-8 min-h-screen" aria-busy="true" aria-live="polite">
            {withTitle && (
                <div className="mx-auto mb-8 h-7 w-56 rounded-md bg-gray-200 animate-pulse" />
            )}

            <div className="flex justify-center">
                <div className="grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="rounded-xl bg-gray-300 shadow-md animate-pulse">
                            <div className="w-full aspect-square min-h-28 sm:min-h-32 md:min-h-36 bg-gray-200 rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
