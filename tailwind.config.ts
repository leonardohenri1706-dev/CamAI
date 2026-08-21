import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0284c7",
          600: "#0284c7",
          700: "#0369a1",
        },
        hot: {
          500: "#10b981",
          600: "#059669",
        },
        warm: {
          500: "#f59e0b",
          600: "#d97706",
        },
        cold: {
          500: "#64748b",
          600: "#475569",
        }
      },
    },
  },
  plugins: [],
};

export default config;
