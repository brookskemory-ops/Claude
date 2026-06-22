import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          soft: "#171717",
          muted: "#404040",
        },
        paper: {
          DEFAULT: "#ffffff",
          soft: "#fafafa",
          muted: "#f1f1f1",
        },
        line: "#e5e5e5",
        accent: {
          DEFAULT: "#2563eb",
          soft: "#1d4ed8",
          tint: "#eff4ff",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.28em",
      },
      maxWidth: {
        site: "1200px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
