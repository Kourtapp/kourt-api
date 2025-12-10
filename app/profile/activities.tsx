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

type SportFilter = 'Todas' | 'BeachTennis' | 'Padel' | 'Futebol';

interface Activity {
  id: string;
  result: 'win' | 'loss' | 'draw';
  sport: string;
  score: string;
  location: string;
  time: string;
  duration: string;
  calories: number;
  bpm: number;
  opponent?: string;
}

export default function ActivitiesScreen() {
  const [selectedSport, setSelectedSport] = useState<SportFilter>('Todas');

  const sports: SportFilter[] = ['Todas', 'BeachTennis', 'Padel', 'Futebol'];

  const monthStats = {
    month: 'Dezembro 2024',
    partidas: 12,
    vitorias: 8,
    horasJogadas: '18h',
    winRate: '67%',
  };

  const activities: { date: string; items: Activity[] }[] = [
    {
      date: 'HOJE',
      items: [
        {
          id: '1',
          result: 'win',
          sport: 'BeachTennis',
          score: '6-4, 6-3',
          location: 'Arena BeachIbirapuera',
          time: '18:00 - 19:30',
          duration: '1h 30min',
          calories: 450,
          bpm: 142,
          opponent: 'vs Pedro F. e Marina S.',
        },
      ],
    },
    {
      date: 'ONTEM',
      items: [
        {
          id: '2',
          result: 'loss',
          sport: 'Padel',
          score: '4-6, 3-6',
          location: 'Padel Club Jardins',
          time: '20:00 - 21:30',
          duration: '1h 30min',
          calories: 380,
          bpm: 138,
          opponent: 'vs Lucas M. e Ana C.',
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Atividades</Text>
        <TouchableOpacity>
          <MaterialIcons name="tune" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Sport Filter */}
      <View className="px-5 pb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport}
                onPress={() => setSelectedSport(sport)}
                className={`px-4 py-2 rounded-full ${
                  selectedSport === sport ? 'bg-black' : 'bg-white border border-neutral-200'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedSport === sport ? 'text-white' : 'text-black'
                  }`}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Month Summary */}
        <View className="mx-5 mb-6 p-4 bg-white rounded-2xl border border-neutral-200">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-bold text-black">Este mês</Text>
            <Text className="text-neutral-500">{monthStats.month}</Text>
          </View>
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-black">{monthStats.partidas}</Text>
              <Text className="text-xs text-neutral-500">Partidas</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-green-600">{monthStats.vitorias}</Text>
              <Text className="text-xs text-neutral-500">Vitórias</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-black">{monthStats.horasJogadas}</Text>
              <Text className="text-xs text-neutral-500">Jogadas</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-black">{monthStats.winRate}</Text>
              <Text className="text-xs text-neutral-500">Win Rate</Text>
            </View>
          </View>
        </View>

        {/* Activities List */}
        {activities.map((group) => (
          <View key={group.date} className="mb-6">
            <Text className="px-5 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              {group.date}
            </Text>
            <View className="px-5 gap-3">
              {group.items.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  onPress={() => router.push(`/match/${activity.id}/stats` as any)}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
                >
                  {/* Result Header */}
                  <LinearGradient
                    colors={activity.result === 'win' ? ['#22C55E', '#16A34A'] : ['#EF4444', '#DC2626']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-4"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <View className="bg-white/20 px-3 py-1 rounded-full flex-row items-center gap-1">
                          <MaterialIcons
                            name={activity.result === 'win' ? 'emoji-events' : 'close'}
                            size={14}
                            color="#fff"
                          />
                          <Text className="text-white text-sm font-bold">
                            {activity.result === 'win' ? 'VITÓRIA' : 'DERROTA'}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-white text-2xl font-bold">{activity.score}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="sports-tennis" size={16} color="rgba(255,255,255,0.8)" />
                      <Text className="text-white/80">{activity.sport}</Text>
                    </View>
                  </LinearGradient>

                  {/* Details */}
                  <View className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-semibold text-black">{activity.location}</Text>
                      <Text className="text-neutral-500">{activity.time}</Text>
                    </View>
                    {activity.opponent && (
                      <View className="flex-row items-center gap-2 mb-3">
                        <View className="flex-row">
                          <View className="w-6 h-6 bg-neutral-200 rounded-full items-center justify-center">
                            <MaterialIcons name="person" size={12} color="#737373" />
                          </View>
                          <View className="w-6 h-6 bg-neutral-300 rounded-full items-center justify-center -ml-2">
                            <MaterialIcons name="person" size={12} color="#525252" />
                          </View>
                        </View>
                        <Text className="text-neutral-500 text-sm">{activity.opponent}</Text>
                      </View>
                    )}
                    <View className="flex-row gap-4">
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="schedule" size={14} color="#A3A3A3" />
                        <Text className="text-sm text-neutral-500">{activity.duration}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="local-fire-department" size={14} color="#A3A3A3" />
                        <Text className="text-sm text-neutral-500">{activity.calories} kcal</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="favorite" size={14} color="#A3A3A3" />
                        <Text className="text-sm text-neutral-500">{activity.bpm} bpm</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
