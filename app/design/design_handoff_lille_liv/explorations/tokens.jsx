/* global window */

// ──────────────────────────────────────────────────────────────────
// Lille Liv — Scandinavian rework tokens
// 3 palettes × 3 display fonts. Pastel Toy-Box is the recommended default.
// ──────────────────────────────────────────────────────────────────

const PALETTES = {
  pastel: {
    name: "Pastel toy-box",
    bg: "#FBF6EE",         // warm bone canvas
    surface: "#FFFFFF",
    sunken: "#F4ECDD",
    ink: "#2A2723",
    muted: "#6B655C",
    subtle: "#9A938A",
    hairline: "#EADFCB",
    border: "#DCCEB2",
    // Tints — peach / mint / butter / sky
    peach:  { 50: "#FBE7DC", 100: "#F7D2BE", 200: "#F2B79A", 300: "#E89A75", ink: "#7A3A1E" },
    mint:   { 50: "#DDEFE3", 100: "#C2E1CB", 200: "#9DCFAB", 300: "#79B98A", ink: "#1F4D32" },
    butter: { 50: "#FBEBC4", 100: "#F7DC9C", 200: "#F0C76A", 300: "#E5B441", ink: "#6E4F0D" },
    sky:    { 50: "#DDEAF1", 100: "#C2D8E5", 200: "#9CC0D5", 300: "#74A4BF", ink: "#1F4254" },
    // Primary action = mint
    primary: "#79B98A", primaryInk: "#1F4D32",
    // Accent = peach
    accent: "#E89A75", accentInk: "#7A3A1E",
  },
  sage: {
    name: "Soft sage",
    bg: "#F6F2EA",
    surface: "#FFFFFF",
    sunken: "#EFE9DD",
    ink: "#1F2A26",
    muted: "#5C6661",
    subtle: "#8C918C",
    hairline: "#E5DCC9",
    border: "#D6CCB6",
    peach:  { 50: "#F4E2D3", 100: "#EBCEB6", 200: "#DDB08A", 300: "#C99165", ink: "#6E3B1B" },
    mint:   { 50: "#DBE9E1", 100: "#BFD8CA", 200: "#94B5A8", 300: "#739A8B", ink: "#243C36" },
    butter: { 50: "#F2E5C2", 100: "#E8D49B", 200: "#D8BC6A", 300: "#BE9F47", ink: "#5C4310" },
    sky:    { 50: "#DDE7E7", 100: "#C2D5D5", 200: "#9CBABA", 300: "#759E9E", ink: "#21413F" },
    primary: "#5B8377", primaryInk: "#FFFFFF",
    accent: "#C46A40", accentInk: "#FFFFFF",
  },
  cream: {
    name: "Warm cream",
    bg: "#FAF1E4",
    surface: "#FFFFFF",
    sunken: "#F2E5CC",
    ink: "#2C2018",
    muted: "#6E5C49",
    subtle: "#9C8770",
    hairline: "#E9D9BA",
    border: "#D3BD96",
    peach:  { 50: "#F8DAC4", 100: "#F2BD9B", 200: "#E89971", 300: "#D87649", ink: "#6F2D11" },
    mint:   { 50: "#DCE7CC", 100: "#C2D4A6", 200: "#9CB97A", 300: "#7A9C56", ink: "#33421C" },
    butter: { 50: "#F8E2A8", 100: "#F2D078", 200: "#E5B441", 300: "#C99422", ink: "#5C3F08" },
    sky:    { 50: "#E0D8C9", 100: "#C9BEA6", 200: "#A89878", 300: "#866F4D", ink: "#3A2D17" },
    primary: "#D87649", primaryInk: "#FFFFFF",
    accent: "#7A9C56", accentInk: "#FFFFFF",
  },
};

const FONTS = {
  instrument: { name: "Instrument Serif", family: '"Instrument Serif", Georgia, serif', tracking: "-0.015em" },
  recoleta:   { name: "Fraunces (rounder)", family: '"Fraunces", "Georgia", serif',     tracking: "-0.02em" },
  general:    { name: "DM Sans (all-sans)", family: '"DM Sans", system-ui, sans-serif', tracking: "-0.025em" },
};

const BODY_FONT = '"DM Sans", system-ui, -apple-system, sans-serif';

const RADII = { sm: 10, md: 14, lg: 20, xl: 28, "2xl": 36, pill: 999 };

const SHADOWS = {
  soft: "0 1px 2px rgba(31, 28, 22, 0.04), 0 8px 24px rgba(31, 28, 22, 0.05)",
  lift: "0 2px 4px rgba(31, 28, 22, 0.05), 0 18px 40px rgba(31, 28, 22, 0.09)",
  ring: "0 0 0 1px rgba(220, 206, 178, 0.7)",
};

Object.assign(window, { PALETTES, FONTS, BODY_FONT, RADII, SHADOWS });
