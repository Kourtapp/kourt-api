
-- 1. ARENAS & SAAS (Management)
CREATE TABLE public.arenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  cover_photo_url TEXT,
  amenities TEXT[], -- ['wifi', 'parking', 'bar', etc]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update Courts to belong to an Arena (optional, can be null for public/unmanaged courts)
ALTER TABLE public.courts 
ADD COLUMN arena_id UUID REFERENCES public.arenas(id) ON DELETE SET NULL;

-- Arena Schedules (Opening hours and Blocked times)
CREATE TABLE public.arena_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arena_id UUID REFERENCES public.arenas(id) ON DELETE CASCADE,
  day_of_week INTEGER, -- 0=Sunday, 1=Monday... null if specific date
  specific_date DATE, -- if set, overrides day_of_week
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  price_modifier NUMERIC DEFAULT 1.0, -- e.g. 1.5 for peak hours?? (maybe simple for now)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PREMIUM SUBSCRIPTIONS
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro');

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier subscription_tier DEFAULT 'free',
  status TEXT DEFAULT 'active', -- active, canceled, past_due
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. TOURNAMENTS
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  arena_id UUID REFERENCES public.arenas(id) ON DELETE SET NULL, -- optional
  sport TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT 16,
  status TEXT DEFAULT 'open', -- open, ongoing, finished
  type TEXT DEFAULT 'elimination', -- elimination, round_robin
  entry_fee NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID, -- future use for doubles
  status TEXT DEFAULT 'confirmed', -- confirmed, pending_payment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

CREATE TABLE public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id), -- link to the actual match logic
  round INTEGER DEFAULT 1, -- 1=Round of 16, 2=Quarters, etc.
  bracket_position INTEGER, -- 1-8 for round 1, etc.
  next_match_id UUID, -- pointer to next match in bracket (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES --

-- Arenas
ALTER TABLE public.arenas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Arenas are viewable by everyone" ON public.arenas FOR SELECT USING (true);
CREATE POLICY "Only owner can update arena" ON public.arenas FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can create arenas" ON public.arenas FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
-- Service role (stripe webhook) will handle updates, users normally don't update directly except maybe cancel?

-- Tournaments
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournaments are viewable by everyone" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Organizer can update tournament" ON public.tournaments FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Authenticated users can create tournaments" ON public.tournaments FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Tournament Participants
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

