import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const MY_GEAR = [
  {
    id: '1',
    type: 'racket',
    name: 'Drop Shot Conqueror 12K',
    brand: 'Drop Shot',
    sport: 'Beach Tennis',
    year: '2024',
    isPrimary: true,
  },
  {
    id: '2',
    type: 'racket',
    name: 'Adidas Metalbone 3.2',
    brand: 'Adidas',
    sport: 'Padel',
    year: '2023',
    isPrimary: false,
  },
  {
    id: '3',
    type: 'shoes',
    name: 'Asics Gel-Resolution 9',
    brand: 'Asics',
    sport: 'Beach Tennis',
    year: '2024',
    isPrimary: true,
  },
  {
    id: '4',
    type: 'ball',
    name: 'Stage 2 Orange',
    brand: 'Tretorn',
    sport: 'Beach Tennis',
    year: '2024',
    isPrimary: false,
  },
];

const GEAR_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  racket: 'sports-tennis',
  shoes: 'directions-run',
  ball: 'sports-volleyball',
  apparel: 'checkroom',
  accessory: 'watch',
};

export default function GearScreen() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const sports = [...new Set(MY_GEAR.map(g => g.sport))];

  const filteredGear = selectedSport
    ? MY_GEAR.filter(g => g.sport === selectedSport)
    : MY_GEAR;

  const primaryGear = filteredGear.find(g => g.isPrimary && g.type === 'racket');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Meu Gear</Text>
        <TouchableOpacity className="w-10 h-10 bg-black rounded-full items-center justify-center">
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Sport Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          onPress={() => setSelectedSport(null)}
          className={`px-4 py-2 rounded-full ${
            selectedSport === null ? 'bg-black' : 'bg-neutral-100'
          }`}
        >
          <Text className={selectedSport === null ? 'text-white font-medium' : 'text-neutral-600'}>
            Todos
          </Text>
        </TouchableOpacity>
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport}
            onPress={() => setSelectedSport(sport)}
            className={`px-4 py-2 rounded-full ${
              selectedSport === sport ? 'bg-black' : 'bg-neutral-100'
            }`}
          >
            <Text className={selectedSport === sport ? 'text-white font-medium' : 'text-neutral-600'}>
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Featured Gear Card */}
        {primaryGear && (
          <View className="mx-5 mb-6">
            <LinearGradient
              colors={['#000000', '#262626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 20 }}
            >
              <View className="flex-row items-center gap-2 mb-4">
                <View className="bg-lime-400 px-3 py-1 rounded-full">
                  <Text className="text-black text-xs font-bold">PRINCIPAL</Text>
                </View>
                <Text className="text-neutral-400">{primaryGear.sport}</Text>
              </View>

              <View className="items-center mb-4">
                <View className="w-24 h-24 bg-white/10 rounded-full items-center justify-center mb-3">
                  <MaterialIcons name="sports-tennis" size={48} color="#fff" />
                </View>
                <Text className="text-white text-xl font-bold text-center">{primaryGear.name}</Text>
                <Text className="text-neutral-400">{primaryGear.brand} · {primaryGear.year}</Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-white/10 py-3 rounded-full items-center">
                  <Text className="text-white font-medium">Detalhes</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-white py-3 rounded-full items-center">
                  <Text className="text-black font-bold">Compartilhar</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Gear List */}
        <Text className="px-5 text-xs text-neutral-400 uppercase tracking-wide mb-3">
          Meu Equipamento
        </Text>

        {filteredGear.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="mx-5 mb-3 p-4 bg-white border border-neutral-100 rounded-2xl"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mr-3">
                <MaterialIcons
                  name={GEAR_ICONS[item.type] || 'sports'}
                  size={24}
                  color="#737373"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold text-black">{item.name}</Text>
                  {item.isPrimary && (
                    <View className="w-2 h-2 bg-lime-400 rounded-full" />
                  )}
                </View>
                <Text className="text-neutral-500 text-sm">
                  {item.brand} · {item.sport} · {item.year}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#D4D4D4" />
            </View>
          </TouchableOpacity>
        ))}

        {/* Add Gear */}
        <TouchableOpacity className="mx-5 mt-3 p-4 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mr-3">
              <MaterialIcons name="add" size={24} color="#737373" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-black">Adicionar Equipamento</Text>
              <Text className="text-neutral-500 text-sm">Raquetes, tênis, bolas...</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#D4D4D4" />
          </View>
        </TouchableOpacity>

        {/* Gear Stats */}
        <View className="mx-5 mt-6 mb-6 bg-neutral-50 rounded-2xl p-4">
          <Text className="text-base font-bold text-black mb-4">Estatísticas</Text>
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-black">{MY_GEAR.length}</Text>
              <Text className="text-neutral-500 text-sm">Equipamentos</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-black">{sports.length}</Text>
              <Text className="text-neutral-500 text-sm">Esportes</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-black">2</Text>
              <Text className="text-neutral-500 text-sm">Raquetes</Text>
            </View>
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
