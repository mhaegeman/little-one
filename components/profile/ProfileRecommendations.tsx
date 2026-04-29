"use client";

import { ArrowSquareOut, CalendarDots, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import { VenueCard } from "@/components/discover/VenueCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { categoryBadgeVariant, categoryLabels } from "@/lib/data/taxonomy";
import { events as allEvents, venues as allVenues } from "@/lib/data/venues";
import { recommendEvents, recommendVenues } from "@/lib/profile";
import type { FamilyProfile } from "@/lib/types";
import { formatDanishDate, monthRangeLabel } from "@/lib/utils";

type Props = {
  profile: FamilyProfile | null;
  onTunePreferences: () => void;
};

export function ProfileRecommendations({ profile, onTunePreferences }: Props) {
  const venuePicks = useMemo(() => recommendVenues(profile, allVenues, 6), [profile]);
  const eventPicks = useMemo(() => recommendEvents(profile, allEvents, 4), [profile]);

  const hasInterests = (profile?.interests.length ?? 0) > 0;
  const hasNeighbourhoods = (profile?.neighbourhoods.length ?? 0) > 0;
  const hasAge =
    profile?.childAgeMinMonths !== null && profile?.childAgeMaxMonths !== null;
  const hasAnyPrefs = hasInterests || hasNeighbourhoods || hasAge;

  return (
    <div className="space-y-5">
      <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">For jer</p>
            <h2 className="mt-0.5 font-display text-2xl font-semibold text-ink">
              {hasAnyPrefs ? "Skræddersyede anbefalinger" : "Mest elskede steder"}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">
              {hasAnyPrefs
                ? "Vi blander interesser, bydele og barnets alder for at finde steder der passer til hverdagen."
                : "Tilføj interesser, bydele og en alder, så vi kan personalisere listen for jer."}
            </p>
          </div>
          {!hasAnyPrefs ? (
            <Button onClick={onTunePreferences}>
              <Sparkle size={14} weight="fill" aria-hidden="true" />
              Tilpas mine anbefalinger
            </Button>
          ) : null}
        </div>

        {hasAnyPrefs ? (
          <div className="mt-3 flex flex-wrap items-center gap-1">
            {profile?.interests.map((category) => (
              <Badge key={category} variant="sage">
                {categoryLabels[category]}
              </Badge>
            ))}
            {profile?.neighbourhoods.map((hood) => (
              <Badge key={hood} variant="sky">
                {hood}
              </Badge>
            ))}
            {hasAge ? (
              <Badge variant="neutral">
                {monthRangeLabel(
                  profile?.childAgeMinMonths ?? 0,
                  profile?.childAgeMaxMonths ?? 72
                )}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <Sparkle size={14} weight="fill" className="text-warm-500" aria-hidden="true" />
          <h3 className="font-display text-lg font-semibold text-ink">Steder I vil elske</h3>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {venuePicks.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <CalendarDots size={14} weight="fill" className="text-warm-500" aria-hidden="true" />
          <h3 className="font-display text-lg font-semibold text-ink">Kommende begivenheder</h3>
        </div>
        {eventPicks.length === 0 ? (
          <p className="rounded-card bg-surface p-4 text-sm text-muted ring-1 ring-hairline">
            Ingen kommende begivenheder lige nu — kig forbi om et par dage.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {eventPicks.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-1.5 rounded-card bg-surface p-3.5 ring-1 ring-hairline"
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={categoryBadgeVariant[event.category]}>
                    {categoryLabels[event.category]}
                  </Badge>
                  <span className="text-2xs font-semibold text-subtle">{event.neighbourhood}</span>
                </div>
                <h4 className="font-display text-base font-semibold text-ink">{event.title}</h4>
                <p className="line-clamp-2 text-sm leading-5 text-muted">{event.description}</p>
                <p className="text-xs font-semibold text-sage-700">
                  {formatDanishDate(event.dateStart, "EEEE d. MMM yyyy 'kl.' HH:mm")}
                </p>
                {event.bookingUrl ? (
                  <a
                    href={event.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex items-center gap-1 text-xs font-semibold text-warm-600 hover:text-warm-700"
                  >
                    Læs mere
                    <ArrowSquareOut size={11} weight="bold" aria-hidden="true" />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
