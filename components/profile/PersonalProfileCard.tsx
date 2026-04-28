"use client";

import { Camera, CheckCircle2, Loader2, UserRound } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS_DA } from "@/lib/family";
import type { FamilyProfile, FamilyRole } from "@/lib/types";

type Props = {
  email: string | null;
  profile: FamilyProfile | null;
  onSave: (patch: Omit<FamilyProfile, "userId">) => Promise<void>;
};

export function PersonalProfileCard({ email, profile, onSave }: Props) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [pronouns, setPronouns] = useState(profile?.pronouns ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [role, setRole] = useState<FamilyRole>(profile?.preferredRole ?? "parent");
  const [locale, setLocale] = useState(profile?.preferredLocale ?? "da");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setDisplayName(profile?.displayName ?? "");
    setPronouns(profile?.pronouns ?? "");
    setBio(profile?.bio ?? "");
    setAvatarUrl(profile?.avatarUrl ?? "");
    setRole(profile?.preferredRole ?? "parent");
    setLocale(profile?.preferredLocale ?? "da");
  }, [profile]);

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
        preferredLocale: locale
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2400);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Det gik ikke at gemme.");
    }
  }

  const initials = (displayName || email || "?")
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <form onSubmit={submit} className="rounded-card bg-white p-6 shadow-soft ring-1 ring-oat">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-24 w-24 rounded-3xl object-cover ring-4 ring-linen"
            />
          ) : (
            <span className="grid h-24 w-24 place-items-center rounded-3xl bg-linen font-display text-3xl font-semibold text-mossDark ring-4 ring-linen">
              {initials || <UserRound size={32} aria-hidden="true" />}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rust">Din profil</p>
          <h2 className="font-display text-3xl font-semibold text-ink">
            {displayName || (email ? email.split("@")[0] : "Velkommen")}
          </h2>
          <p className="mt-1 text-sm font-bold text-ink/55">{email ?? "Ikke logget ind"}</p>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Det her ser dine bedsteforældre, familie og dagplejere, når I deler journalen.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            Visningsnavn
          </span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Sofie"
            className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            Pronominer
          </span>
          <input
            value={pronouns}
            onChange={(event) => setPronouns(event.target.value)}
            placeholder="hun, han, de"
            className="focus-ring h-12 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
          Profilbillede (URL)
        </span>
        <span className="flex h-12 items-center gap-2 rounded-xl bg-linen px-3 ring-1 ring-oat">
          <Camera size={17} className="text-ink/45" aria-hidden="true" />
          <input
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </span>
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
          Lille beskrivelse
        </span>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={3}
          placeholder="Mor til Asta og Theo, elsker brunch på Nørrebro."
          className="focus-ring w-full rounded-xl bg-linen p-3 text-sm font-semibold ring-1 ring-oat"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            Rolle
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ROLE_LABELS_DA) as FamilyRole[])
              .filter((roleKey) => roleKey !== "owner")
              .map((roleKey) => {
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

        <fieldset>
          <legend className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
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
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? (
            <>
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
              Gemmer...
            </>
          ) : (
            "Gem profil"
          )}
        </Button>
        {status === "saved" ? (
          <span className="flex items-center gap-1 text-sm font-bold text-mossDark">
            <CheckCircle2 size={17} aria-hidden="true" />
            Gemt
          </span>
        ) : null}
      </div>

      {status === "error" ? (
        <p className="mt-3 rounded-xl bg-rust/10 p-3 text-sm font-semibold text-rust">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
