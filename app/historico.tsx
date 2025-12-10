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
import { router } from 'expo-router';

const MATCHES = [
  { id: '1', sport: 'Beach Tennis', opponent: 'Pedro Lima', court: 'Arena Ibirapuera', score: '6-4, 6-3', result: 'win', month: 'DEZEMBRO 2024' },
  { id: '2', sport: 'Padel', opponent: 'Ana Silva', court: 'Clube Pinheiros', score: '4-6, 3-6', result: 'loss', month: 'DEZEMBRO 2024' },
  { id: '3', sport: 'Beach Tennis', opponent: 'Carlos Mendes', court: 'Arena Beach', score: '6-2, 6-4', result: 'win', month: 'DEZEMBRO 2024' },
  { id: '4', sport: 'Futebol', opponent: 'Pelada Sábado', court: 'CERET', score: '3-2', result: 'win', month: 'NOVEMBRO 2024' },
  { id: '5', sport: 'Vôlei', opponent: 'Time B', court: 'Quadra Ibirapuera', score: '1-2', result: 'loss', month: 'NOVEMBRO 2024' },
];

export default function HistoricoScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Stats
  const totalMatches = MATCHES.length;
  const wins = MATCHES.filter(m => m.result === 'win').length;
  const losses = MATCHES.filter(m => m.result === 'loss').length;
  const winRate = Math.round((wins / totalMatches) * 100);

  // Group by month
  const groupedMatches = MATCHES.reduce((acc, match) => {
    if (!acc[match.month]) acc[match.month] = [];
    acc[match.month].push(match);
    return acc;
  }, {} as Record<string, typeof MATCHES>);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Histórico</Text>
        <TouchableOpacity className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
          <MaterialIcons name="tune" size={20} color="#737373" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View className="flex-row mx-5 mb-6 gap-2">
        <View className="flex-1 items-center py-3">
          <Text className="text-2xl font-bold text-black">{totalMatches}</Text>
          <Text className="text-neutral-500 text-sm">Partidas</Text>
        </View>
        <View className="flex-1 items-center py-3">
          <Text className="text-2xl font-bold text-green-600">{wins}</Text>
          <Text className="text-neutral-500 text-sm">Vitórias</Text>
        </View>
        <View className="flex-1 items-center py-3">
          <Text className="text-2xl font-bold text-red-500">{losses}</Text>
          <Text className="text-neutral-500 text-sm">Derrotas</Text>
        </View>
        <View className="flex-1 items-center py-3">
          <Text className="text-2xl font-bold text-black">{winRate}%</Text>
          <Text className="text-neutral-500 text-sm">Win Rate</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {Object.entries(groupedMatches).map(([month, matches]) => (
          <View key={month}>
            <Text className="px-5 text-xs text-neutral-400 uppercase tracking-wide mb-3">
              {month}
            </Text>

            {matches.map((match) => (
              <TouchableOpacity
                key={match.id}
                className="mx-5 mb-3 p-4 bg-white border border-neutral-100 rounded-2xl"
                onPress={() => router.push(`/match/${match.id}` as any)}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                      match.result === 'win' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <MaterialIcons
                      name={match.result === 'win' ? 'check' : 'close'}
                      size={24}
                      color={match.result === 'win' ? '#22C55E' : '#EF4444'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-black">{match.sport}</Text>
                    <Text className="text-neutral-500 text-sm">
                      vs {match.opponent} · {match.court}
                    </Text>
                  </View>
                  <Text
                    className={`font-bold ${
                      match.result === 'win' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {match.score}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Load More */}
        <TouchableOpacity className="mx-5 mb-6 py-4 bg-neutral-100 rounded-full items-center">
          <Text className="text-neutral-600 font-medium">Carregar mais</Text>
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
