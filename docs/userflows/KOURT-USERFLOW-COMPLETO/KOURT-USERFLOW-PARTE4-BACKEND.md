# 🎯 KOURT APP - USERFLOW COMPLETO
## PARTE 4: Backend Supabase + Comandos de Implementação

---

# 7. BACKEND SUPABASE

## 7.1 SCHEMA DO BANCO DE DADOS

```sql
-- ========================================
-- KOURT APP - DATABASE SCHEMA
-- ========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ========================================
-- 1. PROFILES (Usuários)
-- ========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Onboarding
  sports TEXT[] DEFAULT '{}',
  sport_levels JSONB DEFAULT '{}',
  play_frequency TEXT,
  goals TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  
  -- Gamification
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 1000,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  
  -- Account
  is_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMPTZ,
  
  -- Settings
  notifications_enabled BOOLEAN DEFAULT TRUE,
  location_enabled BOOLEAN DEFAULT TRUE,
  profile_public BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. COURTS (Quadras)
-- ========================================
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id),
  
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'club')),
  sport TEXT NOT NULL,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  
  -- Details
  price_per_hour DECIMAL(10, 2),
  is_free BOOLEAN DEFAULT FALSE,
  capacity INTEGER DEFAULT 4,
  amenities TEXT[] DEFAULT '{}',
  rules TEXT,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  cover_image TEXT,
  
  -- Stats
  rating DECIMAL(2, 1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  
  -- Availability
  opening_time TIME DEFAULT '06:00',
  closing_time TIME DEFAULT '22:00',
  available_days INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index
CREATE INDEX courts_location_idx ON courts USING GIST (location);

-- ========================================
-- 3. BOOKINGS (Reservas)
-- ========================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  court_id UUID NOT NULL REFERENCES courts(id),
  
  -- Time
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DECIMAL(3, 1) NOT NULL,
  
  -- Payment
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_method TEXT,
  payment_intent_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,
  
  -- Check-in
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 4. MATCHES (Partidas)
-- ========================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  court_id UUID REFERENCES courts(id),
  booking_id UUID REFERENCES bookings(id),
  
  -- Info
  sport TEXT NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Time
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration_minutes INTEGER,
  
  -- Players
  max_players INTEGER DEFAULT 4,
  min_players INTEGER DEFAULT 2,
  current_players INTEGER DEFAULT 1,
  
  -- Type
  is_public BOOLEAN DEFAULT TRUE,
  is_competitive BOOLEAN DEFAULT FALSE,
  skill_level TEXT,
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
  
  -- Results (after match)
  winner_team INTEGER,
  score JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 5. MATCH_PLAYERS (Jogadores da Partida)
-- ========================================
CREATE TABLE match_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  team INTEGER,
  position TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('invited', 'confirmed', 'declined', 'no_show')),
  
  -- Post-match
  rating_given JSONB,
  xp_earned INTEGER DEFAULT 0,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(match_id, user_id)
);

-- ========================================
-- 6. REVIEWS (Avaliações)
-- ========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  court_id UUID NOT NULL REFERENCES courts(id),
  booking_id UUID REFERENCES bookings(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Response from owner
  response TEXT,
  response_at TIMESTAMPTZ,
  
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, court_id, booking_id)
);

-- ========================================
-- 7. CHALLENGES (Desafios)
-- ========================================
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
  category TEXT,
  
  -- Requirements
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  
  -- Rewards
  xp_reward INTEGER NOT NULL,
  badge_id UUID,
  
  -- Availability
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 8. USER_CHALLENGES (Progresso do Usuário)
-- ========================================
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_id)
);

-- ========================================
-- 9. ACHIEVEMENTS (Conquistas)
-- ========================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT,
  
  category TEXT,
  tier INTEGER DEFAULT 1,
  
  -- Requirements
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  
  is_secret BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 10. USER_ACHIEVEMENTS (Conquistas do Usuário)
-- ========================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_new BOOLEAN DEFAULT TRUE,
  
  UNIQUE(user_id, achievement_id)
);

-- ========================================
-- 11. CHAT_CONVERSATIONS (Conversas)
-- ========================================
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'match')),
  name TEXT,
  match_id UUID REFERENCES matches(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 12. CHAT_PARTICIPANTS (Participantes)
-- ========================================
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  muted BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMPTZ,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(conversation_id, user_id)
);

-- ========================================
-- 13. CHAT_MESSAGES (Mensagens)
-- ========================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'location', 'match_invite')),
  metadata JSONB,
  
  -- Security
  is_flagged BOOLEAN DEFAULT FALSE,
  flagged_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- ========================================
-- 14. NOTIFICATIONS (Notificações)
-- ========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 15. REPORTS (Denúncias)
-- ========================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_id UUID REFERENCES profiles(id),
  reported_court_id UUID REFERENCES courts(id),
  reported_message_id UUID REFERENCES chat_messages(id),
  
  type TEXT NOT NULL CHECK (type IN ('spam', 'scam', 'abuse', 'fake', 'inappropriate', 'other')),
  description TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 16. SECURITY_EVENTS (Eventos de Segurança)
-- ========================================
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location_info JSONB,
  
  risk_score INTEGER,
  is_suspicious BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_courts_sport ON courts(sport);
CREATE INDEX idx_courts_city ON courts(city);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_court ON bookings(court_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_matches_sport ON matches(sport);
CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_courts_updated_at
  BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 6371; -- Earth radius in km
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := RADIANS(lat2 - lat1);
  dLon := RADIANS(lon2 - lon1);
  a := SIN(dLat/2) * SIN(dLat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dLon/2) * SIN(dLon/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Add XP to user
CREATE OR REPLACE FUNCTION add_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
) RETURNS VOID AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_xp_to_next INTEGER;
BEGIN
  SELECT xp, level, xp_to_next_level 
  INTO v_current_xp, v_current_level, v_xp_to_next
  FROM profiles WHERE id = p_user_id;
  
  v_current_xp := v_current_xp + p_xp_amount;
  
  -- Check for level up
  WHILE v_current_xp >= v_xp_to_next LOOP
    v_current_xp := v_current_xp - v_xp_to_next;
    v_current_level := v_current_level + 1;
    v_xp_to_next := v_xp_to_next * 1.5; -- Each level requires 50% more XP
  END LOOP;
  
  UPDATE profiles 
  SET xp = v_current_xp, level = v_current_level, xp_to_next_level = v_xp_to_next
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (profile_public = true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Public matches are viewable" ON matches
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE conversation_id = chat_messages.conversation_id
      AND user_id = auth.uid()
    )
  );
```

