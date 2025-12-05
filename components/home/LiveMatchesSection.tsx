// components/home/LiveMatchesSection.tsx
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

interface LiveMatch {
  id: string;
  sport: string;
  sportIcon: string;
  time: string;
  location: string;
  spotsLeft: number;
}

interface LiveMatchesSectionProps {
  matches: LiveMatch[];
}

export function LiveMatchesSection({ matches }: LiveMatchesSectionProps) {
  if (matches.length === 0) return null;

  return (
    <View className="mt-6 px-5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 bg-lime-500 rounded-full" />
          <Text className="text-black font-bold text-lg">
            Jogos acontecendo
          </Text>
        </View>
        <Pressable onPress={() => router.push('/social')}>
          <Text className="text-neutral-500">Ver todos</Text>
        </Pressable>
      </View>

      {/* Matches List */}
      <View className="gap-3">
        {matches.map((match) => (
          <LiveMatchCard key={match.id} match={match} />
        ))}
      </View>
    </View>
  );
}

function LiveMatchCard({ match }: { match: LiveMatch }) {
  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'beachtennis':
      case 'beach tennis':
        return '🎾';
      case 'society':
      case 'futebol':
        return '⚽';
      case 'basquete':
      case 'basquete 3x3':
        return '🏀';
      case 'vôlei':
      case 'volei':
        return '🏐';
      case 'padel':
        return '🏓';
      case 'tênis':
      case 'tenis':
        return '🎾';
      default:
        return '🎯';
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/match/${match.id}`)}
      className="flex-row items-center bg-white border border-neutral-200 rounded-2xl p-4"
    >
      {/* Sport Icon */}
      <View className="w-14 h-14 bg-neutral-100 rounded-xl items-center justify-center mr-4">
        <Text className="text-2xl">{getSportIcon(match.sport)}</Text>
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-black font-bold text-base">
          {match.sport} · {match.time}
        </Text>
        <Text className="text-neutral-500 text-sm">
          {match.location} · Falta {match.spotsLeft}
        </Text>
      </View>

      {/* Join Button */}
      <Pressable
        onPress={() => router.push(`/match/${match.id}`)}
        className="bg-lime-500 px-5 py-2.5 rounded-full"
      >
        <Text className="text-lime-950 font-semibold">Entrar</Text>
      </Pressable>
    </Pressable>
  );
}
