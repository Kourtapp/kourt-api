// components/home/RecommendedCourtsSection.tsx
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface RecommendedCourt {
  id: string;
  name: string;
  imageUrl?: string;
  rating: number;
  sport: string;
  type: 'Particular' | 'Privada' | 'Pública';
  matchPercent: number;
  reason: string;
  pricePerHour: number;
}

interface RecommendedCourtsSectionProps {
  courts: RecommendedCourt[];
}

export function RecommendedCourtsSection({
  courts,
}: RecommendedCourtsSectionProps) {
  return (
    <View className="mt-6">
      {/* Header */}
      <View className="px-5 mb-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="auto-awesome" size={20} color="#000" />
            <Text className="text-black font-bold text-lg">
              Você pode gostar
            </Text>
          </View>
          <Pressable onPress={() => router.push('/map')}>
            <Text className="text-neutral-500">Ver todas</Text>
          </Pressable>
        </View>
        <Text className="text-neutral-500 text-sm mt-1">
          Baseado no seu perfil e histórico
        </Text>
      </View>

      {/* Courts Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          gap: 12,
        }}
      >
        {courts.map((court) => (
          <RecommendedCourtCard key={court.id} court={court} />
        ))}
      </ScrollView>
    </View>
  );
}

function RecommendedCourtCard({ court }: { court: RecommendedCourt }) {
  return (
    <Pressable
      onPress={() => router.push(`/court/${court.id}`)}
      className="w-[280px] bg-white border border-neutral-200 rounded-2xl overflow-hidden"
    >
      {/* Image */}
      <View className="h-[140px] bg-neutral-200 relative">
        {court.imageUrl && (
          <Image
            source={{ uri: court.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        )}

        {/* Type Badge */}
        <View className="absolute top-3 left-3 bg-black px-3 py-1 rounded-full">
          <Text className="text-white font-semibold text-xs">{court.type}</Text>
        </View>

        {/* Match Percent Badge */}
        <View className="absolute bottom-3 left-3 flex-row items-center gap-1 bg-white px-2 py-1 rounded-full">
          <MaterialIcons name="thumb-up" size={12} color="#000" />
          <Text className="text-black font-bold text-xs">
            {court.matchPercent}% match
          </Text>
        </View>
      </View>

      {/* Info */}
      <View className="p-4">
        <Text className="text-black font-bold text-base mb-1" numberOfLines={1}>
          {court.name}
        </Text>
        <View className="flex-row items-center gap-2 mb-2">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="star" size={14} color="#000" />
            <Text className="text-black font-medium text-sm">
              {court.rating}
            </Text>
          </View>
          <Text className="text-neutral-400">·</Text>
          <Text className="text-neutral-500 text-sm">{court.sport}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="people" size={14} color="#A3A3A3" />
            <Text className="text-neutral-500 text-sm">{court.reason}</Text>
          </View>
          <Text className="text-black font-bold">
            R$ {court.pricePerHour}/h
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
