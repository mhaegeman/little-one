# Lille Liv

Danish-first companion app for families with young kids in Copenhagen. Discover venues, log milestones, connect with other families.

**Stack**: Next.js 16 · React 19 · TypeScript · Supabase · Prisma · Tailwind 4 · next-intl · MapLibre · Cloudinary

For contributors and AI agents: see [`CLAUDE.md`](./CLAUDE.md) for conventions and [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the layered structure.

## Setup

```bash
npm install
cp .env.example .env.local       # fill Supabase + Cloudinary + Mapbox values
# apply supabase/migrations/*.sql in order
# paste supabase/templates/magic-link.html into Supabase → Auth → Email Templates
npm run db:seed
npm run dev
```

Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `CLOUDINARY_*`, `AULA_SYNC_SECRET`.

## Commands

```bash
npm run dev          # local dev
npm run build        # prisma generate + next build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run db:seed      # seed venues + events
npm run fetch:venue-photos   # refresh Wikimedia photos
npm run mobile       # Expo shell
```

Run `npm run typecheck && npm run lint` before committing.

## Deployment

Deploy to Vercel — the existing `vercel.json` wires the daily Aula sync cron. Add the env vars above (Production + Preview) and add the deployed origin to Supabase → Authentication → URL Configuration so magic-link callbacks work. CI runs lint/typecheck/build on every PR.

## Notes

- **Aula boundary**: schema + sync route are placeholders only. No credential scraping or password storage; production work should use an approved Aula/token integration with encrypted-at-rest tokens.
- **Venue photos**: Wikimedia Commons fetched via `npm run fetch:venue-photos`; falls back to curated Unsplash overrides, then a per-category bank.
