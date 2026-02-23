import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Fredoka", "sans-serif"],
      },
      colors: {
        zoo: {
          green: "#A8E6CF",
          darkGreen: "#2ECC71",
          blue: "#4ECDC4",
          purple: "#9B59B6",
          pink: "#FF6B9D",
          yellow: "#FFD93D",
          orange: "#FFB347",
          coral: "#FF8B94",
          sky: "#74B9FF",
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        bounceIn: "bounceIn 0.6s ease-out",
        slideIn: "slideIn 0.5s ease-out",
        wiggle: "wiggle 0.5s ease-in-out",
        eat: "eat 0.3s ease-in-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
        eat: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
