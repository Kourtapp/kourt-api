import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCourts, useMatches, useChallenges } from '@/hooks';
import { Court, Match } from '@/types/database.types';
import { CoachOverlay } from '@/components/coach-marks/CoachOverlay';
import { useCoachStore } from '@/stores/useCoachStore';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { InvitesSection } from '@/components/home/InvitesSection';
import { CityAutocomplete } from '@/components/inputs/CityAutocomplete';
import { CheckInModal } from '@/components/modals/CheckInModal';

// Cities list for location picker
const CITIES = [
  { id: '1', name: 'São Paulo', state: 'SP' },
  { id: '2', name: 'Rio de Janeiro', state: 'RJ' },
  { id: '3', name: 'Belo Horizonte', state: 'MG' },
  { id: '4', name: 'Curitiba', state: 'PR' },
  { id: '5', name: 'Porto Alegre', state: 'RS' },
  { id: '6', name: 'Florianópolis', state: 'SC' },
  { id: '7', name: 'Brasília', state: 'DF' },
  { id: '8', name: 'Salvador', state: 'BA' },
  { id: '9', name: 'Fortaleza', state: 'CE' },
  { id: '10', name: 'Recife', state: 'PE' },
];

// Mock games happening now
const JOGOS_ACONTECENDO = [
  {
    id: '1',
    sport: 'BeachTennis',
    time: '18:00',
    location: 'Arena Ibirapuera',
    spotsLeft: 1,
    icon: 'sports-tennis',
  },
  {
    id: '2',
    sport: 'Society',
    time: '19:30',
    location: 'Arena Soccer',
    spotsLeft: 3,
    icon: 'sports-soccer',
  },
  {
    id: '3',
    sport: 'Basquete 3x3',
    time: '20:00',
    location: 'SESC Consolação',
    spotsLeft: 2,
    icon: 'sports-basketball',
  },
];

// Mock weekly challenges
const DESAFIOS_SEMANA = [
  {
    id: '1',
    title: 'Maratonista',
    description: 'Jogue 5 partidas esta semana',
    progress: 3,
    target: 5,
    xp: 150,
    icon: 'sports-tennis',
    color: '#0EA5E9',
  },
  {
    id: '2',
    title: 'Social',
    description: 'Jogue com 3 pessoas novas',
    progress: 3,
    target: 3,
    xp: 100,
    icon: 'groups',
    color: '#22C55E',
    completed: true,
  },
];

// Mock recent achievements
const CONQUISTAS_RECENTES = [
  { id: '1', title: 'On Fire!', description: '10 vitórias', icon: 'local-fire-department', color: '#F59E0B', isNew: true },
  { id: '2', title: 'Centenário', description: '100 partidas', icon: '100', color: '#3B82F6', isNumber: true },
  { id: '3', title: 'Popular', description: '20 parceiros', icon: 'groups', color: '#22C55E' },
];

// Mock ranking
const RANKING_SEMANAL = [
  { position: 1, name: 'Lucas M.', points: 1250, isTop: true },
  { position: 2, name: 'Marina S.', points: 1180 },
  { position: 3, name: 'Pedro F.', points: 1095 },
];

// Mock sports to discover
const NOVOS_ESPORTES = [
  { id: '1', name: 'Vôlei', icon: 'sports-volleyball', courts: 8 },
  { id: '2', name: 'Handebol', icon: 'sports-handball', courts: 3 },
  { id: '3', name: 'Pickleball', icon: 'sports-tennis', courts: 12 },
];

// Mock best courts in region
const MELHORES_REGIAO = [
  { id: '1', name: 'Arena BeachPremium', neighborhood: 'Moema', distance: '4.5 km', rating: 4.9, reviews: 247, price: 180, badge: '#1 Beach' },
  { id: '2', name: 'Padel Club Jardins', neighborhood: 'Jardins', distance: '3.2 km', rating: 4.8, reviews: 189, price: 150 },
];

// Mock personalized recommendations
const VOCE_PODE_GOSTAR = [
  { id: '1', name: 'Quadra do Carlos', sport: 'BeachTennis', rating: 5.0, match: 92, type: 'Particular', price: 80, reason: 'Mesmo nível' },
  { id: '2', name: 'BeachArena', sport: 'BeachTennis', rating: 4.7, match: 87, type: 'Privada', reason: '3 amigos jogaram' },
];

