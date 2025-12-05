import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterSheet, CourtFilters } from '@/components/search/FilterSheet';
import { useSearchCourts } from '@/hooks';
import { Court } from '@/types/database.types';

const defaultFilters: CourtFilters = {
  sports: [],
  priceMin: 0,
  priceMax: 300,
  distance: 10,
  minRating: 0,
  amenities: [],
  availability: 'any',
  isFree: false,
};

function CourtCard({ court }: { court: Court }) {
  return (
    <Pressable
      onPress={() => router.push(`/court/${court.id}` as any)}
      className="flex-row bg-white rounded-2xl p-4 mb-3 border border-neutral-100"
    >
      <View className="w-20 h-20 bg-neutral-200 rounded-xl items-center justify-center">
        <MaterialIcons name="sports-tennis" size={28} color="#A3A3A3" />
      </View>

      <View className="flex-1 ml-4">
        <Text className="font-bold text-black" numberOfLines={1}>
          {court.name}
        </Text>
        <Text className="text-xs text-neutral-500">{court.sport}</Text>

        <View className="flex-row items-center gap-3 mt-2">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="star" size={14} color="#000" />
            <Text className="text-xs text-neutral-600">
              {court.rating?.toFixed(1) || '—'}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="location-on" size={14} color="#737373" />
            <Text className="text-xs text-neutral-500" numberOfLines={1}>
              {court.city}
            </Text>
          </View>
        </View>
      </View>

      <View className="items-end justify-center">
        <Text className="font-bold text-lime-600">
          {court.is_free ? 'Grátis' : `R$${court.price_per_hour}`}
        </Text>
        {!court.is_free && (
          <Text className="text-xs text-neutral-400">/hora</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function SearchScreen() {
  const [filters, setFilters] = useState<CourtFilters>(defaultFilters);
  const [filterVisible, setFilterVisible] = useState(false);
  const { results, loading, search } = useSearchCourts();

  const handleSearch = useCallback(
    (query: string) => {
      search(query);
    },
    [search],
  );

  const handleApplyFilters = (newFilters: CourtFilters) => {
    setFilters(newFilters);
    // Apply filters to search results
    // In a real app, you'd pass these to the API
  };

  const activeFiltersCount =
    filters.sports.length +
    filters.amenities.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.isFree ? 1 : 0) +
    (filters.availability !== 'any' ? 1 : 0);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <View className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Buscar quadras..."
            />
          </View>
          <Pressable
            onPress={() => setFilterVisible(true)}
            className="relative w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <MaterialIcons name="tune" size={20} color="#000" />
            {activeFiltersCount > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-lime-500 rounded-full items-center justify-center">
                <Text className="text-xs font-bold text-lime-950">
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CourtCard court={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text className="text-sm text-neutral-500 mb-3">
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="search" size={48} color="#D4D4D4" />
          <Text className="text-neutral-500 text-center mt-4">
            Digite para buscar quadras
          </Text>
        </View>
      )}

      {/* Filter Sheet */}
      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </SafeAreaView>
  );
}
