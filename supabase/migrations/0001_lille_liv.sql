create extension if not exists "pgcrypto";

do $$ begin
  create type venue_category as enum (
    'cafe',
    'playground',
    'indoor_play',
    'cinema',
    'library',
    'swimming',
    'theatre',
    'event'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type neighbourhood as enum (
    'Nørrebro',
    'Østerbro',
    'Vesterbro',
    'Frederiksberg',
    'Indre By',
    'Amager',
    'Valby',
    'Nordvest',
    'Nordhavn',
    'Hellerup',
    'Ishøj',
    'Vanløse',
    'Brønshøj',
    'Kastrup'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type milestone_type as enum (
    'first_smile',
    'first_laugh',
    'first_word',
    'first_steps',
    'sat_up_alone',
    'first_tooth',
    'slept_through',
    'first_food',
    'first_haircut',
    'started_vuggestue',
    'started_bornehave',
    'custom'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  date_of_birth date not null,
  photo_url text,
  gender text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  category venue_category not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  age_min_months integer not null,
  age_max_months integer not null,
  photos text[] not null default '{}',
  rating double precision,
  website text,
  tags text[] not null default '{}',
  opening_hours jsonb not null,
  neighbourhood neighbourhood not null,
  indoor_outdoor text not null check (indoor_outdoor in ('indoor', 'outdoor', 'both')),
  price_hint text not null check (price_hint in ('free', 'budget', 'paid')),
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  type milestone_type not null,
  date date not null,
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities_log (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete set null,
  title text not null,
  description text,
  date date not null,
  photos text[] not null default '{}',
  location_lat double precision,
  location_lng double precision,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  venue_id uuid references public.venues(id) on delete set null,
  title text not null,
  description text not null,
  date_start timestamptz not null,
  date_end timestamptz not null,
  age_min_months integer not null,
  age_max_months integer not null,
  price text,
  booking_url text,
  recurring boolean not null default false,
  recurrence_rule text,
  category venue_category not null,
  neighbourhood neighbourhood not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aula_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  aula_institution_id text not null,
  access_token text,
  refresh_token text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, aula_institution_id)
);

comment on column public.aula_connections.access_token is
  'Encrypted token ciphertext only. Use Supabase Vault or an equivalent KMS boundary before writing.';
comment on column public.aula_connections.refresh_token is
  'Encrypted token ciphertext only. Use Supabase Vault or an equivalent KMS boundary before writing.';

create table if not exists public.aula_highlights (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  aula_post_id text not null,
  title text not null,
  content text,
  photos text[] not null default '{}',
  posted_at timestamptz not null,
  imported_at timestamptz not null default now(),
  unique (child_id, aula_post_id)
);

create index if not exists children_user_id_idx on public.children(user_id);
create index if not exists milestones_child_id_date_idx on public.milestones(child_id, date);
create index if not exists activities_log_child_id_date_idx on public.activities_log(child_id, date);
create index if not exists activities_log_venue_id_idx on public.activities_log(venue_id);
create index if not exists venues_category_idx on public.venues(category);
create index if not exists venues_neighbourhood_idx on public.venues(neighbourhood);
create index if not exists events_date_start_idx on public.events(date_start);
create index if not exists events_venue_id_idx on public.events(venue_id);
create index if not exists aula_connections_user_id_idx on public.aula_connections(user_id);
create index if not exists aula_connections_child_id_idx on public.aula_connections(child_id);
create index if not exists aula_highlights_child_id_posted_at_idx on public.aula_highlights(child_id, posted_at);

drop trigger if exists set_children_updated_at on public.children;
create trigger set_children_updated_at
before update on public.children
for each row execute function public.set_updated_at();

drop trigger if exists set_milestones_updated_at on public.milestones;
create trigger set_milestones_updated_at
before update on public.milestones
for each row execute function public.set_updated_at();

drop trigger if exists set_activities_log_updated_at on public.activities_log;
create trigger set_activities_log_updated_at
before update on public.activities_log
for each row execute function public.set_updated_at();

drop trigger if exists set_venues_updated_at on public.venues;
create trigger set_venues_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists set_aula_connections_updated_at on public.aula_connections;
create trigger set_aula_connections_updated_at
before update on public.aula_connections
for each row execute function public.set_updated_at();

alter table public.children enable row level security;
alter table public.milestones enable row level security;
alter table public.activities_log enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.aula_connections enable row level security;
alter table public.aula_highlights enable row level security;

create policy "Venues are public readable"
on public.venues for select
using (true);

create policy "Events are public readable"
on public.events for select
using (true);

create policy "Users manage own children"
on public.children for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own milestones"
on public.milestones for all
using (
  exists (
    select 1 from public.children
    where children.id = milestones.child_id
    and children.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.children
    where children.id = milestones.child_id
    and children.user_id = auth.uid()
  )
);

create policy "Users manage own activity logs"
on public.activities_log for all
using (
  exists (
    select 1 from public.children
    where children.id = activities_log.child_id
    and children.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.children
    where children.id = activities_log.child_id
    and children.user_id = auth.uid()
  )
);

create policy "Users manage own Aula connections"
on public.aula_connections for all
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.children
    where children.id = aula_connections.child_id
    and children.user_id = auth.uid()
  )
);

create policy "Users read own Aula highlights"
on public.aula_highlights for select
using (
  exists (
    select 1 from public.children
    where children.id = aula_highlights.child_id
    and children.user_id = auth.uid()
  )
);

create policy "Service role writes Aula highlights"
on public.aula_highlights for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
