#!/usr/bin/env node
// One-shot enrichment: fetch real photos from Wikipedia / Wikimedia Commons for
// known venues and emit lib/data/venuePhotos.generated.json.
//
// Run from a machine with internet access:
//
//   npm run fetch:venue-photos
//
// Then commit the regenerated JSON. lib/data/venues.ts consumes it as a
// per-venue override; venues without a Wikimedia match fall back to the
// existing Unsplash category banks.
//
// We hand-curate venue id -> Wikipedia article mapping because fuzzy lookup
// is unreliable for Danish venue names. Add more entries as you find them.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_PATH = path.resolve(__dirname, "../lib/data/venuePhotos.generated.json");

// venue id -> ordered list of [{ wiki, title }]; first attempt that returns a
// usable lead image wins.
const VENUE_TO_WIKIPEDIA = {
  "tivoli-gardens": [
    { wiki: "en", title: "Tivoli Gardens" },
    { wiki: "da", title: "Tivoli (forlystelsespark)" }
  ],
  "copenhagen-zoo": [
    { wiki: "en", title: "Copenhagen Zoo" },
    { wiki: "da", title: "Københavns Zoo" }
  ],
  "den-blaa-planet": [
    { wiki: "en", title: "The Blue Planet (aquarium)" },
    { wiki: "da", title: "Den Blå Planet" }
  ],
  "louisiana-museum": [{ wiki: "en", title: "Louisiana Museum of Modern Art" }],
  bakken: [
    { wiki: "en", title: "Bakken" },
    { wiki: "da", title: "Bakken" }
  ],
  dyrehaven: [
    { wiki: "en", title: "Jægersborg Dyrehave" },
    { wiki: "da", title: "Jægersborg Dyrehave" }
  ],
  "frederiksberg-have": [
    { wiki: "en", title: "Frederiksberg Gardens" },
    { wiki: "da", title: "Frederiksberg Have" }
  ],
  soendermarken: [
    { wiki: "en", title: "Søndermarken" },
    { wiki: "da", title: "Søndermarken" }
  ],
  "botanisk-have": [
    { wiki: "en", title: "University of Copenhagen Botanical Garden" },
    { wiki: "da", title: "Botanisk Have (København)" }
  ],
  "assistens-kirkegaard": [
    { wiki: "en", title: "Assistens Cemetery, Copenhagen" },
    { wiki: "da", title: "Assistens Kirkegård (Nørrebro)" }
  ],
  oerstedsparken: [
    { wiki: "en", title: "Ørstedsparken" },
    { wiki: "da", title: "Ørstedsparken" }
  ],
  vikingeskibsmuseet: [
    { wiki: "en", title: "Viking Ship Museum (Roskilde)" },
    { wiki: "da", title: "Vikingeskibsmuseet i Roskilde" }
  ],
  frilandsmuseet: [
    { wiki: "en", title: "Frilandsmuseet, Lyngby" },
    { wiki: "da", title: "Frilandsmuseet" }
  ],
  "arken-museum": [
    { wiki: "en", title: "ARKEN Museum of Modern Art" },
    { wiki: "da", title: "Arken (museum)" }
  ],
  experimentarium: [
    { wiki: "en", title: "Experimentarium" },
    { wiki: "da", title: "Experimentarium" }
  ],
  "amager-strandpark": [
    { wiki: "en", title: "Amager Strandpark" },
    { wiki: "da", title: "Amager Strandpark" }
  ],
  "bellevue-strand": [
    { wiki: "en", title: "Bellevue Beach, Klampenborg" },
    { wiki: "da", title: "Bellevue Strand" }
  ],
  "ishoj-strandpark": [{ wiki: "da", title: "Ishøj Strand" }],
  "havnebadet-islands-brygge": [
    { wiki: "en", title: "Islands Brygge Harbour Bath" },
    { wiki: "da", title: "Islands Brygge" }
  ],
  "utterslev-mose": [{ wiki: "da", title: "Utterslev Mose" }],
  superkilen: [
    { wiki: "en", title: "Superkilen" },
    { wiki: "da", title: "Superkilen" }
  ],
  "kongens-have-legeplads": [
    { wiki: "en", title: "Rosenborg Castle Gardens" },
    { wiki: "da", title: "Kongens Have" }
  ],
  "copenhagen-contemporary": [{ wiki: "en", title: "Copenhagen Contemporary" }],
  "kongelige-teater-de-smaa-synger": [
    { wiki: "en", title: "Royal Danish Theatre" },
    { wiki: "da", title: "Det Kongelige Teater" }
  ],
  cinemateket: [
    { wiki: "en", title: "Danish Film Institute" },
    { wiki: "da", title: "Cinemateket" }
  ],
  "dgi-byen-svoemning": [
    { wiki: "en", title: "DGI-byen" },
    { wiki: "da", title: "DGI-byen" }
  ],
  absalon: [
    { wiki: "en", title: "Absalon (Copenhagen building)" },
    { wiki: "da", title: "Folkehuset Absalon" }
  ],
  "marionet-teatret": [{ wiki: "da", title: "Marionetteatret i Kongens Have" }],
  "boernenes-museum": [
    { wiki: "en", title: "National Museum of Denmark" },
    { wiki: "da", title: "Nationalmuseet" }
  ],
  "hovedbiblioteket-laes": [{ wiki: "da", title: "Københavns Hovedbibliotek" }],
  "frederiksberg-hovedbibliotek": [{ wiki: "da", title: "Frederiksberg Hovedbibliotek" }],
  taarnlegepladsen: [{ wiki: "da", title: "Fælledparken" }],
  trafiklegepladsen: [{ wiki: "da", title: "Fælledparken" }],
  "bavnehoej-friluftsbad": [{ wiki: "da", title: "Bavnehøj Friluftsbad" }],
  sydhavnstippen: [{ wiki: "da", title: "Sydhavnstippen" }],
  "konditaget-luders": [
    { wiki: "da", title: "Konditaget Lüders" },
    { wiki: "en", title: "Konditaget Lüders" }
  ]
};

