-- Journal moment reactions: heart / clap / smile / star, attached to either
-- a milestone or an activity_log entry. v1 is single-user-per-child, so the
-- reactor is always the child's owner; RLS mirrors the parent-row policy.
-- Family-shared reactions land when the family-share RLS expands to cover
-- milestones / activities_log.

create extension if not exists "pgcrypto";

do $$ begin
  create type reaction_entry_type as enum ('milestone', 'activity');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type reaction_kind as enum ('heart', 'clap', 'smile', 'star');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.journal_reactions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  entry_type reaction_entry_type not null,
  entry_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind reaction_kind not null,
  display_name text,
  created_at timestamptz not null default now(),
  unique (entry_type, entry_id, user_id, kind)
);

create index if not exists journal_reactions_child_idx
  on public.journal_reactions (child_id, created_at desc);
create index if not exists journal_reactions_entry_idx
  on public.journal_reactions (entry_type, entry_id);

alter table public.journal_reactions enable row level security;

drop policy if exists "Users read own journal reactions" on public.journal_reactions;
create policy "Users read own journal reactions"
on public.journal_reactions for select
using (
  exists (
    select 1 from public.children
    where children.id = journal_reactions.child_id
      and children.user_id = auth.uid()
  )
);

drop policy if exists "Users insert own journal reactions" on public.journal_reactions;
create policy "Users insert own journal reactions"
on public.journal_reactions for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.children
    where children.id = journal_reactions.child_id
      and children.user_id = auth.uid()
  )
);

drop policy if exists "Users delete own journal reactions" on public.journal_reactions;
create policy "Users delete own journal reactions"
on public.journal_reactions for delete
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.children
    where children.id = journal_reactions.child_id
      and children.user_id = auth.uid()
  )
);
