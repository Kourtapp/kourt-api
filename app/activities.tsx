import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const SPORTS_FILTERS = ['Todas', 'BeachTennis', 'Padel', 'Futebol'];

const MOCK_ACTIVITIES = [
  {
    id: '1',
    sport: 'BeachTennis',
    result: 'win',
    score: '6-4, 6-3',
    court: 'Arena BeachIbirapuera',
    time: '18:00 - 19:30',
    duration: '1h 30min',
    calories: 450,
    bpm: 142,
    date: 'HOJE',
  },
  {
    id: '2',
    sport: 'Padel',
    result: 'loss',
    score: '4-6, 3-6',
    court: 'Clube Pinheiros',
    time: '10:00 - 11:00',
    duration: '1h',
    calories: 320,
    bpm: 135,
    date: 'ONTEM',
  },
  {
    id: '3',
    sport: 'BeachTennis',
    result: 'win',
    score: '6-2, 6-4',
    court: 'Arena Beach',
    time: '16:00 - 17:30',
    duration: '1h 30min',
    calories: 480,
    bpm: 148,
    date: 'ONTEM',
  },
];

export default function ActivitiesScreen() {
  const [selectedFilter, setSelectedFilter] = useState('Todas');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredActivities = MOCK_ACTIVITIES.filter(
    a => selectedFilter === 'Todas' || a.sport === selectedFilter
  );

  // Group by date
  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    if (!acc[activity.date]) acc[activity.date] = [];
    acc[activity.date].push(activity);
    return acc;
  }, {} as Record<string, typeof MOCK_ACTIVITIES>);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Atividades</Text>
        <TouchableOpacity>
          <MaterialIcons name="tune" size={24} color="#737373" />
        </TouchableOpacity>
      </View>

      {/* Sports Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {SPORTS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === filter ? 'bg-black' : 'bg-neutral-100'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedFilter === filter ? 'text-white' : 'text-black'
              }`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Month Summary */}
      <View className="mx-5 bg-neutral-50 rounded-2xl p-4 mb-6">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-neutral-500">Este mês</Text>
          <Text className="text-neutral-400 text-sm">Dezembro 2024</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-black">12</Text>
            <Text className="text-neutral-500 text-sm">Partidas</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">8</Text>
            <Text className="text-neutral-500 text-sm">Vitórias</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-black">18h</Text>
            <Text className="text-neutral-500 text-sm">Jogadas</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-black">67%</Text>
            <Text className="text-neutral-500 text-sm">Win Rate</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {Object.entries(groupedActivities).map(([date, activities]) => (
          <View key={date} className="mb-6">
            <Text className="px-5 text-xs text-neutral-400 uppercase tracking-wide mb-3">
              {date}
            </Text>

            {activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                className="mx-5 mb-3"
                onPress={() => router.push(`/match/${activity.id}` as any)}
              >
                <LinearGradient
                  colors={activity.result === 'win' ? ['#22C55E', '#16A34A'] : ['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 20, padding: 16 }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="bg-white/20 px-3 py-1 rounded-full flex-row items-center gap-1">
                      <MaterialIcons
                        name={activity.result === 'win' ? 'emoji-events' : 'close'}
                        size={14}
                        color="#fff"
                      />
                      <Text className="text-white text-sm font-semibold">
                        {activity.result === 'win' ? 'VITÓRIA' : 'DERROTA'}
                      </Text>
                    </View>
                    <Text className="text-white text-2xl font-bold">{activity.score}</Text>
                  </View>

                  <View className="flex-row items-center gap-2 mb-3">
                    <MaterialIcons name="sports-tennis" size={16} color="rgba(255,255,255,0.8)" />
                    <Text className="text-white/80">{activity.sport}</Text>
                  </View>
                </LinearGradient>

                {/* Card Bottom */}
                <View className="bg-white border border-neutral-100 rounded-b-2xl p-4 -mt-2">
                  <Text className="font-semibold text-black mb-1">{activity.court}</Text>
                  <View className="flex-row items-center gap-2 mb-2">
                    <MaterialIcons name="schedule" size={14} color="#737373" />
                    <Text className="text-neutral-500 text-sm">{activity.time}</Text>
                  </View>
                  <View className="flex-row gap-3">
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="timer" size={14} color="#737373" />
                      <Text className="text-neutral-500 text-sm">{activity.duration}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="local-fire-department" size={14} color="#737373" />
                      <Text className="text-neutral-500 text-sm">{activity.calories} kcal</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="favorite" size={14} color="#737373" />
                      <Text className="text-neutral-500 text-sm">{activity.bpm} bpm</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
