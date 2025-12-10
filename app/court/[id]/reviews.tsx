import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCourtDetail } from '@/hooks';

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'photos', label: 'Com fotos' },
  { id: '5stars', label: '5 estrelas' },
  { id: 'recent', label: 'Recentes' },
];

const SAMPLE_REVIEWS = [
  {
    id: '1',
    user: { name: 'Lucas Mendes', avatar: null },
    rating: 5,
    date: '2 dias atrás',
    comment:
      'Quadra excelente! Areia de qualidade, rede em ótimo estado e iluminação perfeita para jogos noturnos. O staff é muito atencioso. Voltarei com certeza!',
    photos: [null, null],
    helpful: 12,
  },
  {
    id: '2',
    user: { name: 'Ana Silva', avatar: null },
    rating: 4,
    date: '1 semana',
    comment:
      'Ótima estrutura! Vestiário limpo e bem equipado. Só achei o estacionamento um pouco cheio no horário de pico. Mas a estrutura compensa!',
    photos: [],
    helpful: 8,
  },
  {
    id: '3',
    user: { name: 'Pedro Ferreira', avatar: null },
    rating: 5,
    date: '2 semanas',
    comment:
      'Melhor quadra da região! Areia perfeita e iluminação de primeira. Recomendo muito para quem quer jogar à noite.',
    photos: [],
    helpful: 5,
  },
  {
    id: '4',
    user: { name: 'Marina Santos', avatar: null },
    rating: 4,
    date: '3 semanas',
    comment:
      'Gostei bastante! Ambiente agradável e bem cuidado. O preço é justo pelo que oferece.',
    photos: [null],
    helpful: 3,
  },
];

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { court, reviews: courtReviews, loading } = useCourtDetail(id);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const reviews = courtReviews?.length ? courtReviews : SAMPLE_REVIEWS;
  const averageRating = court?.rating || 4.8;
  const totalReviews = reviews?.length || 124;

  // Rating distribution
  const distribution = useMemo(() => {
    const dist = { 5: 70, 4: 22, 3: 5, 2: 2, 1: 1 };
    return dist;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    switch (selectedFilter) {
      case 'photos':
        return reviews.filter((r: any) => r.photos?.length > 0);
      case '5stars':
        return reviews.filter((r: any) => r.rating === 5);
      case 'recent':
        return [...reviews].slice(0, 5);
      default:
        return reviews;
    }
  }, [reviews, selectedFilter]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View className="ml-4">
            <Text className="text-lg font-bold text-black">Avaliações</Text>
            <Text className="text-neutral-500 text-sm">
              {court?.name || 'Arena BeachClub Ibirapuera'}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Rating Summary */}
          <View className="px-5 py-4">
            <View className="flex-row items-start gap-6">
              {/* Big Rating */}
              <View>
                <Text className="text-5xl font-bold text-black">
                  {averageRating.toFixed(1)}
                </Text>
                <View className="flex-row mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <MaterialIcons
                      key={i}
                      name="star"
                      size={16}
                      color={i <= Math.round(averageRating) ? '#000' : '#D4D4D4'}
                    />
                  ))}
                </View>
                <Text className="text-neutral-500 mt-1">{totalReviews} avaliações</Text>
              </View>

              {/* Distribution Bars */}
              <View className="flex-1">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <View key={stars} className="flex-row items-center gap-2 mb-1">
                    <Text className="w-3 text-sm text-neutral-500">{stars}</Text>
                    <View className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-black rounded-full"
                        style={{ width: `${distribution[stars as keyof typeof distribution]}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5 mb-4"
            contentContainerStyle={{ gap: 8 }}
          >
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full ${
                  selectedFilter === filter.id ? 'bg-black' : 'border border-neutral-200'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedFilter === filter.id ? 'text-white' : 'text-black'
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Reviews List */}
          <View className="px-5">
            {filteredReviews.map((review: any) => (
              <View
                key={review.id}
                className="py-5 border-b border-neutral-100"
              >
                {/* Review Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-neutral-200 rounded-full items-center justify-center">
                      {review.user?.avatar ? (
                        <Image
                          source={{ uri: review.user.avatar }}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <MaterialIcons name="person" size={24} color="#737373" />
                      )}
                    </View>
                    <View>
                      <Text className="font-semibold text-black">{review.user?.name}</Text>
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <MaterialIcons
                            key={i}
                            name="star"
                            size={14}
                            color={i <= review.rating ? '#000' : '#D4D4D4'}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text className="text-neutral-400 text-sm">{review.date}</Text>
                </View>

                {/* Review Content */}
                <Text className="text-neutral-700 leading-6 mb-3">{review.comment}</Text>

                {/* Review Photos */}
                {review.photos?.length > 0 && (
                  <View className="flex-row gap-2 mb-3">
                    {review.photos.map((photo: any, idx: number) => (
                      <View
                        key={idx}
                        className="w-28 h-28 bg-neutral-200 rounded-xl items-center justify-center"
                      >
                        {photo ? (
                          <Image
                            source={{ uri: photo }}
                            className="w-full h-full rounded-xl"
                          />
                        ) : (
                          <MaterialIcons name="image" size={32} color="#A3A3A3" />
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Review Actions */}
                <View className="flex-row items-center gap-6">
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <MaterialIcons name="thumb-up-off-alt" size={18} color="#737373" />
                    <Text className="text-neutral-500">Útil ({review.helpful})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <MaterialIcons name="reply" size={18} color="#737373" />
                    <Text className="text-neutral-500">Responder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View className="h-24" />
        </ScrollView>

        {/* Bottom CTA */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
          <TouchableOpacity
            onPress={() => {
              // Navigate to write review
              router.push(`/court/${id}/write-review` as any);
            }}
            className="w-full py-4 bg-black rounded-full flex-row items-center justify-center gap-2"
          >
            <MaterialIcons name="rate-review" size={20} color="#fff" />
            <Text className="text-white font-bold">Escrever avaliação</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
