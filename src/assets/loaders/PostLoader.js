import React from "react";

const PostLoader = () => {
    return (
        <div className="w-full flex justify-center mt-6">
            <div className="w-full max-w-4xl px-4 sm:px-6 py-6 rounded-xl border border-gray-300 bg-gray-100 relative overflow-hidden ">
                <div className="absolute top-0 left-0 w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent z-0" />
                <div className="relative z-10 flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-300" />
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="w-28 h-2.5 bg-gray-300 rounded" />
                        <div className="w-20 h-2.5 bg-gray-300 rounded" />
                    </div>
                </div>

                <div className="relative z-10 mb-4">
                    <div className="w-full h-2.5 bg-gray-300 rounded mb-2" />
                    <div className="w-[92%] h-2.5 bg-gray-300 rounded" />
                </div>

                <div className="relative z-10 w-full h-72 sm:h-80 bg-gray-300 rounded-md mb-6" />

                <div className="relative z-10 flex gap-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-md" />
                    <div className="w-8 h-8 bg-gray-300 rounded-md" />
                    <div className="w-8 h-8 bg-gray-300 rounded-md" />
                </div>
            </div>
        </div>
    );
};

export default PostLoader;
