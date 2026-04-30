"use client";

import {
  CalendarDots,
  Heart,
  MapPin,
  TrendUp
} from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlannedOutings } from "@/hooks/usePlannedOutings";
import { venues } from "@/lib/data/venues";

function startOfWeek(date: Date) {
  const out = new Date(date);
  out.setHours(0, 0, 0, 0);
  // Monday-start week (ISO 8601). Sunday = 0 → 7.
  const day = out.getDay() || 7;
  out.setDate(out.getDate() - (day - 1));
  return out;
}

export function ProfileStats() {
  const { favorites } = useFavorites();
  const { outings } = usePlannedOutings();

  const stats = useMemo(() => {
    const venueIndex = new Map(venues.map((venue) => [venue.id, venue]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = startOfWeek(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const upcomingThisWeek = outings.filter((outing) => {
      const date = new Date(outing.date);
      date.setHours(0, 0, 0, 0);
      return date >= weekStart && date < weekEnd;
    }).length;

    const neighbourhoodCounts = new Map<string, number>();
    for (const outing of outings) {
      const venue = venueIndex.get(outing.venueId);
      if (venue) {
        neighbourhoodCounts.set(
          venue.neighbourhood,
          (neighbourhoodCounts.get(venue.neighbourhood) ?? 0) + 1
        );
      }
    }
    for (const id of favorites) {
      const venue = venueIndex.get(id);
      if (venue) {
        neighbourhoodCounts.set(
          venue.neighbourhood,
          (neighbourhoodCounts.get(venue.neighbourhood) ?? 0) + 1
        );
      }
    }

    let topNeighbourhood: { name: string; count: number } | null = null;
    for (const [name, count] of neighbourhoodCounts.entries()) {
      if (!topNeighbourhood || count > topNeighbourhood.count) {
        topNeighbourhood = { name, count };
      }
    }

    return {
      saved: favorites.length,
      planned: outings.length,
      upcomingThisWeek,
      topNeighbourhood
    };
  }, [favorites, outings]);

  if (stats.saved === 0 && stats.planned === 0) return null;

  return (
    <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
      <div className="mb-2 flex items-center gap-1.5">
        <TrendUp size={14} weight="bold" className="text-mint-ink" aria-hidden="true" />
        <h2 className="font-display text-base font-semibold text-ink">Din uge</h2>
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          icon={<Heart size={14} weight="fill" className="text-peach-300" aria-hidden="true" />}
          label="Gemte"
          value={stats.saved}
        />
        <Stat
          icon={
            <CalendarDots size={14} weight="fill" className="text-mint-ink" aria-hidden="true" />
          }
          label="Planlagte"
          value={stats.planned}
        />
        <Stat
          icon={
            <CalendarDots size={14} weight="fill" className="text-peach-ink" aria-hidden="true" />
          }
          label="Denne uge"
          value={stats.upcomingThisWeek}
        />
        <Stat
          icon={<MapPin size={14} weight="fill" className="text-info" aria-hidden="true" />}
          label="Topbydel"
          value={stats.topNeighbourhood?.name ?? "—"}
          numeric={false}
        />
      </dl>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  numeric = true
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  numeric?: boolean;
}) {
  return (
    <div className="rounded-lg bg-sunken p-2.5 ring-1 ring-hairline">
      <dt className="flex items-center gap-1 text-2xs font-bold uppercase tracking-[0.12em] text-subtle">
        {icon}
        {label}
      </dt>
      <dd
        className={
          numeric
            ? "mt-1 font-display text-xl font-semibold text-ink"
            : "mt-1 truncate font-display text-sm font-semibold text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}
