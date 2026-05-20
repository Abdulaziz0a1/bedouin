/**
 * Returns the localised version of a listing text field.
 * Falls back to the English value if no Arabic translation exists.
 */
export function getListingText(en: string, ar: string | undefined, lang: string): string {
  if (lang === "ar") return ar?.trim() ? ar : (en || "");
  return en?.trim() ? en : (ar || "");
}

/**
 * Returns the localised version of a listing highlights array.
 * Falls back to the English array if no Arabic array exists.
 */
export function getListingHighlights(en: string[], ar: string[] | undefined, lang: string): string[] {
  if (lang === "ar") return (ar && ar.length > 0 && ar.some((s) => s.trim())) ? ar : en;
  return (en && en.length > 0 && en.some((s) => s.trim())) ? en : (ar ?? en);
}
