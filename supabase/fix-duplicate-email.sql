-- ==============================================
-- FIX DUPLICATE EMAIL ISSUE
-- Execute este SQL no SQL Editor do Supabase
-- ==============================================

-- Add unique constraint on email if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Verify auth.users already has email unique (it should by default)
-- This is just a check - Supabase auth handles this automatically
