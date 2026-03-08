export type Category =
  | "farms"
  | "house"
  | "guesthouse"
  | "cabins"
  | "glamping"
  | "doms";

export type Region =
  | "AlUla"
  | "Abha"
  | "Taif"
  | "AlBaha"
  | "AlAhsa"
  | "Tabuk"
  | "Riyadh"
  | "Jeddah"
  | "Hail"
  | "Madinah";

export interface Listing {
  id: string;
  image: string;
  title: string;
  location: string;
  region: Region;
  category: Category;
  price: number;
  originalPrice?: number;
  priceUnit?: string;
  score: number;
  reviewCount: number;
  badge?: string;
  badgeColor?: string;
  tags: string[];
}

export const ALL_LISTINGS: Listing[] = [
  {
    id: "strawberry-hill",
    image: "https://picsum.photos/seed/strawberry-farm/600/440",
    title: "Strawberry Hill Farm",
    location: "Al Taif, Hada Al Sham",
    region: "Taif",
    category: "farms",
    price: 75,
    score: 5.0,
    reviewCount: 412,
    badge: "Top Rated",
    badgeColor: "#049153",
    tags: ["Fruit picking", "Family friendly"],
  },
  {
    id: "alula-stargazing-dome",
    image: "https://picsum.photos/seed/dome-night-sky/600/440",
    title: "AlUla Stargazing Dome",
    location: "AlUla, Madain Saleh Area",
    region: "AlUla",
    category: "doms",
    price: 480,
    score: 5.0,
    reviewCount: 287,
    badge: "Luxury",
    badgeColor: "#8b5e38",
    tags: ["Stargazing", "Romantic", "Desert"],
  },
  {
    id: "asir-highland-cabin",
    image: "https://picsum.photos/seed/mountain-cabin-1/600/440",
    title: "Asir Highland Cabin",
    location: "Abha, Al Soudah",
    region: "Abha",
    category: "cabins",
    price: 220,
    originalPrice: 290,
    score: 4.9,
    reviewCount: 198,
    badge: "24% off",
    badgeColor: "#e03e2d",
    tags: ["Mountain views", "Cool weather", "Hiking"],
  },
  {
    id: "red-sand-glamping",
    image: "https://picsum.photos/seed/red-desert-tent/600/440",
    title: "Red Sand Glamping",
    location: "Riyadh, Al Kharj Road",
    region: "Riyadh",
    category: "glamping",
    price: 320,
    score: 4.8,
    reviewCount: 154,
    badge: "Popular",
    badgeColor: "#049153",
    tags: ["Desert", "Camel riding", "Bonfire"],
  },
  {
    id: "date-palm-estate",
    image: "https://picsum.photos/seed/date-palm-oasis/600/440",
    title: "Date Palm Estate",
    location: "Al Ahsa, Hofuf",
    region: "AlAhsa",
    category: "farms",
    price: 85,
    score: 4.7,
    reviewCount: 96,
    tags: ["Date harvest", "Oasis walk", "Traditional"],
  },
  {
    id: "tabuk-cliff-house",
    image: "https://picsum.photos/seed/cliff-house-tabuk/600/440",
    title: "Tabuk Cliff House",
    location: "Tabuk, Wadi Tayeb Al Ism",
    region: "Tabuk",
    category: "house",
    price: 550,
    score: 5.0,
    reviewCount: 63,
    badge: "Rare find",
    badgeColor: "#8b5e38",
    tags: ["Cliffside", "Scenic", "Secluded"],
  },
  {
    id: "albaha-fruit-farm",
    image: "https://picsum.photos/seed/fruit-terraces/600/440",
    title: "Al Baha Terraced Farm",
    location: "Al Baha, Al Aqiq",
    region: "AlBaha",
    category: "farms",
    price: 99,
    score: 4.8,
    reviewCount: 178,
    tags: ["Terrace gardens", "Coffee", "Honey"],
  },
  {
    id: "hegra-desert-camp",
    image: "https://picsum.photos/seed/desert-camp-hegra/600/440",
    title: "Hegra Desert Experience",
    location: "AlUla, Hegra Heritage Site",
    region: "AlUla",
    category: "glamping",
    price: 390,
    originalPrice: 450,
    score: 4.9,
    reviewCount: 211,
    badge: "13% off",
    badgeColor: "#e03e2d",
    tags: ["Heritage", "Photography", "Sunset"],
  },
  {
    id: "asir-guesthouse",
    image: "https://picsum.photos/seed/asir-guesthouse/600/440",
    title: "Asir Heritage Guesthouse",
    location: "Abha, Old Town",
    region: "Abha",
    category: "guesthouse",
    price: 160,
    score: 4.6,
    reviewCount: 87,
    tags: ["Cultural", "Abha city", "Local food"],
  },
  {
    id: "al-namas-orchard",
    image: "https://picsum.photos/seed/orchard-namas/600/440",
    title: "Al Namas Apple Orchard",
    location: "Abha, Al Namas",
    region: "Abha",
    category: "farms",
    price: 120,
    score: 5.0,
    reviewCount: 203,
    badge: "Top Rated",
    badgeColor: "#049153",
    tags: ["Apple picking", "Fog forest", "Cool"],
  },
  {
    id: "jeddah-heritage-riad",
    image: "https://picsum.photos/seed/jeddah-riad/600/440",
    title: "Al-Balad Heritage Riad",
    location: "Jeddah, Historic District",
    region: "Jeddah",
    category: "house",
    price: 680,
    score: 4.9,
    reviewCount: 134,
    badge: "UNESCO",
    badgeColor: "#0046cc",
    tags: ["Heritage", "Coral house", "Rooftop"],
  },
  {
    id: "hail-rock-cabin",
    image: "https://picsum.photos/seed/rock-formation-cabin/600/440",
    title: "Hail Rock Formation Cabin",
    location: "Hail, Jubbah",
    region: "Hail",
    category: "cabins",
    price: 195,
    score: 4.7,
    reviewCount: 72,
    tags: ["Rock art", "Desert", "Ancient"],
  },
  {
    id: "madinah-valley-lodge",
    image: "https://picsum.photos/seed/valley-lodge-green/600/440",
    title: "Madinah Valley Lodge",
    location: "Madinah, Al Ula Road",
    region: "Madinah",
    category: "guesthouse",
    price: 145,
    score: 4.5,
    reviewCount: 58,
    tags: ["Peaceful", "Valley views", "Garden"],
  },
  {
    id: "alula-rock-dome",
    image: "https://picsum.photos/seed/alula-rock-dome/600/440",
    title: "AlUla Rock Dome Suite",
    location: "AlUla, Dadan Valley",
    region: "AlUla",
    category: "doms",
    price: 520,
    score: 5.0,
    reviewCount: 94,
    badge: "New",
    badgeColor: "#8b5e38",
    tags: ["Luxury", "Pool", "Canyon views"],
  },
  {
    id: "taif-rose-farm",
    image: "https://picsum.photos/seed/rose-garden-taif/600/440",
    title: "Taif Rose Garden Farm",
    location: "Taif, Al Shafa",
    region: "Taif",
    category: "farms",
    price: 65,
    score: 4.8,
    reviewCount: 329,
    tags: ["Rose harvest", "Distillery", "Fragrant"],
  },
  {
    id: "abha-sky-glamping",
    image: "https://picsum.photos/seed/sky-tent-abha/600/440",
    title: "Abha Sky Glamping",
    location: "Abha, Al Soudah Park",
    region: "Abha",
    category: "glamping",
    price: 280,
    originalPrice: 340,
    score: 4.8,
    reviewCount: 167,
    badge: "18% off",
    badgeColor: "#e03e2d",
    tags: ["Cloud level", "Cable car", "Views"],
  },
  {
    id: "alahsa-palm-grove",
    image: "https://picsum.photos/seed/palm-grove-villa/600/440",
    title: "Al Ahsa Palm Grove Villa",
    location: "Al Ahsa, Al Uqair",
    region: "AlAhsa",
    category: "house",
    price: 310,
    score: 4.6,
    reviewCount: 45,
    tags: ["Palm oasis", "Private pool", "Heritage"],
  },
  {
    id: "tabuk-desert-experience",
    image: "https://picsum.photos/seed/tabuk-wadi-rum/600/440",
    title: "Tabuk Wadi Rum Experience",
    location: "Tabuk, Sharma Beach Area",
    region: "Tabuk",
    category: "glamping",
    price: 360,
    score: 4.9,
    reviewCount: 122,
    tags: ["Wadi", "Snorkeling", "Beach"],
  },
];

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all",         label: "All"         },
  { id: "farms",       label: "Farms"       },
  { id: "house",       label: "House"       },
  { id: "guesthouse",  label: "Guest House" },
  { id: "cabins",      label: "Cabins"      },
  { id: "glamping",    label: "Glamping"    },
  { id: "doms",        label: "Doms"        },
];