---

## 7.2 API ENDPOINTS (Edge Functions)

```typescript
// supabase/functions/nearby-courts/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { latitude, longitude, radius = 10, sport, limit = 20 } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase.rpc('get_nearby_courts', {
    p_latitude: latitude,
    p_longitude: longitude,
    p_radius_km: radius,
    p_sport: sport,
    p_limit: limit,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

# 8. COMANDOS DE IMPLEMENTAÇÃO

## 8.1 SETUP INICIAL

```bash
#!/bin/bash
# ========================================
# KOURT APP - SETUP COMPLETO
# ========================================

# 1. Criar projeto Expo
echo "📱 Criando projeto Expo..."
npx create-expo-app@latest kourt-app --template tabs
cd kourt-app

# 2. Instalar dependências principais
echo "📦 Instalando dependências..."
npx expo install \
  nativewind \
  tailwindcss \
  react-native-reanimated \
  react-native-gesture-handler \
  react-native-safe-area-context \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  expo-linear-gradient \
  expo-location \
  expo-image-picker \
  expo-notifications \
  react-native-maps \
  @supabase/supabase-js \
  expo-secure-store

# 3. Instalar dependências NPM
npm install \
  zustand \
  @expo/vector-icons \
  date-fns \
  react-hook-form \
  @hookform/resolvers \
  zod

# 4. Instalar dependências de dev
npm install -D \
  @types/react \
  typescript \
  prettier \
  eslint

# 5. Configurar Tailwind
echo "🎨 Configurando Tailwind..."
npx tailwindcss init

# 6. Criar estrutura de pastas
echo "📁 Criando estrutura de pastas..."
mkdir -p app/\(auth\)
mkdir -p app/\(onboarding\)
mkdir -p app/\(tabs\)
mkdir -p app/court
mkdir -p app/booking
mkdir -p app/match/register
mkdir -p app/player
mkdir -p app/chat
mkdir -p app/settings
mkdir -p app/security
mkdir -p app/rankings

mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/home
mkdir -p components/map
mkdir -p components/social
mkdir -p components/court
mkdir -p components/match
mkdir -p components/profile
mkdir -p components/onboarding
mkdir -p components/coach-marks

mkdir -p stores
mkdir -p services
mkdir -p hooks
mkdir -p constants
mkdir -p types
mkdir -p utils
mkdir -p assets/images

