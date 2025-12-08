-- ==============================================
-- KOURT - ALL MISSING TABLES (FIXED ORDER)
-- Execute este SQL no Supabase SQL Editor
-- ==============================================

-- ==============================================
-- PART 1: ADD MISSING COLUMNS TO EXISTING TABLES
-- ==============================================

ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS time VARCHAR(10);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription VARCHAR(20) DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

ALTER TABLE courts ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);

-- ==============================================
-- PART 2: CREATE ALL TABLES FIRST (NO POLICIES)
-- ==============================================

-- 1. FOLLOWS
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- 2. COURT_SUGGESTIONS
CREATE TABLE IF NOT EXISTS court_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(100),
  description TEXT,
  sports TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  number_of_courts INTEGER DEFAULT 1,
  is_free BOOLEAN DEFAULT TRUE,
  price_per_hour DECIMAL(10,2),
  opening_hours VARCHAR(10),
  closing_hours VARCHAR(10),
  photos TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  ai_verification_status VARCHAR(20) DEFAULT 'pending',
  ai_verification_result JSONB,
  photos_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_court_suggestions_user ON court_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_court_suggestions_status ON court_suggestions(status);

-- 3. HOST_APPLICATIONS
CREATE TABLE IF NOT EXISTS host_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(14) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(11) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(8),
  description TEXT,
  number_of_courts INTEGER DEFAULT 1,
  owner_name VARCHAR(200) NOT NULL,
  owner_cpf VARCHAR(11),
  status VARCHAR(20) DEFAULT 'pending',
  documents JSONB DEFAULT '{}',
  admin_notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_host_applications_user ON host_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_host_applications_status ON host_applications(status);

-- 4. HOSTS
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES host_applications(id),
  business_name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(14) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(11),
  is_verified BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(20) DEFAULT 'basic',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hosts_user ON hosts(user_id);

-- 5. POSTS
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  media_type VARCHAR(20) DEFAULT 'none',
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  location_name TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- 6. POST_LIKES
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

-- 7. POST_COMMENTS
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);

-- 8. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) DEFAULT 'direct',
  name TEXT,
  avatar_url TEXT,
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- 9. CONVERSATION_PARTICIPANTS
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  last_read_at TIMESTAMPTZ,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);

-- 10. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  type VARCHAR(20) DEFAULT 'text',
  media_url TEXT,
  reply_to_id UUID REFERENCES messages(id),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- 11. PRIVATE_RANKINGS
CREATE TABLE IF NOT EXISTS private_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE private_rankings ADD COLUMN IF NOT EXISTS invite_code VARCHAR(8) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_private_rankings_owner ON private_rankings(owner_id);

-- 12. PRIVATE_RANKING_MEMBERS
CREATE TABLE IF NOT EXISTS private_ranking_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking_id UUID NOT NULL REFERENCES private_rankings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  rank_position INTEGER,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ranking_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_private_ranking_members_ranking ON private_ranking_members(ranking_id);
CREATE INDEX IF NOT EXISTS idx_private_ranking_members_user ON private_ranking_members(user_id);

-- 13. MATCH_SCORES
CREATE TABLE IF NOT EXISTS match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  set_scores JSONB DEFAULT '[]',
  winner_team INTEGER,
  recorded_by UUID REFERENCES profiles(id),
  confirmed_by UUID[] DEFAULT '{}',
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id)
);
CREATE INDEX IF NOT EXISTS idx_match_scores_match ON match_scores(match_id);

-- 14. ARENAS
CREATE TABLE IF NOT EXISTS arenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200),
  description TEXT,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  phone VARCHAR(15),
  email VARCHAR(255),
  website TEXT,
  logo_url TEXT,
  cover_url TEXT,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  opening_hours JSONB,
  owner_id UUID REFERENCES profiles(id),
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS state VARCHAR(2);
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS zip_code VARCHAR(9);
ALTER TABLE arenas ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES hosts(id);
CREATE INDEX IF NOT EXISTS idx_arenas_owner ON arenas(owner_id);

-- 15. ANALYTICS_EVENTS
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  device_info JSONB DEFAULT '{}',
  session_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);

-- 16. VERIFICATION_LOGS
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verification_logs_user ON verification_logs(user_id);

-- 17. USER_SESSIONS
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_id VARCHAR(255),
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  platform VARCHAR(50),
  ip_address VARCHAR(45),
  location TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- 18. ACHIEVEMENT_UNLOCKS
