-- ==============================================
-- FIX ALL RLS POLICIES
-- ==============================================

-- ==============================================
-- 1. PROFILES TABLE RLS
-- ==============================================

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Anyone can view profiles (public data)
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- ==============================================
-- 2. MATCHES TABLE RLS
-- ==============================================

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view public matches" ON matches;
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Organizers can update own matches" ON matches;
DROP POLICY IF EXISTS "Anyone can view matches" ON matches;

-- Anyone can view public matches
CREATE POLICY "Anyone can view matches" ON matches
  FOR SELECT USING (is_public = true OR organizer_id = auth.uid());

-- Users can create matches (organizer_id must be the authenticated user)
CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own matches
CREATE POLICY "Organizers can update own matches" ON matches
  FOR UPDATE USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Organizers can delete their own matches
CREATE POLICY "Organizers can delete own matches" ON matches
  FOR DELETE USING (auth.uid() = organizer_id);

-- Grant permissions
GRANT SELECT ON matches TO authenticated;
GRANT INSERT ON matches TO authenticated;
GRANT UPDATE ON matches TO authenticated;
GRANT DELETE ON matches TO authenticated;
GRANT SELECT ON matches TO anon;

-- ==============================================
-- 3. MATCH_PLAYERS TABLE RLS
-- ==============================================

-- Enable RLS
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view match players" ON match_players;
DROP POLICY IF EXISTS "Users can join matches" ON match_players;
DROP POLICY IF EXISTS "Users can leave matches" ON match_players;
DROP POLICY IF EXISTS "Users can update own player status" ON match_players;

-- Anyone can view match players
CREATE POLICY "Anyone can view match players" ON match_players
  FOR SELECT USING (true);

-- Users can join matches
CREATE POLICY "Users can join matches" ON match_players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave matches (delete their own entry)
CREATE POLICY "Users can leave matches" ON match_players
  FOR DELETE USING (auth.uid() = user_id);

-- Users can update their own player status
CREATE POLICY "Users can update own player status" ON match_players
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON match_players TO authenticated;
GRANT INSERT ON match_players TO authenticated;
GRANT UPDATE ON match_players TO authenticated;
GRANT DELETE ON match_players TO authenticated;
GRANT SELECT ON match_players TO anon;

-- ==============================================
-- 4. COURTS TABLE RLS
-- ==============================================

-- Enable RLS
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view courts" ON courts;
DROP POLICY IF EXISTS "Authenticated users can add courts" ON courts;
DROP POLICY IF EXISTS "Court owners can update courts" ON courts;

-- Anyone can view courts
CREATE POLICY "Anyone can view courts" ON courts
  FOR SELECT USING (true);

-- Authenticated users can add courts
CREATE POLICY "Authenticated users can add courts" ON courts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update courts they added (if owner_id exists) or any authenticated user
CREATE POLICY "Users can update courts" ON courts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT SELECT ON courts TO authenticated;
GRANT INSERT ON courts TO authenticated;
GRANT UPDATE ON courts TO authenticated;
GRANT SELECT ON courts TO anon;

-- ==============================================
-- 5. NOTIFICATIONS TABLE RLS
-- ==============================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can create notifications (for system/other users to notify)
CREATE POLICY "Anyone can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON notifications TO authenticated;
GRANT INSERT ON notifications TO authenticated;
GRANT UPDATE ON notifications TO authenticated;

-- ==============================================
-- 6. TOURNAMENTS TABLE RLS (if exists)
-- ==============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tournaments') THEN
    ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;
    DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON tournaments;

    CREATE POLICY "Anyone can view tournaments" ON tournaments
      FOR SELECT USING (true);

    CREATE POLICY "Authenticated users can create tournaments" ON tournaments
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    CREATE POLICY "Organizers can update tournaments" ON tournaments
      FOR UPDATE USING (auth.uid() = organizer_id);

    GRANT SELECT ON tournaments TO authenticated;
    GRANT INSERT ON tournaments TO authenticated;
    GRANT UPDATE ON tournaments TO authenticated;
    GRANT SELECT ON tournaments TO anon;
  END IF;
