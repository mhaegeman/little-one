import type { Venue } from "@/lib/types";

type VenueOverride = {
  description?: string;
  openingHoursSummary?: string;
};

type VenueMessages = {
  venues?: Record<string, VenueOverride>;
  venueTags?: Record<string, string>;
};

export type VenueCopy = {
  description: string;
  openingHoursSummary: string;
  tags: string[];
};

// venues.ts holds the Danish source of truth. For non-DA locales we look up
// optional overrides in the locale's messages and fall back to the DA string
// so untranslated venues stay readable rather than missing.
export function resolveVenueCopy(
  venue: Venue,
  locale: string,
  messages: unknown
): VenueCopy {
  if (locale === "da") {
    return {
      description: venue.description,
      openingHoursSummary: venue.openingHours.summary,
      tags: venue.tags
    };
  }
  const m = messages as VenueMessages;
  const override = m.venues?.[venue.id];
  const tagDict = m.venueTags ?? {};
  return {
    description: override?.description ?? venue.description,
    openingHoursSummary:
      override?.openingHoursSummary ?? venue.openingHours.summary,
    tags: venue.tags.map((tag) => tagDict[tag] ?? tag)
  };
}
