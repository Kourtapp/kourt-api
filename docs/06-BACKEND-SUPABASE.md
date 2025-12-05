# 🗄️ ETAPA 6 - BACKEND SUPABASE

> **Tempo estimado: 3-4 horas**

---

## PROMPT 6.1 - Estrutura do Banco de Dados

```
Vamos criar as tabelas no Supabase. Acesse o SQL Editor no dashboard e execute:

-- TABELA: profiles (extensão do auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  level TEXT DEFAULT 'iniciante',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: sports (esportes disponíveis)
CREATE TABLE public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  active BOOLEAN DEFAULT true
);

-- TABELA: user_sports (esportes do usuário)
CREATE TABLE public.user_sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  level TEXT DEFAULT 'iniciante',
  UNIQUE(user_id, sport_id)
);

-- TABELA: courts (quadras)
CREATE TABLE public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price_per_hour DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  images TEXT[], -- array de URLs
  amenities TEXT[], -- array de comodidades
  is_public BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- TABELA: court_sports (esportes disponíveis na quadra)
CREATE TABLE public.court_sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  UNIQUE(court_id, sport_id)
);

Execute esse SQL e me avise se deu certo.
```

---

## PROMPT 6.2 - Mais Tabelas

```
Continue criando as tabelas. Execute no SQL Editor:

-- TABELA: court_schedules (horários da quadra)
CREATE TABLE public.court_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=domingo, 6=sábado
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  price_per_hour DECIMAL(10, 2)
);

-- TABELA: bookings (reservas)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES public.sports(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  total_price DECIMAL(10, 2),
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: booking_players (jogadores da reserva)
CREATE TABLE public.booking_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, confirmed, declined
  UNIQUE(booking_id, user_id)
);

-- TABELA: matches (partidas jogadas)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id),
  court_id UUID REFERENCES public.courts(id),
  sport_id UUID REFERENCES public.sports(id),
  date DATE NOT NULL,
  score TEXT, -- "6-4, 6-3" ou "5x3"
  winner_team INTEGER, -- 1 ou 2
  duration_minutes INTEGER,
  is_ranked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

Execute e me avise.
```

---

## PROMPT 6.3 - Tabelas Sociais

```
Agora as tabelas para funcionalidades sociais:

-- TABELA: match_players (jogadores da partida)
CREATE TABLE public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team INTEGER, -- 1 ou 2
  is_winner BOOLEAN,
  rating_received DECIMAL(3, 2),
  UNIQUE(match_id, user_id)
);

-- TABELA: follows (seguir usuários)
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- TABELA: reviews (avaliações de quadras)
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- booking, match, follow, achievement, reminder
  title TEXT NOT NULL,
  body TEXT,
  data JSONB, -- dados extras
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: user_stats (estatísticas calculadas)
CREATE TABLE public.user_stats (
  user_id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

Execute e me avise.
```

---

## PROMPT 6.4 - Row Level Security (RLS)

```
Agora vamos configurar a segurança. Execute:

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- PROFILES: usuário pode ver todos, editar só o próprio
CREATE POLICY "Profiles são visíveis para todos" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuário pode editar próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- COURTS: todos podem ver quadras ativas
CREATE POLICY "Quadras ativas são visíveis" ON public.courts
  FOR SELECT USING (active = true);

-- BOOKINGS: usuário vê suas reservas
CREATE POLICY "Usuário vê próprias reservas" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode criar reserva" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS: usuário vê suas notificações
CREATE POLICY "Usuário vê próprias notificações" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode atualizar próprias notificações" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- FOLLOWS: todos podem ver, usuário pode seguir/deixar de seguir
CREATE POLICY "Follows são visíveis" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Usuário pode seguir" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Usuário pode deixar de seguir" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

Execute e me avise.
```

---

## PROMPT 6.5 - Trigger para Criar Profile

```
Crie um trigger para criar o profile automaticamente quando um usuário se registra:

-- Função que cria o profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'name', 'user' || SUBSTRING(NEW.id::text, 1, 8)), ' ', '_'))
  );
  
  -- Criar estatísticas iniciais
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a função
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

Execute e me avise.
```

---

## PROMPT 6.6 - Dados Iniciais

