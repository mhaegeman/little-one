"use client";

import { ArrowRight, Heart, MapPinArea, Sparkle, Users } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ageMonthsToLabel,
  profileCompleteness
} from "@/lib/profile";
import type { FamilyMember, FamilyProfile, VenueCategory } from "@/lib/types";

type Props = {
  profile: FamilyProfile | null;
  members: FamilyMember[];
  onJumpTo: (tab: "preferences" | "recommendations" | "family" | "saved") => void;
};

export function ProfileOverview({ profile, members, onJumpTo }: Props) {
  const t = useTranslations("profileOverview");
  const tTaxonomy = useTranslations("taxonomy");
  const tRoles = useTranslations("roles");
  const tPrefs = useTranslations("prefs");

  const completeness = profileCompleteness(profile);
  const interests = profile?.interests ?? [];
  const neighbourhoods = profile?.neighbourhoods ?? [];
  const indoorPreference = profile?.indoorPreference ?? "any";
  const childAgeMin = profile?.childAgeMinMonths ?? null;
  const childAgeMax = profile?.childAgeMaxMonths ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-card bg-surface p-5 ring-1 ring-hairline lg:col-span-2">
        <div className="flex items-center gap-2">
          <Sparkle size={16} weight="fill" className="text-peach-300" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold text-ink">{t("readyTitle")}</h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted">
          {t("readyBody")}
        </p>

        {completeness.missing.length === 0 ? (
          <p className="mt-3 rounded-lg bg-mint-50 p-3 text-sm font-semibold text-mint-ink ring-1 ring-mint-100">
            {t("profileComplete")}
          </p>
        ) : (
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {completeness.missing.map((field) => (
              <li
                key={field}
                className="flex items-center justify-between gap-2 rounded-lg bg-sunken p-2.5 ring-1 ring-hairline"
              >
                <span className="text-sm font-semibold text-ink">
                  {t(`completeness.${field}`)}
                </span>
                <button
                  type="button"
                  onClick={() => onJumpTo("preferences")}
                  className="focus-ring inline-flex items-center gap-1 rounded-md text-2xs font-bold uppercase tracking-wide text-peach-ink hover:text-peach-ink"
                >
                  {t("add")}
                  <ArrowRight size={11} weight="bold" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.14em] text-subtle">
              {t("interests")}
            </p>
            {interests.length === 0 ? (
              <button
                type="button"
                onClick={() => onJumpTo("preferences")}
                className="focus-ring mt-1.5 inline-flex items-center gap-1 rounded-pill bg-sunken px-2.5 py-1 text-xs font-semibold text-muted ring-1 ring-hairline hover:bg-sand-100"
              >
                <Heart size={12} weight="fill" aria-hidden="true" />
                {t("chooseCategories")}
              </button>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {interests.map((category) => (
                  <Badge key={category} variant="sage">
                    {tTaxonomy(category as VenueCategory)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.14em] text-subtle">
              {t("yourNeighbourhoods")}
            </p>
            {neighbourhoods.length === 0 ? (
              <button
                type="button"
                onClick={() => onJumpTo("preferences")}
                className="focus-ring mt-1.5 inline-flex items-center gap-1 rounded-pill bg-sunken px-2.5 py-1 text-xs font-semibold text-muted ring-1 ring-hairline hover:bg-sand-100"
              >
                <MapPinArea size={12} weight="fill" aria-hidden="true" />
                {t("addNeighbourhoods")}
              </button>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {neighbourhoods.map((hood) => (
                  <Badge key={hood} variant="sky">
                    <MapPinArea size={10} weight="fill" aria-hidden="true" />
                    {hood}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.14em] text-subtle">
              {t("indoorOutdoor")}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-ink">
              {indoorPreference === "any"
                ? tPrefs("indoorAny")
                : indoorPreference === "indoor"
                  ? tPrefs("indoorIndoors")
                  : tPrefs("indoorOutdoors")}
            </p>
          </div>

          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.14em] text-subtle">
              {t("childAge")}
            </p>
            {childAgeMin === null || childAgeMax === null ? (
              <button
                type="button"
                onClick={() => onJumpTo("preferences")}
                className="focus-ring mt-1.5 text-sm font-semibold text-peach-ink hover:text-peach-ink"
              >
                {t("setAgeRange")}
              </button>
            ) : (
              <p className="mt-1.5 text-sm font-semibold text-ink">
                {ageMonthsToLabel(childAgeMin)} – {ageMonthsToLabel(childAgeMax)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => onJumpTo("recommendations")}>
            <Sparkle size={14} weight="fill" aria-hidden="true" />
            {t("seeRecommendations")}
          </Button>
          <Button variant="secondary" onClick={() => onJumpTo("preferences")}>
            <Heart size={14} weight="fill" aria-hidden="true" />
            {t("customisePreferences")}
          </Button>
        </div>
      </section>

      <section className="rounded-card bg-surface p-5 ring-1 ring-hairline">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} weight="fill" className="text-mint-ink" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-ink">{t("familyTitle")}</h2>
          </div>
          <button
            type="button"
            onClick={() => onJumpTo("family")}
            className="focus-ring text-2xs font-bold uppercase tracking-wide text-peach-ink hover:text-peach-ink"
          >
            {t("seeAll")}
          </button>
        </div>

        {members.length === 0 ? (
          <p className="mt-3 rounded-lg bg-sunken p-2.5 text-sm font-semibold text-muted ring-1 ring-hairline">
            {t("noFamilyWaiting")}
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {members.slice(0, 5).map((member) => {
              const name = member.profile?.displayName ?? member.displayName ?? "Familie";
              const initials = name
                .split(/\s+/)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("")
                .slice(0, 2);
              return (
                <li
                  key={member.id}
                  className="flex items-center gap-2.5 rounded-lg bg-sunken p-2 ring-1 ring-hairline"
                >
                  {member.profile?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.profile.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-lg object-cover ring-2 ring-surface"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface font-display text-xs font-semibold text-mint-ink ring-2 ring-surface">
                      {initials || "?"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{name}</p>
                    <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-subtle">
                      {tRoles(member.role)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
