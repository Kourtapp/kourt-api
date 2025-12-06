-- Migration: Add AI verification fields to court_suggestions
-- This adds fields to store AI verification results for court submissions

-- Add AI verification columns to court_suggestions
ALTER TABLE court_suggestions
ADD COLUMN IF NOT EXISTS ai_verification_status VARCHAR(20) DEFAULT 'pending'
  CHECK (ai_verification_status IN ('pending', 'verified', 'rejected', 'manual_review')),
ADD COLUMN IF NOT EXISTS ai_verification_result JSONB,
ADD COLUMN IF NOT EXISTS ai_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS photos_metadata JSONB;

-- Create index for faster queries on verification status
CREATE INDEX IF NOT EXISTS idx_court_suggestions_ai_status
ON court_suggestions(ai_verification_status);

-- Add comment explaining the JSONB structure
COMMENT ON COLUMN court_suggestions.ai_verification_result IS
'Stores AI verification result: {
  isValid: boolean,
  confidence: number,
  isSportsCourt: boolean,
  detectedSports: string[],
  detectedFloorType: string,
  issues: string[],
  suggestions: string[],
  descriptionMatch: number,
  photoQuality: { overview, equipment, floor }
}';

COMMENT ON COLUMN court_suggestions.photos_metadata IS
'Stores photo metadata: [{
  type: "overview" | "equipment" | "floor" | "other",
  url: string,
  uploadedAt: timestamp,
  verified: boolean
}]';

-- Update RLS policies to allow users to see their own verification results
CREATE POLICY IF NOT EXISTS "Users can view their own court verification results"
ON court_suggestions
FOR SELECT
USING (auth.uid() = user_id);

-- Function to auto-update ai_verified_at timestamp
CREATE OR REPLACE FUNCTION update_ai_verified_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_verification_status IS DISTINCT FROM OLD.ai_verification_status
     AND NEW.ai_verification_status IN ('verified', 'rejected') THEN
    NEW.ai_verified_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp when verification status changes
DROP TRIGGER IF EXISTS trigger_update_ai_verified_at ON court_suggestions;
CREATE TRIGGER trigger_update_ai_verified_at
BEFORE UPDATE ON court_suggestions
FOR EACH ROW
EXECUTE FUNCTION update_ai_verified_at();
