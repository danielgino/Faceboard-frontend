import React from "react";
import noPhotosYet from "../photos/noPhotosYet.png";

// Design System (#feedback) EmptyState surface/typography, applied around
// the real illustration asset - the design's own EmptyState examples are
// icon-only (ghost/search), but this has a genuine illustration with no
// design equivalent, so it's kept rather than replaced with a generic icon.
function NoAlbumYet() {
    return (
        <div className="flex flex-col items-center justify-center py-14 text-center">
            <img
                src={noPhotosYet}
                alt="No Photos"
                className="w-24 h-24 mb-3 opacity-80"
            />
            <p className="text-ds-card-title text-dsNeutral-900">No Photos Yet</p>
            <p className="text-ds-body text-dsNeutral-500 mt-1">
                Looks like there are no photos uploaded yet.
            </p>
        </div>
    );
}

export default NoAlbumYet;