CREATE TABLE IF NOT EXISTS achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  xp_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS idx_achievement_unlocks_user ON achievement_unlocks(user_id);

-- ==============================================
-- PART 3: ENABLE RLS ON ALL TABLES
-- ==============================================

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_ranking_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_unlocks ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- PART 4: CREATE ALL POLICIES
-- ==============================================

-- FOLLOWS
DROP POLICY IF EXISTS "follows_read_all" ON follows;
DROP POLICY IF EXISTS "follows_insert_own" ON follows;
DROP POLICY IF EXISTS "follows_delete_own" ON follows;
CREATE POLICY "follows_read_all" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- COURT_SUGGESTIONS
DROP POLICY IF EXISTS "court_suggestions_read_own" ON court_suggestions;
DROP POLICY IF EXISTS "court_suggestions_insert" ON court_suggestions;
CREATE POLICY "court_suggestions_read_own" ON court_suggestions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "court_suggestions_insert" ON court_suggestions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- HOST_APPLICATIONS
DROP POLICY IF EXISTS "host_applications_read_own" ON host_applications;
DROP POLICY IF EXISTS "host_applications_insert" ON host_applications;
CREATE POLICY "host_applications_read_own" ON host_applications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "host_applications_insert" ON host_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- HOSTS
DROP POLICY IF EXISTS "hosts_read_public" ON hosts;
DROP POLICY IF EXISTS "hosts_update_own" ON hosts;
CREATE POLICY "hosts_read_public" ON hosts FOR SELECT TO authenticated USING (true);
CREATE POLICY "hosts_update_own" ON hosts FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- POSTS
DROP POLICY IF EXISTS "posts_read_all" ON posts;
DROP POLICY IF EXISTS "posts_insert_own" ON posts;
DROP POLICY IF EXISTS "posts_update_own" ON posts;
DROP POLICY IF EXISTS "posts_delete_own" ON posts;
CREATE POLICY "posts_read_all" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_own" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POST_LIKES
DROP POLICY IF EXISTS "post_likes_read_all" ON post_likes;
DROP POLICY IF EXISTS "post_likes_insert_own" ON post_likes;
DROP POLICY IF EXISTS "post_likes_delete_own" ON post_likes;
CREATE POLICY "post_likes_read_all" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert_own" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete_own" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POST_COMMENTS
DROP POLICY IF EXISTS "post_comments_read_all" ON post_comments;
DROP POLICY IF EXISTS "post_comments_insert_own" ON post_comments;
DROP POLICY IF EXISTS "post_comments_update_own" ON post_comments;
DROP POLICY IF EXISTS "post_comments_delete_own" ON post_comments;
CREATE POLICY "post_comments_read_all" ON post_comments FOR SELECT USING (true);
CREATE POLICY "post_comments_insert_own" ON post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_comments_update_own" ON post_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "post_comments_delete_own" ON post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CONVERSATIONS
DROP POLICY IF EXISTS "conversations_read" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
CREATE POLICY "conversations_read" ON conversations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid()));
CREATE POLICY "conversations_insert" ON conversations FOR INSERT TO authenticated WITH CHECK (true);

-- CONVERSATION_PARTICIPANTS
DROP POLICY IF EXISTS "conversation_participants_read" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert" ON conversation_participants;
CREATE POLICY "conversation_participants_read" ON conversation_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid()));
CREATE POLICY "conversation_participants_insert" ON conversation_participants FOR INSERT TO authenticated WITH CHECK (true);

-- MESSAGES
DROP POLICY IF EXISTS "messages_read" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update_own" ON messages;
CREATE POLICY "messages_read" ON messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "messages_insert" ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "messages_update_own" ON messages FOR UPDATE TO authenticated USING (sender_id = auth.uid());

