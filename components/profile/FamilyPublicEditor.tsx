"use client";

import {
  CheckCircle,
  CircleNotch,
  Eye,
  EyeSlash,
  ShieldCheck
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import { categories, neighbourhoods } from "@/lib/data/taxonomy";
import {
  AGE_BAND_VALUES,
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
  const t = useTranslations("families.publicEditor");
  const tSection = useTranslations("families.publicEditor.section");
  const tVisibility = useTranslations("families.publicEditor.visibility");
  const tBands = useTranslations("families.ageBands");
  const tTaxonomy = useTranslations("taxonomy");
  const tCommon = useTranslations("common");
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
          title: t("errorTitle"),
          description: error instanceof Error ? error.message : tCommon("unknownError"),
          variant: "danger"
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, primaryFamily.id]);

  function toggle<T>(value: T, list: T[]): T[] {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
  }

  async function save() {
    if (!supabase) return;
    setSaving(true);
    try {
      await upsertOwnPublicProfile(supabase, primaryFamily.id, draft);
      toast({ title: t("savedToast"), variant: "success" });
    } catch (error) {
      toast({
        title: t("saveError"),
        description: error instanceof Error ? error.message : tCommon("unknownError"),
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
      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.16em] text-peach-300">
              {tSection("publicTitle")}
            </p>
            <h2 className="mt-0.5 font-display text-lg font-semibold text-ink">
              {tSection("publicHeading")}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">{tSection("publicBody")}</p>
          </div>
          <label
            className={cn(
              "flex items-center gap-2 rounded-pill px-3 py-2 text-xs font-semibold ring-1 transition-colors",
              draft.searchable
                ? "bg-mint-50 text-mint-ink ring-mint-100"
                : "bg-sunken text-muted ring-hairline"
            )}
          >
            <input
              type="checkbox"
              checked={draft.searchable}
              onChange={(event) => setDraft({ ...draft, searchable: event.target.checked })}
              className="h-4 w-4 accent-mint-300"
              aria-label={tSection("visible")}
            />
            {draft.searchable ? (
              <>
                <Eye size={13} weight="fill" aria-hidden="true" />
                {tSection("visible")}
              </>
            ) : (
              <>
                <EyeSlash size={13} weight="fill" aria-hidden="true" />
                {tSection("hidden")}
              </>
            )}
          </label>
        </div>
      </section>

      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <h3 className="font-display text-base font-semibold text-ink">{tSection("visibilityTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{tSection("visibilityBody")}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <VisibilityCard
            value="minimal"
            current={draft.visibility}
            onChange={(visibility) => setDraft({ ...draft, visibility })}
            title={tVisibility("minimal.title")}
            description={tVisibility("minimal.body")}
          />
          <VisibilityCard
            value="moderate"
            current={draft.visibility}
            onChange={(visibility) => setDraft({ ...draft, visibility })}
            title={tVisibility("moderate.title")}
            description={tVisibility("moderate.body")}
          />
          <VisibilityCard
            value="open"
            current={draft.visibility}
            onChange={(visibility) => setDraft({ ...draft, visibility })}
            title={tVisibility("open.title")}
            description={tVisibility("open.body")}
          />
        </div>
      </section>

      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <h3 className="font-display text-base font-semibold text-ink">{tSection("neighbourhoodsTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{tSection("neighbourhoodsBody")}</p>
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
                    ? "bg-mint-300 text-white ring-mint-300"
                    : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                )}
              >
                {hood}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <h3 className="font-display text-base font-semibold text-ink">{tSection("ageBandsTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{tSection("ageBandsBody")}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {AGE_BAND_VALUES.map((band) => {
            const active = draft.childAgeBands.includes(band);
            return (
              <button
                key={band}
                type="button"
                onClick={() =>
                  setDraft({ ...draft, childAgeBands: toggle(band, draft.childAgeBands) })
                }
                className={cn(
                  "focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
                  active
                    ? "bg-mint-300 text-white ring-mint-300"
                    : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                )}
              >
                {tBands(String(band))}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-card bg-surface p-4 ring-1 ring-hairline">
        <h3 className="font-display text-base font-semibold text-ink">{tSection("interestsTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{tSection("interestsBody")}</p>
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
                    ? "bg-mint-300 text-white ring-mint-300"
                    : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                )}
              >
                {tTaxonomy(category as VenueCategory)}
              </button>
            );
          })}
        </div>
      </section>

      <section
        className={cn(
          "rounded-card bg-surface p-4 ring-1 ring-hairline",
          !allowDescription && "opacity-60"
        )}
      >
        <h3 className="font-display text-base font-semibold text-ink">{tSection("descriptionTitle")}</h3>
        <p className="mt-1 text-sm text-muted">
          {allowDescription ? tSection("descriptionBody") : tSection("descriptionUpgrade")}
        </p>
        <Textarea
          value={draft.description ?? ""}
          onChange={(event) => setDraft({ ...draft, description: event.target.value || null })}
          rows={3}
          disabled={!allowDescription}
          maxLength={500}
          placeholder={tSection("descriptionPlaceholder")}
          className="mt-3"
        />
      </section>

      <section
        className={cn(
          "rounded-card bg-surface p-4 ring-1 ring-hairline",
          !allowAvatar && "opacity-60"
        )}
      >
        <h3 className="font-display text-base font-semibold text-ink">{tSection("photoTitle")}</h3>
        <p className="mt-1 text-sm text-muted">
          {allowAvatar ? tSection("photoBody") : tSection("photoUpgrade")}
        </p>
        <div className="mt-3">
          <PhotoUploader
            value={draft.coverUrl ? [draft.coverUrl] : []}
            onChange={(next) => setDraft({ ...draft, coverUrl: next[0] ?? null })}
            label=""
          />
        </div>
      </section>

      <section
        className={cn(
          "rounded-card bg-surface p-4 ring-1 ring-hairline",
          !allowParentNames && "opacity-60"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-ink">
              {tSection("parentNamesTitle")}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {allowParentNames ? tSection("parentNamesBody") : tSection("parentNamesUpgrade")}
            </p>
          </div>
          <input
            type="checkbox"
            checked={draft.showParentFirstNames}
            disabled={!allowParentNames}
            onChange={(event) =>
              setDraft({ ...draft, showParentFirstNames: event.target.checked })
            }
            className="h-5 w-5 accent-mint-300"
            aria-label={tSection("parentNamesTitle")}
          />
        </div>
      </section>

      <div className="sticky bottom-3 flex flex-wrap items-center gap-3 rounded-card bg-surface/95 p-3 shadow-soft ring-1 ring-hairline backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden="true" />
              {t("saving")}
            </>
          ) : (
            <>
              <CheckCircle size={14} weight="fill" aria-hidden="true" />
              {t("saveButton")}
            </>
          )}
        </Button>
        <p className="ml-auto inline-flex items-center gap-1 text-2xs text-subtle">
          <ShieldCheck size={11} weight="fill" aria-hidden="true" />
          {t("footerNote")}
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
          ? "bg-mint-50 text-mint-ink ring-mint-200"
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
