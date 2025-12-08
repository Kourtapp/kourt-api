import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useMatches, useCourts, useLocation } from '@/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';

// Sport filters
const SPORT_FILTERS = [
  { id: 'all', label: 'Todos', icon: 'apps' },
  { id: 'Futebol', label: 'Futebol', icon: 'sports-soccer' },
  { id: 'Vôlei', label: 'Vôlei', icon: 'sports-volleyball' },
  { id: 'Beach Tennis', label: 'Beach', icon: 'sports-tennis' },
  { id: 'Futevôlei', label: 'Futevôlei', icon: 'sports-volleyball' },
  { id: 'Tênis', label: 'Tênis', icon: 'sports-tennis' },
  { id: 'Padel', label: 'Padel', icon: 'sports-tennis' },
  { id: 'Basquete', label: 'Basquete', icon: 'sports-basketball' },
];

// Court type filters
const COURT_TYPE_FILTERS = [
  { id: 'all', label: 'Todos', icon: 'apps', color: '#222222', bgColor: '#222222', textColor: '#FFFFFF' },
  { id: 'public', label: 'Públicas', icon: 'park', color: '#22C55E', bgColor: '#FFFFFF', textColor: '#222222' },
  { id: 'private', label: 'Privadas', icon: 'grid-view', color: '#3B82F6', bgColor: '#FFFFFF', textColor: '#222222' },
  { id: 'arena', label: 'Particulares', icon: 'home', color: '#F59E0B', bgColor: '#FFFFFF', textColor: '#222222' },
];

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loadingLiveMatches, setLoadingLiveMatches] = useState(true);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  const { matches, loading: matchesLoading, refetch: refreshMatches } = useMatches({ status: 'open', limit: 10 });
  const { courts, loading: courtsLoading, refetch: refreshCourts } = useCourts({ limit: 10 });
  const { address, isLoading: locationLoading, hasPermission, requestPermission, refreshLocation } = useLocation();

  // Fetch pending invites for the current user
  const fetchPendingInvites = useCallback(async () => {
    if (!profile?.id) {
      setLoadingInvites(false);
      return;
    }
    try {
      setLoadingInvites(true);
      const { data, error } = await supabase
        .from('match_players')
        .select(`
          *,
          match:matches (
            id,
            title,
            sport,
            date,
            time,
            venue,
            location_name,
            max_players,
            current_players,
            organizer:profiles!matches_organizer_id_fkey(id, name, avatar_url, username)
          )
        `)
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPendingInvites(data?.filter(d => d.match) || []);
    } catch (error) {
      console.error('Error fetching pending invites:', error);
    } finally {
      setLoadingInvites(false);
    }
  }, [profile?.id]);

  // Fetch live matches (matches happening today)
  const fetchLiveMatches = useCallback(async () => {
    try {
      setLoadingLiveMatches(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          court:courts(name, neighborhood),
          creator:profiles!matches_created_by_fkey(name, avatar_url)
        `)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString())
        .eq('status', 'open')
        .order('date', { ascending: true })
        .limit(5);

      if (error) throw error;
      setLiveMatches(data || []);
    } catch (error) {
      console.error('Error fetching live matches:', error);
    } finally {
      setLoadingLiveMatches(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveMatches();
    fetchPendingInvites();
  }, [fetchLiveMatches, fetchPendingInvites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshMatches(),
      refreshCourts(),
      fetchLiveMatches(),
      fetchPendingInvites(),
      refreshLocation(),
    ]);
    setRefreshing(false);
  }, [refreshMatches, refreshCourts, fetchLiveMatches, fetchPendingInvites, refreshLocation]);

  // Handle accepting an invite
  const handleAcceptInvite = async (inviteId: string, matchId: string) => {
    try {
      const { error } = await supabase
        .from('match_players')
        .update({ status: 'confirmed' })
        .eq('id', inviteId);

      if (error) throw error;

      // Update current_players count in matches table
      const { data: matchData } = await supabase
        .from('matches')
        .select('current_players')
        .eq('id', matchId)
        .single();

      if (matchData) {
        await supabase
          .from('matches')
          .update({ current_players: (matchData.current_players || 0) + 1 })
          .eq('id', matchId);
      }

      // Refresh invites
      fetchPendingInvites();
      router.push(`/match/${matchId}` as any);
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  // Handle declining an invite
  const handleDeclineInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('match_players')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
      fetchPendingInvites();
    } catch (error) {
      console.error('Error declining invite:', error);
    }
  };

  // Filter courts by type
  const filteredCourts = courts.filter(court => {
    if (selectedFilter === 'all') return true;
    return court.type === selectedFilter;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#222" />
        }
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-4 flex-row items-center justify-between">
          <Text className="text-[22px] font-bold text-[#222222] tracking-tight">KOURT</Text>

          <View className="flex-row items-center gap-3">
            {/* Location */}
            <Pressable
              className="flex-row items-center bg-white border border-[#EBEBEB] rounded-full px-3 py-2"
              onPress={async () => {
                if (!hasPermission) {
                  await requestPermission();
                }
              }}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#22C55E" />
              ) : (
                <>
                  <MaterialIcons
                    name={hasPermission ? "location-on" : "location-off"}
                    size={16}
                    color={hasPermission ? "#22C55E" : "#9CA3AF"}
                  />
                  <Text className="text-sm text-[#222222] ml-1" numberOfLines={1}>
                    {address?.district || address?.city || 'Localização'}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={18} color="#717171" />
                </>
              )}
            </Pressable>

            {/* Notifications */}
            <Pressable onPress={() => router.push('/notifications' as any)} className="relative">
              <MaterialIcons name="notifications-none" size={24} color="#222222" />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-5 mb-4">
          <Pressable
            onPress={() => router.push('/court/search' as any)}
            className="flex-row items-center bg-white border border-[#EBEBEB] rounded-xl px-4 py-3"
          >
            <MaterialIcons name="search" size={20} color="#717171" />
            <Text className="flex-1 ml-2 text-[15px] text-[#9CA3AF]">Buscar quadras, jogadores...</Text>
            <MaterialIcons name="tune" size={20} color="#717171" />
          </Pressable>
        </View>

        {/* Court Type Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          className="mb-3"
        >
          {COURT_TYPE_FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                className={`flex-row items-center px-4 py-2.5 rounded-full border ${isSelected ? 'border-transparent' : 'border-[#EBEBEB]'
                  }`}
                style={{ backgroundColor: isSelected ? filter.bgColor : '#FFFFFF' }}
              >
                <MaterialIcons
                  name={filter.icon as any}
                  size={16}
                  color={isSelected ? (filter.id === 'all' ? '#FFFFFF' : filter.color) : '#717171'}
                />
                <Text
                  className={`ml-2 text-sm font-medium ${isSelected ? (filter.id === 'all' ? 'text-white' : 'text-[#222222]') : 'text-[#717171]'
                    }`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Sport Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          className="mb-6"
        >
          {SPORT_FILTERS.map((sport) => {
            const isSelected = selectedSport === sport.id;
            return (
              <Pressable
                key={sport.id}
                onPress={() => setSelectedSport(sport.id)}
                className={`flex-row items-center px-4 py-2.5 rounded-full border ${isSelected ? 'bg-[#222222] border-[#222222]' : 'bg-white border-[#EBEBEB]'
                  }`}
              >
                <MaterialIcons
                  name={sport.icon as any}
                  size={16}
                  color={isSelected ? '#FFFFFF' : '#717171'}
                />
                <Text
                  className={`ml-2 text-sm font-medium ${isSelected ? 'text-white' : 'text-[#717171]'
                    }`}
                >
                  {sport.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Pending Invites Section */}
        {pendingInvites.length > 0 && (
          <View className="mx-5 mb-6 bg-white border border-[#EBEBEB] rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 bg-[#F59E0B] rounded-full" />
                <Text className="text-base font-semibold text-[#222222]">Convites pendentes</Text>
                <View className="bg-[#F59E0B] px-2 py-0.5 rounded-full ml-1">
                  <Text className="text-[10px] font-bold text-white">{pendingInvites.length}</Text>
                </View>
              </View>
            </View>

            <View className="gap-3">
              {pendingInvites.map((invite) => {
                const match = invite.match;
                const organizer = match?.organizer;
                return (
                  <View
                    key={invite.id}
                    className="bg-[#FAFAFA] rounded-xl p-4 border border-[#EBEBEB]"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-10 h-10 bg-[#F59E0B]/10 rounded-full items-center justify-center">
                          {organizer?.avatar_url ? (
                            <Image source={{ uri: organizer.avatar_url }} className="w-10 h-10 rounded-full" />
                          ) : (
                            <MaterialIcons name="person" size={20} color="#F59E0B" />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-[#222222]" numberOfLines={1}>
                            {organizer?.name || organizer?.username || 'Organizador'}
                          </Text>
                          <Text className="text-xs text-[#717171]">te convidou para uma partida</Text>
                        </View>
                      </View>
                    </View>

                    <View className="bg-white rounded-lg p-3 mb-3 border border-[#EBEBEB]">
                      <Text className="font-semibold text-[#222222]" numberOfLines={1}>
                        {match?.title || match?.sport}
                      </Text>
                      <View className="flex-row items-center gap-4 mt-2">
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="event" size={14} color="#717171" />
                          <Text className="text-xs text-[#717171]">
                            {match?.date ? new Date(match.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : '-'}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="schedule" size={14} color="#717171" />
                          <Text className="text-xs text-[#717171]">{match?.time || '-'}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="people" size={14} color="#717171" />
                          <Text className="text-xs text-[#717171]">
                            {match?.current_players || 0}/{match?.max_players || '-'}
                          </Text>
                        </View>
                      </View>
                      {(match?.venue || match?.location_name) && (
                        <View className="flex-row items-center gap-1 mt-2">
                          <MaterialIcons name="location-on" size={14} color="#717171" />
                          <Text className="text-xs text-[#717171]" numberOfLines={1}>
                            {match?.venue || match?.location_name}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleDeclineInvite(invite.id)}
                        className="flex-1 py-2.5 rounded-lg bg-[#F5F5F5] border border-[#EBEBEB]"
                      >
                        <Text className="text-center text-sm font-medium text-[#717171]">Recusar</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAcceptInvite(invite.id, match?.id)}
                        className="flex-1 py-2.5 rounded-lg bg-[#22C55E]"
                      >
                        <Text className="text-center text-sm font-medium text-white">Aceitar</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Melhores da região */}
        <View className="mb-6">
          <View className="px-5 flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold text-[#222222]">Melhores da região</Text>
            <Pressable onPress={() => router.push('/court/search' as any)}>
              <Text className="text-sm text-[#717171]">Ver todas</Text>
            </Pressable>
          </View>
          <Text className="px-5 text-xs text-[#717171] mb-3">Top avaliadas em São Paulo</Text>

          {courtsLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color="#222" />
            </View>
          ) : filteredCourts.length === 0 ? (
            <View className="mx-5 bg-white border border-[#EBEBEB] rounded-2xl p-6 items-center">
              <MaterialIcons name="sports-tennis" size={40} color="#D1D5DB" />
              <Text className="text-[#717171] text-sm mt-3 text-center">
                Nenhuma quadra encontrada
              </Text>
              <Pressable
                onPress={() => router.push('/court/add' as any)}
                className="mt-4 px-5 py-2.5 bg-[#222222] rounded-xl"
              >
                <Text className="text-white text-sm font-medium">Adicionar quadra</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {filteredCourts.slice(0, 5).map((court) => {
                const typeColors: Record<string, { bg: string; text: string; label: string }> = {
                  public: { bg: '#22C55E', text: '#FFFFFF', label: 'Pública' },
                  private: { bg: '#3B82F6', text: '#FFFFFF', label: 'Privada' },
                  arena: { bg: '#F59E0B', text: '#FFFFFF', label: 'Particular' },
                };
                const typeInfo = typeColors[court.type] || typeColors.arena;

                return (
                  <Pressable
                    key={court.id}
                    onPress={() => router.push(`/court/${court.id}` as any)}
                    className="w-44 bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden"
                  >
                    <View className="h-28 bg-[#F5F5F5] items-center justify-center relative">
                      {court.images && court.images.length > 0 ? (
                        <Image source={{ uri: court.images[0] }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <MaterialIcons name="sports-tennis" size={32} color="#D1D5DB" />
                      )}
                      <View
                        className="absolute top-2 left-2 px-2 py-1 rounded-md"
                        style={{ backgroundColor: typeInfo.bg }}
                      >
                        <Text className="text-[10px] font-semibold" style={{ color: typeInfo.text }}>
                          {typeInfo.label}
                        </Text>
                      </View>
                      <Pressable className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full items-center justify-center">
                        <MaterialIcons name="favorite-border" size={18} color="#717171" />
                      </Pressable>
                    </View>
                    <View className="p-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-semibold text-[#222222] flex-1" numberOfLines={1}>
                          {court.name}
                        </Text>
                        {court.rating && (
                          <View className="flex-row items-center gap-0.5">
                            <MaterialIcons name="star" size={12} color="#222222" />
                            <Text className="text-xs font-medium text-[#222222]">{court.rating.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-[#717171] mt-0.5" numberOfLines={1}>
                        {court.neighborhood || court.city}
                      </Text>
                      <Text className="text-sm font-semibold text-[#222222] mt-1">
                        {court.is_free ? 'Gratuita' : `R$ ${court.price_per_hour}/hora`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Quadras perto de você */}
        <View className="mb-6">
          <View className="px-5 flex-row items-center justify-between mb-1">
            <Text className="text-lg font-semibold text-[#222222]">Quadras perto de você</Text>
            <Pressable onPress={() => router.push('/map' as any)}>
              <Text className="text-sm text-[#717171]">Ver mapa</Text>
            </Pressable>
          </View>
          <Text className="px-5 text-xs text-[#717171] mb-3">A poucos minutos de distância</Text>

          {courtsLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color="#222" />
            </View>
          ) : courts.length === 0 ? (
            <View className="mx-5 bg-white border border-[#EBEBEB] rounded-2xl p-6 items-center">
              <MaterialIcons name="location-off" size={40} color="#D1D5DB" />
              <Text className="text-[#717171] text-sm mt-3 text-center">
                Nenhuma quadra encontrada
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {courts.slice(0, 5).map((court) => (
                <Pressable
                  key={court.id}
                  onPress={() => router.push(`/court/${court.id}` as any)}
                  className="w-44 bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden"
                >
                  <View className="h-28 bg-[#F5F5F5] items-center justify-center">
                    {court.images && court.images.length > 0 ? (
                      <Image source={{ uri: court.images[0] }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <MaterialIcons name="sports-tennis" size={32} color="#D1D5DB" />
                    )}
                  </View>
                  <View className="p-3">
                    <Text className="font-semibold text-[#222222]" numberOfLines={1}>
                      {court.name}
                    </Text>
                    <Text className="text-xs text-[#717171] mt-0.5" numberOfLines={1}>
                      {court.neighborhood || court.city}
                    </Text>
                    <Text className="text-sm font-semibold text-[#222222] mt-1">
                      {court.is_free ? 'Gratuita' : `R$ ${court.price_per_hour}/hora`}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Jogos acontecendo */}
        <View className="mx-5 mb-6 bg-white border border-[#EBEBEB] rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-[#22C55E] rounded-full" />
              <Text className="text-base font-semibold text-[#222222]">Jogos acontecendo</Text>
            </View>
            <Pressable onPress={() => router.push('/matches' as any)}>
              <Text className="text-sm text-[#717171]">Ver todos</Text>
            </Pressable>
          </View>

          {loadingLiveMatches ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#222" />
            </View>
          ) : liveMatches.length === 0 ? (
            <View className="py-4 items-center">
              <MaterialIcons name="sports-tennis" size={32} color="#D1D5DB" />
              <Text className="text-[#717171] text-sm mt-2 text-center">
                Nenhum jogo acontecendo agora
              </Text>
              <Pressable
                onPress={() => router.push('/match/create' as any)}
                className="mt-3 px-4 py-2 bg-[#22C55E] rounded-lg"
              >
                <Text className="text-white text-sm font-medium">Criar partida</Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-3">
              {liveMatches.map((match) => (
                <Pressable
                  key={match.id}
                  onPress={() => router.push(`/match/${match.id}` as any)}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-[#F5F5F5] rounded-xl items-center justify-center">
                      <MaterialIcons name="sports-tennis" size={20} color="#222222" />
                    </View>
                    <View>
                      <Text className="text-sm font-medium text-[#222222]" numberOfLines={1}>
                        {match.title} · {new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text className="text-xs text-[#717171]" numberOfLines={1}>
                        {match.court?.name || match.location_name} · Falta {match.max_players - match.current_players}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => router.push(`/match/${match.id}` as any)}
                    className="bg-[#22C55E] px-4 py-2 rounded-lg"
                  >
                    <Text className="text-sm font-medium text-white">Entrar</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Tournaments Section - NEW */}
        <View className="mb-6">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-[#222222]">Torneios & Eventos</Text>
            <Pressable onPress={() => router.push('/tournaments' as any)}>
              <Text className="text-sm text-[#717171]">Ver todos</Text>
            </Pressable>
          </View>
          <View className="px-5">
            <Pressable
              onPress={() => router.push('/tournaments' as any)}
              className="bg-blue-600 rounded-2xl p-5 flex-row justify-between items-center shadow-sm"
            >
              <View>
                <Text className="text-white font-bold text-lg mb-1">Copa Kourt Verão ☀️</Text>
                <Text className="text-blue-100 text-xs">Inscreva-se e suba no ranking!</Text>
              </View>
              <View className="bg-white/20 p-2 rounded-full">
                <MaterialIcons name="emoji-events" size={24} color="#fff" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Partidas Abertas */}
        <View className="mb-6">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-[#222222]">Partidas Abertas</Text>
            <Pressable onPress={() => router.push('/matches' as any)}>
              <Text className="text-sm text-[#717171]">Ver todas</Text>
            </Pressable>
          </View>

          {matchesLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color="#222" />
            </View>
          ) : matches.length === 0 ? (
            <View className="mx-5 bg-white border border-[#EBEBEB] rounded-2xl p-6 items-center">
              <MaterialIcons name="sports-tennis" size={40} color="#D1D5DB" />
              <Text className="text-[#717171] text-sm mt-3 text-center">
                Nenhuma partida aberta no momento
              </Text>
              <Pressable
                onPress={() => router.push('/match/create' as any)}
                className="mt-4 px-5 py-2.5 bg-[#222222] rounded-xl"
              >
                <Text className="text-white text-sm font-medium">Criar partida</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {matches.slice(0, 5).map((match) => (
                <Pressable
                  key={match.id}
                  onPress={() => router.push(`/match/${match.id}` as any)}
                  className="w-64 bg-white border border-[#EBEBEB] rounded-2xl p-4"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="px-2.5 py-1 bg-[#22C55E]/10 rounded-full">
                      <Text className="text-[11px] font-medium text-[#22C55E]">
                        {match.current_players}/{match.max_players} jogadores
                      </Text>
                    </View>
                    <Text className="text-xs text-[#717171]">
                      {new Date(match.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <Text className="font-semibold text-[#222222]" numberOfLines={1}>
                    {match.title}
                  </Text>
                  {match.location_name && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <MaterialIcons name="location-on" size={12} color="#717171" />
                      <Text className="text-xs text-[#717171]" numberOfLines={1}>
                        {match.location_name}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Upgrade Banner - Only for non-pro users */}
        {profile?.subscription !== 'pro' && (
          <View className="px-5 mt-2 mb-6">
            <Pressable onPress={() => router.push('/subscription' as any)}>
              <LinearGradient
                colors={['#14532D', '#166534', '#14532D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl p-4 flex-row items-center"
              >
                {/* Icon - no background, just the icon */}
                <View className="mr-3">
                  <MaterialIcons name="bolt" size={28} color="#22C55E" />
                </View>

                {/* Text Content */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[18px] font-bold text-white">
                      Seja Plus
                    </Text>
                    <View className="bg-[#22C55E] px-2.5 py-1 rounded-full">
                      <Text className="text-[11px] font-bold text-white">
                        -15%
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[13px] text-white/50 mt-0.5">
                    Comece com R$ 14,90/mês
                  </Text>
                </View>

                {/* Button */}
                <Pressable
                  onPress={() => router.push('/subscription' as any)}
                  className="px-5 py-3 rounded-xl bg-[#22C55E]"
                >
                  <Text className="text-[14px] font-bold text-white">
                    Assinar
                  </Text>
                </Pressable>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
