import type { SupabaseClient } from "@supabase/supabase-js";
import type { Neighbourhood, VenueCategory } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FamilyVisibility = "minimal" | "moderate" | "open";

export type FamilyConnectionStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "blocked"
  | "cancelled";

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

export type FamilyConnection = {
  id: string;
  requesterFamilyId: string;
  addresseeFamilyId: string;
  status: FamilyConnectionStatus;
  introMessage: string | null;
  requestedByUserId: string;
  respondedByUserId: string | null;
  respondedAt: string | null;
  createdAt: string;
};

export type DirectThread = {
  id: string;
  connectionId: string;
  userAId: string;
  userBId: string;
  familyAId: string;
  familyBId: string;
  createdAt: string;
  lastMessageAt: string | null;
  userALastReadAt: string | null;
  userBLastReadAt: string | null;
};

export type DirectMessage = {
  id: string;
  threadId: string;
  senderUserId: string;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};

// Age bands in months. Labels are localized at render time via the
// "families.ageBands.<value>" translation keys.
export const AGE_BAND_VALUES = [0, 6, 12, 24, 36, 48, 60] as const;
export type AgeBand = (typeof AGE_BAND_VALUES)[number];

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

function rowToConnection(row: Record<string, unknown>): FamilyConnection {
  return {
    id: row.id as string,
    requesterFamilyId: row.requester_family_id as string,
    addresseeFamilyId: row.addressee_family_id as string,
    status: row.status as FamilyConnectionStatus,
    introMessage: (row.intro_message as string | null) ?? null,
    requestedByUserId: row.requested_by_user_id as string,
    respondedByUserId: (row.responded_by_user_id as string | null) ?? null,
    respondedAt: (row.responded_at as string | null) ?? null,
    createdAt: row.created_at as string
  };
}

function rowToThread(row: Record<string, unknown>): DirectThread {
  return {
    id: row.id as string,
    connectionId: row.connection_id as string,
    userAId: row.user_a_id as string,
    userBId: row.user_b_id as string,
    familyAId: row.family_a_id as string,
    familyBId: row.family_b_id as string,
    createdAt: row.created_at as string,
    lastMessageAt: (row.last_message_at as string | null) ?? null,
    userALastReadAt: (row.user_a_last_read_at as string | null) ?? null,
    userBLastReadAt: (row.user_b_last_read_at as string | null) ?? null
  };
}

function rowToMessage(row: Record<string, unknown>): DirectMessage {
  return {
    id: row.id as string,
    threadId: row.thread_id as string,
    senderUserId: row.sender_user_id as string,
    body: row.body as string,
    createdAt: row.created_at as string,
    editedAt: (row.edited_at as string | null) ?? null,
    deletedAt: (row.deleted_at as string | null) ?? null
  };
}

