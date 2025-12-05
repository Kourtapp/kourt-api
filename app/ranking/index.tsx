import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRankings, useMyRanking, RankingEntry } from '@/hooks/useRankings';
import { useAuthStore } from '@/stores/authStore';

const sports = [
  { id: 'Beach Tennis', label: 'Beach Tennis', icon: 'sports-tennis' },
  { id: 'Padel', label: 'Padel', icon: 'sports-tennis' },
  { id: 'Tênis', label: 'Tênis', icon: 'sports-tennis' },
  { id: 'Vôlei', label: 'Vôlei', icon: 'sports-volleyball' },
];

function RankingRow({
  entry,
  isCurrentUser,
}: {
  entry: RankingEntry;
  isCurrentUser: boolean;
}) {
  const getMedalColor = (position: number) => {
    if (position === 1) return '#FFD700';
    if (position === 2) return '#C0C0C0';
    if (position === 3) return '#CD7F32';
    return null;
  };

  const medalColor = getMedalColor(entry.rank_position);
  const winRate =
    entry.wins + entry.losses > 0
      ? Math.round((entry.wins / (entry.wins + entry.losses)) * 100)
      : 0;

  return (
    <Pressable
      className={`flex-row items-center py-4 px-4 ${
        isCurrentUser ? 'bg-lime-50' : ''
      }`}
    >
      {/* Position */}
      <View className="w-10 items-center">
        {medalColor ? (
          <View
            style={{ backgroundColor: medalColor }}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <Text className="text-white font-bold">{entry.rank_position}</Text>
          </View>
        ) : (
          <Text className="text-lg font-semibold text-neutral-600">
            {entry.rank_position}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <View className="w-12 h-12 bg-neutral-200 rounded-full items-center justify-center ml-3">
        {entry.user?.avatar_url ? (
          <View className="w-full h-full bg-neutral-300 rounded-full" />
        ) : (
          <Text className="font-bold text-neutral-600">
            {entry.user?.name?.charAt(0) || '?'}
          </Text>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-2">
          <Text className="font-semibold text-black" numberOfLines={1}>
            {entry.user?.name || 'Jogador'}
          </Text>
          {isCurrentUser && (
            <View className="px-2 py-0.5 bg-lime-500 rounded-full">
              <Text className="text-xs font-medium text-lime-950">Você</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-neutral-500">
          {entry.wins}V / {entry.losses}D • {winRate}% win rate
        </Text>
      </View>

      {/* Points */}
      <View className="items-end">
        <Text className="text-lg font-bold text-black">{entry.points}</Text>
        <Text className="text-xs text-neutral-500">pts</Text>
      </View>
    </Pressable>
  );
}

function MyRankingCard({
  ranking,
  sport,
}: {
  ranking: RankingEntry | null;
  sport: string;
}) {
  if (!ranking) {
    return (
      <View className="mx-5 mb-4 p-4 bg-neutral-100 rounded-2xl">
        <Text className="text-center text-neutral-500">
          Você ainda não está no ranking de {sport}.{'\n'}
          Jogue partidas ranqueadas para aparecer!
        </Text>
      </View>
    );
  }

  return (
    <View className="mx-5 mb-4 p-4 bg-black rounded-2xl">
      <Text className="text-xs text-white/60 mb-2">Sua posição</Text>
      <View className="flex-row items-center">
        <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
          <Text className="text-2xl font-bold text-white">
            #{ranking.rank_position}
          </Text>
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-2xl font-bold text-white">
            {ranking.points} pts
          </Text>
          <Text className="text-white/60">
            {ranking.wins}V / {ranking.losses}D
          </Text>
        </View>
        <View className="items-end">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="trending-up" size={16} color="#84CC16" />
            <Text className="text-lime-400 font-medium">+25</Text>
          </View>
          <Text className="text-xs text-white/60">última partida</Text>
        </View>
      </View>
    </View>
  );
}

export default function RankingScreen() {
  const { user } = useAuthStore();
  const [selectedSport, setSelectedSport] = useState(sports[0].id);
  const [refreshing, setRefreshing] = useState(false);

  const { rankings, loading, refetch } = useRankings(selectedSport);
  const { ranking: myRanking } = useMyRanking(user?.id, selectedSport);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Ranking</Text>
        <Pressable>
          <MaterialIcons name="info-outline" size={24} color="#737373" />
        </Pressable>
      </View>

      {/* Sport Tabs */}
      <View className="px-5 mb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={sports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedSport(item.id)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedSport === item.id ? 'bg-black' : 'bg-neutral-100'
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedSport === item.id ? 'text-white' : 'text-neutral-600'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* My Ranking */}
      {user && <MyRankingCard ranking={myRanking} sport={selectedSport} />}

      {/* Rankings List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : rankings.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="emoji-events" size={48} color="#D4D4D4" />
          <Text className="text-neutral-500 text-center mt-4">
            Nenhum jogador no ranking ainda.{'\n'}
            Seja o primeiro a jogar!
          </Text>
        </View>
      ) : (
        <FlatList
          data={rankings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RankingRow
              entry={item}
              isCurrentUser={item.user_id === user?.id}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-neutral-100 mx-4" />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#000']}
              tintColor="#000"
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
