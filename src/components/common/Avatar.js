// Design System (Faceboard Design System.dc.html) Avatar primitive.
//
// Pure presentation: image-or-initials + size, nothing else. No name/handle
// text, navigation, friend/online/unread state, or actions — those stay in
// each domain composition (see the UserIdentity compatibility matrix in the
// migration plan, which is not yet approved for consolidation).
//
// Built from a plain <img>/div rather than wrapping Material Tailwind's
// <Avatar>, because MT's Avatar has no initials-fallback behavior and the
// design requires one; 14 files currently import MT's Avatar directly with
// no shared wrapper at all (see the Phase B primitive gate report).
//
// Fallback color uses the single design-provided brand tint (dsBrand-100 /
// dsBrand-700). The design also shows a rotating 4-hue fallback palette for
// visually distinguishing different users at a glance — not implemented
// here since no confirmed Phase B consumer needs it yet; documented as a
// future enhancement rather than built speculatively.
import React, {useState} from "react";

const SIZE_PX = {
    sm: 32,
    md: 40,
    lg: 64,
    xl: 96,
};

function initialsFrom(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}

export const Avatar = ({src, alt = "", name, size = "md", className = "", style: styleOverride}) => {
    const [imgFailed, setImgFailed] = useState(false);
    // `size` accepts a named key, a raw number (px), or - for fluid/responsive
    // callers (e.g. the desktop Header's avatar-only identity) - any other
    // CSS length string (e.g. a clamp() expression), passed through as-is.
    const px = typeof size === "number" ? size : (SIZE_PX[size] ?? size);
    const showImage = !!src && !imgFailed;
    // `style` accepts extra CSS (e.g. a box-shadow ring, as used by the
    // Stories rail's viewed/unviewed treatment) merged on top of the
    // size-driven width/height - never used to override width/height itself.
    const style = {width: px, height: px, ...styleOverride};

    if (showImage) {
        return (
            <img
                src={src}
                alt={alt}
                onError={() => setImgFailed(true)}
                style={style}
                className={`flex-shrink-0 rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <div
            role={alt ? "img" : undefined}
            aria-label={alt || undefined}
            style={style}
            className={`flex flex-shrink-0 items-center justify-center rounded-full bg-dsBrand-100 font-bold text-dsBrand-700 ${className}`}
        >
            {/* Visual-only: without this, the initials leak into the
                accessible name computation of any enclosing link/button as
                plain text, double-announcing alongside an adjacent visible
                name (found wiring HeaderBar's identity link in Phase D —
                e.g. "AL Ada Lovelace" instead of just "Ada Lovelace"). The
                container above already carries the real accessible name via
                role="img"/aria-label when `alt` is meaningful. */}
            <span aria-hidden="true" style={{fontSize: typeof px === "number" ? Math.max(10, Math.round(px * 0.32)) : "13px"}}>{initialsFrom(name)}</span>
        </div>
    );
};

export default Avatar;
