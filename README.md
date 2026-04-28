# Lille Liv

Lille Liv is a Copenhagen family companion app for parents with children aged 0-6.

## Current MVP Slice

- Next.js 14 App Router web app with TypeScript and Tailwind CSS
- Danish-first UI with `next-intl` messages and English fallback messages
- Discover tab with Copenhagen venue seed data, filters, map fallback, list cards, events, and venue detail pages
- Supabase Auth magic-link UI and callback route
- Prisma schema for the requested Supabase tables
- Supabase SQL migration with RLS policies for private child/journal/Aula data
- Basic Journal tab with child profile header, private-login gate, timeline, and add milestone form
- Aula sync API route placeholder that does not store credentials until an approved integration is available
- Expo mobile shell sharing the web seed data and taxonomy

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in Supabase values:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`

4. Apply the Supabase migration in `supabase/migrations/0001_lille_liv.sql`.

5. Generate Prisma and seed venues/events:

   ```bash
   npm run prisma:generate
   npm run db:seed
   ```

6. Start the web app:

   ```bash
   npm run dev
   ```

7. Start the Expo shell:

   ```bash
   npm run mobile
   ```

## Deployment

Lille Liv is a Next.js app with server-side API routes, Supabase Auth on cookies, Prisma to Supabase Postgres, a signed-upload endpoint for Cloudinary, and a daily cron. **GitHub Pages is not a viable target** — it serves only static files, so it cannot run any of those. Deploy to Vercel (the existing `vercel.json` cron is already wired for it).

### Vercel setup

1. Push this branch to GitHub and import the repo at https://vercel.com/new.
2. Vercel auto-detects Next.js — leave the framework preset as `Next.js` and the build command as `npm run build` (which now also runs `prisma generate`).
3. Add the following environment variables (Production + Preview):

   | Variable | Notes |
   | --- | --- |
   | `NEXT_PUBLIC_APP_URL` | Public URL of the deployment, e.g. `https://lille-liv.vercel.app` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) |
   | `DATABASE_URL` | Pooled Postgres URL from Supabase (use the pgbouncer connection) |
   | `DIRECT_URL` | Direct Postgres URL from Supabase (used by `prisma migrate`) |
   | `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token for the Discover map |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary signing credentials |
   | `STRIPE_SECRET_KEY` | Stripe secret key (server-side) |
   | `AULA_SYNC_SECRET` | Shared secret for `/api/aula/sync`; cron requests are also accepted via the `x-vercel-cron` header |

4. In the Supabase dashboard add the deployed origin (`https://<project>.vercel.app` and any custom domain) to **Authentication → URL Configuration** so magic-link callbacks work.
5. Trigger the first deploy. The cron in `vercel.json` (`0 3 * * *` → `/api/aula/sync`) is registered automatically.

### CI

`.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm run typecheck`, and `npm run build` on every PR and on pushes to `main` so deploys are not the first place build breakage shows up.

## Aula Boundary

Aula parent access is MitID-based. The current MVP includes schema, timeline display, and a protected sync route, but the implementation intentionally avoids credential scraping or password storage. Production work should use an approved Aula/token integration and write only encrypted token ciphertext, ideally via Supabase Vault or another EU-hosted KMS boundary.

## Seed Data

The seed data lives in `lib/data/venues.ts` and includes 38 Copenhagen-area venues plus dated events. Each venue includes a `sourceUrl` so entries can be audited and refreshed.
