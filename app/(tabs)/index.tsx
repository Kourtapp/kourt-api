import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useCourts, useMatches, useChallenges, useNearbyCourts } from '@/hooks';
import { Court, Match } from '@/types/database.types';
import { CoachOverlay } from '@/components/coach-marks/CoachOverlay';
import { useCoachStore } from '@/stores/useCoachStore';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { InvitesSection } from '@/components/home/InvitesSection';
import { CityAutocomplete } from '@/components/inputs/CityAutocomplete';
import { CheckInModal } from '@/components/modals/CheckInModal';
import { CourtCard } from '@/components/cards/CourtCard';
import { notificationService } from '@/services/notificationService';

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

// Initial games happening now
const INITIAL_JOGOS = [
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
  { id: '4', name: 'Squash', icon: 'sports-tennis', courts: 5 },
  { id: '5', name: 'Badminton', icon: 'sports-tennis', courts: 7 },
  { id: '6', name: 'Futsal', icon: 'sports-soccer', courts: 15 },
  { id: '7', name: 'Basquete', icon: 'sports-basketball', courts: 10 },
  { id: '8', name: 'Tênis de Mesa', icon: 'sports-tennis', courts: 6 },
  { id: '9', name: 'Rugby', icon: 'sports-rugby', courts: 2 },
  { id: '10', name: 'Hockey', icon: 'sports-hockey', courts: 3 },
];

// Mock best courts in region
const MELHORES_REGIAO = [
  { id: '1', name: 'Arena BeachPremium', neighborhood: 'Moema', distance: '4.5 km', rating: 4.9, reviews: 247, price: 180, type: 'privada' },
  { id: '2', name: 'Padel Club Jardins', neighborhood: 'Jardins', distance: '3.2 km', rating: 4.8, reviews: 189, price: 150, type: 'particular' },
  { id: '3', name: 'Quadra do Ibirapuera', neighborhood: 'Ibirapuera', distance: '2.1 km', rating: 4.7, reviews: 312, price: 0, type: 'publica' },
  { id: '4', name: 'Tennis Club SP', neighborhood: 'Pinheiros', distance: '5.8 km', rating: 4.9, reviews: 156, price: 200, type: 'privada' },
  { id: '5', name: 'Praça da República', neighborhood: 'Centro', distance: '1.5 km', rating: 4.3, reviews: 89, price: 0, type: 'publica' },
  { id: '6', name: 'Beach House Arena', neighborhood: 'Vila Olímpia', distance: '6.2 km', rating: 4.6, reviews: 203, price: 160, type: 'particular' },
];

// Mock personalized recommendations
const VOCE_PODE_GOSTAR = [
  { id: '1', name: 'Quadra do Carlos', sport: 'Beach Tennis', rating: 5.0, type: 'particular', price: 80, reason: 'Mesmo nível' },
  { id: '2', name: 'BeachArena', sport: 'Beach Tennis', rating: 4.7, type: 'privada', price: 120, reason: '3 amigos jogaram' },
  { id: '3', name: 'Parque Villa-Lobos', sport: 'Vôlei', rating: 4.5, type: 'publica', price: 0, reason: 'Perto de você' },
  { id: '4', name: 'Sunset Padel', sport: 'Padel', rating: 4.8, type: 'privada', price: 140, reason: 'Top avaliada' },
  { id: '5', name: 'Quadra Municipal', sport: 'Futebol', rating: 4.2, type: 'publica', price: 0, reason: 'Gratuita' },
  { id: '6', name: 'Casa do Ténis', sport: 'Tênis', rating: 4.9, type: 'particular', price: 90, reason: 'Seu esporte favorito' },
];

