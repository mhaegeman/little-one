"use client";

import { Faders, MagnifyingGlass, UsersThree, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo, useState } from "react";
import { FamilyPublicCard } from "@/components/families/FamilyPublicCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toaster";
import { categories, categoryLabels, neighbourhoods } from "@/lib/data/taxonomy";
import {
  AGE_BANDS,
  discoverFamilies,
  loadConnectionsForFamily,
  type FamilyConnection,
  type FamilyPublicProfile
} from "@/lib/social";
import { createClient } from "@/lib/supabase/client";
import type { Family, Neighbourhood, VenueCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  me: { userId: string; email: string | null };
  primaryFamily: Family;
};

export function FamilyDiscover({ me, primaryFamily }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<FamilyPublicProfile[]>([]);
  const [connections, setConnections] = useState<FamilyConnection[]>([]);
  const [query, setQuery] = useState("");
  const [neighbourhoodFilter, setNeighbourhoodFilter] = useState<Neighbourhood[]>([]);
  const [interestFilter, setInterestFilter] = useState<VenueCategory[]>([]);
  const [bandFilter, setBandFilter] = useState<number[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      discoverFamilies(supabase, {
        neighbourhoods: neighbourhoodFilter.length ? neighbourhoodFilter : undefined,
        interests: interestFilter.length ? interestFilter : undefined,
        childAgeBands: bandFilter.length ? bandFilter : undefined,
        excludeFamilyIds: [primaryFamily.id]
      }),
      loadConnectionsForFamily(supabase, primaryFamily.id)
    ])
      .then(([families, conns]) => {
        if (cancelled) return;
        setResults(families);
        setConnections(conns);
      })
      .catch((error) => {
        if (cancelled) return;
        toast({
          title: "Kunne ikke hente familier",
          description: error instanceof Error ? error.message : "Ukendt fejl",
          variant: "danger"
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, primaryFamily.id, neighbourhoodFilter, interestFilter, bandFilter, toast]);

  // Connection lookup by other family id (for status pills).
  const connectionByFamily = useMemo(() => {
    const map = new Map<string, FamilyConnection>();
    for (const conn of connections) {
      const otherId =
        conn.requesterFamilyId === primaryFamily.id
          ? conn.addresseeFamilyId
          : conn.requesterFamilyId;
      map.set(otherId, conn);
    }
    return map;
  }, [connections, primaryFamily.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter((profile) => {
      const haystack = `${profile.familyName ?? ""} ${profile.description ?? ""} ${profile.neighbourhoods.join(" ")} ${profile.interests.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [results, query]);

  function toggle<T>(value: T, list: T[]): T[] {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
  }

  const activeFilterCount =
    neighbourhoodFilter.length + interestFilter.length + bandFilter.length;

  function resetFilters() {
    setNeighbourhoodFilter([]);
    setInterestFilter([]);
    setBandFilter([]);
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-card bg-surface p-2 ring-1 ring-hairline">
        <div className="min-w-0 flex-1">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Søg efter familienavn, bydel eller interesse…"
            leadingIcon={<MagnifyingGlass size={14} weight="bold" aria-hidden="true" />}
            trailingIcon={
              query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Ryd søgning"
                  className="focus-ring grid h-5 w-5 place-items-center rounded-md hover:bg-sunken"
                >
                  <X size={11} weight="bold" aria-hidden="true" />
                </button>
              ) : null
            }
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-sunken px-3 text-sm font-semibold text-ink ring-1 ring-hairline hover:bg-sand-100"
        >
          <Faders size={15} weight="bold" aria-hidden="true" />
          Filtre
          {activeFilterCount > 0 ? (
            <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-sage-500 px-1 text-2xs font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UsersThree size={20} weight="duotone" aria-hidden="true" />}
          title="Ingen familier matcher endnu"
          description={
            activeFilterCount > 0
              ? "Prøv at fjerne nogle filtre — fællesskabet er stadig ungt."
              : "Inviter andre forældre til at oprette deres familieprofil — eller del jeres egen profil offentligt for at blive fundet."
          }
          action={
            activeFilterCount > 0 ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                <X size={12} weight="bold" aria-hidden="true" />
                Nulstil filtre
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {filtered.map((profile) => (
            <li key={profile.familyId}>
              <FamilyPublicCard profile={profile} connection={connectionByFamily.get(profile.familyId)} />
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtre"
        description={`${filtered.length} familier matcher`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-2xs font-bold uppercase tracking-[0.12em] text-muted">
              Bydel
            </p>
            <div className="flex flex-wrap gap-1.5">
              {neighbourhoods.map((hood) => {
                const active = neighbourhoodFilter.includes(hood);
                return (
                  <button
                    key={hood}
                    type="button"
                    onClick={() => setNeighbourhoodFilter(toggle(hood, neighbourhoodFilter))}
                    className={cn(
                      "focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
                      active
                        ? "bg-sage-500 text-white ring-sage-500"
                        : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                    )}
                  >
                    {hood}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-2xs font-bold uppercase tracking-[0.12em] text-muted">
              Børnenes alder
            </p>
            <div className="flex flex-wrap gap-1.5">
              {AGE_BANDS.map((band) => {
                const active = bandFilter.includes(band.value);
                return (
                  <button
                    key={band.value}
                    type="button"
                    onClick={() => setBandFilter(toggle(band.value, bandFilter))}
                    className={cn(
                      "focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
                      active
                        ? "bg-sage-500 text-white ring-sage-500"
                        : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                    )}
                  >
                    {band.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-2xs font-bold uppercase tracking-[0.12em] text-muted">
              Interesser
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => {
                const active = interestFilter.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setInterestFilter(toggle(category, interestFilter))}
                    className={cn(
                      "focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
                      active
                        ? "bg-sage-500 text-white ring-sage-500"
                        : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                    )}
                  >
                    {categoryLabels[category]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-2 border-t border-hairline pt-4">
          <Button variant="ghost" size="md" onClick={resetFilters}>
            <X size={14} weight="bold" aria-hidden="true" />
            Nulstil
          </Button>
          <Button onClick={() => setFiltersOpen(false)}>Vis {filtered.length}</Button>
        </div>
      </Sheet>

      {/* Hint to opt in if I haven't yet — surfaced in Profile editor */}
      {me ? null : null}
    </section>
  );
}