export const REGIONS: (Region | "All")[] = [
  "All", "AlUla", "Abha", "Taif", "AlBaha", "AlAhsa", "Tabuk", "Riyadh", "Jeddah", "Hail", "Madinah",
];

export const PRICE_RANGES = [
  { id: "all",    label: "Any price"       },
  { id: "u100",   label: "Under SAR 100"   },
  { id: "100-250",label: "SAR 100 – 250"   },
  { id: "250-500",label: "SAR 250 – 500"   },
  { id: "500+",   label: "SAR 500+"        },
];

export function filterListings(
  listings: Listing[],
  opts: {
    query?: string;
    category?: string;
    region?: string;
    priceRange?: string;
    sortBy?: string;
  }
): Listing[] {
  const { query = "", category = "all", region = "All", priceRange = "all", sortBy = "popular" } = opts;

  let result = listings.filter((l) => {
    if (query) {
      const q = query.toLowerCase();
      if (!l.title.toLowerCase().includes(q) && !l.location.toLowerCase().includes(q) && !l.tags.some(t => t.toLowerCase().includes(q))) return false;
    }
    if (category !== "all" && l.category !== category) return false;
    if (region !== "All" && l.region !== region) return false;
    if (priceRange === "u100"    && l.price >= 100) return false;
    if (priceRange === "100-250" && (l.price < 100 || l.price > 250)) return false;
    if (priceRange === "250-500" && (l.price < 250 || l.price > 500)) return false;
    if (priceRange === "500+"    && l.price < 500) return false;
    return true;
  });

  if (sortBy === "price-asc")  result = [...result].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
  if (sortBy === "rating")     result = [...result].sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount);

  return result;
}
