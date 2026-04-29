import type { FamilyEvent, Venue, VenueCategory } from "@/lib/types";

function unsplash(id: string, w = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

const photos = {
  cafe: unsplash("1509042239860-f550ce710b93"),
  playground: unsplash("1596997000103-e5976ca50f9e"),
  indoor: unsplash("1535572290543-960a8046f5af"),
  library: unsplash("1519682337058-a94d519337bc"),
  swimming: unsplash("1530549387789-4c1017266635"),
  theatre: unsplash("1503095396549-807759245b35"),
  event: unsplash("1513151233558-d860c5398176")
};

const photoBanks: Record<VenueCategory, string[]> = {
  cafe: [
    unsplash("1509042239860-f550ce710b93"),
    unsplash("1453614512568-c4024d13c247"),
    unsplash("1559925393-8be0ec4767c8"),
    unsplash("1481833761820-0509d3217039")
  ],
  playground: [
    unsplash("1596997000103-e5976ca50f9e"),
    unsplash("1502086223501-7ea6ecd79368"),
    unsplash("1485981137693-acdb7416fac0"),
    unsplash("1543248939-ff40856f65d4")
  ],
  indoor_play: [
    unsplash("1535572290543-960a8046f5af"),
    unsplash("1503676260728-1c00da094a0b"),
    unsplash("1601758174039-bcdc9d6cca80")
  ],
  library: [
    unsplash("1519682337058-a94d519337bc"),
    unsplash("1521587760476-6c12a4b040da"),
    unsplash("1481627834876-b7833e8f5570"),
    unsplash("1568667256549-094345857637")
  ],
  swimming: [
    unsplash("1530549387789-4c1017266635"),
    unsplash("1576013551627-0cc20b96c2a7"),
    unsplash("1530841344095-fe8b6ddc8a59"),
    unsplash("1530538987395-032d1800fdd4")
  ],
  theatre: [
    unsplash("1503095396549-807759245b35"),
    unsplash("1507676184212-d03ab07a01bf"),
    unsplash("1583146636691-78fbcfb2ca97")
  ],
  cinema: [
    unsplash("1489599162878-83bee99e7c1c"),
    unsplash("1574267432553-4b4628081c31"),
    unsplash("1517604931442-7e0c8ed2963c")
  ],
  event: [
    unsplash("1513151233558-d860c5398176"),
    unsplash("1580974928064-f0aeef70895a"),
    unsplash("1542038784456-1ea8e935640e"),
    unsplash("1493225457124-a3eb161ffa5f")
  ]
};

const photoOverrides: Record<string, string[]> = {
  "amager-strandpark": [
    unsplash("1507525428034-b723cf961d3e"),
    unsplash("1518998053901-5348d3961a04")
  ],
  "havnegade-trampoliner": [
    unsplash("1542315192-1f61a1792f33"),
    unsplash("1502086223501-7ea6ecd79368")
  ],
  "konditaget-luders": [
    unsplash("1564507592333-c60657eea523"),
    unsplash("1543248939-ff40856f65d4")
  ],
  "tivoli-gardens": [
    unsplash("1542038784456-1ea8e935640e"),
    unsplash("1493225457124-a3eb161ffa5f")
  ],
  "copenhagen-zoo": [
    unsplash("1580974928064-f0aeef70895a"),
    unsplash("1564349683136-77e08dba1ef7")
  ],
  "den-blaa-planet": [
    unsplash("1582967788606-a171c1080cb0"),
    unsplash("1583212292454-1fe6229603b7")
  ],
  experimentarium: [
    unsplash("1503676260728-1c00da094a0b"),
    unsplash("1582921020076-2e5b2e1a09a3")
  ],
  superkilen: [
    unsplash("1485981137693-acdb7416fac0"),
    unsplash("1543248939-ff40856f65d4")
  ],
  "kongens-have-legeplads": [
    unsplash("1502086223501-7ea6ecd79368"),
    unsplash("1568012152284-92d76f4dafde")
  ],
  "valbyparken-naturlegeplads": [
    unsplash("1469429954551-3eb88a02ab23"),
    unsplash("1572053675669-e9f1b6f30d56")
  ],
  cinemateket: [
    unsplash("1489599162878-83bee99e7c1c"),
    unsplash("1517604931442-7e0c8ed2963c")
  ],
  "hovedbiblioteket-laes": [
    unsplash("1521587760476-6c12a4b040da"),
    unsplash("1568667256549-094345857637")
  ],
  "boernenes-museum": [
    unsplash("1580130544577-456e1f6ed8ee"),
    unsplash("1601758174039-bcdc9d6cca80")
  ],
  "copenhagen-contemporary": [
    unsplash("1531913764164-f85c52e6e654"),
    unsplash("1577083552431-6e5fd01988ec")
  ],
  "kongelige-teater-de-smaa-synger": [
    unsplash("1507676184212-d03ab07a01bf"),
    unsplash("1503095396549-807759245b35")
  ],
  "ku-be": [
    unsplash("1601758174039-bcdc9d6cca80"),
    unsplash("1503676260728-1c00da094a0b")
  ],
  remisen: [
    unsplash("1535572290543-960a8046f5af"),
    unsplash("1601758174039-bcdc9d6cca80")
  ],
  "absalon": [
    unsplash("1559925393-8be0ec4767c8"),
    unsplash("1453614512568-c4024d13c247")
  ],
  "the-living-room": [
    unsplash("1481833761820-0509d3217039"),
    unsplash("1453614512568-c4024d13c247")
  ],
  granola: [
    unsplash("1559925393-8be0ec4767c8"),
    unsplash("1559925393-8be0ec4767c8")
  ],
  "frederiksberg-have": [
    unsplash("1500964405936-6ce6b3c2ede1"),
    unsplash("1502086223501-7ea6ecd79368")
  ],
  "dyrehaven": [
    unsplash("1448376561459-dbe8868fa34f"),
    unsplash("1469429954551-3eb88a02ab23")
  ],
  "bellevue-strand": [
    unsplash("1507525428034-b723cf961d3e"),
    unsplash("1518998053901-5348d3961a04")
  ],
  "havnebadet-islands-brygge": [
    unsplash("1530549387789-4c1017266635"),
    unsplash("1507525428034-b723cf961d3e")
  ],
  "louisiana-museum": [
    unsplash("1531913764164-f85c52e6e654"),
    unsplash("1577083552431-6e5fd01988ec")
  ],
  "vikingeskibsmuseet": [
    unsplash("1580974928064-f0aeef70895a"),
    unsplash("1542038784456-1ea8e935640e")
  ],
  "bakken": [
    unsplash("1493225457124-a3eb161ffa5f"),
    unsplash("1542038784456-1ea8e935640e")
  ]
};

function pickPhotos(category: VenueCategory, id: string): string[] {
  const override = photoOverrides[id];
  if (override && override.length > 0) {
    return override;
  }
  const bank = photoBanks[category] ?? [];
  if (bank.length === 0) {
    return [];
  }
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const first = hash % bank.length;
  const second = (hash + 1) % bank.length;
  return [bank[first], bank[second]];
}

const baseVenues: Venue[] = [
  {
    id: "the-living-room",
    name: "The Living Room",
    description:
      "Hyggelig cafe i Indre By med sofaer, varme drikke og roligt tempo til barselsmøder uden for myldretid.",
    category: "cafe",
    address: "Larsbjørnsstræde 17, 1454 København K",
    lat: 55.6793,
    lng: 12.5723,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.cafe],
    rating: 4.4,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/the-living-room-gdk695286",
    tags: ["sofaer", "barsel", "varme drikke", "indre by"],
    openingHours: {
      summary: "Typisk dagligt fra formiddag til aften; tjek åbningstider før besøg.",
      periods: [{ days: "mon-sun", open: "10:00", close: "22:00" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "indoor",
    priceHint: "budget",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/the-living-room-gdk695286"
  },
  {
    id: "granola",
    name: "Granola",
    description:
      "Klassisk morgenmadscafe på Værnedamsvej med brunch, is og en nostalgisk stemning, der fungerer godt til korte familiepauser.",
    category: "cafe",
    address: "Værnedamsvej 5, 1819 Frederiksberg C",
    lat: 55.6735,
    lng: 12.5499,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.cafe],
    rating: 4.3,
    website: "https://www.granola.dk/menu",
    tags: ["brunch", "morgenmad", "is", "frederiksberg"],
    openingHours: {
      summary: "Man-fre fra morgen, lørdag og søndag fra 9; køkkenet lukker tidligere søndag.",
      periods: [
        { days: "mon-fri", open: "08:00", close: "22:00" },
        { days: "sat", open: "09:00", close: "22:00" },
        { days: "sun", open: "09:00", close: "15:00" }
      ]
    },
    neighbourhood: "Frederiksberg",
    indoorOutdoor: "indoor",
    priceHint: "budget",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/granola-gdk412372"
  },
  {
    id: "absalon",
    name: "Absalon",
    description:
      "Folkehus på Sønder Boulevard med social spisning, åbne aktiviteter og uformel plads til familier.",
    category: "cafe",
    address: "Sønder Boulevard 73, 1720 København V",
    lat: 55.6688,
    lng: 12.5438,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.cafe],
    rating: 4.6,
    website: "https://absaloncph.dk/",
    tags: ["folkehus", "fællesspisning", "højstole", "vesterbro"],
    openingHours: {
      summary: "Daglige aktiviteter med skiftende kalender.",
      periods: [{ days: "mon-sun", open: "09:00", close: "22:00" }]
    },
    neighbourhood: "Vesterbro",
    indoorOutdoor: "indoor",
    priceHint: "budget",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/eat-drink/family-friendly-restaurants"
  },
  {
    id: "bar50-danhostel",
    name: "BAR50 Child-friendly Cafe",
    description:
      "Babyvenlig cafe ved havnen med højstole, puslefaciliteter, ramper og plads til barnevogn indenfor.",
    category: "cafe",
    address: "H.C. Andersens Boulevard 50, 1553 København V",
    lat: 55.6724,
    lng: 12.575,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.cafe],
    rating: 4.2,
    website: "https://danhostelcopenhagencity.dk/en/facilities/childrens-cafe",
    tags: ["pusleplads", "barnevogn", "højstole", "legehjørne"],
    openingHours: {
      summary: "Åbent dagligt 07:00-00:00 ifølge stedet.",
      periods: [{ days: "mon-sun", open: "07:00", close: "23:59" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "indoor",
    priceHint: "budget",
    sourceUrl: "https://danhostelcopenhagencity.dk/en/facilities/childrens-cafe"
  },
  {
    id: "mad-og-kaffe-vesterbro",
    name: "Mad & Kaffe Vesterbro",
    description:
      "Populær brunchadresse, hvor børn er velkomne. Bedst til planlagte, korte stop uden stor barnevogn indenfor.",
    category: "cafe",
    address: "Sønder Boulevard 68, 1720 København V",
    lat: 55.6686,
    lng: 12.5463,
    ageMinMonths: 6,
    ageMaxMonths: 72,
    photos: [photos.cafe],
    rating: 4.3,
    website: "https://madogkaffe.dk/en/children-and-babies/",
    tags: ["brunch", "børn velkomne", "vesterbro", "travlt"],
    openingHours: {
      summary: "Tjek aktuel afdeling og åbningstid før besøg.",
      periods: [{ days: "mon-sun", open: "08:30", close: "16:00" }]
    },
    neighbourhood: "Vesterbro",
    indoorOutdoor: "indoor",
    priceHint: "budget",
    sourceUrl: "https://madogkaffe.dk/en/children-and-babies/"
  },
  {
    id: "superkilen",
    name: "Superkilen",
    description:
      "Farverigt byrum på Nørrebro med gynger, bevægelse, plads til løbecykler og masser at kigge på.",
    category: "playground",
    address: "Nørrebrogade / Heimdalsgade, 2200 København N",
    lat: 55.6997,
    lng: 12.5429,
    ageMinMonths: 12,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.5,
    website: "https://www.visitcopenhagen.com/copenhagen/activities/playgrounds",
    tags: ["udendørs", "løbecykel", "nørrebro", "gratis"],
    openingHours: {
      summary: "Udendørs byrum, åbent hele døgnet.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Nørrebro",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/activities/playgrounds"
  },
  {
    id: "taarnlegepladsen",
    name: "Tårnlegepladsen i Fælledparken",
    description:
      "Legeplads bygget over Københavns tårne med interaktiv leg, sand, klatring og bemandet bygning i dagtimer.",
    category: "playground",
    address: "Fælledparken, 2100 København Ø",
    lat: 55.7042,
    lng: 12.5684,
    ageMinMonths: 18,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.7,
    website:
      "https://www.visitcopenhagen.com/copenhagen/planning/playground-with-towers-in-faelledparken-gdk570166",
    tags: ["klatring", "sand", "bemandet", "østerbro"],
    openingHours: {
      summary: "Udendørs hele dagen; bemandet bygning typisk 10:00-15:30.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Østerbro",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl:
      "https://www.visitcopenhagen.com/copenhagen/planning/playground-with-towers-in-faelledparken-gdk570166"
  },
  {
    id: "trafiklegepladsen",
    name: "Trafiklegepladsen",
    description:
      "Cykeltema i Fælledparken med små veje, skilte og gratis lånecykler til børn, der øver trafik og balance.",
    category: "playground",
    address: "Fælledparken, Gunnar Nu Hansens Plads, 2100 København Ø",
    lat: 55.7072,
    lng: 12.5686,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.8,
    website:
      "https://www.visitcopenhagen.com/copenhagen/planning/childrens-traffic-playground-gdk507562",
    tags: ["cykler", "trafik", "gratis", "østerbro"],
    openingHours: {
      summary: "Sommer man-fre 09-17; vinter man-fre 09-16; enkelte weekender.",
      periods: [{ days: "mon-fri", open: "09:00", close: "17:00" }]
    },
    neighbourhood: "Østerbro",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl:
      "https://www.visitcopenhagen.com/copenhagen/planning/childrens-traffic-playground-gdk507562"
  },
  {
    id: "kongens-have-legeplads",
    name: "Kongens Have Legeplads",
    description:
      "Eventyrlig legeplads midt i Kongens Have med drage, gyldne æg, toiletter i nærheden og cafe tæt på.",
    category: "playground",
    address: "Øster Voldgade 4, 1350 København K",
    lat: 55.6858,
    lng: 12.5819,
    ageMinMonths: 12,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.7,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/the-kings-garden-playground-gdk566087",
    tags: ["eventyr", "toiletter", "picnic", "indre by"],
    openingHours: {
      summary: "Følger parkens sæsonåbning; tjek parkinfo.",
      periods: [{ days: "mon-sun", open: "07:00", close: "22:00" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/the-kings-garden-playground-gdk566087"
  },
  {
    id: "valbyparken-naturlegeplads",
    name: "Naturlegepladsen i Valbyparken",
    description:
      "Stor naturlegeplads med træ, bakker og grønne rum, god til børn der vil balancere, bygge og sanse.",
    category: "playground",
    address: "Hammelstrupvej 100, 2450 København SV",
    lat: 55.6428,
    lng: 12.5173,
    ageMinMonths: 18,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.6,
    website: "https://www.visitcopenhagen.com/copenhagen/activities/playgrounds",
    tags: ["natur", "picnic", "grønt", "valby"],
    openingHours: {
      summary: "Udendørs, åbent hele døgnet.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Valby",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/activities/playgrounds"
  },
  {
    id: "konditaget-luders",
    name: "Konditaget Lüders",
    description:
      "Aktivitets- og legeplads på et parkeringshus i Nordhavn med udsigt, trampoliner og bevægelse for større småbørn.",
    category: "playground",
    address: "Helsinkigade 30, 2150 Nordhavn",
    lat: 55.711,
    lng: 12.5968,
    ageMinMonths: 36,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.5,
    website: "https://www.visitcopenhagen.com/copenhagen/activities/outdoor/playgrounds",
    tags: ["tagterrasse", "udsigt", "trampoliner", "nordhavn"],
    openingHours: {
      summary: "Udendørs; vær opmærksom på vejr og vind.",
      periods: [{ days: "mon-sun", open: "07:00", close: "22:00" }]
    },
    neighbourhood: "Nordhavn",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/activities/outdoor/playgrounds"
  },
  {
    id: "havnegade-trampoliner",
    name: "Trampolinerne på Havnegade",
    description:
      "Små trampoliner ved vandet, perfekte til en kort energipause på vej gennem byen.",
    category: "playground",
    address: "Havnegade, 1058 København K",
    lat: 55.6797,
    lng: 12.5882,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.3,
    website: "https://www.visitcopenhagen.com/copenhagen/activities/playgrounds",
    tags: ["trampoliner", "havnen", "kort stop", "indre by"],
    openingHours: {
      summary: "Udendørs byrum.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/activities/playgrounds"
  },
  {
    id: "skydebanehaven",
    name: "Skydebanehaven",
    description:
      "Lokal Vesterbro-legeplads bag den store mur med sand, gynger og grøn pause tæt på Sønder Boulevard.",
    category: "playground",
    address: "Absalonsgade 12, 1658 København V",
    lat: 55.6709,
    lng: 12.5498,
    ageMinMonths: 12,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.4,
    website: "https://www.visitcopenhagen.com/copenhagen/activities/playgrounds",
    tags: ["lokal", "sand", "vesterbro", "gratis"],
    openingHours: {
      summary: "Parklegeplads med sæsonåbning.",
      periods: [{ days: "mon-sun", open: "07:00", close: "22:00" }]
    },
    neighbourhood: "Vesterbro",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/activities/playgrounds"
  },
  {
    id: "amager-strandpark",
    name: "Amager Strandpark",
    description:
      "Strand, stier og bløde pauser ved vandet med god plads til barnevogn og sandleg i mildt vejr.",
    category: "playground",
    address: "Amager Strand Promenaden, 2300 København S",
    lat: 55.6568,
    lng: 12.6313,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.7,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/amager-beach-park-gdk414437",
    tags: ["strand", "sand", "barnevogn", "amager"],
    openingHours: {
      summary: "Udendørs, åbent hele døgnet.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Amager",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/amager-beach-park-gdk414437"
  },
  {
    id: "experimentarium",
    name: "Experimentarium",
    description:
      "Hands-on sciencecenter med sanser, vand, bobler og Miniverse for de mindste børn.",
    category: "indoor_play",
    address: "Tuborg Havnevej 7, 2900 Hellerup",
    lat: 55.728,
    lng: 12.5775,
    ageMinMonths: 12,
    ageMaxMonths: 72,
    photos: [photos.indoor],
    rating: 4.7,
    website: "https://www.experimentarium.dk/",
    tags: ["science", "miniverse", "regnvejrsdag", "hellerup"],
    openingHours: {
      summary: "Ofte 09:30-17:00; tjek kalender for ferier.",
      periods: [{ days: "mon-sun", open: "09:30", close: "17:00" }]
    },
    neighbourhood: "Hellerup",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/experimentarium-gdk1086981"
  },
  {
    id: "dinos-legeland",
    name: "Dinos Legeland",
    description:
      "Stort indendørs legeland i Ishøj med klatrestrukturer, rutsjebaner og cafe til aktive regnvejrsdage.",
    category: "indoor_play",
    address: "Industribuen 7C, 2635 Ishøj",
    lat: 55.6157,
    lng: 12.3567,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    photos: [photos.indoor],
    rating: 4.1,
    website: "https://dinoslegeland.dk/",
    tags: ["legeland", "regnvejrsdag", "cafe", "ishøj"],
    openingHours: {
      summary: "Skiftende åbningstider; tjek kalender før afgang.",
      periods: [{ days: "sat-sun", open: "10:00", close: "18:00" }]
    },
    neighbourhood: "Ishøj",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.visitdenmark.com/denmark/plan-your-trip/dinos-playland-gdk877306"
  },
  {
    id: "remisen",
    name: "Remisen",
    description:
      "Gratis indendørs legeplads på Østerbro med stor hal, motorik, klatring og plads til små og større børn.",
    category: "indoor_play",
    address: "Blegdamsvej 132A, 2100 København Ø",
    lat: 55.7053,
    lng: 12.5684,
    ageMinMonths: 12,
    ageMaxMonths: 72,
    photos: [photos.indoor],
    rating: 4.5,
    website: "https://www.funday.site/activities/copenhagen/playgrounds/remisen",
    tags: ["gratis", "indendørs", "motorik", "østerbro"],
    openingHours: {
      summary: "Kommunal legeplads med skiftende åbningstider; tjek aktuel plan.",
      periods: [{ days: "mon-fri", open: "09:00", close: "17:00" }]
    },
    neighbourhood: "Østerbro",
    indoorOutdoor: "indoor",
    priceHint: "free",
    sourceUrl: "https://www.funday.site/activities/copenhagen/playgrounds/remisen"
  },
  {
    id: "ku-be",
    name: "KU.BE",
    description:
      "Kultur- og bevægelseshus på Frederiksberg med rum til motorik, arrangementer og legende hverdagskultur.",
    category: "indoor_play",
    address: "Dirch Passers Allé 4, 2000 Frederiksberg",
    lat: 55.6826,
    lng: 12.5233,
    ageMinMonths: 12,
    ageMaxMonths: 72,
    photos: [photos.indoor],
    rating: 4.4,
    website: "https://kube.frederiksberg.dk/",
    tags: ["kulturhus", "bevægelse", "frederiksberg", "indendørs"],
    openingHours: {
      summary: "Tjek dagens program og åbningstid.",
      periods: [{ days: "mon-sun", open: "09:00", close: "20:00" }]
    },
    neighbourhood: "Frederiksberg",
    indoorOutdoor: "indoor",
    priceHint: "free",
    sourceUrl: "https://kube.frederiksberg.dk/"
  },
  {
    id: "den-blaa-planet",
    name: "Den Blå Planet",
    description:
      "Nationalakvariet i Kastrup med fisk, hajer og rolige mørke rum, der kan være magiske for små børn.",
    category: "indoor_play",
    address: "Jacob Fortlingsvej 1, 2770 Kastrup",
    lat: 55.639,
    lng: 12.657,
    ageMinMonths: 6,
    ageMaxMonths: 72,
    photos: [photos.indoor],
    rating: 4.5,
    website: "https://denblaaplanet.dk/",
    tags: ["akvarium", "indendørs", "sanser", "kastrup"],
    openingHours: {
      summary: "Tjek sæsonkalender og billetvindue.",
      periods: [{ days: "mon-sun", open: "10:00", close: "17:00" }]
    },
    neighbourhood: "Kastrup",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/activities/fun-attractions-kids"
  },
  {
    id: "boernenes-museum",
    name: "Børnenes Museum",
    description:
      "Nationalmuseets børneunivers med historisk rolleleg, udklædning og sanselige rum i centrum.",
    category: "indoor_play",
    address: "Ny Vestergade 10, 1471 København K",
    lat: 55.6748,
    lng: 12.5744,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    photos: [photos.indoor],
    rating: 4.5,
    website: "https://natmus.dk/museer-og-slotte/nationalmuseet/udstillinger/boernenes-museum/",
    tags: ["museum", "rolleleg", "indre by", "regnvejrsdag"],
    openingHours: {
      summary: "Følger Nationalmuseets åbningstider.",
      periods: [{ days: "tue-sun", open: "10:00", close: "17:00" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/activities/fun-attractions-kids"
  },
  {
    id: "cinemateket",
    name: "Cinemateket",
    description:
      "Filmhuset i Gothersgade med børnefilm, familievisninger og cafe i samme bygning.",
    category: "cinema",
    address: "Gothersgade 55, 1123 København K",
    lat: 55.6836,
    lng: 12.5825,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.theatre],
    rating: 4.5,
    website: "https://www.dfi.dk/cinemateket",
    tags: ["film", "babybio", "cafe", "indre by"],
    openingHours: {
      summary: "Følger dagens program.",
      periods: [{ days: "mon-sun", open: "10:00", close: "22:00" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/eat-drink/family-friendly-restaurants"
  },
  {
    id: "hovedbiblioteket-laes",
    name: "Hovedbiblioteket LÆS",
    description:
      "Københavns Hovedbiblioteks børneetage med læsning, sproglig leg og gratis arrangementer for små børn.",
    category: "library",
    address: "Krystalgade 15, 1172 København K",
    lat: 55.6804,
    lng: 12.5738,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.library],
    rating: 4.6,
    website: "https://bibliotek.kk.dk/english/children-and-families",
    tags: ["gratis", "bøger", "højtlæsning", "indre by"],
    openingHours: {
      summary: "Følger Hovedbibliotekets åbningstider.",
      periods: [{ days: "mon-sun", open: "08:00", close: "20:00" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "indoor",
    priceHint: "free",
    sourceUrl: "https://bibliotek.kk.dk/english/children-and-families"
  },
  {
    id: "biblioteket-rentemestervej",
    name: "BIBLIOTEKET Rentemestervej",
    description:
      "Kulturhus og bibliotek i Nordvest med børnebibliotek, cafe og kreative aktiviteter.",
    category: "library",
    address: "Rentemestervej 76, 2400 København NV",
    lat: 55.7118,
    lng: 12.5335,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.library],
    rating: 4.5,
    website: "https://bibliotek.kk.dk/biblioteket-rentemestervej/english",
    tags: ["gratis", "kulturhus", "nordvest", "børnebibliotek"],
    openingHours: {
      summary: "Tjek bibliotekets aktuelle åbningstid.",
      periods: [{ days: "mon-sun", open: "08:00", close: "20:00" }]
    },
    neighbourhood: "Nordvest",
    indoorOutdoor: "indoor",
    priceHint: "free",
    sourceUrl: "https://bibliotek.kk.dk/biblioteket-rentemestervej/english"
  },
  {
    id: "oesterbro-bibliotek",
    name: "Østerbro Bibliotek",
    description:
      "Lokalt bibliotek tæt på Fælledparken med børnebøger, rolige hjørner og arrangementer for familier.",
    category: "library",
    address: "Dag Hammarskjölds Allé 19, 2100 København Ø",
    lat: 55.7058,
    lng: 12.577,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.library],
    rating: 4.4,
    website: "https://bibliotek.kk.dk/",
    tags: ["gratis", "bøger", "østerbro", "højtlæsning"],
    openingHours: {
      summary: "Tjek bibliotekets aktuelle åbningstid.",
      periods: [{ days: "mon-sun", open: "08:00", close: "20:00" }]
    },
    neighbourhood: "Østerbro",
    indoorOutdoor: "indoor",
    priceHint: "free",
    sourceUrl: "https://bibliotek.kk.dk/english/children-and-families"
  },
  {
    id: "frederiksberg-hovedbibliotek",
    name: "Frederiksberg Hovedbibliotek",
    description:
      "Børnebibliotek med faste højtlæsningsaktiviteter og plads til billedbøger, sprog og langsomme eftermiddage.",
    category: "library",
    address: "Falkoner Plads 3, 2000 Frederiksberg",
    lat: 55.6808,
    lng: 12.5317,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.library],
    rating: 4.7,
    website: "https://fkb.dk/frederiksberg-hovedbibliotek/forside",
    tags: ["story time", "gratis", "frederiksberg", "bøger"],
    openingHours: {
      summary: "Tjek bibliotekets aktuelle åbningstid.",
      periods: [{ days: "mon-sun", open: "08:00", close: "20:00" }]
    },
    neighbourhood: "Frederiksberg",
    indoorOutdoor: "indoor",
    priceHint: "free",
    sourceUrl:
      "https://fkb.dk/frederiksberg-hovedbibliotek/arrangementer/faste-aktiviteter-born/story-time"
  },
  {
    id: "valby-bibliotek",
    name: "Valby Bibliotek",
    description:
      "Nært bibliotek ved Valby Station med børnebøger, arrangementer og nem adgang med barnevogn.",
    category: "library",
    address: "Annexstræde 2, 2500 Valby",
    lat: 55.6612,
    lng: 12.5171,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.library],
    rating: 4.4,
    website: "https://bibliotek.kk.dk/",
    tags: ["gratis", "valby", "bøger", "barnevogn"],
    openingHours: {
      summary: "Tjek bibliotekets aktuelle åbningstid.",
      periods: [{ days: "mon-sun", open: "08:00", close: "20:00" }]
    },
    neighbourhood: "Valby",
    indoorOutdoor: "indoor",
    priceHint: "free",
    sourceUrl: "https://bibliotek.kk.dk/english/children-and-families"
  },
  {
    id: "bibliotekshuset",
    name: "Bibliotekshuset",
    description:
      "Lille lokalt bibliotek på Amager med børne- og ungdomsbøger, læsehjørner og grøn tagterrasse om sommeren.",
    category: "library",
    address: "Rodosvej 4, 2300 København S",
    lat: 55.6604,
    lng: 12.6095,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.library],
    rating: 4.3,
    website: "https://bibliotek.kk.dk/bibliotekshuset/english",
    tags: ["gratis", "amager", "tagterrasse", "bøger"],
    openingHours: {
      summary: "Åbent dagligt 08:00-20:00 ifølge bibliotekets engelske side.",
      periods: [{ days: "mon-sun", open: "08:00", close: "20:00" }]
    },
    neighbourhood: "Amager",
    indoorOutdoor: "indoor",
    priceHint: "free",
    sourceUrl: "https://bibliotek.kk.dk/bibliotekshuset/english"
  },
  {
    id: "dgi-byen-svoemning",
    name: "DGI Byen Svømmehal",
    description:
      "Centralt svømmecenter med børnebassin, varmt babybassin og familievenlige bevægelsestilbud.",
    category: "swimming",
    address: "Tietgensgade 65, 1704 København V",
    lat: 55.6677,
    lng: 12.5622,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.swimming],
    rating: 4.2,
    website: "https://www.dgibyen.dk/en/healthy-communities/activities-for-young-children",
    tags: ["børnebassin", "babybassin", "vesterbro", "varmt vand"],
    openingHours: {
      summary: "Typisk hverdage 07-21 og weekender 08-18; tjek dagens åbningstid.",
      periods: [
        { days: "mon-thu", open: "07:00", close: "21:00" },
        { days: "sat-sun", open: "08:00", close: "18:00" }
      ]
    },
    neighbourhood: "Vesterbro",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/swim-centre-dgi-gdk429259"
  },
  {
    id: "valby-vandkulturhus",
    name: "Valby Vandkulturhus",
    description:
      "Varmtvand og babysvømning via Hovedstadens Svømmeklub, især godt til de helt små om formiddagen.",
    category: "swimming",
    address: "Julius Andersens Vej 1A, 2450 København SV",
    lat: 55.6608,
    lng: 12.5025,
    ageMinMonths: 3,
    ageMaxMonths: 24,
    photos: [photos.swimming],
    rating: 4.2,
    website: "https://www.hsk.dk/boern-og-unge/babysvoemning/",
    tags: ["babysvømning", "varmt vand", "valby", "formiddag"],
    openingHours: {
      summary: "Babysvømning onsdag formiddag via HSK; tjek holdstart.",
      periods: [{ days: "wed", open: "09:00", close: "12:00" }]
    },
    neighbourhood: "Valby",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.hsk.dk/boern-og-unge/babysvoemning/"
  },
  {
    id: "oebro-hallen",
    name: "Øbro-Hallen",
    description:
      "Klassisk svømmehal ved Fælledparken, god at kende for familier på Østerbro og indre Nørrebro.",
    category: "swimming",
    address: "Gunnar Nu Hansens Plads 3, 2100 København Ø",
    lat: 55.7077,
    lng: 12.5721,
    ageMinMonths: 6,
    ageMaxMonths: 72,
    photos: [photos.swimming],
    rating: 4.1,
    website: "https://svoemkbh.kk.dk/",
    tags: ["svømmehal", "østerbro", "familie", "bassin"],
    openingHours: {
      summary: "Kommunale åbningstider varierer; tjek SvømKBH.",
      periods: [{ days: "mon-sun", open: "07:00", close: "20:00" }]
    },
    neighbourhood: "Østerbro",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://svoemkbh.kk.dk/"
  },
  {
    id: "bellahoej-svoemmestadion",
    name: "Bellahøj Svømmestadion",
    description:
      "Stor kommunal svømmehal i Brønshøj-området med plads til familiebadning og svømmehold.",
    category: "swimming",
    address: "Bellahøjvej 1, 2700 Brønshøj",
    lat: 55.7087,
    lng: 12.5,
    ageMinMonths: 6,
    ageMaxMonths: 72,
    photos: [photos.swimming],
    rating: 4.0,
    website: "https://svoemkbh.kk.dk/",
    tags: ["svømmehal", "brønshøj", "familie", "bassin"],
    openingHours: {
      summary: "Kommunale åbningstider varierer; tjek SvømKBH.",
      periods: [{ days: "mon-sun", open: "07:00", close: "20:00" }]
    },
    neighbourhood: "Brønshøj",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://svoemkbh.kk.dk/"
  },
  {
    id: "det-lille-teater",
    name: "Det Lille Teater",
    description:
      "Københavnsk børneteater for de mindste med forestillinger ofte anbefalet fra 2 år.",
    category: "theatre",
    address: "Lavendelstræde 5-7, 1462 København K",
    lat: 55.6774,
    lng: 12.5742,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    photos: [photos.theatre],
    rating: 4.7,
    website: "https://detlilleteater.dk/",
    tags: ["børneteater", "fra 2 år", "indre by", "billet"],
    openingHours: {
      summary: "Følger forestillingsprogram.",
      periods: [{ days: "wed-sun", open: "10:00", close: "16:00" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/small-theatre-gdk414360"
  },
  {
    id: "marionet-teatret",
    name: "Marionet Teatret",
    description:
      "Gratis sommerteater i Kongens Have fra Det Lille Teater, ofte med korte forestillinger for små børn.",
    category: "theatre",
    address: "Kongens Have, 1350 København K",
    lat: 55.6864,
    lng: 12.5826,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    photos: [photos.theatre],
    rating: 4.6,
    website: "https://detlilleteater.dk/marionet-teatret",
    tags: ["gratis", "sommer", "kongens have", "børneteater"],
    openingHours: {
      summary: "Sommerprogram; typisk daglige forestillinger undtagen mandag.",
      periods: [{ days: "tue-sun", open: "14:00", close: "16:00" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "outdoor",
    priceHint: "free",
    sourceUrl: "https://detlilleteater.dk/marionet-teatret"
  },
  {
    id: "eventyrteatret-tivoli",
    name: "Eventyrteatret i Tivoli",
    description:
      "Familieforestillinger i Glassalen i Tivoli, bedst til de ældste børnehavebørn i MVP-aldersgruppen.",
    category: "theatre",
    address: "Vesterbrogade 3, 1620 København V",
    lat: 55.6738,
    lng: 12.568,
    ageMinMonths: 60,
    ageMaxMonths: 72,
    photos: [photos.theatre],
    rating: 4.5,
    website: "https://www.tivoli.dk/en/programme/theatre/eventyrteatret",
    tags: ["musical", "tivoli", "fra 5 år", "vesterbro"],
    openingHours: {
      summary: "Følger forestillingsprogram og Tivolis sæson.",
      periods: [{ days: "mon-sun", open: "11:00", close: "22:00" }]
    },
    neighbourhood: "Vesterbro",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.tivoli.dk/en/programme/theatre/eventyrteatret"
  },
  {
    id: "kongelige-teater-de-smaa-synger",
    name: "Det Kongelige Teater",
    description:
      "Familieforestillinger i stor skala, blandt andet musikalske børneforestillinger som De små synger.",
    category: "theatre",
    address: "Sankt Annæ Plads 36, 1250 København K",
    lat: 55.6803,
    lng: 12.5946,
    ageMinMonths: 36,
    ageMaxMonths: 72,
    photos: [photos.theatre],
    rating: 4.6,
    website: "https://www.kglteater.dk/",
    tags: ["musik", "teater", "familie", "indre by"],
    openingHours: {
      summary: "Følger forestillingsprogram.",
      periods: [{ days: "mon-sun", open: "10:00", close: "22:00" }]
    },
    neighbourhood: "Indre By",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://www.kglteater.dk/en/drama/2627/de-smaa-synger/"
  },
  {
    id: "copenhagen-zoo",
    name: "København Zoo",
    description:
      "Klassisk familiedag på Frederiksberg med dyr, legeplads, børnevenlige pauser og plads til barnevogn.",
    category: "event",
    address: "Roskildevej 32, 2000 Frederiksberg",
    lat: 55.672,
    lng: 12.521,
    ageMinMonths: 6,
    ageMaxMonths: 72,
    photos: [photos.event],
    rating: 4.6,
    website: "https://www.zoo.dk/",
    tags: ["dyr", "barnevogn", "heldag", "frederiksberg"],
    openingHours: {
      summary: "Sæsonåbning varierer; tjek Zoo-kalender.",
      periods: [{ days: "mon-sun", open: "10:00", close: "17:00" }]
    },
    neighbourhood: "Frederiksberg",
    indoorOutdoor: "both",
    priceHint: "paid",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/activities/fun-attractions-kids"
  },
  {
    id: "tivoli-gardens",
    name: "Tivoli",
    description:
      "Sæsonpark med små forlystelser, havepauser og familieforestillinger midt i København.",
    category: "event",
    address: "Vesterbrogade 3, 1630 København V",
    lat: 55.6736,
    lng: 12.5681,
    ageMinMonths: 12,
    ageMaxMonths: 72,
    photos: [photos.event],
    rating: 4.6,
    website: "https://www.tivoli.dk/",
    tags: ["sæson", "forlystelser", "have", "vesterbro"],
    openingHours: {
      summary: "Sæsonåbent; tjek Tivolis kalender.",
      periods: [{ days: "mon-sun", open: "11:00", close: "22:00" }]
    },
    neighbourhood: "Vesterbro",
    indoorOutdoor: "both",
    priceHint: "paid",
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/activities/fun-attractions-kids"
  },
  // ── Baby-friendly cafes ──────────────────────────────────────────────────
  {
    id: "paludan-bogcafe",
    name: "Paludan Bogcafé",
    description:
      "Stor bogcafé i Latinerkvartet med høje lofter, brede gange og rigelig plads til barnevogn under en lang brunch.",
    category: "cafe",
    address: "Fiolstræde 10, 1171 København K",
    lat: 55.6812,
    lng: 12.5714,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.cafe],
    rating: 4.2,
    website: "https://www.paludan-cafe.dk/",
    tags: ["brunch", "bogcafé", "barnevogn", "indre by"],
    openingHours: {
      summary: "Dagligt fra morgen til sen aften.",
      periods: [{ days: "mon-sun", open: "09:00", close: "22:00" }]
    },
    neighbourhood: "Indre By" as const,
    indoorOutdoor: "indoor" as const,
    priceHint: "budget" as const,
    sourceUrl: "https://www.paludan-cafe.dk/"
  },
  // ── Parks & outdoor play ──────────────────────────────────────────────────
  {
    id: "frederiksberg-have",
    name: "Frederiksberg Have",
    description:
      "Romantisk kongelig park ved siden af Zoo med åer, broer, ænder og en hyggelig legeplads i rolige omgivelser.",
    category: "playground",
    address: "Frederiksberg Runddel 1, 2000 Frederiksberg",
    lat: 55.6761,
    lng: 12.5265,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.8,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/frederiksberg-gardens-gdk443765",
    tags: ["park", "andedammen", "gratis", "frederiksberg"],
    openingHours: {
      summary: "Sæsonmæssigt åbent; tjek parkens åbningstider.",
      periods: [{ days: "mon-sun", open: "07:00", close: "20:00" }]
    },
    neighbourhood: "Frederiksberg" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/frederiksberg-gardens-gdk443765"
  },
  {
    id: "soendermarken",
    name: "Søndermarken",
    description:
      "Bakkende skovpark bag Zoo med snoede stier, åbne enge og et roligt alternativ til byens mere travle parker.",
    category: "playground",
    address: "Søndermarken, 2000 Frederiksberg",
    lat: 55.6764,
    lng: 12.5128,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.6,
    website: "https://www.frederiksberg.dk/borger/natur-miljoe-og-parker/parker-og-groenne-omraader/soendermarken",
    tags: ["skov", "natur", "gratis", "frederiksberg"],
    openingHours: {
      summary: "Udendørs park, åbent hele døgnet.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Frederiksberg" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.frederiksberg.dk/borger/natur-miljoe-og-parker/parker-og-groenne-omraader/soendermarken"
  },
  {
    id: "utterslev-mose",
    name: "Utterslev Mose",
    description:
      "Stor bynær naturreservat med søer, ænder, fuglekig og brede grusstier, der er perfekte til en lang barnevognsudflugt.",
    category: "playground",
    address: "Utterslev Mose, 2700 Brønshøj",
    lat: 55.7145,
    lng: 12.5105,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.7,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/utterslev-mose-gdk481059",
    tags: ["natur", "fugle", "sø", "barnevogn"],
    openingHours: {
      summary: "Udendørs naturreservat, åbent hele døgnet.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Brønshøj" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/utterslev-mose-gdk481059"
  },
  {
    id: "botanisk-have",
    name: "Botanisk Have",
    description:
      "Kongelige botaniske haver med historisk victoriansk palmehus og stille søer – et gratis frikvarter med masser at kigge på, også på regnvejrsdage.",
    category: "playground",
    address: "Øster Farimagsgade 2B, 1353 København K",
    lat: 55.6869,
    lng: 12.5726,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.7,
    website: "https://botanik.snm.ku.dk/",
    tags: ["have", "palmehus", "gratis", "regnvejrsdag"],
    openingHours: {
      summary: "Have åben dagligt; palmehus åbner typisk kl. 10, lukket mandage.",
      periods: [{ days: "tue-sun", open: "10:00", close: "17:00" }]
    },
    neighbourhood: "Indre By" as const,
    indoorOutdoor: "both" as const,
    priceHint: "free" as const,
    sourceUrl: "https://botanik.snm.ku.dk/"
  },
  {
    id: "assistens-kirkegaard",
    name: "Assistens Kirkegård",
    description:
      "Historisk kirkegård brugt som lokal park med grønne plæner, skygge og en fredfyldt stemning midt på Nørrebro.",
    category: "playground",
    address: "Kapelvej 4, 2200 København N",
    lat: 55.6951,
    lng: 12.5476,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.5,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/assistens-cemetery-gdk414327",
    tags: ["park", "grønt", "nørrebro", "gratis"],
    openingHours: {
      summary: "Åbent dagligt fra morgen til aften.",
      periods: [{ days: "mon-sun", open: "07:00", close: "21:00" }]
    },
    neighbourhood: "Nørrebro" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/assistens-cemetery-gdk414327"
  },
  {
    id: "oerstedsparken",
    name: "Ørstedsparken",
    description:
      "Lille sø- og skovpark centralt i København med god barnevognssti rundt om søen, ænder og skygge på varme dage.",
    category: "playground",
    address: "Nørre Voldgade 34, 1358 København K",
    lat: 55.6841,
    lng: 12.5651,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.6,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/oerstedsparken-gdk414325",
    tags: ["park", "sø", "ænder", "gratis"],
    openingHours: {
      summary: "Udendørs park, åbent hele døgnet.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Indre By" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/oerstedsparken-gdk414325"
  },
  {
    id: "ishoj-strandpark",
    name: "Ishøj Strandpark",
    description:
      "Bred sandstrand syd for København med rolige omgivelser og god plads til sandleg – nem med S-tog til Ishøj Station.",
    category: "playground",
    address: "Ishøj Strandvej, 2635 Ishøj",
    lat: 55.6044,
    lng: 12.2993,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.4,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/ishoj-beach-gdk481123",
    tags: ["strand", "sand", "sommer", "ishøj"],
    openingHours: {
      summary: "Udendørs strand, åbent hele døgnet.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Ishøj" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/ishoj-beach-gdk481123"
  },
  // ── Swimming ──────────────────────────────────────────────────────────────
  {
    id: "havnebadet-islands-brygge",
    name: "Havnebadet Islands Brygge",
    description:
      "Ikonisk udendørs havnebad på Islands Brygge med separat børnebassin, solebade-pontoner og livredder i sommersæsonen.",
    category: "swimming",
    address: "Islands Brygge 14, 2300 København S",
    lat: 55.6659,
    lng: 12.5754,
    ageMinMonths: 6,
    ageMaxMonths: 72,
    photos: [photos.swimming],
    rating: 4.7,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/islands-brygge-harbour-baths-gdk479963",
    tags: ["havnebad", "børnebassin", "sommer", "gratis"],
    openingHours: {
      summary: "Sommer (ca. juni-august) dagligt 07-20; tjek åbningssæson.",
      periods: [{ days: "mon-sun", open: "07:00", close: "20:00" }]
    },
    neighbourhood: "Amager" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/islands-brygge-harbour-baths-gdk479963"
  },
  // ── Day trips ─────────────────────────────────────────────────────────────
  {
    id: "dyrehaven",
    name: "Dyrehaven",
    description:
      "Kongelig hjortepark med over 2.000 hjorte, brede åbne sletter og skovstier – perfekt til en lang barnevognsudflugt nord for byen.",
    category: "playground",
    address: "Dyrehaven, 2930 Klampenborg",
    lat: 55.7734,
    lng: 12.5521,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.8,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/the-deer-park-gdk413955",
    tags: ["hjorte", "natur", "skov", "barnevogn"],
    openingHours: {
      summary: "Udendørs park, åbent hele døgnet.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Klampenborg" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/the-deer-park-gdk413955"
  },
  {
    id: "bellevue-strand",
    name: "Bellevue Strand",
    description:
      "Ikonisk sandstrand nord for København ved Klampenborg med blåt vand, livreddertårne og direkte S-togsforbindelse.",
    category: "playground",
    address: "Strandvejen 340, 2930 Klampenborg",
    lat: 55.7672,
    lng: 12.5947,
    ageMinMonths: 6,
    ageMaxMonths: 72,
    photos: [photos.playground],
    rating: 4.6,
    website: "https://www.visitcopenhagen.com/copenhagen/planning/bellevue-beach-gdk413881",
    tags: ["strand", "sand", "s-tog", "sommer"],
    openingHours: {
      summary: "Udendørs strand, åbent hele døgnet.",
      periods: [{ days: "mon-sun", open: "00:00", close: "23:59" }]
    },
    neighbourhood: "Klampenborg" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/bellevue-beach-gdk413881"
  },
  {
    id: "bakken",
    name: "Bakken (Dyrehavsbakken)",
    description:
      "Verdens ældste forlystelsespark i skoven nord for København med gratis entré, rutsjebaner og sommer-nostalgi for hele familien.",
    category: "event",
    address: "Dyrehavevej 62, 2930 Klampenborg",
    lat: 55.7736,
    lng: 12.5783,
    ageMinMonths: 18,
    ageMaxMonths: 72,
    photos: [photos.event],
    rating: 4.5,
    website: "https://bakken.dk/",
    tags: ["forlystelsespark", "sommer", "gratis entré", "klampenborg"],
    openingHours: {
      summary: "Åbent april-august; tjek sæsonkalender.",
      periods: [{ days: "mon-sun", open: "12:00", close: "23:00" }]
    },
    neighbourhood: "Klampenborg" as const,
    indoorOutdoor: "both" as const,
    priceHint: "free" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/bakken-gdk413909"
  },
  {
    id: "louisiana-museum",
    name: "Louisiana Museum of Modern Art",
    description:
      "Verdensberømt kunstmuseum nord for byen med dedikeret børnefløj, skulpturpark ud mod Øresund og familiecafé med udsigt.",
    category: "event",
    address: "Gl Strandvej 13, 3050 Humlebæk",
    lat: 55.9676,
    lng: 12.5443,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    photos: [photos.event],
    rating: 4.8,
    website: "https://www.louisiana.dk/",
    tags: ["kunst", "skulpturpark", "børnefløj", "Øresund"],
    openingHours: {
      summary: "Mandag lukket; tirsdag-fredag 11-22, weekender 11-18.",
      periods: [
        { days: "tue-fri", open: "11:00", close: "22:00" },
        { days: "sat-sun", open: "11:00", close: "18:00" }
      ]
    },
    neighbourhood: "Humlebæk" as const,
    indoorOutdoor: "both" as const,
    priceHint: "paid" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/louisiana-museum-of-modern-art-gdk413997"
  },
  {
    id: "vikingeskibsmuseet",
    name: "Vikingeskibsmuseet",
    description:
      "Museum med fem originale vikingeskibe, levende havn, bådrejser og historisk håndværk i smukke omgivelser ved Roskilde Fjord.",
    category: "event",
    address: "Vindeboder 12, 4000 Roskilde",
    lat: 55.6521,
    lng: 12.0804,
    ageMinMonths: 18,
    ageMaxMonths: 72,
    photos: [photos.event],
    rating: 4.6,
    website: "https://www.vikingeskibsmuseet.dk/",
    tags: ["vikinger", "bådtur", "roskilde", "fjord"],
    openingHours: {
      summary: "Typisk dagligt 10-17; tjek sæsonkalender.",
      periods: [{ days: "mon-sun", open: "10:00", close: "17:00" }]
    },
    neighbourhood: "Roskilde" as const,
    indoorOutdoor: "both" as const,
    priceHint: "paid" as const,
    sourceUrl: "https://www.visitdenmark.com/denmark/plan-your-trip/viking-ship-museum-roskilde-gdk413787"
  },
  {
    id: "frilandsmuseet",
    name: "Frilandsmuseet",
    description:
      "Kæmpe friluftsmuseum i Lyngby med historiske bygninger fra hele landet, frilandsdyr og brede stier til lange barnevognsture.",
    category: "event",
    address: "Kongevejen 100, 2800 Kongens Lyngby",
    lat: 55.7994,
    lng: 12.5167,
    ageMinMonths: 6,
    ageMaxMonths: 72,
    photos: [photos.event],
    rating: 4.5,
    website: "https://natmus.dk/frilandsmuseet/",
    tags: ["friluftsmuseum", "dyr", "historiske huse", "lyngby"],
    openingHours: {
      summary: "Åbent april-oktober, typisk tirsdag-søndag 10-17; lukket mandage.",
      periods: [{ days: "tue-sun", open: "10:00", close: "17:00" }]
    },
    neighbourhood: "Lyngby" as const,
    indoorOutdoor: "outdoor" as const,
    priceHint: "paid" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/the-open-air-museum-gdk414133"
  },
  {
    id: "arken-museum",
    name: "ARKEN Museum for Moderne Kunst",
    description:
      "Arkitektonisk kunstmuseum ved stranden i Ishøj med børneværksteder, skulpturpark og café med udsigt over bugten.",
    category: "event",
    address: "Skovvej 100, 2635 Ishøj",
    lat: 55.6003,
    lng: 12.2856,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    photos: [photos.event],
    rating: 4.5,
    website: "https://www.arken.dk/",
    tags: ["kunst", "museum", "børneværksted", "ishøj"],
    openingHours: {
      summary: "Tirsdag-søndag 10-17, onsdag til 21; lukket mandage.",
      periods: [{ days: "tue-sun", open: "10:00", close: "17:00" }]
    },
    neighbourhood: "Ishøj" as const,
    indoorOutdoor: "indoor" as const,
    priceHint: "paid" as const,
    sourceUrl: "https://www.visitcopenhagen.com/copenhagen/planning/arken-museum-gdk413924"
  },
  {
    id: "copenhagen-contemporary",
    name: "Copenhagen Contemporary",
    description:
      "Stor kunsthal på Refshaleøen med familiesøndage og sanselige udstillinger, bedst til nysgerrige børnehavebørn.",
    category: "event",
    address: "Refshalevej 173A, 1432 København K",
    lat: 55.6936,
    lng: 12.6082,
    ageMinMonths: 36,
    ageMaxMonths: 72,
    photos: [photos.event],
    rating: 4.4,
    website: "https://copenhagencontemporary.org/",
    tags: ["kunst", "familiesøndag", "amager", "sanser"],
    openingHours: {
      summary: "Tjek aktuel udstilling og familieprogram.",
      periods: [{ days: "tue-sun", open: "11:00", close: "18:00" }]
    },
    neighbourhood: "Amager",
    indoorOutdoor: "indoor",
    priceHint: "paid",
    sourceUrl: "https://copenhagencontemporary.org/"
  }
];

export const venues: Venue[] = baseVenues.map((venue) => ({
  ...venue,
  photos: pickPhotos(venue.category, venue.id)
}));

export const events: FamilyEvent[] = [
  {
    id: "frederiksberg-story-time-2026-04-30",
    venueId: "frederiksberg-hovedbibliotek",
    title: "Højtlæsning / Story Time",
    description: "Frivillige læser højt i børnebiblioteket på Frederiksberg Hovedbibliotek.",
    dateStart: "2026-04-30T16:30:00+02:00",
    dateEnd: "2026-04-30T17:15:00+02:00",
    ageMinMonths: 36,
    ageMaxMonths: 72,
    price: "Gratis",
    bookingUrl:
      "https://fkb.dk/frederiksberg-hovedbibliotek/arrangementer/faste-aktiviteter-born/story-time",
    recurring: true,
    recurrenceRule: "FREQ=WEEKLY;BYDAY=TH",
    neighbourhood: "Frederiksberg",
    category: "library"
  },
  {
    id: "hovedbiblioteket-multilingual-child-2026-05-05",
    venueId: "hovedbiblioteket-laes",
    title: "My Multilingual Child",
    description: "Gratis oplæg på Hovedbiblioteket om børns sproglige udvikling i flersprogede familier.",
    dateStart: "2026-05-05T11:00:00+02:00",
    dateEnd: "2026-05-05T12:00:00+02:00",
    ageMinMonths: 0,
    ageMaxMonths: 72,
    price: "Gratis",
    bookingUrl: "https://bibliotek.kk.dk/english/children-and-families",
    recurring: false,
    neighbourhood: "Indre By",
    category: "library"
  },
  {
    id: "marionet-teatret-arnarulunguaq-2026-05-22",
    venueId: "marionet-teatret",
    title: "ARNARULUNNGUAQ - den store lille kvinde",
    description: "Gratis sommerforestilling i Marionet Teatret i Kongens Have.",
    dateStart: "2026-05-22T14:00:00+02:00",
    dateEnd: "2026-05-22T14:30:00+02:00",
    ageMinMonths: 24,
    ageMaxMonths: 72,
    price: "Gratis",
    bookingUrl: "https://detlilleteater.dk/",
    recurring: true,
    recurrenceRule: "FREQ=DAILY;UNTIL=20260712T120000Z",
    neighbourhood: "Indre By",
    category: "theatre"
  },
  {
    id: "dgi-families-in-motion-2026-06-07",
    venueId: "dgi-byen-svoemning",
    title: "Familier i bevægelse",
    description: "Familievenlige bevægelses- og vandaktiviteter i DGI Byen.",
    dateStart: "2026-06-07T10:00:00+02:00",
    dateEnd: "2026-06-07T13:00:00+02:00",
    ageMinMonths: 6,
    ageMaxMonths: 72,
    price: "Fra normal adgang",
    bookingUrl: "https://www.dgibyen.dk/en/healthy-communities/active-families",
    recurring: false,
    neighbourhood: "Vesterbro",
    category: "swimming"
  },
  {
    id: "det-lille-teater-ringen-2026-08-19",
    venueId: "det-lille-teater",
    title: "Ringen",
    description: "Efterårsforestilling på Det Lille Teater.",
    dateStart: "2026-08-19T10:00:00+02:00",
    dateEnd: "2026-08-19T10:45:00+02:00",
    ageMinMonths: 72,
    ageMaxMonths: 96,
    price: "Fra 40 kr.",
    bookingUrl: "https://detlilleteater.dk/",
    recurring: false,
    neighbourhood: "Indre By",
    category: "theatre"
  },
  {
    id: "kgl-de-smaa-synger-2026-11-11",
    venueId: "kongelige-teater-de-smaa-synger",
    title: "De små synger",
    description: "Musikalsk forestilling for små børn på Det Kongelige Teater.",
    dateStart: "2026-11-11T17:00:00+01:00",
    dateEnd: "2026-11-11T17:55:00+01:00",
    ageMinMonths: 36,
    ageMaxMonths: 72,
    price: "105-315 kr.",
    bookingUrl: "https://www.kglteater.dk/en/drama/2627/de-smaa-synger/",
    recurring: true,
    recurrenceRule: "FREQ=WEEKLY;COUNT=10",
    neighbourhood: "Indre By",
    category: "theatre"
  }
];

export function getVenueById(id: string) {
  return venues.find((venue) => venue.id === id);
}
