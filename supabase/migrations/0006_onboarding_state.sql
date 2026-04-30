-- Track when a user finishes the post-sign-in family-info onboarding wizard.
-- Null = the user has signed in but has not yet filled in family name, members,
-- location and interests. Used by /auth/callback to route first-time users to
-- /onboarding before letting them into the rest of the app.

alter table public.family_profiles
  add column if not exists onboarding_completed_at timestamptz;
