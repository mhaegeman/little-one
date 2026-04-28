import { Baby, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { categoryColors, categoryLabels } from "@/lib/data/taxonomy";
import type { Venue } from "@/lib/types";
import { monthRangeLabel } from "@/lib/utils";

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      href={`/venues/${venue.id}`}
      className="focus-ring group grid overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-oat/70 transition hover:-translate-y-0.5 hover:ring-moss/30 sm:grid-cols-[156px_1fr]"
    >
      <div className="relative h-40 overflow-hidden sm:h-full">
        <img
          src={venue.photos[0]}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge className={categoryColors[venue.category]}>{categoryLabels[venue.category]}</Badge>
        </div>
      </div>
      <div className="min-w-0 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">{venue.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-ink/62">
              <MapPin size={15} aria-hidden="true" />
              {venue.neighbourhood}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-linen px-2.5 py-1 text-xs font-bold text-mossDark">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            {venue.rating.toFixed(1)}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/74">{venue.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-skywash px-2.5 py-1 text-xs font-bold text-mossDark">
            <Baby size={13} aria-hidden="true" />
            {monthRangeLabel(venue.ageMinMonths, venue.ageMaxMonths)}
          </span>
          {venue.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-linen px-2.5 py-1 text-xs font-semibold text-ink/68">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
