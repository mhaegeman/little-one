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
        // Pastel Toy-Box neutrals (warm bone canvas)
        canvas: "#FBF6EE",
        surface: "#FFFFFF",
        elevated: "#FFFFFF",
        sunken: "#F4ECDD",

        // Borders & dividers — Pastel
        hairline: "#EADFCB",
        border: "#DCCEB2",

        // Text — Pastel
        ink: "#2A2723",
        muted: "#6B655C",
        subtle: "#9A938A",

        // Pastel Toy-Box tint scales ──────────────────────────────────
        // Mint — primary action
        mint: {
          DEFAULT: "#79B98A",
          50: "#DDEFE3",
          100: "#C2E1CB",
          200: "#9DCFAB",
          300: "#79B98A",
          ink: "#1F4D32"
        },

        // Peach — accent
        peach: {
          DEFAULT: "#E89A75",
          50: "#FBE7DC",
          100: "#F7D2BE",
          200: "#F2B79A",
          300: "#E89A75",
          ink: "#7A3A1E"
        },

        // Butter — warm highlight
        butter: {
          DEFAULT: "#E5B441",
          50: "#FBEBC4",
          100: "#F7DC9C",
          200: "#F0C76A",
          300: "#E5B441",
          ink: "#6E4F0D"
        },

        // Sky — calm info
        sky: {
          DEFAULT: "#74A4BF",
          50: "#DDEAF1",
          100: "#C2D8E5",
          200: "#9CC0D5",
          300: "#74A4BF",
          ink: "#1F4254"
        },

        // Semantic shortcuts (Pastel)
        primary: { DEFAULT: "#79B98A", ink: "#1F4D32" },
        accent: { DEFAULT: "#E89A75", ink: "#7A3A1E" },

        // ─────────────────────────────────────────────────────────────
        // Legacy scales — kept until components migrate to mint/peach.
        // Do not use for new work.
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
        sand: {
          50: "#FBF7EF",
          100: "#F4EFE2",
          200: "#E8DDC2",
          300: "#D8C8A0"
        },

        // Status (kept; could be re-keyed to Pastel inks later)
        success: "#1F4D32",
        warning: "#6E4F0D",
        danger: "#7A3A1E",
        info: "#1F4254",

        // Legacy single-hex aliases — do not use for new work.
        linen: "#FBF6EE",
        moss: "#5B8377",
        mossDark: "#33554C",
        rust: "#C46A40",
        oat: "#DCCEB2",
        clay: "#D88E69",
        skywash: "#DDEAF1"
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        // Existing UI numeric scale — unchanged so component callsites stay stable.
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.45rem" }],
        lg: ["1.0625rem", { lineHeight: "1.55rem" }],
        xl: ["1.1875rem", { lineHeight: "1.65rem" }],
        "2xl": ["1.4375rem", { lineHeight: "1.85rem" }],
        "3xl": ["1.75rem", { lineHeight: "2.1rem" }],
        "4xl": ["2.125rem", { lineHeight: "2.4rem", letterSpacing: "-0.01em" }],
        "5xl": ["2.625rem", { lineHeight: "2.85rem", letterSpacing: "-0.015em" }],

        // Pastel Toy-Box display ramp — Fraunces for display-*, DM Sans for body/eyebrow.
        eyebrow: ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.18em" }],
        "body-lg": ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.025em" }],
        "card-title": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "display-2xs": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-xs": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["6rem", { lineHeight: "1.0", letterSpacing: "-0.02em" }],
        "display-xl": ["7.5rem", { lineHeight: "1.0", letterSpacing: "-0.02em" }]
      },
      letterSpacing: {
        display: "-0.02em",
        body: "-0.025em",
        eyebrow: "0.18em"
      },
      boxShadow: {
        // Pastel shadows — warmer ink (#1F1C16 ≈ rgba(31,28,22))
        soft: "0 1px 2px rgba(31, 28, 22, 0.04), 0 8px 24px rgba(31, 28, 22, 0.05)",
        lift: "0 2px 4px rgba(31, 28, 22, 0.05), 0 18px 40px rgba(31, 28, 22, 0.09)",
        ring: "0 0 0 1px rgba(220, 206, 178, 0.7)",
        focus: "0 0 0 3px rgba(121, 185, 138, 0.35)"
      },
      borderRadius: {
        // Pastel Toy-Box radii
        sm: "10px",
        md: "14px",
        lg: "20px",
        xl: "28px",
        "2xl": "36px",
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
