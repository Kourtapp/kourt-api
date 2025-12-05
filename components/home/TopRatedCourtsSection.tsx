// components/home/TopRatedCourtsSection.tsx
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface TopCourt {
  id: string;
  name: string;
  imageUrl?: string;
  rating: number;
  totalReviews: number;
  neighborhood: string;
  distance: string;
  pricePerHour: number;
  badge?: string;
}

interface TopRatedCourtsSectionProps {
  location: string;
  courts: TopCourt[];
}

export function TopRatedCourtsSection({
  location,
  courts,
}: TopRatedCourtsSectionProps) {
  return (
    <View className="mt-6">
      {/* Header */}
      <View className="px-5 mb-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="emoji-events" size={20} color="#000" />
            <Text className="text-black font-bold text-lg">
              Melhores da região
            </Text>
          </View>
          <Pressable onPress={() => router.push('/map')}>
            <Text className="text-neutral-500">Ver todas</Text>
          </Pressable>
        </View>
        <Text className="text-neutral-500 text-sm mt-1">
          Top avaliadas em {location}
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
          <TopCourtCard key={court.id} court={court} />
        ))}
      </ScrollView>
    </View>
  );
}

function TopCourtCard({ court }: { court: TopCourt }) {
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

        {/* Rating Badge */}
        <View className="absolute top-3 left-3 flex-row items-center gap-1 bg-black/80 px-2 py-1 rounded-full">
          <MaterialIcons name="star" size={14} color="#FFF" />
          <Text className="text-white font-bold text-sm">{court.rating}</Text>
        </View>

        {/* Ranking Badge */}
        {court.badge && (
          <View className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full">
            <Text className="text-black font-bold text-xs">{court.badge}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-4">
        <Text className="text-black font-bold text-base mb-1" numberOfLines={1}>
          {court.name}
        </Text>
        <Text className="text-neutral-500 text-sm mb-2">
          {court.neighborhood} · {court.distance}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="rate-review" size={14} color="#A3A3A3" />
            <Text className="text-neutral-500 text-sm">
              {court.totalReviews} avaliações
            </Text>
          </View>
          <Text className="text-black font-bold">
            R$ {court.pricePerHour}/h
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
