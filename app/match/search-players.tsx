import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database.types';
import { useAuthStore } from '@/stores/authStore';

type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function SearchPlayersScreen() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .order('total_matches', { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (error) throw error;
      setPlayers(data || []);
    } catch (err) {
      console.error('Error fetching players:', err);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((player) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = player.name?.toLowerCase().includes(query);
      const matchesUsername = player.username?.toLowerCase().includes(query);
      const matchesSport = player.sports?.some(s => s.toLowerCase().includes(query));
      if (!matchesName && !matchesUsername && !matchesSport) {
        return false;
      }
    }

    return true;
  });

  const getLevelBadge = (profile: Profile) => {
    const sportLevels = profile.sport_levels as Record<string, string> | null;
    if (!sportLevels) return 'Iniciante';
    const levels = Object.values(sportLevels);
    if (levels.includes('advanced') || levels.includes('pro')) return 'Avancado';
    if (levels.includes('intermediate')) return 'Intermediario';
    return 'Iniciante';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Avancado':
        return 'bg-purple-100 text-purple-700';
      case 'Intermediario':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const handleInvite = (playerId: string) => {
    router.push({
      pathname: '/match/create',
      params: { invitePlayer: playerId }
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-5 py-4 border-b border-neutral-100">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Buscar Jogadores</Text>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="Buscar por nome, esporte..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {(['all', 'beginner', 'intermediate', 'advanced'] as LevelFilter[]).map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setLevelFilter(level)}
              className={`px-4 py-2 rounded-full ${
                levelFilter === level ? 'bg-black' : 'bg-neutral-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  levelFilter === level ? 'text-white' : 'text-neutral-600'
                }`}
              >
                {level === 'all' ? 'Todos' :
                 level === 'beginner' ? 'Iniciante' :
                 level === 'intermediate' ? 'Intermediario' : 'Avancado'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : filteredPlayers.length === 0 ? (
          <View className="py-20 items-center">
            <MaterialIcons name="person-search" size={48} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-neutral-700 mt-4">
              Nenhum jogador encontrado
            </Text>
            <Text className="text-sm text-neutral-500 text-center mt-2">
              Tente ajustar os filtros ou a busca
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {filteredPlayers.map((player) => {
              const level = getLevelBadge(player);
              const levelColors = getLevelColor(level);

              return (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => router.push(`/profile/${player.id}` as any)}
                  className="bg-white border border-neutral-200 rounded-2xl p-4"
                >
                  <View className="flex-row items-start">
                    {/* Avatar */}
                    <View className="w-14 h-14 bg-neutral-200 rounded-full items-center justify-center">
                      <MaterialIcons name="person" size={28} color="#9CA3AF" />
                    </View>

                    {/* Info */}
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-semibold text-black">{player.name || 'Jogador'}</Text>
                        <View className={`px-2 py-0.5 rounded-full ${levelColors.split(' ')[0]}`}>
                          <Text className={`text-[10px] font-bold ${levelColors.split(' ')[1]}`}>
                            {level.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      {player.username && (
                        <Text className="text-sm text-neutral-500">@{player.username}</Text>
                      )}
                      <View className="flex-row items-center gap-4 mt-2">
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="sports-tennis" size={14} color="#737373" />
                          <Text className="text-xs text-neutral-600">
                            {player.total_matches || 0} partidas
                          </Text>
                        </View>
                        {player.win_rate && (
                          <View className="flex-row items-center gap-1">
                            <MaterialIcons name="trending-up" size={14} color="#22C55E" />
                            <Text className="text-xs text-neutral-600">
                              {player.win_rate}% vitórias
                            </Text>
                          </View>
                        )}
                      </View>
                      {player.sports && player.sports.length > 0 && (
                        <View className="flex-row flex-wrap gap-1 mt-2">
                          {player.sports.slice(0, 3).map((sport) => (
                            <View key={sport} className="px-2 py-0.5 bg-neutral-100 rounded">
                              <Text className="text-[10px] text-neutral-600">{sport}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Invite Button */}
                    <TouchableOpacity
                      onPress={() => handleInvite(player.id)}
                      className="px-3 py-2 bg-black rounded-xl"
                    >
                      <Text className="text-xs font-semibold text-white">Convidar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
