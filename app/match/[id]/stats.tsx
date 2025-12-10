import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

type TabType = 'resumo' | 'tecnica' | 'fisico';

export default function MatchStatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();

      setMatch(data);
    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'resumo', label: 'Resumo' },
    { id: 'tecnica', label: 'Técnica' },
    { id: 'fisico', label: 'Físico' },
  ];

  // Mock data for demonstration
  const rallyData = [
    { duration: '0-5s', count: 12, percentage: 30 },
    { duration: '5-10s', count: 18, percentage: 45 },
    { duration: '10-20s', count: 8, percentage: 20 },
    { duration: '20s+', count: 2, percentage: 5 },
  ];

  const heartRateZones = [
    { zone: 'Zona 1', label: 'Recuperação', bpm: '< 120', percentage: 15, color: '#94A3B8' },
    { zone: 'Zona 2', label: 'Queima de gordura', bpm: '120-140', percentage: 25, color: '#22C55E' },
    { zone: 'Zona 3', label: 'Aeróbico', bpm: '140-160', percentage: 35, color: '#EAB308' },
    { zone: 'Zona 4', label: 'Anaeróbico', bpm: '160-180', percentage: 20, color: '#F97316' },
    { zone: 'Zona 5', label: 'Máximo', bpm: '180+', percentage: 5, color: '#EF4444' },
  ];

  const techStats = {
    winners: 15,
    unforcedErrors: 8,
    aces: 3,
    doubleFaults: 2,
    firstServePercentage: 68,
    pointsWonOnFirstServe: 75,
    pointsWonOnSecondServe: 52,
  };

  const physicalStats = {
    distance: 2.4,
    avgSpeed: 4.2,
    maxSpeed: 18.5,
    calories: 485,
    avgHeartRate: 152,
    maxHeartRate: 178,
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Estatísticas</Text>
        <TouchableOpacity>
          <MaterialIcons name="share" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Match Summary Card */}
      <Animated.View entering={FadeIn.delay(100)} className="mx-5 mb-4">
        <LinearGradient
          colors={['#22C55E', '#16A34A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20, padding: 16 }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/80 text-sm">Beach Tennis</Text>
              <Text className="text-white text-3xl font-bold">6-4, 7-5</Text>
              <Text className="text-white/70 text-sm">Arena Ibirapuera · 1h 45min</Text>
            </View>
            <View className="bg-white/20 px-4 py-2 rounded-full">
              <Text className="text-white font-bold">VITÓRIA</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Tabs */}
      <View className="flex-row mx-5 bg-neutral-100 rounded-2xl p-1 mb-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === tab.id ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === tab.id ? 'text-black' : 'text-neutral-500'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === 'resumo' && (
          <Animated.View entering={FadeInDown.delay(200)} className="px-5">
            {/* Rally Duration */}
            <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-black mb-4">Duração dos Rallies</Text>
              <View className="flex-row items-end justify-between h-32">
                {rallyData.map((item, index) => (
                  <View key={index} className="items-center flex-1">
                    <Text className="text-xs text-neutral-500 mb-1">{item.count}</Text>
                    <View
                      className="w-10 bg-black rounded-t-lg"
                      style={{ height: item.percentage * 1.2 }}
                    />
                    <Text className="text-xs text-neutral-500 mt-2">{item.duration}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Court Heatmap */}
            <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-black mb-4">Cobertura de Quadra</Text>
              <View className="bg-green-600 rounded-xl p-4 aspect-[2/1]">
                {/* Simplified court representation */}
                <View className="flex-1 border-2 border-white/50 rounded-lg relative">
                  {/* Center line */}
                  <View className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50" />
                  {/* Net line */}
                  <View className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/80" />

                  {/* Heatmap zones */}
                  <View className="absolute top-2 left-2 w-12 h-12 bg-red-500/60 rounded-lg" />
                  <View className="absolute top-2 right-2 w-16 h-16 bg-yellow-500/60 rounded-lg" />
                  <View className="absolute bottom-2 left-1/4 w-20 h-14 bg-orange-500/60 rounded-lg" />
                </View>
              </View>
              <View className="flex-row justify-center gap-4 mt-3">
                <View className="flex-row items-center gap-1">
                  <View className="w-3 h-3 bg-red-500 rounded-full" />
                  <Text className="text-xs text-neutral-500">Alta</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="w-3 h-3 bg-orange-500 rounded-full" />
                  <Text className="text-xs text-neutral-500">Média</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <Text className="text-xs text-neutral-500">Baixa</Text>
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-neutral-50 rounded-2xl p-4 items-center">
                <Text className="text-3xl font-bold text-black">68%</Text>
                <Text className="text-sm text-neutral-500">1º Saque</Text>
              </View>
              <View className="flex-1 bg-neutral-50 rounded-2xl p-4 items-center">
                <Text className="text-3xl font-bold text-black">15</Text>
                <Text className="text-sm text-neutral-500">Winners</Text>
              </View>
              <View className="flex-1 bg-neutral-50 rounded-2xl p-4 items-center">
                <Text className="text-3xl font-bold text-black">3</Text>
                <Text className="text-sm text-neutral-500">Aces</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {activeTab === 'tecnica' && (
          <Animated.View entering={FadeInDown.delay(200)} className="px-5">
            {/* Serve Stats */}
            <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-black mb-4">Saque</Text>

              {/* First Serve */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-neutral-600">1º Saque In</Text>
                  <Text className="font-semibold text-black">{techStats.firstServePercentage}%</Text>
                </View>
                <View className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-black rounded-full"
                    style={{ width: `${techStats.firstServePercentage}%` }}
                  />
                </View>
              </View>

              {/* Points won on first serve */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-neutral-600">Pontos no 1º Saque</Text>
                  <Text className="font-semibold text-black">{techStats.pointsWonOnFirstServe}%</Text>
                </View>
                <View className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${techStats.pointsWonOnFirstServe}%` }}
                  />
                </View>
              </View>

              {/* Points won on second serve */}
              <View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-neutral-600">Pontos no 2º Saque</Text>
                  <Text className="font-semibold text-black">{techStats.pointsWonOnSecondServe}%</Text>
                </View>
                <View className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${techStats.pointsWonOnSecondServe}%` }}
                  />
                </View>
              </View>
            </View>

            {/* Winners vs Errors */}
            <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-black mb-4">Winners vs Erros</Text>

              <View className="flex-row gap-3">
                <View className="flex-1 bg-green-50 rounded-xl p-4 items-center">
                  <MaterialIcons name="emoji-events" size={24} color="#22C55E" />
                  <Text className="text-3xl font-bold text-green-600 mt-2">{techStats.winners}</Text>
                  <Text className="text-sm text-green-600">Winners</Text>
                </View>
                <View className="flex-1 bg-red-50 rounded-xl p-4 items-center">
                  <MaterialIcons name="error-outline" size={24} color="#EF4444" />
                  <Text className="text-3xl font-bold text-red-600 mt-2">{techStats.unforcedErrors}</Text>
                  <Text className="text-sm text-red-600">Erros NF</Text>
                </View>
              </View>

              <View className="flex-row gap-3 mt-3">
                <View className="flex-1 bg-blue-50 rounded-xl p-4 items-center">
                  <Text className="text-3xl font-bold text-blue-600">{techStats.aces}</Text>
                  <Text className="text-sm text-blue-600">Aces</Text>
                </View>
                <View className="flex-1 bg-orange-50 rounded-xl p-4 items-center">
                  <Text className="text-3xl font-bold text-orange-600">{techStats.doubleFaults}</Text>
                  <Text className="text-sm text-orange-600">Dupla Falta</Text>
                </View>
              </View>
            </View>

            {/* Shot Distribution */}
            <View className="bg-neutral-50 rounded-2xl p-4 mb-6">
              <Text className="text-base font-bold text-black mb-4">Distribuição de Golpes</Text>
              <View className="flex-row items-center gap-3">
                <View className="flex-1">
                  <View className="flex-row mb-2">
                    <View className="flex-1 h-6 bg-blue-500 rounded-l-lg" style={{ flex: 45 }} />
                    <View className="flex-1 h-6 bg-green-500" style={{ flex: 35 }} />
                    <View className="flex-1 h-6 bg-amber-500 rounded-r-lg" style={{ flex: 20 }} />
                  </View>
                  <View className="flex-row justify-between">
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 bg-blue-500 rounded-full" />
                      <Text className="text-xs text-neutral-500">Forehand 45%</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 bg-green-500 rounded-full" />
                      <Text className="text-xs text-neutral-500">Backhand 35%</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 bg-amber-500 rounded-full" />
                      <Text className="text-xs text-neutral-500">Outros 20%</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {activeTab === 'fisico' && (
          <Animated.View entering={FadeInDown.delay(200)} className="px-5">
            {/* Heart Rate Zones */}
            <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center gap-2 mb-4">
                <MaterialIcons name="favorite" size={20} color="#EF4444" />
                <Text className="text-base font-bold text-black">Zonas de Frequência Cardíaca</Text>
              </View>

              {heartRateZones.map((zone, index) => (
                <View key={index} className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <View>
                      <Text className="font-medium text-black">{zone.zone}</Text>
                      <Text className="text-xs text-neutral-500">{zone.label} ({zone.bpm} bpm)</Text>
                    </View>
                    <Text className="font-semibold text-black">{zone.percentage}%</Text>
                  </View>
                  <View className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${zone.percentage}%`, backgroundColor: zone.color }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Physical Metrics */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-neutral-50 rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialIcons name="directions-run" size={18} color="#3B82F6" />
                  <Text className="text-neutral-600 text-sm">Distância</Text>
                </View>
                <Text className="text-2xl font-bold text-black">{physicalStats.distance} km</Text>
              </View>
              <View className="flex-1 bg-neutral-50 rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialIcons name="local-fire-department" size={18} color="#F97316" />
                  <Text className="text-neutral-600 text-sm">Calorias</Text>
                </View>
                <Text className="text-2xl font-bold text-black">{physicalStats.calories}</Text>
              </View>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-neutral-50 rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialIcons name="speed" size={18} color="#22C55E" />
                  <Text className="text-neutral-600 text-sm">Vel. Média</Text>
                </View>
                <Text className="text-2xl font-bold text-black">{physicalStats.avgSpeed} km/h</Text>
              </View>
              <View className="flex-1 bg-neutral-50 rounded-2xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialIcons name="flash-on" size={18} color="#EAB308" />
                  <Text className="text-neutral-600 text-sm">Vel. Máx</Text>
                </View>
                <Text className="text-2xl font-bold text-black">{physicalStats.maxSpeed} km/h</Text>
              </View>
            </View>

            {/* Heart Rate Summary */}
            <LinearGradient
              colors={['#EC4899', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 16, marginBottom: 24 }}
            >
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="watch" size={20} color="#fff" />
                <Text className="text-white font-semibold">Frequência Cardíaca</Text>
              </View>
              <View className="flex-row">
                <View className="flex-1 bg-white/20 rounded-xl p-3 mr-2">
                  <Text className="text-white text-2xl font-bold">{physicalStats.avgHeartRate}</Text>
                  <Text className="text-white/70 text-sm">BPM Médio</Text>
                </View>
                <View className="flex-1 bg-white/20 rounded-xl p-3">
                  <Text className="text-white text-2xl font-bold">{physicalStats.maxHeartRate}</Text>
                  <Text className="text-white/70 text-sm">BPM Máximo</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
