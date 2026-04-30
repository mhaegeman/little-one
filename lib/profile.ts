import type {
  FamilyEvent,
  FamilyProfile,
  IndoorPreference,
  Venue,
  VenueCategory
} from "@/lib/types";

export const DEFAULT_PROFILE_PATCH: Omit<FamilyProfile, "userId"> = {
  displayName: null,
  pronouns: null,
  bio: null,
  avatarUrl: null,
  preferredRole: "parent",
  preferredLocale: "da",
  interests: [],
  neighbourhoods: [],
  indoorPreference: "any",
  childAgeMinMonths: null,
  childAgeMaxMonths: null,
  notifyEmail: true,
  onboardingCompletedAt: null
};

export type ProfileCompletenessField =
  | "displayName"
  | "avatarUrl"
  | "bio"
  | "pronouns"
  | "interests"
  | "neighbourhoods"
  | "childAgeRange";

export const COMPLETENESS_LABELS_DA: Record<ProfileCompletenessField, string> = {
  displayName: "Visningsnavn",
  avatarUrl: "Profilbillede",
  bio: "Lille beskrivelse",
  pronouns: "Pronominer",
  interests: "Interesser",
  neighbourhoods: "Yndlingsbydele",
  childAgeRange: "Barnets alder"
};

export type ProfileCompleteness = {
  score: number;
  total: number;
  percent: number;
  missing: ProfileCompletenessField[];
};

export function profileCompleteness(profile: FamilyProfile | null): ProfileCompleteness {
  const fields: ProfileCompletenessField[] = [
    "displayName",
    "avatarUrl",
    "bio",
    "pronouns",
    "interests",
    "neighbourhoods",
    "childAgeRange"
  ];

  const filled: ProfileCompletenessField[] = [];

  if (profile) {
    if (profile.displayName?.trim()) filled.push("displayName");
    if (profile.avatarUrl?.trim()) filled.push("avatarUrl");
    if (profile.bio?.trim()) filled.push("bio");
    if (profile.pronouns?.trim()) filled.push("pronouns");
    if (profile.interests.length > 0) filled.push("interests");
    if (profile.neighbourhoods.length > 0) filled.push("neighbourhoods");
    if (profile.childAgeMinMonths !== null && profile.childAgeMaxMonths !== null) {
      filled.push("childAgeRange");
    }
  }

  const missing = fields.filter((field) => !filled.includes(field));
  const total = fields.length;
  const score = filled.length;
  return {
    score,
    total,
    percent: total === 0 ? 0 : Math.round((score / total) * 100),
    missing
  };
}

type ScorableVenue = Pick<
  Venue,
  "category" | "neighbourhood" | "indoorOutdoor" | "ageMinMonths" | "ageMaxMonths" | "rating"
>;

export function scoreVenueForProfile(profile: FamilyProfile | null, venue: ScorableVenue): number {
  if (!profile) return venue.rating;

  let score = 0;
  const hasInterests = profile.interests.length > 0;
  const hasNeighbourhoods = profile.neighbourhoods.length > 0;
  const hasAgeRange =
    profile.childAgeMinMonths !== null && profile.childAgeMaxMonths !== null;

  if (hasInterests) {
    if (profile.interests.includes(venue.category as VenueCategory)) score += 4;
    else score -= 1;
  }

  if (hasNeighbourhoods) {
    if (profile.neighbourhoods.includes(venue.neighbourhood)) score += 3;
  }

  if (profile.indoorPreference !== "any") {
    if (venue.indoorOutdoor === profile.indoorPreference || venue.indoorOutdoor === "both") {
      score += 1;
    } else {
      score -= 1;
    }
  }

  if (hasAgeRange) {
    const minAge = profile.childAgeMinMonths as number;
    const maxAge = profile.childAgeMaxMonths as number;
    const overlaps = venue.ageMaxMonths >= minAge && venue.ageMinMonths <= maxAge;
    if (overlaps) score += 2;
    else score -= 1;
  }

  score += (venue.rating - 4) * 0.4;
  return score;
}

export function recommendVenues(
  profile: FamilyProfile | null,
  venues: Venue[],
  limit = 6
): Venue[] {
  const hasPrefs = Boolean(
    profile &&
      (profile.interests.length > 0 ||
        profile.neighbourhoods.length > 0 ||
        profile.indoorPreference !== "any" ||
        (profile.childAgeMinMonths !== null && profile.childAgeMaxMonths !== null))
  );

  if (!hasPrefs) {
    return [...venues].sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  return [...venues]
    .map((venue) => ({ venue, score: scoreVenueForProfile(profile, venue) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.venue);
}

export function recommendEvents(
  profile: FamilyProfile | null,
  events: FamilyEvent[],
  limit = 4,
  now: Date = new Date()
): FamilyEvent[] {
  const upcoming = events.filter((event) => new Date(event.dateEnd) >= now);

  if (!profile) {
    return upcoming
      .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())
      .slice(0, limit);
  }

  return upcoming
    .map((event) => {
      let score = 0;
      if (profile.interests.length > 0) {
        if (profile.interests.includes(event.category as VenueCategory)) score += 4;
        else score -= 1;
      }
      if (profile.neighbourhoods.length > 0) {
        if (profile.neighbourhoods.includes(event.neighbourhood)) score += 3;
      }
      if (profile.childAgeMinMonths !== null && profile.childAgeMaxMonths !== null) {
        const overlaps =
          event.ageMaxMonths >= profile.childAgeMinMonths &&
          event.ageMinMonths <= profile.childAgeMaxMonths;
        if (overlaps) score += 2;
        else score -= 1;
      }
      const daysAway = Math.max(
        0,
        (new Date(event.dateStart).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      score += Math.max(0, 1.5 - daysAway / 30);
      return { event, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.event);
}

export const INDOOR_PREFERENCE_LABELS_DA: Record<IndoorPreference, string> = {
  any: "Begge dele",
  indoor: "Indendørs",
  outdoor: "Udendørs"
};

export function ageMonthsToLabel(months: number): string {
  if (months < 12) return `${months} mdr.`;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (remainder === 0) return `${years} år`;
  return `${years} år ${remainder} mdr.`;
}
