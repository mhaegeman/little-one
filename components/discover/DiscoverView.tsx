"use client";

import {
  Faders,
  ListBullets,
  MapTrifold,
  MagnifyingGlass,
  X
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { DiscoverMap } from "@/components/discover/DiscoverMap";
import { EventList } from "@/components/discover/EventList";
import { LocationControl, type UserLocation } from "@/components/discover/LocationControl";
import { VenueCard } from "@/components/discover/VenueCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { categories, categoryLabels, neighbourhoods } from "@/lib/data/taxonomy";
import type { FamilyEvent, IndoorOutdoor, Neighbourhood, Venue, VenueCategory } from "@/lib/types";
import { cn, haversineKm } from "@/lib/utils";

type DiscoverViewProps = {
  venues: Venue[];
  events: FamilyEvent[];
};

type ViewMode = "split" | "list" | "map";

export function DiscoverView({ venues, events }: DiscoverViewProps) {
  const t = useTranslations("discover");
  const [selectedCategories, setSelectedCategories] = useState<VenueCategory[]>([]);
  const [neighbourhood, setNeighbourhood] = useState<Neighbourhood | "all">("all");
  const [indoorOutdoor, setIndoorOutdoor] = useState<IndoorOutdoor | "all">("all");
  const [openNow, setOpenNow] = useState(false);
  const [ageMin, setAgeMin] = useState(0);
  const [ageMax, setAgeMax] = useState(72);
  const [query, setQuery] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState<string | undefined>(venues[0]?.id);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredVenues = useMemo(() => {
    const filtered = venues.filter((venue) => {
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

    if (!userLocation) return filtered;

    return [...filtered].sort(
      (a, b) =>
        haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
        haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
    );
  }, [
    ageMax,
    ageMin,
    indoorOutdoor,
    neighbourhood,
    openNow,
    query,
    selectedCategories,
    userLocation,
    venues
  ]);

  const distances = useMemo(() => {
    if (!userLocation) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const venue of venues) {
      map.set(venue.id, haversineKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng));
    }
    return map;
  }, [userLocation, venues]);

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
    setUserLocation(null);
  }

  const activeFilterCount =
    selectedCategories.length +
    (neighbourhood !== "all" ? 1 : 0) +
    (indoorOutdoor !== "all" ? 1 : 0) +
    (openNow ? 1 : 0) +
    (ageMin > 0 || ageMax < 72 ? 1 : 0) +
    (query ? 1 : 0);

  const filterPanel = (
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
      resetFilters={resetFilters}
      userLocation={userLocation}
      setUserLocation={setUserLocation}
    />
  );

  return (
    <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          eyebrow="København"
          title={t("title")}
          description={t("subtitle")}
          action={
            <div className="flex items-center gap-2">
              <Badge variant="sage">{t("results", { count: filteredVenues.length })}</Badge>
            </div>
          }
        />

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-card bg-surface p-2 ring-1 ring-hairline">
          <div className="min-w-0 flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              leadingIcon={<MagnifyingGlass size={15} weight="bold" aria-hidden="true" />}
              trailingIcon={
                query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Ryd søgning"
                    className="focus-ring grid h-5 w-5 place-items-center rounded-md hover:bg-sunken"
                  >
                    <X size={12} weight="bold" aria-hidden="true" />
                  </button>
                ) : null
              }
              className="ring-0 hover:bg-sunken/40"
            />
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-sunken px-3 text-sm font-semibold text-ink ring-1 ring-hairline transition-colors hover:bg-sand-100"
          >
            <Faders size={15} weight="bold" aria-hidden="true" />
            {t("filters")}
            {activeFilterCount > 0 ? (
              <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-sage-500 px-1 text-2xs font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          <div className="hidden lg:block">
            <SegmentedControl<ViewMode>
              ariaLabel="Visning"
              value={viewMode}
              onChange={setViewMode}
              options={[
                {
                  value: "split",
                  label: t("split"),
                  icon: (
                    <span className="inline-flex">
                      <ListBullets size={13} weight="bold" aria-hidden="true" />
                      <MapTrifold size={13} weight="bold" aria-hidden="true" className="-ml-0.5" />
                    </span>
                  )
                },
                {
                  value: "list",
                  label: t("list"),
                  icon: <ListBullets size={14} weight="bold" aria-hidden="true" />
                },
                {
                  value: "map",
                  label: t("map"),
                  icon: <MapTrifold size={14} weight="bold" aria-hidden="true" />
                }
              ]}
            />
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {selectedCategories.map((c) => (
              <ChipDismiss key={c} label={categoryLabels[c]} onClear={() => toggleCategory(c)} />
            ))}
            {neighbourhood !== "all" ? (
              <ChipDismiss label={neighbourhood} onClear={() => setNeighbourhood("all")} />
            ) : null}
            {indoorOutdoor !== "all" ? (
              <ChipDismiss
                label={indoorOutdoor === "indoor" ? t("indoor") : t("outdoor")}
                onClear={() => setIndoorOutdoor("all")}
              />
            ) : null}
            {openNow ? <ChipDismiss label={t("openNow")} onClear={() => setOpenNow(false)} /> : null}
            {(ageMin > 0 || ageMax < 72) ? (
              <ChipDismiss
                label={`${ageMin}–${ageMax} mdr.`}
                onClear={() => {
                  setAgeMin(0);
                  setAgeMax(72);
                }}
              />
            ) : null}
            <button
              type="button"
              onClick={resetFilters}
              className="focus-ring ml-1 text-2xs font-bold uppercase tracking-wide text-warm-600 hover:text-warm-700"
            >
              Nulstil alle
            </button>
          </div>
        ) : null}

        {/* Split layout */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Venue list column */}
          <div className={cn(viewMode === "map" ? "hidden lg:hidden" : "block")}>
            {filteredVenues.length === 0 ? (
              <div className="rounded-card bg-surface p-8 text-center ring-1 ring-hairline">
                <MagnifyingGlass size={28} className="mx-auto text-subtle" aria-hidden="true" />
                <h3 className="mt-2 font-display text-lg font-semibold">{t("noResults")}</h3>
                <p className="mt-1 text-sm text-muted">{t("noResultsHint")}</p>
                <div className="mt-3">
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    {t("filters")} · Nulstil
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    distanceKm={distances.get(venue.id)}
                    layout="compact"
                    active={venue.id === mapSelection}
                    onHover={() => setSelectedVenueId(venue.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Map column */}
          <div className={cn(viewMode === "list" ? "hidden lg:hidden" : "block")}>
            <div className="sticky top-4 overflow-hidden rounded-card ring-1 ring-hairline">
              <div className="h-[calc(100vh-12rem)] min-h-[420px]">
                <DiscoverMap
                  venues={filteredVenues}
                  selectedVenueId={mapSelection}
                  onSelect={setSelectedVenueId}
                  userLocation={userLocation}
                />
              </div>
            </div>
          </div>
        </div>

        <EventList events={events} />
      </div>

      {/* Filters sheet */}
      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t("filters")}
        description={t("results", { count: filteredVenues.length })}
        side="right"
        size="md"
      >
        {filterPanel}
        <div className="mt-6 flex items-center justify-between gap-2 border-t border-hairline pt-4">
          <Button variant="ghost" size="md" onClick={resetFilters}>
            <X size={14} weight="bold" aria-hidden="true" />
            Nulstil
          </Button>
          <Button onClick={() => setFiltersOpen(false)}>Vis {filteredVenues.length} steder</Button>
        </div>
      </Sheet>
    </div>
  );
}

function ChipDismiss({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-pill bg-sage-100 pl-2.5 pr-1 text-2xs font-semibold text-sage-700 ring-1 ring-sage-200">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Fjern ${label}`}
        className="focus-ring grid h-5 w-5 place-items-center rounded-full hover:bg-sage-200"
      >
        <X size={11} weight="bold" aria-hidden="true" />
      </button>
    </span>
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
  resetFilters: () => void;
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
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
  userLocation,
  setUserLocation
}: FilterPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-muted">
          <span>Alder</span>
          <span className="font-semibold text-ink/80">
            {ageMin}–{ageMax} mdr.
          </span>
        </div>
        <div className="space-y-2 rounded-lg bg-sunken p-3 ring-1 ring-hairline">
          <input
            aria-label="Minimum alder i måneder"
            type="range"
            min={0}
            max={72}
            value={ageMin}
            onChange={(event) => setAgeMin(Math.min(Number(event.target.value), ageMax))}
            className="w-full accent-sage-500"
          />
          <input
            aria-label="Maksimum alder i måneder"
            type="range"
            min={0}
            max={72}
            value={ageMax}
            onChange={(event) => setAgeMax(Math.max(Number(event.target.value), ageMin))}
            className="w-full accent-sage-500"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Kategori</p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => {
            const active = selectedCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={cn(
                  "focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
                  active
                    ? "bg-sage-500 text-white ring-sage-500"
                    : "bg-surface text-ink ring-hairline hover:bg-sunken"
                )}
              >
                {categoryLabels[category]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Bydel</span>
          <Select
            value={neighbourhood}
            onChange={(event) => setNeighbourhood(event.target.value as Neighbourhood | "all")}
          >
            <option value="all">Alle bydele</option>
            {neighbourhoods.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Inde / ude</span>
          <Select
            value={indoorOutdoor}
            onChange={(event) => setIndoorOutdoor(event.target.value as IndoorOutdoor | "all")}
          >
            <option value="all">Alle</option>
            <option value="indoor">Indendørs</option>
            <option value="outdoor">Udendørs</option>
          </Select>
        </label>
      </div>

      <label className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2.5 ring-1 ring-hairline">
        <span className="text-sm font-semibold text-ink">Åbent nu</span>
        <input
          type="checkbox"
          checked={openNow}
          onChange={(event) => setOpenNow(event.target.checked)}
          className="h-4 w-4 accent-sage-500"
        />
      </label>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Lokation</p>
        <LocationControl userLocation={userLocation} onChange={setUserLocation} />
      </div>
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
