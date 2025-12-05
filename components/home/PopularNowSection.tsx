// components/home/PopularNowSection.tsx
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface PopularCourt {
  id: string;
  name: string;
  imageUrl?: string;
  rating: number;
  distance: string;
  type: 'Pública' | 'Privada';
  currentPeople: number;
  isFree: boolean;
  pricePerHour?: number;
  status?: 'Lotada' | 'Disponível';
}

interface PopularNowSectionProps {
  courts: PopularCourt[];
}

export function PopularNowSection({ courts }: PopularNowSectionProps) {
  return (
    <View className="mt-6">
      {/* Header */}
      <View className="px-5 mb-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MaterialIcons
              name="local-fire-department"
              size={20}
              color="#000"
            />
            <Text className="text-black font-bold text-lg">
              Populares agora
            </Text>
          </View>
          <Pressable onPress={() => router.push('/map')}>
            <Text className="text-neutral-500">Ver todas</Text>
          </Pressable>
        </View>
        <Text className="text-neutral-500 text-sm mt-1">
          Quadras mais movimentadas neste momento
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
          <PopularCourtCard key={court.id} court={court} />
        ))}
      </ScrollView>
    </View>
  );
}

function PopularCourtCard({ court }: { court: PopularCourt }) {
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

        {/* Status Badge */}
        {court.status && (
          <View
            className={`absolute top-3 right-3 px-3 py-1 rounded-full ${
              court.status === 'Lotada' ? 'bg-red-100' : 'bg-lime-100'
            }`}
          >
            <Text
              className={`font-semibold text-xs ${
                court.status === 'Lotada' ? 'text-red-600' : 'text-lime-700'
              }`}
            >
              {court.status}
            </Text>
          </View>
        )}
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
          <Text className="text-neutral-500 text-sm">{court.distance}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="people" size={14} color="#A3A3A3" />
            <Text className="text-neutral-500 text-sm">
              {court.currentPeople} pessoas agora
            </Text>
          </View>
          <Text
            className={`font-bold ${court.isFree ? 'text-lime-600' : 'text-black'}`}
          >
            {court.isFree ? 'Gratuita' : `R$ ${court.pricePerHour}/h`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
