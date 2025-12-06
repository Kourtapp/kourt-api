// Types gerados a partir do schema Supabase

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  bio: string | null;

  // Gamification
  level: number;
  xp: number;
  xp_to_next_level: number;
  total_matches: number;
  wins: number;
  streak: number;

  // Onboarding
  sports: string[];
  favorite_sports: string[];
  sport_levels: Record<string, string>;
  play_frequency: string | null;
  preferred_schedule: string[];
  goals: string[];
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;

  // Verification
  email_verified: boolean;
  phone_verified: boolean;
  phone_verified_at: string | null;
  is_pro: boolean;

  // Subscription
  subscription: 'free' | 'pro' | null;

  // Host
  is_host: boolean;

  // Social
  following_count: number;
  followers_count: number;

  // Additional
  win_rate: number;
  city: string | null;
  neighborhood: string | null;
  auth_provider: 'email' | 'apple' | 'google' | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Court {
  id: string;
  name: string;
  type: 'public' | 'private' | 'club';
  sport: string;

  // Location
  address: string;
  city: string;
  state: string | null;
  country: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;

  // Details
  description: string | null;
  is_indoor: boolean;
  has_lighting: boolean;
  price_per_hour: number | null;
  is_free: boolean;
  amenities: string[];
  images: string[];

  // Rating
  rating: number;
  total_reviews: number;
  review_count?: number; // alias for total_reviews

  // Additional details
  verified?: boolean;
  is_covered?: boolean;

  // Hours
  hours_weekdays: string | null;
  hours_weekends: string | null;

  // Owner
  owner_id: string | null;

  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;

  // Date/Time
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;

  // Payment
  total_price: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method: string | null;
  payment_id: string | null;

  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations
  court?: Court;
  user?: Profile;
}

export interface Match {
  id: string;
  organizer_id: string;

  // Basic Info
  title: string;
  sport: string;
  description: string | null;

  // Date/Location
  date: string;
  start_time: string;
  court_id: string | null;
  location_name: string | null;
  location_address: string | null;

  // Players
  max_players: number;
  current_players: number;
  level: 'any' | 'beginner' | 'intermediate' | 'advanced' | 'pro';

  // Settings
  is_public: boolean;
  requires_approval: boolean;
  price_per_person: number | null;

  // Status
  status: 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';

  // Score
  score: Record<string, any> | null;
  winner_team: number | null;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations
  organizer?: Profile;
  court?: Court;
  players?: MatchPlayer[];
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  user_id: string;

  // Team
  team: number;
  position: number | null;

  // Status
  status: 'pending' | 'confirmed' | 'declined' | 'removed';
  joined_at: string;

  // Performance
  points_scored: number;
  mvp: boolean;

  // Relations
  user?: Profile;
}

export interface Review {
  id: string;
  user_id: string;
  court_id: string | null;
  player_id: string | null;
  match_id: string | null;

  rating: number;
  comment: string | null;

  created_at: string;

  // Relations
  user?: Profile;
  court?: Court;
  player?: Profile;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  condition: Record<string, any>;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;

  // Relations
  achievement?: Achievement;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;

  target_type: string;
  target_count: number;
  target: number;

  period: 'daily' | 'weekly' | 'monthly' | 'special';
  starts_at: string;
  ends_at: string;

  is_active: boolean;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;

  progress: number;
  completed: boolean;
  completed_at: string | null;

  started_at: string;

  // Relations
  challenge?: Challenge;
}

export interface Notification {
  id: string;
  user_id: string;

  type: string;
  title: string;
  body: string;
  data: Record<string, any> | null;

  read: boolean;
  read_at: string | null;

  created_at: string;
}

export interface ChatMessage {
  id: string;
  match_id: string;
  user_id: string;

  content: string;
  type: 'text' | 'image' | 'system';

  created_at: string;

  // Relations
  user?: Profile;
}

export interface PrivateRanking {
  id: string;
  name: string;
  description: string | null;
  sport: string;
  code: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface PrivateRankingMember {
  id: string;
  ranking_id: string;
  user_id: string;
  points: number;
  wins: number;
  losses: number;
  joined_at: string;

  // Relations
  user?: Profile;
  ranking?: PrivateRanking;
}

// Input types for creating/updating
export type ProfileUpdate = Partial<
  Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>
>;

export interface CreateBookingInput {
  court_id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_price: number;
  payment_method?: string;
}

export interface CreateMatchInput {
  title: string;
  sport: string;
  description?: string;
  date: string;
  start_time: string;
  court_id?: string;
  location_name?: string;
  location_address?: string;
  max_players: number;
  level?: 'any' | 'beginner' | 'intermediate' | 'advanced' | 'pro';
  is_public?: boolean;
  requires_approval?: boolean;
}

export interface CourtsFilter {
  sport?: string;
  city?: string;
  type?: 'public' | 'private' | 'club';
  is_free?: boolean;
  min_rating?: number;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

export interface MatchesFilter {
  sport?: string;
  level?: string;
  status?: string;
  date?: string;
  is_public?: boolean;
}
