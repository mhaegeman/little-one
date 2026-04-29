"use client";

import {
  ArrowRight,
  CalendarCheck,
  CalendarDots,
  Heart,
  MapPin,
  Sparkle,
  Sun
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlannedOutings } from "@/hooks/usePlannedOutings";
import { categoryBadgeVariant, categoryLabels } from "@/lib/data/taxonomy";
import type { Venue } from "@/lib/types";
import { cn, formatDistance, haversineKm } from "@/lib/utils";

type Props = {
  venues: Venue[];
  userLocation: { lat: number; lng: number } | null;
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "God nat";
  if (hour < 11) return "God morgen";
  if (hour < 14) return "God formiddag";
  if (hour < 18) return "God eftermiddag";
  if (hour < 22) return "God aften";
  return "God nat";
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function TodayCard({ venues, userLocation }: Props) {
  const { outings } = usePlannedOutings();
  const { favorites } = useFavorites();

  const today = new Date();

  const plansToday = useMemo(() => {
    const venueIndex = new Map(venues.map((venue) => [venue.id, venue]));
    return outings
      .map((outing) => ({ outing, venue: venueIndex.get(outing.venueId) }))
      .filter(
        (entry): entry is { outing: typeof entry.outing; venue: Venue } =>
          Boolean(entry.venue) && isSameDay(new Date(entry.outing.date), today)
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outings, venues]);

  const nearby = useMemo(() => {
    if (!userLocation) {
      return [...venues].sort((a, b) => b.rating - a.rating).slice(0, 3);
    }
    return [...venues]
      .map((venue) => ({
        venue,
        distance: haversineKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map((entry) => ({ ...entry.venue, _distance: entry.distance } as Venue & { _distance: number }));
  }, [userLocation, venues]);

  return (
    <section
      aria-label="I dag"
      className="relative mb-4 overflow-hidden rounded-card bg-gradient-to-br from-sage-50 via-canvas to-sand-50 p-3.5 ring-1 ring-hairline"
    >
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-sage-100/60 blur-2xl" aria-hidden="true" />

      <div className="relative flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="flex items-center gap-1 text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">
            <Sun size={11} weight="fill" aria-hidden="true" />
            I dag
          </p>
          <p className="mt-0.5 font-display text-lg font-semibold text-ink">
            {greeting()}
          </p>
        </div>
        <div className="flex flex-wrap gap-1 text-2xs font-semibold text-muted">
          {favorites.length > 0 ? (
            <Link
              href="/profile?section=saved"
              className="focus-ring inline-flex items-center gap-1 rounded-pill bg-surface px-2 py-1 ring-1 ring-hairline transition-colors hover:text-ink"
            >
              <Heart size={11} weight="fill" className="text-warm-500" aria-hidden="true" />
              {favorites.length} gemte
            </Link>
          ) : null}
          {outings.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-pill bg-surface px-2 py-1 ring-1 ring-hairline">
              <CalendarDots size={11} weight="fill" className="text-sage-700" aria-hidden="true" />
              {outings.length} planlagt
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative mt-3 grid gap-2 sm:grid-cols-2">
        {/* Plans today (if any) */}
        {plansToday.length > 0 ? (
          <Link
            href="/journal"
            className="focus-ring flex items-start gap-2.5 rounded-lg bg-surface p-2.5 ring-1 ring-sage-200 transition-colors hover:ring-sage-400"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sage-100 text-sage-700">
              <CalendarCheck size={16} weight="fill" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-2xs font-bold uppercase tracking-[0.12em] text-sage-700">
                Plan i dag
              </p>
              <p className="truncate text-sm font-semibold text-ink">
                {plansToday.length === 1
                  ? plansToday[0].venue.name
                  : `${plansToday.length} besøg`}
              </p>
              {plansToday[0].outing.note ? (
                <p className="truncate text-2xs text-muted">{plansToday[0].outing.note}</p>
              ) : (
                <p className="truncate text-2xs text-muted">
                  Markér som besøgt fra journalen
                </p>
              )}
            </div>
            <ArrowRight size={12} weight="bold" className="shrink-0 text-sage-700" aria-hidden="true" />
          </Link>
        ) : (
          <div className="flex items-start gap-2.5 rounded-lg bg-surface/70 p-2.5 ring-1 ring-hairline">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sunken text-subtle">
              <Sparkle size={16} weight="fill" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-2xs font-bold uppercase tracking-[0.12em] text-subtle">
                Ingen planer i dag
              </p>
              <p className="text-sm font-semibold text-ink">
                Find et sted og planlæg et besøg
              </p>
              <p className="text-2xs text-muted">
                Tryk på et sted for at gemme eller planlægge.
              </p>
            </div>
          </div>
        )}

        {/* Nearby tile */}
        <Link
          href={
            nearby[0]
              ? `/venues/${(nearby[0] as Venue).id}`
              : "/"
          }
          className="focus-ring flex items-start gap-2.5 rounded-lg bg-surface p-2.5 ring-1 ring-hairline transition-colors hover:ring-sage-300"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warm-50 text-warm-600">
            <MapPin size={16} weight="fill" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-2xs font-bold uppercase tracking-[0.12em] text-warm-600">
              {userLocation ? "Nærmest jer" : "Mest elskede"}
            </p>
            <ul className="mt-0.5 space-y-0.5">
              {nearby.slice(0, 3).map((venue) => {
                const distance = (venue as Venue & { _distance?: number })._distance;
                return (
                  <li key={venue.id} className="flex items-center gap-1.5 truncate">
                    <Badge
                      variant={categoryBadgeVariant[venue.category]}
                      className={cn("shrink-0 px-1.5 py-0", "text-[9px]")}
                    >
                      {categoryLabels[venue.category]}
                    </Badge>
                    <span className="truncate text-xs font-semibold text-ink">{venue.name}</span>
                    {typeof distance === "number" ? (
                      <span className="ml-auto shrink-0 text-2xs text-subtle">
                        {formatDistance(distance)}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </Link>
      </div>
    </section>
  );
}