END $$;

-- ==============================================
-- 7. TOURNAMENT_PARTICIPANTS TABLE RLS (if exists)
-- ==============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tournament_participants') THEN
    ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view participants" ON tournament_participants;
    DROP POLICY IF EXISTS "Users can register for tournaments" ON tournament_participants;

    CREATE POLICY "Anyone can view participants" ON tournament_participants
      FOR SELECT USING (true);

    CREATE POLICY "Users can register for tournaments" ON tournament_participants
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can leave tournaments" ON tournament_participants
      FOR DELETE USING (auth.uid() = user_id);

    GRANT SELECT ON tournament_participants TO authenticated;
    GRANT INSERT ON tournament_participants TO authenticated;
    GRANT DELETE ON tournament_participants TO authenticated;
    GRANT SELECT ON tournament_participants TO anon;
  END IF;
END $$;

-- ==============================================
-- 8. FOLLOWS TABLE RLS (if exists)
-- ==============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'follows') THEN
    ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view follows" ON follows;
    DROP POLICY IF EXISTS "Users can follow others" ON follows;
    DROP POLICY IF EXISTS "Users can unfollow" ON follows;

    CREATE POLICY "Anyone can view follows" ON follows
      FOR SELECT USING (true);

    CREATE POLICY "Users can follow others" ON follows
      FOR INSERT WITH CHECK (auth.uid() = follower_id);

    CREATE POLICY "Users can unfollow" ON follows
      FOR DELETE USING (auth.uid() = follower_id);

    GRANT SELECT ON follows TO authenticated;
    GRANT INSERT ON follows TO authenticated;
    GRANT DELETE ON follows TO authenticated;
    GRANT SELECT ON follows TO anon;
  END IF;
END $$;

-- ==============================================
-- 9. PRIVATE_RANKINGS TABLE RLS (if exists)
-- ==============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'private_rankings') THEN
    ALTER TABLE private_rankings ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Members can view their rankings" ON private_rankings;
    DROP POLICY IF EXISTS "Owners can manage rankings" ON private_rankings;

    CREATE POLICY "Members can view their rankings" ON private_rankings
      FOR SELECT USING (
        auth.uid() = owner_id OR
        auth.uid() IN (SELECT user_id FROM private_ranking_members WHERE ranking_id = private_rankings.id)
      );

    CREATE POLICY "Authenticated users can create rankings" ON private_rankings
      FOR INSERT WITH CHECK (auth.uid() = owner_id);

    CREATE POLICY "Owners can update rankings" ON private_rankings
      FOR UPDATE USING (auth.uid() = owner_id);

    CREATE POLICY "Owners can delete rankings" ON private_rankings
      FOR DELETE USING (auth.uid() = owner_id);

    GRANT SELECT ON private_rankings TO authenticated;
    GRANT INSERT ON private_rankings TO authenticated;
    GRANT UPDATE ON private_rankings TO authenticated;
    GRANT DELETE ON private_rankings TO authenticated;
  END IF;
END $$;

-- ==============================================
-- 10. BOOKINGS TABLE RLS (if exists)
-- ==============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can cancel own bookings" ON bookings;

    CREATE POLICY "Users can view own bookings" ON bookings
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create bookings" ON bookings
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own bookings" ON bookings
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can cancel own bookings" ON bookings
      FOR DELETE USING (auth.uid() = user_id);

    GRANT SELECT ON bookings TO authenticated;
    GRANT INSERT ON bookings TO authenticated;
    GRANT UPDATE ON bookings TO authenticated;
    GRANT DELETE ON bookings TO authenticated;
  END IF;
END $$;

-- ==============================================
-- 11. ADD MISSING COLUMNS
-- ==============================================

-- Add rating column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;

-- Add any other missing columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0;

-- ==============================================
-- END OF RLS FIX MIGRATION
-- ==============================================
