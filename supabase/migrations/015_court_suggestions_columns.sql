-- Migration: Add missing columns to court_suggestions table
-- These columns are used in the court registration flow

-- Add access_type column (e.g., 'free', 'paid', 'members_only')
ALTER TABLE court_suggestions
ADD COLUMN IF NOT EXISTS access_type VARCHAR(50);

-- Add reference column (landmark/reference point)
ALTER TABLE court_suggestions
ADD COLUMN IF NOT EXISTS reference TEXT;

-- Add floor_types column (array of floor types like 'concrete', 'synthetic', etc.)
ALTER TABLE court_suggestions
ADD COLUMN IF NOT EXISTS floor_types TEXT[] DEFAULT '{}';

-- Add has_lighting column
ALTER TABLE court_suggestions
ADD COLUMN IF NOT EXISTS has_lighting BOOLEAN DEFAULT FALSE;

-- Add is_covered column
ALTER TABLE court_suggestions
ADD COLUMN IF NOT EXISTS is_covered BOOLEAN DEFAULT FALSE;
