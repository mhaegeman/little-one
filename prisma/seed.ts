import { PrismaClient, type Neighbourhood as PrismaNeighbourhood } from "@prisma/client";
import { events, venues } from "../lib/data/venues";
import type { Neighbourhood as AppNeighbourhood } from "../lib/types";

const prisma = new PrismaClient();

const neighbourhoodMap: Record<AppNeighbourhood, PrismaNeighbourhood> = {
  "Nørrebro": "NORREBRO",
  "Østerbro": "OSTERBRO",
  Vesterbro: "VESTERBRO",
  Frederiksberg: "FREDERIKSBERG",
  "Indre By": "INDRE_BY",
  Amager: "AMAGER",
  Valby: "VALBY",
  Sydhavn: "SYDHAVN",
  Nordvest: "NORDVEST",
  Nordhavn: "NORDHAVN",
  Hellerup: "HELLERUP",
  Ishøj: "ISHOJ",
  Vanløse: "VANLOSE",
  Brønshøj: "BRONSHOJ",
  Kastrup: "KASTRUP",
  Klampenborg: "KLAMPENBORG",
  Lyngby: "LYNGBY",
  "Humlebæk": "HUMLEBAEK",
  Roskilde: "ROSKILDE"
};

async function main() {
  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { slug: venue.id },
      update: {
        name: venue.name,
        description: venue.description,
        category: venue.category,
        address: venue.address,
        lat: venue.lat,
        lng: venue.lng,
        ageMinMonths: venue.ageMinMonths,
        ageMaxMonths: venue.ageMaxMonths,
        photos: venue.photos,
        rating: venue.rating,
        website: venue.website,
        tags: venue.tags,
        openingHours: venue.openingHours,
        neighbourhood: neighbourhoodMap[venue.neighbourhood],
        indoorOutdoor: venue.indoorOutdoor,
        priceHint: venue.priceHint,
        sourceUrl: venue.sourceUrl
      },
      create: {
        slug: venue.id,
        name: venue.name,
        description: venue.description,
        category: venue.category,
        address: venue.address,
        lat: venue.lat,
        lng: venue.lng,
        ageMinMonths: venue.ageMinMonths,
        ageMaxMonths: venue.ageMaxMonths,
        photos: venue.photos,
        rating: venue.rating,
        website: venue.website,
        tags: venue.tags,
        openingHours: venue.openingHours,
        neighbourhood: neighbourhoodMap[venue.neighbourhood],
        indoorOutdoor: venue.indoorOutdoor,
        priceHint: venue.priceHint,
        sourceUrl: venue.sourceUrl
      }
    });
  }

  for (const event of events) {
    const venue = event.venueId
      ? await prisma.venue.findUnique({ where: { slug: event.venueId } })
      : null;

    await prisma.event.upsert({
      where: { slug: event.id },
      update: {
        venueId: venue?.id,
        title: event.title,
        description: event.description,
        dateStart: new Date(event.dateStart),
        dateEnd: new Date(event.dateEnd),
        ageMinMonths: event.ageMinMonths,
        ageMaxMonths: event.ageMaxMonths,
        price: event.price,
        bookingUrl: event.bookingUrl,
        recurring: event.recurring,
        recurrenceRule: event.recurrenceRule,
        category: event.category,
        neighbourhood: neighbourhoodMap[event.neighbourhood]
      },
      create: {
        slug: event.id,
        venueId: venue?.id,
        title: event.title,
        description: event.description,
        dateStart: new Date(event.dateStart),
        dateEnd: new Date(event.dateEnd),
        ageMinMonths: event.ageMinMonths,
        ageMaxMonths: event.ageMaxMonths,
        price: event.price,
        bookingUrl: event.bookingUrl,
        recurring: event.recurring,
        recurrenceRule: event.recurrenceRule,
        category: event.category,
        neighbourhood: neighbourhoodMap[event.neighbourhood]
      }
    });
  }

  console.info(`Seeded ${venues.length} venues and ${events.length} events.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
