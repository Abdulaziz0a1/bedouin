import type { DestinationRegion } from "@/lib/types/discovery";

/** Top tourist landmarks shown in the editorial 2-column grid on the homepage. */
export const destinationRegions: DestinationRegion[] = [
  {
    id: "alula",
    slug: "alula",
    name: { en: "AlUla", ar: "العُلا" },
    region: { en: "Al Madinah Region", ar: "منطقة المدينة المنورة" },
    description: {
      en: "Saudi Arabia's crown jewel — ancient Nabataean tombs, rose-red canyons, and the Hegra archaeological city carved into sandstone cliffs 2,000 years ago.",
      ar: "جوهرة المملكة العربية السعودية — مقابر نبطية عريقة وأودية حمراء كالورد، ومدينة الحِجر الأثرية المنحوتة في الصخور الرملية منذ ألفَي عام.",
    },
    image: "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=900&h=1000&fit=crop",
    href: "/explore?location=AlUla",
    ranking_score: 98,
    visible: true,
    seasonal: { seasons: ["winter", "spring"], peak_season: "winter" },
    promotion: { sponsored: false, boost_level: "high", campaign_id: "alula-2025" },
  },
  {
    id: "abha",
    slug: "abha",
    name: { en: "Abha", ar: "أبها" },
    region: { en: "Aseer Region", ar: "منطقة عسير" },
    description: {
      en: "Misty highlands, jacaranda-lined streets, and a cool green escape in the heart of Saudi Arabia's mountain south.",
      ar: "مرتفعات ضبابية وشوارع مكسوة بأشجار الجاكرندا، وملاذ أخضر رائع في قلب جنوب المملكة الجبلي.",
    },
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&h=500&fit=crop",
    href: "/explore?location=Abha",
    ranking_score: 91,
    visible: true,
    seasonal: { seasons: ["summer", "spring"], peak_season: "summer" },
  },
  {
    id: "asir-highlands",
    slug: "asir-highlands",
    name: { en: "Asir Highlands", ar: "مرتفعات عسير" },
    region: { en: "Aseer Region", ar: "منطقة عسير" },
    description: {
      en: "Terraced mountain villages, ancient watchtowers, and Saudi Arabia's most dramatic highland landscape above the clouds.",
      ar: "قرى جبلية مدرجة وأبراج مراقبة عريقة، وأكثر المناظر الطبيعية المرتفعة درامية في المملكة العربية السعودية.",
    },
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=500&fit=crop",
    href: "/explore?region=Abha",
    ranking_score: 86,
    visible: true,
    seasonal: { seasons: ["spring", "summer", "autumn"], peak_season: "spring" },
  },
];
