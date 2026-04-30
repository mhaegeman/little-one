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
| **Family-shared journal RLS** | `supabase/migrations/0008_journal_family_share.sql`, `prisma/schema.prisma` | Done — `children.family_id` (nullable, FK to `families`) + `private.user_can_view_child(child_id)` helper. `children`, `milestones`, `activities_log`, `aula_highlights`, and `journal_reactions` SELECT policies now use the helper, so any family member can read a child's journal. Writes stay owner-only on milestones / activities; reactions can be inserted/deleted by any family member on their own behalf. The family-assignment UI is the missing piece — see "Next priorities". |
| **Legacy palette retirement** | `tailwind.config.ts`, `app/globals.css` | Done — every `sage-*`, `warm-*`, and `sand-*` callsite migrated to `mint-*` / `peach-*` / `canvas` / `sunken` / `border` / `hairline`; the `sage`, `warm`, and `sand` scales plus the `--accent-sage` / `--accent-warm` CSS vars are deleted. `Badge` no longer exposes the legacy variants; `categoryBadgeVariant` in `lib/data/taxonomy.ts` returns Pastel tones; `DiscoverMap.categoryHex` uses Pastel ink/300 hexes for marker hue separation. |

## Next priorities

1. **Family-assignment UI** — `children.family_id` is wired through RLS but no front-end picker assigns it yet. Add a control on the journal child header (or onboarding) so the owner can drop a child into one of their families; until then the column has to be set in the DB by hand. Once that lands, Mormor can actually open the journal from her own account, and the reaction chips fill with real reactor initials instead of the demo seed.
2. **Editorial portrait commission** — the grandparents section currently reuses the brand-reel `baby_smile` photography. The handoff calls for a commissioned editorial portrait (a Mormor/Morfar shot) to land with v2 photography; swap `/public/photography/grandparents-baby-smile.webp` when it's delivered.
3. **Reaction notifications** — the brand reel scene 6 surfaces a "Mormor sendte et hjerte" toast. We have the data (a new row in `journal_reactions` from a non-owner user); the missing piece is a notification fan-out — email + in-app — to the child's owner and other family members. Out of scope for v1 BETA but worth scoping next.

## Do not

- Translate Danish copy unless explicitly asked
- Wire Stripe / any paywall — free during BETA
- Import prototype CSS or JSX directly into production
