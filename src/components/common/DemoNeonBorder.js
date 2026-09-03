import React from "react";

// Demo Mode neon border: an SVG rounded-rect OUTLINE (`fill: none`, stroke only) - see
// DemoNeonBorder.css for the animated "runner" technique and reduced-motion fallback.
//
// Purely decorative: `aria-hidden` + `pointer-events: none` (in the CSS) mean it can never affect
// the host's accessible name or intercept a click - the host remains the only interactive layer.
function DemoNeonBorder({ variant }) {
    return (
        <svg className={`demo-neon-border-svg demo-neon-border-svg--${variant}`} aria-hidden="true">
            <rect className="demo-neon-border-track" />
            <rect className="demo-neon-border-runner" pathLength="100" />
        </svg>
    );
}

export default DemoNeonBorder;
