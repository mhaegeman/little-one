# Handoff: Lille Liv — Brand & App Redesign

## Overview

**Lille Liv** is a Copenhagen family guide for parents of 0–6 year olds. It pairs a curated discovery surface (cafés, playgrounds, libraries, museums) with a private per-child journal that grandparents and co-parents can react to.

This handoff covers a complete visual redesign of the brand:

1. **Marketing landing page** — single full-page hero + feature sections (Danish copy)
2. **In-app screens** — Discover (desktop + mobile), Journal, Families/Profile
3. **Animated brand reel** — a 16-second mobile journey (7 scenes) and a 1920×1080 landscape variant for embedded use

Everything was designed in HTML so the visual intent is unambiguous, but **none of it should be shipped as-is**. Recreate it inside the existing Lille Liv codebase using its established framework, component library, and routing conventions.

## About the Design Files

The files in this bundle are **design references created in HTML** — prototypes showing intended look, copy, and behavior, not production code to copy directly. The task is to **recreate these designs in Lille Liv's existing environment** (or, if no environment exists yet, pick the most appropriate framework — likely Next.js + Tailwind for the marketing site, React Native or SwiftUI/Kotlin for the app — and implement there) using its established patterns and libraries.

Treat the HTML/JSX as the source of truth for:
- exact colors, type scale, spacing, radii, shadows
- copy (all Danish — keep it; do not paraphrase)
- layout, hierarchy, and interaction details

Reuse the codebase's own components, routing, state, and i18n. Do not import the prototype CSS or JSX into production.

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, copy, and interactions. Recreate pixel-close using the codebase's existing libraries and patterns. The Pastel Toy-Box palette + Fraunces display face is the recommended default; the other palettes/fonts in `tokens.jsx` are exploratory and not part of the ship.

---

## Surfaces

### 1. Marketing landing — `landing/Lille Liv Landing.html`

A single scrolling page with the following sections, top → bottom:

| Section | Purpose |
|---|---|
| **Top nav** | Wordmark + nav links (Find steder, Journal, Familier, Om os) + "Log ind" + primary "Opret familie" button |
| **Hero** | Eyebrow badge ("Familieguide for København · 0–6 år"), giant serif headline ("Find steder. *Gem øjeblikkene.* Sammen."), supporting paragraph, dual CTA (primary "Opret familie — gratis" + ghost "▶ Se 60 sek. tur"), social proof avatars + count |
| **Hero visual** | Stylized phone-like preview of Discover feed, with a floating "Just saved" reaction card |
| **Trust strip** | Logo / press strip (placeholders for "Berlingske", "Politiken", etc.) |
| **Three pillars** | Three feature cards: *Find steder*, *Gem øjeblikkene*, *Del med dem I vælger* — each with a small inline illustration, title, copy |
| **In-app preview band** | Larger device mock showing journal timeline + reaction notification |
| **For grandparents** | Editorial split: portrait placeholder + copy explaining the bedsteforælder side |
| **FAQ** | 5–6 accordion items (privacy, pricing, age range, Android/iOS, data export) |
| **Footer CTA** | Repeat primary CTA on a peach-tinted block |
| **Footer** | Lockup, columns (Produkt, Selskab, Juridisk), language toggle (DA/EN), © Lille Liv ApS · København |

**Keep all Danish copy verbatim.** Don't translate to English in the production build unless explicitly asked.

### 2. In-app screens — `explorations/app-screens.jsx` (rendered via `Lille Liv Rework.html`)

Three core screens, each with both desktop and mobile (375 × 812) layouts:

- **Discover** — search bar, filter chips (Caféer, Legepladser, Biblioteker, Museer, Indendørs, +0 år, +2 år, +4 år), weather strip ("I dag i København · 14°"), grid of venue cards (cover image placeholder, name, neighborhood, age-range pill, walking time, save heart). Desktop: 3-up grid. Mobile: 1-up stacked.
- **Journal** — Per-child timeline. Header shows child avatar + name + DOB. Vertical timeline with date dividers ("I dag", "I går", "Søndag · Fælledparken"), each entry has a photo, location, caption, reactions row, and reactor avatars. "Tilføj øjeblik" floating action button.
- **Families/Profile** — List of family members (you, partner, grandparents) with role chips ("Forælder", "Bedsteforælder", "Familie"), pending invite states, "Inviter familie" CTA, per-child settings (privacy radius, who can see, notification prefs).

