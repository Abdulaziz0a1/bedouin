-- Migration 25: Add rejected_steps TEXT[] for multi-step rejection support
--
-- The old rejected_step (single TEXT) column remains for backward compatibility.
-- The new rejection flow writes to rejected_steps (TEXT[]).
-- The host-dashboard service merges both when mapping to the UI.

ALTER TABLE listing_submissions
  ADD COLUMN IF NOT EXISTS rejected_steps TEXT[] DEFAULT NULL;

-- Re-clear both columns on resubmission (handled in TypeScript, but document here)
COMMENT ON COLUMN listing_submissions.rejected_steps IS
  'Array of step keys that admin flagged on rejection. Valid values: category, description, location, capacity_rules, amenities, pricing, media. Cleared when host resubmits.';
