"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { LngLatBounds, type Map as MapLibreMap, type Marker } from "maplibre-gl";
import Link from "next/link";
import Supercluster from "supercluster";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { categoryBadgeVariant } from "@/lib/data/taxonomy";
import type { Venue, VenueCategory } from "@/lib/types";
import { cn, formatDistance, haversineKm } from "@/lib/utils";

type VenuePointProps = { kind: "venue"; venueId: string; venue: Venue };

type DiscoverMapProps = {
  venues: Venue[];
  selectedVenueId?: string;
  onSelect: (venueId: string) => void;
  userLocation?: { lat: number; lng: number } | null;
};

type HoverState = {
  venue: Venue;
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
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
  const t = useTranslations("discover");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const userMarkerRef = useRef<Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedVenueId);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [hover, setHover] = useState<HoverState | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    selectedIdRef.current = selectedVenueId;
  }, [selectedVenueId]);

  // Build a supercluster index whenever the venue list changes.
  const cluster = useMemo(() => {
    const index = new Supercluster<VenuePointProps>({
      radius: 56,
      maxZoom: 14,
      minPoints: 2
    });
    index.load(
      venues.map((venue) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [venue.lng, venue.lat] },
        properties: { kind: "venue" as const, venueId: venue.id, venue }
      }))
    );
    return index;
  }, [venues]);

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

    map.on("load", () => {
      setReady(true);
      setTick((t) => t + 1);
    });
    map.on("movestart", () => setHover(null));
    map.on("moveend", () => setTick((t) => t + 1));

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

  // Reconcile markers from the cluster index for the current viewport.
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !ready || !container) return;

    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];
    const zoom = Math.round(map.getZoom());
    const points = cluster.getClusters(bbox, zoom);

    const seen = new Set<string>();

    for (const point of points) {
      const isCluster = (point.properties as { cluster?: boolean }).cluster === true;
      const [lng, lat] = point.geometry.coordinates;

      if (isCluster) {
        const clusterId = (point.properties as { cluster_id: number }).cluster_id;
        const count = (point.properties as { point_count: number }).point_count;
        const id = `cluster-${clusterId}`;
        seen.add(id);

        const existing = markersRef.current.get(id);
        if (existing) {
          existing.setLngLat([lng, lat]);
          const inner = existing.getElement().firstElementChild as HTMLElement | null;
          if (inner) updateClusterStyle(inner, count);
          continue;
        }

        const element = createClusterElement(count, t("clusterPlaces", { count }), () => {
          const target = Math.min(cluster.getClusterExpansionZoom(clusterId), 16);
          map.flyTo({ center: [lng, lat], zoom: target, duration: 500 });
        });
        const marker = new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);
        markersRef.current.set(id, marker);
        continue;
      }

      const venue = (point.properties as VenuePointProps).venue;
      const id = `venue-${venue.id}`;
      seen.add(id);

      const existing = markersRef.current.get(id);
      if (existing) {
        existing.setLngLat([venue.lng, venue.lat]);
        const inner = existing.getElement().firstElementChild as HTMLElement | null;
        if (inner) updatePinStyle(inner, venue, selectedVenueId === venue.id);
        continue;
      }

      const element = createMarkerElement(venue, selectedVenueId === venue.id, {
        onSelect: (next) => onSelectRef.current(next),
        onHover: (event) => {
          if (selectedIdRef.current === venue.id) {
            setHover(null);
            return;
          }
          const rect = container.getBoundingClientRect();
          setHover({
            venue,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            containerWidth: rect.width,
            containerHeight: rect.height
          });
        },
        onLeave: () => setHover(null)
      });

      const marker = new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat([venue.lng, venue.lat])
        .addTo(map);
      markersRef.current.set(id, marker);
    }

    for (const [id, marker] of markersRef.current.entries()) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  }, [cluster, selectedVenueId, ready, tick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (!userLocation) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    if (!userMarkerRef.current) {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("aria-label", t("yourLocation"));
      const dot = document.createElement("span");
      dot.className =
        "relative grid h-4 w-4 place-items-center rounded-full bg-warm-500 ring-[3px] ring-warm-500/30 shadow-sm";
      dot.innerHTML =
        '<span class="absolute inset-0 -z-10 animate-ping rounded-full bg-warm-500/40"></span>';
      wrapper.appendChild(dot);
      userMarkerRef.current = new maplibregl.Marker({ element: wrapper, anchor: "center" })
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
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-card ring-1 ring-hairline">
      <div ref={containerRef} className="h-full w-full" />
      {hover ? <HoverCard hover={hover} /> : null}
      {selected ? <SelectedCard venue={selected} userLocation={userLocation} /> : null}
    </div>
  );
}

