"use client";

import {
  CheckCircle,
  CircleNotch,
  Eye,
  EyeSlash,
  ShieldCheck
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import { categories, categoryLabels, neighbourhoods } from "@/lib/data/taxonomy";
import {
  AGE_BANDS,
  loadOwnPublicProfile,
  upsertOwnPublicProfile,
  type FamilyPublicProfile,
  type FamilyVisibility
} from "@/lib/social";
import { createClient } from "@/lib/supabase/client";
import type { Family, Neighbourhood, VenueCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  primaryFamily: Family;
};

const EMPTY: Omit<FamilyPublicProfile, "familyId" | "familyName"> = {
  visibility: "minimal",
  searchable: false,
  neighbourhoods: [],
  interests: [],
  childAgeBands: [],
  description: null,
  coverUrl: null,
  showParentFirstNames: false
};

export function FamilyPublicEditor({ primaryFamily }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    setLoading(true);
    loadOwnPublicProfile(supabase, primaryFamily.id)
      .then((profile) => {
        if (cancelled) return;
        if (profile) {
          setDraft({
            visibility: profile.visibility,
            searchable: profile.searchable,
            neighbourhoods: profile.neighbourhoods,
            interests: profile.interests,
            childAgeBands: profile.childAgeBands,
            description: profile.description,
            coverUrl: profile.coverUrl,
            showParentFirstNames: profile.showParentFirstNames
          });
        }
      })
      .catch((error) => {
        if (cancelled) return;
        toast({
          title: "Kunne ikke hente profil",
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
  }, [supabase, primaryFamily.id, toast]);

  function toggle<T>(value: T, list: T[]): T[] {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
  }

  async function save() {
    if (!supabase) return;
    setSaving(true);
    try {
      await upsertOwnPublicProfile(supabase, primaryFamily.id, draft);
      toast({ title: "Familieprofil gemt", variant: "success" });
    } catch (error) {
      toast({
        title: "Kunne ikke gemme",
        description: error instanceof Error ? error.message : "Ukendt fejl",
        variant: "danger"
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const allowDescription = draft.visibility !== "minimal";
  const allowAvatar = draft.visibility !== "minimal";
  const allowParentNames = draft.visibility === "open";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="space-y-4"
    >
      {/* Searchable toggle */}
      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.16em] text-warm-500">
              Familie offentligt
            </p>
            <h2 className="mt-0.5 font-display text-lg font-semibold text-ink">
              Bliv synlig for andre familier
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Når jeres familie er synlig, kan andre forældre i jeres bydel finde og forbinde
              med jer. Børnenes navne og fotos er aldrig offentlige.
            </p>
          </div>
          <label
            className={cn(
              "flex items-center gap-2 rounded-pill px-3 py-2 text-xs font-semibold ring-1 transition-colors",
              draft.searchable
                ? "bg-sage-100 text-sage-700 ring-sage-200"
                : "bg-sunken text-muted ring-hairline"
            )}
          >
            <input
              type="checkbox"
              checked={draft.searchable}
              onChange={(event) => setDraft({ ...draft, searchable: event.target.checked })}
              className="h-4 w-4 accent-sage-500"
              aria-label="Søgbar"
            />
            {draft.searchable ? (
              <>
                <Eye size={13} weight="fill" aria-hidden="true" />
                Synlig
              </>
            ) : (
              <>
                <EyeSlash size={13} weight="fill" aria-hidden="true" />
                Skjult
              </>
            )}
          </label>
        </div>
      </section>

      {/* Visibility tier */}
      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <h3 className="font-display text-base font-semibold text-ink">Hvad må vi vise?</h3>
        <p className="mt-1 text-sm text-muted">
          Privatlivsindstilling. Du kan altid skifte tier — og du bestemmer selv felterne nedenfor.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <VisibilityCard
            value="minimal"
            current={draft.visibility}
            onChange={(visibility) => setDraft({ ...draft, visibility })}
            title="Minimal"
            description="Bydel + alder + interesser. Ingen beskrivelse, intet billede. Stærkest privatliv."
          />
          <VisibilityCard
            value="moderate"
            current={draft.visibility}
            onChange={(visibility) => setDraft({ ...draft, visibility })}
            title="Moderat"
            description="Det fra Minimal + kort familiebeskrivelse + valgfri familiebillede."
          />
          <VisibilityCard
            value="open"
            current={draft.visibility}
            onChange={(visibility) => setDraft({ ...draft, visibility })}
            title="Åben"
            description="Alt fra Moderat + valgfri visning af forældrenes fornavne (kun når I er forbundne)."
          />
        </div>
      </section>

      {/* Neighbourhoods */}
      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <h3 className="font-display text-base font-semibold text-ink">Bydele I færdes i</h3>
        <p className="mt-1 text-sm text-muted">Vælg de bydele andre familier kan finde jer i.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {neighbourhoods.map((hood) => {
            const active = draft.neighbourhoods.includes(hood);
            return (
              <button
                key={hood}
                type="button"
                onClick={() =>
                  setDraft({ ...draft, neighbourhoods: toggle(hood, draft.neighbourhoods) })
                }
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
      </section>

      {/* Age bands */}
      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <h3 className="font-display text-base font-semibold text-ink">Børnenes aldersgruppe</h3>
        <p className="mt-1 text-sm text-muted">
          Vi viser kun aldersbånd — aldrig præcise fødselsdatoer eller navne.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {AGE_BANDS.map((band) => {
            const active = draft.childAgeBands.includes(band.value);
            return (
              <button
                key={band.value}
                type="button"
                onClick={() =>
                  setDraft({ ...draft, childAgeBands: toggle(band.value, draft.childAgeBands) })
                }
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
      </section>

      {/* Interests */}
      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <h3 className="font-display text-base font-semibold text-ink">Interesser</h3>
        <p className="mt-1 text-sm text-muted">
          Hjælper andre familier med at finde jer ud fra fælles interesser.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((category) => {
            const active = draft.interests.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setDraft({ ...draft, interests: toggle(category, draft.interests) })
                }
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
      </section>

      {/* Description (moderate+) */}
      <section
        className={cn(
          "rounded-card bg-surface p-4 ring-1 ring-hairline",
          !allowDescription && "opacity-60"
        )}
      >
        <h3 className="font-display text-base font-semibold text-ink">Familiebeskrivelse</h3>
        <p className="mt-1 text-sm text-muted">
          {allowDescription
            ? "Et par linjer om jeres familie — hvor I bor, hvad I kan lide at lave."
            : "Skift til Moderat eller Åben for at tilføje en beskrivelse."}
        </p>
        <Textarea
          value={draft.description ?? ""}
          onChange={(event) => setDraft({ ...draft, description: event.target.value || null })}
          rows={3}
          disabled={!allowDescription}
          maxLength={500}
          placeholder="Vi er en familie på fire — Asta og Theo, plus to søvnige forældre på Nørrebro. Elsker café-formiddage, vandpytter og biblioteket på Blågårds Plads."
          className="mt-3"
        />
      </section>

      {/* Cover / family photo (moderate+) */}
      <section
        className={cn(
          "rounded-card bg-surface p-4 ring-1 ring-hairline",
          !allowAvatar && "opacity-60"
        )}
      >
        <h3 className="font-display text-base font-semibold text-ink">Familiebillede</h3>
        <p className="mt-1 text-sm text-muted">
          {allowAvatar
            ? "Et roligt familiebillede — gerne uden at vise børnenes ansigter direkte."
            : "Skift til Moderat eller Åben for at vise et billede."}
        </p>
        <div className="mt-3">
          <PhotoUploader
            value={draft.coverUrl ? [draft.coverUrl] : []}
            onChange={(next) => setDraft({ ...draft, coverUrl: next[0] ?? null })}
            label=""
          />
        </div>
      </section>

      {/* Parent names (open only) */}
      <section
        className={cn(
          "rounded-card bg-surface p-4 ring-1 ring-hairline",
          !allowParentNames && "opacity-60"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-ink">
              Vis forældres fornavne
            </h3>
            <p className="mt-1 text-sm text-muted">
              {allowParentNames
                ? "Når I er forbundne med en familie, kan de skrive direkte til den enkelte forælder ved navn."
                : "Kun tilgængeligt på “Åben”-niveau."}
            </p>
          </div>
          <input
            type="checkbox"
            checked={draft.showParentFirstNames}
            disabled={!allowParentNames}
            onChange={(event) =>
              setDraft({ ...draft, showParentFirstNames: event.target.checked })
            }
            className="h-5 w-5 accent-sage-500"
            aria-label="Vis forældrenes fornavne"
          />
        </div>
      </section>

      {/* Save bar */}
      <div className="sticky bottom-3 flex flex-wrap items-center gap-3 rounded-card bg-surface/95 p-3 shadow-soft ring-1 ring-hairline backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden="true" />
              Gemmer…
            </>
          ) : (
            <>
              <CheckCircle size={14} weight="fill" aria-hidden="true" />
              Gem familieprofil
            </>
          )}
        </Button>
        <p className="ml-auto inline-flex items-center gap-1 text-2xs text-subtle">
          <ShieldCheck size={11} weight="fill" aria-hidden="true" />
          Børnenes navne og fotos forbliver private.
        </p>
      </div>
    </form>
  );
}

function VisibilityCard({
  value,
  current,
  onChange,
  title,
  description
}: {
  value: FamilyVisibility;
  current: FamilyVisibility;
  onChange: (next: FamilyVisibility) => void;
  title: string;
  description: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={active}
      className={cn(
        "focus-ring rounded-lg p-3 text-left ring-1 transition-colors",
        active
          ? "bg-sage-50 text-sage-800 ring-sage-300"
          : "bg-sunken text-ink ring-hairline hover:bg-sand-100"
      )}
    >
      <p className="text-2xs font-bold uppercase tracking-[0.12em] text-muted">
        {title}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
    </button>
  );
}