// Shuffle array function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function HomeScreen() {
  const { user, profile } = useAuthStore();
  const { unreadCount, addNotification } = useNotificationStore();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedCourtType, setSelectedCourtType] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Carregando...');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [shuffledSports, setShuffledSports] = useState(() => shuffleArray(NOVOS_ESPORTES));
  const [shuffledCourts, setShuffledCourts] = useState(() => shuffleArray(MELHORES_REGIAO));
  const [shuffledRecommendations, setShuffledRecommendations] = useState(() => shuffleArray(VOCE_PODE_GOSTAR));
  const [refreshing, setRefreshing] = useState(false);
  const { hasSeenTutorial, isActive, checkTutorialStatus, startTutorial } =
    useCoachStore();

  // Refresh suggestions on pull to refresh or when feed updates
  const refreshSuggestions = useCallback(() => {
    setShuffledSports(shuffleArray(NOVOS_ESPORTES));
    setShuffledCourts(shuffleArray(MELHORES_REGIAO));
    setShuffledRecommendations(shuffleArray(VOCE_PODE_GOSTAR));
  }, []);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshSuggestions();
    // Small delay to show the refresh indicator
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  }, [refreshSuggestions]);

  // Auto-detect location on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          setSelectedCity('São Paulo');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address?.city) {
          setSelectedCity(address.city);
        } else if (address?.subregion) {
          setSelectedCity(address.subregion);
        } else {
          setSelectedCity('São Paulo');
        }
      } catch {
        setSelectedCity('São Paulo');
      }
    };

    detectLocation();
  }, []);

  useEffect(() => {
    checkTutorialStatus();
  }, [checkTutorialStatus]);

  useEffect(() => {
    if (!hasSeenTutorial && !isActive) {
      const timer = setTimeout(() => {
        startTutorial();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial, isActive, startTutorial]);

  const { courts, loading: courtsLoading } = useCourts(
    selectedSport ? { sport: selectedSport } : undefined,
  );
  const { matches, loading: matchesLoading } = useMatches(
    selectedSport ? { sport: selectedSport } : undefined,
  );
  const { userChallenges } = useChallenges(user?.id);

  // Nearby courts based on user location
  const { courts: nearbyCourts, loading: nearbyLoading } = useNearbyCourts(
    userCoords?.latitude,
    userCoords?.longitude,
    15, // 15km radius
  );

  // Get current location
  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingLocation(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Update coordinates for nearby courts
      setUserCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address?.city) {
        setSelectedCity(address.city);
      } else if (address?.subregion) {
        setSelectedCity(address.subregion);
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

  // Filtered courts based on sport and court type
  const filteredCourts = useMemo(() => {
    return shuffledCourts.filter((court) => {
      // Filter by court type
      if (selectedCourtType && court.type !== selectedCourtType) return false;
      return true;
    });
  }, [shuffledCourts, selectedCourtType]);

  const filteredRecommendations = useMemo(() => {
    return shuffledRecommendations.filter((court) => {
      // Filter by sport
      if (selectedSport && court.sport !== selectedSport) return false;
      // Filter by court type
      if (selectedCourtType && court.type !== selectedCourtType) return false;
      return true;
    });
  }, [shuffledRecommendations, selectedSport, selectedCourtType]);

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

  // Games happening now - state so we can remove after joining
  const [jogosAcontecendo, setJogosAcontecendo] = useState(INITIAL_JOGOS);

  // Mock invites formatted for InvitesSection
  const [invites, setInvites] = useState([
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
  ]);

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        bounces={true}
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
            colors={['#000']}
          />
        }
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
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <Pressable
          onPress={() => router.push('/(tabs)/map')}
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

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 mb-6"
          contentContainerStyle={{ gap: 8 }}
        >
          {/* All filter */}
          <Pressable
            onPress={() => {
              setSelectedSport(null);
              setSelectedCourtType(null);
            }}
            className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full ${
              selectedSport === null && selectedCourtType === null
                ? 'bg-black'
                : 'bg-white border border-neutral-200'
            }`}
          >
            <MaterialIcons
              name="apps"
              size={18}
              color={selectedSport === null && selectedCourtType === null ? '#fff' : '#525252'}
            />
            <Text
              className={`text-sm font-medium ${
                selectedSport === null && selectedCourtType === null ? 'text-white' : 'text-neutral-700'
              }`}
            >
              Todos
            </Text>
          </Pressable>

          {/* Court Types */}
          {[
            { id: 'publica', label: 'Públicas', icon: 'park' },
            { id: 'privada', label: 'Privadas', icon: 'business' },
            { id: 'particular', label: 'Particulares', icon: 'home' },
          ].map((type) => (
            <Pressable
              key={type.id}
              onPress={() => setSelectedCourtType(selectedCourtType === type.id ? null : type.id)}
              className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full ${
                selectedCourtType === type.id
                  ? 'bg-lime-500'
                  : 'bg-white border border-neutral-200'
              }`}
            >
              <MaterialIcons
                name={type.icon as any}
                size={18}
                color={selectedCourtType === type.id ? '#1a2e05' : '#525252'}
              />
              <Text
                className={`text-sm font-medium ${
                  selectedCourtType === type.id ? 'text-lime-950' : 'text-neutral-700'
                }`}
              >
                {type.label}
              </Text>
            </Pressable>
          ))}

          {/* Separator */}
          <View className="w-px h-8 bg-neutral-200 self-center mx-1" />

          {/* Sports */}
          {['Beach Tennis', 'Padel', 'Futebol', 'Tênis', 'Vôlei', 'Basquete'].map((sport) => (
            <Pressable
              key={sport}
              onPress={() => setSelectedSport(selectedSport === sport ? null : sport)}
              className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full ${
                selectedSport === sport
                  ? 'bg-black'
                  : 'bg-white border border-neutral-200'
              }`}
            >
              <MaterialIcons
                name={
                  sport === 'Futebol' ? 'sports-soccer' :
                  sport === 'Basquete' ? 'sports-basketball' :
                  sport === 'Vôlei' ? 'sports-volleyball' :
                  'sports-tennis'
                }
                size={18}
                color={selectedSport === sport ? '#fff' : '#525252'}
              />
              <Text
                className={`text-sm font-medium ${
                  selectedSport === sport ? 'text-white' : 'text-neutral-700'
                }`}
              >
                {sport}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Melhores da Região - Airbnb Style */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-1">
            <Text className="text-lg font-bold text-black">Melhores da região</Text>
            <Pressable onPress={() => router.push('/courts' as any)}>
              <Text className="text-sm font-medium text-neutral-500">Ver todas</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-neutral-500 px-5 mb-4">Top avaliadas em {selectedCity}</Text>

          {filteredCourts.length === 0 ? (
            <View className="mx-5 p-6 bg-white rounded-2xl border border-neutral-200 items-center">
              <MaterialIcons name="search-off" size={32} color="#A3A3A3" />
              <Text className="text-sm text-neutral-500 mt-2">Nenhuma quadra encontrada</Text>
              <Text className="text-xs text-neutral-400">Tente ajustar os filtros</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-5"
              contentContainerStyle={{ gap: 16 }}
            >
              {filteredCourts.map((court) => (
                <CourtCard
                  key={court.id}
                  id={court.id}
                  name={court.name}
                  sport="Beach Tennis"
                  location={`${court.neighborhood} · ${court.distance}`}
                  rating={court.rating}
                  reviewCount={court.reviews}
                  pricePerHour={court.price || undefined}
                  isFree={court.price === 0}
                  courtType={court.type as 'publica' | 'privada' | 'particular'}
                  onPress={() => router.push(`/court/${court.id}` as any)}
                  size="medium"
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Você pode gostar - Airbnb Style */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-5 mb-1">
            <Text className="text-lg font-bold text-black">Feito para você</Text>
            <Pressable onPress={() => router.push('/courts' as any)}>
              <Text className="text-sm font-medium text-neutral-500">Ver todas</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-neutral-500 px-5 mb-4">Baseado no seu perfil e histórico</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5"
            contentContainerStyle={{ gap: 16 }}
          >
            {filteredRecommendations.map((court) => (
              <CourtCard
                key={court.id}
                id={court.id}
                name={court.name}
                sport={court.sport}
                location={court.reason}
                rating={court.rating}
                pricePerHour={court.price || undefined}
                isFree={court.price === 0}
                courtType={court.type as 'publica' | 'privada' | 'particular'}
                onPress={() => router.push(`/court/${court.id}` as any)}
                size="medium"
              />
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
        <View className="mx-5 mb-6">
          <Pressable
            onPress={() => router.push('/challenges' as any)}
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={['#38BDF8', '#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 16, paddingVertical: 14 }}
            >
              {/* Header Row */}
              <View className="flex-row items-center">
                {/* Icon Box */}
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}
                >
                  <MaterialIcons name="bolt" size={22} color="#fff" />
                </View>
                {/* Title */}
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 }}>Desafio Diário</Text>
                {/* XP Badge */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>+150 XP</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 8 }} numberOfLines={1}>
                {activeChallenge?.challenge?.description || 'Jogue 2 partidas hoje para completar o desafio!'}
              </Text>

              {/* Progress bar with counter */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <View style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden', marginRight: 12 }}>
                  <View
                    style={{
                      height: '100%',
                      backgroundColor: '#fff',
                      borderRadius: 3,
                      width: `${((activeChallenge?.progress || 1) / (activeChallenge?.challenge?.target || 2)) * 100}%`
                    }}
                  />
                </View>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>
                  {activeChallenge?.progress || 1}/{activeChallenge?.challenge?.target || 2}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Jogos Acontecendo - List format */}
        {jogosAcontecendo.length > 0 && (
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

            {jogosAcontecendo.map((game, idx) => (
              <View
                key={game.id}
                className={`flex-row items-center p-4 ${idx < jogosAcontecendo.length - 1 ? 'border-b border-neutral-100' : ''}`}
              >
                <Pressable
                  onPress={() => router.push(`/match/${game.id}` as any)}
                  className="flex-row items-center flex-1"
                >
                  <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center">
                    <MaterialIcons name={game.icon as any} size={24} color="#525252" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-black">{game.sport} · {game.time}</Text>
                    <Text className="text-sm text-neutral-500">{game.location} · Falta {game.spotsLeft}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setSelectedInvite({
                      id: game.id,
                      message: `${game.sport} - Jogo ao vivo`,
                      location: game.location,
                      dateTime: `Hoje, ${game.time}`,
                      senderName: 'Partida Aberta',
                      participantsCount: 4 - game.spotsLeft,
                      maxParticipants: 4,
                    });
                    setShowCheckInModal(true);
                  }}
                  className="px-4 py-2 bg-lime-500 rounded-xl active:bg-lime-600"
                >
                  <Text className="text-sm font-semibold text-lime-950">Entrar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Convites para você */}
        <InvitesSection
          invites={invites}
          onJoin={(inviteId) => {
            const invite = invites.find((i) => i.id === inviteId);
            if (invite) {
              setSelectedInvite(invite);
              setShowCheckInModal(true);
              // Remove invite from list after joining
              setInvites((prev) => prev.filter((i) => i.id !== inviteId));
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

        {/* Quadras perto de você - Airbnb Style */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-5 mb-1">
            <Text className="text-lg font-bold text-black">Quadras perto de você</Text>
            <Pressable onPress={() => router.push('/map')}>
              <Text className="text-sm font-medium text-neutral-500">Ver mapa</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-neutral-500 px-5 mb-4">
            {userCoords ? `Em ${selectedCity} e região` : 'A poucos minutos de distância'}
          </Text>

          {nearbyLoading || (userCoords && nearbyCourts.length === 0 && courtsLoading) ? (
            <View className="h-48 items-center justify-center">
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : (nearbyCourts.length > 0 ? nearbyCourts : courts).length === 0 ? (
            <View className="mx-5 p-6 bg-white rounded-2xl border border-neutral-200 items-center">
              <MaterialIcons name="location-off" size={32} color="#A3A3A3" />
              <Text className="text-sm text-neutral-500 mt-2">Nenhuma quadra encontrada</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-5"
              contentContainerStyle={{ gap: 16 }}
            >
              {(nearbyCourts.length > 0 ? nearbyCourts : courts).slice(0, 5).map((court: Court) => {
                // Map Court.type to courtType
                const getCourtType = () => {
                  if (court.is_free || court.type === 'public') return 'publica';
                  if (court.type === 'private') return 'privada';
                  return 'particular'; // club or others
                };
                return (
                  <CourtCard
                    key={court.id}
                    id={court.id}
                    name={court.name}
                    sport={court.sport}
                    location={court.city}
                    address={court.address}
                    rating={court.rating || undefined}
                    pricePerHour={court.price_per_hour || undefined}
                    isFree={court.is_free}
                    courtType={getCourtType()}
                    onPress={() => router.push(`/court/${court.id}` as any)}
                    size="large"
                  />
                );
              })}
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
                    <Pressable
                      className="px-4 py-2 bg-black rounded-xl"
                      onPress={(e) => {
                        e.stopPropagation();
                        const matchDate = new Date(match.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
                        const matchTime = match.start_time?.slice(0, 5) || '';

                        // Add notification to store
                        addNotification({
                          type: 'match_joined',
                          title: 'Você entrou na partida!',
                          body: `${match.title} - ${matchDate} às ${matchTime}`,
                          data: { matchId: match.id },
                        });

                        // Send push notification
                        notificationService.sendMatchJoinedNotification(
                          match.title,
                          match.location || 'Local a definir',
                          `${matchDate} ${matchTime}`,
                          match.id
                        );

                        // Navigate to match details
                        router.push(`/match/${match.id}` as any);
                      }}
                    >
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
            {shuffledSports.map((sport) => (
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
            try {
              // Remove game from "Jogos acontecendo" list
              setJogosAcontecendo((prev) => prev.filter((g) => g.id !== selectedInvite.id));
              // Remove from invites list if applicable
              setInvites((prev) => prev.filter((i) => i.id !== selectedInvite.id));

              // Add notification to store (updates badge)
              addNotification({
                type: 'match_joined',
                title: 'Você entrou na partida!',
                body: `${selectedInvite.message || 'Partida'} - ${selectedInvite.location} às ${selectedInvite.dateTime}`,
                data: { matchId: selectedInvite.id },
              });

              // Send push notification
              await notificationService.sendMatchJoinedNotification(
                selectedInvite.message || 'Partida',
                selectedInvite.location,
                selectedInvite.dateTime,
                selectedInvite.id
              );

              console.log('Match joined and notification sent:', selectedInvite.id);
            } catch (error) {
              console.error('Error joining match:', error);
            }
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
