-- Profile personalisation fields used by the refactored profile experience.
-- Adds interests, neighbourhood pins, indoor/outdoor preference, child age range
-- and the email-notification opt-in to the existing family_profiles row.

alter table public.family_profiles
  add column if not exists interests text[] not null default '{}',
  add column if not exists neighbourhoods text[] not null default '{}',
  add column if not exists indoor_preference text not null default 'any',
  add column if not exists child_age_min_months int,
  add column if not exists child_age_max_months int,
  add column if not exists notify_email boolean not null default true;

do $$ begin
  alter table public.family_profiles
    add constraint family_profiles_indoor_preference_check
    check (indoor_preference in ('indoor', 'outdoor', 'any'));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter table public.family_profiles
    add constraint family_profiles_child_age_range_check
    check (
      (child_age_min_months is null and child_age_max_months is null)
      or (
        child_age_min_months is not null
        and child_age_max_months is not null
        and child_age_min_months >= 0
        and child_age_max_months >= child_age_min_months
        and child_age_max_months <= 240
      )
    );
exception
  when duplicate_object then null;
end $$;
