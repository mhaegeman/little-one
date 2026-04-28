-- Family profiles, families, members, invites
-- Adds the personal profile every signed-in user gets, the families they belong to,
-- the per-family membership rows, and time-limited invitation tokens.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

do $$ begin
  create type family_role as enum ('owner', 'parent', 'family', 'caregiver');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type family_invite_status as enum ('pending', 'accepted', 'revoked', 'expired');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.family_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  pronouns text,
  bio text,
  avatar_url text,
  preferred_role family_role not null default 'parent',
  preferred_locale text not null default 'da',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_url text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role family_role not null default 'parent',
  display_name text,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  invited_email citext,
  invited_name text,
  invited_by uuid not null references auth.users(id) on delete cascade,
  role family_role not null default 'family',
  message text,
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  status family_invite_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices
create index if not exists family_members_family_id_idx on public.family_members(family_id);
create index if not exists family_members_user_id_idx on public.family_members(user_id);
create index if not exists family_invites_family_id_idx on public.family_invites(family_id);
create index if not exists family_invites_email_idx on public.family_invites(invited_email);
create index if not exists family_invites_status_idx on public.family_invites(status);

-- updated_at triggers (function defined in migration 0001)
drop trigger if exists set_family_profiles_updated_at on public.family_profiles;
create trigger set_family_profiles_updated_at
before update on public.family_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_families_updated_at on public.families;
create trigger set_families_updated_at
before update on public.families
for each row execute function public.set_updated_at();

drop trigger if exists set_family_members_updated_at on public.family_members;
create trigger set_family_members_updated_at
before update on public.family_members
for each row execute function public.set_updated_at();

drop trigger if exists set_family_invites_updated_at on public.family_invites;
create trigger set_family_invites_updated_at
before update on public.family_invites
for each row execute function public.set_updated_at();

-- Auto-create a personal profile and a starter family on first sign-in.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  starter_family_id uuid;
  display text;
begin
  display := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.family_profiles (user_id, display_name, preferred_role, preferred_locale)
  values (
    new.id,
    display,
    coalesce((new.raw_user_meta_data ->> 'preferred_role')::family_role, 'parent'),
    coalesce(nullif(new.raw_user_meta_data ->> 'preferred_locale', ''), 'da')
  )
  on conflict (user_id) do nothing;

  -- Only create a starter family when the user did not arrive via an invite.
  if (new.raw_user_meta_data ->> 'invite_token') is null then
    insert into public.families (name, description, created_by)
    values (display || ' familie', null, new.id)
    returning id into starter_family_id;

    insert into public.family_members (family_id, user_id, role, display_name)
    values (starter_family_id, new.id, 'owner', display);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Accept an invite by token. Runs as security definer so the inviting family's
-- owner does not need direct grants on the new member's auth.uid().
create or replace function public.accept_family_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.family_invites;
  v_user uuid := auth.uid();
  v_email citext;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_invite
  from public.family_invites
  where token = invite_token
  for update;

  if not found then
    raise exception 'invite_not_found';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'invite_not_pending';
  end if;

  if v_invite.expires_at < now() then
    update public.family_invites set status = 'expired' where id = v_invite.id;
    raise exception 'invite_expired';
  end if;

  select email::citext into v_email from auth.users where id = v_user;

  if v_invite.invited_email is not null
     and v_email is not null
     and v_email <> v_invite.invited_email then
    raise exception 'invite_email_mismatch';
  end if;

  insert into public.family_members (family_id, user_id, role, display_name)
  values (v_invite.family_id, v_user, v_invite.role, v_invite.invited_name)
  on conflict (family_id, user_id) do update
    set role = excluded.role
  ;

  update public.family_invites
  set status = 'accepted',
      accepted_by = v_user,
      accepted_at = now()
  where id = v_invite.id;

  return v_invite.family_id;
end;
$$;

grant execute on function public.accept_family_invite(text) to authenticated;

