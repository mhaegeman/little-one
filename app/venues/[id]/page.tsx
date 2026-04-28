import { ArrowLeft, Baby, CalendarClock, ExternalLink, MapPinned, Navigation } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { categoryColors, categoryLabels } from "@/lib/data/taxonomy";
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
    <div className="px-4 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <article className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-ink/72 ring-1 ring-oat transition hover:text-mossDark"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Opdag
        </Link>

        <section className="mt-5 overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-oat/70">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
            <div className="flex snap-x gap-2 overflow-x-auto bg-linen p-2">
              {venue.photos.map((photo) => (
                <img
                  key={photo}
                  src={photo}
                  alt=""
                  className="h-[320px] min-w-full snap-center rounded-xl object-cover sm:h-[420px]"
                />
              ))}
            </div>

            <div className="p-5 sm:p-7">
              <Badge className={categoryColors[venue.category]}>
                {categoryLabels[venue.category]}
              </Badge>
              <h1 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl">
                {venue.name}
              </h1>
              <p className="mt-4 text-base leading-7 text-ink/72">{venue.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoTile icon={<Baby size={18} />} label="Alder">
                  {monthRangeLabel(venue.ageMinMonths, venue.ageMaxMonths)}
                </InfoTile>
                <InfoTile icon={<MapPinned size={18} />} label="Bydel">
                  {venue.neighbourhood}
                </InfoTile>
                <InfoTile icon={<CalendarClock size={18} />} label="Åbning">
                  {venue.openingHours.summary}
                </InfoTile>
                <InfoTile icon={<Navigation size={18} />} label="Adresse">
                  {venue.address}
                </InfoTile>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {venue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-linen px-3 py-1.5 text-xs font-bold text-ink/68"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/journal" className="sm:flex-1">
                  <Button className="w-full">
                    <Baby size={17} aria-hidden="true" />
                    Tilføj til journal
                  </Button>
                </Link>
                <Link
                  href={googleMapsUrl(venue.lat, venue.lng, venue.name)}
                  target="_blank"
                  className="sm:flex-1"
                >
                  <Button variant="secondary" className="w-full">
                    <Navigation size={17} aria-hidden="true" />
                    Google Maps
                  </Button>
                </Link>
                <Link href={venue.website ?? "#"} target="_blank" className="sm:flex-1">
                  <Button variant="ghost" className="w-full">
                    <ExternalLink size={17} aria-hidden="true" />
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

function InfoTile({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-linen p-3 ring-1 ring-oat">
      <div className="mb-2 flex items-center gap-2 text-rust">
        {icon}
        <span className="text-xs font-bold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="text-sm font-semibold leading-5 text-ink/74">{children}</p>
    </div>
  );
}
