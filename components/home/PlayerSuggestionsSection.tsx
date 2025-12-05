// components/home/PlayerSuggestionsSection.tsx
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface SuggestedPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  sport: string;
  reason: string;
  isOnline: boolean;
}

interface PlayerSuggestionsSectionProps {
  players: SuggestedPlayer[];
  onInvite: (playerId: string) => void;
}

export function PlayerSuggestionsSection({
  players,
  onInvite,
}: PlayerSuggestionsSectionProps) {
  if (players.length === 0) return null;

  return (
    <View className="mt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mb-4">
        <Text className="text-black font-bold text-lg">Sugestões</Text>
        <Pressable onPress={() => router.push('/social')}>
          <Text className="text-neutral-500">Ver todos</Text>
        </Pressable>
      </View>

      {/* Players Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onInvite={() => onInvite(player.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function PlayerCard({
  player,
  onInvite,
}: {
  player: SuggestedPlayer;
  onInvite: () => void;
}) {
  return (
    <View className="w-[150px] bg-white border border-neutral-200 rounded-2xl p-4 items-center">
      {/* Avatar */}
      <View className="relative mb-3">
        <View className="w-16 h-16 bg-neutral-200 rounded-full overflow-hidden">
          {player.avatarUrl ? (
            <Image
              source={{ uri: player.avatarUrl }}
              className="w-full h-full"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <MaterialIcons name="person" size={32} color="#A3A3A3" />
            </View>
          )}
        </View>
        {/* Online Indicator */}
        {player.isOnline && (
          <View className="absolute bottom-0 right-0 w-4 h-4 bg-lime-500 rounded-full border-2 border-white" />
        )}
      </View>

      {/* Name */}
      <Text className="text-black font-bold text-base mb-1" numberOfLines={1}>
        {player.name}
      </Text>

      {/* Sport */}
      <View className="flex-row items-center gap-1 mb-1">
        <MaterialIcons name="sports-tennis" size={12} color="#A3A3A3" />
        <Text className="text-neutral-500 text-xs">{player.sport}</Text>
      </View>

      {/* Reason */}
      <Text className="text-neutral-400 text-xs mb-3">{player.reason}</Text>

      {/* Invite Button */}
      <Pressable
        onPress={onInvite}
        className="w-full bg-black py-2.5 rounded-xl items-center"
      >
        <Text className="text-white font-semibold text-sm">Convidar</Text>
      </Pressable>
    </View>
  );
}
