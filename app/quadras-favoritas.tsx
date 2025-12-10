import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const FAVORITE_COURTS = [
  {
    id: '1',
    name: 'Arena Ibirapuera',
    location: 'Ibirapuera, São Paulo',
    sports: ['Beach Tennis', 'Vôlei'],
    rating: 4.8,
    visits: 12,
    image: null,
  },
  {
    id: '2',
    name: 'Clube Pinheiros',
    location: 'Pinheiros, São Paulo',
    sports: ['Padel', 'Tênis'],
    rating: 4.9,
    visits: 8,
    image: null,
  },
  {
    id: '3',
    name: 'Arena Beach SP',
    location: 'Moema, São Paulo',
    sports: ['Beach Tennis'],
    rating: 4.7,
    visits: 6,
    image: null,
  },
  {
    id: '4',
    name: 'CERET',
    location: 'Tatuapé, São Paulo',
    sports: ['Futebol', 'Vôlei', 'Basquete'],
    rating: 4.5,
    visits: 5,
    image: null,
  },
  {
    id: '5',
    name: 'Quadra do Parque',
    location: 'Vila Mariana, São Paulo',
    sports: ['Beach Tennis'],
    rating: 4.6,
    visits: 4,
    image: null,
  },
];

export default function QuadrasFavoritasScreen() {
  const [sortBy, setSortBy] = useState<'visits' | 'rating'>('visits');

  const sortedCourts = [...FAVORITE_COURTS].sort((a, b) => {
    if (sortBy === 'visits') return b.visits - a.visits;
    return b.rating - a.rating;
  });

  const totalVisits = FAVORITE_COURTS.reduce((sum, c) => sum + c.visits, 0);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Quadras Favoritas</Text>
        <TouchableOpacity className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
          <MaterialIcons name="map" size={20} color="#737373" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="flex-row mx-5 mb-4 gap-3">
        <View className="flex-1 bg-black rounded-2xl p-4">
          <Text className="text-neutral-400 text-sm">Total de Quadras</Text>
          <Text className="text-white text-2xl font-bold">{FAVORITE_COURTS.length}</Text>
        </View>
        <View className="flex-1 bg-neutral-100 rounded-2xl p-4">
          <Text className="text-neutral-500 text-sm">Visitas</Text>
          <Text className="text-black text-2xl font-bold">{totalVisits}</Text>
        </View>
      </View>

      {/* Sort Options */}
      <View className="flex-row mx-5 mb-4 gap-2">
        <TouchableOpacity
          onPress={() => setSortBy('visits')}
          className={`px-4 py-2 rounded-full ${
            sortBy === 'visits' ? 'bg-black' : 'bg-neutral-100'
          }`}
        >
          <Text className={sortBy === 'visits' ? 'text-white font-medium' : 'text-neutral-600'}>
            Mais visitadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortBy('rating')}
          className={`px-4 py-2 rounded-full ${
            sortBy === 'rating' ? 'bg-black' : 'bg-neutral-100'
          }`}
        >
          <Text className={sortBy === 'rating' ? 'text-white font-medium' : 'text-neutral-600'}>
            Melhor avaliadas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {sortedCourts.map((court, index) => (
          <TouchableOpacity
            key={court.id}
            className="mx-5 mb-3 bg-white border border-neutral-100 rounded-2xl overflow-hidden"
            onPress={() => router.push(`/court/${court.id}` as any)}
          >
            {/* Court Image Placeholder */}
            <View className="h-32 bg-neutral-200 items-center justify-center">
              <MaterialIcons name="sports-tennis" size={40} color="#D4D4D4" />
            </View>

            <View className="p-4">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-bold text-black text-lg">{court.name}</Text>
                    {index === 0 && (
                      <View className="bg-amber-100 px-2 py-0.5 rounded">
                        <Text className="text-amber-700 text-xs font-semibold">TOP 1</Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row items-center gap-1 mt-1">
                    <MaterialIcons name="place" size={14} color="#737373" />
                    <Text className="text-neutral-500 text-sm">{court.location}</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <MaterialIcons name="favorite" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Sports Tags */}
              <View className="flex-row flex-wrap gap-2 mb-3">
                {court.sports.map((sport) => (
                  <View key={sport} className="bg-neutral-100 px-3 py-1 rounded-full">
                    <Text className="text-neutral-600 text-sm">{sport}</Text>
                  </View>
                ))}
              </View>

              {/* Stats Row */}
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="star" size={16} color="#F59E0B" />
                  <Text className="text-black font-semibold">{court.rating}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="directions-run" size={16} color="#737373" />
                  <Text className="text-neutral-600">{court.visits} visitas</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add New Court */}
        <TouchableOpacity className="mx-5 mb-6 p-4 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mr-3">
              <MaterialIcons name="add" size={24} color="#737373" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-black">Descobrir Quadras</Text>
              <Text className="text-neutral-500 text-sm">Encontre novos lugares para jogar</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#D4D4D4" />
          </View>
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
