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

export const categoryColors: Record<VenueCategory, string> = {
  cafe: "bg-rust/10 text-rust ring-rust/20",
  playground: "bg-moss/10 text-mossDark ring-moss/20",
  indoor_play: "bg-butter/20 text-[#775A11] ring-butter/30",
  cinema: "bg-[#D7E5E4] text-mossDark ring-moss/20",
  library: "bg-[#ECE4D2] text-[#6C5538] ring-oat",
  swimming: "bg-[#D9EEF2] text-[#2D6670] ring-[#BCDCE2]",
  theatre: "bg-clay/20 text-rust ring-clay/30",
  event: "bg-[#F3D8C9] text-rust ring-clay/30"
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
  "Nordvest",
  "Nordhavn",
  "Hellerup",
  "Ishøj",
  "Vanløse",
  "Brønshøj",
  "Kastrup"
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
