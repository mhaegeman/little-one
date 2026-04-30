-- Family-shared journal: link a child to a family so its journal (children
-- row, milestones, activities_log, aula_highlights, journal_reactions) is
-- visible to every family member, while writes stay owner-only. Any family
-- member can post their own reactions.
--
-- The link is nullable — pre-existing children stay personal-only until a
-- parent assigns them to a family. The family-assignment UI lands in a
-- follow-up; until then the column can be backfilled by hand or via the
-- families page when that flow ships.

alter table public.children
  add column if not exists family_id uuid
    references public.families(id) on delete set null;

create index if not exists children_family_id_idx
  on public.children (family_id)
  where family_id is not null;

-- Helper: can the current auth user view a child's journal? True if they
-- own the child OR are a member of the child's linked family. SECURITY
-- DEFINER so RLS policies don't recurse on family_members. Lives in the
-- private schema (not exposed via PostgREST).
create or replace function private.user_can_view_child(target_child_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.children c
    where c.id = target_child_id
      and (
        c.user_id = auth.uid()
        or (
          c.family_id is not null
          and exists (
            select 1
            from public.family_members fm
            where fm.family_id = c.family_id
              and fm.user_id = auth.uid()
          )
        )
      )
  );
$$;

revoke all on function private.user_can_view_child(uuid) from public;
grant execute on function private.user_can_view_child(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- children: family members can read; only the owner can write.
-- ---------------------------------------------------------------------------
drop policy if exists "Users manage own children" on public.children;

drop policy if exists "Family members read shared children" on public.children;
create policy "Family members read shared children"
on public.children for select
using (private.user_can_view_child(id));

drop policy if exists "Owners write own children" on public.children;
create policy "Owners write own children"
on public.children for insert
with check (auth.uid() = user_id);

drop policy if exists "Owners update own children" on public.children;
create policy "Owners update own children"
on public.children for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Owners delete own children" on public.children;
create policy "Owners delete own children"
on public.children for delete
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- milestones: family members read; only owner writes.
-- ---------------------------------------------------------------------------
drop policy if exists "Users manage own milestones" on public.milestones;

drop policy if exists "Family members read shared milestones" on public.milestones;
create policy "Family members read shared milestones"
on public.milestones for select
using (private.user_can_view_child(child_id));

drop policy if exists "Owners write own milestones" on public.milestones;
create policy "Owners write own milestones"
on public.milestones for insert
with check (
  exists (
    select 1 from public.children
    where children.id = milestones.child_id
      and children.user_id = auth.uid()
  )
);

drop policy if exists "Owners update own milestones" on public.milestones;
create policy "Owners update own milestones"
on public.milestones for update
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

drop policy if exists "Owners delete own milestones" on public.milestones;
create policy "Owners delete own milestones"
on public.milestones for delete
using (
  exists (
    select 1 from public.children
    where children.id = milestones.child_id
      and children.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- activities_log: family members read; only owner writes.
-- ---------------------------------------------------------------------------
drop policy if exists "Users manage own activity logs" on public.activities_log;

drop policy if exists "Family members read shared activity logs" on public.activities_log;
create policy "Family members read shared activity logs"
on public.activities_log for select
using (private.user_can_view_child(child_id));

drop policy if exists "Owners write own activity logs" on public.activities_log;
create policy "Owners write own activity logs"
on public.activities_log for insert
with check (
  exists (
    select 1 from public.children
    where children.id = activities_log.child_id
      and children.user_id = auth.uid()
  )
);

drop policy if exists "Owners update own activity logs" on public.activities_log;
create policy "Owners update own activity logs"
on public.activities_log for update
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

drop policy if exists "Owners delete own activity logs" on public.activities_log;
create policy "Owners delete own activity logs"
on public.activities_log for delete
using (
  exists (
    select 1 from public.children
    where children.id = activities_log.child_id
      and children.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- aula_highlights: family members read; service role still writes (Aula sync).
-- ---------------------------------------------------------------------------
drop policy if exists "Users read own Aula highlights" on public.aula_highlights;
create policy "Family members read shared Aula highlights"
on public.aula_highlights for select
using (private.user_can_view_child(child_id));

-- ---------------------------------------------------------------------------
-- journal_reactions: family members read and post their own reactions; you
-- can only delete your own reactions.
-- ---------------------------------------------------------------------------
drop policy if exists "Users read own journal reactions" on public.journal_reactions;
create policy "Family members read shared journal reactions"
on public.journal_reactions for select
using (private.user_can_view_child(child_id));

drop policy if exists "Users insert own journal reactions" on public.journal_reactions;
create policy "Family members insert own journal reactions"
on public.journal_reactions for insert
with check (
  user_id = auth.uid()
  and private.user_can_view_child(child_id)
);

drop policy if exists "Users delete own journal reactions" on public.journal_reactions;
create policy "Members delete own journal reactions"
on public.journal_reactions for delete
using (
  user_id = auth.uid()
  and private.user_can_view_child(child_id)
);
