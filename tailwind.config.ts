import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Semantic tokens — auto-switch via CSS variables */
        page:      "rgb(var(--color-page) / <alpha-value>)",
        panel:     "rgb(var(--color-panel) / <alpha-value>)",
        raised:    "rgb(var(--color-raised) / <alpha-value>)",
        ink:       "rgb(var(--color-ink) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        faded:     "rgb(var(--color-faded) / <alpha-value>)",
        line:      "rgb(var(--color-line) / <alpha-value>)",
        accent:    "rgb(var(--color-accent) / <alpha-value>)",
        "input-bg":     "rgb(var(--color-input) / <alpha-value>)",
        "input-border": "rgb(var(--color-input-border) / <alpha-value>)",

        /* Brand red palette (static — works in both modes) */
        brand: {
          50:  "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#ef4444",
          500: "#dc2626",
          600: "#b91c1c",
          700: "#8B1A1A",
          800: "#6B1414",
          900: "#450a0a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        blob: "blob 7s infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "chat-pop-in": "chatPopIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
      keyframes: {
        blob: {
          "0%":   { transform: "translate(0px, 0px) scale(1)" },
          "33%":  { transform: "translate(30px, -50px) scale(1.1)" },
          "66%":  { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        chatPopIn: {
          "0%":   { opacity: "0", transform: "scale(0.8) translateY(20px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      boxShadow: {
        "chat-btn": "0 0 20px rgba(139,26,26,0.5), 0 0 40px rgba(139,26,26,0.3), 0 0 60px rgba(139,26,26,0.15)",
        "chat-send": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px rgba(139,26,26,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
