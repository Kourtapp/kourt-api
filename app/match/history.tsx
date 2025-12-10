import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

type FilterType = 'todos' | 'vitorias' | 'derrotas';

interface Match {
  id: string;
  sport: string;
  result: 'win' | 'loss' | 'draw';
  score: { teamA: number[]; teamB: number[] };
  match_date: string;
  duration: number;
  court_name?: string;
  opponent_name?: string;
  opponent_avatar?: string;
}

export default function MatchHistoryScreen() {
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('todos');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('created_by', user.id)
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const filteredMatches = matches.filter((match) => {
    if (filter === 'todos') return true;
    if (filter === 'vitorias') return match.result === 'win';
    if (filter === 'derrotas') return match.result === 'loss';
    return true;
  });

  const stats = {
    total: matches.length,
    wins: matches.filter((m) => m.result === 'win').length,
    losses: matches.filter((m) => m.result === 'loss').length,
    draws: matches.filter((m) => m.result === 'draw').length,
  };

  const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;

  // Group matches by month
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const date = new Date(match.match_date);
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatScore = (score: { teamA: number[]; teamB: number[] }) => {
    return score.teamA.map((a, i) => `${a}-${score.teamB[i]}`).join(', ');
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win':
        return '#22C55E';
      case 'loss':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getResultLabel = (result: string) => {
    switch (result) {
      case 'win':
        return 'V';
      case 'loss':
        return 'D';
      default:
        return 'E';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Histórico</Text>
        <TouchableOpacity onPress={() => router.push('/match/register/photos')}>
          <MaterialIcons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Summary */}
        <Animated.View entering={FadeInDown.delay(100)} className="px-5 mb-6">
          <View className="bg-neutral-50 rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-bold text-black">Resumo</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-2xl font-bold text-black">{winRate}%</Text>
                <Text className="text-neutral-500">vitórias</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                <Text className="text-2xl font-bold text-green-600">{stats.wins}</Text>
                <Text className="text-sm text-green-600">Vitórias</Text>
              </View>
              <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
                <Text className="text-2xl font-bold text-red-600">{stats.losses}</Text>
                <Text className="text-sm text-red-600">Derrotas</Text>
              </View>
              <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center">
                <Text className="text-2xl font-bold text-amber-600">{stats.draws}</Text>
                <Text className="text-sm text-amber-600">Empates</Text>
              </View>
            </View>

            {/* Win rate bar */}
            <View className="mt-4">
              <View className="h-2 bg-neutral-200 rounded-full overflow-hidden flex-row">
                <View
                  className="h-full bg-green-500"
                  style={{ width: `${(stats.wins / (stats.total || 1)) * 100}%` }}
                />
                <View
                  className="h-full bg-red-500"
                  style={{ width: `${(stats.losses / (stats.total || 1)) * 100}%` }}
                />
                <View
                  className="h-full bg-amber-500"
                  style={{ width: `${(stats.draws / (stats.total || 1)) * 100}%` }}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Filter Tabs */}
        <View className="flex-row px-5 gap-2 mb-4">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'vitorias', label: 'Vitórias' },
            { id: 'derrotas', label: 'Derrotas' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setFilter(tab.id as FilterType)}
              className={`px-4 py-2 rounded-full ${
                filter === tab.id ? 'bg-black' : 'bg-neutral-100'
              }`}
            >
              <Text
                className={`font-medium ${
                  filter === tab.id ? 'text-white' : 'text-black'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Match List */}
        {Object.entries(groupedMatches).map(([monthYear, monthMatches], groupIndex) => (
          <Animated.View
            key={monthYear}
            entering={FadeInDown.delay(200 + groupIndex * 100)}
            className="px-5 mb-6"
          >
            <Text className="text-sm text-neutral-500 font-semibold uppercase mb-3">
              {monthYear}
            </Text>

            {monthMatches.map((match, index) => (
              <TouchableOpacity
                key={match.id}
                onPress={() => router.push(`/match/${match.id}/stats`)}
                className="flex-row items-center bg-neutral-50 rounded-2xl p-4 mb-2"
              >
                {/* Result Badge */}
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${getResultColor(match.result)}20` }}
                >
                  <Text
                    className="text-lg font-bold"
                    style={{ color: getResultColor(match.result) }}
                  >
                    {getResultLabel(match.result)}
                  </Text>
                </View>

                {/* Match Info */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-semibold text-black">{match.sport}</Text>
                    <Text className="text-neutral-400">·</Text>
                    <Text className="text-neutral-500">{formatScore(match.score)}</Text>
                  </View>
                  <Text className="text-sm text-neutral-500">
                    {formatDate(match.match_date)} · {match.duration}min
                  </Text>
                </View>

                {/* Opponent Avatar */}
                {match.opponent_avatar ? (
                  <Image
                    source={{ uri: match.opponent_avatar }}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
                    <MaterialIcons name="person" size={20} color="#737373" />
                  </View>
                )}

                <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
              </TouchableOpacity>
            ))}
          </Animated.View>
        ))}

        {filteredMatches.length === 0 && !loading && (
          <View className="items-center py-12">
            <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="sports-tennis" size={40} color="#A3A3A3" />
            </View>
            <Text className="text-lg font-semibold text-black mb-2">
              Nenhuma partida encontrada
            </Text>
            <Text className="text-neutral-500 text-center px-8">
              Registre sua primeira partida para começar a acompanhar seu histórico
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/match/register/photos')}
              className="bg-black px-6 py-3 rounded-full mt-6"
            >
              <Text className="text-white font-semibold">Registrar Partida</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
