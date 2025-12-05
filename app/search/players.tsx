import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { followService } from '@/services/followService';
import { Profile } from '@/types/database.types';

type SportFilter = 'all' | 'beach-tennis' | 'padel' | 'futebol' | 'volei';
type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

const sportFilters = [
  { id: 'all', label: 'Todos' },
  { id: 'beach-tennis', label: 'Beach Tennis' },
  { id: 'padel', label: 'Padel' },
  { id: 'futebol', label: 'Futebol' },
  { id: 'volei', label: 'Vôlei' },
];

const levelFilters = [
  { id: 'all', label: 'Todos' },
  { id: 'beginner', label: 'Iniciante' },
  { id: 'intermediate', label: 'Intermed.' },
  { id: 'advanced', label: 'Avançado' },
];

export default function GlobalPlayerSearchScreen() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');

  useEffect(() => {
    searchPlayers();
    loadFollowingIds();
  }, [sportFilter, levelFilter]);

  const loadFollowingIds = async () => {
    if (!user) return;
    const following = await followService.getFollowing(user.id);
    setFollowingIds(new Set(following.map(f => f.profile.id)));
  };

  const searchPlayers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .order('level', { ascending: false })
        .limit(50);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
      }

      if (sportFilter !== 'all') {
        query = query.contains('sports', [sportFilter]);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Filter by level if needed
      if (levelFilter !== 'all') {
        filteredData = filteredData.filter(p => {
          const levels = Object.values(p.sport_levels || {});
          return levels.includes(levelFilter);
        });
      }

      setPlayers(filteredData);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await searchPlayers();
    await loadFollowingIds();
    setRefreshing(false);
  }, [searchQuery, sportFilter, levelFilter]);

  const handleFollow = async (playerId: string) => {
    if (!user) return;

    const isFollowing = followingIds.has(playerId);

    // Optimistic update
    const newFollowingIds = new Set(followingIds);
    if (isFollowing) {
      newFollowingIds.delete(playerId);
    } else {
      newFollowingIds.add(playerId);
    }
    setFollowingIds(newFollowingIds);

    // API call
    if (isFollowing) {
      await followService.unfollow(user.id, playerId);
    } else {
      await followService.follow(user.id, playerId);
    }
  };

  const PlayerAvatar = ({ name, size = 48 }: { name: string; size?: number }) => (
    <View
      className="rounded-full bg-gray-200 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Text className="text-gray-600 font-semibold" style={{ fontSize: size / 2.5 }}>
        {name?.charAt(0).toUpperCase() || 'U'}
      </Text>
    </View>
  );

  const getLevelBadge = (sportLevels: Record<string, string>) => {
    const levels = Object.values(sportLevels || {});
    if (levels.includes('advanced')) return { label: 'Avançado', color: 'bg-purple-100 text-purple-700' };
    if (levels.includes('intermediate')) return { label: 'Intermed.', color: 'bg-orange-100 text-orange-700' };
    return { label: 'Iniciante', color: 'bg-blue-100 text-blue-700' };
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900 ml-2">
          Encontrar Jogadores
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Buscar por nome ou username..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchPlayers}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); searchPlayers(); }}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sport Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-gray-100"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
      >
        {sportFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setSportFilter(filter.id as SportFilter)}
            className={`px-4 py-2 rounded-full mr-2 ${
              sportFilter === filter.id ? 'bg-[#22C55E]' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                sportFilter === filter.id ? 'text-white' : 'text-gray-700'
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Level Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
      >
        {levelFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setLevelFilter(filter.id as LevelFilter)}
            className={`px-4 py-2 rounded-full mr-2 ${
              levelFilter === filter.id ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                levelFilter === filter.id ? 'text-white' : 'text-gray-700'
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View className="px-4 py-2">
        <Text className="text-sm text-gray-500">
          {players.length} jogadores encontrados
        </Text>
      </View>

      {/* Players List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22C55E']} />
          }
        >
          <View className="px-4 pb-8">
            {players.map((player) => {
              const levelBadge = getLevelBadge(player.sport_levels);
              const isFollowing = followingIds.has(player.id);

              return (
                <TouchableOpacity
                  key={player.id}
                  className="flex-row items-center py-4 border-b border-gray-100"
                  onPress={() => router.push(`/profile/${player.id}` as any)}
                >
                  <PlayerAvatar name={player.name || ''} />

                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                      <Text className="text-base font-semibold text-gray-900">
                        {player.name}
                      </Text>
                      {player.is_pro && (
                        <View className="ml-2 px-1.5 py-0.5 bg-[#22C55E] rounded">
                          <Text className="text-[10px] font-bold text-white">PRO</Text>
                        </View>
                      )}
                      <View className={`ml-2 px-2 py-0.5 rounded ${levelBadge.color}`}>
                        <Text className="text-[10px] font-bold">{levelBadge.label}</Text>
                      </View>
                    </View>

                    <Text className="text-sm text-gray-500">@{player.username}</Text>

                    <View className="flex-row items-center mt-1">
                      <Text className="text-xs text-gray-400">
                        Nível {player.level} • {player.total_matches} partidas
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleFollow(player.id)}
                    className={`px-4 py-2 rounded-full ${
                      isFollowing ? 'bg-gray-200' : 'bg-[#22C55E]'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isFollowing ? 'text-gray-700' : 'text-white'
                      }`}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            {players.length === 0 && !loading && (
              <View className="py-16 items-center">
                <MaterialIcons name="search-off" size={48} color="#D1D5DB" />
                <Text className="mt-4 text-gray-500 text-center">
                  Nenhum jogador encontrado
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
