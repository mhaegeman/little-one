export type VenueCategory =
  | "cafe"
  | "playground"
  | "indoor_play"
  | "cinema"
  | "library"
  | "swimming"
  | "theatre"
  | "event";

export type Neighbourhood =
  | "Nørrebro"
  | "Østerbro"
  | "Vesterbro"
  | "Frederiksberg"
  | "Indre By"
  | "Amager"
  | "Valby"
  | "Nordvest"
  | "Nordhavn"
  | "Hellerup"
  | "Ishøj"
  | "Vanløse"
  | "Brønshøj"
  | "Kastrup";

export type IndoorOutdoor = "indoor" | "outdoor" | "both";

export type OpeningPeriod = {
  days: string;
  open: string;
  close: string;
};

export type OpeningHours = {
  summary: string;
  periods?: OpeningPeriod[];
};

export type Venue = {
  id: string;
  name: string;
  description: string;
  category: VenueCategory;
  address: string;
  lat: number;
  lng: number;
  ageMinMonths: number;
  ageMaxMonths: number;
  photos: string[];
  rating: number;
  website: string;
  tags: string[];
  openingHours: OpeningHours;
  neighbourhood: Neighbourhood;
  indoorOutdoor: IndoorOutdoor;
  priceHint: "free" | "budget" | "paid";
  sourceUrl: string;
};

export type FamilyEvent = {
  id: string;
  venueId?: string;
  title: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  ageMinMonths: number;
  ageMaxMonths: number;
  price: string;
  bookingUrl: string;
  recurring: boolean;
  recurrenceRule?: string;
  neighbourhood: Neighbourhood;
  category: VenueCategory;
};

export type Child = {
  id: string;
  name: string;
  dateOfBirth: string;
  photoUrl?: string;
  gender?: string;
};

export type TimelineItemType = "milestone" | "activity" | "aula";

export type TimelineItem = {
  id: string;
  type: TimelineItemType;
  title: string;
  description?: string;
  date: string;
  photos?: string[];
  badge?: string;
};

export type MilestoneType =
  | "first_smile"
  | "first_laugh"
  | "first_word"
  | "first_steps"
  | "sat_up_alone"
  | "first_tooth"
  | "slept_through"
  | "first_food"
  | "first_haircut"
  | "started_vuggestue"
  | "started_bornehave"
  | "custom";

export type FamilyRole = "owner" | "parent" | "family" | "caregiver";

export type FamilyInviteStatus = "pending" | "accepted" | "revoked" | "expired";

export type FamilyProfile = {
  userId: string;
  displayName: string | null;
  pronouns: string | null;
  bio: string | null;
  avatarUrl: string | null;
  preferredRole: FamilyRole;
  preferredLocale: string;
};

export type Family = {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  createdBy: string;
  createdAt: string;
};

export type FamilyMember = {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyRole;
  displayName: string | null;
  joinedAt: string;
  profile?: FamilyProfile | null;
};

export type FamilyInvite = {
  id: string;
  familyId: string;
  invitedEmail: string | null;
  invitedName: string | null;
  invitedBy: string;
  role: FamilyRole;
  message: string | null;
  token: string;
  status: FamilyInviteStatus;
  expiresAt: string;
  createdAt: string;
};
