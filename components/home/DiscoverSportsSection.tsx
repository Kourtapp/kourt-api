// components/home/DiscoverSportsSection.tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Sport {
  id: string;
  name: string;
  icon: string;
  courtsNearby: number;
}

interface DiscoverSportsSectionProps {
  sports: Sport[];
}

export function DiscoverSportsSection({ sports }: DiscoverSportsSectionProps) {
  if (sports.length === 0) return null;

  return (
    <View className="mt-6">
      {/* Header */}
      <View className="px-5 mb-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="explore" size={20} color="#000" />
            <Text className="text-black font-bold text-lg">
              Descubra novos esportes
            </Text>
          </View>
        </View>
        <Text className="text-neutral-500 text-sm mt-1">
          Experimente algo diferente
        </Text>
      </View>

      {/* Sports Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          gap: 12,
        }}
      >
        {sports.map((sport) => (
          <SportCard key={sport.id} sport={sport} />
        ))}
      </ScrollView>
    </View>
  );
}

function SportCard({ sport }: { sport: Sport }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/map', params: { sport: sport.id } })
      }
      className="w-[140px] bg-white border border-neutral-200 rounded-2xl p-4 items-center"
    >
      {/* Icon */}
      <View className="w-16 h-16 bg-neutral-100 rounded-2xl items-center justify-center mb-3">
        <Text className="text-3xl">{sport.icon}</Text>
      </View>

      {/* Name */}
      <Text className="text-black font-bold text-base mb-1">{sport.name}</Text>

      {/* Courts Count */}
      <Text className="text-neutral-500 text-sm">
        {sport.courtsNearby} quadras perto
      </Text>
    </Pressable>
  );
}
