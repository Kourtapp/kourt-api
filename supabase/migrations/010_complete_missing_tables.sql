-- ==============================================
-- KOURT APP - COMPLETE MISSING TABLES MIGRATION
-- Execute este SQL no SQL Editor do Supabase
-- ==============================================

-- ==============================================
-- 1. FOLLOWS (Sistema de Seguidores)
-- ==============================================
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

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_read_all" ON follows;
DROP POLICY IF EXISTS "follows_insert_own" ON follows;
DROP POLICY IF EXISTS "follows_delete_own" ON follows;

CREATE POLICY "follows_read_all" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Add follow count columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
    ALTER TABLE profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
    ALTER TABLE profiles ADD COLUMN following_count INTEGER DEFAULT 0;
  END IF;
END $$;

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

-- ==============================================
-- 2. COURT_SUGGESTIONS (Sugestões de Quadras)
-- ==============================================
CREATE TABLE IF NOT EXISTS court_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private', 'arena')),
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
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
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

ALTER TABLE court_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "court_suggestions_read_own" ON court_suggestions;
DROP POLICY IF EXISTS "court_suggestions_insert_authenticated" ON court_suggestions;

CREATE POLICY "court_suggestions_read_own" ON court_suggestions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "court_suggestions_insert_authenticated" ON court_suggestions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ==============================================
-- 3. HOST_APPLICATIONS (Solicitações de Host)
-- ==============================================
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
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  documents JSONB DEFAULT '{}',
  admin_notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_host_applications_user ON host_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_host_applications_status ON host_applications(status);

ALTER TABLE host_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "host_applications_read_own" ON host_applications;
DROP POLICY IF EXISTS "host_applications_insert_authenticated" ON host_applications;

CREATE POLICY "host_applications_read_own" ON host_applications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "host_applications_insert_authenticated" ON host_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ==============================================
-- 4. HOSTS (Hosts Aprovados)
-- ==============================================
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES host_applications(id),
  business_name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(14) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(11),
  is_verified BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(20) DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hosts_user ON hosts(user_id);

ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hosts_read_public" ON hosts;
DROP POLICY IF EXISTS "hosts_update_own" ON hosts;

CREATE POLICY "hosts_read_public" ON hosts FOR SELECT TO authenticated USING (true);
CREATE POLICY "hosts_update_own" ON hosts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ==============================================
-- 5. POSTS (Publicações)
-- ==============================================
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
CREATE INDEX IF NOT EXISTS idx_posts_match ON posts(match_id);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_read_public" ON posts;
DROP POLICY IF EXISTS "posts_insert_own" ON posts;
DROP POLICY IF EXISTS "posts_update_own" ON posts;
DROP POLICY IF EXISTS "posts_delete_own" ON posts;

CREATE POLICY "posts_read_public" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_own" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ==============================================
-- 6. POST_LIKES (Curtidas)
-- ==============================================
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_likes_read_all" ON post_likes;
DROP POLICY IF EXISTS "post_likes_insert_own" ON post_likes;
DROP POLICY IF EXISTS "post_likes_delete_own" ON post_likes;

CREATE POLICY "post_likes_read_all" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert_own" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete_own" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

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

-- ==============================================
-- 7. POST_COMMENTS (Comentários)
-- ==============================================
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add parent_id column if not exists
ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_comments_read_all" ON post_comments;
DROP POLICY IF EXISTS "post_comments_insert_own" ON post_comments;
DROP POLICY IF EXISTS "post_comments_update_own" ON post_comments;
DROP POLICY IF EXISTS "post_comments_delete_own" ON post_comments;

CREATE POLICY "post_comments_read_all" ON post_comments FOR SELECT USING (true);
CREATE POLICY "post_comments_insert_own" ON post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_comments_update_own" ON post_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "post_comments_delete_own" ON post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

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
-- 8. CONVERSATIONS (Conversas Diretas)
-- ==============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name TEXT,
  avatar_url TEXT,
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_read_participants" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_authenticated" ON conversations;

CREATE POLICY "conversations_read_participants" ON conversations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = id AND user_id = auth.uid()));
CREATE POLICY "conversations_insert_authenticated" ON conversations FOR INSERT TO authenticated WITH CHECK (true);

-- ==============================================
-- 9. CONVERSATION_PARTICIPANTS (Participantes)
-- ==============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  last_read_at TIMESTAMPTZ,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversation_participants_read_own" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert_authenticated" ON conversation_participants;

CREATE POLICY "conversation_participants_read_own" ON conversation_participants FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()));
CREATE POLICY "conversation_participants_insert_authenticated" ON conversation_participants FOR INSERT TO authenticated WITH CHECK (true);

-- ==============================================
-- 10. MESSAGES (Mensagens Diretas)
-- ==============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file', 'system')),
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

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_read_participants" ON messages;
DROP POLICY IF EXISTS "messages_insert_participants" ON messages;
DROP POLICY IF EXISTS "messages_update_own" ON messages;

