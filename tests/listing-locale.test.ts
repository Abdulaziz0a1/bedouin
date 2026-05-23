import { describe, it, expect } from "vitest";
import { getListingText, getListingHighlights } from "@/lib/utils/listing-locale";

// ─── getListingText ───────────────────────────────────────────────────────────
// Validates bilingual fallback logic for a single text field.
// Rules under test:
//   • lang="ar" → prefer ar; fall back to en when ar is absent/blank
//   • lang="en" → prefer en; fall back to ar when en is absent/blank

describe("getListingText", () => {

  // ── Arabic mode ─────────────────────────────────────────────────────────────

  it("UT-51 returns Arabic value when lang=ar and ar is populated", () => {
    expect(getListingText("Farm", "مزرعة", "ar")).toBe("مزرعة");
  });

  it("UT-52 falls back to English when lang=ar and ar is an empty string", () => {
    expect(getListingText("Farm", "", "ar")).toBe("Farm");
  });

  it("UT-53 falls back to English when lang=ar and ar is whitespace-only", () => {
    expect(getListingText("Farm", "   ", "ar")).toBe("Farm");
  });

  it("UT-54 falls back to English when lang=ar and ar is undefined", () => {
    expect(getListingText("Farm", undefined, "ar")).toBe("Farm");
  });

  // ── English mode ────────────────────────────────────────────────────────────

  it("UT-55 returns English value when lang=en and en is populated", () => {
    expect(getListingText("Farm", "مزرعة", "en")).toBe("Farm");
  });

  it("UT-56 falls back to Arabic when lang=en and en is an empty string", () => {
    expect(getListingText("", "مزرعة", "en")).toBe("مزرعة");
  });

  it("UT-57 falls back to Arabic when lang=en and en is whitespace-only", () => {
    expect(getListingText("   ", "مزرعة", "en")).toBe("مزرعة");
  });

  it("UT-58 returns empty string when both en and ar are absent", () => {
    expect(getListingText("", "", "en")).toBe("");
    expect(getListingText("", undefined, "ar")).toBe("");
  });
});

// ─── getListingHighlights ─────────────────────────────────────────────────────
// Validates bilingual fallback logic for an array of highlight strings.
// Rules under test:
//   • lang="ar" → prefer ar[] when at least one entry has non-blank content
//   • lang="ar" → fall back to en[] when ar[] is empty/absent/all-whitespace
//   • lang="en" → prefer en[] when at least one entry has non-blank content
//   • lang="en" → fall back to ar[] when en[] is empty/absent/all-whitespace

describe("getListingHighlights", () => {

  // ── Arabic mode ─────────────────────────────────────────────────────────────

  it("UT-59 returns Arabic highlights when lang=ar and ar array has content", () => {
    expect(getListingHighlights(["a", "b"], ["أ", "ب"], "ar")).toEqual(["أ", "ب"]);
  });

  it("UT-60 falls back to English highlights when lang=ar and ar array is empty", () => {
    expect(getListingHighlights(["a", "b"], [], "ar")).toEqual(["a", "b"]);
  });

  it("UT-61 falls back to English highlights when lang=ar and ar array is undefined", () => {
    expect(getListingHighlights(["a", "b"], undefined, "ar")).toEqual(["a", "b"]);
  });

  it("UT-62 falls back to English highlights when lang=ar and ar contains only whitespace strings", () => {
    expect(getListingHighlights(["a", "b"], ["  ", "   "], "ar")).toEqual(["a", "b"]);
  });

  // ── English mode ────────────────────────────────────────────────────────────

  it("UT-63 returns English highlights when lang=en and en array has content", () => {
    expect(getListingHighlights(["a", "b"], ["أ", "ب"], "en")).toEqual(["a", "b"]);
  });

  it("UT-64 falls back to Arabic highlights when lang=en and en array is empty", () => {
    expect(getListingHighlights([], ["أ", "ب"], "en")).toEqual(["أ", "ب"]);
  });

  it("UT-65 falls back to Arabic highlights when lang=en and en contains only whitespace strings", () => {
    expect(getListingHighlights(["  "], ["أ", "ب"], "en")).toEqual(["أ", "ب"]);
  });

  it("UT-66 returns English array when both are present and lang=en (ar is ignored)", () => {
    const en = ["Sea view", "Private pool"];
    const ar = ["إطلالة بحرية", "مسبح خاص"];
    expect(getListingHighlights(en, ar, "en")).toEqual(en);
  });
});