-- PRIVATE_RANKINGS
DROP POLICY IF EXISTS "private_rankings_read" ON private_rankings;
DROP POLICY IF EXISTS "private_rankings_insert" ON private_rankings;
DROP POLICY IF EXISTS "private_rankings_update" ON private_rankings;
DROP POLICY IF EXISTS "private_rankings_delete" ON private_rankings;
CREATE POLICY "private_rankings_read" ON private_rankings FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM private_ranking_members WHERE ranking_id = private_rankings.id AND user_id = auth.uid()));
CREATE POLICY "private_rankings_insert" ON private_rankings FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "private_rankings_update" ON private_rankings FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "private_rankings_delete" ON private_rankings FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- PRIVATE_RANKING_MEMBERS
DROP POLICY IF EXISTS "private_ranking_members_read" ON private_ranking_members;
DROP POLICY IF EXISTS "private_ranking_members_insert" ON private_ranking_members;
DROP POLICY IF EXISTS "private_ranking_members_update" ON private_ranking_members;
DROP POLICY IF EXISTS "private_ranking_members_delete" ON private_ranking_members;
CREATE POLICY "private_ranking_members_read" ON private_ranking_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM private_ranking_members prm WHERE prm.ranking_id = private_ranking_members.ranking_id AND prm.user_id = auth.uid()));
CREATE POLICY "private_ranking_members_insert" ON private_ranking_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "private_ranking_members_update" ON private_ranking_members FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "private_ranking_members_delete" ON private_ranking_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- MATCH_SCORES
DROP POLICY IF EXISTS "match_scores_read_all" ON match_scores;
DROP POLICY IF EXISTS "match_scores_insert" ON match_scores;
DROP POLICY IF EXISTS "match_scores_update" ON match_scores;
CREATE POLICY "match_scores_read_all" ON match_scores FOR SELECT USING (true);
CREATE POLICY "match_scores_insert" ON match_scores FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM match_players WHERE match_id = match_scores.match_id AND user_id = auth.uid()));
CREATE POLICY "match_scores_update" ON match_scores FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM match_players WHERE match_id = match_scores.match_id AND user_id = auth.uid()));

-- ARENAS
DROP POLICY IF EXISTS "arenas_read_all" ON arenas;
DROP POLICY IF EXISTS "arenas_insert" ON arenas;
DROP POLICY IF EXISTS "arenas_update" ON arenas;
CREATE POLICY "arenas_read_all" ON arenas FOR SELECT USING (true);
CREATE POLICY "arenas_insert" ON arenas FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "arenas_update" ON arenas FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- ANALYTICS_EVENTS
DROP POLICY IF EXISTS "analytics_events_insert" ON analytics_events;
CREATE POLICY "analytics_events_insert" ON analytics_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- VERIFICATION_LOGS
DROP POLICY IF EXISTS "verification_logs_read_own" ON verification_logs;
DROP POLICY IF EXISTS "verification_logs_insert" ON verification_logs;
CREATE POLICY "verification_logs_read_own" ON verification_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "verification_logs_insert" ON verification_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- USER_SESSIONS
DROP POLICY IF EXISTS "user_sessions_read_own" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_insert" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_update" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_delete" ON user_sessions;
CREATE POLICY "user_sessions_read_own" ON user_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_sessions_insert" ON user_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_sessions_update" ON user_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_sessions_delete" ON user_sessions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ACHIEVEMENT_UNLOCKS
DROP POLICY IF EXISTS "achievement_unlocks_read_all" ON achievement_unlocks;
DROP POLICY IF EXISTS "achievement_unlocks_insert" ON achievement_unlocks;
CREATE POLICY "achievement_unlocks_read_all" ON achievement_unlocks FOR SELECT USING (true);
CREATE POLICY "achievement_unlocks_insert" ON achievement_unlocks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ==============================================
-- PART 5: FIX MATCH_PLAYERS RLS FOR INVITES
-- ==============================================

DROP POLICY IF EXISTS "Users can join matches" ON match_players;
DROP POLICY IF EXISTS "Users can join or be invited to matches" ON match_players;
DROP POLICY IF EXISTS "Users can leave matches" ON match_players;
DROP POLICY IF EXISTS "Users can leave or be removed from matches" ON match_players;
DROP POLICY IF EXISTS "Organizers can update match players" ON match_players;

CREATE POLICY "Users can join or be invited to matches" ON match_players
FOR INSERT WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_players.match_id
    AND matches.organizer_id = auth.uid()
  )
);

CREATE POLICY "Users can leave or be removed from matches" ON match_players
FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_players.match_id
    AND matches.organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can update match players" ON match_players
FOR UPDATE USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_players.match_id
    AND matches.organizer_id = auth.uid()
  )
);

-- ==============================================
-- PART 6: FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) WHERE id = OLD.follower_id;
    UPDATE profiles SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_change ON follows;
CREATE TRIGGER on_follow_change
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_like_change ON post_likes;
CREATE TRIGGER on_post_like_change
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_comment_change ON post_comments;
CREATE TRIGGER on_post_comment_change
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ==============================================
-- END OF MIGRATION
-- ==============================================
