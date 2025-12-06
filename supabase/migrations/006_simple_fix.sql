-- Simple fix for common RLS issues
-- Run this in Supabase SQL Editor

-- 1. Fix profiles table RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Fix matches table RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Organizers can update own matches" ON matches;
DROP POLICY IF EXISTS "Organizers can delete own matches" ON matches;

CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Users can create matches" ON matches FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own matches" ON matches FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own matches" ON matches FOR DELETE USING (auth.uid() = organizer_id);

-- 3. Fix match_players table RLS
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view match players" ON match_players;
DROP POLICY IF EXISTS "Users can join matches" ON match_players;
DROP POLICY IF EXISTS "Users can leave matches" ON match_players;
DROP POLICY IF EXISTS "Users can update own player status" ON match_players;

CREATE POLICY "Anyone can view match players" ON match_players FOR SELECT USING (true);
CREATE POLICY "Users can join matches" ON match_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave matches" ON match_players FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own player status" ON match_players FOR UPDATE USING (auth.uid() = user_id);

-- 4. Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0;

-- 5. Grant permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON match_players TO authenticated;
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON matches TO anon;
