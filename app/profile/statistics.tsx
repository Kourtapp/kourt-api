import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

type PeriodFilter = 'Este ano' | 'Todos' | '2024' | '2023';

export default function StatisticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('Este ano');

  const periods: PeriodFilter[] = ['Este ano', 'Todos', '2024', '2023'];

  // Mock data
  const yearSummary = {
    totalMatches: 247,
    matchesGrowth: '+23%',
    playTime: '186h',
    playTimeGrowth: '+18%',
  };

  const analysisData = [
    { sets: 2, count: 8 },
    { sets: 3, count: 12 },
    { sets: 2, count: 10 },
    { sets: 3, count: 14 },
    { sets: 2, count: 11 },
    { sets: 3, count: 15 },
    { sets: 2, count: 9 },
    { sets: 3, count: 13 },
  ];

  const gamesPerSet = [
    { set: 1, games: '6-4', winPercent: 60, pts: '+24' },
    { set: 2, games: '6-3', winPercent: 67, pts: '+28' },
    { set: 3, games: '7-5', winPercent: 58, pts: '+22' },
    { set: 4, games: '6-2', winPercent: 75, pts: '+32' },
    { set: 5, games: '6-4', winPercent: 60, pts: '+24' },
  ];

  const winsVsLosses = {
    wins: 165,
    losses: 72,
    draws: 10,
    winRate: 67,
  };

  const sportStats = [
    { sport: 'BeachTennis', matches: 156, winRate: 72, wins: 112, losses: 44, color: '#F97316' },
    { sport: 'Padel', matches: 67, winRate: 58, wins: 39, losses: 28, color: '#3B82F6' },
    { sport: 'Tênis', matches: 24, winRate: 54, wins: 13, losses: 11, color: '#22C55E' },
  ];

  const records = [
    { label: 'Maior sequência', value: '12', sublabel: 'vitórias seguidas', color: '#FEF3C7' },
    { label: 'Melhor mês', value: '34', sublabel: 'partidas (Set/24)', color: '#DBEAFE' },
    { label: 'Partida mais longa', value: '2h 45m', sublabel: 'BeachTennis', color: '#FEF3C7' },
    { label: 'Parceiros', value: '47', sublabel: 'jogadores diferentes', color: '#DCFCE7' },
  ];

  const frequentCourts = [
    { rank: 1, name: 'Arena BeachIbirapuera', matches: 67, winRate: 78, favorite: true },
    { rank: 2, name: 'Padel Club Jardins', matches: 43, winRate: 62 },
    { rank: 3, name: 'Tennis Park Vila Nova', matches: 28, winRate: 54 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Estatísticas</Text>
        <TouchableOpacity>
          <MaterialIcons name="info-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Period Filter */}
      <View className="px-5 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-full ${
                  selectedPeriod === period ? 'bg-black' : 'bg-white border border-neutral-200'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedPeriod === period ? 'text-white' : 'text-black'
                  }`}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Year Summary */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            RESUMO DO ANO
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
              <Text className="text-neutral-500 text-sm">Total de Partidas</Text>
              <Text className="text-3xl font-bold text-black">{yearSummary.totalMatches}</Text>
              <Text className="text-green-600 text-sm">{yearSummary.matchesGrowth} vs ano anterior</Text>
            </View>
            <View className="flex-1 bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
              <Text className="text-neutral-500 text-sm">Tempo de Jogo</Text>
              <Text className="text-3xl font-bold text-black">{yearSummary.playTime}</Text>
              <Text className="text-green-600 text-sm">{yearSummary.playTimeGrowth} vs ano anterior</Text>
            </View>
          </View>
        </View>

        {/* Match Analysis Chart */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 bg-black rounded-lg items-center justify-center">
              <MaterialIcons name="bar-chart" size={18} color="#fff" />
            </View>
            <Text className="text-base font-bold text-black">Análise de Partidas</Text>
          </View>
          <View className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
            <View className="flex-row items-end justify-between h-32 mb-2">
              {analysisData.map((item, index) => (
                <View key={index} className="items-center flex-1">
                  <View
                    className="w-6 bg-blue-400 rounded-t"
                    style={{ height: item.count * 6 }}
                  />
                </View>
              ))}
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-neutral-400">3 sets</Text>
              <Text className="text-xs text-neutral-400">2 sets</Text>
            </View>
            <TouchableOpacity className="mt-3">
              <Text className="text-right text-orange-500 font-medium">Ver Partidas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Games Per Set Table */}
        <View className="px-5 mb-6">
          <Text className="text-base font-bold text-black mb-4">Games por Set</Text>
          <View className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <View className="flex-row py-2 px-4 bg-neutral-50 border-b border-neutral-200">
              <Text className="w-10 text-xs text-neutral-500">Set</Text>
              <Text className="flex-1 text-xs text-neutral-500">Games</Text>
              <Text className="w-16 text-xs text-neutral-500 text-right">Win%</Text>
              <Text className="w-12 text-xs text-neutral-500 text-right">Pts</Text>
            </View>
            {gamesPerSet.map((row, index) => (
              <View
                key={index}
                className={`flex-row py-3 px-4 items-center ${
                  index < gamesPerSet.length - 1 ? 'border-b border-neutral-100' : ''
                }`}
              >
                <Text className="w-10 font-bold text-black">{row.set}</Text>
                <View className="flex-1 flex-row items-center gap-2">
                  <Text className="font-medium text-black">{row.games}</Text>
                  <View className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${row.winPercent}%` }}
                    />
                  </View>
                </View>
                <Text className="w-16 text-right text-neutral-600">{row.winPercent}%</Text>
                <Text className="w-12 text-right font-medium text-black">{row.pts}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Wins vs Losses */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            VITÓRIAS VS DERROTAS
          </Text>
          <View className="flex-row items-center gap-4">
            {/* Donut Chart Placeholder */}
            <View className="w-28 h-28 rounded-full border-8 border-green-500 items-center justify-center relative">
              <View className="absolute top-0 right-0 w-14 h-14 border-t-8 border-r-8 border-red-400 rounded-tr-full" />
              <Text className="text-xl font-bold text-black">{winsVsLosses.winRate}%</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 bg-green-500 rounded-full" />
                  <Text className="text-neutral-600">Vitórias</Text>
                </View>
                <Text className="font-bold text-black">{winsVsLosses.wins}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 bg-red-400 rounded-full" />
                  <Text className="text-neutral-600">Derrotas</Text>
                </View>
                <Text className="font-bold text-black">{winsVsLosses.losses}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 bg-amber-400 rounded-full" />
                  <Text className="text-neutral-600">Empates</Text>
                </View>
                <Text className="font-bold text-black">{winsVsLosses.draws}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* By Sport */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            POR ESPORTE
          </Text>
          <View className="gap-3">
            {sportStats.map((sport, index) => (
              <View key={index} className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${sport.color}20` }}
                >
                  <MaterialIcons name="sports-tennis" size={24} color={sport.color} />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between mb-1">
                    <Text className="font-semibold text-black">{sport.sport}</Text>
                    <Text className="font-bold text-black">{sport.matches} partidas</Text>
                  </View>
                  <View className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-1">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${sport.winRate}%`, backgroundColor: sport.color }}
                    />
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-neutral-500">{sport.winRate}% win rate</Text>
                    <Text className="text-xs text-neutral-500">{sport.wins} V · {sport.losses} D</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Records */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            RECORDES PESSOAIS
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {records.map((record, index) => (
              <View
                key={index}
                className="w-[48%] p-4 rounded-2xl border border-neutral-200"
                style={{ backgroundColor: record.color }}
              >
                <Text className="text-orange-600 font-semibold text-sm mb-1">{record.label}</Text>
                <Text className="text-3xl font-bold text-black">{record.value}</Text>
                <Text className="text-neutral-500 text-sm">{record.sublabel}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Frequent Courts */}
        <View className="px-5 mb-8">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            QUADRAS MAIS FREQUENTES
          </Text>
          <View className="gap-2">
            {frequentCourts.map((court, index) => (
              <View
                key={index}
                className="flex-row items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-200"
              >
                <Text className="w-8 font-bold text-black text-lg">{court.rank}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-black">{court.name}</Text>
                  <Text className="text-sm text-neutral-500">
                    {court.matches} partidas · {court.winRate}% win rate
                  </Text>
                </View>
                {court.favorite && (
                  <MaterialIcons name="star-outline" size={24} color="#F59E0B" />
                )}
              </View>
            ))}
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
