import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#eef8ff",
                    100: "#d9f0ff",
                    200: "#bce4ff",
                    300: "#8ecfff",
                    400: "#5ab0ff",
                    500: "#3490ff",
                    600: "#1b70f5",
                    700: "#155ae2",
                    800: "#1648b7",
                    900: "#173f91",
                },
                accent: {
                    400: "#fb7185",
                    500: "#f43f5e",
                    600: "#e11d48",
                },
                dark: {
                    950: "#020617",
                    900: "#0F172A",
                    800: "#1E293B",
                    700: "#334155",
                    600: "#475569",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                blob: "blob 7s infinite",
                "fade-in-up": "fadeInUp 0.6s ease-out forwards",
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
