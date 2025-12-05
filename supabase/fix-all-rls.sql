-- ==============================================
-- FIX ALL RLS POLICIES - COMPREHENSIVE
-- Execute este SQL no SQL Editor do Supabase
-- ==============================================

-- ============================================
-- 1. FIX MATCHES POLICIES (ERRO: new row violates row-level security)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view public matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Organizers can update matches" ON matches;
DROP POLICY IF EXISTS "Organizers can delete matches" ON matches;

-- Recreate with correct permissions
CREATE POLICY "Anyone can view public matches" 
  ON matches FOR SELECT 
  USING (is_public = true OR auth.uid() = organizer_id);

CREATE POLICY "Authenticated users can create matches" 
  ON matches FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their matches" 
  ON matches FOR UPDATE 
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their matches" 
  ON matches FOR DELETE 
  USING (auth.uid() = organizer_id);

-- ============================================
-- 2. FIX MATCH_PLAYERS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view match players" ON match_players;
DROP POLICY IF EXISTS "Users can join matches" ON match_players;
DROP POLICY IF EXISTS "Users can leave matches" ON match_players;
DROP POLICY IF EXISTS "Organizers can manage players" ON match_players;

CREATE POLICY "Anyone can view match players" 
  ON match_players FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can join matches" 
  ON match_players FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can leave their matches" 
  ON match_players FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Match organizers can manage players" 
  ON match_players FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_players.match_id 
      AND matches.organizer_id = auth.uid()
    )
  );

-- ============================================
-- 3. FIX COURTS POLICIES (Sugestão de Quadra)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view courts" ON courts;
DROP POLICY IF EXISTS "Owners can manage their courts" ON courts;
DROP POLICY IF EXISTS "Authenticated users can suggest courts" ON courts;

CREATE POLICY "Anyone can view active courts" 
  ON courts FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can suggest courts" 
  ON courts FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Court owners can update their courts" 
  ON courts FOR UPDATE 
  USING (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Court owners can delete their courts" 
  ON courts FOR DELETE 
  USING (auth.uid() = owner_id);

-- ============================================
-- 4. FIX BOOKINGS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

CREATE POLICY "Users can view their bookings" 
  ON bookings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their bookings" 
  ON bookings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their bookings" 
  ON bookings FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 5. FIX REVIEWS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;

CREATE POLICY "Anyone can view reviews" 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their reviews" 
  ON reviews FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their reviews" 
  ON reviews FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 6. FIX CHAT_MESSAGES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Match players can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Match players can send messages" ON chat_messages;

CREATE POLICY "Match participants can view messages" 
  ON chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM match_players 
      WHERE match_players.match_id = chat_messages.match_id 
      AND match_players.user_id = auth.uid()
    )
  );

CREATE POLICY "Match participants can send messages" 
  ON chat_messages FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM match_players 
      WHERE match_players.match_id = chat_messages.match_id 
      AND match_players.user_id = auth.uid()
    )
  );

-- ============================================
-- 7. FIX USER_ACHIEVEMENTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view all achievements" ON user_achievements;

CREATE POLICY "Anyone can view achievements" 
  ON user_achievements FOR SELECT 
  USING (true);

-- System will insert achievements (via function/trigger)
CREATE POLICY "System can insert achievements" 
  ON user_achievements FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- 8. FIX USER_CHALLENGES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users can view all challenges" ON user_challenges;

CREATE POLICY "Anyone can view challenges" 
  ON user_challenges FOR SELECT 
  USING (true);

CREATE POLICY "System can manage challenges" 
  ON user_challenges FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- 9. FIX NOTIFICATIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view their notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- 10. VERIFY ALL TABLES HAVE RLS ENABLED
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- DONE! Now test creating a match
-- ==============================================
