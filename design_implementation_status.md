# Design Implementation Status

Design source: `app/design/design_handoff_lille_liv/README.md` — read it first.

## Status

| Surface | File(s) | Status |
|---|---|---|
| **Design tokens** | `tailwind.config.ts` | Done — Pastel palette, Fraunces/DM Sans, radii, shadows, type scale all wired |
| **Primitives** | `components/ui/` | Done — Button, Pill, Card, Avatar, Badge, Eyebrow, IconButton, Input, Sheet |
| **Marketing landing** | `app/(marketing)/` | Incomplete — only FAQ component exists; no page, no nav, no hero, no sections |
| **Discover screen** | `app/(app)/discover/page.tsx` | Partial — route exists, fidelity unknown |
| **Journal screen** | `app/(app)/journal/page.tsx` | Partial — route exists, fidelity unknown |
| **Families screen** | `app/(app)/families/page.tsx` | Partial — route exists, fidelity unknown |
| **Brand reel embed** | — | Not started |

## Next priorities

1. **Marketing landing page** — biggest gap. Build `app/(marketing)/page.tsx` from `landing/Lille Liv Landing.html`. All Danish copy verbatim. Sections: nav → hero → trust strip → three pillars → in-app preview → for grandparents → FAQ → footer CTA → footer. FAQ component already exists at `app/(marketing)/_components/FAQ.tsx`.
2. **Audit app screens** — compare Discover, Journal, Families against `explorations/app-screens.jsx` and close fidelity gaps (card layout, filter chips, timeline design, family member rows).
3. **Brand reel** — embed `brand_reel/index-landscape.html` into the marketing hero once the landing page is built.

## Do not

- Translate Danish copy unless explicitly asked
- Wire Stripe / any paywall — free during BETA
- Import prototype CSS or JSX directly into production
