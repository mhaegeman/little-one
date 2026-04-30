"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/db/supabase/server";

const VENUES_FILE = path.join(process.cwd(), "lib", "data", "venues.ts");

const updateSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z
          .string()
          .min(1)
          .regex(/^[a-z0-9-]+$/, "Invalid venue id"),
        lat: z.number().gte(-90).lte(90),
        lng: z.number().gte(-180).lte(180)
      })
    )
    .min(1)
});

export type SaveResult =
  | { ok: true; updated: string[] }
  | { ok: false; error: string };

// Replace the `lat:` and `lng:` lines for a single venue block, identified by
// `id: "<venueId>"`. Looks ahead within a small window so we don't accidentally
// touch a different venue.
function patchVenueCoords(source: string, venueId: string, lat: number, lng: number) {
  const idMarker = `id: "${venueId}",`;
  const idIndex = source.indexOf(idMarker);
  if (idIndex === -1) {
    return { source, changed: false };
  }

  // Search inside a generous window (next ~600 chars covers any venue block).
  const windowEnd = Math.min(source.length, idIndex + 800);
  const slice = source.slice(idIndex, windowEnd);

  const latRegex = /lat:\s*-?\d+(?:\.\d+)?/;
  const lngRegex = /lng:\s*-?\d+(?:\.\d+)?/;

  const latMatch = latRegex.exec(slice);
  const lngMatch = lngRegex.exec(slice);
  if (!latMatch || !lngMatch) {
    return { source, changed: false };
  }

  const fmt = (n: number) => Number(n.toFixed(6)).toString();

  const latStart = idIndex + latMatch.index;
  const latEnd = latStart + latMatch[0].length;
  let next = source.slice(0, latStart) + `lat: ${fmt(lat)}` + source.slice(latEnd);

  // After the lat replacement, the lng position shifts by the length delta.
  const delta = next.length - source.length;
  const lngStart = idIndex + lngMatch.index + delta;
  const lngEnd = lngStart + lngMatch[0].length;
  next = next.slice(0, lngStart) + `lng: ${fmt(lng)}` + next.slice(lngEnd);

  return { source: next, changed: true };
}

export async function saveVenueCoords(
  formData: { updates: Array<{ id: string; lat: number; lng: number }> }
): Promise<SaveResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: "Disabled in production builds." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Auth is not configured." };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) {
    return { ok: false, error: "Not authorized." };
  }

  const parsed = updateSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let source: string;
  try {
    source = await fs.readFile(VENUES_FILE, "utf8");
  } catch (err) {
    return { ok: false, error: `Could not read venues file: ${(err as Error).message}` };
  }

  const updated: string[] = [];
  for (const update of parsed.data.updates) {
    const result = patchVenueCoords(source, update.id, update.lat, update.lng);
    if (result.changed) {
      source = result.source;
      updated.push(update.id);
    }
  }

  if (updated.length === 0) {
    return { ok: false, error: "No matching venues were found in the file." };
  }

  try {
    await fs.writeFile(VENUES_FILE, source, "utf8");
  } catch (err) {
    return { ok: false, error: `Could not write venues file: ${(err as Error).message}` };
  }

  return { ok: true, updated };
}
