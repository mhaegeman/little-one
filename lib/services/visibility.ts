import type { SupabaseClient } from "@supabase/supabase-js";
import type { Neighbourhood, VenueCategory } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FamilyVisibility = "minimal" | "moderate" | "open";

export type FamilyPublicProfile = {
  familyId: string;
  visibility: FamilyVisibility;
  searchable: boolean;
  neighbourhoods: Neighbourhood[];
  interests: VenueCategory[];
  childAgeBands: number[];
  description: string | null;
  coverUrl: string | null;
  showParentFirstNames: boolean;
  // joined fields when returning a public-facing card
  familyName?: string;
};

// Age bands in months. Labels are localized at render time via the
// "families.ageBands.<value>" translation keys.
export const AGE_BAND_VALUES = [0, 6, 12, 24, 36, 48, 60] as const;
export type AgeBand = (typeof AGE_BAND_VALUES)[number];

export type DiscoveryFilter = {
  neighbourhoods?: Neighbourhood[];
  interests?: VenueCategory[];
  childAgeBands?: number[];
  excludeFamilyIds?: string[];
  limit?: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PUBLIC_PROFILE_COLUMNS =
  "family_id,visibility,searchable,neighbourhoods,interests,child_age_bands,description,cover_url,show_parent_first_names";

function rowToPublicProfile(row: Record<string, unknown>): FamilyPublicProfile {
  return {
    familyId: row.family_id as string,
    visibility: (row.visibility as FamilyVisibility) ?? "minimal",
    searchable: Boolean(row.searchable),
    neighbourhoods: ((row.neighbourhoods as string[]) ?? []) as Neighbourhood[],
    interests: ((row.interests as string[]) ?? []) as VenueCategory[],
    childAgeBands: ((row.child_age_bands as number[]) ?? []),
    description: (row.description as string | null) ?? null,
    coverUrl: (row.cover_url as string | null) ?? null,
    showParentFirstNames: Boolean(row.show_parent_first_names),
    familyName:
      (row.families as { name?: string } | undefined)?.name ?? (row.family_name as string | undefined)
  };
}

// ---------------------------------------------------------------------------
// Public profile (own family)
// ---------------------------------------------------------------------------

export async function loadOwnPublicProfile(
  client: SupabaseClient,
  familyId: string
): Promise<FamilyPublicProfile | null> {
  const { data, error } = await client
    .from("family_public_profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("family_id", familyId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPublicProfile(data as Record<string, unknown>) : null;
}

export async function upsertOwnPublicProfile(
  client: SupabaseClient,
  familyId: string,
  patch: Partial<Omit<FamilyPublicProfile, "familyId" | "familyName">>
): Promise<FamilyPublicProfile> {
  const payload: Record<string, unknown> = { family_id: familyId };
  if (patch.visibility !== undefined) payload.visibility = patch.visibility;
  if (patch.searchable !== undefined) payload.searchable = patch.searchable;
  if (patch.neighbourhoods !== undefined) payload.neighbourhoods = patch.neighbourhoods;
  if (patch.interests !== undefined) payload.interests = patch.interests;
  if (patch.childAgeBands !== undefined) payload.child_age_bands = patch.childAgeBands;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.coverUrl !== undefined) payload.cover_url = patch.coverUrl;
  if (patch.showParentFirstNames !== undefined)
    payload.show_parent_first_names = patch.showParentFirstNames;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await client
    .from("family_public_profiles")
    .upsert(payload, { onConflict: "family_id" })
    .select(PUBLIC_PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return rowToPublicProfile(data as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

export async function discoverFamilies(
  client: SupabaseClient,
  filter: DiscoveryFilter = {}
): Promise<FamilyPublicProfile[]> {
  let query = client
    .from("family_public_profiles")
    .select(`${PUBLIC_PROFILE_COLUMNS},families(name)`)
    .eq("searchable", true)
    .order("updated_at", { ascending: false })
    .limit(filter.limit ?? 60);

  if (filter.neighbourhoods?.length) {
    query = query.overlaps("neighbourhoods", filter.neighbourhoods);
  }
  if (filter.interests?.length) {
    query = query.overlaps("interests", filter.interests);
  }
  if (filter.childAgeBands?.length) {
    query = query.overlaps("child_age_bands", filter.childAgeBands);
  }
  if (filter.excludeFamilyIds?.length) {
    query = query.not("family_id", "in", `(${filter.excludeFamilyIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(rowToPublicProfile);
}

export async function loadPublicProfileForFamily(
  client: SupabaseClient,
  familyId: string
): Promise<FamilyPublicProfile | null> {
  const { data, error } = await client
    .from("family_public_profiles")
    .select(`${PUBLIC_PROFILE_COLUMNS},families(name)`)
    .eq("family_id", familyId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPublicProfile(data as Record<string, unknown>) : null;
}