echo "✅ Setup completo!"
```

## 8.2 ARQUIVO DE CONFIGURAÇÃO TAILWIND

```bash
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lime': {
          50: '#f7fee7',
          100: '#ecfccb',
          500: '#84cc16',
          950: '#1a2e05',
        },
      },
      fontFamily: {
        'display': ['System'],
      },
    },
  },
  plugins: [],
}
EOF
```

## 8.3 CONFIGURAÇÃO SUPABASE

```bash
cat > services/supabase.ts << 'EOF'
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
EOF
```

## 8.4 ARQUIVO DE CORES

```bash
cat > constants/colors.ts << 'EOF'
export const colors = {
  // Primary
  black: '#000000',
  white: '#FFFFFF',
  
  // Background
  bg: '#FAFAFA',
  
  // Neutral scale
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Accent
  lime: {
    50: '#F7FEE7',
    100: '#ECFCCB',
    500: '#84CC16',
    950: '#1A2E05',
  },
  
  // Status
  green: {
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
  },
  amber: {
    400: '#FBBF24',
    500: '#F59E0B',
  },
  red: {
    500: '#EF4444',
  },
  blue: {
    500: '#3B82F6',
    600: '#2563EB',
  },
};
EOF
```

## 8.5 RODAR O PROJETO

```bash
# Desenvolvimento local
npx expo start --clear

# Com tunnel (para testar no celular)
npx expo start --tunnel

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web
npx expo start --web
```

## 8.6 VERIFICAR ERROS

```bash
# TypeScript
npx tsc --noEmit

# ESLint
npx eslint . --ext .ts,.tsx

# Corrigir ESLint
npx eslint . --ext .ts,.tsx --fix

# Verificar dependências Expo
npx expo install --check
```

## 8.7 BUILD DE PRODUÇÃO

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar
eas build:configure

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Submit para App Store
eas submit --platform ios

# Submit para Play Store
eas submit --platform android
```

---

# 9. CHECKLIST DE IMPLEMENTAÇÃO

## 9.1 FASE 1 - ESTRUTURA BASE
- [ ] Setup do projeto Expo
- [ ] Configurar Tailwind/NativeWind
- [ ] Configurar Supabase
- [ ] Criar estrutura de pastas
- [ ] Implementar Tab Bar correta (5 itens)
- [ ] Implementar navegação básica

## 9.2 FASE 2 - AUTENTICAÇÃO
- [ ] Tela de Login
- [ ] Tela de Cadastro
- [ ] Esqueci Senha
- [ ] Login Social (Google/Apple)
- [ ] Auth Store (Zustand)
- [ ] Proteção de rotas

## 9.3 FASE 3 - ONBOARDING
- [ ] Step 1: Bem-vindo
- [ ] Step 2: Esportes
- [ ] Step 3: Nível
- [ ] Step 4: Frequência
- [ ] Step 5: Objetivos
- [ ] Salvar dados no Supabase

## 9.4 FASE 4 - TELAS PRINCIPAIS
- [ ] Home completa
- [ ] Mapa com pins
- [ ] Social (Feed, Jogadores, Grupos)
- [ ] Perfil

## 9.5 FASE 5 - FLUXO DE RESERVA
- [ ] Detalhes da Quadra
- [ ] Seleção de horário
- [ ] Checkout
- [ ] Pagamento (Stripe)
- [ ] Confirmação

## 9.6 FASE 6 - PARTIDAS
- [ ] Criar Partida
- [ ] Detalhes da Partida
- [ ] Placar ao Vivo
- [ ] Registrar Resultado
- [ ] Compartilhar

## 9.7 FASE 7 - GAMIFICAÇÃO
- [ ] Sistema de XP
- [ ] Níveis
- [ ] Desafios
- [ ] Conquistas
- [ ] Rankings

## 9.8 FASE 8 - EXTRAS
- [ ] Chat
- [ ] Notificações Push
- [ ] Segurança (2FA, verificação)
- [ ] Coach Marks (Tutorial)
- [ ] Dark Mode

---

# 10. ARQUIVOS GERADOS

| Arquivo | Descrição |
|---------|-----------|
| `KOURT-USERFLOW-PARTE1-ESTRUTURA.md` | Tab Bar, Navegação, Estrutura de Arquivos |
| `KOURT-USERFLOW-PARTE2-AUTH.md` | Login, Cadastro, Onboarding |
| `KOURT-USERFLOW-PARTE3-TELAS.md` | Home, Mapa, Social, Perfil |
| `KOURT-USERFLOW-PARTE4-BACKEND.md` | Supabase Schema, Comandos |

---

**FIM DA DOCUMENTAÇÃO USERFLOW**

Use estes arquivos como guia completo para implementar o Kourt App exatamente como no protótipo v5.
