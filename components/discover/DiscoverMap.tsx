"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { LngLatBounds, type Map as MapLibreMap, type Marker } from "maplibre-gl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categoryColors, categoryLabels } from "@/lib/data/taxonomy";
import type { Venue } from "@/lib/types";
import { cn, formatDistance, haversineKm } from "@/lib/utils";

type DiscoverMapProps = {
  venues: Venue[];
  selectedVenueId?: string;
  onSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number } | null;
};

const COPENHAGEN: [number, number] = [12.5683, 55.6761];

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
  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm"
    }
  ]
};

export function DiscoverMap({ venues, selectedVenueId, onSelect, userLocation }: DiscoverMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const userMarkerRef = useRef<Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

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

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const seen = new Set<string>();

    for (const venue of venues) {
      seen.add(venue.id);
      const existing = markersRef.current.get(venue.id);
      if (existing) {
        existing.setLngLat([venue.lng, venue.lat]);
        const el = existing.getElement();
        el.dataset.selected = selectedVenueId === venue.id ? "true" : "false";
        applyMarkerStyle(el, venue, selectedVenueId === venue.id);
        continue;
      }

      const element = document.createElement("button");
      element.type = "button";
      element.setAttribute("aria-label", venue.name);
      element.title = `${venue.name} · ${categoryLabels[venue.category]}`;
      element.dataset.venueId = venue.id;
      applyMarkerStyle(element, venue, selectedVenueId === venue.id);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectRef.current(venue.id);
      });

      const marker = new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat([venue.lng, venue.lat])
        .addTo(map);
      markersRef.current.set(venue.id, marker);
    }

    for (const [id, marker] of markersRef.current.entries()) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  }, [venues, selectedVenueId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (!userLocation) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.className =
        "relative grid h-5 w-5 place-items-center rounded-full bg-rust ring-4 ring-rust/30 shadow-soft";
      el.setAttribute("aria-label", "Din lokation");
      el.innerHTML =
        '<span class="absolute inset-0 -z-10 animate-ping rounded-full bg-rust/40"></span>';
      userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
  }, [userLocation, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || venues.length === 0) return;

    const bounds = new LngLatBounds();
    venues.forEach((venue) => bounds.extend([venue.lng, venue.lat]));
    if (userLocation) {
      bounds.extend([userLocation.lng, userLocation.lat]);
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 600 });
    }
  }, [venues, userLocation, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !selectedVenueId) return;
    const venue = venues.find((item) => item.id === selectedVenueId);
    if (!venue) return;
    map.flyTo({ center: [venue.lng, venue.lat], zoom: Math.max(map.getZoom(), 13.5), duration: 500 });
  }, [selectedVenueId, ready, venues]);

  const selected = venues.find((venue) => venue.id === selectedVenueId);

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-card ring-1 ring-oat">
      <div ref={containerRef} className="h-full w-full" />
      {selected ? (
        <SelectedCard venue={selected} userLocation={userLocation} />
      ) : null}
    </div>
  );
}

function SelectedCard({ venue, userLocation }: { venue: Venue; userLocation?: { lat: number; lng: number } | null }) {
  const distance = userLocation
    ? haversineKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng)
    : null;

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm">
      <Link
        href={`/venues/${venue.id}`}
        className="focus-ring pointer-events-auto flex gap-3 overflow-hidden rounded-card bg-white/96 p-2 shadow-soft ring-1 ring-oat backdrop-blur transition hover:ring-moss/30"
      >
        {venue.photos[0] ? (
          <img
            src={venue.photos[0]}
            alt=""
            className="h-20 w-24 shrink-0 rounded-xl object-cover"
            loading="lazy"
          />
        ) : null}
        <div className="min-w-0 py-1 pr-2">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
              categoryColors[venue.category]
            )}
          >
            {categoryLabels[venue.category]}
          </span>
          <h3 className="mt-1 truncate font-display text-base font-semibold text-ink">{venue.name}</h3>
          <p className="truncate text-xs font-medium text-ink/62">
            {venue.neighbourhood}
            {distance !== null ? ` · ${formatDistance(distance)} herfra` : ""}
          </p>
        </div>
      </Link>
    </div>
  );
}

function applyMarkerStyle(element: HTMLElement, venue: Venue, selected: boolean) {
  element.className = cn(
    "group relative flex translate-y-1 cursor-pointer items-center justify-center rounded-full text-white shadow-soft ring-2 ring-white transition-all",
    selected ? "h-11 w-11 -translate-y-1" : "h-9 w-9 hover:scale-110",
    categoryBg(venue.category)
  );
  element.innerHTML = markerSvg(selected ? 22 : 18);
}

function categoryBg(category: Venue["category"]) {
  switch (category) {
    case "cafe":
      return "bg-rust";
    case "playground":
      return "bg-moss";
    case "indoor_play":
      return "bg-[#B8901C]";
    case "cinema":
      return "bg-[#3F6F77]";
    case "library":
      return "bg-[#8C6B40]";
    case "swimming":
      return "bg-[#2D6670]";
    case "theatre":
      return "bg-[#B05A37]";
    case "event":
      return "bg-[#C4623A]";
    default:
      return "bg-mossDark";
  }
}

function markerSvg(size: number) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
}

