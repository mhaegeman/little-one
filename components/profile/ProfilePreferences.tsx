"use client";

import {
  BellRing,
  Camera,
  CheckCircle2,
  Heart,
  Loader2,
  MapPinned,
  Settings2,
  Sparkles,
  UserRound
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { categories, categoryLabels, neighbourhoods } from "@/lib/data/taxonomy";
import { ROLE_LABELS_DA } from "@/lib/family";
import { INDOOR_PREFERENCE_LABELS_DA, ageMonthsToLabel } from "@/lib/profile";
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

export function ProfilePreferences({ profile, onSave }: Props) {
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
        notifyEmail
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2400);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Det gik ikke at gemme.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <SectionCard
        icon={<UserRound size={18} aria-hidden="true" />}
        title="Personlig info"
        subtitle="Det her ser bedsteforældre, dagplejer og medforælder, når I deler journalen."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Visningsnavn">
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Sofie"
              className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
            />
          </Field>
          <Field label="Pronominer">
            <input
              value={pronouns}
              onChange={(event) => setPronouns(event.target.value)}
              placeholder="hun, han, de"
              className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
            />
          </Field>
        </div>

        <Field label="Profilbillede (URL)">
          <span className="flex h-12 items-center gap-2 rounded-xl bg-linen px-3 ring-1 ring-oat">
            <Camera size={17} className="text-ink/45" aria-hidden="true" />
            <input
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </span>
        </Field>

        <Field label="Lille beskrivelse">
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            placeholder="Mor til Asta og Theo, elsker brunch på Nørrebro."
            className="focus-ring w-full rounded-xl bg-linen p-3 text-sm font-semibold ring-1 ring-oat"
          />
        </Field>
      </SectionCard>

      <SectionCard
        icon={<Heart size={18} aria-hidden="true" />}
        title="Interesser"
        subtitle="Vi bruger dem til at samle anbefalinger på Opdag-fanen og i din profilfeed."
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = interests.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`focus-ring rounded-full px-3 py-2 text-xs font-bold ring-1 transition ${
                  active
                    ? "bg-moss text-white ring-moss"
                    : "bg-linen text-ink/72 ring-oat hover:bg-white"
                }`}
              >
                {categoryLabels[category]}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {(["any", "indoor", "outdoor"] as IndoorPreference[]).map((value) => {
            const active = indoorPreference === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setIndoorPreference(value)}
                className={`focus-ring rounded-2xl px-3 py-3 text-sm font-bold ring-1 transition ${
                  active ? "bg-moss text-white ring-moss" : "bg-linen text-ink/75 ring-oat hover:bg-white"
                }`}
              >
                {INDOOR_PREFERENCE_LABELS_DA[value]}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        icon={<MapPinned size={18} aria-hidden="true" />}
        title="Yndlingsbydele"
        subtitle="Vælg de bydele I færdes i, så vi prioriterer ture i kort afstand."
      >
        <div className="flex flex-wrap gap-2">
          {neighbourhoods.map((hood) => {
            const active = neighbourhoodPicks.includes(hood);
            return (
              <button
                key={hood}
                type="button"
                onClick={() => toggleNeighbourhood(hood)}
                className={`focus-ring rounded-full px-3 py-2 text-xs font-bold ring-1 transition ${
                  active
                    ? "bg-mossDark text-white ring-mossDark"
                    : "bg-linen text-ink/72 ring-oat hover:bg-white"
                }`}
              >
                {hood}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        icon={<Sparkles size={18} aria-hidden="true" />}
        title="Barnets alder"
        subtitle="Bruges til at filtrere steder og begivenheder, så det passer til den lille."
      >
        <label className="flex items-center justify-between gap-4 rounded-2xl bg-linen p-3 ring-1 ring-oat">
          <span className="text-sm font-bold text-ink/72">
            Tilpas anbefalinger til et aldersinterval
          </span>
          <input
            type="checkbox"
            checked={trackChild}
            onChange={(event) => setTrackChild(event.target.checked)}
            className="h-5 w-5 accent-moss"
          />
        </label>

        {trackChild ? (
          <div className="mt-4 space-y-3 rounded-2xl bg-linen p-4 ring-1 ring-oat">
            <div className="flex items-center justify-between text-sm font-bold text-ink/72">
              <span>Aldersinterval</span>
              <span>
                {ageMonthsToLabel(ageMin)} – {ageMonthsToLabel(ageMax)}
              </span>
            </div>
            <input
              aria-label="Minimum alder i måneder"
              type="range"
              min={0}
              max={72}
              value={ageMin}
              onChange={(event) =>
                setAgeMin(Math.min(Number(event.target.value), ageMax))
              }
              className="w-full accent-moss"
            />
            <input
              aria-label="Maksimum alder i måneder"
              type="range"
              min={0}
              max={72}
              value={ageMax}
              onChange={(event) =>
                setAgeMax(Math.max(Number(event.target.value), ageMin))
              }
              className="w-full accent-rust"
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        icon={<Settings2 size={18} aria-hidden="true" />}
        title="Konto"
        subtitle="Rolle, sprog og beskeder. Du kan altid ændre det her senere."
      >
        <fieldset>
          <legend className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            Rolle
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {SELECTABLE_ROLES.map((roleKey) => {
              const active = role === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setRole(roleKey)}
                  className={`focus-ring rounded-xl px-2 py-2 text-xs font-bold ring-1 transition ${
                    active
                      ? "bg-moss text-white ring-moss"
                      : "bg-linen text-ink/70 ring-oat hover:bg-white"
                  }`}
                >
                  {ROLE_LABELS_DA[roleKey]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            Sprog
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(["da", "en"] as const).map((value) => {
              const active = locale === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLocale(value)}
                  className={`focus-ring rounded-xl px-2 py-2 text-xs font-bold uppercase tracking-[0.18em] ring-1 transition ${
                    active
                      ? "bg-moss text-white ring-moss"
                      : "bg-linen text-ink/70 ring-oat hover:bg-white"
                  }`}
                >
                  {value === "da" ? "Dansk" : "English"}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-linen p-3 ring-1 ring-oat">
          <span className="flex items-start gap-2 text-sm font-bold text-ink/72">
            <BellRing size={16} className="mt-0.5 text-rust" aria-hidden="true" />
            E-mailbeskeder om nye anbefalinger og familieaktivitet
          </span>
          <input
            type="checkbox"
            checked={notifyEmail}
            onChange={(event) => setNotifyEmail(event.target.checked)}
            className="h-5 w-5 accent-moss"
          />
        </label>
      </SectionCard>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-card bg-white/95 p-4 shadow-soft ring-1 ring-oat backdrop-blur">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? (
            <>
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
              Gemmer...
            </>
          ) : (
            "Gem ændringer"
          )}
        </Button>
        {status === "saved" ? (
          <span className="flex items-center gap-1 text-sm font-bold text-mossDark">
            <CheckCircle2 size={17} aria-hidden="true" />
            Gemt
          </span>
        ) : null}
        {status === "error" ? (
          <span className="text-sm font-semibold text-rust">{errorMessage}</span>
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
    <section className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat sm:p-6">
      <div className="flex items-center gap-2 text-rust">
        {icon}
        <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      </div>
      {subtitle ? (
        <p className="mt-1 text-sm leading-6 text-ink/70">{subtitle}</p>
      ) : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
        {label}
      </span>
      {children}
    </label>
  );
}
