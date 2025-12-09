import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/stores/authStore';
import { useAchievements, useUserMatches, useBookings, useCourts } from '@/hooks';
import { ProfileCheckInModal } from '@/components/modals/ProfileCheckInModal';
import SejaHostCard from '@/components/SejaHostCard';
import SejaPremiumCard from '@/components/SejaPremiumCard';
import { FEATURES } from '@/lib/featureFlags';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, profile, signOut, isInitialized } = useAuthStore();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const {
    courts,
    loading: loadingCourts,
    refetch: fetchCourts,
  } = useCourts();
  const { achievements } = useAchievements(user?.id);
  const { matches } = useUserMatches(user?.id);
  const { bookings } = useBookings(user?.id);

  const [activeTab, setActiveTab] = useState<'partidas' | 'estatisticas'>('partidas');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const isPro = profile?.subscription === 'pro' || profile?.subscription === 'premium';


  const handleLogout = async () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (!isInitialized) {
    return (
      <View className="flex-1 bg-[#fafafa] items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const userName =
    profile?.name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Jogador';
  const userInitial = userName.charAt(0).toUpperCase();
  const userSports = profile?.sports || [];

  // Calculate stats
  const totalMatches = matches.length;
  const completedMatches = matches.filter((m: any) => m.status === 'completed').length;
  const totalHours = bookings.reduce((acc, b) => acc + (b.duration_hours || 1), 0);

  // Mock data for demo (replace with real data later)
  const weekStats = {
    partidas: 7,
    tempo: '5h 42m',
    vitorias: 5,
  };

  const activityData = [25, 65, 45, 80, 55, 70, 35, 60, 40, 85, 50, 15];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header - White background */}
        <View className="bg-white px-5 pt-4 pb-4">
          {/* Top actions */}
          <View className="flex-row justify-between mb-4">
            <Pressable onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </Pressable>
            <View className="flex-row gap-3">
              <Pressable className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                <MaterialIcons name="share" size={20} color="#000" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/settings' as any)}
                className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
              >
                <MaterialIcons name="settings" size={20} color="#000" />
              </Pressable>
            </View>
          </View>

          {/* Profile info */}
          <View className="flex-row items-center">
            <Pressable onPress={() => router.push('/edit-profile' as any)} className="relative">
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <View className="w-20 h-20 bg-neutral-200 rounded-full items-center justify-center">
                  <Text className="text-3xl font-bold text-neutral-400">{userInitial}</Text>
                </View>
              )}
              {FEATURES.SUBSCRIPTIONS && profile?.subscription === 'pro' && (
                <View className="absolute -bottom-1 -right-1 bg-black px-2 py-0.5 rounded-full border-2 border-white">
                  <Text className="text-[10px] font-bold text-white">PRO</Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 w-6 h-6 bg-lime-500 rounded-full items-center justify-center border-2 border-white">
                <MaterialIcons name="camera-alt" size={12} color="#fff" />
              </View>
            </Pressable>
            <View className="flex-1 ml-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl font-bold text-black">{userName}</Text>
                <MaterialIcons name="verified" size={18} color="#3B82F6" />
              </View>
              <Text className="text-sm text-neutral-500">
                @{userName.toLowerCase().replace(/\s/g, '')} · São Paulo, SP
              </Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
          {FEATURES.FOLLOWERS && (
            <>
              <Pressable className="items-center mr-6">
                <Text className="text-lg font-bold text-black">{profile?.following_count || 0}</Text>
                <Text className="text-xs text-neutral-500">Seguindo</Text>
              </Pressable>
              <Pressable className="items-center mr-6">
                <Text className="text-lg font-bold text-black">{profile?.followers_count || 0}</Text>
                <Text className="text-xs text-neutral-500">Seguidores</Text>
              </Pressable>
            </>
          )}
          <Pressable className="items-center mr-auto">
            <Text className="text-lg font-bold text-black">{totalMatches}</Text>
            <Text className="text-xs text-neutral-500">Partidas</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/edit-profile' as any)}
            className="px-6 py-2.5 bg-neutral-100 rounded-xl mr-2"
          >
            <Text className="text-sm font-semibold text-black">Editar</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowCheckIn(true)}
            className="px-6 py-2.5 bg-black rounded-xl mr-2 flex-row items-center gap-2"
          >
            <MaterialIcons name="place" size={16} color="#fff" />
            <Text className="text-sm font-semibold text-white">Check-in</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/chat' as any)}
            className="w-11 h-11 border border-neutral-300 rounded-xl items-center justify-center"
          >
            <MaterialIcons name="chat-bubble-outline" size={20} color="#000" />
          </Pressable>
        </View>

        {/* Tabs - only show if advanced stats are enabled */}
        {FEATURES.ADVANCED_STATS && (
          <View className="flex-row border-b border-neutral-100">
            <Pressable
              onPress={() => setActiveTab('partidas')}
              className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'partidas' ? 'border-black' : 'border-transparent'}`}
            >
              <Text className={`text-sm font-medium ${activeTab === 'partidas' ? 'text-black' : 'text-neutral-500'}`}>
                Partidas
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('estatisticas')}
              className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'estatisticas' ? 'border-black' : 'border-transparent'}`}
            >
              <Text className={`text-sm font-medium ${activeTab === 'estatisticas' ? 'text-black' : 'text-neutral-500'}`}>
                Estatísticas
              </Text>
            </Pressable>
          </View>
        )}

        {(activeTab === 'partidas' || !FEATURES.ADVANCED_STATS) ? (
          <View className="px-5 py-4">
            {/* Sport filters */}
            <View className="flex-row gap-2 mb-6">
              {['BeachTennis', 'Padel', 'Tênis'].map((sport) => (
                <Pressable
                  key={sport}
                  onPress={() => setSelectedSport(selectedSport === sport ? null : sport)}
                  className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${selectedSport === sport ? 'bg-black border-black' : 'bg-white border-neutral-200'}`}
                >
                  <MaterialIcons
                    name="sports-tennis"
                    size={16}
                    color={selectedSport === sport ? '#fff' : '#525252'}
                  />
                  <Text className={`text-sm ${selectedSport === sport ? 'text-white' : 'text-neutral-700'}`}>
                    {sport}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* This Week */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-black mb-4">This week</Text>
              <View className="flex-row">
                <View className="flex-1">
                  <Text className="text-sm text-neutral-500">Partidas</Text>
                  <Text className="text-2xl font-bold text-black">{weekStats.partidas}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-neutral-500">Tempo</Text>
                  <Text className="text-2xl font-bold text-black">{weekStats.tempo}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-neutral-500">Vitórias</Text>
                  <Text className="text-2xl font-bold text-black">{weekStats.vitorias}</Text>
                </View>
              </View>
            </View>

            {/* Activity Chart */}
            <View className="mb-6 h-32 bg-orange-50 rounded-xl p-4">
              <View className="flex-row items-end justify-between h-full">
                {activityData.map((value, index) => (
                  <View
                    key={index}
                    className="flex-1 mx-0.5 bg-orange-400 rounded-t"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </View>
              <View className="absolute right-4 top-4">
                <Text className="text-sm font-bold text-orange-600">15 km</Text>
              </View>
            </View>

            {/* Premium Banner - only show if subscriptions are enabled */}
            {FEATURES.SUBSCRIPTIONS && !isPro && (
              <View className="-mx-5">
                <SejaPremiumCard />
              </View>
            )}

            {/* Host Banner or Dashboard Access */}
            {profile?.is_host ? (
              <Pressable
                onPress={() => router.push('/admin/arena' as any)}
                className="mb-6 -mx-5 bg-neutral-900 mx-5 p-4 rounded-2xl flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-neutral-800 rounded-lg items-center justify-center">
                    <MaterialIcons name="store" size={20} color="#fff" />
                  </View>
                  <View>
                    <Text className="text-white font-bold">Painel da Arena</Text>
                    <Text className="text-neutral-400 text-xs">Gerenciar quadras e reservas</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#fff" />
              </Pressable>
            ) : (
              <View className="mb-6 -mx-5">
                <SejaHostCard />
              </View>
            )}

            {/* Referral Banner */}
            {FEATURES.REFERRALS && (
              <Pressable
                onPress={() => router.push('/referrals' as any)}
                className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 flex-row items-center"
                style={{ backgroundColor: '#22C55E' }}
              >
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                  <MaterialIcons name="card-giftcard" size={24} color="white" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-white font-bold">Convide Amigos</Text>
                  <Text className="text-white/80 text-sm">Ganhe XP e recompensas</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="white" />
              </Pressable>
            )}

            {/* Activities Menu */}
            <View className="bg-white rounded-2xl border border-neutral-100">
              {[
                { icon: 'event', label: 'Activities', subtitle: 'Today', route: '/history' },
                { icon: 'bar-chart', label: 'Statistics', subtitle: `This year: ${totalMatches} partidas`, route: '/statistics' },
                { icon: 'notifications', label: 'Notificacoes', subtitle: 'Configurar alertas', route: '/notification-settings' },
                { icon: 'help', label: 'Ajuda', subtitle: 'FAQ e suporte', route: '/help' },
                { icon: 'article', label: 'Posts', subtitle: '112', route: '/posts' },
                { icon: 'sports-tennis', label: 'Gear', subtitle: 'Drop Shot Conqueror 12', route: '/gear' },
              ].map((item, index) => (
                <Pressable
                  key={item.label}
                  onPress={() => router.push(item.route as any)}
                  className={`flex-row items-center p-4 ${index > 0 ? 'border-t border-neutral-100' : ''}`}
                >
                  <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
                    <MaterialIcons name={item.icon as any} size={20} color="#525252" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-black">{item.label}</Text>
                    <Text className="text-sm text-neutral-500">{item.subtitle}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
                </Pressable>
              ))}
            </View>

            {/* Trophy Case - only show if achievements are enabled */}
            {FEATURES.ACHIEVEMENTS && (
              <View className="mt-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-black">Trophy Case</Text>
                  <Text className="text-sm text-neutral-500">{achievements.length}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3">
                    {achievements.length > 0 ? achievements.slice(0, 4).map((achievement: any, index: number) => (
                      <View key={achievement.id} className="w-20 items-center">
                        <View className="w-16 h-16 bg-neutral-900 rounded-xl items-center justify-center mb-2">
                          <Text className="text-amber-400 text-xl font-bold">
                            {achievement.title?.charAt(0) || '🏆'}
                          </Text>
                        </View>
                        <Text className="text-xs text-neutral-500 text-center">
                          {achievement.title || 'Trophy'}
                        </Text>
                      </View>
                    )) : (
                      <View className="w-20 items-center">
                        <View className="w-16 h-16 bg-neutral-100 rounded-xl items-center justify-center mb-2">
                          <MaterialIcons name="emoji-events" size={24} color="#D4D4D4" />
                        </View>
                        <Text className="text-xs text-neutral-400 text-center">
                          Sem troféus
                        </Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
                <Pressable
                  onPress={() => router.push('/achievements' as any)}
                  className="mt-4"
                >
                  <Text className="text-sm text-neutral-500">All trophies →</Text>
                </Pressable>
              </View>
            )}

            {/* Clubs - only show if clubs feature is enabled */}
            {FEATURES.CLUBS && (
              <View className="mt-6 mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-black">Clubs</Text>
                  <Text className="text-sm text-neutral-500">0</Text>
                </View>
                <View className="flex-row gap-3">
                  <Pressable className="items-center">
                    <View className="w-14 h-14 bg-red-500 rounded-xl items-center justify-center mb-1">
                      <Text className="text-white font-bold">N+</Text>
                    </View>
                    <Text className="text-xs text-neutral-600">Nike Run...</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push('/clubs' as any)}
                    className="items-center"
                  >
                    <View className="w-14 h-14 bg-neutral-100 rounded-xl items-center justify-center mb-1 border border-dashed border-neutral-300">
                      <MaterialIcons name="add" size={24} color="#A3A3A3" />
                    </View>
                    <Text className="text-xs text-neutral-500">Entrar</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Spacer for MVP mode */}
            {!FEATURES.ACHIEVEMENTS && !FEATURES.CLUBS && <View className="h-8" />}
          </View>
        ) : (
          <StatisticsTab
            totalMatches={totalMatches}
            totalHours={totalHours}
            completedMatches={completedMatches}
          />
        )}

        {/* Logout button */}
        <Pressable
          onPress={handleLogout}
          className="mx-5 mb-8 flex-row items-center justify-center py-4"
        >
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text className="ml-2 text-red-500 font-medium">Sair da conta</Text>
        </Pressable>
      </ScrollView>

      <ProfileCheckInModal
        visible={showCheckIn}
        onClose={() => setShowCheckIn(false)}
      />
    </SafeAreaView>
  );
}

function StatisticsTab({ totalMatches, totalHours, completedMatches }: {
  totalMatches: number;
  totalHours: number;
  completedMatches: number;
}) {
  const [selectedYear, setSelectedYear] = useState('Este ano');

  return (
    <View className="px-5 py-4">
      {/* Year filter */}
      <View className="flex-row gap-2 mb-6">
        {['Este ano', 'Todos', '2024', '2023'].map((year) => (
          <Pressable
            key={year}
            onPress={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-full ${selectedYear === year ? 'bg-black' : 'bg-neutral-100'}`}
          >
            <Text className={`text-sm font-medium ${selectedYear === year ? 'text-white' : 'text-neutral-700'}`}>
              {year}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Resumo do Ano */}
      <Text className="text-xs font-semibold text-neutral-400 mb-3 tracking-wider">
        RESUMO DO ANO
      </Text>
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-white border border-neutral-200 rounded-xl p-4">
          <Text className="text-sm text-neutral-500">Total de Partidas</Text>
          <Text className="text-3xl font-bold text-black mt-1">{totalMatches}</Text>
          <Text className="text-xs text-green-500 mt-1">+23% vs ano anterior</Text>
        </View>
        <View className="flex-1 bg-white border border-neutral-200 rounded-xl p-4">
          <Text className="text-sm text-neutral-500">Tempo de Jogo</Text>
          <Text className="text-3xl font-bold text-black mt-1">{totalHours}h</Text>
          <Text className="text-xs text-green-500 mt-1">+18% vs ano anterior</Text>
        </View>
      </View>

      {/* Análise de Partidas */}
      <View className="mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center">
            <MaterialIcons name="bar-chart" size={18} color="#3B82F6" />
          </View>
          <Text className="text-lg font-bold text-black">Análise de Partidas</Text>
        </View>
        <View className="h-32 bg-blue-50 rounded-xl p-4 flex-row items-end justify-around">
          {[60, 80, 70, 90, 65, 85, 75, 95, 70, 100].map((h, i) => (
            <View
              key={i}
              className="w-5 bg-blue-400 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </View>
        <Pressable className="mt-2">
          <Text className="text-sm text-orange-500 text-right">Ver Partidas</Text>
        </Pressable>
      </View>

      {/* Games por Set */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-black mb-4">Games por Set</Text>
        {[
          { set: 1, games: '6-4', win: 60, pts: '+24' },
          { set: 2, games: '6-3', win: 67, pts: '+28' },
          { set: 3, games: '7-5', win: 58, pts: '+22' },
          { set: 4, games: '6-2', win: 75, pts: '+32' },
          { set: 5, games: '6-4', win: 60, pts: '+24' },
        ].map((row) => (
          <View key={row.set} className="flex-row items-center py-2 border-b border-neutral-100">
            <Text className="w-8 text-neutral-500">{row.set}</Text>
            <Text className="w-16 font-semibold">{row.games}</Text>
            <View className="flex-1 h-2 bg-neutral-100 rounded-full mx-4">
              <View
                className="h-full bg-orange-400 rounded-full"
                style={{ width: `${row.win}%` }}
              />
            </View>
            <Text className="w-12 text-right text-neutral-500">{row.win}%</Text>
            <Text className="w-12 text-right text-green-500 font-medium">{row.pts}</Text>
          </View>
        ))}
      </View>

      {/* Vitórias vs Derrotas */}
      <View className="mb-6">
        <Text className="text-xs font-semibold text-neutral-400 mb-3 tracking-wider">
          VITÓRIAS VS DERROTAS
        </Text>
        <View className="flex-row items-center">
          <View className="w-24 h-24 items-center justify-center">
            <View className="absolute w-20 h-20 rounded-full border-8 border-green-400" />
            <View className="absolute w-20 h-20 rounded-full border-8 border-red-200"
              style={{
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                transform: [{ rotate: '120deg' }]
              }}
            />
            <Text className="text-xl font-bold">67%</Text>
          </View>
          <View className="flex-1 ml-6">
            <View className="flex-row items-center mb-2">
              <View className="w-3 h-3 bg-green-400 rounded-full mr-2" />
              <Text className="flex-1 text-neutral-600">Vitórias</Text>
              <Text className="font-bold">{completedMatches}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="w-3 h-3 bg-red-300 rounded-full mr-2" />
              <Text className="flex-1 text-neutral-600">Derrotas</Text>
              <Text className="font-bold">{Math.floor(totalMatches * 0.3)}</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-neutral-300 rounded-full mr-2" />
              <Text className="flex-1 text-neutral-600">Empates</Text>
              <Text className="font-bold">{Math.floor(totalMatches * 0.05)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Por Esporte */}
      <View className="mb-6">
        <Text className="text-xs font-semibold text-neutral-400 mb-3 tracking-wider">
          POR ESPORTE
        </Text>
        {[
          { sport: 'BeachTennis', matches: 156, winRate: 72, color: '#F59E0B' },
          { sport: 'Padel', matches: 67, winRate: 58, color: '#3B82F6' },
          { sport: 'Tênis', matches: 24, winRate: 54, color: '#22C55E' },
        ].map((item) => (
          <View key={item.sport} className="flex-row items-center py-3">
            <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
              <MaterialIcons name="sports-tennis" size={24} color={item.color} />
            </View>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-black">{item.sport}</Text>
                <Text className="font-semibold text-black">{item.matches} partidas</Text>
              </View>
              <View className="flex-row items-center mt-1">
                <View className="flex-1 h-2 bg-neutral-100 rounded-full mr-2">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${item.winRate}%`, backgroundColor: item.color }}
                  />
                </View>
              </View>
              <Text className="text-xs text-neutral-500 mt-1">{item.winRate}% win rate</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recordes Pessoais */}
      <View className="mb-6">
        <Text className="text-xs font-semibold text-neutral-400 mb-3 tracking-wider">
          RECORDES PESSOAIS
        </Text>
        <View className="flex-row gap-3">
          <View className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <Text className="text-sm text-amber-600">Maior sequência</Text>
            <Text className="text-2xl font-bold text-black mt-1">12</Text>
            <Text className="text-xs text-neutral-500">vitórias seguidas</Text>
          </View>
          <View className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <Text className="text-sm text-blue-600">Melhor mês</Text>
            <Text className="text-2xl font-bold text-black mt-1">34</Text>
            <Text className="text-xs text-neutral-500">partidas (Set/24)</Text>
          </View>
        </View>
        <View className="flex-row gap-3 mt-3">
          <View className="flex-1 bg-green-50 border border-green-100 rounded-xl p-4">
            <Text className="text-sm text-green-600">Partida mais longa</Text>
            <Text className="text-2xl font-bold text-black mt-1">2h 45m</Text>
            <Text className="text-xs text-neutral-500">BeachTennis</Text>
          </View>
          <View className="flex-1 bg-purple-50 border border-purple-100 rounded-xl p-4">
            <Text className="text-sm text-purple-600">Parceiros</Text>
            <Text className="text-2xl font-bold text-black mt-1">47</Text>
            <Text className="text-xs text-neutral-500">jogadores diferentes</Text>
          </View>
        </View>
      </View>

      {/* Quadras mais frequentes */}
      <View className="mb-8">
        <Text className="text-xs font-semibold text-neutral-400 mb-3 tracking-wider">
          QUADRAS MAIS FREQUENTES
        </Text>
        {[
          { rank: 1, name: 'Arena Beach Ibirapuera', matches: 67, winRate: 78 },
          { rank: 2, name: 'Padel Club Jardins', matches: 43, winRate: 62 },
          { rank: 3, name: 'Tennis Park Vila Nova', matches: 28, winRate: 54 },
        ].map((court) => (
          <View key={court.rank} className="flex-row items-center py-3 border-b border-neutral-100">
            <Text className="w-8 text-lg font-bold text-neutral-400">{court.rank}</Text>
            <View className="flex-1">
              <Text className="font-semibold text-black">{court.name}</Text>
              <Text className="text-sm text-neutral-500">{court.matches} partidas · {court.winRate}% win rate</Text>
            </View>

            <Pressable>
              <MaterialIcons name="star-outline" size={24} color="#F59E0B" />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
