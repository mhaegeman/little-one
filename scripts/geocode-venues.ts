// Bulk-geocode all venues against Nominatim (OpenStreetMap) and report — or
// apply — coordinate updates so each pin lands at the address OSM resolves.
//
// Auto-apply rule: a Nominatim match qualifies when its OSM class/type is a
// precise feature (place/house, building/*, amenity/*, tourism/*, etc.) AND
// the delta from the current coord is within --threshold (default 10 km, a
// sanity cap — most real moves are < 1 km but the original manual coords are
// sometimes kilometres off). Coarse matches (highway/*, place/suburb,
// information/board, …) are flagged for manual review in /admin/map-tool.
//
//   npm run geocode:venues                       # dry-run
//   npm run geocode:venues -- --apply            # write qualified updates
//   npm run geocode:venues -- --threshold=2000   # tighter sanity cap (metres)
//   npm run geocode:venues -- --only=tivoli-gardens,bakken
//
// Nominatim usage policy: max 1 req/sec, identifying User-Agent required.
// https://operations.osmfoundation.org/policies/nominatim/

import { promises as fs } from "node:fs";
import path from "node:path";
import { venues } from "@/lib/data/venues";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "lille-liv-geocode-script/1.0 (https://github.com/mhaegeman/little-one)";
const RATE_LIMIT_MS = 1100;
const VENUES_FILE = path.join(process.cwd(), "lib", "data", "venues.ts");

type Args = {
  apply: boolean;
  threshold: number;
  only: Set<string> | null;
};

function parseArgs(): Args {
  const argv: string[] = process.argv.slice(2);
  const apply = argv.includes("--apply");
  const thresholdArg = argv.find((a: string) => a.startsWith("--threshold="));
  const threshold = thresholdArg ? Number(thresholdArg.split("=")[1]) : 10_000;
  const onlyArg = argv.find((a: string) => a.startsWith("--only="));
  const only: Set<string> | null = onlyArg
    ? new Set<string>(
        onlyArg
          .split("=")[1]
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      )
    : null;
  if (Number.isNaN(threshold) || threshold <= 0) {
    throw new Error(`Invalid --threshold value: ${thresholdArg}`);
  }
  return { apply, threshold, only };
}

type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
  osmType: string;
  classType: string;
  importance: number;
};

