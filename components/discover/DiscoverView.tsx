"use client";

import {
  Faders,
  Heart,
  ListBullets,
  MapTrifold,
  MagnifyingGlass,
  X
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { DiscoverMap } from "@/components/discover/DiscoverMap";
import { EventList } from "@/components/discover/EventList";
import { LocationControl, type UserLocation } from "@/components/discover/LocationControl";
import { TodayCard } from "@/components/discover/TodayCard";
import { VenueCard } from "@/components/discover/VenueCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { useDiscoverParams } from "@/hooks/useDiscoverParams";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocale } from "next-intl";
import { categories, neighbourhoods } from "@/lib/data/taxonomy";
import type { FamilyEvent, IndoorOutdoor, Neighbourhood, Venue, VenueCategory } from "@/lib/types";
import { cn, haversineKm, monthRangeLabel } from "@/lib/utils";

type DiscoverViewProps = {
  venues: Venue[];
  events: FamilyEvent[];
};

type ViewMode = "split" | "list" | "map";

export function DiscoverView({ venues, events }: DiscoverViewProps) {
  const t = useTranslations("discover");
  const tTaxonomy = useTranslations("taxonomy");
  const locale = useLocale();
  const { state, update, reset } = useDiscoverParams();
  const {
    categories: selectedCategories,
    neighbourhood,
    indoorOutdoor,
    openNow,
    ageMin,
    ageMax,
    query,
    view: viewMode,
    savedOnly
  } = state;

  const setNeighbourhood = (next: Neighbourhood | "all") => update({ neighbourhood: next });
  const setIndoorOutdoor = (next: IndoorOutdoor | "all") => update({ indoorOutdoor: next });
  const setOpenNow = (next: boolean) => update({ openNow: next });
  const setAgeMin = (next: number) => update({ ageMin: next });
  const setAgeMax = (next: number) => update({ ageMax: next });
  const setQuery = (next: string) => update({ query: next });
  const setViewMode = (next: ViewMode) => update({ view: next });
  const setSavedOnly = (next: boolean) => update({ savedOnly: next });

  const { favorites } = useFavorites();
  const [selectedVenueId, setSelectedVenueId] = useState<string | undefined>(venues[0]?.id);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

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
      const matchesSaved = !savedOnly || favoriteSet.has(venue.id);
      const haystack = `${venue.name} ${venue.description} ${venue.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());

      return (
        matchesCategory &&
        matchesNeighbourhood &&
        matchesIndoor &&
        matchesAge &&
        matchesOpen &&
        matchesSaved &&
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
    favoriteSet,
    indoorOutdoor,
    neighbourhood,
    openNow,
    query,
    savedOnly,
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
    update({
      categories: selectedCategories.includes(category)
        ? selectedCategories.filter((item) => item !== category)
        : [...selectedCategories, category]
    });
  }

  function resetFilters() {
    reset();
    setUserLocation(null);
  }

  const activeFilterCount =
    selectedCategories.length +
    (neighbourhood !== "all" ? 1 : 0) +
    (indoorOutdoor !== "all" ? 1 : 0) +
    (openNow ? 1 : 0) +
    (ageMin > 0 || ageMax < 72 ? 1 : 0) +
    (savedOnly ? 1 : 0) +
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
    <div className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <TodayCard
          venues={venues}
          userLocation={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null}
        />
        <PageHeader
          eyebrow="København"
          title={t("title")}
          description={t("subtitle")}
          action={
            <div className="flex items-center gap-2">
              <Badge variant="mint">{t("results", { count: filteredVenues.length })}</Badge>
              {process.env.NODE_ENV !== "production" ? (
                <Link
                  href="/admin/map-tool"
                  className="focus-ring inline-flex items-center gap-1 rounded-pill bg-sunken px-2 py-1 text-2xs font-semibold text-muted ring-1 ring-hairline hover:text-ink"
                >
                  <MapTrifold size={12} weight="bold" aria-hidden="true" />
                  Edit pins
                </Link>
              ) : null}
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
                    aria-label={t("clearSearch")}
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
            onClick={() => setSavedOnly(!savedOnly)}
            aria-pressed={savedOnly}
            className={cn(
              "focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ring-1 transition-colors",
              savedOnly
                ? "bg-peach-50 text-peach-ink ring-peach-200"
                : "bg-sunken text-muted ring-hairline hover:text-ink"
            )}
            title={`${favorites.length} ${t("saved")}`}
          >
            <Heart
              size={14}
              weight={savedOnly ? "fill" : "regular"}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">{t("saved")}</span>
            {favorites.length > 0 ? (
              <span
                className={cn(
                  "grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1 text-2xs font-bold",
                  savedOnly
                    ? "bg-peach-300 text-peach-ink"
                    : "bg-surface text-muted ring-1 ring-hairline"
                )}
              >
                {favorites.length}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-sunken px-3 text-sm font-semibold text-ink ring-1 ring-hairline transition-colors hover:bg-canvas"
          >
            <Faders size={15} weight="bold" aria-hidden="true" />
            {t("filters")}
            {activeFilterCount > 0 ? (
              <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-mint-300 px-1 text-2xs font-bold text-mint-ink">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          <div className="hidden lg:block">
            <SegmentedControl<ViewMode>
              ariaLabel={t("viewMode")}
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
              <ChipDismiss key={c} label={tTaxonomy(c)} onClear={() => toggleCategory(c)} />
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
            {savedOnly ? (
              <ChipDismiss label={t("saved")} onClear={() => setSavedOnly(false)} />
            ) : null}
            {openNow ? <ChipDismiss label={t("openNow")} onClear={() => setOpenNow(false)} /> : null}
            {(ageMin > 0 || ageMax < 72) ? (
              <ChipDismiss
                label={t("ageRange", { min: ageMin, max: ageMax })}
                onClear={() => {
                  setAgeMin(0);
                  setAgeMax(72);
                }}
              />
            ) : null}
            <button
              type="button"
              onClick={resetFilters}
              className="focus-ring ml-1 text-2xs font-bold uppercase tracking-[0.14em] text-peach-ink hover:text-peach-300"
            >
              {t("resetAll")}
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
                    {t("filters")} · {t("reset")}
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
            {t("reset")}
          </Button>
          <Button onClick={() => setFiltersOpen(false)}>{t("showResults", { count: filteredVenues.length })}</Button>
        </div>
      </Sheet>
    </div>
  );
}

function ChipDismiss({ label, onClear }: { label: string; onClear: () => void }) {
  const t = useTranslations("discover");
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-pill bg-mint-50 pl-2.5 pr-1 text-2xs font-semibold text-mint-ink ring-1 ring-mint-100">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={t("removeFilter", { label })}
        className="focus-ring grid h-5 w-5 place-items-center rounded-full hover:bg-mint-100"
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
  const t = useTranslations("discover");
  const tTaxonomy = useTranslations("taxonomy");
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-muted">
          <span>{t("age")}</span>
          <span className="font-semibold text-ink/80">
            {t("ageRange", { min: ageMin, max: ageMax })}
          </span>
        </div>
        <div className="space-y-2 rounded-lg bg-sunken p-3 ring-1 ring-hairline">
          <input
            aria-label={t("ageMinLabel")}
            type="range"
            min={0}
            max={72}
            value={ageMin}
            onChange={(event) => setAgeMin(Math.min(Number(event.target.value), ageMax))}
            className="w-full accent-mint-300"
          />
          <input
            aria-label={t("ageMaxLabel")}
            type="range"
            min={0}
            max={72}
            value={ageMax}
            onChange={(event) => setAgeMax(Math.max(Number(event.target.value), ageMin))}
            className="w-full accent-mint-300"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{t("category")}</p>
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
                    ? "bg-mint-300 text-mint-ink ring-mint-300"
                    : "bg-surface text-ink ring-hairline hover:bg-sunken"
                )}
              >
                {tTaxonomy(category as VenueCategory)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">{t("neighbourhood")}</span>
          <Select
            value={neighbourhood}
            onChange={(event) => setNeighbourhood(event.target.value as Neighbourhood | "all")}
          >
            <option value="all">{t("allNeighbourhoods")}</option>
            {neighbourhoods.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">{t("indoorOutdoor")}</span>
          <Select
            value={indoorOutdoor}
            onChange={(event) => setIndoorOutdoor(event.target.value as IndoorOutdoor | "all")}
          >
            <option value="all">{t("all")}</option>
            <option value="indoor">{t("indoor")}</option>
            <option value="outdoor">{t("outdoor")}</option>
          </Select>
        </label>
      </div>

      <label className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2.5 ring-1 ring-hairline">
        <span className="text-sm font-semibold text-ink">{t("openNow")}</span>
        <input
          type="checkbox"
          checked={openNow}
          onChange={(event) => setOpenNow(event.target.checked)}
          className="h-4 w-4 accent-mint-300"
        />
      </label>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{t("location")}</p>
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
