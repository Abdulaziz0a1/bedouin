/* Amenities reference data
   Reusable across: host/add listing, listing detail page, admin review, host dashboard */

export type AmenityCategory = "essentials" | "outdoor" | "food" | "comfort" | "safety" | "activities";

export interface AmenityDef {
  id: string;
  label: string;
  icon: string;
  category: AmenityCategory;
}

export const ALL_AMENITIES: AmenityDef[] = [
  /* ── Essentials ── */
  { id: "wifi",       label: "WiFi",               icon: "📶", category: "essentials" },
  { id: "parking",    label: "Free parking",        icon: "🚗", category: "essentials" },
  { id: "ac",         label: "Air conditioning",    icon: "❄️", category: "essentials" },
  { id: "washer",     label: "Washer / dryer",      icon: "🧺", category: "essentials" },
  { id: "tv",         label: "Smart TV",            icon: "📺", category: "essentials" },

  /* ── Outdoor ── */
  { id: "pool",       label: "Private pool",        icon: "🏊", category: "outdoor" },
  { id: "garden",     label: "Garden / yard",       icon: "🌿", category: "outdoor" },
  { id: "terrace",    label: "Terrace / deck",      icon: "🏔️", category: "outdoor" },
  { id: "firepit",    label: "Outdoor fire pit",    icon: "🔥", category: "outdoor" },
  { id: "bbq",        label: "BBQ grill",           icon: "🍖", category: "outdoor" },

  /* ── Food ── */
  { id: "kitchen",    label: "Full kitchen",        icon: "🍳", category: "food" },
  { id: "breakfast",  label: "Breakfast included",  icon: "☕", category: "food" },
  { id: "coffee",     label: "Arabic coffee & dates", icon: "🫖", category: "food" },
  { id: "dining",     label: "Outdoor dining area", icon: "🍽️", category: "food" },

  /* ── Comfort ── */
  { id: "heating",    label: "Heating",             icon: "🌡️", category: "comfort" },
  { id: "bathtub",    label: "Bathtub",             icon: "🛁", category: "comfort" },
  { id: "toiletries", label: "Luxury toiletries",   icon: "🧴", category: "comfort" },
  { id: "sound",      label: "Sound system",        icon: "🎶", category: "comfort" },
  { id: "workspace",  label: "Dedicated workspace", icon: "💻", category: "comfort" },

  /* ── Safety ── */
  { id: "firstaid",   label: "First aid kit",       icon: "🩺", category: "safety" },
  { id: "smoke",      label: "Smoke detector",      icon: "🔊", category: "safety" },
  { id: "co",         label: "CO detector",         icon: "🛡️", category: "safety" },
  { id: "security",   label: "24h security",        icon: "🔒", category: "safety" },

  /* ── Activities ── */
  { id: "telescope",  label: "Telescope",           icon: "🔭", category: "activities" },
  { id: "hiking",     label: "Hiking trails",       icon: "🌲", category: "activities" },
  { id: "camel",      label: "Camel riding",        icon: "🐫", category: "activities" },
  { id: "stargazing", label: "Stargazing deck",     icon: "⭐", category: "activities" },
  { id: "horseback",  label: "Horse riding",        icon: "🐎", category: "activities" },
];

export const AMENITY_CATEGORY_LABELS: Record<AmenityCategory, string> = {
  essentials:  "Essentials",
  outdoor:     "Outdoor",
  food:        "Food & Drink",
  comfort:     "Comfort",
  safety:      "Safety",
  activities:  "Activities",
};

export const AMENITY_CATEGORIES: AmenityCategory[] = [
  "essentials", "outdoor", "food", "comfort", "safety", "activities",
];