### 3. Brand reel — `brand_reel/index.html` and `index-landscape.html`

A 16-second animated walkthrough.

- **`index.html`** — 1080 × 1920 (mobile/portrait). 7 scenes:
  1. Logo + greeting (0.0–2.0s)
  2. Discover feed reveal with weather + 3 venue cards (2.0–4.5s)
  3. Venue detail (4.5–7.0s)
  4. Journal capture — photo + saved toast (7.0–9.5s)
  5. Journal timeline with new moment (9.5–11.5s)
  6. Grandparent reaction notification (11.5–13.5s)
  7. CTA / final lockup (13.5–16.0s)
- **`index-landscape.html`** — 1920 × 1080 variant. Static hero column on the left (lockup, badge, headline, lede, CTAs, social proof), the same animated mobile reel pinned to the right at ~51% scale. Same timeline, same shader transition.
- Built on the host's HyperFrames + GSAP + a single `light-leak` shader transition between scene 6 → 7. All other cuts are hard.

The reel is intended for the homepage hero embed, App Store / Play Store assets, and social posts.

---

## Design Tokens

Authoritative values. Reproduce these in the codebase's token system (Tailwind config, design-tokens.json, SwiftUI Colors, etc.).

### Palette — Pastel Toy-Box (default)

```
Neutrals
  bg        #FBF6EE   warm bone canvas
  surface   #FFFFFF
  sunken    #F4ECDD
  ink       #2A2723
  muted     #6B655C
  subtle    #9A938A
  hairline  #EADFCB
  border    #DCCEB2

Peach (accent)
  50  #FBE7DC   100 #F7D2BE   200 #F2B79A   300 #E89A75   ink #7A3A1E

Mint (primary)
  50  #DDEFE3   100 #C2E1CB   200 #9DCFAB   300 #79B98A   ink #1F4D32

Butter
  50  #FBEBC4   100 #F7DC9C   200 #F0C76A   300 #E5B441   ink #6E4F0D

Sky
  50  #DDEAF1   100 #C2D8E5   200 #9CC0D5   300 #74A4BF   ink #1F4254

Semantic
  primary       #79B98A   primary-ink     #1F4D32
  accent        #E89A75   accent-ink      #7A3A1E
```

Two alternate palettes (**Soft Sage**, **Warm Cream**) are defined in `explorations/tokens.jsx` — kept for reference only. Pastel ships.

### Typography

- **Display:** Fraunces (variable, opsz/wght). Used for headlines, hero, section titles, journal date dividers. Tracking `-0.02em`. Italic styling reserved for the *highlighted* clauses in headlines (e.g. "*Gem øjeblikkene.*").
- **Body / UI:** DM Sans. Tracking `-0.025em`. Weights 400 / 500 / 600 / 700 in use.
- Two alternate display faces explored: Instrument Serif, DM Sans (all-sans). Not shipped.

Type scale used in the prototypes (px @ 1× design, scale to rem in code):

```
hero h1        96–120 / 1.0      Fraunces 500
section h2     56–72  / 1.05     Fraunces 500
section h3     32–40  / 1.15     Fraunces 500
card title     22–24  / 1.3      Fraunces 500
body lg        20     / 1.5      DM Sans 400
body           16–17  / 1.55     DM Sans 400
small          14     / 1.45     DM Sans 500
eyebrow / cap  11     / 1.2      DM Sans 700  uppercase  letter-spacing 0.18em
```

### Radii

```
sm 10   md 14   lg 20   xl 28   2xl 36   pill 999
```

Cards: `lg`–`xl`. Buttons: `pill`. Inputs: `md`. Avatar: `pill`.

### Shadows

```
soft  0 1px 2px rgba(31,28,22,0.04), 0 8px 24px rgba(31,28,22,0.05)
lift  0 2px 4px rgba(31,28,22,0.05), 0 18px 40px rgba(31,28,22,0.09)
ring  0 0 0 1px rgba(220,206,178,0.7)
```

`soft` for resting cards, `lift` for elevated cards / floating CTAs / modals, `ring` for inputs and quiet borders.

### Spacing

8-pt grid. Common values in use: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 120.

Section vertical padding: 96–120 desktop, 56–72 mobile.

---

## Component Notes

