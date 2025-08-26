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
                // ✅ נוסיף את האנימציה של ה-marquee
                marquee: 'marquee 15s linear infinite',
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
                // ✅ נוסיף keyframes ל-marquee
                marquee: {
                    'from': { transform: 'translateX(0%)' },
                    'to': { transform: 'translateX(-50%)' },
                },
            },
            // ✅ מאפשר להשתמש ב-translate-y-[101%]
            translate: {
                '101': '101%',
            },
        },
    },
    plugins: [],
});
