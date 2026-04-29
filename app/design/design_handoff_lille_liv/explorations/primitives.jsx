/* global window, React */

const { PALETTES, FONTS, BODY_FONT, RADII, SHADOWS } = window;

// ──────────────────────────────────────────────────────────────────
// Theme context — palette + display font flow down via React Context
// ──────────────────────────────────────────────────────────────────

const ThemeCtx = React.createContext({ p: PALETTES.pastel, font: FONTS.instrument });
const useTheme = () => React.useContext(ThemeCtx);

function ThemeProvider({ palette = "pastel", font = "instrument", children }) {
  const value = React.useMemo(() => ({ p: PALETTES[palette], font: FONTS[font] }), [palette, font]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

// ──────────────────────────────────────────────────────────────────
// Logo — soft rounded "ll" mark + wordmark
// ──────────────────────────────────────────────────────────────────

function Logo({ size = 36, showWord = true, accentTone = "primary" }) {
  const { p, font } = useTheme();
  const accent = accentTone === "primary" ? p.primary : p.peach[300];
  const accentInk = accentTone === "primary" ? p.primaryInk : p.peach.ink;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        aria-hidden="true"
        style={{
          width: size, height: size, borderRadius: size * 0.42,
          background: accent, color: accentInk,
          display: "grid", placeItems: "center",
          fontFamily: font.family, fontSize: size * 0.5, fontWeight: 500,
          letterSpacing: "-0.04em", lineHeight: 1,
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.06)",
        }}
      >
        ll
      </div>
      {showWord ? (
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontFamily: font.family, fontSize: size * 0.5, fontWeight: 500, color: p.ink, letterSpacing: font.tracking }}>
            Lille Liv
          </div>
          <div style={{ fontFamily: BODY_FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: p.subtle, textTransform: "uppercase", marginTop: 2 }}>
            København
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Buttons
// ──────────────────────────────────────────────────────────────────

function Btn({ children, variant = "primary", size = "md", icon, iconRight, full, style, onClick }) {
  const { p } = useTheme();
  const sz = {
    sm: { h: 36, px: 16, fs: 13 },
    md: { h: 46, px: 22, fs: 14.5 },
    lg: { h: 56, px: 28, fs: 16 },
  }[size];
  const variants = {
    primary:   { bg: p.primary,   color: p.primaryInk, border: "transparent" },
    secondary: { bg: p.surface,   color: p.ink,        border: p.border },
    ghost:     { bg: "transparent", color: p.ink,      border: "transparent" },
    accent:    { bg: p.accent,    color: p.accentInk,  border: "transparent" },
    soft:      { bg: p.sunken,    color: p.ink,        border: "transparent" },
  }[variant];
  return (
    <button
      onClick={onClick}
      style={{
        height: sz.h, padding: `0 ${sz.px}px`,
        background: variants.bg, color: variants.color,
        border: `1px solid ${variants.border}`,
        borderRadius: RADII.pill,
        fontFamily: BODY_FONT, fontSize: sz.fs, fontWeight: 600,
        letterSpacing: "-0.005em",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: full ? "100%" : undefined,
        cursor: "pointer",
        boxShadow: variant === "primary" || variant === "accent" ? "0 1px 0 rgba(0,0,0,0.08), 0 6px 16px rgba(0,0,0,0.08)" : "none",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        ...style,
      }}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────
// Pill / chip
// ──────────────────────────────────────────────────────────────────

function Pill({ children, tone = "default", icon, size = "md", style }) {
  const { p } = useTheme();
  const tones = {
    default: { bg: p.surface, fg: p.ink,         ring: p.border },
    sunken:  { bg: p.sunken,  fg: p.ink,         ring: p.hairline },
    mint:    { bg: p.mint[50],   fg: p.mint.ink,   ring: p.mint[100] },
    peach:   { bg: p.peach[50],  fg: p.peach.ink,  ring: p.peach[100] },
    butter:  { bg: p.butter[50], fg: p.butter.ink, ring: p.butter[100] },
    sky:     { bg: p.sky[50],    fg: p.sky.ink,    ring: p.sky[100] },
    inkChip: { bg: p.ink,     fg: p.bg,          ring: p.ink },
  }[tone];
  const sz = size === "sm" ? { h: 24, px: 10, fs: 11.5 } : { h: 30, px: 13, fs: 12.5 };
  return (
    <span style={{
      height: sz.h, padding: `0 ${sz.px}px`,
      background: tones.bg, color: tones.fg,
      borderRadius: RADII.pill,
      boxShadow: `inset 0 0 0 1px ${tones.ring}`,
      fontFamily: BODY_FONT, fontSize: sz.fs, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 6,
      whiteSpace: "nowrap",
      ...style,
    }}>
      {icon}
      {children}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────
// Placeholder image — striped Scandi placeholder w/ monospace label
// ──────────────────────────────────────────────────────────────────

function Placeholder({ label, tone = "peach", radius = RADII.lg, height, ratio, style, children }) {
  const { p } = useTheme();
  const c = p[tone] || p.peach;
  return (
    <div style={{
      position: "relative",
      background: c[50],
      borderRadius: radius,
      overflow: "hidden",
      boxShadow: `inset 0 0 0 1px ${c[100]}`,
      height,
      aspectRatio: ratio,
      ...style,
    }}>
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(135deg, ${c[100]} 0 1px, transparent 1px 14px)`,
        opacity: 0.6,
      }} />
      {label ? (
        <div style={{
          position: "absolute", inset: 0,
          display: "grid", placeItems: "center",
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11, color: c.ink, opacity: 0.7,
          letterSpacing: "0.04em",
        }}>
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Card — soft surface
// ──────────────────────────────────────────────────────────────────

function Card({ children, padding = 20, radius = RADII.xl, tone = "surface", style }) {
  const { p } = useTheme();
  const bg = tone === "sunken" ? p.sunken : p.surface;
  return (
    <div style={{
      background: bg,
      borderRadius: radius,
      padding,
      boxShadow: `inset 0 0 0 1px ${p.hairline}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Soft icon (drawn with simple primitives — no fancy SVG)
// ──────────────────────────────────────────────────────────────────

function Icon({ name, size = 18, color = "currentColor", weight = 1.7 }) {
  const s = size; const sw = weight;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "compass":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6 6-2z"/></svg>;
    case "note":
      return <svg {...common}><path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4"/><path d="M9 12h6M9 16h4"/></svg>;
    case "users":
      return <svg {...common}><circle cx="9" cy="9" r="3"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="8" r="2.2"/><path d="M15 14c3 0 6 2 6 5"/></svg>;
    case "user":
      return <svg {...common}><circle cx="12" cy="9" r="3.2"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/></svg>;
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>;
    case "heart":
      return <svg {...common}><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z"/></svg>;
    case "filter":
      return <svg {...common}><path d="M4 6h16M7 12h10M10 18h4"/></svg>;
    case "map":
      return <svg {...common}><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>;
    case "list":
      return <svg {...common}><path d="M5 6h14M5 12h14M5 18h14"/></svg>;
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "arrow-right":
      return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "arrow-up-right":
      return <svg {...common}><path d="M7 17L17 7M9 7h8v8"/></svg>;
    case "check":
      return <svg {...common}><path d="M5 12l4 4 10-10"/></svg>;
    case "sun":
      return <svg {...common}><circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M5.6 18.4l1.5-1.5M16.9 7.1l1.5-1.5"/></svg>;
    case "cloud":
      return <svg {...common}><path d="M7 18a4 4 0 010-8 5 5 0 019.6-1A4 4 0 0118 18z"/></svg>;
    case "stroller":
      return <svg {...common}><path d="M5 16a5 5 0 015-5h6v5"/><path d="M16 11l3-6"/><circle cx="8" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>;
    case "leaf":
      return <svg {...common}><path d="M20 4c-9 0-15 5-15 12 0 1.5.4 3 1 4 8 0 14-6 14-14V4z"/><path d="M5 20c2-6 6-10 12-12"/></svg>;
    case "sparkle":
      return <svg {...common}><path d="M12 4v6M12 14v6M4 12h6M14 12h6"/></svg>;
    case "calendar":
      return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>;
    case "pin":
      return <svg {...common}><path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>;
    case "chat":
      return <svg {...common}><path d="M5 5h14v10H9l-4 4z"/></svg>;
    case "bell":
      return <svg {...common}><path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15z"/><path d="M10 21h4"/></svg>;
    case "menu":
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case "x":
      return <svg {...common}><path d="M6 6l12 12M18 6l-12 12"/></svg>;
    case "globe":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>;
    case "lock":
      return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>;
    case "home":
      return <svg {...common}><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/></svg>;
    case "star":
      return <svg {...common}><path d="M12 4l2.5 5 5.5.8-4 4 1 5.5L12 16.8 7 19.3 8 13.8 4 9.8l5.5-.8z"/></svg>;
    case "chevron-right":
      return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case "chevron-down":
      return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case "drop":
      return <svg {...common}><path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z"/></svg>;
    case "play":
      return <svg {...common}><path d="M7 5l12 7-12 7z"/></svg>;
    case "wave":
      return <svg {...common}><path d="M3 14c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2S19 14 21 14"/></svg>;
    case "kite":
      return <svg {...common}><path d="M12 3l7 9-7 9-7-9z"/><path d="M12 12l3 9"/></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="8"/></svg>;
  }
}

// ──────────────────────────────────────────────────────────────────
// Soft shape — decorative blob
// ──────────────────────────────────────────────────────────────────

function Blob({ tone = "peach", size = 220, opacity = 1, style }) {
  const { p } = useTheme();
  const c = (p[tone] && p[tone][100]) || p.peach[100];
  return (
    <div aria-hidden="true" style={{
      position: "absolute",
      width: size, height: size,
      background: c, opacity,
      borderRadius: "62% 38% 51% 49% / 47% 55% 45% 53%",
      filter: "blur(0.5px)",
      ...style,
    }} />
  );
}

// ──────────────────────────────────────────────────────────────────
// Big H1 helper
// ──────────────────────────────────────────────────────────────────

function Display({ children, size = 64, color, weight = 500, style }) {
  const { p, font } = useTheme();
  return (
    <h1 style={{
      fontFamily: font.family, fontSize: size, fontWeight: weight,
      letterSpacing: font.tracking, lineHeight: 1.02, color: color || p.ink,
      margin: 0, textWrap: "pretty",
      ...style,
    }}>
      {children}
    </h1>
  );
}

// ──────────────────────────────────────────────────────────────────
// Eyebrow
// ──────────────────────────────────────────────────────────────────

function Eyebrow({ children, color, style }) {
  const { p } = useTheme();
  return (
    <div style={{
      fontFamily: BODY_FONT, fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.18em",
      color: color || p.subtle, ...style,
    }}>{children}</div>
  );
}

Object.assign(window, {
  ThemeProvider, useTheme,
  Logo, Btn, Pill, Placeholder, Card, Icon, Blob, Display, Eyebrow,
});
