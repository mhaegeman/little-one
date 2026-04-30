import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FamilyConnectionStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "blocked"
  | "cancelled";

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CONNECTION_COLUMNS =
  "id,requester_family_id,addressee_family_id,status,intro_message,requested_by_user_id,responded_by_user_id,responded_at,created_at";

// The schema enforces at most one *active* (pending/accepted/blocked) row per
// unordered family pair, so this filter combined with .maybeSingle() returns
// either that active row or null. Declined/cancelled rows are ignored.
const ACTIVE_CONNECTION_STATUSES = ["pending", "accepted", "blocked"] as const;

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

// Canonicalize a (user_a_id, user_b_id) pair so the lower UUID is always A.
export function canonicalizePair(a: string, b: string): { userA: string; userB: string } {
  return a < b ? { userA: a, userB: b } : { userA: b, userB: a };
}

// ---------------------------------------------------------------------------
// Connections
// ---------------------------------------------------------------------------

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
