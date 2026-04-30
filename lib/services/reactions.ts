import type { SupabaseClient } from "@supabase/supabase-js";
import type { Reaction, ReactionKind, TimelineItemType } from "@/lib/types";

export const REACTION_KINDS: ReactionKind[] = ["heart", "clap", "smile", "star"];

export function reactionKey(entryType: TimelineItemType, entryId: string) {
  return `${entryType}:${entryId}`;
}

type ReactionRow = {
  id: string;
  entry_type: "milestone" | "activity";
  entry_id: string;
  user_id: string;
  kind: ReactionKind;
  display_name: string | null;
  created_at: string;
};

export async function loadReactions(
  supabase: SupabaseClient,
  childId: string
): Promise<Map<string, Reaction[]>> {
  const { data, error } = await supabase
    .from("journal_reactions")
    .select("id,entry_type,entry_id,user_id,kind,display_name,created_at")
    .eq("child_id", childId);

  if (error || !data) return new Map();

  const grouped = new Map<string, Reaction[]>();
  for (const row of data as ReactionRow[]) {
    const key = reactionKey(row.entry_type, row.entry_id);
    const list = grouped.get(key) ?? [];
    list.push({
      id: row.id,
      kind: row.kind,
      userId: row.user_id,
      displayName: row.display_name,
      createdAt: row.created_at
    });
    grouped.set(key, list);
  }
  return grouped;
}

export async function addReaction(
  supabase: SupabaseClient,
  args: {
    childId: string;
    entryType: "milestone" | "activity";
    entryId: string;
    kind: ReactionKind;
    userId: string;
    displayName: string | null;
  }
): Promise<Reaction | null> {
  const { data, error } = await supabase
    .from("journal_reactions")
    .insert({
      child_id: args.childId,
      entry_type: args.entryType,
      entry_id: args.entryId,
      user_id: args.userId,
      kind: args.kind,
      display_name: args.displayName
    })
    .select("id,user_id,kind,display_name,created_at")
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    kind: data.kind,
    userId: data.user_id,
    displayName: data.display_name,
    createdAt: data.created_at
  };
}

export async function removeReaction(
  supabase: SupabaseClient,
  reactionId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("journal_reactions")
    .delete()
    .eq("id", reactionId);
  return !error;
}

export function initialsFromName(name: string | null | undefined): string {
  if (!name) return "·";
  const trimmed = name.trim();
  if (!trimmed) return "·";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
