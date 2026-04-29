-- Social layer: public family cards, family-to-family connections,
-- parent-to-parent direct threads, blocks and reports.
--
-- Privacy posture: minimal-by-default, opt-in to be searchable, RLS gates
-- every read and write. Connections live at the family level; threads live
-- between two specific users (Hybrid model).

create extension if not exists "pgcrypto";

do $$ begin
  create type family_visibility as enum ('minimal', 'moderate', 'open');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type family_connection_status as enum (
    'pending', 'accepted', 'declined', 'blocked', 'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Helper: is current user a member of a given family?
-- Safe to live in `public` — it uses auth.uid() so even when exposed as an
-- RPC it only reveals the caller's own membership (which they can already
-- read via the family_members RLS policy).
-- ---------------------------------------------------------------------------
create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family_id
      and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Helpers that accept arbitrary (user_id, family_id) or (family, family)
-- pairs live in a `private` schema so PostgREST does not expose them as
-- /rest/v1/rpc/* endpoints. RLS policies still call them by qualified name;
-- the authenticated role gets just enough access for policy evaluation.
-- ---------------------------------------------------------------------------
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.families_blocked(family_a uuid, family_b uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_blocks
    where (family_id = family_a and blocked_family_id = family_b)
       or (family_id = family_b and blocked_family_id = family_a)
  );
$$;

revoke all on function private.families_blocked(uuid, uuid) from public;
grant execute on function private.families_blocked(uuid, uuid) to authenticated;

-- Used to validate that thread participants actually belong to the families
-- on the parent connection.
create or replace function private.user_in_family(target_user_id uuid, target_family_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where user_id = target_user_id
      and family_id = target_family_id
  );
$$;

revoke all on function private.user_in_family(uuid, uuid) from public;
grant execute on function private.user_in_family(uuid, uuid) to authenticated;

-- Drop any earlier public copies so we don't end up with two functions of
-- the same name resolving differently between RLS policies and RPC.
drop function if exists public.families_blocked(uuid, uuid);
drop function if exists public.user_in_family(uuid, uuid);

-- ---------------------------------------------------------------------------
-- family_public_profiles
-- ---------------------------------------------------------------------------
create table if not exists public.family_public_profiles (
  family_id uuid primary key references public.families(id) on delete cascade,
  visibility family_visibility not null default 'minimal',
  searchable boolean not null default false,
  neighbourhoods text[] not null default '{}',
  interests text[] not null default '{}',
  child_age_bands int[] not null default '{}', -- e.g. {0,6,12,24,36,48,60,72} buckets in months
  description text,
  cover_url text,
  show_parent_first_names boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists family_public_profiles_searchable_idx
  on public.family_public_profiles (searchable)
  where searchable = true;

create index if not exists family_public_profiles_neighbourhoods_idx
  on public.family_public_profiles using gin (neighbourhoods);

-- ---------------------------------------------------------------------------
-- family_blocks  (defined before family_connections because connections
-- reference families_blocked() which reads family_blocks)
-- ---------------------------------------------------------------------------
create table if not exists public.family_blocks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  blocked_family_id uuid not null references public.families(id) on delete cascade,
  blocked_by_user_id uuid not null references auth.users(id),
  reason text,
  created_at timestamptz not null default now(),
  unique (family_id, blocked_family_id),
  check (family_id <> blocked_family_id)
);

-- ---------------------------------------------------------------------------
-- family_connections
-- ---------------------------------------------------------------------------
create table if not exists public.family_connections (
  id uuid primary key default gen_random_uuid(),
  requester_family_id uuid not null references public.families(id) on delete cascade,
  addressee_family_id uuid not null references public.families(id) on delete cascade,
  status family_connection_status not null default 'pending',
  intro_message text check (char_length(coalesce(intro_message, '')) <= 600),
  requested_by_user_id uuid not null references auth.users(id),
  responded_by_user_id uuid references auth.users(id),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  check (requester_family_id <> addressee_family_id)
);

create index if not exists family_connections_requester_idx
  on public.family_connections (requester_family_id);
create index if not exists family_connections_addressee_idx
  on public.family_connections (addressee_family_id);

-- At most one *active* connection per unordered family pair, regardless of
-- direction. Allows a fresh request after a previous one was declined or
-- cancelled, but prevents A→B and B→A from being pending/accepted/blocked
-- simultaneously (which would break loadConnectionBetween).
create unique index if not exists family_connections_active_pair_unique
  on public.family_connections (
    least(requester_family_id, addressee_family_id),
    greatest(requester_family_id, addressee_family_id)
  )
  where status in ('pending', 'accepted', 'blocked');

-- ---------------------------------------------------------------------------
-- direct_threads (1:1 user-to-user, gated by an accepted family_connection)
-- ---------------------------------------------------------------------------
create table if not exists public.direct_threads (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.family_connections(id) on delete cascade,
  user_a_id uuid not null references auth.users(id) on delete cascade,
  user_b_id uuid not null references auth.users(id) on delete cascade,
  family_a_id uuid not null references public.families(id) on delete cascade,
  family_b_id uuid not null references public.families(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  -- Per-side last-read timestamps. Updated only via mark_thread_read() so
  -- column-level write rules don't have to be expressed in RLS.
  user_a_last_read_at timestamptz,
  user_b_last_read_at timestamptz,
  unique (connection_id, user_a_id, user_b_id),
  check (user_a_id <> user_b_id),
  -- canonicalize order so the unique constraint catches both directions
  check (user_a_id < user_b_id)
);

create index if not exists direct_threads_user_a_idx on public.direct_threads (user_a_id);
create index if not exists direct_threads_user_b_idx on public.direct_threads (user_b_id);
create index if not exists direct_threads_connection_idx on public.direct_threads (connection_id);

-- ---------------------------------------------------------------------------
-- direct_messages
-- ---------------------------------------------------------------------------
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.direct_threads(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index if not exists direct_messages_thread_id_idx
  on public.direct_messages (thread_id, created_at desc);

-- Mark the calling user's side of a thread as read. SECURITY DEFINER so we
-- can write only the per-side column without exposing a generic UPDATE
-- policy on direct_threads (which would also let users edit family ids,
-- last_message_at, etc.).
create or replace function public.mark_thread_read(target_thread_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  thread_row public.direct_threads%rowtype;
begin
  select * into thread_row
  from public.direct_threads
  where id = target_thread_id;

  if not found then
    return;
  end if;

  if auth.uid() = thread_row.user_a_id then
    update public.direct_threads
       set user_a_last_read_at = now()
     where id = target_thread_id;
  elsif auth.uid() = thread_row.user_b_id then
    update public.direct_threads
       set user_b_last_read_at = now()
     where id = target_thread_id;
  end if;
end;
$$;

revoke all on function public.mark_thread_read(uuid) from public;
grant execute on function public.mark_thread_read(uuid) to authenticated;

-- Update the parent thread's last_message_at on insert.
create or replace function public.touch_direct_thread()
returns trigger language plpgsql as $$
begin
  update public.direct_threads
     set last_message_at = new.created_at
   where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists touch_direct_thread on public.direct_messages;
create trigger touch_direct_thread
  after insert on public.direct_messages
  for each row execute function public.touch_direct_thread();

-- ---------------------------------------------------------------------------
-- family_reports (moderation queue)
-- ---------------------------------------------------------------------------
create table if not exists public.family_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_family_id uuid not null references public.families(id) on delete cascade,
  reported_family_id uuid not null references public.families(id) on delete cascade,
  reason text not null check (reason in ('harassment', 'spam', 'inappropriate', 'safety', 'other')),
  details text check (char_length(coalesce(details, '')) <= 2000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.family_public_profiles enable row level security;
alter table public.family_connections enable row level security;
alter table public.direct_threads enable row level security;
alter table public.direct_messages enable row level security;
alter table public.family_blocks enable row level security;
alter table public.family_reports enable row level security;

-- family_public_profiles: any authenticated user can read searchable+non-blocked
-- rows; only family members can write their own row.
drop policy if exists "select_searchable_public_profiles" on public.family_public_profiles;
create policy "select_searchable_public_profiles"
  on public.family_public_profiles for select
  to authenticated
  using (
    searchable = true
    and not exists (
      select 1
      from public.family_members me
      where me.user_id = auth.uid()
        and private.families_blocked(me.family_id, family_public_profiles.family_id)
    )
  );

drop policy if exists "select_own_public_profile" on public.family_public_profiles;
create policy "select_own_public_profile"
  on public.family_public_profiles for select
  to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "modify_own_public_profile" on public.family_public_profiles;
create policy "modify_own_public_profile"
  on public.family_public_profiles for all
  to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- family_connections: only the two families on the row can see / mutate.
drop policy if exists "select_own_family_connection" on public.family_connections;
create policy "select_own_family_connection"
  on public.family_connections for select
  to authenticated
  using (
    public.is_family_member(requester_family_id)
    or public.is_family_member(addressee_family_id)
  );

drop policy if exists "insert_family_connection_as_requester" on public.family_connections;
create policy "insert_family_connection_as_requester"
  on public.family_connections for insert
  to authenticated
  with check (
    public.is_family_member(requester_family_id)
    and requested_by_user_id = auth.uid()
    and not private.families_blocked(requester_family_id, addressee_family_id)
  );

drop policy if exists "update_family_connection_as_addressee" on public.family_connections;
create policy "update_family_connection_as_addressee"
  on public.family_connections for update
  to authenticated
  using (public.is_family_member(addressee_family_id))
  with check (public.is_family_member(addressee_family_id));

drop policy if exists "cancel_family_connection_as_requester" on public.family_connections;
create policy "cancel_family_connection_as_requester"
  on public.family_connections for update
  to authenticated
  using (
    public.is_family_member(requester_family_id)
    and status = 'pending'
  )
  with check (
    public.is_family_member(requester_family_id)
    and status in ('cancelled')
  );

-- direct_threads: only the two participants can see; insert requires accepted
-- connection.
drop policy if exists "select_own_thread" on public.direct_threads;
create policy "select_own_thread"
  on public.direct_threads for select
  to authenticated
  using (auth.uid() in (user_a_id, user_b_id));

drop policy if exists "insert_thread_for_connected_pair" on public.direct_threads;
create policy "insert_thread_for_connected_pair"
  on public.direct_threads for insert
  to authenticated
  with check (
    -- The caller must be one of the two thread participants.
    auth.uid() in (user_a_id, user_b_id)
    -- Each declared participant must actually belong to the family declared
    -- on their side. Without this a connected user could pin an arbitrary
    -- auth.users id into user_b_id and grant them read access via
    -- select_own_thread.
    and private.user_in_family(user_a_id, family_a_id)
    and private.user_in_family(user_b_id, family_b_id)
    -- The two families must be the two on an accepted connection record,
    -- in either ordering.
    and exists (
      select 1 from public.family_connections fc
      where fc.id = connection_id
        and fc.status = 'accepted'
        and family_a_id in (fc.requester_family_id, fc.addressee_family_id)
        and family_b_id in (fc.requester_family_id, fc.addressee_family_id)
        and family_a_id <> family_b_id
    )
  );

-- direct_messages: only the two participants of the parent thread can read /
-- write. UPDATE is constrained so users can only modify their own messages
-- (for edit/delete) or the read_by_*_at fields.
drop policy if exists "select_own_thread_messages" on public.direct_messages;
create policy "select_own_thread_messages"
  on public.direct_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.direct_threads t
      where t.id = direct_messages.thread_id
        and auth.uid() in (t.user_a_id, t.user_b_id)
    )
  );

drop policy if exists "insert_message_in_own_thread" on public.direct_messages;
create policy "insert_message_in_own_thread"
  on public.direct_messages for insert
  to authenticated
  with check (
    sender_user_id = auth.uid()
    and exists (
      select 1 from public.direct_threads t
      where t.id = thread_id
        and auth.uid() in (t.user_a_id, t.user_b_id)
    )
  );

drop policy if exists "update_message_in_own_thread" on public.direct_messages;
create policy "update_message_in_own_thread"
  on public.direct_messages for update
  to authenticated
  using (sender_user_id = auth.uid())
  with check (sender_user_id = auth.uid());

-- Read receipts live on direct_threads (user_a_last_read_at / user_b_last_read_at)
-- and are mutated only by the SECURITY DEFINER function mark_thread_read(),
-- so direct_messages itself never needs a participant-wide UPDATE policy.

-- family_blocks: only the blocking family can see / write.
drop policy if exists "select_own_blocks" on public.family_blocks;
create policy "select_own_blocks"
  on public.family_blocks for select
  to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "insert_own_blocks" on public.family_blocks;
create policy "insert_own_blocks"
  on public.family_blocks for insert
  to authenticated
  with check (
    public.is_family_member(family_id)
    and blocked_by_user_id = auth.uid()
  );

drop policy if exists "delete_own_blocks" on public.family_blocks;
create policy "delete_own_blocks"
  on public.family_blocks for delete
  to authenticated
  using (public.is_family_member(family_id));

-- family_reports: a member of the reporter family can insert/select their own;
-- nobody else can read.
drop policy if exists "select_own_reports" on public.family_reports;
create policy "select_own_reports"
  on public.family_reports for select
  to authenticated
  using (public.is_family_member(reporter_family_id));

drop policy if exists "insert_own_reports" on public.family_reports;
create policy "insert_own_reports"
  on public.family_reports for insert
  to authenticated
  with check (public.is_family_member(reporter_family_id));

-- Realtime: enable for direct_messages so subscribers receive new messages live.
alter publication supabase_realtime add table public.direct_messages;
alter publication supabase_realtime add table public.direct_threads;
alter publication supabase_realtime add table public.family_connections;
