import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Player {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  level: string;
  status?: 'confirmed' | 'pending' | 'suggested';
}

const mockInvited: Player[] = [
  {
    id: '1',
    name: 'Lucas Mendes',
    username: '@lucasmendes',
    level: 'Intermediário',
    status: 'confirmed',
  },
];

const mockSuggestions: Player[] = [
  {
    id: '2',
    name: 'Fernanda Oliveira',
    username: '@feoliveira',
    level: 'Intermediário',
    status: 'suggested',
  },
  {
    id: '3',
    name: 'Ricardo Santos',
    username: '@ricardosantos',
    level: 'Avançado',
    status: 'suggested',
  },
  {
    id: '4',
    name: 'Marina Costa',
    username: '@marinacosta',
    level: 'Intermediário',
    status: 'suggested',
  },
];

export default function InvitePlayersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedPlayers, setInvitedPlayers] = useState<Player[]>(mockInvited);
  const [suggestions, setSuggestions] = useState<Player[]>(mockSuggestions);

  // TODO: Fetch match details by ID
  const maxPlayers = 4;
  const sport = 'BeachTennis';
  const venue = 'Arena Ibirapuera';
  const date = 'Hoje';
  const time = '18:00';

  const confirmedCount = invitedPlayers.filter(p => p.status === 'confirmed').length;

  const handleInvite = (player: Player) => {
    setSuggestions(prev => prev.filter(p => p.id !== player.id));
    setInvitedPlayers(prev => [...prev, { ...player, status: 'pending' }]);
  };

  const handleRemove = (playerId: string) => {
    const player = invitedPlayers.find(p => p.id === playerId);
    if (player) {
      setInvitedPlayers(prev => prev.filter(p => p.id !== playerId));
      setSuggestions(prev => [...prev, { ...player, status: 'suggested' }]);
    }
  };

  const handleSkip = () => {
    router.push(`/match/${id}/checkin` as any);
  };

  const handleComplete = () => {
    router.push(`/match/${id}/checkin` as any);
  };

  const handleSearchPlayers = () => {
    router.push('/match/search-players' as any);
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
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Convidar Jogadores</Text>
        <TouchableOpacity onPress={handleSkip} className="p-2 -mr-2">
          <Text className="text-gray-500 font-medium">Pular</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-4 py-4">
          <TouchableOpacity
            onPress={handleSearchPlayers}
            className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3"
          >
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
            <Text className="flex-1 ml-3 text-gray-400">Buscar jogadores...</Text>
          </TouchableOpacity>
        </View>

        {/* Match Info Card */}
        <View className="mx-4 mb-6 p-4 bg-gray-50 rounded-2xl">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-[#22C55E]/10 items-center justify-center mr-3">
              <MaterialIcons name="sports-tennis" size={20} color="#22C55E" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">{sport}</Text>
              <Text className="text-sm text-gray-500">{venue}</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="flex-row items-center mr-6">
              <MaterialIcons name="event" size={16} color="#6B7280" />
              <Text className="ml-1.5 text-sm text-gray-600">{date}</Text>
            </View>
            <View className="flex-row items-center mr-6">
              <MaterialIcons name="access-time" size={16} color="#6B7280" />
              <Text className="ml-1.5 text-sm text-gray-600">{time}</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="people" size={16} color="#6B7280" />
              <Text className="ml-1.5 text-sm text-gray-600">{confirmedCount}/{maxPlayers}</Text>
            </View>
          </View>
        </View>

        {/* Invited Players Section */}
        <View className="px-4 mb-6">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Convidados
          </Text>

          {invitedPlayers.length === 0 ? (
            <View className="py-8 items-center">
              <MaterialIcons name="person-add" size={32} color="#D1D5DB" />
              <Text className="mt-2 text-gray-400 text-center">
                Nenhum jogador convidado ainda
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {invitedPlayers.map((player) => (
                <View
                  key={player.id}
                  className="flex-row items-center bg-white border border-gray-100 rounded-xl p-3"
                >
                  <PlayerAvatar name={player.name} />
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-medium text-gray-900">{player.name}</Text>
                    <Text className="text-sm text-gray-500">{player.username}</Text>
                  </View>
                  {player.status === 'confirmed' ? (
                    <View className="flex-row items-center bg-[#22C55E]/10 px-3 py-1.5 rounded-full">
                      <MaterialIcons name="check-circle" size={14} color="#22C55E" />
                      <Text className="ml-1 text-xs font-medium text-[#22C55E]">Confirmado</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <View className="bg-yellow-100 px-3 py-1.5 rounded-full mr-2">
                        <Text className="text-xs font-medium text-yellow-700">Pendente</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemove(player.id)}
                        className="p-1"
                      >
                        <MaterialIcons name="close" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Suggestions Section */}
        <View className="px-4 pb-32">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Sugestões
          </Text>
          <Text className="text-xs text-gray-400 mb-3">
            Jogadores com nível similar ao seu
          </Text>

          <View className="space-y-3">
            {suggestions.map((player) => (
              <View
                key={player.id}
                className="flex-row items-center bg-white border border-gray-100 rounded-xl p-3"
              >
                <PlayerAvatar name={player.name} />
                <View className="flex-1 ml-3">
                  <Text className="text-base font-medium text-gray-900">{player.name}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-500">{player.username}</Text>
                    <Text className="text-sm text-gray-300 mx-1">•</Text>
                    <Text className="text-sm text-gray-500">{player.level}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleInvite(player)}
                  className="bg-[#22C55E] px-4 py-2 rounded-full"
                >
                  <Text className="text-white font-medium text-sm">Convidar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 pb-8">
        <TouchableOpacity onPress={handleComplete}>
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              Concluir ({confirmedCount}/{maxPlayers} jogadores)
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
