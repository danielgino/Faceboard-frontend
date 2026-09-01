import React from 'react';

// Matches Comment.js's actual CommentItem shape (avatar + rounded bubble,
// see the Feed reconciliation pass) instead of the Material Card/CardHeader
// layout that shape moved away from - a skeleton should mirror the real
// component it's standing in for. Also aligned to the design's
// CommentSkeleton token (#feedback): 24-28px avatar circle + one shimmer
// line, white surface.
function CommentLoader() {
    return (
        <div className="flex w-full max-w-[48rem] items-start gap-2.5 mb-3 animate-pulse">
            <div className="rounded-full bg-dsNeutral-100 h-7 w-7 flex-shrink-0" />
            <div className="flex-1 rounded-ds-lg bg-dsNeutral-canvas px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="bg-dsNeutral-200 h-2.5 w-24 rounded" />
                    <div className="bg-dsNeutral-200 h-2 w-10 rounded" />
                </div>
                <div className="bg-dsNeutral-200 h-2.5 w-3/4 rounded" />
            </div>
        </div>
    );
}

export default CommentLoader;
