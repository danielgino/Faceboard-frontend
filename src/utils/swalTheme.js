import Swal from "sweetalert2";
import ReactDOMServer from "react-dom/server";
import React from "react";
import { AlertTriangle, Trash2, Check, XCircle } from "lucide-react";
import "../assets/styles/SwalDesignTheme.css";

// SweetAlert2 remains the dialog engine everywhere in the app (promise
// resolution, Escape/backdrop/focus handling, preConfirm, showLoading - all
// untouched, see SwalDesignTheme.css for the full rationale). This module
// only does two things beyond that CSS: (1) turns off SweetAlert2's default
// inline button styling so the CSS classes below fully control button
// appearance, and (2) swaps SweetAlert2's built-in icon glyphs for the
// exact Lucide icons the rest of the app already uses, rendered via
// ReactDOMServer so they're pixel-identical to <AlertTriangle>/<Trash2>/etc.
// elsewhere - not hand-copied SVG path data.
const ICON_GLYPH = {
    success: Check,
    error: XCircle,
    warning: AlertTriangle,
};

function iconSvg(Component) {
    return ReactDOMServer.renderToStaticMarkup(
        React.createElement(Component, { size: 16, strokeWidth: 2 })
    );
}

// Destructive confirmations (delete post/comment, unfriend, reject request)
// pass icon:"warning" today (unchanged - see Utils.js's
// SWAL_DESTRUCTIVE_CONFIRM_CLASS) but the design's DestructiveDialog shows a
// trash icon, not a generic triangle - swapped via the same customClass.icon
// modifier that already retones the badge red.
function resolveIconComponent(options) {
    if (options.icon === "warning" && options.customClass?.icon?.includes("ds-swal-icon--destructive")) {
        return Trash2;
    }
    return ICON_GLYPH[options.icon];
}

// No customClass default here: SweetAlert2 replaces `customClass` wholesale
// per .fire() call rather than merging it with the mixin's, so any call
// site setting its own customClass (every destructive confirmation) would
// silently drop a mixin-level default. SwalDesignTheme.css targets
// SweetAlert2's own always-present classes (.swal2-popup, .swal2-confirm,
// ...) instead, so no opt-in class is needed at all.
const ThemedSwal = Swal.mixin({
    buttonsStyling: false,
});

const originalFire = ThemedSwal.fire.bind(ThemedSwal);
ThemedSwal.fire = (...args) => {
    // Swal.fire supports both fire(options) and the shorthand
    // fire(title, html, icon) - normalize to an options object so the
    // Lucide icon swap applies identically either way, then still call
    // through with that single normalized object (SweetAlert2 accepts
    // both forms, so this changes nothing about resolution/behavior).
    let options;
    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null) {
        options = args[0];
    } else if (typeof args[0] === "string") {
        options = { title: args[0], html: args[1], icon: args[2] };
    } else {
        return originalFire(...args);
    }

    const IconComponent = resolveIconComponent(options);
    if (IconComponent && !options.iconHtml) {
        return originalFire({ ...options, iconHtml: iconSvg(IconComponent) });
    }
    return originalFire(options);
};

export default ThemedSwal;
