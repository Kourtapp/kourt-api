import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

export interface CourtFilters {
  sports: string[];
  priceMin: number;
  priceMax: number;
  distance: number;
  minRating: number;
  amenities: string[];
  availability: 'any' | 'today' | 'tomorrow' | 'week';
  isFree: boolean;
}

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

const sports = [
  { id: 'Beach Tennis', label: 'Beach Tennis' },
  { id: 'Padel', label: 'Padel' },
  { id: 'Tênis', label: 'Tênis' },
  { id: 'Vôlei', label: 'Vôlei' },
  { id: 'Futebol', label: 'Futebol' },
];

const amenitiesList = [
  { id: 'estacionamento', label: 'Estacionamento' },
  { id: 'vestiário', label: 'Vestiário' },
  { id: 'lanchonete', label: 'Lanchonete' },
  { id: 'iluminação', label: 'Iluminação' },
  { id: 'ar_condicionado', label: 'Ar Condicionado' },
  { id: 'cobertura', label: 'Cobertura' },
];

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: CourtFilters;
  onApply: (filters: CourtFilters) => void;
}

export function FilterSheet({
  visible,
  onClose,
  filters,
  onApply,
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<CourtFilters>(filters);

  const toggleSport = (sportId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter((s) => s !== sportId)
        : [...prev.sports, sportId],
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const activeFiltersCount =
    localFilters.sports.length +
    localFilters.amenities.length +
    (localFilters.minRating > 0 ? 1 : 0) +
    (localFilters.isFree ? 1 : 0) +
    (localFilters.availability !== 'any' ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
          <Pressable onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#000" />
          </Pressable>
          <Text className="text-lg font-bold text-black">Filtros</Text>
          <Pressable onPress={handleReset}>
            <Text className="text-sm text-neutral-500">Limpar</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Sports */}
          <View className="px-5 py-5 border-b border-neutral-100">
            <Text className="text-base font-bold text-black mb-4">
              Esportes
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {sports.map((sport) => {
                const isSelected = localFilters.sports.includes(sport.id);
                return (
                  <Pressable
                    key={sport.id}
                    onPress={() => toggleSport(sport.id)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      isSelected
                        ? 'bg-black border-black'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        isSelected ? 'text-white' : 'text-neutral-700'
                      }`}
                    >
                      {sport.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Price Range */}
          <View className="px-5 py-5 border-b border-neutral-100">
            <Text className="text-base font-bold text-black mb-4">
              Faixa de Preço
            </Text>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-neutral-500">
                R$ {localFilters.priceMin}
              </Text>
              <Text className="text-sm text-neutral-500">
                R$ {localFilters.priceMax}
              </Text>
            </View>
            <Slider
              minimumValue={0}
              maximumValue={300}
              step={10}
              value={localFilters.priceMax}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, priceMax: value }))
              }
              minimumTrackTintColor="#000"
              maximumTrackTintColor="#E5E5E5"
              thumbTintColor="#000"
            />
            <Pressable
              onPress={() =>
                setLocalFilters((prev) => ({ ...prev, isFree: !prev.isFree }))
              }
              className="flex-row items-center mt-4"
            >
              <View
                className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                  localFilters.isFree
                    ? 'bg-black border-black'
                    : 'border-neutral-300'
                }`}
              >
                {localFilters.isFree && (
                  <MaterialIcons name="check" size={16} color="#fff" />
                )}
              </View>
              <Text className="text-black">Apenas gratuitas</Text>
            </Pressable>
          </View>

          {/* Distance */}
          <View className="px-5 py-5 border-b border-neutral-100">
            <Text className="text-base font-bold text-black mb-4">
              Distância: {localFilters.distance} km
            </Text>
            <Slider
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={localFilters.distance}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, distance: value }))
              }
              minimumTrackTintColor="#000"
              maximumTrackTintColor="#E5E5E5"
              thumbTintColor="#000"
            />
          </View>

          {/* Rating */}
          <View className="px-5 py-5 border-b border-neutral-100">
            <Text className="text-base font-bold text-black mb-4">
              Avaliação Mínima
            </Text>
            <View className="flex-row gap-2">
              {[0, 3, 4, 4.5].map((rating) => {
                const isSelected = localFilters.minRating === rating;
                return (
                  <Pressable
                    key={rating}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        minRating: rating,
                      }))
                    }
                    className={`flex-1 py-3 rounded-xl items-center border-2 ${
                      isSelected
                        ? 'bg-black border-black'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <View className="flex-row items-center gap-1">
                      {rating > 0 && (
                        <MaterialIcons
                          name="star"
                          size={14}
                          color={isSelected ? '#fff' : '#000'}
                        />
                      )}
                      <Text
                        className={`font-medium ${
                          isSelected ? 'text-white' : 'text-black'
                        }`}
                      >
                        {rating === 0 ? 'Todas' : `${rating}+`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Amenities */}
          <View className="px-5 py-5 border-b border-neutral-100">
            <Text className="text-base font-bold text-black mb-4">
              Comodidades
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {amenitiesList.map((amenity) => {
                const isSelected = localFilters.amenities.includes(amenity.id);
                return (
                  <Pressable
                    key={amenity.id}
                    onPress={() => toggleAmenity(amenity.id)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      isSelected
                        ? 'bg-black border-black'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        isSelected ? 'text-white' : 'text-neutral-700'
                      }`}
                    >
                      {amenity.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Availability */}
          <View className="px-5 py-5">
            <Text className="text-base font-bold text-black mb-4">
              Disponibilidade
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { id: 'any', label: 'Qualquer' },
                { id: 'today', label: 'Hoje' },
                { id: 'tomorrow', label: 'Amanhã' },
                { id: 'week', label: 'Esta semana' },
              ].map((option) => {
                const isSelected = localFilters.availability === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        availability: option.id as any,
                      }))
                    }
                    className={`px-4 py-2 rounded-full border-2 ${
                      isSelected
                        ? 'bg-black border-black'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        isSelected ? 'text-white' : 'text-neutral-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="h-24" />
        </ScrollView>

        {/* Apply Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
          <Pressable
            onPress={handleApply}
            className="w-full py-4 bg-black rounded-2xl items-center"
          >
            <Text className="text-white font-semibold">
              Aplicar Filtros
              {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
