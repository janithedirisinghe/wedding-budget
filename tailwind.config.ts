import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        blush: {
          light: "#f9dfe5",
          DEFAULT: "#f4b9c4",
          dark: "#a05c70",
        },
        gold: {
          DEFAULT: "#c58f65",
          dark: "#8b5e34",
        },
      },
    },
  },
  plugins: [],
};

export default config;
