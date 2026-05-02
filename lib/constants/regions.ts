export const SAUDI_REGIONS = [
  "Al Baha",
  "Al Jouf",
  "Al Qassim",
  "Asir",
  "Eastern Province",
  "Hail",
  "Jazan",
  "Madinah",
  "Makkah",
  "Najran",
  "Northern Borders",
  "Riyadh",
  "Tabuk",
] as const;

export type Region = typeof SAUDI_REGIONS[number];

export const REGIONS: (Region | "All")[] = ["All", ...SAUDI_REGIONS];