- **Buttons.** Primary = mint fill (`#79B98A` bg, `#1F4D32` text). Ghost = transparent / ink text. All 64px tall on hero (28px h-padding, pill radius), 48px in body, 40px in compact contexts. Icon trails the label, separated by 12px gap.
- **Eyebrow badge.** `mint-50` bg, `mint-ink` text, `mint-100` inset 1.5px ring, pill radius, 12px v / 20px h padding. Often paired with a 10px pulse dot in `mint-300`.
- **Venue card.** Cover image 4:3, 20px radius, image fills top 70%. Below: title (Fraunces 24/1.3), neighborhood (DM Sans 14, `subtle`), pill row (age range + walking time). Save heart top-right of cover, 44×44 hit target, `surface` bg, `subtle` outline, fills `peach-300` when active.
- **Reaction notification (grandma scene).** `surface` card, 24px radius, `lift` shadow. Avatar 48×48 (`peach-200` bg, `peach-ink` initial). Body: tiny "Lille Liv · nu" + "Mormor sendte et hjerte til Astas øjeblik 💛".
- **Journal moment.** Vertical line (1.5px, `hairline`) on the left, 12px node bullet (`peach-300` for "new", `border` for prior). Date divider above (eyebrow style). Photo 4:3, then caption.
- **Family member row.** 56px avatar (initial on tinted bg keyed to relation: parent=mint, grandparent=peach, other=butter), name, role chip, settings affordance.

## Interactions

- **Save (heart).** Tap → scale 0.94 → 1.06 → 1.0 (160ms total, back-out). Fill swaps from outline to `peach-300`. No modal.
- **Add moment FAB.** Tap → opens capture sheet (camera, gallery, "from Discover venue"). Sheet is a bottom sheet on mobile, modal on desktop.
- **Reaction.** Long-press a moment → reaction picker (heart, clap, smile, star). Reactions appear as small colored chips at the bottom of the moment with reactor initials.
- **Hero CTA hover.** Subtle lift: translateY(-2px), shadow steps from `soft` to `lift`, 180ms ease-out.
- **Animated reel scene transitions.** Scenes 1–6 are hard cuts on a GSAP timeline. Scene 6 → 7 uses a `light-leak` shader transition (0.5s) — intended to feel emotionally warm, like sunlight passing the lens.

## Copy & Tone

- Danish, warm, second-person plural ("I" / "jer" — addressing the family unit, not individuals).
- Verbs in imperative for CTAs ("Opret familie", "Gem øjeblikket", "Inviter mormor").
- Avoid corporate / startup voice. Lille Liv = "little life" — keep the diminutive warmth.
- Privacy framing is foregrounded: "Privat journal pr. barn, delt med dem I vælger."

## Assets

- All images in the prototypes are CSS placeholders (tinted blocks, gradients, blob shapes). **No real photography is included.** The production build will need:
  - Lifestyle photography of Copenhagen families (1:1, 4:3, 4:5 crops)
  - Venue covers (cafés, playgrounds, libraries) — 4:3
  - Editorial portraits for the "for bedsteforældre" section
- Wordmark: rendered as live text ("Lille Liv" in Fraunces 500, `-0.02em`) with a 64×64 mint app-icon block bearing "ll" lowercase. A proper SVG mark should be commissioned.
- Icons: simple line icons, ~2px stroke. Heart, search, filter, map-pin, camera, share, settings. Use the codebase's existing icon set (Lucide / Phosphor / SF Symbols) — match weight to the 2px stroke seen in mockups.

## Files in this bundle

```
design_handoff_lille_liv/
├── README.md                                  ← you are here
├── landing/
│   └── Lille Liv Landing.html                 ← the marketing page (ship target)
├── explorations/
│   ├── Lille Liv Rework.html                  ← design canvas with all variants + app screens
│   ├── design-canvas.jsx                      ← canvas wrapper
│   ├── tokens.jsx                             ← palettes, fonts, radii, shadows (authoritative)
│   ├── primitives.jsx                         ← shared primitives (Button, Pill, Card, Avatar)
│   ├── landing-1.jsx, landing-2.jsx, landing-3.jsx  ← three landing directions; v1 = ship
│   ├── app-screens.jsx                        ← Discover, Journal, Families
│   └── tweaks-panel.jsx                       ← in-design palette/font swap (not for prod)
└── brand_reel/
    ├── index.html                             ← 1080×1920 animated reel
    ├── index-landscape.html                   ← 1920×1080 variant (static hero + reel)
    ├── preview.html                           ← scaled-to-fit preview wrapper
    ├── preview-mobile.html
    ├── preview-desktop.html
    ├── README.md                              ← reel-specific notes
    └── DESIGN.md                              ← scene-by-scene timing + intent
```

