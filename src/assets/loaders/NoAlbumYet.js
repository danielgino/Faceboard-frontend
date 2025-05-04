import React from "react";

function NoAlbumYet() {
    return (
        <div className="flex flex-col items-center justify-center mt-16 text-gray-500 animate-pulse">
            <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                alt="No Photos"
                className="w-32 h-32 mb-6 opacity-80"
            />
            <h2 className="text-2xl font-semibold">No Photos Yet</h2>
            <p className="text-sm text-gray-400 mt-2">
                Looks like there are no photos uploaded yet.
            </p>
        </div>
    );
}

export default NoAlbumYet;
