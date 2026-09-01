import React from "react";

// Design System (#feedback) PostSkeleton: white surface, neutral-100
// border, shimmer blocks - kept richer than the design's single abstract
// content block (avatar+line header, one media block) since this stands in
// for the actual PostCard shape (Post.js), which has real, meaningful
// content the design's generic demo skeleton doesn't represent: a two-line
// text block, a media block, and an actions row.
const PostLoader = () => {
    return (
        <div className="w-full flex justify-center mt-6">
            <div className="w-full px-4 sm:px-[18px] py-4 sm:py-[18px] rounded-ds-lg border border-dsNeutral-100 bg-white shadow-ds-low relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-dsNeutral-100/70 to-transparent z-0" />
                <div className="relative z-10 flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-dsNeutral-100" />
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="w-28 h-2.5 bg-dsNeutral-100 rounded" />
                        <div className="w-20 h-2 bg-dsNeutral-100 rounded" />
                    </div>
                </div>

                <div className="relative z-10 mb-4">
                    <div className="w-full h-2.5 bg-dsNeutral-100 rounded mb-2" />
                    <div className="w-[92%] h-2.5 bg-dsNeutral-100 rounded" />
                </div>

                <div className="relative z-10 w-full h-72 sm:h-80 bg-dsNeutral-100 rounded-ds-md mb-4" />

                <div className="relative z-10 flex gap-4 pt-3 border-t border-dsNeutral-100">
                    <div className="w-10 h-6 bg-dsNeutral-100 rounded" />
                    <div className="w-10 h-6 bg-dsNeutral-100 rounded" />
                    <div className="w-10 h-6 bg-dsNeutral-100 rounded" />
                </div>
            </div>
        </div>
    );
};

export default PostLoader;
