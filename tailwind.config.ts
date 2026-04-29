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
        // Surfaces — softer Nordic neutrals
        canvas: "#FBF8F2",
        surface: "#FFFFFF",
        elevated: "#FFFFFF",
        sunken: "#F4EFE6",

        // Borders & dividers
        hairline: "#ECE4D2",
        border: "#E2D9C4",

        // Text
        ink: "#1F2A26",
        muted: "#5C6661",
        subtle: "#8C918C",

        // Sage (primary action) — softer than the old moss
        sage: {
          DEFAULT: "#5B8377",
          50: "#EFF4F2",
          100: "#DCE7E2",
          200: "#BAD0C7",
          300: "#94B5A8",
          400: "#739A8B",
          500: "#5B8377",
          600: "#436C61",
          700: "#33554C",
          800: "#243C36",
          900: "#172521"
        },

        // Warm accent (single warm — used sparingly)
        warm: {
          DEFAULT: "#C46A40",
          50: "#FAEFE8",
          100: "#F2DAC8",
          200: "#E6B69A",
          300: "#D88E69",
          400: "#CA7548",
          500: "#C46A40",
          600: "#A55432",
          700: "#7E3F25"
        },

        // Sand / bone for soft fills
        sand: {
          50: "#FBF7EF",
          100: "#F4EFE2",
          200: "#E8DDC2",
          300: "#D8C8A0"
        },

        // Calm sky tint (used as quiet info chips)
        sky: {
          100: "#E1ECEC",
          200: "#C7DDDD",
          300: "#A6C8C8"
        },

        // Semantic
        success: "#3F7B5F",
        warning: "#B47A1F",
        danger: "#B6492C",
        info: "#3F6F84",

        // Legacy aliases (keep so we don't have to touch every file at once)
        linen: "#FBF8F2",
        moss: "#5B8377",
        mossDark: "#33554C",
        rust: "#C46A40",
        oat: "#E2D9C4",
        clay: "#D88E69",
        skywash: "#E1ECEC",
        butter: "#F1D78D"
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        // Tighter, denser type scale
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.45rem" }],
        lg: ["1.0625rem", { lineHeight: "1.55rem" }],
        xl: ["1.1875rem", { lineHeight: "1.65rem" }],
        "2xl": ["1.4375rem", { lineHeight: "1.85rem" }],
        "3xl": ["1.75rem", { lineHeight: "2.1rem" }],
        "4xl": ["2.125rem", { lineHeight: "2.4rem", letterSpacing: "-0.01em" }],
        "5xl": ["2.625rem", { lineHeight: "2.85rem", letterSpacing: "-0.015em" }]
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31, 42, 38, 0.04), 0 8px 24px rgba(31, 42, 38, 0.06)",
        lift: "0 2px 4px rgba(31, 42, 38, 0.05), 0 16px 36px rgba(31, 42, 38, 0.1)",
        ring: "0 0 0 1px rgba(226, 217, 196, 0.9)",
        focus: "0 0 0 3px rgba(91, 131, 119, 0.25)"
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        card: "14px",
        pill: "999px"
      },
      spacing: {
        "0.5": "0.125rem",
        "1.5": "0.375rem",
        "2.5": "0.625rem",
        "3.5": "0.875rem"
      },
      transitionTimingFunction: {
        nordic: "cubic-bezier(0.32, 0.72, 0, 1)"
      }
    }
  },
  plugins: []
};

export default config;
