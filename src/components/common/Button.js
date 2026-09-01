// Design System (Faceboard Design System.dc.html) Button primitive.
//
// Scope is intentionally narrow: only the variants with a confirmed current
// consumer are implemented (see the Phase B primitive gate report).
//   - "primary": AuthPrimaryButton (Login/SignUp), ForgotPassword/ResetPassword
//     submit, PasswordSettings save — three different implementations of the
//     same semantic role today.
//   - "text": ForgotPassword's "Back to login" link-style button.
// "secondary"/"neutral"/"destructive" exist in the design but have no
// confirmed non-SweetAlert consumer yet — not built speculatively.
//
// Visual only: no API calls, navigation, or form logic live here. Domain
// behavior (onClick handlers, submit logic) stays owned by the caller.
import React from "react";

// Two real shapes evidenced in production, not one: a sized CTA control
// (primary) and an inline text link that must inherit the surrounding
// paragraph's size/weight rather than impose a control-sized box (text).
// Discovered while wiring Phase C's "Forgot your password?"/"Back to
// login"/"Sign up" links — an earlier version applied the CTA's h-control/
// px-4/rounded-control/text-ds-button box to these too, which visibly
// turned plain underlined text into a padded pill. Fixed here rather than
// forcing the link markup to fight the primitive.
const VARIANT_CLASSES = {
    primary:
        "h-control gap-2 rounded-control px-4 text-ds-button font-semibold " +
        "bg-dsBrand-600 text-white hover:bg-dsBrand-700 active:bg-dsBrand-800 " +
        "disabled:bg-dsNeutral-100 disabled:text-dsNeutral-300",
    text:
        "gap-1.5 rounded-md py-0.5 " +
        "bg-transparent text-dsBrand-600 hover:text-dsBrand-700 hover:underline " +
        "disabled:text-dsNeutral-300 disabled:no-underline",
};

const BASE_CLASSES =
    "inline-flex items-center justify-center transition outline-none " +
    "focus-visible:ring-4 focus-visible:ring-dsFocusRing " +
    "disabled:cursor-not-allowed";

export const Button = ({
    type = "button",
    variant = "primary",
    loading = false,
    disabled = false,
    className = "",
    children,
    ...rest
}) => {
    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            disabled={isDisabled}
            aria-busy={loading || undefined}
            className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary} ${className}`}
            {...rest}
        >
            {loading && (
                <span
                    className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                />
            )}
            {children}
        </button>
    );
};

export default Button;
