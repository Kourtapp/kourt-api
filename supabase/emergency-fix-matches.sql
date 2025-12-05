-- ========================================
-- SOLUÇÃO EMERGENCIAL - RLS MATCHES
-- Execute EXATAMENTE este SQL no Supabase
-- ========================================

-- 1. Desabilitar RLS
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas
DROP POLICY IF EXISTS "Anyone can view public matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Organizers can update matches" ON matches;
DROP POLICY IF EXISTS "Organizers can delete matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can create matches" ON matches;
DROP POLICY IF EXISTS "Organizers can update their matches" ON matches;
DROP POLICY IF EXISTS "Organizers can delete their matches" ON matches;
DROP POLICY IF EXISTS "allow_all_select" ON matches;
DROP POLICY IF EXISTS "allow_authenticated_insert" ON matches;
DROP POLICY IF EXISTS "allow_organizer_update" ON matches;
DROP POLICY IF EXISTS "allow_organizer_delete" ON matches;

-- 3. Reabilitar RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas SIMPLES
CREATE POLICY "allow_all_select" 
  ON matches FOR SELECT 
  USING (true);

CREATE POLICY "allow_authenticated_insert" 
  ON matches FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "allow_organizer_update" 
  ON matches FOR UPDATE 
  USING (auth.uid() = organizer_id);

CREATE POLICY "allow_organizer_delete" 
  ON matches FOR DELETE 
  USING (auth.uid() = organizer_id);
