"use client";

import { ArrowRight, Heart, MapPinned, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { categoryColors, categoryLabels } from "@/lib/data/taxonomy";
import { ROLE_LABELS_DA } from "@/lib/family";
import {
  COMPLETENESS_LABELS_DA,
  INDOOR_PREFERENCE_LABELS_DA,
  ageMonthsToLabel,
  profileCompleteness
} from "@/lib/profile";
import type { FamilyMember, FamilyProfile } from "@/lib/types";

type Props = {
  profile: FamilyProfile | null;
  members: FamilyMember[];
  onJumpTo: (tab: "preferences" | "recommendations" | "family") => void;
};

export function ProfileOverview({ profile, members, onJumpTo }: Props) {
  const completeness = profileCompleteness(profile);
  const interests = profile?.interests ?? [];
  const neighbourhoods = profile?.neighbourhoods ?? [];
  const indoorPreference = profile?.indoorPreference ?? "any";
  const childAgeMin = profile?.childAgeMinMonths ?? null;
  const childAgeMax = profile?.childAgeMaxMonths ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat lg:col-span-2">
        <div className="flex items-center gap-2 text-rust">
          <Sparkles size={18} aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-ink">Gør profilen klar</h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-ink/70">
          Jo mere du fortæller, jo bedre kuraterer vi steder, ture og begivenheder for jer.
        </p>

        {completeness.missing.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-mossDark/95 p-4 text-sm font-semibold text-white">
            Din profil er fuldt udfyldt. Tjek anbefalingerne — vi har skræddersyet dem til jer.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {completeness.missing.map((field) => (
              <li
                key={field}
                className="flex items-center justify-between gap-2 rounded-2xl bg-linen p-3 ring-1 ring-oat"
              >
                <span className="text-sm font-bold text-ink/75">
                  {COMPLETENESS_LABELS_DA[field]}
                </span>
                <button
                  type="button"
                  onClick={() => onJumpTo("preferences")}
                  className="focus-ring flex items-center gap-1 text-xs font-bold text-rust"
                >
                  Tilføj
                  <ArrowRight size={13} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/55">Interesser</p>
            {interests.length === 0 ? (
              <button
                type="button"
                onClick={() => onJumpTo("preferences")}
                className="focus-ring mt-2 inline-flex items-center gap-1 rounded-full bg-linen px-3 py-1.5 text-xs font-bold text-mossDark ring-1 ring-oat"
              >
                <Heart size={13} aria-hidden="true" /> Vælg jeres yndlingskategorier
              </button>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {interests.map((category) => (
                  <span
                    key={category}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${categoryColors[category]}`}
                  >
                    {categoryLabels[category]}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/55">
              Bydele I færdes i
            </p>
            {neighbourhoods.length === 0 ? (
              <button
                type="button"
                onClick={() => onJumpTo("preferences")}
                className="focus-ring mt-2 inline-flex items-center gap-1 rounded-full bg-linen px-3 py-1.5 text-xs font-bold text-mossDark ring-1 ring-oat"
              >
                <MapPinned size={13} aria-hidden="true" /> Tilføj bydele
              </button>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {neighbourhoods.map((hood) => (
                  <span
                    key={hood}
                    className="inline-flex items-center gap-1 rounded-full bg-skywash px-2.5 py-1 text-xs font-bold text-mossDark"
                  >
                    <MapPinned size={11} aria-hidden="true" />
                    {hood}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/55">Inde / ude</p>
            <p className="mt-2 text-sm font-semibold text-ink/75">
              {INDOOR_PREFERENCE_LABELS_DA[indoorPreference]}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/55">
              Barnets alder
            </p>
            {childAgeMin === null || childAgeMax === null ? (
              <button
                type="button"
                onClick={() => onJumpTo("preferences")}
                className="focus-ring mt-2 text-sm font-bold text-rust"
              >
                Sæt aldersinterval
              </button>
            ) : (
              <p className="mt-2 text-sm font-semibold text-ink/75">
                {ageMonthsToLabel(childAgeMin)} – {ageMonthsToLabel(childAgeMax)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => onJumpTo("recommendations")}>
            <Sparkles size={16} aria-hidden="true" />
            Se anbefalinger
          </Button>
          <Button variant="secondary" onClick={() => onJumpTo("preferences")}>
            <Heart size={16} aria-hidden="true" />
            Tilpas præferencer
          </Button>
        </div>
      </section>

      <section className="rounded-card bg-white p-5 shadow-soft ring-1 ring-oat">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rust">
            <Users size={18} aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-ink">Familien</h2>
          </div>
          <button
            type="button"
            onClick={() => onJumpTo("family")}
            className="focus-ring text-xs font-bold text-rust"
          >
            Se alle
          </button>
        </div>

        {members.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-linen p-3 text-sm font-semibold text-ink/65 ring-1 ring-oat">
            Når Supabase opretter familien for dig, dukker bedsteforældre, dagplejer og medforælder op her.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
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
                  className="flex items-center gap-3 rounded-2xl bg-linen p-2.5 ring-1 ring-oat"
                >
                  {member.profile?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.profile.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-2xl object-cover ring-2 ring-white"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white font-display text-sm font-semibold text-mossDark ring-2 ring-white">
                      {initials || "?"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{name}</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
                      {ROLE_LABELS_DA[member.role]}
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
