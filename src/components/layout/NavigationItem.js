import React from "react";
import { Link } from "react-router-dom";
import { fluid } from "./navFluid";

// Design System (Faceboard Design System.dc.html, #nav) NavigationItem: one
// icon+label shape - selected tint+dot, badge - reused across the desktop
// header, sidebar rail and mobile bottom nav. Only became possible once the
// Sidebar dropped Material's List/ListItem (Phase D kept them separate
// specifically because Header/Sidebar/BottomNav each used a different
// interactive-element semantic); all three now render a real <Link> (or a
// <button> for the one non-navigating case, Logout), so one shared component
// covers all three without forcing a semantic they didn't already use.
//
// Responsive proportion pass: "header" and "rail" (desktop-only, gated
// behind `hidden md:flex`/`md:block` by their callers) scale fluidly between
// 720px and 1920px via the shared `fluid()` helper, so a 2560px monitor
// doesn't render the exact same pixel sizes as a 720px one. "bottom"
// (mobile-only, <720px) is intentionally left with its original fixed
// values - untouched, per this pass's explicit "don't enlarge mobile"
// instruction.
const VARIANT_BASE = {
    header: `relative flex items-center rounded-lg font-semibold transition`,
    rail: `relative flex items-center rounded-lg font-medium transition`,
    bottom: "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold transition",
};

const VARIANT_STYLE = {
    header: {
        gap: fluid(6, 8),
        paddingInline: fluid(10, 14),
        paddingBlock: fluid(6, 9),
        fontSize: fluid(13, 14.5),
    },
    rail: {
        gap: fluid(10, 13),
        paddingInline: fluid(10, 14),
        paddingBlock: fluid(8, 11),
        fontSize: fluid(13, 15),
    },
};

const ICON_WRAP_SIZE = { header: fluid(16, 19), rail: fluid(17, 21) };
const ICON_SIZE = { bottom: 19 };

export function NavigationItem({
    to,
    onClick,
    icon: Icon,
    label,
    active = false,
    badge,
    variant = "header",
    destructive = false,
    hideLabel = false,
    className = "",
}) {
    const toneClasses = destructive
        ? "text-dsDestructive hover:bg-dsNeutral-100"
        : active
            ? variant === "bottom"
                ? "text-dsBrand-700"
                : "bg-dsBrand-100 text-dsBrand-700"
            : "text-dsNeutral-600 hover:bg-dsNeutral-100";

    const iconWrapStyle = variant !== "bottom" ? { width: ICON_WRAP_SIZE[variant], height: ICON_WRAP_SIZE[variant] } : undefined;

    const content = (
        <>
            <span className="relative inline-flex flex-shrink-0" style={iconWrapStyle}>
                <Icon size={variant === "bottom" ? ICON_SIZE.bottom : undefined} className={variant !== "bottom" ? "w-full h-full" : undefined} strokeWidth={1.75} />
                {badge > 0 && variant !== "rail" && (
                    <span
                        aria-hidden="true"
                        className={
                            variant === "header"
                                ? "absolute -top-0.5 -right-0.5 w-[7px] h-[7px] rounded-full bg-dsDestructive ring-1 ring-white"
                                : "absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-dsDestructive text-white text-[9px] font-bold leading-[14px] text-center ring-[1.5px] ring-white"
                        }
                    >
                        {variant === "bottom" ? (badge > 99 ? "99+" : badge) : null}
                    </span>
                )}
            </span>
            {!hideLabel && <span className={variant === "bottom" ? "leading-none" : ""}>{label}</span>}
            {badge != null && badge > 0 && variant === "rail" && (
                <span
                    className="ml-auto rounded-full bg-dsBrand-600 text-white font-bold flex items-center justify-center flex-shrink-0"
                    style={{ minWidth: fluid(18, 22), height: fluid(18, 22), fontSize: fluid(10, 11), paddingInline: fluid(3, 5) }}
                >
                    {badge > 99 ? "99+" : badge}
                </span>
            )}
            {active && (variant === "bottom" || variant === "header") && (
                <span
                    aria-hidden="true"
                    className={
                        variant === "bottom"
                            ? "absolute -bottom-1 w-3.5 h-[2.5px] rounded-full bg-dsBrand-600"
                            : "absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-4 h-[2.5px] rounded-full bg-dsBrand-600"
                    }
                />
            )}
        </>
    );

    const cls = `${VARIANT_BASE[variant]} ${toneClasses} focus:outline-none focus-visible:ring-2 focus-visible:ring-dsFocusRing ${className}`;
    const itemStyle = variant !== "bottom" ? {
        gap: VARIANT_STYLE[variant].gap,
        paddingInline: VARIANT_STYLE[variant].paddingInline,
        paddingBlock: VARIANT_STYLE[variant].paddingBlock,
        fontSize: VARIANT_STYLE[variant].fontSize,
    } : undefined;

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={cls} style={itemStyle} aria-label={hideLabel ? label : undefined}>
                {content}
            </button>
        );
    }

    return (
        <Link to={to} className={cls} style={itemStyle} aria-current={active ? "page" : undefined} aria-label={hideLabel ? label : undefined}>
            {content}
        </Link>
    );
}

export default NavigationItem;
