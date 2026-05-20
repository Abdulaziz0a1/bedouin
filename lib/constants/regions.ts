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

/** Maps each English region name to its i18n translation key. */
export const REGION_KEY_MAP: Record<string, string> = {
  "Al Baha":          "region.al_baha",
  "Al Jouf":          "region.al_jouf",
  "Al Qassim":        "region.al_qassim",
  "Asir":             "region.asir",
  "Eastern Province": "region.eastern_province",
  "Hail":             "region.hail",
  "Jazan":            "region.jazan",
  "Madinah":          "region.madinah",
  "Makkah":           "region.makkah",
  "Najran":           "region.najran",
  "Northern Borders": "region.northern_borders",
  "Riyadh":           "region.riyadh",
  "Tabuk":            "region.tabuk",
};
