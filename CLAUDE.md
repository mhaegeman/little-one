# CLAUDE.md

Entry point for AI agents working on Lille Liv. Read this first; see `ARCHITECTURE.md` for layer details.

## What this app is

Danish-first companion app for families with young kids (Copenhagen MVP). Discover venues, log milestones, connect with other families. Stack: Next.js 16 App Router · React 19 · TypeScript · Supabase (Auth + Postgres) · Prisma · Tailwind 4 · next-intl · MapLibre · Cloudinary.

## Commands

```bash
npm run dev          # local dev (next dev)
npm run build        # prisma generate + next build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run db:seed      # tsx prisma/seed.ts
npm run prisma:migrate
```

Always run `npm run typecheck && npm run lint` before committing. Run `npm run build` after structural changes.

## Where things go

| Need to add… | Put it in… |
|---|---|
| New page/route | `app/(app)/<feature>/page.tsx` (auth) or `app/(marketing)/` (public) |
| API route | `app/api/<scope>/route.ts` |
| Server action | `app/<route>/actions.ts` co-located, or `app/actions/` for shared |
| Feature component | `components/<feature>/` (existing folder) |
| Reusable primitive | `components/ui/` |
| DB query / mutation | `lib/services/<domain>.ts` (takes `SupabaseClient`, returns typed rows) |
| External SDK wrapper | `lib/integrations/<vendor>.ts` |
| Static / seed data | `lib/data/` |
| Shared type | `lib/types.ts` (cross-domain) or co-locate in the service file |
| Custom hook | `hooks/use<Name>.ts` |
| i18n string | `messages/da.json` first, then `messages/en.json` |

## Conventions

- **Path alias**: `@/*` maps to repo root. Always use it (no `../../`).
- **Services are pure**: take a `SupabaseClient` arg, return typed data, throw on error. Don't import React or Next runtime there.
- **Client vs server Supabase**: `@/lib/db/supabase/client` (browser) vs `@/lib/db/supabase/server` (RSC + route handlers).
- **`"use client"`** only on components that need state/effects/event handlers. Default to server components.
- **i18n**: Danish is primary. Every user-facing string goes through `useTranslations()` / next-intl. No hardcoded copy.
- **Env vars**: read via `lib/env.ts` (`requireServerEnv`) — never inline `process.env.X` in components.
- **No new top-level dirs** without updating `ARCHITECTURE.md`.

## Don't

- Don't create README/docs files unless asked.
- Don't add comments that restate code; only WHY-comments for non-obvious constraints.
- Don't add dependencies without need; prefer the existing stack.
- Don't reorganize folders ad-hoc — follow the table above.
- Don't bypass RLS by using the service-role key from client code.

## Branch + workflow

- Default development branch follows the prompt; never push to `main` without explicit ask.
- One concern per PR. Keep diffs reviewable.
