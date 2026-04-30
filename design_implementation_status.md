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
| **Marketing photography** | `public/photography/*`, `AppPreview.tsx`, `Grandparents.tsx` | Done — gradient placeholders replaced with the brand-reel photography (Fælledparken playground in the AppPreview moment card; baby smile in the Grandparents portrait). Editorial Mormor/Morfar portrait still pending v2 commission — see "Next priorities". |
| **Journal reactions** | `supabase/migrations/0007_journal_reactions.sql`, `lib/reactions.ts`, `components/journal/ReactionPicker.tsx`, `components/journal/Timeline.tsx`, `components/journal/JournalClient.tsx` | Done — `journal_reactions` table (heart / clap / smile / star) with RLS that mirrors the parent moment's policy; long-press (380 ms) on a moment opens an emoji picker, right-click on desktop, plus a `+` affordance for keyboard. Existing reactions render as small chips at the bottom of each moment with reactor initials. Optimistic add/remove via Supabase client; demo journal seeds Mormor + Morfar reactions on the activity and milestone entries. Aula highlights are non-reactable. |

## Next priorities

1. **Remaining legacy `sage`/`warm` color callsites** — DiscoverMap markers/clusters still use sage/warm tokens; a follow-up pass should migrate to mint/peach before the legacy scales are removed from `tailwind.config.ts`.
2. **Family-shared reactions** — `journal_reactions` RLS only allows the child's owner today (matches the single-user-per-child schema). When milestones / activities open up to family members, expand both the parent-row and reaction policies in lockstep so Mormor can actually send a heart from her own account.
3. **Editorial portrait commission** — the grandparents section currently reuses the brand-reel `baby_smile` photography. The handoff calls for a commissioned editorial portrait (a Mormor/Morfar shot) to land with v2 photography; swap `/public/photography/grandparents-baby-smile.webp` when it's delivered.

## Do not

- Translate Danish copy unless explicitly asked
- Wire Stripe / any paywall — free during BETA
- Import prototype CSS or JSX directly into production
