-- ==============================================
-- KOURT APP - ADDITIONAL FEATURES MIGRATION
-- Execute após o schema.sql principal
-- ==============================================

-- ==============================================
-- 1. VERIFICATION_LOGS (Para OTP/Twilio)
-- ==============================================
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_phone ON verification_logs(phone);
CREATE INDEX IF NOT EXISTS idx_verification_expires ON verification_logs(expires_at);

-- ==============================================
-- 2. MATCH_SCORES (Placar ao Vivo)
-- ==============================================
CREATE TABLE IF NOT EXISTS match_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Current Score
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0,

  -- Sets
  team_a_sets INTEGER DEFAULT 0,
  team_b_sets INTEGER DEFAULT 0,
  current_set INTEGER DEFAULT 1,
  sets_history JSONB DEFAULT '[]',

  -- Status
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'paused', 'finished')) DEFAULT 'not_started',
  winner_team TEXT CHECK (winner_team IN ('a', 'b')),

  -- Timestamps
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_scores_match ON match_scores(match_id);
CREATE INDEX IF NOT EXISTS idx_match_scores_status ON match_scores(status);

-- Enable RLS
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view match scores" ON match_scores FOR SELECT USING (true);
CREATE POLICY "Match players can update scores" ON match_scores FOR ALL
  USING (EXISTS (SELECT 1 FROM match_players WHERE match_id = match_scores.match_id AND user_id = auth.uid()));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE match_scores;

-- ==============================================
-- 3. MATCH_INVITES (Convites de Partida)
-- ==============================================
CREATE TABLE IF NOT EXISTS match_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id), -- null = público
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_match_invites_recipient ON match_invites(recipient_id);
CREATE INDEX IF NOT EXISTS idx_match_invites_sender ON match_invites(sender_id);
CREATE INDEX IF NOT EXISTS idx_match_invites_match ON match_invites(match_id);

ALTER TABLE match_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invites" ON match_invites FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send invites" ON match_invites FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients can respond to invites" ON match_invites FOR UPDATE
  USING (auth.uid() = recipient_id);

-- ==============================================
-- 4. PLAYER_SUGGESTIONS (Cache de Sugestões)
-- ==============================================
CREATE TABLE IF NOT EXISTS player_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  suggested_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT, -- 'level_match', 'nearby', 'mutual_friends', 'same_sport'
  score DECIMAL(3, 2), -- 0.00 a 1.00
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  UNIQUE(user_id, suggested_user_id)
);

CREATE INDEX IF NOT EXISTS idx_player_suggestions_user ON player_suggestions(user_id);

-- ==============================================
-- 5. ADDITIONAL COLUMNS IN PROFILES
-- ==============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS win_rate INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON profiles(auth_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

-- ==============================================
-- 6. WEEKLY RANKING VIEW
-- ==============================================
CREATE OR REPLACE VIEW weekly_ranking AS
SELECT
  p.id,
  p.name,
  p.avatar_url,
  COALESCE(SUM(
    CASE
      WHEN mp.status = 'confirmed' AND m.winner_team::text = mp.team::text THEN 100
      WHEN mp.status = 'confirmed' THEN 50
      ELSE 0
    END
  ), 0) as weekly_points,
  COUNT(DISTINCT m.id) as weekly_matches,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(
    CASE
      WHEN mp.status = 'confirmed' AND m.winner_team::text = mp.team::text THEN 100
      WHEN mp.status = 'confirmed' THEN 50
      ELSE 0
    END
  ), 0) DESC) as position
FROM profiles p
LEFT JOIN match_players mp ON mp.user_id = p.id
LEFT JOIN matches m ON m.id = mp.match_id
  AND m.date >= CURRENT_DATE - INTERVAL '7 days'
  AND m.status = 'completed'
GROUP BY p.id, p.name, p.avatar_url
ORDER BY weekly_points DESC;

-- ==============================================
-- 7. ENABLE REALTIME FOR KEY TABLES
-- ==============================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE match_players;

-- ==============================================
-- 8. FUNCTION TO UPDATE WIN RATE
-- ==============================================
CREATE OR REPLACE FUNCTION update_user_win_rate()
RETURNS TRIGGER AS $$
DECLARE
  total_games INTEGER;
  total_wins INTEGER;
  new_win_rate INTEGER;
BEGIN
  -- Count total completed matches for user
  SELECT COUNT(*) INTO total_games
  FROM match_players mp
  JOIN matches m ON m.id = mp.match_id
  WHERE mp.user_id = NEW.user_id AND m.status = 'completed';

  -- Count wins
  SELECT COUNT(*) INTO total_wins
  FROM match_players mp
  JOIN matches m ON m.id = mp.match_id
  WHERE mp.user_id = NEW.user_id
    AND m.status = 'completed'
    AND m.winner_team::text = mp.team::text;

  -- Calculate win rate
  IF total_games > 0 THEN
    new_win_rate := (total_wins * 100) / total_games;
  ELSE
    new_win_rate := 0;
  END IF;

  -- Update profile
  UPDATE profiles SET win_rate = new_win_rate WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 9. STRIPE CUSTOMERS (Referência para Stripe)
-- ==============================================
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_user ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe ON stripe_customers(stripe_customer_id);

-- ==============================================
-- END OF ADDITIONAL FEATURES MIGRATION
-- ==============================================
