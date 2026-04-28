"use client";

import { CalendarDays, ExternalLink, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { VenueCard } from "@/components/discover/VenueCard";
import { Button } from "@/components/ui/Button";
import { categoryColors, categoryLabels } from "@/lib/data/taxonomy";
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
    <div className="space-y-6">
      <section className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rust">For jer</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">
              {hasAnyPrefs ? "Skræddersyede anbefalinger" : "Mest elskede steder"}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink/70">
              {hasAnyPrefs
                ? "Vi blander interesser, bydele og barnets alder for at finde steder der passer til hverdagen."
                : "Tilføj interesser, bydele og en alder, så vi kan personalisere listen for jer."}
            </p>
          </div>
          {!hasAnyPrefs ? (
            <Button onClick={onTunePreferences}>
              <Sparkles size={16} aria-hidden="true" />
              Tilpas mine anbefalinger
            </Button>
          ) : null}
        </div>

        {hasAnyPrefs ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
            {profile?.interests.map((category) => (
              <span
                key={category}
                className={`rounded-full px-2.5 py-1 ring-1 ${categoryColors[category]}`}
              >
                {categoryLabels[category]}
              </span>
            ))}
            {profile?.neighbourhoods.map((hood) => (
              <span
                key={hood}
                className="rounded-full bg-skywash px-2.5 py-1 text-mossDark"
              >
                {hood}
              </span>
            ))}
            {hasAge ? (
              <span className="rounded-full bg-linen px-2.5 py-1 text-ink/70 ring-1 ring-oat">
                {monthRangeLabel(
                  profile?.childAgeMinMonths ?? 0,
                  profile?.childAgeMaxMonths ?? 72
                )}
              </span>
            ) : null}
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-rust" aria-hidden="true" />
          <h3 className="font-display text-2xl font-semibold text-ink">Steder I vil elske</h3>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {venuePicks.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={18} className="text-rust" aria-hidden="true" />
          <h3 className="font-display text-2xl font-semibold text-ink">Kommende begivenheder</h3>
        </div>
        {eventPicks.length === 0 ? (
          <p className="rounded-card bg-white p-5 text-sm font-semibold text-ink/65 shadow-soft ring-1 ring-oat">
            Ingen kommende begivenheder lige nu — kig forbi om et par dage.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {eventPicks.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-2 rounded-card bg-white p-4 shadow-soft ring-1 ring-oat"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${categoryColors[event.category]}`}
                  >
                    {categoryLabels[event.category]}
                  </span>
                  <span className="text-xs font-bold text-ink/55">{event.neighbourhood}</span>
                </div>
                <h4 className="font-display text-lg font-semibold text-ink">{event.title}</h4>
                <p className="line-clamp-2 text-sm leading-5 text-ink/70">{event.description}</p>
                <p className="text-xs font-bold text-mossDark">
                  {formatDanishDate(event.dateStart, "EEEE d. MMM yyyy 'kl.' HH:mm")}
                </p>
                {event.bookingUrl ? (
                  <a
                    href={event.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-rust"
                  >
                    Læs mere
                    <ExternalLink size={12} aria-hidden="true" />
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
