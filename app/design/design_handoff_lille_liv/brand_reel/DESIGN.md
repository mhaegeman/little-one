# Lille Liv — Design Reference

The Pastel toy-box palette + Fraunces display, locked from the landing page.

## Palette

| Token         | Hex       | Use                                  |
| ------------- | --------- | ------------------------------------ |
| `--bg`        | `#FBF6EE` | App canvas (warm bone)               |
| `--surface`   | `#FFFFFF` | Cards                                |
| `--sunken`    | `#F4ECDD` | Subtle inset surface                 |
| `--ink`       | `#2A2723` | Primary text, phone bezel            |
| `--muted`     | `#6B655C` | Secondary text                       |
| `--subtle`    | `#9A938A` | Eyebrow / meta text                  |
| `--hairline`  | `#EADFCB` | 1.5px card stroke                    |
| `--border`    | `#DCCEB2` | Pill stroke                          |

### Tints (50 / 100 / 200 / 300 / ink)

- **Peach** — `#FBE7DC` `#F7D2BE` `#F2B79A` `#E89A75` ink `#7A3A1E` (journal / accent)
- **Mint**  — `#DDEFE3` `#C2E1CB` `#9DCFAB` `#79B98A` ink `#1F4D32` (primary action)
- **Butter**— `#FBEBC4` `#F7DC9C` `#F0C76A` `#E5B441` ink `#6E4F0D` (warmth, sun)
- **Sky**   — `#DDEAF1` `#C2D8E5` `#9CC0D5` `#74A4BF` ink `#1F4254` (cool / quiet)

### Roles

- **Primary** — `#79B98A` on `#1F4D32` (Mint 300)
- **Accent**  — `#E89A75` on `#7A3A1E` (Peach 300)

## Typography

- **Display** — `"Fraunces"` (variable: `opsz 144`, `SOFT 60`, `WONK 0`), weight 500, tracking −0.02em.
  Italic used selectively: name in greeting (scene 1), "Gem øjeblikkene." in CTA (scene 7).
- **Body** — `"DM Sans"` 400/500/600/700.

Sizes (1080×1920 canvas):

- Display headline: 80–130px
- Section title: 44–60px
- Body / meta: 22–30px
- Eyebrow: 22px, uppercase, tracking 0.18em

## Shape language

- Phone bezel: `880×1760`, ink fill, 22px padding, 120px outer radius / 100px inner radius. Single notch (280×60). Used in **every** scene to anchor continuity.
- Cards: 36px radius, 1.5px inset stroke, soft tinted background.
- Pills: full-pill (999px) with tinted bg + matching tint stroke.
- Decorative blobs: organic `border-radius: 62% 38% 51% 49% / 47% 55% 45% 53%`.

## Motion language

- **Eases** — `power3.out` for entrance, `expo.out` for hero items, `back.out(1.5)` for snappy chips, `sine.inOut` for breathing/pulse.
- **Continuous motion** in every scene: counter (s2 temp), sun pulse (s2), Ken Burns (s3, s4), save-button pulse (s3, s7 CTA), saved-toast hover (s4), node pulse (s5), notification bob (s6).
- **Hard cuts** between scenes 1→2, 2→3, 3→4, 4→5, 5→6 — the professional default.
- **One shader transition** — `light-leak` at 13.25s for the CTA reveal (s6 → s7). Soft, warm, on-brand.

## Why these choices

The user journey is intimate and quiet — discovering a café, capturing a smile, sending it home. Hard cuts keep the rhythm calm and grounded; the single light-leak shader is the only "cinematic" moment, reserved for the emotional lift into the brand close. Fraunces' soft optical-size variant plus the warm pastel canvas keeps the whole reel feeling like a children's picture book rather than a product ad.
