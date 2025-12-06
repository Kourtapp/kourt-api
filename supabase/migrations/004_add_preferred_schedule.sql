-- Migration: Add missing preferred_schedule column to profiles
-- This column is required for the onboarding flow

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_schedule text;

-- Also ensure other potentially missing columns exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_provider text;
