# 🎯 KOURT APP - USERFLOW COMPLETO
## PARTE 3: Telas Principais (Home, Mapa, Social, Perfil)

---

# 3. TELA HOME (`/(tabs)/index`)

## 3.1 LAYOUT COMPLETO DA HOME

```
┌─────────────────────────────────────┐
│           9:41        📶 📡 🔋      │
├─────────────────────────────────────┤
│                                     │
│  Olá,                    🔍  🔔    │
│  Bruno                    (2)      │
│  📍 São Paulo, SP                  │
│                                     │
├─────────────────────────────────────┤
│  Seus esportes  ⓘ                  │
│  [●BeachTennis] [Padel] [Futebol]→ │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 12  Nível 12  PRO   🏆     │   │
│  │ ████████████░░ 2450/3000 XP│   │
│  │ 🔥7dias  ✓165 vitórias     │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  ⚡ Desafio Diário      +150 XP   │
│  Jogue 2 partidas hoje!            │
│  ████████░░░░ 1/2                  │
├─────────────────────────────────────┤
│  📍 Quadras perto de você  Ver mapa│
│  Baseado na sua localização        │
│  [Card1→] [Card2→] [Card3→] →     │
├─────────────────────────────────────┤
│  Sugestões              Ver todos  │
│  [Player1] [Player2] [Player3] →  │
├─────────────────────────────────────┤
│  🎾 Partidas abertas    Ver todas  │
│  ●3 partidas precisando jogadores  │
│  [Match1] [Match2] [Match3]        │
├─────────────────────────────────────┤
│  🚩 Desafios da Semana  Ver todos  │
│  [Challenge1] [Challenge2] →       │
├─────────────────────────────────────┤
│  🏅 Conquistas Recentes Ver todas  │
│  [Badge1] [Badge2] [Badge3] →      │
├─────────────────────────────────────┤
│  🏆 Ranking Semanal    BeachTennis │
│  1. Lucas M. - 1250 pts  🥇        │
│  2. Marina S. - 1180 pts           │
│  3. Pedro F. - 1095 pts            │
│  7. Você - 890 pts      ↑2        │
├─────────────────────────────────────┤
│  ⭐ Quadras em destaque  Ver todas │
│  [Card1→] [Card2→] →              │
├─────────────────────────────────────┤
│  🔥 Populares agora     Ver todas  │
│  [Card1→] [Card2→] →              │
├─────────────────────────────────────┤
│                                     │
│  [Home] [Mapa] [+] [Social] [Perfil]│
└─────────────────────────────────────┘
```

---

## 3.2 HEADER DA HOME

### Elementos e Funções

| Elemento | Tipo | Ação | Navegação/API |
|----------|------|------|---------------|
| **"Olá, Bruno"** | Text | - | `user.name` do store |
| **Localização** | Text + Icon | Detectar localização | `useLocation()` |
| **Botão Busca** | Pressable | Abrir busca | `router.push('/search')` |
| **Botão Notificações** | Pressable | Ver notificações | `router.push('/notifications')` |
| **Badge Notificações** | View | - | `unreadCount` do store |

```typescript
// components/home/HomeHeader.tsx
interface HomeHeaderProps {
  userName: string;
  location: string;
  unreadNotifications: number;
}

export function HomeHeader({ userName, location, unreadNotifications }: HomeHeaderProps) {
  return (
    <View className="bg-white px-5 pt-4 pb-3">
      <View className="flex-row items-start justify-between mb-4">
        {/* Left */}
        <View>
          <Text className="text-sm text-neutral-500">Olá,</Text>
          <Text className="text-2xl font-bold text-black">{userName}</Text>
          <View className="flex-row items-center mt-1">
            <MaterialIcons name="location-on" size={14} color="#A3A3A3" />
            <Text className="text-sm text-neutral-500 ml-1">{location}</Text>
          </View>
        </View>
        
        {/* Right */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push('/search')}
            className="w-11 h-11 bg-neutral-100 rounded-full items-center justify-center"
          >
            <MaterialIcons name="search" size={22} color="#000" />
          </Pressable>
          
          <Pressable
            onPress={() => router.push('/notifications')}
            className="w-11 h-11 bg-neutral-100 rounded-full items-center justify-center relative"
          >
            <MaterialIcons name="notifications" size={22} color="#000" />
            {unreadNotifications > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {unreadNotifications}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
```

---

## 3.3 SPORT PILLS (Filtro de Esportes)

### Elementos e Funções

