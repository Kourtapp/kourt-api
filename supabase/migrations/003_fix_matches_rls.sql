-- ==============================================
-- FIX MATCHES RLS
-- ==============================================

-- Drop existing policy if it exists (to be safe)
DROP POLICY IF EXISTS "Users can create matches" ON matches;

-- Create correct policy
CREATE POLICY "Users can create matches" ON matches 
  FOR INSERT 
  WITH CHECK (auth.uid() = organizer_id);

-- Ensure authenticated users can insert
GRANT INSERT ON matches TO authenticated;
