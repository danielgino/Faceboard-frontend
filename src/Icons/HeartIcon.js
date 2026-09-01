import React from 'react';
import { Heart } from 'lucide-react';

// Fidelity reconciliation: the Design System's Like control is a plain
// Lucide `heart` icon that swaps fill color on toggle - no bespoke
// checkbox/outline/celebrate-polygon animation. Rebuilt to match that
// exactly. Prop contract (handleLikes, liked, loading) is unchanged from
// before, so Like.js - the only consumer - needed no changes at all;
// handleLikes is still called with no arguments on click, exactly as it
// always ignored the checkbox's own event value previously.
const HeartIcon = ({ handleLikes, liked, loading }) => {
    return (
        <button
            type="button"
            onClick={() => handleLikes?.()}
            disabled={loading}
            aria-label={liked ? 'Unlike' : 'Like'}
            aria-pressed={liked}
            className="flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
            <Heart
                size={18}
                strokeWidth={1.75}
                className={loading ? "animate-pulse" : ""}
                style={{
                    color: liked ? 'oklch(56% 0.19 12)' : 'oklch(46% 0.014 266)',
                    fill: liked ? 'oklch(56% 0.19 12)' : 'none',
                }}
            />
        </button>
    );
};

export default HeartIcon;
