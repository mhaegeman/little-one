import type { SupabaseClient } from "@supabase/supabase-js";
import { categories } from "@/lib/data/taxonomy";
import type {
  Family,
  FamilyInvite,
  FamilyMember,
  FamilyProfile,
  FamilyRole,
  IndoorPreference,
  Neighbourhood,
  VenueCategory
} from "@/lib/types";
import { neighbourhoods as neighbourhoodList } from "@/lib/data/taxonomy";

type Row = Record<string, unknown>;

const PROFILE_COLUMNS =
  "user_id,display_name,pronouns,bio,avatar_url,preferred_role,preferred_locale,interests,neighbourhoods,indoor_preference,child_age_min_months,child_age_max_months,notify_email";

const validCategories = new Set<string>(categories);
const validNeighbourhoods = new Set<string>(neighbourhoodList);

function toIndoorPreference(value: unknown): IndoorPreference {
  return value === "indoor" || value === "outdoor" ? value : "any";
}

function toCategoryArray(value: unknown): VenueCategory[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is VenueCategory =>
    typeof item === "string" && validCategories.has(item)
  );
}

function toNeighbourhoodArray(value: unknown): Neighbourhood[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Neighbourhood =>
    typeof item === "string" && validNeighbourhoods.has(item)
  );
}

function mapProfile(row: Row | null | undefined): FamilyProfile | null {
  if (!row) return null;
  return {
    userId: row.user_id as string,
    displayName: (row.display_name as string | null) ?? null,
    pronouns: (row.pronouns as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    preferredRole: ((row.preferred_role as FamilyRole) ?? "parent") as FamilyRole,
    preferredLocale: (row.preferred_locale as string) ?? "da",
    interests: toCategoryArray(row.interests),
    neighbourhoods: toNeighbourhoodArray(row.neighbourhoods),
    indoorPreference: toIndoorPreference(row.indoor_preference),
    childAgeMinMonths:
      typeof row.child_age_min_months === "number" ? (row.child_age_min_months as number) : null,
    childAgeMaxMonths:
      typeof row.child_age_max_months === "number" ? (row.child_age_max_months as number) : null,
    notifyEmail: row.notify_email === false ? false : true
  };
}

function mapFamily(row: Row): Family {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    coverUrl: (row.cover_url as string | null) ?? null,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string
  };
}

function mapMember(row: Row): FamilyMember {
  const rawProfile = row.family_profiles;
  const profile = (Array.isArray(rawProfile) ? rawProfile[0] : rawProfile) as Row | null | undefined;
  return {
    id: row.id as string,
    familyId: row.family_id as string,
    userId: row.user_id as string,
    role: (row.role as FamilyRole) ?? "parent",
    displayName: (row.display_name as string | null) ?? null,
    joinedAt: row.joined_at as string,
    profile: mapProfile(profile ?? null)
  };
}

function mapInvite(row: Row): FamilyInvite {
  return {
    id: row.id as string,
    familyId: row.family_id as string,
    invitedEmail: (row.invited_email as string | null) ?? null,
    invitedName: (row.invited_name as string | null) ?? null,
    invitedBy: row.invited_by as string,
    role: (row.role as FamilyRole) ?? "family",
    message: (row.message as string | null) ?? null,
    token: row.token as string,
    status: (row.status as FamilyInvite["status"]) ?? "pending",
    expiresAt: row.expires_at as string,
    createdAt: row.created_at as string
  };
}

export async function loadOwnProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("family_profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return mapProfile((data as Row | null) ?? null);
}

export async function upsertOwnProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: Partial<Omit<FamilyProfile, "userId">>
) {
  const { data, error } = await supabase
    .from("family_profiles")
    .upsert(
      {
        user_id: userId,
        display_name: patch.displayName ?? null,
        pronouns: patch.pronouns ?? null,
        bio: patch.bio ?? null,
        avatar_url: patch.avatarUrl ?? null,
        preferred_role: patch.preferredRole ?? "parent",
        preferred_locale: patch.preferredLocale ?? "da",
        interests: patch.interests ?? [],
        neighbourhoods: patch.neighbourhoods ?? [],
        indoor_preference: patch.indoorPreference ?? "any",
        child_age_min_months: patch.childAgeMinMonths ?? null,
        child_age_max_months: patch.childAgeMaxMonths ?? null,
        notify_email: patch.notifyEmail ?? true
      },
      { onConflict: "user_id" }
    )
    .select(PROFILE_COLUMNS)
    .single();

  if (error) throw error;
  return mapProfile(data as Row) as FamilyProfile;
}