## Suggested Implementation Order

1. **Tokens** — port the Pastel palette + Fraunces/DM Sans into the codebase's token system. Get a Storybook / preview page showing swatches and type ramp.
2. **Primitives** — Button, Pill/Chip, Card, Avatar, Badge, IconButton.
3. **Marketing landing** — static page first (no CMS), copy lifted verbatim from `Lille Liv Landing.html`.
4. **Discover screen** — desktop and mobile in parallel; mock data.
5. **Journal screen** — per-child timeline + capture sheet.
6. **Families screen** — invites, roles, per-child privacy.
7. **Brand reel embed** — drop the landscape variant into the marketing hero (or export to MP4 if performance is a concern).

## Decisions

Open questions from handoff; resolved 2026-04-29. Treat as authoritative — implementation prompts should reference these rather than re-litigate.

- **Framework.** Web + marketing: **Next.js 16 + Tailwind v4 + Supabase + next-intl** (already scaffolded in this repo). Mobile: **Expo 52 / React Native 0.76** (scaffold lives in `/mobile`). Tokens will be lifted into a shared package so web and RN consume the same source. Do not propose Capacitor, native iOS/Kotlin, or web-only PWA alternatives.

- **Photography.** Hybrid. v1 ships with **licensed stock** (Stocksy / Cavan / Twenty20) for marketing placeholder slots — hero phone mock, three pillars, FAQ block. **v2 commissions an editorial shoot** in Copenhagen for the "for bedsteforældre" portrait + a small hero set (~6 frames). Venue covers (cafés, playgrounds, libraries, museums) are a separate pipeline — license-from-venue + Google Places + occasional self-shot — not part of the editorial commission. Design the journal-photo consent flow now so user-generated photography becomes available later without re-permissioning.

- **Wordmark + app icon.** Keep **Fraunces 500 as the wordmark** (live text, `-0.02em` tracking) — no custom logotype commission. Commission **only the app icon mark**, in parallel with implementation. Brief: 1024² master SVG, iOS asset catalog (all sizes), Android adaptive icon (foreground + background layers), single-color favicon, must read at 16×16. Starting concept: mint (`#79B98A`) background, "ll" lowercase monogram in Fraunces. The current "ll" tile in the prototypes is a **placeholder** — code should reference `/public/icon.svg` from day one so swap-in is a one-file change.

- **Pricing.** **Free during BETA.** A family subscription tier is planned post-BETA — no price or date committed yet. Implications for copy + code:
  - Hero CTA "Opret familie — gratis" stays.
  - FAQ entry "Hvad koster det?" — Danish answer: *"Lille Liv er gratis under beta. Vi tilføjer et familieabonnement senere — eksisterende familier får besked først, og de første 30 dage forbliver altid gratis."* (English mirror in `messages/en.json`.)
  - No `/pricing` page in v1. Footer "Produkt" column omits a Premium link until the tier exists.
  - Stripe stays as a dep but **do not wire checkout flows** until the subscription is greenlit. No paywalls, no "upgrade" CTAs anywhere in the app.

- **i18n.** Ship **DA + EN both visible at launch**, footer language toggle wired (matches the mockup; default locale `da`, persisted via `NEXT_LOCALE` cookie — already implemented in `i18n/request.ts`). Translation rules:
  - **Translate:** UI chrome, marketing copy, FAQ, journal prompts/labels, error/empty states, settings.
  - **Do not translate:** venue names, neighborhood names, quoted Danish reactions and captions in the journal, place content sourced from city/venue feeds. Place content stays Danish in both locales.
  - Locales stay in lockstep — every key in `da.json` exists in `en.json`. CI should fail on missing keys.

## Open Questions (still open)

- Final commissioned app icon — brief drafted, designer not yet selected.
- Stock photography license budget + selection — pending procurement.
- Post-BETA pricing — number, intro discount, family-size tiers — defer until BETA cohort feedback lands.
