/* Amenities reference data
   Reusable across: host/add listing, listing detail page, admin review, host dashboard */

export type AmenityCategory = "essentials" | "outdoor" | "food" | "comfort" | "safety" | "activities";

export interface AmenityDef {
  id:       string;
  labelKey: string;
  icon:     string;
  category: AmenityCategory;
}

export const ALL_AMENITIES: AmenityDef[] = [
  /* ── Essentials ── */
  { id: "wifi",       labelKey: "amenity.wifi",       icon: "📶", category: "essentials" },
  { id: "parking",    labelKey: "amenity.parking",    icon: "🚗", category: "essentials" },
  { id: "ac",         labelKey: "amenity.ac",         icon: "❄️", category: "essentials" },
  { id: "washer",     labelKey: "amenity.washer",     icon: "🧺", category: "essentials" },
  { id: "tv",         labelKey: "amenity.tv",         icon: "📺", category: "essentials" },

  /* ── Outdoor ── */
  { id: "pool",       labelKey: "amenity.pool",       icon: "🏊", category: "outdoor" },
  { id: "garden",     labelKey: "amenity.garden",     icon: "🌿", category: "outdoor" },
  { id: "terrace",    labelKey: "amenity.terrace",    icon: "🏔️", category: "outdoor" },
  { id: "firepit",    labelKey: "amenity.firepit",    icon: "🔥", category: "outdoor" },
  { id: "bbq",        labelKey: "amenity.bbq",        icon: "🍖", category: "outdoor" },

  /* ── Food ── */
  { id: "kitchen",    labelKey: "amenity.kitchen",    icon: "🍳", category: "food" },
  { id: "breakfast",  labelKey: "amenity.breakfast",  icon: "☕", category: "food" },
  { id: "coffee",     labelKey: "amenity.coffee",     icon: "🫖", category: "food" },
  { id: "dining",     labelKey: "amenity.dining",     icon: "🍽️", category: "food" },

  /* ── Comfort ── */
  { id: "heating",    labelKey: "amenity.heating",    icon: "🌡️", category: "comfort" },
  { id: "bathtub",    labelKey: "amenity.bathtub",    icon: "🛁", category: "comfort" },
  { id: "toiletries", labelKey: "amenity.toiletries", icon: "🧴", category: "comfort" },
  { id: "sound",      labelKey: "amenity.sound",      icon: "🎶", category: "comfort" },
  { id: "workspace",  labelKey: "amenity.workspace",  icon: "💻", category: "comfort" },

  /* ── Safety ── */
  { id: "firstaid",   labelKey: "amenity.firstaid",   icon: "🩺", category: "safety" },
  { id: "smoke",      labelKey: "amenity.smoke",      icon: "🔊", category: "safety" },
  { id: "co",         labelKey: "amenity.co",         icon: "🛡️", category: "safety" },
  { id: "security",   labelKey: "amenity.security",   icon: "🔒", category: "safety" },

  /* ── Activities ── */
  { id: "telescope",  labelKey: "amenity.telescope",  icon: "🔭", category: "activities" },
  { id: "hiking",     labelKey: "amenity.hiking",     icon: "🌲", category: "activities" },
  { id: "camel",      labelKey: "amenity.camel",      icon: "🐫", category: "activities" },
  { id: "stargazing", labelKey: "amenity.stargazing", icon: "⭐", category: "activities" },
  { id: "horseback",  labelKey: "amenity.horseback",  icon: "🐎", category: "activities" },
];

export const AMENITY_CATEGORY_TKEYS: Record<AmenityCategory, string> = {
  essentials:  "amenity.cat.essentials",
  outdoor:     "amenity.cat.outdoor",
  food:        "amenity.cat.food",
  comfort:     "amenity.cat.comfort",
  safety:      "amenity.cat.safety",
  activities:  "amenity.cat.activities",
};

export const AMENITY_CATEGORIES: AmenityCategory[] = [
  "essentials", "outdoor", "food", "comfort", "safety", "activities",
];