| Elemento | Tipo | Ação |
|----------|------|------|
| **Pill Ativo** | Pressable | Filtrar conteúdo | `bg-black text-white` |
| **Pill Inativo** | Pressable | Filtrar conteúdo | `bg-white border text-black` |
| **Info Icon** | Pressable | Mostrar tooltip | Modal explicativo |

```typescript
// components/home/SportPills.tsx
interface SportPillsProps {
  sports: Array<{ id: string; name: string; icon: string }>;
  selectedSport: string;
  onSelect: (sportId: string) => void;
}

export function SportPills({ sports, selectedSport, onSelect }: SportPillsProps) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-2 px-5 mb-2">
        <Text className="text-xs text-neutral-500">Seus esportes</Text>
        <MaterialIcons name="info" size={14} color="#A3A3A3" />
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {sports.map((sport) => (
          <Pressable
            key={sport.id}
            onPress={() => onSelect(sport.id)}
            className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full ${
              selectedSport === sport.id
                ? 'bg-black'
                : 'bg-white border border-neutral-200'
            }`}
          >
            <MaterialIcons 
              name={sport.icon} 
              size={18} 
              color={selectedSport === sport.id ? '#FFF' : '#000'} 
            />
            <Text className={`text-sm font-medium ${
              selectedSport === sport.id ? 'text-white' : 'text-black'
            }`}>
              {sport.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
```

---

## 3.4 GAMIFICATION CARD (Nível/XP)

```typescript
// components/home/GamificationCard.tsx
interface GamificationCardProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  wins: number;
  isPro: boolean;
}

