-- ==============================================
-- 15. PRIVATE RANKINGS (Rankings Privados)
-- ==============================================
CREATE TABLE private_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- Código de convite (ex: "KOURT-123")
  
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 16. PRIVATE RANKING MEMBERS (Membros do Ranking Privado)
-- ==============================================
CREATE TABLE private_ranking_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ranking_id UUID REFERENCES private_rankings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  points INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(ranking_id, user_id)
);

-- ==============================================
-- RLS POLICIES
-- ==============================================

-- Enable RLS
ALTER TABLE private_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_ranking_members ENABLE ROW LEVEL SECURITY;

-- Private Rankings Policies
-- Anyone can view a ranking if they know the ID (or we could restrict to members)
CREATE POLICY "Members can view private rankings" ON private_rankings 
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM private_ranking_members WHERE ranking_id = private_rankings.id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create private rankings" ON private_rankings 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update private rankings" ON private_rankings 
  FOR UPDATE USING (auth.uid() = owner_id);

-- Private Ranking Members Policies
CREATE POLICY "Members can view other members" ON private_ranking_members 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM private_ranking_members prm WHERE prm.ranking_id = private_ranking_members.ranking_id AND prm.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM private_rankings pr WHERE pr.id = private_ranking_members.ranking_id AND pr.owner_id = auth.uid())
  );

CREATE POLICY "Users can join rankings" ON private_ranking_members 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- INDEXES
-- ==============================================
CREATE INDEX idx_private_rankings_code ON private_rankings(code);
CREATE INDEX idx_private_ranking_members_user ON private_ranking_members(user_id);
CREATE INDEX idx_private_ranking_members_ranking ON private_ranking_members(ranking_id);
