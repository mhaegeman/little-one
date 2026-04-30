"use client";

import {
  BellRinging,
  CheckCircle,
  CircleNotch,
  Heart,
  MapPinArea,
  Sparkle,
  SlidersHorizontal,
  UserCircle
} from "@phosphor-icons/react/dist/ssr";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import { categories, neighbourhoods } from "@/lib/data/taxonomy";
import { ageMonthsToLabel } from "@/lib/services/profile";
import type {
  FamilyProfile,
  FamilyRole,
  IndoorPreference,
  Neighbourhood,
  VenueCategory
} from "@/lib/types";

type Props = {
  profile: FamilyProfile | null;
  onSave: (patch: Omit<FamilyProfile, "userId">) => Promise<void>;
};

const SELECTABLE_ROLES: FamilyRole[] = ["parent", "family", "caregiver"];
const INDOOR_OPTIONS: IndoorPreference[] = ["any", "indoor", "outdoor"];

export function ProfilePreferences({ profile, onSave }: Props) {
  const t = useTranslations("prefs");
  const tRoles = useTranslations("roles");
  const tTaxonomy = useTranslations("taxonomy");
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState<FamilyRole>("parent");
  const [locale, setLocale] = useState("da");
  const [interests, setInterests] = useState<VenueCategory[]>([]);
  const [neighbourhoodPicks, setNeighbourhoodPicks] = useState<Neighbourhood[]>([]);
  const [indoorPreference, setIndoorPreference] = useState<IndoorPreference>("any");
  const [ageMin, setAgeMin] = useState(0);
  const [ageMax, setAgeMax] = useState(72);
  const [trackChild, setTrackChild] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const indoorLabels: Record<IndoorPreference, string> = {
    any: t("indoorAny"),
    indoor: t("indoorIndoors"),
    outdoor: t("indoorOutdoors")
  };

  useEffect(() => {
    setDisplayName(profile?.displayName ?? "");
    setPronouns(profile?.pronouns ?? "");
    setBio(profile?.bio ?? "");
    setAvatarUrl(profile?.avatarUrl ?? "");
    setRole(profile?.preferredRole ?? "parent");
    setLocale(profile?.preferredLocale ?? "da");
    setInterests(profile?.interests ?? []);
    setNeighbourhoodPicks(profile?.neighbourhoods ?? []);
    setIndoorPreference(profile?.indoorPreference ?? "any");
    setNotifyEmail(profile?.notifyEmail ?? true);
    if (profile?.childAgeMinMonths !== null && profile?.childAgeMaxMonths !== null) {
      setAgeMin(profile?.childAgeMinMonths ?? 0);
      setAgeMax(profile?.childAgeMaxMonths ?? 72);
      setTrackChild(true);
    } else {
      setAgeMin(0);
      setAgeMax(72);
      setTrackChild(false);
    }
  }, [profile]);

  function toggleCategory(category: VenueCategory) {
    setInterests((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  function toggleNeighbourhood(name: Neighbourhood) {
    setNeighbourhoodPicks((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setErrorMessage("");
    try {
      await onSave({
        displayName: displayName.trim() || null,
        pronouns: pronouns.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        preferredRole: role,
        preferredLocale: locale,
        interests,
        neighbourhoods: neighbourhoodPicks,
        indoorPreference,
        childAgeMinMonths: trackChild ? ageMin : null,
        childAgeMaxMonths: trackChild ? ageMax : null,
        notifyEmail,
        onboardingCompletedAt: profile?.onboardingCompletedAt ?? null
      });
      setStatus("saved");
      toast({
        title: t("profileSaved"),
        description: t("profileSavedBody"),
        variant: "success"
      });
      setTimeout(() => setStatus("idle"), 2400);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("saveFailed");
      setStatus("error");
      setErrorMessage(message);
      toast({
        title: t("saveFailed"),
        description: message,
        variant: "danger"
      });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <SectionCard
        icon={<UserCircle size={16} weight="fill" className="text-sage-700" aria-hidden="true" />}
        title={t("personalInfo")}
        subtitle={t("personalInfoSubtitle")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("displayName")}>
            <Input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Sofie"
            />
          </Field>
          <Field label={t("pronouns")}>
            <Input
              value={pronouns}
              onChange={(event) => setPronouns(event.target.value)}
              placeholder="she/her, he/him, they/them"
            />
          </Field>
        </div>

        <PhotoUploader
          value={avatarUrl ? [avatarUrl] : []}
          onChange={(next) => setAvatarUrl(next[0] ?? "")}
          label={t("avatar")}
        />

        <Field label={t("bio")}>
          <Textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            placeholder="Mum to Asta and Theo, loves brunch in Nørrebro."
          />
        </Field>
      </SectionCard>

      <SectionCard
        icon={<Heart size={16} weight="fill" className="text-warm-500" aria-hidden="true" />}
        title={t("interests")}
        subtitle={t("interestsSubtitle")}
      >
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => {
            const active = interests.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                  active
                    ? "bg-sage-500 text-white ring-sage-500"
                    : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                }`}
              >
                {tTaxonomy(category)}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {INDOOR_OPTIONS.map((value) => {
            const active = indoorPreference === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setIndoorPreference(value)}
                className={`focus-ring rounded-lg px-3 py-2.5 text-sm font-semibold ring-1 transition-colors ${
                  active
                    ? "bg-sage-500 text-white ring-sage-500"
                    : "bg-surface text-ink ring-hairline hover:bg-sunken"
                }`}
              >
                {indoorLabels[value]}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        icon={<MapPinArea size={16} weight="fill" className="text-info" aria-hidden="true" />}
        title={t("neighbourhoods")}
        subtitle={t("neighbourhoodsSubtitle")}
      >
        <div className="flex flex-wrap gap-1.5">
          {neighbourhoods.map((hood) => {
            const active = neighbourhoodPicks.includes(hood);
            return (
              <button
                key={hood}
                type="button"
                onClick={() => toggleNeighbourhood(hood)}
                className={`focus-ring rounded-pill px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                  active
                    ? "bg-sage-700 text-white ring-sage-700"
                    : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                }`}
              >
                {hood}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        icon={<Sparkle size={16} weight="fill" className="text-warm-500" aria-hidden="true" />}
        title={t("childAge")}
        subtitle={t("childAgeSubtitle")}
      >
        <label className="flex items-center justify-between gap-3 rounded-lg bg-sunken p-2.5 ring-1 ring-hairline">
          <span className="text-sm font-semibold text-ink">
            {t("customiseByAge")}
          </span>
          <input
            type="checkbox"
            checked={trackChild}
            onChange={(event) => setTrackChild(event.target.checked)}
            className="h-4 w-4 accent-sage-500"
          />
        </label>

        {trackChild ? (
          <div className="mt-3 space-y-2 rounded-lg bg-sunken p-3 ring-1 ring-hairline">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>{t("ageRange")}</span>
              <span className="text-ink">
                {ageMonthsToLabel(ageMin)} – {ageMonthsToLabel(ageMax)}
              </span>
            </div>
            <input
              aria-label={t("ageRange")}
              type="range"
              min={0}
              max={72}
              value={ageMin}
              onChange={(event) => setAgeMin(Math.min(Number(event.target.value), ageMax))}
              className="w-full accent-sage-500"
            />
            <input
              aria-label={t("ageRange")}
              type="range"
              min={0}
              max={72}
              value={ageMax}
              onChange={(event) => setAgeMax(Math.max(Number(event.target.value), ageMin))}
              className="w-full accent-sage-500"
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        icon={<SlidersHorizontal size={16} weight="bold" className="text-sage-700" aria-hidden="true" />}
        title={t("accountSection")}
        subtitle={t("accountSubtitle")}
      >
        <fieldset>
          <legend className="mb-1.5 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
            {t("roleLegend")}
          </legend>
          <div className="grid grid-cols-3 gap-1.5">
            {SELECTABLE_ROLES.map((roleKey) => {
              const active = role === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setRole(roleKey)}
                  className={`focus-ring rounded-lg px-2 py-2 text-xs font-semibold ring-1 transition-colors ${
                    active
                      ? "bg-sage-500 text-white ring-sage-500"
                      : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                  }`}
                >
                  {tRoles(roleKey)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-3">
          <legend className="mb-1.5 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
            {t("languageLegend")}
          </legend>
          <div className="grid grid-cols-2 gap-1.5">
            {(["da", "en"] as const).map((value) => {
              const active = locale === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLocale(value)}
                  className={`focus-ring rounded-lg px-2 py-2 text-xs font-semibold uppercase tracking-[0.16em] ring-1 transition-colors ${
                    active
                      ? "bg-sage-500 text-white ring-sage-500"
                      : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                  }`}
                >
                  {value === "da" ? "Dansk" : "English"}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-sunken p-2.5 ring-1 ring-hairline">
          <span className="flex items-start gap-1.5 text-sm font-semibold text-ink">
            <BellRinging size={14} weight="fill" className="mt-0.5 text-warm-500" aria-hidden="true" />
            {t("notifications")}
          </span>
          <input
            type="checkbox"
            checked={notifyEmail}
            onChange={(event) => setNotifyEmail(event.target.checked)}
            className="h-4 w-4 accent-sage-500"
          />
        </label>
      </SectionCard>

      <div className="sticky bottom-3 flex flex-wrap items-center gap-3 rounded-card bg-surface/95 p-3 shadow-soft ring-1 ring-hairline backdrop-blur">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? (
            <>
              <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden="true" />
              {t("savingIndicator")}
            </>
          ) : (
            t("saveChanges")
          )}
        </Button>
        {status === "saved" ? (
          <span className="flex items-center gap-1 text-sm font-semibold text-sage-700">
            <CheckCircle size={14} weight="fill" aria-hidden="true" />
            {t("savedIndicator")}
          </span>
        ) : null}
        {status === "error" ? (
          <span className="text-sm font-semibold text-danger">{errorMessage}</span>
        ) : null}
      </div>
    </form>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card bg-surface p-4 ring-1 ring-hairline sm:p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      </div>
      {subtitle ? <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
