"use client";

import {
  ArrowRight,
  CalendarCheck,
  CalendarDots,
  X
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { usePlannedOutings, type PlannedOuting } from "@/hooks/usePlannedOutings";
import { categoryBadgeVariant, categoryLabels } from "@/lib/data/taxonomy";
import { venues } from "@/lib/data/venues";
import { createClient } from "@/lib/supabase/client";
import type { TimelineItem, Venue } from "@/lib/types";
import { formatDanishDate } from "@/lib/utils";

type Props = {
  childId: string;
  onAdd: (item: TimelineItem) => void;
};

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function relativeLabel(iso: string) {
  const target = new Date(iso);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "I dag";
  if (diffDays === 1) return "I morgen";
  if (diffDays === -1) return "I går";
  if (diffDays > 1 && diffDays <= 7) return `Om ${diffDays} dage`;
  if (diffDays < -1) return `${Math.abs(diffDays)} dage forsinket`;
  return formatDanishDate(iso);
}

export function PlannedOutings({ childId, onAdd }: Props) {
  const { outings, remove } = usePlannedOutings();
  const { toast } = useToast();

  const upcoming = useMemo(() => {
    const venueIndex = new Map<string, Venue>(venues.map((venue) => [venue.id, venue]));
    return outings
      .map((outing) => ({ outing, venue: venueIndex.get(outing.venueId) }))
      .filter((entry): entry is { outing: PlannedOuting; venue: Venue } => Boolean(entry.venue))
      .sort((a, b) => new Date(a.outing.date).getTime() - new Date(b.outing.date).getTime());
  }, [outings]);

  if (upcoming.length === 0) return null;

  async function markVisited(outing: PlannedOuting, venue: Venue) {
    const optimistic: TimelineItem = {
      id: makeId(),
      type: "activity",
      title: `Besøgte ${venue.name}`,
      description: outing.note,
      date: outing.date,
      photos: undefined
    };

    const supabase = createClient();
    if (supabase && !childId.startsWith("demo-")) {
      const { data: venueRow } = await supabase
        .from("venues")
        .select("id")
        .eq("slug", venue.id)
        .single();

      const { error } = await supabase.from("activities_log").insert({
        child_id: childId,
        venue_id: venueRow?.id ?? null,
        title: optimistic.title,
        description: outing.note ?? null,
        date: outing.date,
        photos: [],
        location_lat: venue.lat,
        location_lng: venue.lng,
        tags: venue.tags
      });
      if (error) {
        toast({ title: "Kunne ikke logge", description: error.message, variant: "danger" });
        return;
      }
    }

    onAdd(optimistic);
    remove(outing.id);
    toast({
      title: "Besøget er logget",
      description: venue.name,
      variant: "success"
    });
  }

  return (
    <section
      aria-label="Planlagte ture"
      className="mt-4 rounded-card bg-surface p-3.5 ring-1 ring-hairline"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDots
            size={14}
            weight="fill"
            className="text-warm-500"
            aria-hidden="true"
          />
          <h2 className="font-display text-sm font-semibold text-ink">Planlagte ture</h2>
          <span className="text-2xs font-semibold text-subtle">
            ({upcoming.length})
          </span>
        </div>
      </div>

      <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {upcoming.map(({ outing, venue }) => (
          <li
            key={outing.id}
            className="flex items-center gap-2.5 rounded-lg bg-sunken p-2 ring-1 ring-hairline"
          >
            <Link
              href={`/venues/${venue.id}`}
              className="focus-ring flex min-w-0 flex-1 items-center gap-2.5 rounded-md"
            >
              <img
                src={venue.photos[0]}
                alt=""
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-hairline"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant={categoryBadgeVariant[venue.category]}>
                    {categoryLabels[venue.category]}
                  </Badge>
                  <span className="truncate text-2xs font-semibold text-subtle">
                    {relativeLabel(outing.date)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm font-semibold text-ink">{venue.name}</p>
                {outing.note ? (
                  <p className="mt-0.5 truncate text-2xs text-muted">{outing.note}</p>
                ) : null}
              </div>
              <ArrowRight
                size={12}
                weight="bold"
                className="shrink-0 text-subtle"
                aria-hidden="true"
              />
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="sm"
                variant="primary"
                onClick={() => markVisited(outing, venue)}
                aria-label={`Markér ${venue.name} som besøgt`}
              >
                <CalendarCheck size={12} weight="fill" aria-hidden="true" />
                Besøgt
              </Button>
              <button
                type="button"
                onClick={() => {
                  remove(outing.id);
                  toast({
                    title: "Plan fjernet",
                    description: venue.name,
                    variant: "info",
                    duration: 2200
                  });
                }}
                aria-label={`Fjern plan for ${venue.name}`}
                className="focus-ring grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-sand-100 hover:text-warm-600"
              >
                <X size={12} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
