{import('tailwindcss').Config}

const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                shimmer: 'shimmer 1.5s infinite linear',
                // ✅ נוסיף את האנימציה של ה-marquee
                marquee: 'marquee 15s linear infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                // ✅ נוסיף keyframes ל-marquee
                marquee: {
                    'from': { transform: 'translateX(0%)' },
                    'to': { transform: 'translateX(-50%)' },
                },
            },
            colors: {
                // Shared pale-indigo panel background used across the auth
                // flows (AuthLayout brand panel, Login/SignUp mobile card).
                surface: {
                    auth: '#eef1f8',
                },
                // Design System (Faceboard Design System.dc.html) foundation tokens.
                // Namespaced under `ds*` so they can never collide with existing
                // Tailwind scales (gray/red/blue/indigo/...) or the pre-existing
                // `surface` token above. Not consumed by any component yet —
                // added here only so later migration phases can reference them.
                dsBrand: {
                    50: 'oklch(97.5% 0.012 275)',
                    100: 'oklch(95% 0.025 275)',
                    500: 'oklch(56% 0.17 275)',
                    600: 'oklch(46% 0.18 275)',
                    700: 'oklch(38% 0.16 275)',
                    800: 'oklch(30% 0.13 275)',
                },
                dsNeutral: {
                    canvas: 'oklch(96.5% 0.006 275)',
                    surface: '#ffffff',
                    100: 'oklch(94% 0.005 266)',
                    200: 'oklch(88% 0.007 266)',
                    300: 'oklch(78% 0.008 266)',
                    500: 'oklch(58% 0.012 266)',
                    600: 'oklch(46% 0.014 266)',
                    900: 'oklch(21% 0.014 266)',
                },
                dsLike: 'oklch(56% 0.19 12)',
                dsDestructive: 'oklch(50% 0.19 25)',
                dsWarning: 'oklch(62% 0.15 75)',
                dsSuccess: 'oklch(50% 0.13 152)',
                dsScrim: 'oklch(20% 0.02 275 / .55)',
                dsScrimStrong: 'oklch(15% 0.02 275 / .85)',
                dsFocusRing: 'oklch(56% 0.18 275 / .45)',
            },
            height: {
                // Shared auth form-control height (text/password inputs, primary button).
                control: '50px',
            },
            borderRadius: {
                // Shared auth form-control corner radius (text/password inputs, primary button).
                control: '10px',
                // Design System radius scale — additive `ds-*` names; existing
                // `rounded`, `rounded-md`, `rounded-lg`, etc. are untouched.
                'ds-sm': '8px',
                'ds-md': '10px',
                'ds-lg': '16px',
                'ds-xl': '20px',
                'ds-full': '999px',
            },
            boxShadow: {
                // Design System elevation ladder. "None" and "Bordered" levels
                // need no shadow token (Tailwind's default `shadow-none` and a
                // `border` utility with a `dsNeutral` color already cover them).
                'ds-low': '0 1px 2px oklch(20% 0.02 275 / .06)',
                'ds-floating': '0 12px 28px oklch(20% 0.02 275 / .14)',
                'ds-modal': '0 24px 64px oklch(15% 0.02 275 / .28)',
            },
            fontFamily: {
                // Available for later phases to opt into; body/global font
                // stack in src/index.css is untouched, so nothing renders in
                // Rubik yet.
                rubik: ['Rubik', 'sans-serif'],
            },
            fontSize: {
                // Design System's 15 named typography roles, each bundling
                // size + line-height + weight so a component can opt in with
                // one class (e.g. `text-ds-user-name`). Colors are not part
                // of these tokens — pair with `text-dsNeutral-900` (primary),
                // `text-dsNeutral-600` (secondary), `text-dsNeutral-500`
                // (muted), or `text-dsDestructive` (error) per the design.
                'ds-display': ['40px', { lineHeight: '1.15', fontWeight: '800' }],
                'ds-page-title': ['26px', { lineHeight: '1.25', fontWeight: '700' }],
                'ds-section-title': ['19px', { lineHeight: '1.3', fontWeight: '600' }],
                'ds-card-title': ['16px', { lineHeight: '1.35', fontWeight: '600' }],
                'ds-user-name': ['15px', { lineHeight: '1.3', fontWeight: '600' }],
                'ds-handle': ['14px', { lineHeight: '1.3', fontWeight: '400' }],
                'ds-body': ['15px', { lineHeight: '1.55', fontWeight: '400' }],
                'ds-secondary-body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
                'ds-label': ['13px', { lineHeight: '1.3', fontWeight: '500' }],
                'ds-button': ['15px', { lineHeight: '1', fontWeight: '600' }],
                'ds-caption': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
                'ds-metadata': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
                'ds-timestamp': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
                'ds-helper': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
                'ds-error': ['12px', { lineHeight: '1.3', fontWeight: '600' }],
            },
        },
    },
    plugins: [],
});
