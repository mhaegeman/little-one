# Design Implementation Status

Design source: `app/design/design_handoff_lille_liv/README.md` — read it first.

## Status

| Surface | File(s) | Status |
|---|---|---|
| **Design tokens** | `tailwind.config.ts` | Done — Pastel palette, Fraunces/DM Sans, radii, shadows, type scale all wired |
| **Primitives** | `components/ui/` | Done — Button, Pill, Card, Avatar, Badge, Eyebrow, IconButton, Input, Sheet |
| **Marketing landing** | `app/(marketing)/page.tsx` | Done — Nav, Hero (with animated `BrandReel` cycling the 6 mobile scenes), trust strip, three pillars, in-app preview, for-grandparents, FAQ, footer CTA, footer; copy in `messages/marketing.*` (DA verbatim + EN mirror) |
| **Discover screen** | `app/(app)/discover/page.tsx` | Done — Today card now uses sky tones; venue list cards use right-side heart + age/indoor pills; filter chips use mint/peach per palette |
| **Journal screen** | `app/(app)/journal/page.tsx` | Done — Timeline rebuilt with large tinted icon nodes, kind pill, photo grid, peach heatmap; filter chips use ink-on-canvas active state |
| **Families screen** | `app/(app)/families/page.tsx` | Done — Discover/Connections/Messages all use mint/peach palette; FamilyPublicCard hover ring + footer eyebrow on Pastel tokens; chat bubbles on mint-300 |
| **Brand reel embed** | `app/(marketing)/_components/BrandReel.tsx`, `public/reel/*` | Done — full 7-scene 16s reel (greeting → discover → venue → capture → timeline → reaction → CTA, with a `light-leak` shader transition between scenes 6 and 7) rendered by HyperFrames from `app/design/design_handoff_lille_liv/brand_reel/index.html` and embedded as `<video autoplay muted playsinline loop>` with poster fallback. Pauses when offscreen via IntersectionObserver; reduced-motion users see the poster image only. Landscape variant rendered to `lille-liv-landscape.mp4` for App Store / social use, not embedded in the marketing page. |

## Next priorities

1. **Photography** — replace the gradient placeholders in the grandparents portrait + app-preview hero card with licensed stock once procurement lands. (BrandReel now ships with real Fælledparken / Absalon / journal photography baked into the rendered MP4.)
2. **Reactions on journal moments** — the design includes long-press reaction picker + reactor avatar dots at the foot of each moment. Data model + UI not yet wired; Timeline reserves the structure but renders no reactor dots until the feature lands.
3. **Remaining legacy `sage`/`warm` color callsites** — DiscoverMap markers/clusters still use sage/warm tokens; a follow-up pass should migrate to mint/peach before the legacy scales are removed from `tailwind.config.ts`.

## Do not

- Translate Danish copy unless explicitly asked
- Wire Stripe / any paywall — free during BETA
- Import prototype CSS or JSX directly into production