```
Vamos inserir dados iniciais para teste:

-- Inserir esportes
INSERT INTO public.sports (name, icon) VALUES
  ('Beach Tennis', 'racquet'),
  ('Padel', 'racquet'),
  ('Tênis', 'racquet'),
  ('Vôlei', 'volleyball'),
  ('Futebol', 'soccer'),
  ('Basquete', 'basketball');

-- Inserir quadras de exemplo (São Paulo)
INSERT INTO public.courts (name, description, address, city, state, latitude, longitude, price_per_hour, images, amenities, is_public) VALUES
  (
    'Arena Beach Ibirapuera',
    'Complexo de quadras de Beach Tennis com infraestrutura completa',
    'Av. Pedro Álvares Cabral, s/n - Ibirapuera',
    'São Paulo',
    'SP',
    -23.5874,
    -46.6576,
    120.00,
    ARRAY['https://images.unsplash.com/photo-1622279457486-62dbd7e01e93'],
    ARRAY['estacionamento', 'vestiário', 'lanchonete', 'iluminação'],
    false
  ),
  (
    'Padel Club Morumbi',
    'Quadras de Padel com cobertura e ar condicionado',
    'Rua das Flores, 123 - Morumbi',
    'São Paulo',
    'SP',
    -23.6233,
    -46.7166,
    150.00,
    ARRAY['https://images.unsplash.com/photo-1554068865-24cecd4e34b8'],
    ARRAY['estacionamento', 'vestiário', 'ar_condicionado', 'pro_shop'],
    false
  ),
  (
    'Quadra Parque Ibirapuera',
    'Quadra pública no Parque Ibirapuera',
    'Parque Ibirapuera',
    'São Paulo',
    'SP',
    -23.5875,
    -46.6580,
    0.00,
    ARRAY['https://images.unsplash.com/photo-1519861531473-9200262188bf'],
    ARRAY['iluminação'],
    true
  );

Execute e me avise.
```

---

## PROMPT 6.7 - Tipos TypeScript

```
Crie os tipos TypeScript que correspondem às tabelas. 

Arquivo types/database.ts:

export interface Profile {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  level: string;
  created_at: string;
  updated_at: string;
}

export interface Sport {
  id: string;
  name: string;
  icon: string | null;
  active: boolean;
}

export interface Court {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_hour: number | null;
  rating: number;
  total_reviews: number;
  images: string[];
  amenities: string[];
  is_public: boolean;
  owner_id: string | null;
  created_at: string;
  active: boolean;
}

export interface Booking {
  id: string;
  court_id: string;
  user_id: string;
  sport_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number | null;
  payment_status: string;
  payment_method: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  // Relations
  court?: Court;
  sport?: Sport;
}

export interface Match {
  id: string;
  booking_id: string | null;
  court_id: string | null;
  sport_id: string | null;
  date: string;
  score: string | null;
  winner_team: number | null;
  duration_minutes: number | null;
  is_ranked: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking' | 'match' | 'follow' | 'achievement' | 'reminder';
  title: string;
  body: string | null;
  data: Record<string, any> | null;
  read: boolean;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  total_matches: number;
  total_wins: number;
  current_streak: number;
  best_streak: number;
  xp_points: number;
  level: number;
  updated_at: string;
}

Me mostre o arquivo completo.
```

---

## PROMPT 6.8 - Hooks de Dados

```
Crie hooks personalizados para buscar dados do Supabase.

Arquivo hooks/useCourts.ts:

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Court } from '@/types/database';

export function useCourts(filters?: { sport?: string; city?: string }) {
  return useQuery({
    queryKey: ['courts', filters],
    queryFn: async () => {
      let query = supabase
        .from('courts')
        .select('*')
        .eq('active', true);
      
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Court[];
    },
  });
}

export function useCourt(id: string) {
  return useQuery({
    queryKey: ['court', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courts')
        .select('*, court_sports(sport:sports(*))')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Court;
    },
  });
}

Crie também:
- hooks/useBookings.ts
- hooks/useProfile.ts  
- hooks/useNotifications.ts
- hooks/useMatches.ts

Me mostre os arquivos.
```

---

## PROMPT 6.9 - Configurar React Query

```
Configure o React Query no projeto:

1. Instale @tanstack/react-query se ainda não instalou

2. Crie providers/QueryProvider.tsx:

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuto
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

3. Adicione o QueryProvider no app/_layout.tsx

Me mostre como fica o _layout.tsx atualizado.
```

---

## PROMPT 6.10 - Testar Integração

```
Vamos testar se o banco está funcionando:

1. Crie uma tela de teste temporária que:
   - Busca as quadras do banco
   - Mostra em uma lista simples
   - Busca o perfil do usuário logado
   - Mostra os dados

2. Execute o app e verifique:
   - Se as quadras aparecem
   - Se o perfil do usuário está correto
   - Se não há erros no console

Me avise o resultado dos testes.
```

---

## ✅ CHECKLIST ETAPA 6

- [ ] Todas as tabelas criadas no Supabase
- [ ] RLS configurado corretamente
- [ ] Trigger de criação de profile funcionando
- [ ] Dados iniciais inseridos
- [ ] Tipos TypeScript criados
- [ ] Hooks de dados funcionando
- [ ] React Query configurado
- [ ] Teste de integração passando

---

## 🚨 ERROS COMUNS

### Erro: "permission denied for table"
```
Solução: Verifique se as policies de RLS estão criadas corretamente
e se o usuário está autenticado.
```

### Erro: "violates foreign key constraint"
```
Solução: Verifique se os IDs referenciados existem.
Por exemplo, ao criar booking, o court_id deve existir na tabela courts.
```

### Erro: "function does not exist"
```
Solução: Execute as funções no SQL Editor antes de criar os triggers.
```

---

## PRÓXIMA ETAPA

Quando o backend estiver funcionando, vá para:
**`07-FUNCIONALIDADES.md`**
