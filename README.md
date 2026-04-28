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

## Aula Boundary

Aula parent access is MitID-based. The current MVP includes schema, timeline display, and a protected sync route, but the implementation intentionally avoids credential scraping or password storage. Production work should use an approved Aula/token integration and write only encrypted token ciphertext, ideally via Supabase Vault or another EU-hosted KMS boundary.

## Seed Data

The seed data lives in `lib/data/venues.ts` and includes 38 Copenhagen-area venues plus dated events. Each venue includes a `sourceUrl` so entries can be audited and refreshed.
