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
                 softPulse: 'softPulse 2.5s ease-in-out infinite',
             },
             keyframes: {
                 shimmer: {
                     '0%': { transform: 'translateX(-100%)' },
                     '100%': { transform: 'translateX(100%)' },
                 },
                 softPulse: {
                     '0%, 100%': { opacity: '1' },
                     '50%': { opacity: '0.94' },
                 },
             },
         },
     },
   plugins: [],
 });

 // const withMT = require("@material-tailwind/react/utils/withMT");
 // const { fontFamily } = require("tailwindcss/defaultTheme");
 //
 // module.exports = withMT({
 //     darkMode: ["class"],
 //     content: [
 //         "./src/**/*.{js,jsx,ts,tsx}",
 //         "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
 //         "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}"
 //     ],
 //     theme: {
 //         container: {
 //             center: true,
 //             padding: "2rem",
 //             screens: {
 //                 "2xl": "1400px",
 //             },
 //         },
 //         extend: {
 //             colors: {
 //                 border: "hsl(var(--border))",
 //                 input: "hsl(var(--input))",
 //                 ring: "hsl(var(--ring))",
 //                 background: "hsl(var(--background))",
 //                 foreground: "hsl(var(--foreground))",
 //                 primary: {
 //                     DEFAULT: "hsl(var(--primary))",
 //                     foreground: "hsl(var(--primary-foreground))",
 //                 },
 //                 secondary: {
 //                     DEFAULT: "hsl(var(--secondary))",
 //                     foreground: "hsl(var(--secondary-foreground))",
 //                 },
 //                 destructive: {
 //                     DEFAULT: "hsl(var(--destructive))",
 //                     foreground: "hsl(var(--destructive-foreground))",
 //                 },
 //                 muted: {
 //                     DEFAULT: "hsl(var(--muted))",
 //                     foreground: "hsl(var(--muted-foreground))",
 //                 },
 //                 accent: {
 //                     DEFAULT: "hsl(var(--accent))",
 //                     foreground: "hsl(var(--accent-foreground))",
 //                 },
 //                 popover: {
 //                     DEFAULT: "hsl(var(--popover))",
 //                     foreground: "hsl(var(--popover-foreground))",
 //                 },
 //                 card: {
 //                     DEFAULT: "hsl(var(--card))",
 //                     foreground: "hsl(var(--card-foreground))",
 //                 },
 //             },
 //             borderRadius: {
 //                 lg: "var(--radius)",
 //                 md: "calc(var(--radius) - 2px)",
 //                 sm: "calc(var(--radius) - 4px)",
 //             },
 //             fontFamily: {
 //                 sans: ["var(--font-sans)", ...fontFamily.sans],
 //             },
 //             keyframes: {
 //                 "accordion-down": {
 //                     from: { height: "0" },
 //                     to: { height: "var(--radix-accordion-content-height)" },
 //                 },
 //                 "accordion-up": {
 //                     from: { height: "var(--radix-accordion-content-height)" },
 //                     to: { height: "0" },
 //                 },
 //             },
 //             animation: {
 //                 "accordion-down": "accordion-down 0.2s ease-out",
 //                 "accordion-up": "accordion-up 0.2s ease-out",
 //             },
 //         },
 //     },
 //     plugins: [require("tailwindcss-animate")],
 // });
