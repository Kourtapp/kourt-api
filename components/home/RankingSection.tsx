// components/home/RankingSection.tsx
import { View, Text, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface RankingPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
  position: number;
  positionChange?: number;
}

interface RankingSectionProps {
  sport: string;
  players: RankingPlayer[];
  currentUserPosition: number;
  currentUserPoints: number;
  currentUserChange?: number;
}

export function RankingSection({
  sport,
  players,
  currentUserPosition,
  currentUserPoints,
  currentUserChange,
}: RankingSectionProps) {
  return (
    <View className="mt-6 mx-5">
      <Pressable
        onPress={() => router.push('/ranking')}
        className="bg-white border border-neutral-200 rounded-3xl p-5"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="leaderboard" size={20} color="#000" />
            <Text className="text-black font-bold text-lg">
              Ranking Semanal
            </Text>
          </View>
          <Text className="text-neutral-500">{sport}</Text>
        </View>

        {/* Top 3 Players */}
        {players.slice(0, 3).map((player, index) => (
          <View
            key={player.id}
            className={`flex-row items-center py-3 ${
              index < 2 ? 'border-b border-neutral-100' : ''
            }`}
          >
            {/* Position */}
            <Text
              className={`w-8 font-bold text-lg ${
                index === 0
                  ? 'text-amber-500'
                  : index === 1
                    ? 'text-neutral-400'
                    : 'text-amber-700'
              }`}
            >
              {player.position}
            </Text>

            {/* Avatar */}
            <View className="w-11 h-11 bg-neutral-200 rounded-full items-center justify-center mr-3">
              {player.avatarUrl ? (
                <Image
                  source={{ uri: player.avatarUrl }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <MaterialIcons name="person" size={24} color="#A3A3A3" />
              )}
            </View>

            {/* Name and Points */}
            <View className="flex-1">
              <Text className="text-black font-semibold">{player.name}</Text>
              <Text className="text-neutral-500 text-sm">
                {player.points.toLocaleString()} pts
              </Text>
            </View>

            {/* Trophy for #1 */}
            {index === 0 && (
              <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
            )}
          </View>
        ))}

        {/* Current User Position */}
        <View className="flex-row items-center py-3 mt-2 bg-black rounded-2xl px-4 -mx-1">
          {/* Position */}
          <Text className="w-8 text-white font-bold text-lg">
            {currentUserPosition}
          </Text>

          {/* Avatar */}
          <View className="w-11 h-11 bg-neutral-700 rounded-full items-center justify-center mr-3">
            <MaterialIcons name="person" size={24} color="#FFF" />
          </View>

          {/* Name and Points */}
          <View className="flex-1">
            <Text className="text-white font-semibold">Você</Text>
            <Text className="text-white/60 text-sm">
              {currentUserPoints.toLocaleString()} pts
            </Text>
          </View>

          {/* Position Change */}
          {currentUserChange !== undefined && currentUserChange !== 0 && (
            <View className="flex-row items-center">
              <MaterialIcons
                name={currentUserChange > 0 ? 'arrow-upward' : 'arrow-downward'}
                size={16}
                color={currentUserChange > 0 ? '#22c55e' : '#ef4444'}
              />
              <Text
                className={`font-bold ${
                  currentUserChange > 0 ? 'text-lime-500' : 'text-red-500'
                }`}
              >
                {Math.abs(currentUserChange)}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}