export async function loadFamiliesForUser(supabase: SupabaseClient, userId: string) {
  const { data: memberships, error } = await supabase
    .from("family_members")
    .select("family_id, role, display_name, joined_at, families(*)")
    .eq("user_id", userId);

  if (error) throw error;

  return (memberships ?? []).map((row) => {
    const rawFamily = row.families as unknown;
    const family = Array.isArray(rawFamily) ? (rawFamily[0] as Row) : (rawFamily as Row);
    return {
      role: row.role as FamilyRole,
      displayName: (row.display_name as string | null) ?? null,
      joinedAt: row.joined_at as string,
      family: mapFamily(family)
    };
  });
}

export async function loadFamilyMembers(supabase: SupabaseClient, familyId: string) {
  const { data, error } = await supabase
    .from("family_members")
    .select(
      `id, family_id, user_id, role, display_name, joined_at, family_profiles(${PROFILE_COLUMNS})`
    )
    .eq("family_id", familyId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapMember(row as Row));
}

export async function loadFamilyInvites(supabase: SupabaseClient, familyId: string) {
  const { data, error } = await supabase
    .from("family_invites")
    .select(
      "id, family_id, invited_email, invited_name, invited_by, role, message, token, status, expires_at, created_at"
    )
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapInvite(row as Row));
}

export async function updateFamily(
  supabase: SupabaseClient,
  familyId: string,
  patch: Partial<Pick<Family, "name" | "description" | "coverUrl">>
) {
  const { data, error } = await supabase
    .from("families")
    .update({
      name: patch.name,
      description: patch.description ?? null,
      cover_url: patch.coverUrl ?? null
    })
    .eq("id", familyId)
    .select("*")
    .single();

  if (error) throw error;
  return mapFamily(data as Row);
}

export type CreateInviteInput = {
  familyId: string;
  invitedEmail?: string;
  invitedName?: string;
  role: FamilyRole;
  message?: string;
  expiresInDays?: number;
};

export async function createFamilyInvite(
  supabase: SupabaseClient,
  invitedBy: string,
  input: CreateInviteInput
) {
  const expires = new Date();
  expires.setDate(expires.getDate() + (input.expiresInDays ?? 14));

  const { data, error } = await supabase
    .from("family_invites")
    .insert({
      family_id: input.familyId,
      invited_email: input.invitedEmail?.trim().toLowerCase() || null,
      invited_name: input.invitedName?.trim() || null,
      invited_by: invitedBy,
      role: input.role,
      message: input.message?.trim() || null,
      expires_at: expires.toISOString()
    })
    .select(
      "id, family_id, invited_email, invited_name, invited_by, role, message, token, status, expires_at, created_at"
    )
    .single();

  if (error) throw error;
  return mapInvite(data as Row);
}

export async function revokeFamilyInvite(supabase: SupabaseClient, inviteId: string) {
  const { error } = await supabase
    .from("family_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId);

  if (error) throw error;
}

export async function loadInviteByToken(supabase: SupabaseClient, token: string) {
  const { data, error } = await supabase
    .from("family_invites")
    .select(
      "id, family_id, invited_email, invited_name, invited_by, role, message, token, status, expires_at, created_at, families(*)"
    )
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    invite: mapInvite(data as Row),
    family: mapFamily((data as Row).families as Row)
  };
}

export async function acceptInvite(supabase: SupabaseClient, token: string) {
  const { data, error } = await supabase.rpc("accept_family_invite", {
    invite_token: token
  });
  if (error) throw error;
  return data as string | null;
}

export function inviteShareUrl(origin: string, token: string) {
  return `${origin.replace(/\/$/, "")}/invite/${token}`;
}

export const ROLE_LABELS_DA: Record<FamilyRole, string> = {
  owner: "Ejer",
  parent: "Forælder",
  family: "Familie",
  caregiver: "Dagplejer"
};

export const ROLE_LABELS_EN: Record<FamilyRole, string> = {
  owner: "Owner",
  parent: "Parent",
  family: "Family",
  caregiver: "Caregiver"
};