CREATE POLICY "messages_read_participants" ON messages FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "messages_insert_participants" ON messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "messages_update_own" ON messages FOR UPDATE TO authenticated USING (sender_id = auth.uid());

-- ==============================================
-- 11. PRIVATE_RANKINGS (Rankings Privados)
-- ==============================================
CREATE TABLE IF NOT EXISTS private_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code VARCHAR(8) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_private_rankings_owner ON private_rankings(owner_id);
CREATE INDEX IF NOT EXISTS idx_private_rankings_code ON private_rankings(invite_code);
CREATE INDEX IF NOT EXISTS idx_private_rankings_sport ON private_rankings(sport);

ALTER TABLE private_rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "private_rankings_read_members" ON private_rankings;
DROP POLICY IF EXISTS "private_rankings_insert_authenticated" ON private_rankings;
DROP POLICY IF EXISTS "private_rankings_update_owner" ON private_rankings;
DROP POLICY IF EXISTS "private_rankings_delete_owner" ON private_rankings;

CREATE POLICY "private_rankings_read_members" ON private_rankings FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM private_ranking_members WHERE ranking_id = id AND user_id = auth.uid()));
CREATE POLICY "private_rankings_insert_authenticated" ON private_rankings FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "private_rankings_update_owner" ON private_rankings FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "private_rankings_delete_owner" ON private_rankings FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ==============================================
-- 12. PRIVATE_RANKING_MEMBERS (Membros)
-- ==============================================
CREATE TABLE IF NOT EXISTS private_ranking_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking_id UUID NOT NULL REFERENCES private_rankings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  rank_position INTEGER,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ranking_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_private_ranking_members_ranking ON private_ranking_members(ranking_id);
CREATE INDEX IF NOT EXISTS idx_private_ranking_members_user ON private_ranking_members(user_id);
CREATE INDEX IF NOT EXISTS idx_private_ranking_members_points ON private_ranking_members(points DESC);

ALTER TABLE private_ranking_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "private_ranking_members_read_ranking" ON private_ranking_members;
DROP POLICY IF EXISTS "private_ranking_members_insert_authenticated" ON private_ranking_members;
DROP POLICY IF EXISTS "private_ranking_members_update_own" ON private_ranking_members;
DROP POLICY IF EXISTS "private_ranking_members_delete_own" ON private_ranking_members;

CREATE POLICY "private_ranking_members_read_ranking" ON private_ranking_members FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM private_ranking_members prm WHERE prm.ranking_id = ranking_id AND prm.user_id = auth.uid()));
CREATE POLICY "private_ranking_members_insert_authenticated" ON private_ranking_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "private_ranking_members_update_own" ON private_ranking_members FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "private_ranking_members_delete_own" ON private_ranking_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ==============================================
-- 13. MATCH_SCORES (Placar das Partidas)
-- ==============================================
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

ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_scores_read_all" ON match_scores;
DROP POLICY IF EXISTS "match_scores_insert_players" ON match_scores;
DROP POLICY IF EXISTS "match_scores_update_players" ON match_scores;

CREATE POLICY "match_scores_read_all" ON match_scores FOR SELECT USING (true);
CREATE POLICY "match_scores_insert_players" ON match_scores FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM match_players WHERE match_id = match_scores.match_id AND user_id = auth.uid()));
CREATE POLICY "match_scores_update_players" ON match_scores FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM match_players WHERE match_id = match_scores.match_id AND user_id = auth.uid()));

-- ==============================================
-- 14. ARENAS (Arenas/Complexos)
-- ==============================================
CREATE TABLE IF NOT EXISTS arenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2),
  zip_code VARCHAR(9),
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
  host_id UUID REFERENCES hosts(id),
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arenas_owner ON arenas(owner_id);
CREATE INDEX IF NOT EXISTS idx_arenas_city ON arenas(city);
CREATE INDEX IF NOT EXISTS idx_arenas_location ON arenas(latitude, longitude);

ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "arenas_read_all" ON arenas;
DROP POLICY IF EXISTS "arenas_insert_hosts" ON arenas;
DROP POLICY IF EXISTS "arenas_update_owner" ON arenas;

CREATE POLICY "arenas_read_all" ON arenas FOR SELECT USING (is_active = true);
CREATE POLICY "arenas_insert_hosts" ON arenas FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "arenas_update_owner" ON arenas FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- ==============================================
-- 15. ANALYTICS_EVENTS (Eventos de Analytics)
-- ==============================================
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
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_events_insert_authenticated" ON analytics_events;