export function GamificationCard({
  level,
  xp,
  xpToNextLevel,
  streak,
  wins,
  isPro,
}: GamificationCardProps) {
  const progress = (xp / xpToNextLevel) * 100;

  return (
    <View className="mx-5 mb-5 p-4 bg-black rounded-2xl">
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-12 h-12 bg-neutral-800 rounded-xl items-center justify-center">
          <Text className="text-white font-bold text-lg">{level}</Text>
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-white font-bold">Nível {level}</Text>
            {isPro && (
              <View className="px-2 py-0.5 bg-amber-500/20 rounded-full">
                <Text className="text-amber-400 text-[9px] font-bold">PRO</Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-neutral-400">
            {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP para o próximo nível
          </Text>
        </View>
        
        <Pressable 
          onPress={() => router.push('/achievements')}
          className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
        >
          <MaterialIcons name="emoji-events" size={24} color="#FFF" />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <View 
          className="h-full bg-white rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Stats */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="local-fire-department" size={14} color="#FBBF24" />
            <Text className="text-white text-xs font-medium">{streak} dias</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="check-circle" size={14} color="#4ADE80" />
            <Text className="text-white text-xs font-medium">{wins} vitórias</Text>
          </View>
        </View>
        
        <Pressable 
          onPress={() => router.push('/achievements')}
          className="px-3 py-1.5 bg-white/10 rounded-lg"
        >
          <Text className="text-xs text-white font-medium">Ver conquistas</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

## 3.5 COURT CARD (Card de Quadra)

```typescript
// components/home/CourtCard.tsx
interface CourtCardProps {
  court: {
    id: string;
    name: string;
    type: 'public' | 'private';
    sport: string;
    distance: string;
    rating: number;
    price: number | null;
    currentPlayers?: number;
    image?: string;
  };
  onPress: () => void;
}

export function CourtCard({ court, onPress }: CourtCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[260px] bg-white border border-neutral-200 rounded-2xl overflow-hidden"
    >
      {/* Image */}
      <View className="h-28 bg-neutral-200 relative">
        {court.image && (
          <Image source={{ uri: court.image }} className="w-full h-full" />
        )}
        
        {/* Badge Tipo */}
        <View className="absolute top-3 left-3 px-2.5 py-1 bg-black rounded-full">
          <Text className="text-white text-[10px] font-medium">
            {court.type === 'public' ? 'Pública' : 'Privada'}
          </Text>
        </View>
        
        {/* Badge Distância */}
        <View className="absolute top-3 right-3 px-2 py-1 bg-white/90 rounded-full">
          <Text className="text-black text-[10px] font-semibold">
            {court.distance}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="font-semibold text-black text-sm mb-1">
          {court.name}
        </Text>
        
        <View className="flex-row items-center gap-2 mb-2">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="star" size={12} color="#000" />
            <Text className="text-xs text-black">{court.rating}</Text>
          </View>
          <Text className="text-xs text-neutral-400">·</Text>
          <Text className="text-xs text-neutral-500">{court.sport}</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="group" size={12} color="#525252" />
            <Text className="text-[11px] text-neutral-600">
              {court.currentPlayers 
                ? `${court.currentPlayers} jogando agora`
                : 'Disponível'}
            </Text>
          </View>
          
          <Text className="text-xs font-semibold text-black">
            {court.price ? `R$ ${court.price}/h` : 'Gratuita'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
```

### Ação do Card

```typescript
const handleCourtPress = (courtId: string) => {
  router.push(`/court/${courtId}`);
};
```

---

## 3.6 OPEN MATCH CARD (Partida Aberta)

```typescript
// components/home/OpenMatchCard.tsx
interface OpenMatchCardProps {
  match: {
    id: string;
    sport: string;
    time: string;
    location: string;
    spotsLeft: number;
  };
  onJoin: () => void;
}

export function OpenMatchCard({ match, onJoin }: OpenMatchCardProps) {
  const sportIcons = {
    'beach-tennis': 'sports-tennis',
    'padel': 'sports-tennis',
    'football': 'sports-soccer',
    'basketball': 'sports-basketball',
  };

  return (
    <View className="bg-white border border-neutral-200 rounded-2xl p-4 flex-row items-center gap-4 mb-3">
      <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center">
        <MaterialIcons 
          name={sportIcons[match.sport] || 'sports'} 
          size={24} 
          color="#000" 
        />
      </View>
      
      <View className="flex-1">
        <Text className="font-semibold text-black text-sm">
          {match.sport} · {match.time}
        </Text>
        <Text className="text-xs text-neutral-500">
          {match.location} · Falta {match.spotsLeft}
        </Text>
      </View>
      
      <Pressable 
        onPress={onJoin}
        className="px-4 py-2 bg-lime-500 rounded-full"
      >
        <Text className="text-lime-950 text-xs font-semibold">Entrar</Text>
      </Pressable>
    </View>
  );
}
```

### Ação do Botão "Entrar"

```typescript
const handleJoinMatch = async (matchId: string) => {
  try {
    // 1. Verificar se há vagas
    const { data: match } = await supabase
      .from('matches')
      .select('*, players:match_players(*)')
      .eq('id', matchId)
      .single();

    if (match.players.length >= match.max_players) {
      Alert.alert('Ops!', 'Esta partida já está cheia');
      return;
    }

    // 2. Adicionar jogador
    await supabase.from('match_players').insert({
      match_id: matchId,
      user_id: userId,
      status: 'confirmed',
    });

    // 3. Navegar para detalhes
    router.push(`/match/${matchId}`);
    
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível entrar na partida');
  }
};
```

---

## 3.7 SECTION HEADER

```typescript
// components/home/SectionHeader.tsx
interface SectionHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  actionText = 'Ver todas',
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View className="px-5 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {icon && (
            <MaterialIcons name={icon} size={18} color="#000" />
          )}
          <Text className="text-base font-bold text-black">{title}</Text>
        </View>
        
        {onActionPress && (
          <Pressable onPress={onActionPress}>
            <Text className="text-sm text-neutral-500">{actionText}</Text>
          </Pressable>
        )}
      </View>
      
      {subtitle && (
        <Text className="text-xs text-neutral-500 mt-1">{subtitle}</Text>
      )}
    </View>
  );
}
```

---

## 3.8 HOME SCREEN COMPLETA

```typescript
// app/(tabs)/index.tsx
import { ScrollView, View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';

import { HomeHeader } from '@/components/home/HomeHeader';
import { SportPills } from '@/components/home/SportPills';
import { GamificationCard } from '@/components/home/GamificationCard';
import { DailyChallenge } from '@/components/home/DailyChallenge';
import { CourtCard } from '@/components/home/CourtCard';
import { PlayerSuggestionCard } from '@/components/home/PlayerSuggestionCard';
import { OpenMatchCard } from '@/components/home/OpenMatchCard';
import { ChallengeCard } from '@/components/home/ChallengeCard';
import { AchievementBadge } from '@/components/home/AchievementBadge';
import { RankingCard } from '@/components/home/RankingCard';
import { SectionHeader } from '@/components/home/SectionHeader';

import { useUserStore } from '@/stores/useUserStore';
import { useCourts } from '@/hooks/useCourts';
import { useMatches } from '@/hooks/useMatches';

export default function HomeScreen() {
  const { user, profile } = useUserStore();
  const [selectedSport, setSelectedSport] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { courts, nearbyCourts, featuredCourts, refetch: refetchCourts } = useCourts();
  const { openMatches, refetch: refetchMatches } = useMatches();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCourts(), refetchMatches()]);
    setRefreshing(false);
  }, []);

  return (
    <View className="flex-1 bg-[#fafafa]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <HomeHeader
          userName={profile?.name || 'Jogador'}
          location={profile?.location || 'São Paulo, SP'}
          unreadNotifications={3}
        />

        {/* Sport Pills */}
        <SportPills
          sports={profile?.sports || []}
          selectedSport={selectedSport}
          onSelect={setSelectedSport}
        />

        {/* Gamification */}
        <GamificationCard
          level={profile?.level || 1}
          xp={profile?.xp || 0}
          xpToNextLevel={profile?.xp_to_next_level || 1000}
          streak={profile?.streak || 0}
          wins={profile?.wins || 0}
          isPro={profile?.is_pro || false}
        />

        {/* Daily Challenge */}
        <DailyChallenge
          title="Jogue 2 partidas hoje!"
          xpReward={150}
          progress={1}
          total={2}
        />

        {/* Quadras Próximas */}
        <SectionHeader
          icon="near-me"
          title="Quadras perto de você"
          subtitle="Baseado na sua localização atual"
          onActionPress={() => router.push('/map')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 8 }}
        >
          {nearbyCourts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              onPress={() => router.push(`/court/${court.id}`)}
            />
          ))}
        </ScrollView>

        {/* Sugestões de Jogadores */}
        <View className="mt-5">
          <SectionHeader
            title="Sugestões"
            onActionPress={() => router.push('/match/search-players')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 8 }}
          >
            {/* Player cards */}
          </ScrollView>
        </View>

        {/* Partidas Abertas */}
        <View className="mt-5">
          <SectionHeader
            icon="sports-tennis"
            title="Partidas abertas"
            onActionPress={() => router.push('/matches')}
          />
          <View className="px-5 mb-2">
            <View className="flex-row items-center gap-1.5 px-3 py-1.5 bg-lime-100 rounded-full self-start">
              <View className="w-2 h-2 bg-lime-500 rounded-full" />
              <Text className="text-xs text-lime-700 font-medium">
                {openMatches.length} partidas precisando de jogadores
              </Text>
            </View>
          </View>
          <View className="px-5">
            {openMatches.slice(0, 3).map((match) => (
              <OpenMatchCard
                key={match.id}
                match={match}
                onJoin={() => handleJoinMatch(match.id)}
              />
            ))}
          </View>
        </View>

        {/* Mais seções... */}
        
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
```

---

# 4. TELA MAPA (`/(tabs)/map`)

## 4.1 LAYOUT COMPLETO

```
┌─────────────────────────────────────┐
│           9:41        📶 📡 🔋      │
├─────────────────────────────────────┤
│  ← ┌─────────────────────────┐ 🎛  │
│    │ Quadras por perto       │     │
│    │ Qualquer horário · Todos│     │
│    └─────────────────────────┘     │
│  [Todos][💰Preço][Gratuitas][Disp.]│
├─────────────────────────────────────┤
│                                     │
│    [Grátis]        [R$120]         │
│                                     │
│        [R$140]           [R$80]    │
│                                     │
│              ●[R$160]●              │
│                                     │
│    [Grátis]    [R$150]   [R$100]   │
│                                     │
│         [Grátis]                    │
│                                     │
├─────────────────────────────────────┤
│  ▔▔▔▔▔▔▔▔▔▔▔▔ (handle)             │
│  12 quadras encontradas    [Toggle]│
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [img] Arena Beach Tennis    │   │
│  │       ⭐4.8 · 2.5km         │   │
│  │       R$ 80/h               │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [img] Padel Club            │   │
│  │       ⭐4.6 · 3.2km         │   │
│  │       R$ 120/h              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Home] [Mapa] [+] [Social] [Perfil]│
└─────────────────────────────────────┘
```

## 4.2 ELEMENTOS E FUNÇÕES

| Elemento | Tipo | Ação | Navegação/API |
|----------|------|------|---------------|
| **Botão Voltar** | Pressable | Voltar | `router.back()` |
| **Search Box** | Pressable | Abrir busca | `router.push('/search')` |
| **Botão Filtros** | Pressable | Abrir modal | `setShowFilters(true)` |
| **Filter Pill** | Pressable | Aplicar filtro | `setFilter(filterType)` |
| **Price Pin** | Pressable | Selecionar quadra | `setSelectedCourt(court)` |
| **Pin Selecionado** | View | Destaque | `bg-black text-white` |
| **Handle Bottom Sheet** | PanGesture | Expandir/recolher | `Reanimated gesture` |
| **Toggle Lista/Mapa** | Pressable | Alternar view | `setViewMode()` |
| **Court List Item** | Pressable | Ver detalhes | `router.push('/court/[id]')` |

```typescript
// app/(tabs)/map.tsx
import { View, Text, Pressable, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';

import { SearchBar } from '@/components/map/SearchBar';
import { FilterPills } from '@/components/map/FilterPills';
import { PricePin } from '@/components/map/PricePin';
import { CourtListItem } from '@/components/map/CourtListItem';
import { useCourts } from '@/hooks/useCourts';
import { useLocation } from '@/hooks/useLocation';

export default function MapScreen() {
  const { location } = useLocation();
  const { courts, loading } = useCourts();
  
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Bottom sheet animation
  const translateY = useSharedValue(400);
  
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(100, Math.min(400, translateY.value + e.translationY));
    })
    .onEnd(() => {
      translateY.value = withSpring(translateY.value < 250 ? 100 : 400);
    });

  const bottomSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const filteredCourts = courts.filter((court) => {
    if (filter === 'all') return true;
    if (filter === 'free') return court.price === null;
    if (filter === 'available') return court.available_now;
    return court.sport === filter;
  });

  return (
    <View className="flex-1 bg-[#fafafa]">
      {/* Search Bar */}
      <View className="absolute top-12 left-0 right-0 z-30 bg-white px-4 pt-3 pb-3 border-b border-neutral-100">
        <View className="flex-row items-center gap-2 mb-3">
          <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
            <MaterialIcons name="arrow-back" size={20} color="#000" />
          </Pressable>
          
          <Pressable 
            onPress={() => router.push('/search')}
            className="flex-1 flex-row items-center bg-white border border-neutral-300 rounded-full shadow-sm overflow-hidden"
          >
            <View className="flex-1 px-4 py-2.5">
              <Text className="text-sm font-medium text-black">Quadras por perto</Text>
              <Text className="text-xs text-neutral-500">Qualquer horário · Todos esportes</Text>
            </View>
            <Pressable 
              onPress={() => setShowFilters(true)}
              className="w-10 h-10 items-center justify-center border-l border-neutral-200"
            >
              <MaterialIcons name="tune" size={20} color="#000" />
            </Pressable>
          </Pressable>
        </View>

        {/* Filter Pills */}
        <FilterPills selected={filter} onSelect={setFilter} />
      </View>

      {/* Map */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location?.latitude || -23.5505,
          longitude: location?.longitude || -46.6333,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {filteredCourts.map((court) => (
          <Marker
            key={court.id}
            coordinate={{
              latitude: court.latitude,
              longitude: court.longitude,
            }}
            onPress={() => setSelectedCourt(court.id)}
          >
            <PricePin
              price={court.price}
              selected={selectedCourt === court.id}
            />
          </Marker>
        ))}
      </MapView>

      {/* Bottom Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View 
          style={bottomSheetStyle}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg"
        >
          {/* Handle */}
          <View className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-3 mb-4" />
          
          {/* Header */}
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-black">
              {filteredCourts.length} quadras encontradas
            </Text>
            <Pressable className="px-3 py-1.5 bg-neutral-100 rounded-full">
              <Text className="text-xs text-black font-medium">Lista</Text>
            </Pressable>
          </View>

          {/* Court List */}
          <FlatList
            data={filteredCourts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CourtListItem
                court={item}
                onPress={() => router.push(`/court/${item.id}`)}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View className="h-3" />}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

---

# 5. TELA SOCIAL (`/(tabs)/social`)

## 5.1 LAYOUT

```
┌─────────────────────────────────────┐
│           9:41        📶 📡 🔋      │
├─────────────────────────────────────┤
│  Comunidade                    🔍   │
├─────────────────────────────────────┤
│  [●Feed]  [Jogadores]  [Grupos]    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Pedro F.           2h    │   │
│  │                             │   │
│  │ Partida incrível hoje!      │   │
│  │ Venci de virada 6-4!        │   │
│  │                             │   │
│  │ [────────FOTO────────]      │   │
│  │                             │   │
│  │ ❤️ 24  💬 8                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Marina S.          1d    │   │
│  │                             │   │
│  │ Check-in no Beach Arena!    │   │
│  │ Quem mais está aqui?        │   │
│  │                             │   │
│  │ ❤️ 45  💬 12                │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Home] [Mapa] [+] [Social] [Perfil]│
└─────────────────────────────────────┘
```

## 5.2 TABS E CONTEÚDO

| Tab | Conteúdo | API |
|-----|----------|-----|
| **Feed** | Posts dos amigos | `GET /feed` |
| **Jogadores** | Lista de jogadores | `GET /players/suggestions` |
| **Grupos** | Grupos de esporte | `GET /groups` |

```typescript
// app/(tabs)/social.tsx
import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';

import { FeedTab } from '@/components/social/FeedTab';
import { PlayersTab } from '@/components/social/PlayersTab';
import { GroupsTab } from '@/components/social/GroupsTab';

const tabs = [
  { id: 'feed', label: 'Feed' },
  { id: 'players', label: 'Jogadores' },
  { id: 'groups', label: 'Grupos' },
];

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <View className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-3 border-b border-neutral-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-black">Comunidade</Text>
          <Pressable onPress={() => router.push('/search/players')}>
            <MaterialIcons name="search" size={24} color="#000" />
          </Pressable>
        </View>

        {/* Tab Pills */}
        <View className="flex-row gap-2">
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab.id ? 'bg-black' : 'bg-neutral-100'
              }`}
            >
              <Text className={`text-sm font-medium ${
                activeTab === tab.id ? 'text-white' : 'text-black'
              }`}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Content */}
      {activeTab === 'feed' && <FeedTab />}
      {activeTab === 'players' && <PlayersTab />}
      {activeTab === 'groups' && <GroupsTab />}
    </View>
  );
}
```

---

# 6. TELA PERFIL (`/(tabs)/profile`)

## 6.1 LAYOUT

```
┌─────────────────────────────────────┐
│           9:41        📶 📡 🔋      │
├─────────────────────────────────────┤
│                              ⚙️     │
│                                     │
│        ┌──────┐                     │
│        │  👤  │                     │
│        └──────┘                     │
│        Bruno Silva                  │
│        @brunosilva                  │
│        ✓ Verificado                 │
│                                     │
│  ┌─────────┬─────────┬─────────┐   │
│  │   165   │   112   │   12    │   │
│  │Partidas │Vitórias │  Nível  │   │
│  └─────────┴─────────┴─────────┘   │
│                                     │
├─────────────────────────────────────┤
│  CONTA                              │
│  ┌─────────────────────────────┐   │
│  │ 👤 Editar Perfil        →   │   │
│  │ 📊 Atividades           →   │   │
│  │ 🏆 Conquistas           →   │   │
│  │ 💳 Pagamentos           →   │   │
│  └─────────────────────────────┘   │
│                                     │
│  CONFIGURAÇÕES                      │
│  ┌─────────────────────────────┐   │
│  │ 🔒 Segurança            →   │   │
│  │ 🔔 Notificações         →   │   │
│  │ 🔐 Privacidade          →   │   │
│  │ ⭐ Kourt PRO            →   │   │
│  └─────────────────────────────┘   │
│                                     │
│  SUPORTE                            │
│  ┌─────────────────────────────┐   │
│  │ ❓ Ajuda                 →   │   │
│  │ 👥 Indicar amigos       →   │   │
│  │ 📝 Termos de uso        →   │   │
│  │ 🚪 Sair                 →   │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Home] [Mapa] [+] [Social] [Perfil]│
└─────────────────────────────────────┘
```

## 6.2 MENU ITEMS E AÇÕES

| Item | Ícone | Ação |
|------|-------|------|
| **Editar Perfil** | person | `router.push('/settings/edit-profile')` |
| **Atividades** | analytics | `router.push('/profile/activities')` |
| **Conquistas** | emoji-events | `router.push('/achievements')` |
| **Pagamentos** | credit-card | `router.push('/settings/payments')` |
| **Segurança** | lock | `router.push('/settings/security')` |
| **Notificações** | notifications | `router.push('/settings/notifications')` |
| **Privacidade** | privacy-tip | `router.push('/settings/privacy')` |
| **Kourt PRO** | star | `router.push('/settings/subscription')` |
| **Ajuda** | help | `router.push('/settings/help')` |
| **Indicar amigos** | group-add | `router.push('/referral')` |
| **Termos de uso** | description | `Linking.openURL('https://...')` |
| **Sair** | logout | `signOut()` + `router.replace('/login')` |

---

**Continua na PARTE 4: Fluxo de Reserva e Pagamento**