// Canonicalize a (user_a_id, user_b_id) pair so the lower UUID is always A.
export function canonicalizePair(a: string, b: string): { userA: string; userB: string } {
  return a < b ? { userA: a, userB: b } : { userA: b, userB: a };
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

export type DiscoveryFilter = {
  neighbourhoods?: Neighbourhood[];
  interests?: VenueCategory[];
  childAgeBands?: number[];
  excludeFamilyIds?: string[];
  limit?: number;
};

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

// ---------------------------------------------------------------------------
// Connections
// ---------------------------------------------------------------------------

const CONNECTION_COLUMNS =
  "id,requester_family_id,addressee_family_id,status,intro_message,requested_by_user_id,responded_by_user_id,responded_at,created_at";

export async function loadConnectionsForFamily(
  client: SupabaseClient,
  familyId: string
): Promise<FamilyConnection[]> {
  const { data, error } = await client
    .from("family_connections")
    .select(CONNECTION_COLUMNS)
    .or(`requester_family_id.eq.${familyId},addressee_family_id.eq.${familyId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(rowToConnection);
}

// The schema enforces at most one *active* (pending/accepted/blocked) row per
// unordered family pair, so this filter combined with .maybeSingle() returns
// either that active row or null. Declined/cancelled rows are ignored.
const ACTIVE_CONNECTION_STATUSES = ["pending", "accepted", "blocked"] as const;

export async function loadConnectionBetween(
  client: SupabaseClient,
  familyA: string,
  familyB: string
): Promise<FamilyConnection | null> {
  const { data, error } = await client
    .from("family_connections")
    .select(CONNECTION_COLUMNS)
    .or(
      `and(requester_family_id.eq.${familyA},addressee_family_id.eq.${familyB}),and(requester_family_id.eq.${familyB},addressee_family_id.eq.${familyA})`
    )
    .in("status", ACTIVE_CONNECTION_STATUSES as unknown as string[])
    .maybeSingle();
  if (error) throw error;
  return data ? rowToConnection(data as Record<string, unknown>) : null;
}

export async function sendConnectionRequest(
  client: SupabaseClient,
  input: {
    requesterFamilyId: string;
    addresseeFamilyId: string;
    requestedByUserId: string;
    introMessage?: string;
  }
): Promise<FamilyConnection> {
  const { data, error } = await client
    .from("family_connections")
    .insert({
      requester_family_id: input.requesterFamilyId,
      addressee_family_id: input.addresseeFamilyId,
      requested_by_user_id: input.requestedByUserId,
      intro_message: input.introMessage?.trim() || null,
      status: "pending"
    })
    .select(CONNECTION_COLUMNS)
    .single();
  if (error) throw error;
  return rowToConnection(data as Record<string, unknown>);
}

export async function respondToConnection(
  client: SupabaseClient,
  connectionId: string,
  decision: "accepted" | "declined" | "blocked",
  responderUserId: string
): Promise<FamilyConnection> {
  const { data, error } = await client
    .from("family_connections")
    .update({
      status: decision,
      responded_by_user_id: responderUserId,
      responded_at: new Date().toISOString()
    })
    .eq("id", connectionId)
    .select(CONNECTION_COLUMNS)
    .single();
  if (error) throw error;
  return rowToConnection(data as Record<string, unknown>);
}

export async function cancelOutgoingConnection(
  client: SupabaseClient,
  connectionId: string
): Promise<void> {
  const { error } = await client
    .from("family_connections")
    .update({ status: "cancelled" })
    .eq("id", connectionId)
    .eq("status", "pending");
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Threads + messages
// ---------------------------------------------------------------------------

const THREAD_COLUMNS =
  "id,connection_id,user_a_id,user_b_id,family_a_id,family_b_id,created_at,last_message_at,user_a_last_read_at,user_b_last_read_at";
const MESSAGE_COLUMNS =
  "id,thread_id,sender_user_id,body,created_at,edited_at,deleted_at";

export async function loadThreadsForUser(
  client: SupabaseClient,
  userId: string
): Promise<DirectThread[]> {
  const { data, error } = await client
    .from("direct_threads")
    .select(THREAD_COLUMNS)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(rowToThread);
}

export async function getOrCreateThread(
  client: SupabaseClient,
  input: {
    connectionId: string;
    me: { userId: string; familyId: string };
    them: { userId: string; familyId: string };
  }
): Promise<DirectThread> {
  const { userA, userB } = canonicalizePair(input.me.userId, input.them.userId);
  const familyA = userA === input.me.userId ? input.me.familyId : input.them.familyId;
  const familyB = userB === input.me.userId ? input.me.familyId : input.them.familyId;

  // Try to find an existing thread.
  const { data: existing, error: findError } = await client
    .from("direct_threads")
    .select(THREAD_COLUMNS)
    .eq("connection_id", input.connectionId)
    .eq("user_a_id", userA)
    .eq("user_b_id", userB)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return rowToThread(existing as Record<string, unknown>);

  // Otherwise create one.
  const { data, error } = await client
    .from("direct_threads")
    .insert({
      connection_id: input.connectionId,
      user_a_id: userA,
      user_b_id: userB,
      family_a_id: familyA,
      family_b_id: familyB
    })
    .select(THREAD_COLUMNS)
    .single();
  if (error) throw error;
  return rowToThread(data as Record<string, unknown>);
}

export async function loadMessages(
  client: SupabaseClient,
  threadId: string,
  options: { limit?: number; before?: string } = {}
): Promise<DirectMessage[]> {
  let query = client
    .from("direct_messages")
    .select(MESSAGE_COLUMNS)
    .eq("thread_id", threadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 50);
  if (options.before) {
    query = query.lt("created_at", options.before);
  }
  const { data, error } = await query;
  if (error) throw error;
  // Return in chronological order (oldest first) for display.
  return (data as Record<string, unknown>[]).map(rowToMessage).reverse();
}

export async function sendMessage(
  client: SupabaseClient,
  input: { threadId: string; senderUserId: string; body: string }
): Promise<DirectMessage> {
  const { data, error } = await client
    .from("direct_messages")
    .insert({
      thread_id: input.threadId,
      sender_user_id: input.senderUserId,
      body: input.body
    })
    .select(MESSAGE_COLUMNS)
    .single();
  if (error) throw error;
  return rowToMessage(data as Record<string, unknown>);
}

// Marks the calling user's side of the thread as read. Routed through the
// SECURITY DEFINER RPC so we don't need a column-restricted UPDATE policy on
// direct_threads — the function picks the correct side from auth.uid().
export async function markThreadRead(
  client: SupabaseClient,
  threadId: string
): Promise<void> {
  const { error } = await client.rpc("mark_thread_read", {
    target_thread_id: threadId
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Block + report
// ---------------------------------------------------------------------------

export async function blockFamily(
  client: SupabaseClient,
  input: {
    familyId: string;
    blockedFamilyId: string;
    blockedByUserId: string;
    reason?: string;
  }
): Promise<void> {
  const { error } = await client.from("family_blocks").insert({
    family_id: input.familyId,
    blocked_family_id: input.blockedFamilyId,
    blocked_by_user_id: input.blockedByUserId,
    reason: input.reason ?? null
  });
  if (error) throw error;
}

export async function unblockFamily(
  client: SupabaseClient,
  familyId: string,
  blockedFamilyId: string
): Promise<void> {
  const { error } = await client
    .from("family_blocks")
    .delete()
    .eq("family_id", familyId)
    .eq("blocked_family_id", blockedFamilyId);
  if (error) throw error;
}

export async function reportFamily(
  client: SupabaseClient,
  input: {
    reporterFamilyId: string;
    reportedFamilyId: string;
    reason: "harassment" | "spam" | "inappropriate" | "safety" | "other";
    details?: string;
  }
): Promise<void> {
  const { error } = await client.from("family_reports").insert({
    reporter_family_id: input.reporterFamilyId,
    reported_family_id: input.reportedFamilyId,
    reason: input.reason,
    details: input.details ?? null
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Rate limits (client-side optimistic check; the DB is the source of truth via
// dedicated edge function or a future server route).
// ---------------------------------------------------------------------------

export async function countOutgoingRequestsToday(
  client: SupabaseClient,
  familyId: string
): Promise<number> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count, error } = await client
    .from("family_connections")
    .select("*", { head: true, count: "exact" })
    .eq("requester_family_id", familyId)
    .gte("created_at", since.toISOString());
  if (error) throw error;
  return count ?? 0;
}

export const MAX_REQUESTS_PER_DAY = 10;