function HoverCard({ hover }: { hover: HoverState }) {
  const tTaxonomy = useTranslations("taxonomy");
  const cardWidth = 220;
  const cardHeight = 76;
  const offset = 16;
  const flipX = hover.x + offset + cardWidth > hover.containerWidth - 8;
  const flipY = hover.y + offset + cardHeight > hover.containerHeight - 8;
  const left = flipX ? hover.x - offset - cardWidth : hover.x + offset;
  const top = flipY ? hover.y - offset - cardHeight : hover.y + offset;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left: Math.max(8, left),
        top: Math.max(8, top),
        width: cardWidth
      }}
    >
      <div className="flex items-center gap-2 rounded-card bg-surface/96 p-1.5 shadow-lift ring-1 ring-hairline backdrop-blur">
        {hover.venue.photos[0] ? (
          <img
            src={hover.venue.photos[0]}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-sunken text-subtle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="min-w-0 pr-1">
          <p className="truncate text-2xs font-bold uppercase tracking-[0.1em] text-subtle">
            {tTaxonomy(hover.venue.category as VenueCategory)}
          </p>
          <p className="truncate text-sm font-semibold leading-tight text-ink">
            {hover.venue.name}
          </p>
          <p className="truncate text-2xs text-muted">{hover.venue.neighbourhood}</p>
        </div>
      </div>
    </div>
  );
}

function SelectedCard({
  venue,
  userLocation
}: {
  venue: Venue;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const t = useTranslations("discover");
  const tTaxonomy = useTranslations("taxonomy");
  const distance = userLocation
    ? haversineKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng)
    : null;

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm">
      <Link
        href={`/venues/${venue.id}`}
        className="focus-ring pointer-events-auto flex gap-2 overflow-hidden rounded-card bg-surface/96 p-1.5 shadow-lift ring-1 ring-hairline backdrop-blur transition hover:ring-sage-300"
      >
        {venue.photos[0] ? (
          <img
            src={venue.photos[0]}
            alt=""
            className="h-16 w-20 shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
        ) : null}
        <div className="min-w-0 py-1 pr-2">
          <Badge variant={categoryBadgeVariant[venue.category]}>
            {tTaxonomy(venue.category as VenueCategory)}
          </Badge>
          <h3 className="mt-0.5 truncate font-display text-sm font-semibold text-ink">
            {venue.name}
          </h3>
          <p className="truncate text-2xs text-muted">
            {venue.neighbourhood}
            {distance !== null ? ` · ${formatDistance(distance)} ${t("fromHere")}` : ""}
          </p>
        </div>
      </Link>
    </div>
  );
}

type MarkerHandlers = {
  onSelect: (venueId: string) => void;
  onHover: (event: MouseEvent) => void;
  onLeave: () => void;
};

