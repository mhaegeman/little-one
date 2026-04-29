"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { saveVenueCoords, type SaveResult } from "@/app/admin/map-tool/actions";
import { categoryBadgeVariant } from "@/lib/data/taxonomy";
import { Badge } from "@/components/ui/Badge";
import type { Venue, VenueCategory } from "@/lib/types";
import { cn, googleMapsUrl, haversineKm } from "@/lib/utils";

type MapEditToolProps = {
  venues: Venue[];
  saveEnabled: boolean;
};

type Edit = { lat: number; lng: number };
type EditMap = Record<string, Edit>;

const COPENHAGEN: [number, number] = [12.5683, 55.6761];
const STORAGE_KEY = "little-one:map-tool:edits";

const mapStyle = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19
    }
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }]
};

export function MapEditTool({ venues, saveEnabled }: MapEditToolProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const geocodeMarkerRef = useRef<Marker | null>(null);
  const editsRef = useRef<EditMap>({});

  const [ready, setReady] = useState(false);
  const [edits, setEdits] = useState<EditMap>({});
  const [selectedId, setSelectedId] = useState<string | undefined>(venues[0]?.id);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VenueCategory | "all">("all");
  const [onlyEdited, setOnlyEdited] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<"idle" | "loading" | "error">("idle");
  const [geocodeResult, setGeocodeResult] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Keep a ref in sync with state so map handlers always see the latest edits.
  useEffect(() => {
    editsRef.current = edits;
  }, [edits]);

  // Restore drafts from localStorage so partial edits survive a refresh.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as EditMap;
      if (parsed && typeof parsed === "object") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEdits(parsed);
      }
    } catch {
      // Ignore corrupted storage; the tool can still work without drafts.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
    } catch {
      // Storage quota or privacy mode — non-fatal.
    }
  }, [edits]);

  const venueById = useMemo(() => {
    const map = new Map<string, Venue>();
    venues.forEach((venue) => map.set(venue.id, venue));
    return map;
  }, [venues]);

  const filteredVenues = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return venues.filter((venue) => {
      if (categoryFilter !== "all" && venue.category !== categoryFilter) return false;
      if (onlyEdited && !edits[venue.id]) return false;
      if (!needle) return true;
      return (
        venue.name.toLowerCase().includes(needle) ||
        venue.address.toLowerCase().includes(needle) ||
        venue.id.toLowerCase().includes(needle) ||
        venue.neighbourhood.toLowerCase().includes(needle)
      );
    });
  }, [venues, query, categoryFilter, onlyEdited, edits]);

  const setEdit = useCallback((id: string, lat: number, lng: number) => {
    setEdits((prev) => ({ ...prev, [id]: { lat, lng } }));
  }, []);

  const selectVenue = useCallback((id: string) => {
    setSelectedId(id);
    setGeocodeResult(null);
    setGeocodeStatus("idle");
    geocodeMarkerRef.current?.remove();
    geocodeMarkerRef.current = null;
  }, []);

  const resetEdit = useCallback((id: string) => {
    setEdits((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: COPENHAGEN,
      zoom: 11.2,
      attributionControl: false
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => setReady(true));

    mapRef.current = map;

    const markers = markersRef.current;
    return () => {
      markers.forEach((marker) => marker.remove());
      markers.clear();
      geocodeMarkerRef.current?.remove();
      geocodeMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers — every venue gets a draggable marker. Drags update the edit
  // store, which highlights the venue and exposes the new coordinates.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const seen = new Set<string>();

    venues.forEach((venue) => {
      const id = venue.id;
      seen.add(id);
      const edit = edits[id];
      const lat = edit?.lat ?? venue.lat;
      const lng = edit?.lng ?? venue.lng;
      const isSelected = selectedId === id;
      const isEdited = Boolean(edit);

      const existing = markersRef.current.get(id);
      if (existing) {
        existing.setLngLat([lng, lat]);
        const inner = existing.getElement().firstElementChild as HTMLElement | null;
        if (inner) updatePinStyle(inner, venue, isSelected, isEdited);
        return;
      }

      const wrapper = document.createElement("button");
      wrapper.type = "button";
      wrapper.setAttribute("aria-label", venue.name);
      wrapper.style.cssText =
        "background:transparent;border:0;padding:0;margin:0;cursor:grab;display:block;line-height:0;";

      const pin = document.createElement("span");
      updatePinStyle(pin, venue, isSelected, isEdited);
      wrapper.appendChild(pin);

      wrapper.addEventListener("click", (event) => {
        event.stopPropagation();
        selectVenue(id);
      });
      wrapper.addEventListener("mousedown", () => {
        wrapper.style.cursor = "grabbing";
      });
      wrapper.addEventListener("mouseup", () => {
        wrapper.style.cursor = "grab";
      });

      const marker = new maplibregl.Marker({ element: wrapper, anchor: "bottom", draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on("dragstart", () => {
        selectVenue(id);
      });
      marker.on("dragend", () => {
        const pos = marker.getLngLat();
        setEdit(id, pos.lat, pos.lng);
      });

      markersRef.current.set(id, marker);
    });

    for (const [id, marker] of markersRef.current.entries()) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  }, [venues, ready, edits, selectedId, setEdit, selectVenue]);

  // Pan to the selected venue when it changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !selectedId) return;
    const venue = venueById.get(selectedId);
    if (!venue) return;
    const edit = edits[selectedId];
    const lat = edit?.lat ?? venue.lat;
    const lng = edit?.lng ?? venue.lng;
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 16), duration: 500 });
    // We intentionally leave `edits` out of deps so panning only triggers on
    // selection changes, not on every drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, ready, venueById]);

  // Render / update the geocode comparison marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (!geocodeResult) {
      geocodeMarkerRef.current?.remove();
      geocodeMarkerRef.current = null;
      return;
    }

    if (!geocodeMarkerRef.current) {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("aria-label", "Nominatim geocode");
      wrapper.style.cssText =
        "width:18px;height:18px;border-radius:9999px;background:#3F6F84;border:3px solid #fff;box-shadow:0 0 0 2px rgba(63,111,132,0.35);";
      geocodeMarkerRef.current = new maplibregl.Marker({ element: wrapper, anchor: "center" })
        .setLngLat([geocodeResult.lng, geocodeResult.lat])
        .addTo(map);
    } else {
      geocodeMarkerRef.current.setLngLat([geocodeResult.lng, geocodeResult.lat]);
    }
  }, [geocodeResult, ready]);

  const selected = selectedId ? venueById.get(selectedId) : undefined;
  const selectedEdit = selected ? edits[selected.id] : undefined;
  const editedCount = Object.keys(edits).length;

  async function geocodeSelected() {
    if (!selected) return;
    setGeocodeStatus("loading");
    setSaveMessage(null);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", selected.address);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("addressdetails", "0");
      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Geocoding failed");
      const results = (await response.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (results.length === 0) {
        setGeocodeStatus("error");
        setGeocodeResult(null);
        return;
      }
      const [first] = results;
      const lat = Number(first.lat);
      const lng = Number(first.lon);
      setGeocodeResult({ lat, lng, label: first.display_name });
      setGeocodeStatus("idle");
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 17, duration: 500 });
    } catch {
      setGeocodeStatus("error");
      setGeocodeResult(null);
    }
  }

  function applyGeocodeToSelected() {
    if (!selected || !geocodeResult) return;
    setEdit(selected.id, geocodeResult.lat, geocodeResult.lng);
  }

  async function copyExport() {
    const payload = Object.entries(edits).map(([id, edit]) => ({
      id,
      lat: Number(edit.lat.toFixed(6)),
      lng: Number(edit.lng.toFixed(6))
    }));
    const text = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setSaveMessage(`Copied ${payload.length} edit(s) to clipboard.`);
    } catch {
      setSaveMessage("Could not access clipboard. JSON printed below:\n" + text);
    }
  }

  async function persistEdits() {
    if (!saveEnabled) {
      setSaveStatus("error");
      setSaveMessage("Saving to disk is only available in development.");
      return;
    }
    const payload = Object.entries(edits).map(([id, edit]) => ({
      id,
      lat: Number(edit.lat.toFixed(6)),
      lng: Number(edit.lng.toFixed(6))
    }));
    if (payload.length === 0) return;
    setSaveStatus("saving");
    setSaveMessage(null);
    const result: SaveResult = await saveVenueCoords({ updates: payload });
    if (result.ok) {
      setSaveStatus("saved");
      setSaveMessage(`Saved ${result.updated.length} venue(s) to lib/data/venues.ts.`);
      setEdits({});
    } else {
      setSaveStatus("error");
      setSaveMessage(result.error);
    }
  }

  function discardAll() {
    setEdits({});
    setSaveMessage(null);
    setSaveStatus("idle");
  }

  const distanceFromOriginal = selected && selectedEdit
    ? haversineKm(selected.lat, selected.lng, selectedEdit.lat, selectedEdit.lng) * 1000
    : null;
  const distanceToGeocode = selected && geocodeResult
    ? haversineKm(
        selectedEdit?.lat ?? selected.lat,
        selectedEdit?.lng ?? selected.lng,
        geocodeResult.lat,
        geocodeResult.lng
      ) * 1000
    : null;

  return (
    <div className="grid h-[calc(100vh-72px)] grid-cols-[320px,1fr] gap-3 p-3">
      <aside className="flex min-h-0 flex-col gap-3 rounded-card bg-surface p-3 ring-1 ring-hairline">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-lg font-semibold text-ink">Map editor</h1>
            <span className="rounded-pill bg-sunken px-2 py-0.5 text-2xs font-semibold text-muted">
              {editedCount} edit{editedCount === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-2xs text-muted">
            Drag any pin to fix its position. Edits stay in your browser until you save.
          </p>
        </header>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, id, address…"
        />

        <div className="flex flex-wrap gap-1.5">
          {(["all", "cafe", "playground", "indoor_play", "library", "swimming", "theatre", "cinema", "event"] as const).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "rounded-pill px-2 py-0.5 text-2xs font-semibold ring-1 transition",
                  categoryFilter === cat
                    ? "bg-sage-500 text-white ring-sage-500"
                    : "bg-sunken text-muted ring-hairline hover:text-ink"
                )}
              >
                {cat === "all" ? "All" : cat.replace("_", " ")}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => setOnlyEdited((v) => !v)}
            className={cn(
              "rounded-pill px-2 py-0.5 text-2xs font-semibold ring-1 transition",
              onlyEdited
                ? "bg-warm-500 text-white ring-warm-500"
                : "bg-sunken text-muted ring-hairline hover:text-ink"
            )}
          >
            Edited only
          </button>
        </div>

        <ul className="-mx-1 flex-1 space-y-0.5 overflow-y-auto pr-1">
          {filteredVenues.map((venue) => {
            const isEdited = Boolean(edits[venue.id]);
            const isActive = selectedId === venue.id;
            return (
              <li key={venue.id}>
                <button
                  type="button"
                  onClick={() => selectVenue(venue.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition",
                    isActive ? "bg-sage-100 ring-1 ring-sage-300" : "hover:bg-sunken"
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 inline-block h-2 w-2 shrink-0 rounded-full",
                      isEdited ? "bg-warm-500" : "bg-transparent ring-1 ring-hairline"
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{venue.name}</span>
                    <span className="block truncate text-2xs text-muted">
                      {venue.neighbourhood} · {venue.category.replace("_", " ")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {filteredVenues.length === 0 ? (
            <li className="px-2 py-3 text-center text-2xs text-muted">No venues match.</li>
          ) : null}
        </ul>

        <footer className="space-y-2 border-t border-hairline pt-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={persistEdits}
              disabled={!saveEnabled || editedCount === 0 || saveStatus === "saving"}
            >
              {saveStatus === "saving" ? "Saving…" : `Save to file (${editedCount})`}
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={copyExport} disabled={editedCount === 0}>
              Copy JSON
            </Button>
            <Button type="button" variant="ghost" size="md" onClick={discardAll} disabled={editedCount === 0}>
              Discard
            </Button>
          </div>
          {!saveEnabled ? (
            <p className="text-2xs text-muted">
              Save-to-file is disabled in this environment. Use “Copy JSON” and paste the patch into{" "}
              <code className="rounded bg-sunken px-1">lib/data/venues.ts</code>.
            </p>
          ) : null}
          {saveMessage ? (
            <p className={cn("text-2xs", saveStatus === "error" ? "text-danger" : "text-sage-700")}>
              {saveMessage}
            </p>
          ) : null}
        </footer>
      </aside>

      <section className="relative min-h-0 overflow-hidden rounded-card ring-1 ring-hairline">
        <div ref={containerRef} className="h-full w-full" />
        {selected ? (
          <div className="pointer-events-auto absolute right-3 top-3 max-w-sm rounded-card bg-surface/96 p-3 shadow-lift ring-1 ring-hairline backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Badge variant={categoryBadgeVariant[selected.category]}>{selected.category}</Badge>
                <h2 className="mt-1 truncate font-display text-sm font-semibold text-ink">{selected.name}</h2>
                <p className="truncate text-2xs text-muted">{selected.address}</p>
              </div>
              {selectedEdit ? (
                <button
                  type="button"
                  onClick={() => resetEdit(selected.id)}
                  className="shrink-0 rounded-pill bg-sunken px-2 py-0.5 text-2xs font-semibold text-muted hover:text-warm-600"
                >
                  Reset
                </button>
              ) : null}
            </div>

            <dl className="mt-2 space-y-1 text-2xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Original</dt>
                <dd className="font-mono text-ink">
                  {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Current</dt>
                <dd className={cn("font-mono", selectedEdit ? "text-warm-700" : "text-ink")}>
                  {(selectedEdit?.lat ?? selected.lat).toFixed(6)},{" "}
                  {(selectedEdit?.lng ?? selected.lng).toFixed(6)}
                  {distanceFromOriginal !== null ? (
                    <span className="ml-1 text-muted">(Δ {Math.round(distanceFromOriginal)} m)</span>
                  ) : null}
                </dd>
              </div>
              {geocodeResult ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-info-600">Nominatim</dt>
                  <dd className="font-mono text-info-700">
                    {geocodeResult.lat.toFixed(6)}, {geocodeResult.lng.toFixed(6)}
                    {distanceToGeocode !== null ? (
                      <span className="ml-1 text-muted">(Δ {Math.round(distanceToGeocode)} m)</span>
                    ) : null}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={geocodeSelected}
                disabled={geocodeStatus === "loading"}
              >
                {geocodeStatus === "loading" ? "Geocoding…" : "Geocode address"}
              </Button>
              {geocodeResult ? (
                <Button type="button" variant="primary" size="md" onClick={applyGeocodeToSelected}>
                  Snap pin to geocode
                </Button>
              ) : null}
            </div>
            {geocodeStatus === "error" ? (
              <p className="mt-1 text-2xs text-danger">No geocode found for this address.</p>
            ) : null}

            <div className="mt-2 flex flex-wrap gap-2 text-2xs">
              <a
                className="text-info-700 underline hover:text-info-800"
                href={`https://www.openstreetmap.org/?mlat=${selectedEdit?.lat ?? selected.lat}&mlon=${
                  selectedEdit?.lng ?? selected.lng
                }#map=19/${selectedEdit?.lat ?? selected.lat}/${selectedEdit?.lng ?? selected.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in OSM
              </a>
              <a
                className="text-info-700 underline hover:text-info-800"
                href={googleMapsUrl(
                  selectedEdit?.lat ?? selected.lat,
                  selectedEdit?.lng ?? selected.lng,
                  selected.name
                )}
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        ) : null}

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-pill bg-surface/96 px-3 py-1 text-2xs font-semibold text-muted shadow-sm ring-1 ring-hairline backdrop-blur">
          Drag a pin to reposition · click a pin or list item to inspect
        </div>
      </section>
    </div>
  );
}

function updatePinStyle(pin: HTMLElement, venue: Venue, selected: boolean, edited: boolean) {
  const size = selected ? 40 : 32;
  pin.className = cn(
    "block origin-bottom transition-transform duration-150 ease-out",
    !selected && "hover:scale-110"
  );
  pin.style.width = `${size}px`;
  pin.style.height = `${(size * 36) / 28}px`;
  pin.innerHTML = pinSvg(venue.category, selected, edited);
}

function pinSvg(category: VenueCategory, selected: boolean, edited: boolean) {
  const fill = edited ? "#C46A40" : categoryHex(category);
  const ring = selected ? "#1F2A26" : edited ? "#FFE9D9" : "#FFFFFF";
  const ringWidth = selected ? 2.5 : 1.75;
  return `<svg viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true" style="display:block;filter:drop-shadow(0 3px 4px rgba(31,42,38,0.18));overflow:visible">
    <path d="M14 0.75C6.68 0.75 0.75 6.68 0.75 14c0 4.79 2.96 9.78 6.05 13.7 1.55 1.97 3.11 3.61 4.28 4.78a4.13 4.13 0 0 0 5.84 0c1.17-1.17 2.73-2.81 4.28-4.78 3.09-3.92 6.05-8.91 6.05-13.7 0-7.32-5.93-13.25-13.25-13.25Z" fill="${fill}" stroke="${ring}" stroke-width="${ringWidth}"/>
    <circle cx="14" cy="14" r="4.5" fill="#FFFFFF"/>
  </svg>`;
}

function categoryHex(category: VenueCategory) {
  switch (category) {
    case "cafe":
      return "#C46A40";
    case "playground":
      return "#5B8377";
    case "indoor_play":
      return "#B47A1F";
    case "cinema":
      return "#3F6F84";
    case "library":
      return "#8C6B40";
    case "swimming":
      return "#2D6670";
    case "theatre":
      return "#A55432";
    case "event":
      return "#C46A40";
    default:
      return "#33554C";
  }
}