// Danish addresses are typically "Street N, 1234 City". Split into parts so we
// can hand Nominatim a structured query, which is far more precise than free
// text for street-level matches.
function parseDanishAddress(address: string): {
  street?: string;
  postalcode?: string;
  city?: string;
} {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return {};
  const street = parts[0];
  const last = parts[parts.length - 1];
  const match = last.match(/^(\d{4})\s+(.+)$/);
  if (match) return { street, postalcode: match[1], city: match[2] };
  return { street, city: last };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

type NominatimRow = {
  lat: string;
  lon: string;
  display_name: string;
  osm_type?: string;
  class?: string;
  type?: string;
  importance?: number;
};

async function nominatimRequest(url: URL): Promise<NominatimRow[]> {
  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" }
  });
  if (!response.ok) {
    throw new Error(`Nominatim ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data as NominatimRow[];
}

async function geocode(address: string): Promise<GeocodeResult | null> {
  const parsed = parseDanishAddress(address);

  // 1) Structured query — best precision when the address parses cleanly.
  if (parsed.street) {
    const structured = new URL(NOMINATIM_URL);
    structured.searchParams.set("street", parsed.street);
    if (parsed.postalcode) structured.searchParams.set("postalcode", parsed.postalcode);
    if (parsed.city) structured.searchParams.set("city", parsed.city);
    structured.searchParams.set("country", "Denmark");
    structured.searchParams.set("format", "json");
    structured.searchParams.set("limit", "1");
    structured.searchParams.set("addressdetails", "0");
    const rows = await nominatimRequest(structured);
    if (rows.length > 0) return toResult(rows[0]);
    await sleep(RATE_LIMIT_MS);
  }

  // 2) Free-text fallback — covers parks/landmarks where the "street" is the
  // venue name (Fælledparken, Amager Strand, etc.).
  const free = new URL(NOMINATIM_URL);
  const q = address.toLowerCase().includes("danmark") ? address : `${address}, Danmark`;
  free.searchParams.set("q", q);
  free.searchParams.set("format", "json");
  free.searchParams.set("limit", "1");
  free.searchParams.set("addressdetails", "0");
  const rows = await nominatimRequest(free);
  if (rows.length > 0) return toResult(rows[0]);
  return null;
}

function toResult(row: NominatimRow): GeocodeResult {
  return {
    lat: Number(row.lat),
    lng: Number(row.lon),
    displayName: row.display_name,
    osmType: row.osm_type ?? "",
    classType: `${row.class ?? "?"}/${row.type ?? "?"}`,
    importance: Number(row.importance ?? 0)
  };
}

// Whether a Nominatim match is precise enough to auto-apply. Coarse types
// (street centroids, neighbourhood polygons, signposts) are flagged so a
// human can place the pin in /admin/map-tool instead.
function isApplyable(result: GeocodeResult): boolean {
  const [cls, typ] = result.classType.split("/");
  if (cls === "place" && typ === "house") return true;
  if (["building", "amenity", "tourism", "shop", "office", "historic", "craft"].includes(cls)) {
    return true;
  }
  if (cls === "leisure" && !["park", "garden", "nature_reserve", "common"].includes(typ)) {
    return true;
  }
  return false;
}

// Same patch logic as app/(app)/admin/map-tool/actions.ts so on-disk formatting
// stays byte-identical to what the admin tool produces.
function patchVenueCoords(source: string, venueId: string, lat: number, lng: number) {
  const idMarker = `id: "${venueId}",`;
  const idIndex = source.indexOf(idMarker);
  if (idIndex === -1) return { source, changed: false };

  const windowEnd = Math.min(source.length, idIndex + 800);
  const slice = source.slice(idIndex, windowEnd);

  const latMatch = /lat:\s*-?\d+(?:\.\d+)?/.exec(slice);
  const lngMatch = /lng:\s*-?\d+(?:\.\d+)?/.exec(slice);
  if (!latMatch || !lngMatch) return { source, changed: false };

  const fmt = (n: number) => Number(n.toFixed(6)).toString();

  const latStart = idIndex + latMatch.index;
  const latEnd = latStart + latMatch[0].length;
  let next = source.slice(0, latStart) + `lat: ${fmt(lat)}` + source.slice(latEnd);

  const delta = next.length - source.length;
  const lngStart = idIndex + lngMatch.index + delta;
  const lngEnd = lngStart + lngMatch[0].length;
  next = next.slice(0, lngStart) + `lng: ${fmt(lng)}` + next.slice(lngEnd);

  return { source: next, changed: true };
}

type Row = {
  id: string;
  name: string;
  address: string;
  current: { lat: number; lng: number };
  result: GeocodeResult | null;
  delta: number | null;
  status: "aligned" | "update" | "flagged" | "missing" | "error" | "skipped";
  reason?: string;
};

function fmtDelta(meters: number | null) {
  if (meters === null) return "    ?";
  if (meters < 1) return "  <1m";
  if (meters < 10) return ` ${meters.toFixed(1)}m`;
  if (meters < 1000) return `${Math.round(meters)}m`.padStart(5, " ");
  return `${(meters / 1000).toFixed(2)}km`;
}

async function main() {
  const args = parseArgs();

  const targets = args.only ? venues.filter((v) => args.only!.has(v.id)) : venues;
  if (targets.length === 0) {
    console.error("No venues match --only filter.");
    process.exit(1);
  }

  console.log(`Geocoding ${targets.length} venue(s) against Nominatim`);
  console.log(`Mode: ${args.apply ? "APPLY" : "dry-run"} | threshold: ${args.threshold} m`);
  console.log("");

  const rows: Row[] = [];

  for (let i = 0; i < targets.length; i++) {
    const venue = targets[i];
    const prefix = `[${String(i + 1).padStart(2, " ")}/${targets.length}]`;
    try {
      const result = await geocode(venue.address);
      if (!result) {
        const row: Row = {
          id: venue.id,
          name: venue.name,
          address: venue.address,
          current: { lat: venue.lat, lng: venue.lng },
          result: null,
          delta: null,
          status: "missing"
        };
        rows.push(row);
        console.log(`${prefix} ✗ ${venue.id} — no Nominatim match for "${venue.address}"`);
      } else {
        const delta = haversineMeters(venue.lat, venue.lng, result.lat, result.lng);
        const precise = isApplyable(result);
        const withinCap = delta <= args.threshold;
        let status: Row["status"];
        let symbol: string;
        if (delta < 1) {
          status = "aligned";
          symbol = "=";
        } else if (precise && withinCap) {
          status = "update";
          symbol = "→";
        } else {
          status = "flagged";
          symbol = "!";
        }
        rows.push({
          id: venue.id,
          name: venue.name,
          address: venue.address,
          current: { lat: venue.lat, lng: venue.lng },
          result,
          delta,
          status,
          reason: !precise
            ? `coarse match (${result.classType})`
            : !withinCap
              ? `delta ${Math.round(delta)}m > cap ${args.threshold}m`
              : undefined
        });
        console.log(
          `${prefix} ${symbol} ${venue.id.padEnd(28)} Δ${fmtDelta(delta)}  [${result.classType}]  ${venue.name}`
        );
      }
    } catch (err) {
      const reason = (err as Error).message;
      rows.push({
        id: venue.id,
        name: venue.name,
        address: venue.address,
        current: { lat: venue.lat, lng: venue.lng },
        result: null,
        delta: null,
        status: "error",
        reason
      });
      console.log(`${prefix} ✗ ${venue.id} — error: ${reason}`);
    }
    await sleep(RATE_LIMIT_MS);
  }

  const aligned = rows.filter((r) => r.status === "aligned");
  const updates = rows.filter((r) => r.status === "update");
  const flagged = rows.filter((r) => r.status === "flagged");
  const missing = rows.filter((r) => r.status === "missing");
  const errors = rows.filter((r) => r.status === "error");

  console.log("\n=== Summary ===");
  console.log(`Already aligned (Δ < 1m):    ${aligned.length}`);
  console.log(`Eligible to apply:           ${updates.length}`);
  console.log(`Flagged (coarse / over cap): ${flagged.length}`);
  console.log(`No Nominatim match:          ${missing.length}`);
  console.log(`Errors:                      ${errors.length}`);

  if (flagged.length > 0) {
    console.log(`\nFlagged venues — review manually in /admin/map-tool:`);
    for (const r of flagged) {
      console.log(`  • ${r.id}  Δ${fmtDelta(r.delta)}  ${r.name}  — ${r.reason ?? ""}`);
      console.log(`      addr:      ${r.address}`);
      console.log(`      current:   ${r.current.lat}, ${r.current.lng}`);
      if (r.result) {
        console.log(`      nominatim: ${r.result.lat}, ${r.result.lng}  [${r.result.classType}]`);
        console.log(`      OSM says:  ${r.result.displayName}`);
      }
    }
  }
  if (missing.length > 0) {
    console.log(`\nNo Nominatim match — review manually:`);
    for (const r of missing) {
      console.log(`  • ${r.id}  ${r.address}`);
    }
  }
  if (errors.length > 0) {
    console.log(`\nErrors:`);
    for (const r of errors) {
      console.log(`  • ${r.id}  ${r.reason}`);
    }
  }

  if (!args.apply) {
    if (updates.length > 0) {
      console.log(
        `\n(Dry-run) Re-run with --apply to write ${updates.length} update(s) to lib/data/venues.ts.`
      );
    } else {
      console.log(`\n(Dry-run) Nothing to apply.`);
    }
    return;
  }

  if (updates.length === 0) {
    console.log(`\nNothing to apply.`);
    return;
  }

  let source = await fs.readFile(VENUES_FILE, "utf8");
  let applied = 0;
  const failed: string[] = [];
  for (const r of updates) {
    if (!r.result) continue;
    const out = patchVenueCoords(source, r.id, r.result.lat, r.result.lng);
    if (out.changed) {
      source = out.source;
      applied++;
    } else {
      failed.push(r.id);
    }
  }
  await fs.writeFile(VENUES_FILE, source, "utf8");
  console.log(
    `\n✓ Wrote ${applied} update(s) to ${path.relative(process.cwd(), VENUES_FILE)}.`
  );
  if (failed.length > 0) {
    console.log(`✗ Could not patch ${failed.length} venue(s): ${failed.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
