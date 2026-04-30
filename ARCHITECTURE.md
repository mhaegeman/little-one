# Architecture

## Layers

```
┌─────────────────────────────────────────────────────────┐
│  app/            Next.js App Router (routes + RSC)      │
│  components/     React components (feature-grouped)     │
├─────────────────────────────────────────────────────────┤
│  lib/services/   Domain logic (DB queries + mutations)  │
├─────────────────────────────────────────────────────────┤
│  lib/db/         Supabase clients (browser + server)    │
│  lib/integrations/  External SDKs (Aula, Cloudinary)    │
└─────────────────────────────────────────────────────────┘
```

UI calls **services**; services call **db/integrations**. Never the reverse.

## Folder map

```
app/
  (app)/                authenticated routes (shared layout)
    discover/
    journal/
    profile/
    families/[id]/
    venues/[id]/
    invite/[token]/
    onboarding/
    admin/map-tool/
  (marketing)/          public landing (private _components/)
  auth/                 magic-link login + callback
  api/                  webhooks + signed-upload endpoints
  actions/              shared server actions
  layout.tsx            root layout (locale, providers)
  globals.css

components/
  ui/                   primitives (Button, Card, Dialog, …)
  layout/               AppShell, CommandPalette
  auth/  journal/  discover/  profile/  families/
  onboarding/  admin/  i18n/

lib/
  db/
    supabase/
      client.ts         browser (RLS-scoped)
      server.ts         RSC + route handlers (cookie-bound)
  services/             domain logic — one file per bounded context
    family.ts           families, members, invites
    profile.ts          family_profiles (preferences, completeness)
    visibility.ts       public profiles + family discovery
    connections.ts      requests, blocks, reports, rate limits
    messaging.ts        threads + direct messages
  integrations/
    aula.ts  cloudinary.ts
  data/
    venues.ts           seed venue data (Copenhagen)
    taxonomy.ts         categories, neighbourhoods
    venuePhotos.generated.json
  env.ts  types.ts  utils.ts  focus.ts

hooks/                  client-side hooks (useDiscoverParams, useFavorites, …)
i18n/request.ts         next-intl config
messages/da.json en.json
prisma/schema.prisma seed.ts
supabase/migrations/    SQL migrations + email templates
```

## Data flow

1. **Server component** (`app/.../page.tsx`) creates a server Supabase client, calls a service, passes data to a client component.
2. **Client component** uses the browser Supabase client + service functions for interactions.
3. **Services** (`lib/services/*`) are the only place that knows table names + column shapes. They return camelCased typed objects.
4. **Mutations** go through the same services. RLS on Postgres enforces auth.

## Service file shape

Each `lib/services/<domain>.ts` exports:

- **Types** for the domain entities (e.g. `FamilyConnection`).
- **Helpers** (private) for row mapping (`rowToX`).
- **Read functions** prefixed `load*` / `discover*` / `count*`.
- **Write functions** with verb names (`sendConnectionRequest`, `respondToConnection`).

All take `SupabaseClient` as the first arg. They throw on Postgres errors; callers handle UX.

## Auth

- Supabase magic-link OTP. `/auth` form → `/auth/callback` exchanges code → cookie session.
- Server components/route handlers use `createServerClient()` from `@/lib/db/supabase/server`.
- Client components use `createClient()` from `@/lib/db/supabase/client`.
- RLS policies in `supabase/migrations/` are the security boundary.

## i18n

- `next-intl` with locale read from cookie (`NEXT_LOCALE`), Danish default.
- Strings live in `messages/da.json` (primary) and `messages/en.json` (fallback).
- `useTranslations("scope")` in client components, `getTranslations("scope")` in server.

## Adding a feature checklist

1. Add migration in `supabase/migrations/` (and Prisma schema if used).
2. Add service in `lib/services/<domain>.ts` with read + write functions.
3. Add UI in `components/<feature>/` and wire from a page in `app/(app)/<feature>/`.
4. Add Danish + English copy in `messages/`.
5. `npm run typecheck && npm run lint && npm run build`.

## Out of scope (intentional)

- No global state library (React state + server components are enough for MVP).
- No client-side data-fetching library (services are called directly; consider TanStack Query when caching becomes painful).
- No test suite yet — add Vitest + Playwright when surface stabilizes.
- `lib/data/venues.ts` is hardcoded; migrate to DB-backed seed when editorial workflow is needed.
