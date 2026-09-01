// Shared fluid-sizing helper for the desktop navigation shell (Header +
// Sidebar). Every desktop nav measurement (width, padding, icon size, font
// size, gap, badge size) grows linearly between the same two reference
// viewports - MIN_VP (720, the smallest desktop tier) and MAX_VP (1920,
// where growth stops so ultrawide 2560+ monitors don't scale forever) -
// instead of each property inventing its own breakpoint tier. Below MIN_VP
// (mobile) this is never applied at all: Header/Sidebar's desktop markup is
// already gated behind `hidden md:flex`/`md:block`, and BottomNav/mobile
// header keep their own fixed, untouched values.
const MIN_VP = 720;
const MAX_VP = 1920;

// Returns a plain CSS `clamp(...)` string (real spaces) for use in inline
// `style={}` values - NOT a Tailwind arbitrary-value class, so no
// underscore-for-space escaping here.
export function fluid(minPx, maxPx, minVp = MIN_VP, maxVp = MAX_VP) {
    const slopeVw = ((maxPx - minPx) / (maxVp - minVp)) * 100;
    const intercept = minPx - (slopeVw * minVp) / 100;
    const sign = intercept >= 0 ? "+" : "-";
    return `clamp(${minPx}px, calc(${slopeVw.toFixed(4)}vw ${sign} ${Math.abs(intercept).toFixed(2)}px), ${maxPx}px)`;
}
