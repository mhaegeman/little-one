import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        linen: "#F5F0E8",
        moss: "#4A7C6F",
        mossDark: "#2F5149",
        rust: "#C4623A",
        oat: "#E8DAC7",
        ink: "#26312D",
        clay: "#D9A48C",
        skywash: "#D7E5E4",
        butter: "#F6D77A"
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(38, 49, 45, 0.08)"
      },
      borderRadius: {
        card: "16px"
      }
    }
  },
  plugins: []
};

export default config;
