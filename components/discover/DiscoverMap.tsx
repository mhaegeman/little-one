"use client";

import { MapPin } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { categoryColors, categoryLabels } from "@/lib/data/taxonomy";
import type { Venue } from "@/lib/types";
import { cn } from "@/lib/utils";

type DiscoverMapProps = {
  venues: Venue[];
  selectedVenueId?: string;
  onSelect: (venueId: string) => void;
};

export function DiscoverMap({ venues, selectedVenueId, onSelect }: DiscoverMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapboxToken || !containerRef.current) {
      return;
    }

    let map: import("mapbox-gl").Map | undefined;
    const markers: import("mapbox-gl").Marker[] = [];
    let cancelled = false;

    async function mountMap() {
      const mapboxgl = await import("mapbox-gl");
      if (cancelled || !containerRef.current) {
        return;
      }

      mapboxgl.default.accessToken = mapboxToken;
      map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [12.5683, 55.6761],
        zoom: 11.2,
        attributionControl: false
      });

      map.addControl(new mapboxgl.default.AttributionControl({ compact: true }), "bottom-right");

      venues.forEach((venue) => {
        const element = document.createElement("button");
        element.type = "button";
        element.setAttribute("aria-label", venue.name);
        element.className =
          "grid h-9 w-9 place-items-center rounded-full bg-moss text-white shadow-soft ring-2 ring-white transition hover:scale-105";
        element.innerHTML =
          '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
        element.addEventListener("click", () => onSelect(venue.id));

        const marker = new mapboxgl.default.Marker({ element })
          .setLngLat([venue.lng, venue.lat])
          .addTo(map!);
        markers.push(marker);
      });
    }

    mountMap();

    return () => {
      cancelled = true;
      markers.forEach((marker) => marker.remove());
      map?.remove();
    };
  }, [mapboxToken, onSelect, venues]);

  if (mapboxToken) {
    return <div ref={containerRef} className="h-full min-h-[360px] w-full overflow-hidden rounded-card" />;
  }

  return <FallbackMap venues={venues} selectedVenueId={selectedVenueId} onSelect={onSelect} />;
}

function FallbackMap({ venues, selectedVenueId, onSelect }: DiscoverMapProps) {
  const bounds = useMemo(() => {
    const lats = venues.map((venue) => venue.lat);
    const lngs = venues.map((venue) => venue.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };
  }, [venues]);

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-card bg-[#D9E9E3] ring-1 ring-oat">
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,.48)_0_18%,transparent_18%_25%,rgba(255,255,255,.35)_25%_29%,transparent_29%_48%,rgba(255,255,255,.35)_48%_53%,transparent_53%)]" />
      <div className="absolute inset-x-0 top-[46%] h-10 rotate-[-8deg] bg-[#BFD3CB]/80" />
      <div className="absolute left-[22%] top-0 h-full w-12 rotate-[14deg] bg-[#C9DBD4]/80" />
      <div className="absolute bottom-5 left-5 rounded-full bg-white/86 px-3 py-2 text-xs font-bold text-mossDark ring-1 ring-oat">
        Kortpreview
      </div>

      {venues.map((venue) => {
        const left = 8 + ((venue.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 84;
        const top = 8 + ((bounds.maxLat - venue.lat) / (bounds.maxLat - bounds.minLat || 1)) * 84;
        const active = selectedVenueId === venue.id;

        return (
          <button
            key={venue.id}
            type="button"
            onClick={() => onSelect(venue.id)}
            className={cn(
              "focus-ring absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-mossDark shadow-soft ring-2 ring-white transition hover:scale-110",
              active && "h-11 w-11 bg-moss text-white"
            )}
            style={{ left: `${left}%`, top: `${top}%` }}
            title={`${venue.name} · ${categoryLabels[venue.category]}`}
            aria-label={venue.name}
          >
            <MapPin size={active ? 20 : 17} fill="currentColor" aria-hidden="true" />
          </button>
        );
      })}

      {selectedVenueId ? (
        <div className="absolute bottom-5 right-5 max-w-[min(320px,calc(100%-2.5rem))] rounded-card bg-white/94 p-4 shadow-soft ring-1 ring-oat backdrop-blur">
          {venues
            .filter((venue) => venue.id === selectedVenueId)
            .map((venue) => (
              <div key={venue.id}>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1",
                    categoryColors[venue.category]
                  )}
                >
                  {categoryLabels[venue.category]}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold">{venue.name}</h3>
                <p className="mt-1 text-sm text-ink/70">{venue.neighbourhood}</p>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}
