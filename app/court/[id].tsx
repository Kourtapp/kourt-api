import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useCourtDetail } from '@/hooks';

const { width } = Dimensions.get('window');

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { court, reviews, loading, error } = useCourtDetail(id);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error || !court) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-5">
        <MaterialIcons name="error-outline" size={48} color="#A3A3A3" />
        <Text className="text-lg font-semibold text-black mt-4">
          Quadra não encontrada
        </Text>
        <Text className="text-sm text-neutral-500 mt-1 text-center">
          {error || 'Tente novamente mais tarde'}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-black rounded-xl"
        >
          <Text className="text-white font-medium">Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const images = court.images?.length ? court.images : [null, null, null];

  return (
    <View className="flex-1 bg-white">
      {/* Image Gallery */}
      <View className="relative">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImage(index);
          }}
        >
          {images.map((img, index) => (
            <View
              key={index}
              style={{ width }}
              className="h-72 bg-neutral-200 items-center justify-center"
            >
              {img ? (
                <View className="w-full h-full bg-neutral-300" />
              ) : (
                <MaterialIcons name="image" size={60} color="#A3A3A3" />
              )}
            </View>
          ))}
        </ScrollView>

        {/* Header Overlay */}
        <SafeAreaView className="absolute top-0 left-0 right-0">
          <View className="flex-row items-center justify-between px-5 py-2">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
            >
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </Pressable>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
              >
                <MaterialIcons
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={24}
                  color={isFavorite ? '#EF4444' : '#000'}
                />
              </Pressable>
              <Pressable className="w-10 h-10 bg-white/90 rounded-full items-center justify-center">
                <MaterialIcons name="share" size={24} color="#000" />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>

        {/* Image Indicators */}
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
          {images.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full ${
                index === currentImage ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-5">
          {/* Header Info */}
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-black">
                {court.name}
              </Text>
              <Text className="text-sm text-neutral-500 mt-1">
                {court.sport}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-neutral-100 px-3 py-1.5 rounded-full">
              <MaterialIcons name="star" size={16} color="#000" />
              <Text className="font-semibold text-black">
                {court.rating || '—'}
              </Text>
              <Text className="text-xs text-neutral-500">
                ({court.total_reviews || 0})
              </Text>
            </View>
          </View>

          {/* Location */}
          <Pressable className="flex-row items-center gap-2 mb-4">
            <MaterialIcons name="location-on" size={18} color="#737373" />
            <Text className="text-sm text-neutral-600 flex-1">
              {court.address}, {court.city}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
          </Pressable>

          {/* Price */}
          <View className="bg-lime-50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-lime-700">
                  {court.is_free ? 'Quadra' : 'A partir de'}
                </Text>
                <View className="flex-row items-baseline">
                  {court.is_free ? (
                    <Text className="text-3xl font-bold text-lime-700">
                      Gratuita
                    </Text>
                  ) : (
                    <>
                      <Text className="text-3xl font-bold text-lime-700">
                        R$ {court.price_per_hour}
                      </Text>
                      <Text className="text-sm text-lime-600 ml-1">/hora</Text>
                    </>
                  )}
                </View>
              </View>
              <Pressable
                onPress={() =>
                  router.push(`/booking/checkout?courtId=${id}` as any)
                }
                className="px-6 py-3 bg-lime-500 rounded-xl"
              >
                <Text className="font-semibold text-lime-950">Reservar</Text>
              </Pressable>
            </View>
          </View>

          {/* Description */}
          {court.description && (
            <View className="mb-6">
              <Text className="text-base font-bold text-black mb-2">Sobre</Text>
              <Text className="text-sm text-neutral-600 leading-5">
                {court.description}
              </Text>
            </View>
          )}

          {/* Amenities */}
          {court.amenities && court.amenities.length > 0 && (
            <View className="mb-6">
              <Text className="text-base font-bold text-black mb-3">
                Comodidades
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {court.amenities.map((amenity) => (
                  <View
                    key={amenity}
                    className="flex-row items-center gap-1.5 px-3 py-2 bg-neutral-100 rounded-full"
                  >
                    <MaterialIcons
                      name="check-circle"
                      size={14}
                      color="#22C55E"
                    />
                    <Text className="text-sm text-neutral-700">{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Hours */}
          {(court.hours_weekdays || court.hours_weekends) && (
            <View className="mb-6">
              <Text className="text-base font-bold text-black mb-3">
                Horário de funcionamento
              </Text>
              <View className="bg-neutral-50 rounded-2xl p-4">
                {court.hours_weekdays && (
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-neutral-600">
                      Segunda a Sexta
                    </Text>
                    <Text className="text-sm font-medium text-black">
                      {court.hours_weekdays}
                    </Text>
                  </View>
                )}
                {court.hours_weekends && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-neutral-600">
                      Sábado e Domingo
                    </Text>
                    <Text className="text-sm font-medium text-black">
                      {court.hours_weekends}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Reviews Preview */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-black">Avaliações</Text>
              <Pressable>
                <Text className="text-sm text-neutral-500">
                  Ver todas ({reviews.length})
                </Text>
              </Pressable>
            </View>
            {reviews.length > 0 ? (
              <View className="bg-neutral-50 rounded-2xl p-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-10 h-10 bg-neutral-300 rounded-full items-center justify-center">
                    <Text className="font-bold text-neutral-600">
                      {(reviews[0] as any).user?.name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-black">
                      {(reviews[0] as any).user?.name || 'Usuário'}
                    </Text>
                    <View className="flex-row items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <MaterialIcons
                          key={i}
                          name="star"
                          size={12}
                          color={i <= reviews[0].rating ? '#000' : '#D4D4D4'}
                        />
                      ))}
                    </View>
                  </View>
                  <Text className="text-xs text-neutral-500">
                    {new Date(reviews[0].created_at).toLocaleDateString(
                      'pt-BR',
                    )}
                  </Text>
                </View>
                {reviews[0].comment && (
                  <Text className="text-sm text-neutral-600">
                    {reviews[0].comment}
                  </Text>
                )}
              </View>
            ) : (
              <View className="bg-neutral-50 rounded-2xl p-6 items-center">
                <MaterialIcons name="rate-review" size={32} color="#A3A3A3" />
                <Text className="text-sm text-neutral-500 mt-2">
                  Sem avaliações ainda
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Padding */}
          <View className="h-24" />
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <Pressable
          onPress={() => router.push(`/booking/checkout?courtId=${id}` as any)}
          className="w-full py-4 bg-black rounded-2xl flex-row items-center justify-center"
        >
          <MaterialIcons name="event" size={20} color="#FFF" />
          <Text className="text-white font-semibold text-[15px] ml-2">
            Reservar Agora
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
