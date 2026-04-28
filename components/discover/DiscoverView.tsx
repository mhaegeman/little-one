"use client";

import { Filter, ListFilter, MapPinned, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { DiscoverMap } from "@/components/discover/DiscoverMap";
import { EventList } from "@/components/discover/EventList";
import { VenueCard } from "@/components/discover/VenueCard";
import { Button } from "@/components/ui/Button";
import { categories, categoryLabels, neighbourhoods } from "@/lib/data/taxonomy";
import type { FamilyEvent, IndoorOutdoor, Neighbourhood, Venue, VenueCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type DiscoverViewProps = {
  venues: Venue[];
  events: FamilyEvent[];
};

export function DiscoverView({ venues, events }: DiscoverViewProps) {
  const [selectedCategories, setSelectedCategories] = useState<VenueCategory[]>([]);
  const [neighbourhood, setNeighbourhood] = useState<Neighbourhood | "all">("all");
  const [indoorOutdoor, setIndoorOutdoor] = useState<IndoorOutdoor | "all">("all");
  const [openNow, setOpenNow] = useState(false);
  const [ageMin, setAgeMin] = useState(0);
  const [ageMax, setAgeMax] = useState(72);
  const [query, setQuery] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState<string | undefined>(venues[0]?.id);

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(venue.category);
      const matchesNeighbourhood =
        neighbourhood === "all" || venue.neighbourhood === neighbourhood;
      const matchesIndoor =
        indoorOutdoor === "all" ||
        venue.indoorOutdoor === indoorOutdoor ||
        venue.indoorOutdoor === "both";
      const matchesAge = venue.ageMinMonths <= ageMax && venue.ageMaxMonths >= ageMin;
      const matchesOpen = !openNow || isProbablyOpenNow(venue);
      const haystack = `${venue.name} ${venue.description} ${venue.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());

      return (
        matchesCategory &&
        matchesNeighbourhood &&
        matchesIndoor &&
        matchesAge &&
        matchesOpen &&
        matchesQuery
      );
    });
  }, [ageMax, ageMin, indoorOutdoor, neighbourhood, openNow, query, selectedCategories, venues]);

  const selectedVenueStillVisible = filteredVenues.some((venue) => venue.id === selectedVenueId);
  const mapSelection = selectedVenueStillVisible ? selectedVenueId : filteredVenues[0]?.id;

  function toggleCategory(category: VenueCategory) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  function resetFilters() {
    setSelectedCategories([]);
    setNeighbourhood("all");
    setIndoorOutdoor("all");
    setOpenNow(false);
    setAgeMin(0);
    setAgeMax(72);
    setQuery("");
  }

  return (
    <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-rust">København</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">
              Opdag
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-ink/70">
              Kuraterede steder, rolige pauser og små oplevelser for børn fra 0 til 6 år.
            </p>
          </div>
          <div className="rounded-card bg-white px-4 py-3 shadow-soft ring-1 ring-oat">
            <p className="text-sm font-bold text-mossDark">{filteredVenues.length} steder</p>
            <p className="text-xs font-medium text-ink/60">Seedet med lokale kilder</p>
          </div>
        </div>

        <section className="mt-6 rounded-card bg-[#FFFDF8] p-4 shadow-soft ring-1 ring-oat/70">
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <FilterPanel
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              neighbourhood={neighbourhood}
              setNeighbourhood={setNeighbourhood}
              indoorOutdoor={indoorOutdoor}
              setIndoorOutdoor={setIndoorOutdoor}
              openNow={openNow}
              setOpenNow={setOpenNow}
              ageMin={ageMin}
              setAgeMin={setAgeMin}
              ageMax={ageMax}
              setAgeMax={setAgeMax}
              query={query}
              setQuery={setQuery}
              resetFilters={resetFilters}
            />
            <div className="min-h-[420px]">
              <DiscoverMap
                venues={filteredVenues}
                selectedVenueId={mapSelection}
                onSelect={setSelectedVenueId}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <ListFilter size={19} className="text-rust" aria-hidden="true" />
              <h2 className="font-display text-2xl font-semibold">Steder</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-card bg-white p-5 shadow-soft ring-1 ring-oat/70">
            <div className="flex items-center gap-2 text-rust">
              <MapPinned size={20} aria-hidden="true" />
              <h2 className="font-display text-2xl font-semibold text-ink">Næste gode match</h2>
            </div>
            {filteredVenues.slice(0, 4).map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => setSelectedVenueId(venue.id)}
                className="focus-ring mt-4 block w-full rounded-xl bg-linen p-3 text-left transition hover:bg-oat/70"
              >
                <span className="text-sm font-bold text-ink">{venue.name}</span>
                <span className="mt-1 block text-xs font-medium text-ink/62">
                  {categoryLabels[venue.category]} · {venue.neighbourhood}
                </span>
              </button>
            ))}
          </aside>
        </section>

        <EventList events={events} />
      </div>
    </div>
  );
}

type FilterPanelProps = {
  selectedCategories: VenueCategory[];
  toggleCategory: (category: VenueCategory) => void;
  neighbourhood: Neighbourhood | "all";
  setNeighbourhood: (neighbourhood: Neighbourhood | "all") => void;
  indoorOutdoor: IndoorOutdoor | "all";
  setIndoorOutdoor: (value: IndoorOutdoor | "all") => void;
  openNow: boolean;
  setOpenNow: (value: boolean) => void;
  ageMin: number;
  setAgeMin: (value: number) => void;
  ageMax: number;
  setAgeMax: (value: number) => void;
  query: string;
  setQuery: (value: string) => void;
  resetFilters: () => void;
};

function FilterPanel({
  selectedCategories,
  toggleCategory,
  neighbourhood,
  setNeighbourhood,
  indoorOutdoor,
  setIndoorOutdoor,
  openNow,
  setOpenNow,
  ageMin,
  setAgeMin,
  ageMax,
  setAgeMax,
  query,
  setQuery,
  resetFilters
}: FilterPanelProps) {
  return (
    <div className="rounded-card bg-linen p-4 ring-1 ring-oat">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-rust" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold">Filtre</h2>
        </div>
        <Button variant="ghost" className="h-9 px-3" onClick={resetFilters}>
          <X size={16} aria-hidden="true" />
          Nulstil
        </Button>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-ink/72">Søg</span>
        <span className="flex h-11 items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-oat">
          <Search size={17} className="text-ink/45" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Cafe, legeplads, Østerbro..."
          />
        </span>
      </label>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-ink/72">
          <span>Alder</span>
          <span>
            {ageMin}-{ageMax} mdr.
          </span>
        </div>
        <div className="space-y-3 rounded-xl bg-white p-3 ring-1 ring-oat">
          <input
            aria-label="Minimum alder i måneder"
            type="range"
            min={0}
            max={72}
            value={ageMin}
            onChange={(event) => setAgeMin(Math.min(Number(event.target.value), ageMax))}
            className="w-full accent-moss"
          />
          <input
            aria-label="Maksimum alder i måneder"
            type="range"
            min={0}
            max={72}
            value={ageMax}
            onChange={(event) => setAgeMax(Math.max(Number(event.target.value), ageMin))}
            className="w-full accent-rust"
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-bold text-ink/72">Kategori</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = selectedCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={cn(
                  "focus-ring rounded-full px-3 py-2 text-xs font-bold ring-1 transition",
                  active
                    ? "bg-moss text-white ring-moss"
                    : "bg-white text-ink/72 ring-oat hover:bg-[#FFFDF8]"
                )}
              >
                {categoryLabels[category]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <label>
          <span className="mb-2 block text-sm font-bold text-ink/72">Bydel</span>
          <select
            value={neighbourhood}
            onChange={(event) => setNeighbourhood(event.target.value as Neighbourhood | "all")}
            className="focus-ring h-11 w-full rounded-xl bg-white px-3 text-sm font-semibold ring-1 ring-oat"
          >
            <option value="all">Alle bydele</option>
            {neighbourhoods.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold text-ink/72">Inde / ude</span>
          <select
            value={indoorOutdoor}
            onChange={(event) => setIndoorOutdoor(event.target.value as IndoorOutdoor | "all")}
            className="focus-ring h-11 w-full rounded-xl bg-white px-3 text-sm font-semibold ring-1 ring-oat"
          >
            <option value="all">Alle</option>
            <option value="indoor">Indendørs</option>
            <option value="outdoor">Udendørs</option>
          </select>
        </label>
      </div>

      <label className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-3 ring-1 ring-oat">
        <span className="text-sm font-bold text-ink/72">Åbent nu</span>
        <input
          type="checkbox"
          checked={openNow}
          onChange={(event) => setOpenNow(event.target.checked)}
          className="h-5 w-5 accent-moss"
        />
      </label>
    </div>
  );
}

function isProbablyOpenNow(venue: Venue) {
  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  return (
    venue.openingHours.periods?.some((period) => {
      const coversDay =
        period.days === "mon-sun" ||
        period.days.includes(dayKeys[day]) ||
        (period.days === "mon-fri" && day >= 1 && day <= 5) ||
        (period.days === "sat-sun" && (day === 0 || day === 6)) ||
        (period.days === "tue-sun" && day !== 1) ||
        (period.days === "wed-sun" && day >= 3);

      const [openHour, openMinute] = period.open.split(":").map(Number);
      const [closeHour, closeMinute] = period.close.split(":").map(Number);
      const open = openHour * 60 + openMinute;
      const close = closeHour * 60 + closeMinute;

      return coversDay && minutes >= open && minutes <= close;
    }) ?? false
  );
}
