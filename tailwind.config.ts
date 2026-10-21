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

        /* ── shadcn / Magic UI compatibility layer ──────────────────────
         * Components copied from shadcn or Magic UI reference these token
         * names. They are aliases onto the semantic palette above, so they
         * inherit light/dark automatically and introduce no new colours.
         * `secondary` and `accent` are intentionally NOT redefined here:
         * both are already in use sitewide and keep their existing meaning.
         */
        background:   "rgb(var(--color-page) / <alpha-value>)",
        foreground:   "rgb(var(--color-ink) / <alpha-value>)",
        muted:        "rgb(var(--color-panel) / <alpha-value>)",
        "muted-foreground": "rgb(var(--color-faded) / <alpha-value>)",
        border:       "rgb(var(--color-line) / <alpha-value>)",
        input:        "rgb(var(--color-input-border) / <alpha-value>)",
        ring:         "rgb(var(--color-accent) / <alpha-value>)",
        card:         "rgb(var(--color-panel) / <alpha-value>)",
        "card-foreground":    "rgb(var(--color-ink) / <alpha-value>)",
        popover:      "rgb(var(--color-panel) / <alpha-value>)",
        "popover-foreground": "rgb(var(--color-ink) / <alpha-value>)",
        primary:      "rgb(var(--color-accent) / <alpha-value>)",
        "primary-foreground":     "#ffffff",
        "secondary-foreground":   "#ffffff",
        "accent-foreground":      "#ffffff",
        destructive:              "#dc2626",
        "destructive-foreground": "#ffffff",

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
        marquee: "marquee var(--duration, 40s) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration, 40s) linear infinite",
        "border-beam": "border-beam calc(var(--duration, 12) * 1s) infinite linear",
        shimmer: "shimmer 8s infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "chat-pop-in": "chatPopIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(calc(-100% - var(--gap, 1rem)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to:   { transform: "translateY(calc(-100% - var(--gap, 1rem)))" },
        },
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
        shimmer: {
          "0%, 90%, 100%": { "background-position": "calc(-100% - var(--shimmer-width)) 0" },
          "30%, 60%":      { "background-position": "calc(100% + var(--shimmer-width)) 0" },
        },
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
