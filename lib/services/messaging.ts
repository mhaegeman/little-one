import type { SupabaseClient } from "@supabase/supabase-js";
import { canonicalizePair } from "@/lib/services/connections";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const THREAD_COLUMNS =
  "id,connection_id,user_a_id,user_b_id,family_a_id,family_b_id,created_at,last_message_at,user_a_last_read_at,user_b_last_read_at";
const MESSAGE_COLUMNS =
  "id,thread_id,sender_user_id,body,created_at,edited_at,deleted_at";

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

// ---------------------------------------------------------------------------
// Threads + messages
// ---------------------------------------------------------------------------

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
