-- ==============================================
-- KOURT APP - SUPABASE SCHEMA
-- Execute este SQL no SQL Editor do Supabase
-- ==============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. PROFILES (Usuários)
-- ==============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  username TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Gamification
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,

  -- Onboarding
  sports TEXT[] DEFAULT '{}',
  sport_levels JSONB DEFAULT '{}',
  play_frequency TEXT,
  goals TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,

  -- Verification
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  is_pro BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 2. COURTS (Quadras)
-- ==============================================
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('public', 'private', 'club')) DEFAULT 'private',
  sport TEXT NOT NULL,

  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'BR',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Details
  description TEXT,
  price_per_hour DECIMAL(10, 2),
  is_free BOOLEAN DEFAULT FALSE,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',

  -- Rating
  rating DECIMAL(2, 1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,

  -- Hours
  hours_weekdays TEXT,
  hours_weekends TEXT,

  -- Owner
  owner_id UUID REFERENCES profiles(id),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 3. BOOKINGS (Reservas)
-- ==============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  court_id UUID REFERENCES courts(id) NOT NULL,

  -- Date/Time
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DECIMAL(3, 1) NOT NULL,

  -- Payment
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,

  -- Status
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 4. MATCHES (Partidas)
-- ==============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID REFERENCES profiles(id) NOT NULL,

  -- Basic Info
  title TEXT NOT NULL,
  sport TEXT NOT NULL,
  description TEXT,

  -- Date/Location
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  court_id UUID REFERENCES courts(id),
  location_name TEXT,
  location_address TEXT,

  -- Players
  max_players INTEGER NOT NULL DEFAULT 4,
  current_players INTEGER DEFAULT 1,
  level TEXT CHECK (level IN ('any', 'beginner', 'intermediate', 'advanced', 'pro')) DEFAULT 'any',

  -- Settings
  is_public BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',

  -- Score (for completed matches)
  score JSONB,
  winner_team INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 5. MATCH_PLAYERS (Jogadores das Partidas)
-- ==============================================
CREATE TABLE match_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,

  -- Team
  team INTEGER DEFAULT 1,
  position INTEGER,

  -- Status
  status TEXT CHECK (status IN ('pending', 'confirmed', 'declined', 'removed')) DEFAULT 'confirmed',
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  -- Performance (after match)
  points_scored INTEGER DEFAULT 0,
  mvp BOOLEAN DEFAULT FALSE,

  UNIQUE(match_id, user_id)
);

-- ==============================================
-- 6. REVIEWS (Avaliações)
-- ==============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,

  -- Target (court or player)
  court_id UUID REFERENCES courts(id),
  player_id UUID REFERENCES profiles(id),
  match_id UUID REFERENCES matches(id),

  -- Review
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: must have either court_id or player_id
  CONSTRAINT review_target CHECK (
    (court_id IS NOT NULL AND player_id IS NULL) OR
    (court_id IS NULL AND player_id IS NOT NULL)
  )
);

-- ==============================================
-- 7. ACHIEVEMENTS (Conquistas)
-- ==============================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  condition JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 8. USER_ACHIEVEMENTS (Conquistas dos Usuários)
-- ==============================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

-- ==============================================
-- 9. CHALLENGES (Desafios)
-- ==============================================
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,

  -- Requirements
  target_type TEXT NOT NULL, -- 'matches', 'bookings', 'streak', etc.
  target_count INTEGER NOT NULL,

  -- Period
  period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'special')) DEFAULT 'weekly',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 10. USER_CHALLENGES (Desafios dos Usuários)
-- ==============================================
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) NOT NULL,

  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  started_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, challenge_id)
);

-- ==============================================
-- 11. NOTIFICATIONS (Notificações)
-- ==============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,

  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 12. CHAT_MESSAGES (Mensagens)
-- ==============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,

  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'image', 'system')) DEFAULT 'text',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 13. RANKINGS (Sistema de Ranking por Esporte)
-- ==============================================
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sport TEXT NOT NULL,
  points INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  rank_position INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, sport)
);

CREATE INDEX idx_rankings_sport ON rankings(sport);
CREATE INDEX idx_rankings_points ON rankings(points DESC);

-- ==============================================
-- 14. PUSH_TOKENS (Tokens de Push Notification)
-- ==============================================
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform)
);

-- ==============================================
-- INDEXES
-- ==============================================
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_courts_sport ON courts(sport);
CREATE INDEX idx_courts_city ON courts(city);
CREATE INDEX idx_courts_location ON courts(latitude, longitude);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_court ON bookings(court_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_matches_sport ON matches(sport);
CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_match_players_user ON match_players(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_chat_messages_match ON chat_messages(match_id);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
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

-- Profiles policies
CREATE POLICY "Users can view any profile" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Courts policies
CREATE POLICY "Anyone can view courts" ON courts FOR SELECT USING (true);
CREATE POLICY "Owners can manage their courts" ON courts FOR ALL USING (auth.uid() = owner_id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Anyone can view public matches" ON matches FOR SELECT USING (is_public = true OR auth.uid() = organizer_id);
CREATE POLICY "Users can create matches" ON matches FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update matches" ON matches FOR UPDATE USING (auth.uid() = organizer_id);

-- Match players policies
CREATE POLICY "Anyone can view match players" ON match_players FOR SELECT USING (true);
CREATE POLICY "Users can join matches" ON match_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave matches" ON match_players FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Match players can view messages" ON chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM match_players WHERE match_id = chat_messages.match_id AND user_id = auth.uid()));
CREATE POLICY "Match players can send messages" ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM match_players WHERE match_id = chat_messages.match_id AND user_id = auth.uid()));

-- ==============================================
-- FUNCTIONS
-- ==============================================

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SEED DATA: Achievements
-- ==============================================
INSERT INTO achievements (name, description, icon, category, xp_reward, condition) VALUES
('Primeira Partida', 'Jogue sua primeira partida', 'sports-tennis', 'matches', 50, '{"type": "matches", "count": 1}'),
('Jogador Regular', 'Jogue 10 partidas', 'emoji-events', 'matches', 100, '{"type": "matches", "count": 10}'),
('Veterano', 'Jogue 50 partidas', 'military-tech', 'matches', 500, '{"type": "matches", "count": 50}'),
('Primeira Vitória', 'Vença sua primeira partida', 'star', 'wins', 75, '{"type": "wins", "count": 1}'),
('Campeão', 'Vença 10 partidas', 'emoji-events', 'wins', 200, '{"type": "wins", "count": 10}'),
('Em Chamas', 'Mantenha uma sequência de 7 dias', 'local-fire-department', 'streak', 150, '{"type": "streak", "count": 7}'),
('Reserva Master', 'Faça 5 reservas de quadra', 'event', 'bookings', 100, '{"type": "bookings", "count": 5}'),
('Social', 'Jogue com 10 jogadores diferentes', 'group', 'social', 150, '{"type": "unique_players", "count": 10}');

-- ==============================================
-- SEED DATA: Sample Challenge
-- ==============================================
INSERT INTO challenges (title, description, icon, xp_reward, target_type, target_count, period, starts_at, ends_at) VALUES
('Desafio Semanal', 'Jogue 3 partidas esta semana', 'emoji-events', 100, 'matches', 3, 'weekly', NOW(), NOW() + INTERVAL '7 days');

-- ==============================================
-- END OF SCHEMA
-- ==============================================