export default function HomeScreen() {
  const { user, profile } = useAuthStore();
  const [selectedSport, setSelectedSport] = useState<string | null>('beach-tennis');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('São Paulo');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const { hasSeenTutorial, isActive, checkTutorialStatus, startTutorial } =
    useCoachStore();

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  useEffect(() => {
    if (!hasSeenTutorial && !isActive) {
      const timer = setTimeout(() => {
        startTutorial();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial, isActive]);

  const { courts, loading: courtsLoading } = useCourts(
    selectedSport ? { sport: selectedSport } : undefined,
  );
  const { matches, loading: matchesLoading } = useMatches(
    selectedSport ? { sport: selectedSport } : undefined,
  );
  const { userChallenges } = useChallenges(user?.id);

  // Get current location
  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingLocation(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (address?.city) {
        setSelectedCity(address.city);
      }
    } catch {
      // Keep current city
    } finally {
      setLoadingLocation(false);
      setShowLocationModal(false);
    }
  };

  // Memoized gamification data
  const gamification = useMemo(() => ({
    level: profile?.level || 1,
    xp: profile?.xp || 0,
    xpToNext: profile?.xp_to_next_level || 3000,
    streak: profile?.streak || 7,
    victories: 165,
  }), [profile?.level, profile?.xp, profile?.xp_to_next_level, profile?.streak]);

  const activeChallenge = userChallenges[0];

  // User sports from profile
  const userSports = useMemo(() => profile?.sports || ['BeachTennis', 'Padel'], [profile?.sports]);

  // Mock players for invite
  const playersToInvite = useMemo(() => [
    { id: '1', name: 'Lucas M.', sport: 'BeachTennis', status: 'Nível similar', online: true },
    { id: '2', name: 'Ana C.', sport: 'BeachTennis', status: 'Por perto', online: true },
    { id: '3', name: 'Pedro S.', sport: 'Padel', status: 'Contato', online: false },
    { id: '4', name: 'Maria L.', sport: 'BeachTennis', status: 'Nível similar', online: true },
  ], []);

  // Mock invites formatted for InvitesSection
  const invitesForSection = useMemo(() => [
    {
      id: '1',
      senderName: 'Pedro Ferreira',
      senderAvatarUrl: undefined,
      message: 'Falta 1 pra fechar! Quem topa?',
      location: 'Arena BeachClub',
      dateTime: 'Hoje, 19:00',
      timeAgo: '1h',
      participantsCount: 3,
      maxParticipants: 4,
      participantAvatars: [],
      likesCount: 24,
      commentsCount: 5,
    },
    {
      id: '2',
      senderName: 'Lucas Mendes',
      senderAvatarUrl: undefined,
      message: 'Beach às 18h na Arena! Vem jogar?',
      location: 'Arena Ibirapuera',
      dateTime: 'Hoje, 18:00',
      timeAgo: '30min',
      participantsCount: 2,
      maxParticipants: 4,
      participantAvatars: [],
      likesCount: 12,
      commentsCount: 3,
    },
  ], []);

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        bounces={true}
        overScrollMode="always"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <Text className="text-2xl font-black text-black tracking-tight">KOURT</Text>
          <View className="flex-row items-center gap-2">
            {/* Location */}
            <Pressable
              onPress={() => setShowLocationModal(true)}
              className="flex-row items-center gap-1 px-3 py-2 bg-white rounded-full border border-neutral-200"
            >
              <MaterialIcons name="place" size={16} color="#84CC16" />
              <Text className="text-sm font-medium text-black">{selectedCity}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={16} color="#737373" />
            </Pressable>
            {/* Chat */}
            <Pressable
              onPress={() => router.push('/chat' as any)}
              className="w-10 h-10 bg-white rounded-full items-center justify-center border border-neutral-200 relative"
            >
              <MaterialIcons name="chat-bubble-outline" size={20} color="#000" />
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-[10px] font-bold text-white">3</Text>
              </View>
            </Pressable>
            {/* Notifications */}
            <Pressable
              onPress={() => router.push('/notifications' as any)}
              className="w-10 h-10 bg-white rounded-full items-center justify-center border border-neutral-200 relative"
            >
              <MaterialIcons name="notifications-none" size={20} color="#000" />
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-[10px] font-bold text-white">5</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <Pressable
          onPress={() => router.push('/search' as any)}
          className="mx-5 mb-4"
        >
          <View className="flex-row items-center bg-white rounded-2xl border border-neutral-200 px-4 py-3">
            <MaterialIcons name="search" size={22} color="#A3A3A3" />
            <Text className="flex-1 ml-3 text-base text-neutral-400">
              Buscar quadras, jogadores...
            </Text>
            <View className="w-8 h-8 bg-neutral-100 rounded-lg items-center justify-center">
              <MaterialIcons name="tune" size={18} color="#525252" />
            </View>
          </View>
        </Pressable>

        {/* Map Preview */}
        <Pressable
          onPress={() => router.push('/(tabs)/map' as any)}
          className="mx-5 mb-4 rounded-2xl overflow-hidden bg-neutral-100 h-36"
        >
          <View className="flex-1 bg-lime-50 items-center justify-center relative">
            {/* Simplified map visual */}
            <View className="absolute inset-0 opacity-30">
              <View className="absolute top-4 left-6 w-2 h-2 bg-lime-500 rounded-full" />
              <View className="absolute top-8 right-12 w-2 h-2 bg-lime-500 rounded-full" />
              <View className="absolute top-16 left-20 w-2 h-2 bg-lime-500 rounded-full" />
              <View className="absolute bottom-12 right-8 w-2 h-2 bg-lime-500 rounded-full" />
              <View className="absolute bottom-8 left-10 w-2 h-2 bg-lime-500 rounded-full" />
            </View>
            <MaterialIcons name="map" size={32} color="#84CC16" />
            <Text className="text-lime-700 font-medium mt-1">Ver quadras perto de você</Text>
          </View>
          {/* Map badge */}
          <View className="absolute top-3 left-3 flex-row items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
            <MaterialIcons name="place" size={14} color="#84CC16" />
            <Text className="text-xs font-medium text-neutral-700 ml-1">{courts.length || 12} quadras perto</Text>
          </View>
          {/* Open map button */}
          <View className="absolute bottom-3 right-3 bg-black px-3 py-1.5 rounded-full flex-row items-center">
            <Text className="text-xs font-medium text-white mr-1">Abrir mapa</Text>
            <MaterialIcons name="chevron-right" size={14} color="#fff" />
          </View>
        </Pressable>

        {/* Your Ranking Bar */}
        <Pressable
          onPress={() => router.push('/rankings' as any)}
          className="mx-5 mb-4 bg-neutral-900 rounded-2xl p-3 flex-row items-center"
        >
          <Text className="text-xl font-black text-white mr-3">7</Text>
          <View className="w-10 h-10 bg-neutral-700 rounded-full items-center justify-center">
            <MaterialIcons name="person" size={20} color="#A3A3A3" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-white">Você</Text>
            <Text className="text-sm text-neutral-400">{profile?.xp || 890} pts</Text>
          </View>
          <View className="flex-row items-center bg-lime-500/20 px-2 py-1 rounded-full">
            <MaterialIcons name="arrow-upward" size={14} color="#84CC16" />
            <Text className="text-sm font-bold text-lime-400 ml-0.5">2</Text>
          </View>
        </Pressable>

        {/* Melhores da Região - TOP */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-1">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="star" size={18} color="#000" />
              <Text className="text-base font-bold text-black">Melhores da região</Text>
            </View>
            <Pressable onPress={() => router.push('/courts' as any)}>
              <Text className="text-sm text-neutral-500">Ver todas</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-neutral-500 px-5 mb-3">Top avaliadas em {selectedCity} - Centro</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5"
            contentContainerStyle={{ gap: 12 }}
          >
            {MELHORES_REGIAO.map((court) => (
              <Pressable
                key={court.id}
                onPress={() => router.push(`/court/${court.id}` as any)}
                className="w-44 bg-white rounded-2xl border border-neutral-200 overflow-hidden"
              >
                <View className="h-24 bg-neutral-200 items-center justify-center relative">
                  <MaterialIcons name="image" size={32} color="#A3A3A3" />
                  <View className="absolute top-2 left-2 px-2 py-0.5 bg-black rounded-full flex-row items-center">
                    <MaterialIcons name="star" size={10} color="#fff" />
                    <Text className="text-[10px] font-bold text-white ml-0.5">{court.rating}</Text>
                  </View>
                  {court.badge && (
                    <View className="absolute top-2 right-2 px-2 py-0.5 bg-white rounded-full">
                      <Text className="text-[10px] font-medium text-black">{court.badge}</Text>
                    </View>
                  )}
                </View>
                <View className="p-2.5">
                  <Text className="font-semibold text-black text-sm" numberOfLines={1}>{court.name}</Text>
                  <Text className="text-[11px] text-neutral-500">{court.neighborhood} · {court.distance}</Text>
                  <View className="flex-row items-center justify-between mt-1.5">
                    <View className="flex-row items-center gap-0.5">
                      <MaterialIcons name="rate-review" size={12} color="#A3A3A3" />
                      <Text className="text-[10px] text-neutral-500">{court.reviews} aval.</Text>
                    </View>
                    <Text className="text-xs font-bold text-black">R$ {court.price}/h</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Você pode gostar - TOP */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-1">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="auto-awesome" size={18} color="#000" />
              <Text className="text-base font-bold text-black">Você pode gostar</Text>
            </View>
            <Pressable onPress={() => router.push('/courts' as any)}>
              <Text className="text-sm text-neutral-500">Ver todas</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-neutral-500 px-5 mb-3">Baseado no seu perfil e histórico</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5"
            contentContainerStyle={{ gap: 12 }}
          >
            {VOCE_PODE_GOSTAR.map((court) => (
              <Pressable
                key={court.id}
                onPress={() => router.push(`/court/${court.id}` as any)}
                className="w-44 bg-white rounded-2xl border border-neutral-200 overflow-hidden"
              >
                <View className="h-24 bg-neutral-200 items-center justify-center relative">
                  <MaterialIcons name="image" size={32} color="#A3A3A3" />
                  <View className="absolute top-2 left-2 px-2 py-0.5 bg-black rounded-full">
                    <Text className="text-[10px] font-bold text-white">{court.type}</Text>
                  </View>
                  <View className="absolute bottom-2 left-2 px-2 py-0.5 bg-white rounded-full flex-row items-center">
                    <MaterialIcons name="thumb-up" size={10} color="#22C55E" />
                    <Text className="text-[10px] font-medium text-black ml-0.5">{court.match}% match</Text>
                  </View>
                </View>
                <View className="p-2.5">
                  <Text className="font-semibold text-black text-sm" numberOfLines={1}>{court.name}</Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <MaterialIcons name="star" size={12} color="#000" />
                    <Text className="text-[11px] text-black font-medium">{court.rating}</Text>
                    <Text className="text-[11px] text-neutral-500">· {court.sport}</Text>
                  </View>
                  <Text className="text-[10px] text-neutral-500 mt-1">{court.reason}</Text>
                  {court.price && (
                    <Text className="text-xs font-bold text-black mt-1">R$ {court.price}/h</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>







        {/* Seus Esportes */}
        <View className="mb-4">
          <View className="flex-row items-center gap-1 px-5 mb-3">
            <Text className="text-sm font-medium text-neutral-500">Seus esportes</Text>
            <MaterialIcons name="info-outline" size={14} color="#A3A3A3" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5"
            contentContainerStyle={{ gap: 8 }}
          >
            {['BeachTennis', 'Padel', 'Futebol', 'Tênis'].map((sport) => (
              <Pressable
                key={sport}
                onPress={() => setSelectedSport(selectedSport === sport ? null : sport)}
                className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full ${selectedSport === sport || userSports.includes(sport)
                    ? 'bg-black'
                    : 'bg-white border border-neutral-200'
                  }`}
              >
                <MaterialIcons
                  name={sport === 'Futebol' ? 'sports-soccer' : 'sports-tennis'}
                  size={18}
                  color={selectedSport === sport || userSports.includes(sport) ? '#fff' : '#525252'}
                />
                <Text
                  className={`text-sm font-medium ${selectedSport === sport || userSports.includes(sport) ? 'text-white' : 'text-neutral-700'
                    }`}
                >
                  {sport}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Seu Progresso Card */}
        <Pressable
          onPress={() => router.push('/achievements' as any)}
          className="mx-5 mb-4 bg-neutral-900 rounded-2xl p-5 overflow-hidden"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="emoji-events" size={20} color="#F59E0B" />
              <Text className="text-lg font-bold text-white">Seu Progresso</Text>
            </View>
            <View className="px-3 py-1.5 bg-amber-500 rounded-full">
              <Text className="text-xs font-bold text-black">NÍVEL {gamification.level}</Text>
            </View>
          </View>

          {/* XP Progress */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base text-white">{gamification.xp.toLocaleString()} XP</Text>
            <Text className="text-base text-neutral-400">{gamification.xpToNext.toLocaleString()} XP</Text>
          </View>
          <View className="h-2 bg-neutral-700 rounded-full overflow-hidden mb-2">
            <View
              className="h-full bg-lime-500 rounded-full"
              style={{ width: `${(gamification.xp / gamification.xpToNext) * 100}%` }}
            />
          </View>
          <Text className="text-sm text-neutral-400 mb-4">
            {(gamification.xpToNext - gamification.xp).toLocaleString()} XP para o próximo nível
          </Text>

          {/* Stats Row */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 bg-neutral-800 rounded-xl p-3 mr-2 items-center">
              <Text className="text-2xl font-black text-white">127</Text>
              <Text className="text-xs text-neutral-400">Partidas</Text>
            </View>
            <View className="flex-1 bg-neutral-800 rounded-xl p-3 mx-1 items-center">
              <Text className="text-2xl font-black text-white">68%</Text>
              <Text className="text-xs text-neutral-400">Vitórias</Text>
            </View>
            <View className="flex-1 bg-neutral-800 rounded-xl p-3 ml-2 items-center">
              <Text className="text-2xl font-black text-white">{gamification.streak}</Text>
              <Text className="text-xs text-neutral-400">Sequência</Text>
            </View>
          </View>
        </Pressable>

        {/* Daily Challenge - Blue gradient */}
        <Pressable
          onPress={() => router.push('/challenges' as any)}
          className="mx-5 mb-6 rounded-2xl overflow-hidden"
        >
          <LinearGradient
            colors={['#38BDF8', '#0EA5E9', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-4"
          >
            {/* Header Row */}
            <View className="flex-row items-start mb-2">
              {/* Icon Box */}
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
              >
                <MaterialIcons name="bolt" size={26} color="#fff" />
              </View>
              {/* Title and XP */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-white">Desafio Diário</Text>
                  <View className="px-3 py-1 bg-white/20 rounded-lg">
                    <Text className="text-sm font-bold text-white">+150 XP</Text>
                  </View>
                </View>
                <Text className="text-white/90 text-sm mt-1" numberOfLines={2}>
                  {activeChallenge?.challenge?.description || 'Jogue 2 partidas hoje para completar o desafio!'}
                </Text>
              </View>
            </View>

            {/* Progress bar with counter */}
            <View className="flex-row items-center mt-2">
              <View className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden mr-3">
                <View
                  className="h-full bg-white rounded-full"
                  style={{ width: `${((activeChallenge?.progress || 1) / (activeChallenge?.challenge?.target || 2)) * 100}%` }}
                />
              </View>
              <Text className="text-base font-bold text-white">
                {activeChallenge?.progress || 1}/{activeChallenge?.challenge?.target || 2}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Jogos Acontecendo - List format */}
        <View className="mx-5 mb-6 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-lime-500 rounded-full" />
              <Text className="text-base font-bold text-black">Jogos acontecendo</Text>
            </View>
            <Pressable onPress={() => router.push('/social' as any)}>
              <Text className="text-sm text-neutral-500">Ver todos</Text>
            </Pressable>
          </View>

          {JOGOS_ACONTECENDO.map((game, idx) => (
            <Pressable
              key={game.id}
              onPress={() => router.push(`/match/${game.id}` as any)}
              className={`flex-row items-center p-4 ${idx < JOGOS_ACONTECENDO.length - 1 ? 'border-b border-neutral-100' : ''}`}
            >
              <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center">
                <MaterialIcons name={game.icon as any} size={24} color="#525252" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-black">{game.sport} · {game.time}</Text>
                <Text className="text-sm text-neutral-500">{game.location} · Falta {game.spotsLeft}</Text>
              </View>
              <Pressable className="px-4 py-2 bg-lime-500 rounded-xl">
                <Text className="text-sm font-semibold text-lime-950">Entrar</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>

        {/* Convites para você */}
        <InvitesSection
          invites={invitesForSection}
          onJoin={(inviteId) => {
            const invite = invitesForSection.find((i) => i.id === inviteId);
            if (invite) {
              setSelectedInvite(invite);
              setShowCheckInModal(true);
            }
          }}
        />

        {/* Desafios da Semana */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="flag" size={18} color="#000" />
              <Text className="text-base font-bold text-black">Desafios da Semana</Text>
            </View>
            <Pressable onPress={() => router.push('/challenges' as any)}>
              <Text className="text-sm text-neutral-500">Ver todos</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5"
            contentContainerStyle={{ gap: 12 }}
          >
            {DESAFIOS_SEMANA.map((challenge) => (
              <Pressable
                key={challenge.id}
                onPress={() => router.push('/challenges' as any)}
                className="w-52 bg-white rounded-2xl border border-neutral-200 p-4"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: challenge.color }}>
                    <MaterialIcons name={challenge.icon as any} size={24} color="#fff" />
                  </View>
                  <View className="px-2 py-1 bg-neutral-100 rounded-full">
                    <Text className="text-xs font-bold text-neutral-700">+{challenge.xp} XP</Text>
                  </View>
                </View>
                <Text className="font-bold text-black">{challenge.title}</Text>
                <Text className="text-sm text-neutral-500 mb-3">{challenge.description}</Text>
                {challenge.completed ? (
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="check-circle" size={16} color="#22C55E" />
                    <Text className="text-sm font-semibold text-green-600">Completado!</Text>
                  </View>
                ) : (
                  <>
                    <View className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-1">
                      <View
                        className="h-full rounded-full"
                        style={{ width: `${(challenge.progress / challenge.target) * 100}%`, backgroundColor: challenge.color }}
                      />
                    </View>
                    <Text className="text-xs text-neutral-500">{challenge.progress}/{challenge.target} partidas</Text>
                  </>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Conquistas Recentes */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="emoji-events" size={18} color="#000" />
              <Text className="text-base font-bold text-black">Conquistas Recentes</Text>
            </View>
            <Pressable onPress={() => router.push('/achievements' as any)}>
              <Text className="text-sm text-neutral-500">Ver todas</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5"
            contentContainerStyle={{ gap: 12 }}
          >
            {CONQUISTAS_RECENTES.map((achievement) => (
              <Pressable
                key={achievement.id}
                onPress={() => router.push('/achievements' as any)}
                className="items-center"
              >
                <View className="relative">
                  <View className="w-16 h-16 rounded-2xl items-center justify-center" style={{ backgroundColor: achievement.color }}>
                    {achievement.isNumber ? (
                      <Text className="text-xl font-black text-white">{achievement.icon}</Text>
                    ) : (
                      <MaterialIcons name={achievement.icon as any} size={28} color="#fff" />
                    )}
                  </View>
                  {achievement.isNew && (
                    <View className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 rounded">
                      <Text className="text-[9px] font-bold text-white">NOVO</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm font-semibold text-black mt-2">{achievement.title}</Text>
                <Text className="text-xs text-neutral-500">{achievement.description}</Text>
              </Pressable>
            ))}
            {/* Locked achievements */}
            {[1, 2].map((i) => (
              <View key={`locked-${i}`} className="items-center">
                <View className="w-16 h-16 rounded-2xl items-center justify-center bg-neutral-200">
                  <MaterialIcons name="lock" size={24} color="#A3A3A3" />
                </View>
                <Text className="text-sm font-semibold text-neutral-400 mt-2">???</Text>
                <Text className="text-xs text-neutral-400">Em breve</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Ranking Semanal */}
        <View className="mx-5 mb-6 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="leaderboard" size={18} color="#F59E0B" />
              <Text className="text-base font-bold text-black">Ranking Semanal</Text>
            </View>
            <Text className="text-sm text-neutral-500">BeachTennis</Text>
          </View>

          {RANKING_SEMANAL.map((player, idx) => (
            <View
              key={player.position}
              className={`flex-row items-center p-4 ${player.isTop ? 'bg-amber-50' : ''} ${idx < RANKING_SEMANAL.length - 1 ? 'border-b border-neutral-100' : ''}`}
            >
              <Text className={`text-xl font-bold w-8 ${player.isTop ? 'text-amber-500' : 'text-neutral-400'}`}>
                {player.position}
              </Text>
              <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
                <MaterialIcons name="person-outline" size={20} color="#737373" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-black">{player.name}</Text>
                <Text className="text-sm text-neutral-500">{player.points.toLocaleString()} pts</Text>
              </View>
              {player.isTop && <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />}
            </View>
          ))}

          {/* User position */}
          <View className="flex-row items-center p-4 bg-neutral-900">
            <Text className="text-xl font-bold w-8 text-white">7</Text>
            <View className="w-10 h-10 bg-neutral-700 rounded-full items-center justify-center">
              <MaterialIcons name="person-outline" size={20} color="#fff" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-white">Você</Text>
              <Text className="text-sm text-neutral-400">890 pts</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="arrow-upward" size={16} color="#22C55E" />
              <Text className="text-sm font-semibold text-green-400">2</Text>
            </View>
          </View>
        </View>

        {/* Quadras perto de você */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="near-me" size={18} color="#000" />
              <Text className="text-base font-bold text-black">Quadras perto de você</Text>
            </View>
            <Pressable onPress={() => router.push('/map')}>
              <Text className="text-sm text-neutral-500">Ver mapa</Text>
            </Pressable>
          </View>

          {courtsLoading ? (
            <View className="h-48 items-center justify-center">
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : courts.length === 0 ? (
            <View className="mx-5 p-6 bg-white rounded-2xl border border-neutral-200 items-center">
              <MaterialIcons name="location-off" size={32} color="#A3A3A3" />
              <Text className="text-sm text-neutral-500 mt-2">Nenhuma quadra encontrada</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-5"
              contentContainerStyle={{ gap: 12 }}
            >
              {courts.slice(0, 5).map((court: Court) => (
                <Pressable
                  key={court.id}
                  onPress={() => router.push(`/court/${court.id}` as any)}
                  className="w-64 bg-white rounded-2xl border border-neutral-200 overflow-hidden"
                >
                  <View className="h-32 bg-neutral-200 items-center justify-center">
                    <MaterialIcons name="image" size={40} color="#A3A3A3" />
                  </View>
                  <View className="p-3">
                    <Text className="font-semibold text-black" numberOfLines={1}>{court.name}</Text>
                    <Text className="text-xs text-neutral-500 mt-0.5">{court.sport} • {court.city}</Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-sm font-bold text-green-600">
                        {court.is_free ? 'Gratuita' : `R$ ${court.price_per_hour}/h`}
                      </Text>
                      <View className="flex-row items-center gap-0.5">
                        <MaterialIcons name="star" size={14} color="#000" />
                        <Text className="text-xs font-medium text-black">{court.rating || '—'}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Jogadores para convidar */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-base font-bold text-black">Jogadores para convidar</Text>
            <Pressable onPress={() => router.push('/players' as any)}>
              <Text className="text-sm text-neutral-500">Ver todos</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5"
            contentContainerStyle={{ gap: 12 }}
          >
            {playersToInvite.map((player) => (
              <View key={player.id} className="w-36 bg-white rounded-2xl border border-neutral-200 p-4 items-center">
                <View className="relative">
                  <View className="w-14 h-14 bg-neutral-200 rounded-full items-center justify-center">
                    <MaterialIcons name="person-outline" size={28} color="#737373" />
                  </View>
                  {player.online && (
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </View>
                <Text className="font-semibold text-black mt-2">{player.name}</Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <MaterialIcons name="sports-tennis" size={12} color="#A3A3A3" />
                  <Text className="text-xs text-neutral-500">{player.sport}</Text>
                </View>
                <Text className="text-xs text-neutral-400 mt-0.5">{player.status}</Text>
                <Pressable className="mt-3 w-full py-2 bg-black rounded-xl items-center">
                  <Text className="text-sm font-semibold text-white">Convidar</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Open Matches */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-base font-bold text-black">Partidas abertas</Text>
            <Pressable onPress={() => router.push('/social')}>
              <Text className="text-sm text-neutral-500">Ver todas</Text>
            </Pressable>
          </View>

          {matchesLoading ? (
            <View className="h-32 items-center justify-center">
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : matches.length === 0 ? (
            <View className="mx-5 p-6 bg-white rounded-2xl border border-neutral-200 items-center">
              <MaterialIcons name="sports-tennis" size={32} color="#A3A3A3" />
              <Text className="text-sm text-neutral-500 mt-2">Nenhuma partida disponível</Text>
              <Pressable
                onPress={() => router.push('/match/create' as any)}
                className="mt-3 px-4 py-2 bg-black rounded-xl"
              >
                <Text className="text-sm font-medium text-white">Criar partida</Text>
              </Pressable>
            </View>
          ) : (
            <View className="px-5 gap-3">
              {matches.slice(0, 3).map((match: Match) => (
                <Pressable
                  key={match.id}
                  onPress={() => router.push(`/match/${match.id}` as any)}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 flex-row items-center"
                >
                  <View className="w-12 h-12 bg-lime-100 rounded-xl items-center justify-center">
                    <MaterialIcons name="sports-tennis" size={24} color="#84CC16" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-black">{match.title}</Text>
                    <Text className="text-xs text-neutral-500 mt-0.5">
                      {new Date(match.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} • {match.start_time?.slice(0, 5)}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1.5">
                      <View className="flex-row items-center gap-1 px-2 py-0.5 bg-neutral-100 rounded-full">
                        <MaterialIcons name="group" size={12} color="#525252" />
                        <Text className="text-xs text-neutral-600">{match.current_players}/{match.max_players}</Text>
                      </View>
                    </View>
                  </View>
                  {match.current_players < match.max_players && (
                    <Pressable className="px-4 py-2 bg-black rounded-xl">
                      <Text className="text-sm font-semibold text-white">Entrar</Text>
                    </Pressable>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Descubra novos esportes - MOVED TO BOTTOM */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-1">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="explore" size={18} color="#000" />
              <Text className="text-base font-bold text-black">Descubra novos esportes</Text>
            </View>
          </View>
          <Text className="text-sm text-neutral-500 px-5 mb-3">Experimente algo diferente</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5"
            contentContainerStyle={{ gap: 12 }}
          >
            {NOVOS_ESPORTES.map((sport) => (
              <Pressable
                key={sport.id}
                onPress={() => router.push(`/search?sport=${sport.name}` as any)}
                className="w-32 bg-white rounded-2xl border border-neutral-200 p-3 items-center"
              >
                <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mb-2">
                  <MaterialIcons name={sport.icon as any} size={24} color="#525252" />
                </View>
                <Text className="font-bold text-black text-sm">{sport.name}</Text>
                <Text className="text-[10px] text-neutral-500">{sport.courts} quadras perto</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
            <Text className="text-lg font-bold text-black">Selecionar Localização</Text>
            <Pressable onPress={() => setShowLocationModal(false)}>
              <MaterialIcons name="close" size={24} color="#000" />
            </Pressable>
          </View>

          {/* Search with autocomplete */}
          <View className="px-5 py-4">
            <CityAutocomplete
              value={selectedCity}
              onSelect={(city) => {
                setSelectedCity(city.name);
                setShowLocationModal(false);
              }}
              placeholder="Buscar cidade..."
            />
          </View>

          {/* Use current location */}
          <Pressable
            onPress={getCurrentLocation}
            disabled={loadingLocation}
            className="flex-row items-center gap-3 px-5 py-4 border-b border-neutral-100"
          >
            <View className="w-10 h-10 bg-lime-100 rounded-full items-center justify-center">
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#84CC16" />
              ) : (
                <MaterialIcons name="my-location" size={20} color="#84CC16" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-black">Usar localização atual</Text>
              <Text className="text-sm text-neutral-500">Ativar GPS para encontrar quadras próximas</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>

          {/* Popular Cities */}
          <Text className="px-5 pt-4 pb-2 text-sm font-medium text-neutral-500">Cidades populares</Text>
          <FlatList
            data={CITIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedCity(item.name);
                  setShowLocationModal(false);
                }}
                className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-50"
              >
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="place" size={20} color="#737373" />
                  <Text className="text-base text-black">{item.name}</Text>
                  <Text className="text-sm text-neutral-400">{item.state}</Text>
                </View>
                {selectedCity === item.name && (
                  <MaterialIcons name="check" size={20} color="#84CC16" />
                )}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Check-in Modal */}
      {selectedInvite && (
        <CheckInModal
          visible={showCheckInModal}
          onClose={() => {
            setShowCheckInModal(false);
            setSelectedInvite(null);
          }}
          onConfirm={async () => {
            // TODO: Update database with check-in
            console.log('Check-in confirmed for invite:', selectedInvite.id);
          }}
          matchInfo={{
            title: selectedInvite.message || 'Partida de Beach Tennis',
            location: selectedInvite.location,
            dateTime: selectedInvite.dateTime,
            hostName: selectedInvite.senderName,
            sport: 'Beach Tennis',
            currentPlayers: selectedInvite.participantsCount,
            maxPlayers: selectedInvite.maxParticipants,
          }}
        />
      )}

      {isActive && <CoachOverlay screen="home" />}
    </SafeAreaView>
  );
}
