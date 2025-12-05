-- ==================================================
-- CORREÇÃO FINAL E COMPLETA - RLS
-- Execute este script para corrigir TODOS os erros de permissão
-- ==================================================

-- 1. MATCHES (Partidas)
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view public matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Organizers can update matches" ON matches;
DROP POLICY IF EXISTS "Organizers can delete matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can create matches" ON matches;
DROP POLICY IF EXISTS "allow_all_select" ON matches;
DROP POLICY IF EXISTS "allow_authenticated_insert" ON matches;
DROP POLICY IF EXISTS "allow_organizer_update" ON matches;
DROP POLICY IF EXISTS "allow_organizer_delete" ON matches;

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select_policy" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_insert_policy" ON matches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "matches_update_policy" ON matches FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "matches_delete_policy" ON matches FOR DELETE USING (auth.uid() = organizer_id);

-- 2. MATCH_PLAYERS (Jogadores da Partida)
ALTER TABLE match_players DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view match players" ON match_players;
DROP POLICY IF EXISTS "Users can join matches" ON match_players;
DROP POLICY IF EXISTS "Users can leave matches" ON match_players;
DROP POLICY IF EXISTS "Organizers can manage players" ON match_players;
DROP POLICY IF EXISTS "Authenticated users can join matches" ON match_players;
DROP POLICY IF EXISTS "Users can leave their matches" ON match_players;
DROP POLICY IF EXISTS "Match organizers can manage players" ON match_players;

ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_policy" ON match_players FOR SELECT USING (true);
CREATE POLICY "players_insert_policy" ON match_players FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "players_update_policy" ON match_players FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM matches WHERE id = match_id AND organizer_id = auth.uid()));
CREATE POLICY "players_delete_policy" ON match_players FOR DELETE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM matches WHERE id = match_id AND organizer_id = auth.uid()));

-- 3. MATCH_SCORES (Placares - se existir)
-- (Caso a tabela exista, garantimos acesso)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'match_scores') THEN
    ALTER TABLE match_scores DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view match scores" ON match_scores;
    DROP POLICY IF EXISTS "Organizers can update scores" ON match_scores;
    
    ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "scores_select_policy" ON match_scores FOR SELECT USING (true);
    CREATE POLICY "scores_insert_policy" ON match_scores FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    CREATE POLICY "scores_update_policy" ON match_scores FOR UPDATE USING (true);
  END IF;
END $$;

-- 4. COURTS (Quadras - para garantir)
ALTER TABLE courts DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active courts" ON courts;
DROP POLICY IF EXISTS "Authenticated users can suggest courts" ON courts;

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courts_select_policy" ON courts FOR SELECT USING (true);
CREATE POLICY "courts_insert_policy" ON courts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "courts_update_policy" ON courts FOR UPDATE USING (auth.uid() = owner_id);

-- ==================================================
-- FIM DA CORREÇÃO
-- Agora tente criar uma partida novamente!
-- ==================================================
