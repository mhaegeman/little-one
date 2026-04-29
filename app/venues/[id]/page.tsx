import {
  ArrowLeft,
  ArrowSquareOut,
  Baby,
  CalendarBlank,
  MapPinArea,
  NavigationArrow
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { categoryLabels } from "@/lib/data/taxonomy";
import { getVenueById, venues } from "@/lib/data/venues";
import { googleMapsUrl, monthRangeLabel } from "@/lib/utils";

type VenuePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return venues.map((venue) => ({ id: venue.id }));
}

export async function generateMetadata({ params }: VenuePageProps) {
  const { id } = await params;
  const venue = getVenueById(id);

  return {
    title: venue ? `${venue.name} · Lille Liv` : "Sted · Lille Liv"
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { id } = await params;
  const venue = getVenueById(id);

  if (!venue) {
    notFound();
  }

  return (
    <div className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-6">
      <article className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-pill bg-surface px-3 text-xs font-semibold text-muted ring-1 ring-hairline transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} weight="bold" aria-hidden="true" />
          Opdag
        </Link>

        <section className="mt-4 overflow-hidden rounded-card bg-surface ring-1 ring-hairline">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex snap-x gap-1.5 overflow-x-auto bg-sunken p-1.5 thin-scroll">
              {venue.photos.map((photo) => (
                <img
                  key={photo}
                  src={photo}
                  alt=""
                  className="h-[280px] min-w-full snap-center rounded-lg object-cover sm:h-[380px]"
                />
              ))}
            </div>

            <div className="p-5 sm:p-6">
              <Badge variant="sage">{categoryLabels[venue.category]}</Badge>
              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                {venue.name}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted">{venue.description}</p>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <InfoTile icon={<Baby size={14} weight="duotone" aria-hidden="true" />} label="Alder">
                  {monthRangeLabel(venue.ageMinMonths, venue.ageMaxMonths)}
                </InfoTile>
                <InfoTile icon={<MapPinArea size={14} weight="fill" aria-hidden="true" />} label="Bydel">
                  {venue.neighbourhood}
                </InfoTile>
                <InfoTile icon={<CalendarBlank size={14} weight="fill" aria-hidden="true" />} label="Åbning">
                  {venue.openingHours.summary}
                </InfoTile>
                <InfoTile
                  icon={<NavigationArrow size={14} weight="fill" aria-hidden="true" />}
                  label="Adresse"
                >
                  {venue.address}
                </InfoTile>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {venue.tags.map((tag) => (
                  <Badge key={tag} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link href="/journal" className="sm:flex-1">
                  <Button className="w-full">
                    <Baby size={14} weight="duotone" aria-hidden="true" />
                    Tilføj til journal
                  </Button>
                </Link>
                <Link
                  href={googleMapsUrl(venue.lat, venue.lng, venue.name)}
                  target="_blank"
                  className="sm:flex-1"
                >
                  <Button variant="secondary" className="w-full">
                    <NavigationArrow size={14} weight="fill" aria-hidden="true" />
                    Google Maps
                  </Button>
                </Link>
                <Link href={venue.website ?? "#"} target="_blank" className="sm:flex-1">
                  <Button variant="ghost" className="w-full">
                    <ArrowSquareOut size={14} weight="bold" aria-hidden="true" />
                    Website
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  children
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-sunken p-2.5 ring-1 ring-hairline">
      <div className="mb-1 flex items-center gap-1.5 text-warm-500">
        {icon}
        <span className="text-2xs font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="text-sm font-semibold leading-5 text-ink">{children}</p>
    </div>
  );
}
