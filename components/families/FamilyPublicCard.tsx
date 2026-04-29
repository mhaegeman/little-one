"use client";

import {
  ArrowRight,
  Baby,
  CheckCircle,
  ChatsCircle,
  Clock,
  MapPin,
  ShieldCheck,
  UsersThree
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { categoryBadgeVariant } from "@/lib/data/taxonomy";
import { type FamilyConnection, type FamilyPublicProfile } from "@/lib/social";
import type { VenueCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  profile: FamilyPublicProfile;
  connection?: FamilyConnection;
  href?: string;
};

function StatusPill({ connection }: { connection?: FamilyConnection }) {
  const t = useTranslations("families.card");
  if (!connection) return null;
  if (connection.status === "accepted") {
    return (
      <Badge variant="success">
        <CheckCircle size={10} weight="fill" aria-hidden="true" />
        {t("connected")}
      </Badge>
    );
  }
  if (connection.status === "pending") {
    return (
      <Badge variant="warning">
        <Clock size={10} weight="fill" aria-hidden="true" />
        {t("pending")}
      </Badge>
    );
  }
  if (connection.status === "blocked") {
    return (
      <Badge variant="danger">
        <ShieldCheck size={10} weight="fill" aria-hidden="true" />
        {t("blocked")}
      </Badge>
    );
  }
  return null;
}

export function FamilyPublicCard({ profile, connection, href }: Props) {
  const t = useTranslations("families.card");
  const tBands = useTranslations("families.ageBands");
  const tTaxonomy = useTranslations("taxonomy");
  const target = href ?? `/families/${profile.familyId}`;
  const showAvatar = profile.visibility !== "minimal" && profile.coverUrl;
  const showDescription = profile.visibility !== "minimal" && profile.description;

  return (
    <Link
      href={target}
      className={cn(
        "focus-ring group block overflow-hidden rounded-card bg-surface ring-1 transition-colors duration-150 ease-nordic",
        connection?.status === "accepted"
          ? "ring-sage-300 hover:ring-sage-400"
          : "ring-hairline hover:ring-sage-200"
      )}
    >
      <div className="grid gap-0 sm:grid-cols-[120px_1fr]">
        {showAvatar ? (
          <div className="relative h-28 overflow-hidden bg-sunken sm:h-full">
            <img
              src={profile.coverUrl ?? ""}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="hidden h-full bg-gradient-to-br from-sage-100 via-canvas to-sand-100 sm:grid sm:place-items-center">
            <UsersThree size={32} weight="duotone" className="text-sage-700" aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-base font-semibold text-ink">
              {profile.familyName ?? t("fallbackName")}
            </h3>
            <StatusPill connection={connection} />
          </div>

          {profile.neighbourhoods.length > 0 ? (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
              <MapPin size={11} weight="fill" aria-hidden="true" />
              {profile.neighbourhoods.slice(0, 3).join(" · ")}
              {profile.neighbourhoods.length > 3 ? " …" : ""}
            </p>
          ) : null}

          {showDescription ? (
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">
              {profile.description}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1">
            {profile.childAgeBands.length > 0 ? (
              <Badge variant="sky">
                <Baby size={11} weight="fill" aria-hidden="true" />
                {profile.childAgeBands
                  .slice(0, 3)
                  .map((band) => tBands(String(band)))
                  .join(" · ")}
              </Badge>
            ) : null}
            {profile.interests.slice(0, 2).map((interest) => (
              <Badge key={interest} variant={categoryBadgeVariant[interest]}>
                {tTaxonomy(interest as VenueCategory)}
              </Badge>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-end gap-1.5 text-2xs font-semibold text-warm-600 group-hover:text-warm-700">
            {connection?.status === "accepted" ? (
              <>
                <ChatsCircle size={11} weight="fill" aria-hidden="true" />
                {t("messageThem")}
              </>
            ) : (
              <>
                {t("viewProfile")}
                <ArrowRight size={11} weight="bold" aria-hidden="true" />
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