CREATE POLICY "analytics_events_insert_authenticated" ON analytics_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ==============================================
-- 16. VERIFICATION_LOGS (Logs de Verificação)
-- ==============================================
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
CREATE INDEX IF NOT EXISTS idx_verification_logs_type ON verification_logs(type);

ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verification_logs_read_own" ON verification_logs;
DROP POLICY IF EXISTS "verification_logs_insert_own" ON verification_logs;

CREATE POLICY "verification_logs_read_own" ON verification_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "verification_logs_insert_own" ON verification_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ==============================================
-- 17. USER_SESSIONS (Sessões de Usuário)
-- ==============================================
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
CREATE INDEX IF NOT EXISTS idx_user_sessions_device ON user_sessions(device_id);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_sessions_read_own" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_insert_own" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_update_own" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_delete_own" ON user_sessions;

CREATE POLICY "user_sessions_read_own" ON user_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_sessions_insert_own" ON user_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_sessions_update_own" ON user_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_sessions_delete_own" ON user_sessions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ==============================================
-- 18. ACHIEVEMENT_UNLOCKS (Conquistas Desbloqueadas - Alternativo)
-- ==============================================
CREATE TABLE IF NOT EXISTS achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  xp_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_achievement_unlocks_user ON achievement_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_unlocks_achievement ON achievement_unlocks(achievement_id);

ALTER TABLE achievement_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "achievement_unlocks_read_all" ON achievement_unlocks;
DROP POLICY IF EXISTS "achievement_unlocks_insert_system" ON achievement_unlocks;

CREATE POLICY "achievement_unlocks_read_all" ON achievement_unlocks FOR SELECT USING (true);
CREATE POLICY "achievement_unlocks_insert_system" ON achievement_unlocks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ==============================================
-- 19. ADD SUBSCRIPTION COLUMN TO PROFILES
-- ==============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription') THEN
    ALTER TABLE profiles ADD COLUMN subscription VARCHAR(20) DEFAULT 'free' CHECK (subscription IN ('free', 'plus', 'pro'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_expires_at') THEN
    ALTER TABLE profiles ADD COLUMN subscription_expires_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id VARCHAR(255);
  END IF;
END $$;

-- ==============================================
-- 20. ADD MISSING COLUMNS TO COURTS
-- ==============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'neighborhood') THEN
    ALTER TABLE courts ADD COLUMN neighborhood VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courts' AND column_name = 'arena_id') THEN
    ALTER TABLE courts ADD COLUMN arena_id UUID REFERENCES arenas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ==============================================
-- 21. ADD MISSING COLUMNS TO MATCHES
-- ==============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'time') THEN
    ALTER TABLE matches ADD COLUMN time VARCHAR(10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'venue') THEN
    ALTER TABLE matches ADD COLUMN venue TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'photo_url') THEN
    ALTER TABLE matches ADD COLUMN photo_url TEXT;
  END IF;
END $$;

-- ==============================================
-- 22. FIX MATCH_PLAYERS RLS FOR INVITES
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
-- 23. GRANTS
-- ==============================================
GRANT SELECT ON follows TO authenticated, anon;
GRANT INSERT, DELETE ON follows TO authenticated;

GRANT SELECT ON court_suggestions TO authenticated;
GRANT INSERT ON court_suggestions TO authenticated;

GRANT SELECT ON host_applications TO authenticated;
GRANT INSERT ON host_applications TO authenticated;

GRANT SELECT ON hosts TO authenticated;
GRANT UPDATE ON hosts TO authenticated;

GRANT SELECT ON posts TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON posts TO authenticated;

GRANT SELECT ON post_likes TO authenticated, anon;
GRANT INSERT, DELETE ON post_likes TO authenticated;

GRANT SELECT ON post_comments TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON post_comments TO authenticated;

GRANT SELECT ON conversations TO authenticated;
GRANT INSERT ON conversations TO authenticated;

GRANT SELECT ON conversation_participants TO authenticated;
GRANT INSERT ON conversation_participants TO authenticated;

GRANT SELECT ON messages TO authenticated;
GRANT INSERT, UPDATE ON messages TO authenticated;

GRANT SELECT ON private_rankings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON private_rankings TO authenticated;

GRANT SELECT ON private_ranking_members TO authenticated;
GRANT INSERT, UPDATE, DELETE ON private_ranking_members TO authenticated;

GRANT SELECT ON match_scores TO authenticated, anon;
GRANT INSERT, UPDATE ON match_scores TO authenticated;

GRANT SELECT ON arenas TO authenticated, anon;
GRANT INSERT, UPDATE ON arenas TO authenticated;

GRANT INSERT ON analytics_events TO authenticated;

GRANT SELECT ON verification_logs TO authenticated;
GRANT INSERT ON verification_logs TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;

GRANT SELECT ON achievement_unlocks TO authenticated, anon;
GRANT INSERT ON achievement_unlocks TO authenticated;

-- ==============================================
-- END OF MIGRATION
-- ==============================================
