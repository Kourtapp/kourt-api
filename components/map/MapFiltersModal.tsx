import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

export interface MapFilters {
  priceMin: number;
  priceMax: number;
  includeFree: boolean;
  sports: string[];
  courtTypes: string[];
}

interface MapFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: MapFilters;
  onApply: (filters: MapFilters) => void;
}

const SPORTS = [
  { id: 'BeachTennis', label: 'BeachTennis', icon: 'sports-tennis' },
  { id: 'Padel', label: 'Padel', icon: 'sports-tennis' },
  { id: 'Futebol', label: 'Futebol', icon: 'sports-soccer' },
  { id: 'Tênis', label: 'Tênis', icon: 'sports-tennis' },
  { id: 'Vôlei', label: 'Vôlei', icon: 'sports-volleyball' },
  { id: 'Basquete', label: 'Basquete', icon: 'sports-basketball' },
];

const COURT_TYPES = [
  { id: 'public', label: 'Pública' },
  { id: 'private', label: 'Privada' },
  { id: 'arena', label: 'Arena' },
];

export function MapFiltersModal({
  visible,
  onClose,
  filters,
  onApply,
}: MapFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<MapFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const toggleSport = (sportId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter((s) => s !== sportId)
        : [...prev.sports, sportId],
    }));
  };

  const toggleCourtType = (typeId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      courtTypes: prev.courtTypes.includes(typeId)
        ? prev.courtTypes.filter((t) => t !== typeId)
        : [...prev.courtTypes, typeId],
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: MapFilters = {
      priceMin: 0,
      priceMax: 200,
      includeFree: true,
      sports: [],
      courtTypes: [],
    };
    setLocalFilters(resetFilters);
  };

  // Generate price distribution bars (mock data for visual)
  const priceBars = Array.from({ length: 20 }, (_, i) => {
    const height = Math.random() * 60 + 10;
    const inRange =
      (i / 20) * 200 >= localFilters.priceMin &&
      (i / 20) * 200 <= localFilters.priceMax;
    return { height, inRange };
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
          <Text className="text-xl font-bold text-black">Filtros</Text>
          <Pressable
            onPress={onClose}
            className="w-10 h-10 items-center justify-center"
          >
            <MaterialIcons name="close" size={24} color="#000" />
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Price Section */}
          <View className="px-5 py-6 border-b border-neutral-100">
            {/* Price Distribution Chart */}
            <View className="flex-row items-end justify-between h-20 mb-4">
              {priceBars.map((bar, index) => (
                <View
                  key={index}
                  style={{
                    height: bar.height,
                    width: 12,
                    backgroundColor: bar.inRange ? '#000' : '#E5E5E5',
                    borderRadius: 2,
                  }}
                />
              ))}
            </View>

            {/* Price Labels */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-neutral-500">Mínimo</Text>
              <Text className="text-sm text-neutral-500">Máximo</Text>
            </View>

            {/* Price Inputs */}
            <View className="flex-row items-center gap-4">
              <View className="flex-1 py-3 px-4 border border-neutral-200 rounded-xl">
                <Text className="text-base font-medium text-black">
                  R$ {localFilters.priceMin}
                </Text>
              </View>
              <Text className="text-neutral-300">—</Text>
              <View className="flex-1 py-3 px-4 border border-neutral-200 rounded-xl">
                <Text className="text-base font-medium text-black">
                  R$ {localFilters.priceMax}+
                </Text>
              </View>
            </View>

            {/* Price Slider */}
            <View className="mt-4">
              <Slider
                minimumValue={0}
                maximumValue={200}
                step={10}
                value={localFilters.priceMin}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, priceMin: value }))
                }
                minimumTrackTintColor="#000"
                maximumTrackTintColor="#E5E5E5"
                thumbTintColor="#fff"
                style={{ marginBottom: 10 }}
              />
              <Slider
                minimumValue={0}
                maximumValue={200}
                step={10}
                value={localFilters.priceMax}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, priceMax: value }))
                }
                minimumTrackTintColor="#E5E5E5"
                maximumTrackTintColor="#000"
                thumbTintColor="#fff"
              />
            </View>

            {/* Include Free Toggle */}
            <View className="flex-row items-center justify-between mt-6 pt-4 border-t border-neutral-100">
              <Text className="text-base text-black">
                Incluir quadras gratuitas
              </Text>
              <Switch
                value={localFilters.includeFree}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, includeFree: value }))
                }
                trackColor={{ false: '#E5E5E5', true: '#000' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Sports Section */}
          <View className="px-5 py-6 border-b border-neutral-100">
            <Text className="text-lg font-bold text-black mb-4">Esportes</Text>
            <View className="flex-row flex-wrap gap-2">
              {SPORTS.map((sport) => {
                const isSelected = localFilters.sports.includes(sport.id);
                return (
                  <Pressable
                    key={sport.id}
                    onPress={() => toggleSport(sport.id)}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-full border ${
                      isSelected
                        ? 'bg-black border-black'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <MaterialIcons
                      name={sport.icon as any}
                      size={18}
                      color={isSelected ? '#fff' : '#525252'}
                    />
                    <Text
                      className={`text-sm font-medium ${
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

          {/* Court Type Section */}
          <View className="px-5 py-6">
            <Text className="text-lg font-bold text-black mb-4">
              Tipo de quadra
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {COURT_TYPES.map((type) => {
                const isSelected = localFilters.courtTypes.includes(type.id);
                return (
                  <Pressable
                    key={type.id}
                    onPress={() => toggleCourtType(type.id)}
                    className={`px-4 py-3 rounded-full border ${
                      isSelected
                        ? 'bg-black border-black'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? 'text-white' : 'text-neutral-700'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="h-32" />
        </ScrollView>

        {/* Bottom Buttons */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleReset}
              className="flex-1 py-4 border border-neutral-200 rounded-full items-center"
            >
              <Text className="text-base font-semibold text-black">Limpar</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              className="flex-1 py-4 bg-black rounded-full items-center"
            >
              <Text className="text-base font-semibold text-white">
                Aplicar filtros
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
