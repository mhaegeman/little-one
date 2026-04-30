# Bug categories — what to look for in Lille Liv

Concrete patterns to probe while exercising the app. Not exhaustive — use judgement. Tailored to this stack: Next.js 16 App Router, React 19 server/client split, Supabase + RLS, next-intl, MapLibre, Cloudinary.

## i18n (Danish-first)

- **Missing translation key** → renders the key path itself (e.g. `profile.visibility.publicHelp`) or an English fallback in the Danish UI.
- **Hardcoded copy** → string changes when toggling locale on most pages but stays put here. Likely a literal in JSX instead of `useTranslations()`.
- **Special chars (æ, ø, å)** truncate or render as `?` / mojibake in form values, URLs, or DB write-back.
- **Pluralization broken** ("1 venues", "0 børn"). next-intl uses ICU plurals — the message file may be missing the plural form.
- **Date / number formatting** stays English in Danish locale (e.g. `4/30/2026` instead of `30. apr. 2026`, dot vs comma decimal).
- **English page title / `<meta>`** when locale is Danish.

## Auth + RLS

- **Magic-link form** — empty submit, garbage email, double-click submit, very long email.
- **Callback** — paste a fake/expired `?code=` into `/auth/callback` and confirm a friendly error, not a stack trace.
- **Logged-out user** hitting authenticated routes (`/discover`, `/journal`, `/families`, `/profile`, `/onboarding`, `/venues/<id>`, `/families/<id>`, `/admin/*`) — must redirect, not 500 or leak data.
- **Logged-in user without onboarding** hitting feature routes — should funnel into `/onboarding`.
- **RLS leak** — open `/families/[id]` for an id that belongs to another household; confirm 404/forbidden, not a populated page.
- **Service-role usage from client** — only a code-review check, but worth grepping `SERVICE_ROLE` in `components/` if you suspect a leak.

## Forms + validation

- **Required field passes when empty** (whitespace-only).
- **Submit twice** before first request resolves — duplicate write or hung button?
- **Long input** (>500 chars) in a "name" or "title" field — overflow, server reject, layout break.
- **Special chars + emoji** in journal entries / family names. Database collation should accept them; UI should render them.
- **Server error path** — disconnect network mid-submit (DevTools offline), confirm a recoverable error state, not a blank screen.
- **Date pickers** — future date for past milestone; pre-birth date for child; timezone shift after save.

## Discover (map + filters)

- **Map fails to load** — missing tile token, CSP block, blank canvas. Watch the console for MapLibre errors.
- **Cluster click at max zoom** — zooms past max, blank tiles, infinite zoom loop.
- **Filter URL state** — apply filters, refresh, share URL: results should match. Back button should restore prior filter set.
- **Empty result** — should show a friendly empty state in DA + EN, not a blank list.
- **Geolocation prompt denied** — app should still work centred on Copenhagen.
- **Marker labels** — long Danish venue names truncated or overflowing the popup.

## Journal

- **Photo upload** — HEIC, very large file (>10MB), 0-byte file, non-image (PDF). Cloudinary signed-upload should reject gracefully.
- **Save then immediate edit** — race condition that loses fields?
- **Delete** — confirmation dialog, undo path, list refreshes.
- **Empty state** — first-time user, helpful copy in DA.
- **Optimistic UI desync** — save fails on the server but the entry stays in the list.

## Families + connections

- **Send connection request** to self → must block.
- **Send to blocked user** → must block, with clear message.
- **Block + then view** → blocked user disappears from discovery.
- **Report** → flow completes, confirmation visible.
- **Invite token** — valid, expired, already-redeemed, signed-in-as-different-account flows.
- **Profile completeness gate** — incomplete profile cannot send requests; gate copy is clear.

## Profile

- **Avatar upload** — same checks as journal photo.
- **Visibility toggle** (public/private) — flips on the public family list within a refresh.
- **Sign out** — clears cookies; back button doesn't show authed content from cache.
- **Preferences save** — refresh should keep them (no silent revert).

## Server / client component boundary

- **Hydration mismatch warning** in console (server HTML ≠ client) — usually a Date or random value rendered without guard.
- **`"use client"`** missing on a component that uses hooks → build error or runtime crash.
- **Client component imports server-only module** (e.g. `@/lib/db/supabase/server`) → leaks server code or fails to build.

## Performance / network

- **Waterfall on `/discover`** — multiple sequential requests that could be parallel.
- **Oversized images** served at full resolution to mobile (Cloudinary should be sized).
- **Slow service** — any single request >2s on a warm cache.
- **5xx in network panel** even if the UI looks fine.

## Accessibility

- **Tab order** through forms — does it follow visual order? Skip links?
- **Focus visible** — outline appears on `Tab`?
- **Buttons without `aria-label`** for icon-only controls (favorite heart, close X).
- **Modal/dialog** — `Esc` closes, focus trapped, focus returns to trigger on close.
- **Color contrast** — light text on the brand colour. Use DevTools/axe if available.
- **`alt` text** on user-uploaded images (should be at least empty `alt=""` for decorative, meaningful for content).

## Responsiveness

- 375 × 667 (iPhone SE), 768 × 1024 (iPad), 1280 × 800 (desktop).
- Header collapses to hamburger; bottom nav appears (if used).
- Map tools stay reachable on mobile.
- Long Danish words don't break layout (use `overflow-wrap: anywhere` if needed).

## Console + server log noise

- **Any uncaught error** in browser console = at least P3.
- **`Warning: ... in development` from React** (key, ref, hydration) = at least P3.
- **Supabase / Postgres errors** in the server log during a normal flow = at least P2.
- **Repeated request loops** (same call firing 10x) = P1.

## Things that are NOT bugs (don't file)

- Pre-existing typecheck or lint errors on `main` — note them in the run report instead.
- Personal stylistic preferences ("I'd use a different font").
- Missing features that aren't in the product spec.
- Things explicitly marked TODO/FIXME in code unless they cause user-visible breakage.
- Empty seed data (talk to the user about seeding instead).