function createMarkerElement(venue: Venue, selected: boolean, handlers: MarkerHandlers) {
  const wrapper = document.createElement("button");
  wrapper.type = "button";
  wrapper.setAttribute("aria-label", venue.name);
  wrapper.dataset.venueId = venue.id;
  // No transforms on this element — MapLibre owns its `transform` for positioning.
  wrapper.style.cssText =
    "background:transparent;border:0;padding:0;margin:0;cursor:pointer;display:block;line-height:0;";

  const pin = document.createElement("span");
  updatePinStyle(pin, venue, selected);
  wrapper.appendChild(pin);

  wrapper.addEventListener("click", (event) => {
    event.stopPropagation();
    handlers.onSelect(venue.id);
  });
  wrapper.addEventListener("mouseenter", handlers.onHover);
  wrapper.addEventListener("mousemove", handlers.onHover);
  wrapper.addEventListener("mouseleave", handlers.onLeave);

  return wrapper;
}

function createClusterElement(count: number, ariaLabel: string, onExpand: () => void) {
  const wrapper = document.createElement("button");
  wrapper.type = "button";
  wrapper.setAttribute("aria-label", ariaLabel);
  wrapper.style.cssText =
    "background:transparent;border:0;padding:0;margin:0;cursor:pointer;display:block;line-height:0;";

  const inner = document.createElement("span");
  updateClusterStyle(inner, count);
  wrapper.appendChild(inner);

  wrapper.addEventListener("click", (event) => {
    event.stopPropagation();
    onExpand();
  });

  return wrapper;
}

function updateClusterStyle(inner: HTMLElement, count: number) {
  // Scale by count (logarithmic so 50 doesn't dwarf 5)
  const size = Math.min(72, 36 + Math.log2(Math.max(2, count)) * 6);
  inner.className =
    "grid place-items-center rounded-full bg-sage-500 text-white font-display font-semibold ring-[3px] ring-white shadow-lift transition-transform duration-150 ease-out hover:scale-105";
  inner.style.width = `${size}px`;
  inner.style.height = `${size}px`;
  inner.style.fontSize = `${Math.max(12, Math.min(18, size / 4))}px`;
  inner.textContent = String(count);
}

function updatePinStyle(pin: HTMLElement, venue: Venue, selected: boolean) {
  const size = selected ? 40 : 32;
  pin.className = cn(
    "block origin-bottom transition-transform duration-150 ease-out",
    !selected && "hover:scale-110"
  );
  pin.style.width = `${size}px`;
  pin.style.height = `${(size * 36) / 28}px`;
  pin.innerHTML = pinSvg(venue.category, selected);
}

function pinSvg(category: VenueCategory, selected: boolean) {
  const fill = categoryHex(category);
  const ring = selected ? "#1F2A26" : "#FFFFFF";
  const ringWidth = selected ? 2.5 : 1.75;
  return `<svg viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true" style="display:block;filter:drop-shadow(0 3px 4px rgba(31,42,38,0.18));overflow:visible">
    <path d="M14 0.75C6.68 0.75 0.75 6.68 0.75 14c0 4.79 2.96 9.78 6.05 13.7 1.55 1.97 3.11 3.61 4.28 4.78a4.13 4.13 0 0 0 5.84 0c1.17-1.17 2.73-2.81 4.28-4.78 3.09-3.92 6.05-8.91 6.05-13.7 0-7.32-5.93-13.25-13.25-13.25Z" fill="${fill}" stroke="${ring}" stroke-width="${ringWidth}"/>
    <circle cx="14" cy="14" r="4.5" fill="#FFFFFF"/>
  </svg>`;
}

function categoryHex(category: VenueCategory) {
  // Aligned with the new sage/warm palette
  switch (category) {
    case "cafe":
      return "#C46A40"; // warm
    case "playground":
      return "#5B8377"; // sage
    case "indoor_play":
      return "#B47A1F"; // warning
    case "cinema":
      return "#3F6F84"; // info
    case "library":
      return "#8C6B40"; // sand-700
    case "swimming":
      return "#2D6670"; // teal-info
    case "theatre":
      return "#A55432"; // warm-600
    case "event":
      return "#C46A40"; // warm
    default:
      return "#33554C"; // sage-700
  }
}