const USER_AGENT =
  "little-one-venue-photos/1.0 (https://github.com/mhaegeman/little-one)";

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

const stripHtml = (s) =>
  typeof s === "string" ? s.replace(/<[^>]+>/g, "").trim() : undefined;

// Skip generic logos / coats of arms / locator maps that often surface as the
// page image but aren't useful as a hero photo.
function isUsableImage(url) {
  if (!url) return false;
  const u = url.toLowerCase();
  if (/(logo|coat[_ -]?of[_ -]?arms|locator|map[_ -]?of)/.test(u)) return false;
  if (/(flag|icon|svg)$/.test(u)) return false;
  return true;
}

async function fetchSummary(wiki, title) {
  const url = `https://${wiki}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title.replace(/ /g, "_")
  )}`;
  try {
    return await fetchJson(url);
  } catch {
    return null;
  }
}

async function fetchPageFileTitles(wiki, title) {
  const url = `https://${wiki}.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=images&imlimit=20&titles=${encodeURIComponent(
    title.replace(/ /g, "_")
  )}`;
  try {
    const data = await fetchJson(url);
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0];
    return (page?.images ?? [])
      .map((img) => img.title)
      .filter((t) => /\.(jpe?g|png|webp)$/i.test(t));
  } catch {
    return [];
  }
}

// Resolve a "File:..." title via the Commons API to get a stable URL plus
// licensing/author metadata for proper attribution.
async function fetchCommonsFile(fileTitle) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1600&titles=${encodeURIComponent(
    fileTitle
  )}`;
  try {
    const data = await fetchJson(url);
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0];
    const info = page?.imageinfo?.[0];
    if (!info) return null;
    const ext = info.extmetadata ?? {};
    const directUrl = info.thumburl ?? info.url;
    if (!isUsableImage(directUrl)) return null;
    return {
      url: directUrl,
      credit: {
        source: "wikimedia",
        author: stripHtml(ext.Artist?.value),
        license: ext.LicenseShortName?.value,
        licenseUrl: ext.LicenseUrl?.value,
        sourceUrl: info.descriptionshorturl ?? info.descriptionurl
      }
    };
  } catch {
    return null;
  }
}

async function enrichVenue(venueId, attempts) {
  for (const attempt of attempts) {
    const summary = await fetchSummary(attempt.wiki, attempt.title);
    if (!summary) continue;
    const lead = summary.originalimage?.source ?? summary.thumbnail?.source;
    if (!isUsableImage(lead)) continue;

    const photos = [
      {
        url: lead,
        credit: {
          source: "wikimedia",
          // The summary endpoint doesn't expose the file title, so we credit
          // the article instead. Fully detailed credits come from gallery
          // entries below, which are resolved via Commons.
          sourceUrl: summary.content_urls?.desktop?.page,
          license: "See linked Wikipedia article"
        }
      }
    ];

    const fileTitles = await fetchPageFileTitles(attempt.wiki, attempt.title);
    for (const t of fileTitles) {
      if (photos.length >= 4) break;
      if (/(flag|coat[_ -]?of[_ -]?arms|icon|logo|locator|map[_ -]?of)/i.test(t))
        continue;
      const f = await fetchCommonsFile(t);
      if (f && !photos.some((p) => p.url === f.url)) photos.push(f);
    }

    return {
      articleUrl: summary.content_urls?.desktop?.page,
      photos
    };
  }
  return null;
}

async function main() {
  const ids = Object.keys(VENUE_TO_WIKIPEDIA);
  const results = {};
  const failures = [];
  console.log(`Resolving ${ids.length} venues...`);
  for (const id of ids) {
    process.stdout.write(`  ${id} ... `);
    try {
      const enriched = await enrichVenue(id, VENUE_TO_WIKIPEDIA[id]);
      if (enriched && enriched.photos.length > 0) {
        results[id] = enriched;
        console.log(`ok (${enriched.photos.length} photos)`);
      } else {
        failures.push(id);
        console.log("no image");
      }
    } catch (err) {
      failures.push(id);
      console.log(`error: ${err.message}`);
    }
  }
  await writeFile(OUT_PATH, JSON.stringify(results, null, 2) + "\n", "utf8");
  console.log(
    `\nWrote ${Object.keys(results).length} entries to ${path.relative(
      process.cwd(),
      OUT_PATH
    )}`
  );
  if (failures.length) {
    console.log(`Failures (${failures.length}): ${failures.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
