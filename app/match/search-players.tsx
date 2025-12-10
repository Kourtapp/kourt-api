import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database.types';
import { useAuthStore } from '@/stores/authStore';

interface PlayerProfile extends Profile {
  matches_count?: number;
  rating?: string;
  preferred_times?: string;
  is_online?: boolean;
  is_following?: boolean;
  distance?: number;
  skill_level?: string;
}

export default function SearchPlayersScreen() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string | null>('beach-tennis');
  const [selectedLevel, setSelectedLevel] = useState<string | null>('intermediate');
  const [nearbyFilter, setNearbyFilter] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [selectedSport, selectedLevel, nearbyFilter]);

  const fetchPlayers = async () => {
    setLoading(true);

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .limit(30);

      if (data) {
        const enriched = data.map((p) => ({
          ...p,
          matches_count: Math.floor(Math.random() * 200) + 10,
          rating: (Math.random() * 1 + 4).toFixed(1),
          preferred_times: ['Joga manhãs e noites', 'Joga fins de semana', 'Joga durante semana'][
            Math.floor(Math.random() * 3)
          ],
          is_online: Math.random() > 0.5,
          is_following: false,
          distance: +(Math.random() * 5 + 1).toFixed(1),
        }));
        setPlayers(enriched);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      fetchPlayers();
      return;
    }

    setLoading(true);

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(30);

      if (data) {
        const enriched = data.map((p) => ({
          ...p,
          matches_count: Math.floor(Math.random() * 200) + 10,
          rating: (Math.random() * 1 + 4).toFixed(1),
          preferred_times: ['Joga manhãs e noites', 'Joga fins de semana', 'Joga durante semana'][
            Math.floor(Math.random() * 3)
          ],
          is_online: Math.random() > 0.5,
          is_following: false,
          distance: +(Math.random() * 5 + 1).toFixed(1),
        }));
        setPlayers(enriched);
      }
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (player: PlayerProfile) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id ? { ...p, is_following: !p.is_following } : p
      )
    );
  };

  const getLevelLabel = (level: string | null | undefined) => {
    switch (level) {
      case 'beginner':
        return 'INICIANTE';
      case 'intermediate':
        return 'INTERMED.';
      case 'advanced':
        return 'AVANÇADO';
      default:
        return 'INTERMED.';
    }
  };

  const getSportsText = (player: PlayerProfile) => {
    const sports = (player as any).sports || [];
    if (sports.length === 0) return 'BeachTennis';
    return sports.slice(0, 2).map((s: string) => {
      if (s === 'beach-tennis') return 'BeachTennis';
      if (s === 'padel') return 'Padel';
      return s.charAt(0).toUpperCase() + s.slice(1);
    }).join(', ');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black ml-4">Buscar Jogadores</Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3">
          <MaterialIcons name="search" size={20} color="#A3A3A3" />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="beach tennis"
            placeholderTextColor="#A3A3A3"
            className="flex-1 ml-3 text-black"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialIcons name="close" size={20} color="#A3A3A3" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {/* Sport Filter */}
        <TouchableOpacity
          onPress={() => setSelectedSport(selectedSport === 'beach-tennis' ? null : 'beach-tennis')}
          className={`flex-row items-center px-4 py-2 rounded-full ${
            selectedSport === 'beach-tennis' ? 'bg-black' : 'bg-white border border-neutral-200'
          }`}
        >
          <MaterialIcons
            name="sports-tennis"
            size={16}
            color={selectedSport === 'beach-tennis' ? '#fff' : '#525252'}
          />
          <Text
            className={`ml-2 font-medium ${
              selectedSport === 'beach-tennis' ? 'text-white' : 'text-black'
            }`}
          >
            BeachTennis
          </Text>
        </TouchableOpacity>

        {/* Level Filter */}
        <TouchableOpacity
          onPress={() =>
            setSelectedLevel(selectedLevel === 'intermediate' ? null : 'intermediate')
          }
          className={`px-4 py-2 rounded-full ${
            selectedLevel === 'intermediate' ? 'bg-black' : 'bg-white border border-neutral-200'
          }`}
        >
          <Text
            className={`font-medium ${
              selectedLevel === 'intermediate' ? 'text-white' : 'text-black'
            }`}
          >
            Intermediário
          </Text>
        </TouchableOpacity>

        {/* Nearby Filter */}
        <TouchableOpacity
          onPress={() => setNearbyFilter(!nearbyFilter)}
          className={`px-4 py-2 rounded-full ${
            nearbyFilter ? 'bg-black' : 'bg-white border border-neutral-200'
          }`}
        >
          <Text className={`font-medium ${nearbyFilter ? 'text-white' : 'text-black'}`}>
            Perto de mim
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results Count */}
      <View className="px-5 mb-4">
        <Text className="text-neutral-500">
          {players.length} jogadores encontrados
        </Text>
      </View>

      {/* Players List */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : players.length === 0 ? (
          <View className="py-12 items-center">
            <MaterialIcons name="person-search" size={48} color="#D1D5DB" />
            <Text className="text-neutral-500 mt-4">Nenhum jogador encontrado</Text>
          </View>
        ) : (
          <View className="gap-3 pb-8">
            {players.map((player) => (
              <TouchableOpacity
                key={player.id}
                onPress={() => router.push(`/profile/${player.id}` as any)}
                className="bg-white border border-neutral-200 rounded-2xl p-4"
              >
                <View className="flex-row items-start">
                  {/* Avatar with online indicator */}
                  <View className="relative">
                    <View className="w-14 h-14 rounded-full bg-neutral-200 items-center justify-center overflow-hidden">
                      {player.avatar_url ? (
                        <Image source={{ uri: player.avatar_url }} className="w-full h-full" />
                      ) : (
                        <MaterialIcons name="person" size={28} color="#737373" />
                      )}
                    </View>
                    {player.is_online && (
                      <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </View>

                  {/* Player Info */}
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                      <Text className="text-base font-bold text-black">
                        {player.name || 'Jogador'}
                      </Text>
                      {(player as any).verified && (
                        <MaterialIcons name="verified" size={16} color="#3B82F6" style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <Text className="text-sm text-neutral-500">
                      @{player.username || 'usuario'} · {player.distance} km
                    </Text>

                    {/* Level and Stats */}
                    <View className="flex-row items-center mt-1 gap-2">
                      <View className="bg-neutral-100 px-2 py-0.5 rounded">
                        <Text className="text-xs font-semibold text-neutral-600">
                          {getLevelLabel(player.skill_level)}
                        </Text>
                      </View>
                      <Text className="text-sm text-neutral-600">
                        {player.rating} · {player.matches_count} jogos
                      </Text>
                    </View>
                  </View>

                  {/* Follow Button */}
                  <TouchableOpacity
                    onPress={() => handleFollow(player)}
                    className={`px-4 py-2 rounded-full ${
                      player.is_following ? 'bg-neutral-100' : 'bg-black'
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        player.is_following ? 'text-black' : 'text-white'
                      }`}
                    >
                      {player.is_following ? 'Seguindo' : 'Seguir'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sports and Availability */}
                <View className="flex-row items-center mt-3 pt-3 border-t border-neutral-100">
                  <MaterialIcons name="sports-tennis" size={14} color="#A3A3A3" />
                  <Text className="text-sm text-neutral-500 ml-1">
                    {getSportsText(player)}
                  </Text>
                  <Text className="text-neutral-300 mx-2">·</Text>
                  <Text className="text-sm text-neutral-500">{player.preferred_times}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
