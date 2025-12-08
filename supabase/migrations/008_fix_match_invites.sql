-- ==============================================
-- Fix match_players RLS for invites
-- Allow match organizer to invite players
-- ==============================================

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can join matches" ON match_players;

-- Create new policy that allows:
-- 1. Users to join matches themselves (user_id = auth.uid())
-- 2. Match organizers to invite players to their matches
CREATE POLICY "Users can join or be invited to matches" ON match_players
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_players.match_id
    AND matches.organizer_id = auth.uid()
  )
);

-- Also update delete policy to allow organizers to remove players
DROP POLICY IF EXISTS "Users can leave matches" ON match_players;

CREATE POLICY "Users can leave or be removed from matches" ON match_players
FOR DELETE
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_players.match_id
    AND matches.organizer_id = auth.uid()
  )
);

-- Add update policy for organizers to change player status
DROP POLICY IF EXISTS "Organizers can update match players" ON match_players;

CREATE POLICY "Organizers can update match players" ON match_players
FOR UPDATE
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_players.match_id
    AND matches.organizer_id = auth.uid()
  )
);
