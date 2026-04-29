"use client";

import { Baby, Heart, MapPin, Star } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { MouseEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toaster";
import { useFavorites } from "@/hooks/useFavorites";
import { categoryBadgeVariant, categoryLabels } from "@/lib/data/taxonomy";
import type { Venue } from "@/lib/types";
import { cn, formatDistance, monthRangeLabel } from "@/lib/utils";

type Layout = "row" | "compact" | "tile";

function FavoriteButton({
  venue,
  size = "md"
}: {
  venue: Venue;
  size?: "sm" | "md";
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const saved = isFavorite(venue.id);

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const next = toggleFavorite(venue.id);
    toast({
      title: next ? "Gemt til favoritter" : "Fjernet fra favoritter",
      description: venue.name,
      variant: next ? "success" : "info",
      duration: 2200
    });
  }

  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const iconSize = size === "sm" ? 13 : 14;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? `Fjern ${venue.name} fra favoritter` : `Gem ${venue.name} til favoritter`}
      aria-pressed={saved}
      className={cn(
        "focus-ring grid place-items-center rounded-full bg-surface/95 shadow-sm ring-1 backdrop-blur transition-colors",
        dim,
        saved
          ? "text-warm-500 ring-warm-200 hover:bg-warm-50"
          : "text-muted ring-hairline hover:text-warm-500"
      )}
    >
      <Heart
        size={iconSize}
        weight={saved ? "fill" : "regular"}
        aria-hidden="true"
      />
    </button>
  );
}

export function VenueCard({
  venue,
  distanceKm,
  layout = "row",
  active,
  onHover
}: {
  venue: Venue;
  distanceKm?: number;
  layout?: Layout;
  active?: boolean;
  onHover?: () => void;
}) {
  if (layout === "compact") {
    return (
      <Link
        href={`/venues/${venue.id}`}
        onMouseEnter={onHover}
        className={cn(
          "focus-ring group relative flex gap-3 rounded-card bg-surface p-2.5 ring-1 transition-colors duration-150 ease-nordic",
          active ? "ring-sage-400 shadow-soft" : "ring-hairline hover:ring-sage-200"
        )}
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          <img
            src={venue.photos[0]}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1 py-0.5 pr-7">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-base font-semibold text-ink">
              {venue.name}
            </h3>
            <span className="shrink-0 inline-flex items-center gap-0.5 text-xs font-semibold text-muted">
              <Star size={12} weight="fill" className="text-warm-500" aria-hidden="true" />
              {venue.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">
            <span className="inline-flex items-center gap-0.5">
              <MapPin size={11} weight="fill" aria-hidden="true" />
              {venue.neighbourhood}
              {typeof distanceKm === "number" ? (
                <span className="text-subtle"> · {formatDistance(distanceKm)}</span>
              ) : null}
            </span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <Badge variant={categoryBadgeVariant[venue.category]}>
              {categoryLabels[venue.category]}
            </Badge>
            <Badge variant="neutral">
              {monthRangeLabel(venue.ageMinMonths, venue.ageMaxMonths)}
            </Badge>
          </div>
        </div>
        <span className="absolute right-2 top-2">
          <FavoriteButton venue={venue} size="sm" />
        </span>
      </Link>
    );
  }

  if (layout === "tile") {
    return (
      <Link
        href={`/venues/${venue.id}`}
        className="focus-ring group block overflow-hidden rounded-card bg-surface ring-1 ring-hairline transition-colors hover:ring-sage-300"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={venue.photos[0]}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2">
            <Badge variant={categoryBadgeVariant[venue.category]}>
              {categoryLabels[venue.category]}
            </Badge>
          </div>
          <div className="absolute right-2 top-2">
            <FavoriteButton venue={venue} />
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-base font-semibold text-ink">
              {venue.name}
            </h3>
            <span className="shrink-0 inline-flex items-center gap-0.5 text-xs font-semibold text-muted">
              <Star size={12} weight="fill" className="text-warm-500" aria-hidden="true" />
              {venue.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">
            {venue.neighbourhood}
            {typeof distanceKm === "number" ? (
              <span className="text-subtle"> · {formatDistance(distanceKm)}</span>
            ) : null}
          </p>
        </div>
      </Link>
    );
  }

  // row (default)
  return (
    <Link
      href={`/venues/${venue.id}`}
      className="focus-ring group grid overflow-hidden rounded-card bg-surface ring-1 ring-hairline transition-colors hover:ring-sage-300 sm:grid-cols-[140px_1fr]"
    >
      <div className="relative h-32 overflow-hidden sm:h-full">
        <img
          src={venue.photos[0]}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2">
          <Badge variant={categoryBadgeVariant[venue.category]}>
            {categoryLabels[venue.category]}
          </Badge>
        </div>
        <div className="absolute right-2 top-2">
          <FavoriteButton venue={venue} />
        </div>
      </div>
      <div className="min-w-0 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-ink">{venue.name}</h3>
          <span className="shrink-0 inline-flex items-center gap-0.5 text-xs font-semibold text-muted">
            <Star size={12} weight="fill" className="text-warm-500" aria-hidden="true" />
            {venue.rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <MapPin size={12} weight="fill" aria-hidden="true" />
          {venue.neighbourhood}
          {typeof distanceKm === "number" ? (
            <span className="text-subtle"> · {formatDistance(distanceKm)}</span>
          ) : null}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{venue.description}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1">
          <Badge variant="sky">
            <Baby size={11} weight="fill" aria-hidden="true" />
            {monthRangeLabel(venue.ageMinMonths, venue.ageMaxMonths)}
          </Badge>
          {venue.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
