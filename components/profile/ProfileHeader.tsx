"use client";

import {
  Crown,
  Globe,
  ShieldCheck,
  SlidersHorizontal,
  UserCircle
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { profileCompleteness } from "@/lib/services/profile";
import type { FamilyProfile } from "@/lib/types";

type Props = {
  email: string | null;
  profile: FamilyProfile | null;
  familyCount: number;
  ownerCount: number;
  onEdit: () => void;
};

export function ProfileHeader({ email, profile, familyCount, ownerCount, onEdit }: Props) {
  const t = useTranslations("profileHeader");
  const tRoles = useTranslations("roles");
  const completeness = profileCompleteness(profile);
  const displayName = profile?.displayName ?? (email ? email.split("@")[0] : t("eyebrow"));
  const initials = (profile?.displayName || email || "?")
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const role = profile?.preferredRole ?? "parent";
  const locale = profile?.preferredLocale ?? "da";

  return (
    <section className="overflow-hidden rounded-card bg-surface ring-1 ring-hairline">
      <div className="relative h-24 bg-gradient-to-br from-mint-300 via-mint-ink to-mint-ink sm:h-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_60%)]" />
      </div>

      <div className="px-5 pb-5 sm:px-6">
        <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end">
          <div className="relative">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-surface sm:h-24 sm:w-24"
              />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-sunken font-display text-2xl font-semibold text-mint-ink ring-4 ring-surface sm:h-24 sm:w-24">
                {initials || <UserCircle size={28} weight="duotone" aria-hidden="true" />}
              </span>
            )}
          </div>

          <div className="flex-1">
            <p className="text-2xs font-bold uppercase tracking-[0.16em] text-peach-300">
              {t("eyebrow")}
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              {displayName}
            </h1>
            {profile?.bio ? (
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted">{profile.bio}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-pill bg-sunken px-2 py-0.5 text-2xs font-semibold text-muted ring-1 ring-hairline">
                <UserCircle size={11} weight="fill" aria-hidden="true" />
                {tRoles(role)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-pill bg-sunken px-2 py-0.5 text-2xs font-semibold text-muted ring-1 ring-hairline">
                <Globe size={11} weight="fill" aria-hidden="true" />
                {locale === "da" ? "Dansk" : "English"}
              </span>
              {ownerCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-pill bg-[#FBF1D9] px-2 py-0.5 text-2xs font-semibold text-warning ring-1 ring-[#F0DFB1]">
                  <Crown size={11} weight="fill" aria-hidden="true" />
                  {t("familyOwner")}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-pill bg-sky-100 px-2 py-0.5 text-2xs font-semibold text-info ring-1 ring-sky-200">
                <ShieldCheck size={11} weight="fill" aria-hidden="true" />
                {familyCount === 0
                  ? t("noFamily")
                  : t("familyCount", { count: familyCount })}
              </span>
            </div>
          </div>

          <div className="sm:self-end">
            <Button variant="secondary" onClick={onEdit} className="w-full sm:w-auto">
              <SlidersHorizontal size={14} weight="bold" aria-hidden="true" />
              {t("editProfile")}
            </Button>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-sunken p-3 ring-1 ring-hairline">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-2xs font-bold uppercase tracking-[0.14em] text-subtle">
                {t("strengthLabel")}
              </p>
              <p className="font-display text-base font-semibold text-ink">
                {t("percentDone", { percent: completeness.percent })}
              </p>
            </div>
            <p className="text-xs font-semibold text-muted">
              {t("fieldsDone", { score: completeness.score, total: completeness.total })}
            </p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-mint-300 transition-all"
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
