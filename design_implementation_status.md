# Design Implementation Status

Design source: `app/design/design_handoff_lille_liv/README.md` — read it first.

## Status

| Surface | File(s) | Status |
|---|---|---|
| **Design tokens** | `tailwind.config.ts` | Done — Pastel palette, Fraunces/DM Sans, radii, shadows, type scale all wired |
| **Primitives** | `components/ui/` | Done — Button, Pill, Card, Avatar, Badge, Eyebrow, IconButton, Input, Sheet |
| **Marketing landing** | `app/(marketing)/page.tsx` | Done — Nav, Hero (with phone preview + floating saved card), trust strip, three pillars, in-app preview, for-grandparents, FAQ, footer CTA, footer; copy in `messages/marketing.*` (DA verbatim + EN mirror) |
| **Discover screen** | `app/(app)/discover/page.tsx` | Partial — route exists, fidelity unknown |
| **Journal screen** | `app/(app)/journal/page.tsx` | Partial — route exists, fidelity unknown |
| **Families screen** | `app/(app)/families/page.tsx` | Partial — route exists, fidelity unknown |
| **Brand reel embed** | — | Not started |

## Next priorities

1. **Audit app screens** — compare Discover, Journal, Families against `explorations/app-screens.jsx` and close fidelity gaps (card layout, filter chips, timeline design, family member rows).
2. **Brand reel** — embed `brand_reel/index-landscape.html` into the marketing hero (currently a CSS phone mock + floating saved card placeholder).
3. **Photography** — replace the gradient placeholders in the grandparents portrait + app-preview hero card with licensed stock once procurement lands.

## Do not

- Translate Danish copy unless explicitly asked
- Wire Stripe / any paywall — free during BETA
- Import prototype CSS or JSX directly into production
