import type { MilestoneType, Neighbourhood, VenueCategory } from "@/lib/types";

export const categoryLabels: Record<VenueCategory, string> = {
  cafe: "Cafe",
  playground: "Legeplads",
  indoor_play: "Indendørs leg",
  cinema: "Babybio",
  library: "Bibliotek",
  swimming: "Svømning",
  theatre: "Teater",
  event: "Sæson"
};

export const categoryDescriptions: Record<VenueCategory, string> = {
  cafe: "Rolige pauser, høje stole og plads til barnevogn.",
  playground: "Udendørs steder til sand, gynger, klatring og luft.",
  indoor_play: "Indeaktiviteter til regnvejrsdage og små motoriske eventyr.",
  cinema: "Film og kultur med plads til babyer og små børn.",
  library: "Højtlæsning, børnebøger og gratis hverdagsmagi.",
  swimming: "Varmtvandsbassiner, babysvømning og plask.",
  theatre: "Forestillinger i børnehøjde.",
  event: "Sæsonoplevelser, festivaler og særlige dage."
};

export const categoryBadgeVariant: Record<
  VenueCategory,
  "peach" | "mint" | "butter" | "sky" | "neutral"
> = {
  cafe: "peach",
  playground: "mint",
  indoor_play: "butter",
  cinema: "sky",
  library: "neutral",
  swimming: "sky",
  theatre: "peach",
  event: "peach"
};

export const categories = Object.keys(categoryLabels) as VenueCategory[];

export const neighbourhoods: Neighbourhood[] = [
  "Nørrebro",
  "Østerbro",
  "Vesterbro",
  "Frederiksberg",
  "Indre By",
  "Amager",
  "Valby",
  "Sydhavn",
  "Nordvest",
  "Nordhavn",
  "Hellerup",
  "Ishøj",
  "Vanløse",
  "Brønshøj",
  "Kastrup",
  "Klampenborg",
  "Lyngby",
  "Humlebæk",
  "Roskilde"
];

export const milestoneLabels: Record<MilestoneType, string> = {
  first_smile: "Første smil",
  first_laugh: "Første grin",
  first_word: "Første ord",
  first_steps: "Første skridt",
  sat_up_alone: "Sad selv",
  first_tooth: "Første tand",
  slept_through: "Sov igennem",
  first_food: "Første mad",
  first_haircut: "Første klipning",
  started_vuggestue: "Startede i vuggestue",
  started_bornehave: "Startede i børnehave",
  custom: "Egen milepæl"
};

export const milestoneTypes = Object.keys(milestoneLabels) as MilestoneType[];