-- RLS
alter table public.family_profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invites enable row level security;

-- family_profiles: each user manages their own profile.
create policy "Users read own profile"
on public.family_profiles for select
using (auth.uid() = user_id);

create policy "Users insert own profile"
on public.family_profiles for insert
with check (auth.uid() = user_id);

create policy "Users update own profile"
on public.family_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- A user can read the profile of anyone they share a family with.
create policy "Family members read each other"
on public.family_profiles for select
using (
  exists (
    select 1
    from public.family_members me
    join public.family_members them on them.family_id = me.family_id
    where me.user_id = auth.uid()
      and them.user_id = family_profiles.user_id
  )
);

-- families: members read; owners manage.
create policy "Members read their families"
on public.families for select
using (
  exists (
    select 1 from public.family_members
    where family_members.family_id = families.id
      and family_members.user_id = auth.uid()
  )
);

create policy "Creator inserts family"
on public.families for insert
with check (auth.uid() = created_by);

create policy "Owners update their family"
on public.families for update
using (
  exists (
    select 1 from public.family_members
    where family_members.family_id = families.id
      and family_members.user_id = auth.uid()
      and family_members.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.family_members
    where family_members.family_id = families.id
      and family_members.user_id = auth.uid()
      and family_members.role = 'owner'
  )
);

create policy "Owners delete their family"
on public.families for delete
using (
  exists (
    select 1 from public.family_members
    where family_members.family_id = families.id
      and family_members.user_id = auth.uid()
      and family_members.role = 'owner'
  )
);

-- family_members: members can see each other; owners can manage; users can leave.
create policy "Members read other members"
on public.family_members for select
using (
  exists (
    select 1 from public.family_members me
    where me.family_id = family_members.family_id
      and me.user_id = auth.uid()
  )
);

create policy "Owners insert members"
on public.family_members for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.family_members
    where family_members.family_id = family_members.family_id
      and family_members.user_id = auth.uid()
      and family_members.role = 'owner'
  )
);

create policy "Owners update members"
on public.family_members for update
using (
  exists (
    select 1 from public.family_members me
    where me.family_id = family_members.family_id
      and me.user_id = auth.uid()
      and me.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.family_members me
    where me.family_id = family_members.family_id
      and me.user_id = auth.uid()
      and me.role = 'owner'
  )
);

create policy "Members can leave or owners can remove"
on public.family_members for delete
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.family_members me
    where me.family_id = family_members.family_id
      and me.user_id = auth.uid()
      and me.role = 'owner'
  )
);

-- family_invites: family members read; owners manage; the invited person can read by token.
create policy "Members read family invites"
on public.family_invites for select
using (
  exists (
    select 1 from public.family_members
    where family_members.family_id = family_invites.family_id
      and family_members.user_id = auth.uid()
  )
);

create policy "Owners create invites"
on public.family_invites for insert
with check (
  invited_by = auth.uid()
  and exists (
    select 1 from public.family_members
    where family_members.family_id = family_invites.family_id
      and family_members.user_id = auth.uid()
      and family_members.role = 'owner'
  )
);

create policy "Owners update invites"
on public.family_invites for update
using (
  exists (
    select 1 from public.family_members
    where family_members.family_id = family_invites.family_id
      and family_members.user_id = auth.uid()
      and family_members.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.family_members
    where family_members.family_id = family_invites.family_id
      and family_members.user_id = auth.uid()
      and family_members.role = 'owner'
  )
);

-- Tighten existing children/journal access: family co-members should also see them.
drop policy if exists "Users manage own children" on public.children;
create policy "Family members manage children"
on public.children for all
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.family_members me
    join public.family_members owner_row
      on owner_row.family_id = me.family_id
     and owner_row.user_id = children.user_id
    where me.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.family_members me
    join public.family_members owner_row
      on owner_row.family_id = me.family_id
     and owner_row.user_id = children.user_id
    where me.user_id = auth.uid()
  )
);
