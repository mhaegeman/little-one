"use client";

import { Crown, Globe, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS_DA } from "@/lib/family";
import { profileCompleteness } from "@/lib/profile";
import type { FamilyProfile } from "@/lib/types";

type Props = {
  email: string | null;
  profile: FamilyProfile | null;
  familyCount: number;
  ownerCount: number;
  onEdit: () => void;
};

export function ProfileHeader({ email, profile, familyCount, ownerCount, onEdit }: Props) {
  const completeness = profileCompleteness(profile);
  const displayName = profile?.displayName ?? (email ? email.split("@")[0] : "Velkommen");
  const initials = (profile?.displayName || email || "?")
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const role = profile?.preferredRole ?? "parent";
  const locale = profile?.preferredLocale ?? "da";

  return (
    <section className="overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-oat">
      <div className="relative h-32 bg-gradient-to-br from-moss via-mossDark to-rust sm:h-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_60%)]" />
      </div>

      <div className="px-5 pb-6 sm:px-7">
        <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end">
          <div className="relative">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white sm:h-28 sm:w-28"
              />
            ) : (
              <span className="grid h-24 w-24 place-items-center rounded-3xl bg-linen font-display text-3xl font-semibold text-mossDark ring-4 ring-white sm:h-28 sm:w-28">
                {initials || <UserRound size={32} aria-hidden="true" />}
              </span>
            )}
          </div>

          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rust">Din profil</p>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {displayName}
            </h1>
            {profile?.bio ? (
              <p className="mt-1 max-w-xl text-sm leading-6 text-ink/70">{profile.bio}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1 rounded-full bg-linen px-2.5 py-1 text-mossDark ring-1 ring-oat">
                <UserRound size={13} aria-hidden="true" />
                {ROLE_LABELS_DA[role]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-linen px-2.5 py-1 text-mossDark ring-1 ring-oat">
                <Globe size={13} aria-hidden="true" />
                {locale === "da" ? "Dansk" : "English"}
              </span>
              {ownerCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-butter px-2.5 py-1 text-ink">
                  <Crown size={13} aria-hidden="true" />
                  Familieejer
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-full bg-skywash px-2.5 py-1 text-mossDark">
                <ShieldCheck size={13} aria-hidden="true" />
                {familyCount === 0
                  ? "Ingen familie endnu"
                  : `${familyCount} ${familyCount === 1 ? "familie" : "familier"}`}
              </span>
            </div>
          </div>

          <div className="sm:self-end">
            <Button variant="secondary" onClick={onEdit} className="w-full sm:w-auto">
              <Settings2 size={16} aria-hidden="true" />
              Rediger profil
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-linen p-4 ring-1 ring-oat">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/55">
                Profilstyrke
              </p>
              <p className="font-display text-xl font-semibold text-ink">
                {completeness.percent}% færdig
              </p>
            </div>
            <p className="text-xs font-semibold text-ink/60">
              {completeness.score} af {completeness.total} felter udfyldt
            </p>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-moss to-mossDark transition-all"
              style={{ width: `${completeness.percent}%` }}
              role="progressbar"
              aria-valuenow={completeness.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
