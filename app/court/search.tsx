import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCourts } from '@/hooks';
import { Court } from '@/types/database.types';

const sports = [
  { id: 'all', name: 'Todos', icon: 'apps' },
  { id: 'beach-tennis', name: 'Beach Tennis', icon: 'sports-tennis' },
  { id: 'padel', name: 'Padel', icon: 'sports-tennis' },
  { id: 'tennis', name: 'Tênis', icon: 'sports-tennis' },
  { id: 'futevolei', name: 'Futevôlei', icon: 'sports-volleyball' },
  { id: 'volleyball', name: 'Vôlei', icon: 'sports-volleyball' },
  { id: 'basketball', name: 'Basquete', icon: 'sports-basketball' },
  { id: 'football', name: 'Futebol', icon: 'sports-soccer' },
];

const courtTypes = [
  { id: 'all', name: 'Todos', icon: 'apps' },
  { id: 'public', name: 'Pública', icon: 'public' },
  { id: 'private', name: 'Privada', icon: 'lock' },
  { id: 'arena', name: 'Arena', icon: 'business' },
];

const sortOptions = [
  { id: 'distance', name: 'Mais perto' },
  { id: 'price', name: 'Menor preço' },
  { id: 'rating', name: 'Melhor avaliado' },
];

export default function CourtSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('distance');
  const [showOnlyFree, setShowOnlyFree] = useState(false);

  const { courts, loading } = useCourts();

  const filteredCourts = courts.filter((court) => {
    // Filtro de busca por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        court.name.toLowerCase().includes(query) ||
        court.city?.toLowerCase().includes(query) ||
        court.neighborhood?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filtro por esporte
    if (selectedSport !== 'all') {
      if (court.sport?.toLowerCase() !== selectedSport.toLowerCase() &&
          !court.sports?.some((s: string) => s.toLowerCase() === selectedSport.toLowerCase())) {
        return false;
      }
    }

    // Filtro por tipo de quadra
    if (selectedType !== 'all') {
      if (court.type?.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
    }

    // Filtro gratuitas
    if (showOnlyFree && !court.is_free) return false;

    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-lg font-bold text-black">Buscar Quadras</Text>
        </View>
        <Pressable
          onPress={() => router.push('/map')}
          className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
        >
          <MaterialIcons name="map" size={20} color="#525252" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3">
          <MaterialIcons name="search" size={20} color="#737373" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nome, cidade..."
            placeholderTextColor="#A3A3A3"
            className="flex-1 ml-3 text-base text-black"
          />
          {searchQuery && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#737373" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Type Filter */}
      <View className="px-4 pt-2 pb-1">
        <Text className="text-xs font-semibold text-neutral-400 uppercase mb-2">Tipo de Quadra</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
        >
          {courtTypes.map((type) => (
            <Pressable
              key={type.id}
              onPress={() => setSelectedType(type.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              className={`px-4 py-2 rounded-full ${
                selectedType === type.id
                  ? 'bg-lime-500'
                  : 'bg-neutral-100'
              }`}
            >
              <MaterialIcons
                name={type.icon as any}
                size={16}
                color={selectedType === type.id ? '#1a2e05' : '#525252'}
              />
              <Text
                className={`text-sm font-medium ${
                  selectedType === type.id ? 'text-lime-950' : 'text-neutral-700'
                }`}
              >
                {type.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Sports Filter */}
      <View className="px-4 pt-1 pb-2">
        <Text className="text-xs font-semibold text-neutral-400 uppercase mb-2">Esporte</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
        >
          {sports.map((sport) => (
            <Pressable
              key={sport.id}
              onPress={() => setSelectedSport(sport.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              className={`px-4 py-2 rounded-full ${
                selectedSport === sport.id
                  ? 'bg-black'
                  : 'bg-neutral-100'
              }`}
            >
              <MaterialIcons
                name={sport.icon as any}
                size={16}
                color={selectedSport === sport.id ? '#fff' : '#525252'}
              />
              <Text
                className={`text-sm font-medium ${
                  selectedSport === sport.id ? 'text-white' : 'text-neutral-700'
                }`}
              >
                {sport.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Filters Row */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-100">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => setShowOnlyFree(!showOnlyFree)}
            className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full ${
              showOnlyFree ? 'bg-green-100' : 'bg-neutral-100'
            }`}
          >
            <MaterialIcons
              name="check-circle"
              size={14}
              color={showOnlyFree ? '#22C55E' : '#A3A3A3'}
            />
            <Text
              className={`text-xs font-medium ${
                showOnlyFree ? 'text-green-600' : 'text-neutral-500'
              }`}
            >
              Gratuitas
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2">
          {sortOptions.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSelectedSort(option.id)}
              className={`px-3 py-1.5 rounded-full ${
                selectedSort === option.id ? 'bg-black' : 'bg-neutral-100'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedSort === option.id ? 'text-white' : 'text-neutral-600'
                }`}
              >
                {option.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : filteredCourts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="location-off" size={48} color="#D1D5DB" />
          <Text className="mt-4 text-lg font-semibold text-neutral-700">
            Nenhuma quadra encontrada
          </Text>
          <Text className="mt-2 text-neutral-500 text-center">
            Tente ajustar os filtros ou buscar em outra área
          </Text>
          <Pressable
            onPress={() => router.push('/court/suggest' as any)}
            className="mt-4 px-6 py-3 bg-black rounded-xl"
          >
            <Text className="text-white font-semibold">Sugerir uma quadra</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-3">
            <Text className="text-sm text-neutral-500 mb-3">
              {filteredCourts.length} quadra(s) encontrada(s)
            </Text>

            <View className="gap-3">
              {filteredCourts.map((court: Court) => (
                <Pressable
                  key={court.id}
                  onPress={() => router.push(`/court/${court.id}` as any)}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
                >
                  {/* Image Placeholder */}
                  <View className="h-36 bg-neutral-100 items-center justify-center">
                    <MaterialIcons name="image" size={40} color="#D1D5DB" />
                  </View>

                  <View className="p-4">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-black" numberOfLines={1}>
                          {court.name}
                        </Text>
                        <View className="flex-row items-center gap-1 mt-1">
                          <MaterialIcons name="place" size={14} color="#737373" />
                          <Text className="text-sm text-neutral-500" numberOfLines={1}>
                            {court.neighborhood || court.city}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-1 bg-neutral-100 px-2 py-1 rounded-lg">
                        <MaterialIcons name="star" size={14} color="#F59E0B" />
                        <Text className="text-sm font-semibold text-neutral-700">
                          {court.rating || '—'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-3 mt-3">
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="sports-tennis" size={14} color="#737373" />
                        <Text className="text-xs text-neutral-500">{court.sport}</Text>
                      </View>
                      {court.is_indoor && (
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="roofing" size={14} color="#737373" />
                          <Text className="text-xs text-neutral-500">Coberta</Text>
                        </View>
                      )}
                      {court.has_lighting && (
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="light-mode" size={14} color="#737373" />
                          <Text className="text-xs text-neutral-500">Iluminada</Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                      <Text
                        className={`text-lg font-bold ${
                          court.is_free ? 'text-green-600' : 'text-black'
                        }`}
                      >
                        {court.is_free ? 'Gratuita' : `R$ ${court.price_per_hour}/h`}
                      </Text>
                      <Pressable
                        onPress={() => router.push(`/court/${court.id}/book` as any)}
                        className="px-4 py-2 bg-black rounded-xl"
                      >
                        <Text className="text-sm font-semibold text-white">
                          {court.is_free ? 'Ver detalhes' : 'Reservar'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
