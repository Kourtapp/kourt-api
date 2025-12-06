import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Player {
  id: string;
  name: string;
  username: string;
  distance: string;
  level: string;
  levelBadge: 'iniciante' | 'intermediario' | 'avancado';
  rating: number;
  matches: number;
  sports: string[];
  schedule: string;
  following?: boolean;
}

const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Lucas Mendes',
    username: '@lucasmendes',
    distance: '2.3 km',
    level: 'INTERMED.',
    levelBadge: 'intermediario',
    rating: 4.8,
    matches: 89,
    sports: ['BeachTennis', 'Padel'],
    schedule: 'Joga manhãs e noites',
  },
  {
    id: '2',
    name: 'Fernanda Oliveira',
    username: '@feoliveira',
    distance: '5.1 km',
    level: 'AVANÇADO',
    levelBadge: 'avancado',
    rating: 4.9,
    matches: 156,
    sports: ['BeachTennis'],
    schedule: 'Joga fins de semana',
  },
  {
    id: '3',
    name: 'Ricardo Santos',
    username: '@ricardosantos',
    distance: '1.8 km',
    level: 'INTERMED.',
    levelBadge: 'intermediario',
    rating: 4.7,
    matches: 67,
    sports: ['BeachTennis', 'Tênis'],
    schedule: 'Joga tardes',
    following: true,
  },
  {
    id: '4',
    name: 'Marina Costa',
    username: '@marinacosta',
    distance: '3.2 km',
    level: 'INICIANTE',
    levelBadge: 'iniciante',
    rating: 4.5,
    matches: 23,
    sports: ['BeachTennis'],
    schedule: 'Joga noites',
  },
  {
    id: '5',
    name: 'Carlos Eduardo',
    username: '@carlosedu',
    distance: '4.5 km',
    level: 'AVANÇADO',
    levelBadge: 'avancado',
    rating: 4.9,
    matches: 234,
    sports: ['BeachTennis', 'Padel', 'Tênis'],
    schedule: 'Joga todos os dias',
  },
];

type LevelFilter = 'all' | 'iniciante' | 'intermediario' | 'avancado';
type LocationFilter = 'all' | 'nearby';

export default function SearchPlayersScreen() {
  const [searchQuery, setSearchQuery] = useState('beach tennis');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('intermediario');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('nearby');
  const [players, setPlayers] = useState<Player[]>(mockPlayers);

  const filteredPlayers = players.filter((player) => {
    // Level filter
    if (levelFilter !== 'all' && player.levelBadge !== levelFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = player.name.toLowerCase().includes(query);
      const matchesUsername = player.username.toLowerCase().includes(query);
      const matchesSport = player.sports.some(s => s.toLowerCase().includes(query));
      if (!matchesName && !matchesUsername && !matchesSport) {
        return false;
      }
    }

    return true;
  });

  const handleFollow = (playerId: string) => {
    // First show as followed
    setPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, following: true } : p
    ));

    // Then remove from list after a short delay
    setTimeout(() => {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    }, 500);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'iniciante': return 'bg-blue-100 text-blue-700';
      case 'intermediario': return 'bg-orange-100 text-orange-700';
      case 'avancado': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const PlayerAvatar = ({ name }: { name: string }) => (
    <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
      <Text className="text-gray-600 font-semibold text-lg">
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900 ml-2">
          Buscar Jogadores
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Buscar jogadores..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-gray-100"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {/* Sport Filter */}
        <TouchableOpacity
          className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${searchQuery.toLowerCase().includes('beach')
              ? 'bg-[#22C55E]'
              : 'bg-gray-100'
            }`}
        >
          <MaterialIcons
            name="sports-tennis"
            size={16}
            color={searchQuery.toLowerCase().includes('beach') ? '#fff' : '#6B7280'}
          />
          <Text
            className={`ml-1.5 text-sm font-medium ${searchQuery.toLowerCase().includes('beach')
                ? 'text-white'
                : 'text-gray-700'
              }`}
          >
            BeachTennis
          </Text>
        </TouchableOpacity>

        {/* Level Filter */}
        <TouchableOpacity
          className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${levelFilter === 'intermediario' ? 'bg-orange-500' : 'bg-gray-100'
            }`}
          onPress={() => setLevelFilter(
            levelFilter === 'intermediario' ? 'all' : 'intermediario'
          )}
        >
          <Text
            className={`text-sm font-medium ${levelFilter === 'intermediario' ? 'text-white' : 'text-gray-700'
              }`}
          >
            Intermediário
          </Text>
        </TouchableOpacity>

        {/* Location Filter */}
        <TouchableOpacity
          className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${locationFilter === 'nearby' ? 'bg-blue-500' : 'bg-gray-100'
            }`}
          onPress={() => setLocationFilter(
            locationFilter === 'nearby' ? 'all' : 'nearby'
          )}
        >
          <MaterialIcons
            name="near-me"
            size={16}
            color={locationFilter === 'nearby' ? '#fff' : '#6B7280'}
          />
          <Text
            className={`ml-1.5 text-sm font-medium ${locationFilter === 'nearby' ? 'text-white' : 'text-gray-700'
              }`}
          >
            Perto de mim
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results Count */}
      <View className="px-4 py-3">
        <Text className="text-sm text-gray-500">
          {filteredPlayers.length} jogadores encontrados
        </Text>
      </View>

      {/* Players List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-8">
          {filteredPlayers.map((player) => (
            <TouchableOpacity
              key={player.id}
              className="flex-row py-4 border-b border-gray-100"
              onPress={() => router.push(`/profile/${player.id}` as any)}
            >
              <PlayerAvatar name={player.name} />

              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {player.name}
                    </Text>
                    <View className={`ml-2 px-2 py-0.5 rounded ${getLevelColor(player.levelBadge)}`}>
                      <Text className="text-[10px] font-bold">{player.level}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleFollow(player.id)}
                    className={`px-4 py-1.5 rounded-full ${player.following
                        ? 'bg-gray-200'
                        : 'bg-[#22C55E]'
                      }`}
                  >
                    <Text
                      className={`text-sm font-medium ${player.following ? 'text-gray-700' : 'text-white'
                        }`}
                    >
                      {player.following ? 'Seguindo' : 'Seguir'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center mt-0.5">
                  <Text className="text-sm text-gray-500">{player.username}</Text>
                  <Text className="text-sm text-gray-300 mx-1">•</Text>
                  <Text className="text-sm text-gray-500">{player.distance}</Text>
                </View>

                <View className="flex-row items-center mt-1.5">
                  <View className="flex-row items-center">
                    <MaterialIcons name="star" size={14} color="#F59E0B" />
                    <Text className="ml-0.5 text-sm text-gray-600">{player.rating}</Text>
                  </View>
                  <Text className="text-sm text-gray-300 mx-2">•</Text>
                  <Text className="text-sm text-gray-500">{player.matches} jogos</Text>
                </View>

                <View className="flex-row items-center mt-1.5">
                  <MaterialIcons name="sports-tennis" size={14} color="#9CA3AF" />
                  <Text className="ml-1 text-sm text-gray-500">
                    {player.sports.join(', ')}
                  </Text>
                  <Text className="text-sm text-gray-300 mx-1">•</Text>
                  <Text className="text-sm text-gray-500">{player.schedule}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
