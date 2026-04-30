import { createClient } from "@/lib/db/supabase/server";
import { loadFamiliesForUser, loadOwnProfile } from "@/lib/services/family";

export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  familyName: string | null;
  avatarUrl: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, families] = await Promise.all([
    loadOwnProfile(supabase, user.id).catch(() => null),
    loadFamiliesForUser(supabase, user.id).catch(() => [])
  ]);

  const familyName = families[0]?.family.name ?? null;

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.displayName ?? null,
    familyName,
    avatarUrl: profile?.avatarUrl ?? null
  };
}
