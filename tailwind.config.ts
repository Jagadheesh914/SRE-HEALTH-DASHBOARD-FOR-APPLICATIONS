import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light white/blue dashboard palette (matches the reference mockup)
        bg: {
          DEFAULT: "#eef4fb",
          soft: "#f6fafd",
        },
        panel: {
          DEFAULT: "#ffffff",
          border: "rgba(60,102,206,0.14)",
          hover: "#f0f5fc",
        },
        ink: {
          DEFAULT: "#0a1a3d",
          muted: "#5b6a8c",
          faint: "#8494b8",
        },
        brand: {
          blue: "#3c66ce",
          cyan: "#36c0cf",
          coned: "#0099d8",
          orange: "#e77613",
        },
        sev: {
          green: "#16a34a",
          yellow: "#d97706",
          red: "#e0384a",
          orange: "#e8720c",
          purple: "#7c5cd6",
          teal: "#36c0cf",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-grotesk)", "Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        panel: "0 2px 10px rgba(10,26,61,0.05)",
        glow: "0 0 0 1px rgba(60,102,206,0.35), 0 8px 30px rgba(60,102,206,0.15)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.25s ease-out",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
