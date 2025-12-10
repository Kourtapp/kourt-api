import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRegisterMatch } from '@/contexts/RegisterMatchContext';
import { supabase } from '@/lib/supabase';

const RESULTS = [
  { id: 'win', label: 'Vitória', icon: 'emoji-events', color: '#22C55E' },
  { id: 'loss', label: 'Derrota', icon: 'close', color: '#EF4444' },
  { id: 'draw', label: 'Empate', icon: 'handshake', color: '#F59E0B' },
];

export default function RegisterResultScreen() {
  const { data, updateData, addPlayer, removePlayer, addSet, updateSetScore } = useRegisterMatch();
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url')
      .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(10);

    setSearchResults(profiles || []);
  };

  const handleAddPlayer = (profile: any) => {
    addPlayer({
      id: profile.id,
      name: profile.name,
      username: profile.username,
      avatar_url: profile.avatar_url,
      team: selectedTeam,
    });
    setShowPlayerSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleNext = () => {
    router.push('/match/register/metrics');
  };

  const teamAPlayers = data.players.filter(p => p.team === 'A');
  const teamBPlayers = data.players.filter(p => p.team === 'B');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Resultado</Text>
        <Text className="text-neutral-400 font-medium">3/4</Text>
      </View>

      {/* Progress Bar */}
      <View className="flex-row px-5 gap-2 mb-6">
        <View className="flex-1 h-1 bg-black rounded-full" />
        <View className="flex-1 h-1 bg-black rounded-full" />
        <View className="flex-1 h-1 bg-black rounded-full" />
        <View className="flex-1 h-1 bg-neutral-200 rounded-full" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Result Selection */}
        <Text className="text-base font-bold text-black mb-3">Como foi a partida?</Text>
        <View className="flex-row gap-3 mb-6">
          {RESULTS.map((result) => {
            const isSelected = data.result === result.id;
            return (
              <TouchableOpacity
                key={result.id}
                onPress={() => updateData({ result: result.id as any })}
                className={`flex-1 py-4 rounded-2xl items-center border-2 ${
                  isSelected
                    ? 'bg-green-50 border-green-500'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <MaterialIcons
                  name={result.icon as any}
                  size={28}
                  color={isSelected ? result.color : '#A3A3A3'}
                />
                <Text
                  className={`mt-2 font-semibold ${
                    isSelected ? 'text-green-600' : 'text-neutral-400'
                  }`}
                >
                  {result.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Score Input */}
        <Text className="text-base font-bold text-black mb-3">Placar (opcional)</Text>
        <View className="bg-neutral-50 rounded-2xl p-4 mb-6">
          {/* Score Headers */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 items-center">
              <Text className="text-sm text-neutral-500 font-medium">Você</Text>
            </View>
            <View className="w-12" />
            <View className="flex-1 items-center">
              <Text className="text-sm text-neutral-500 font-medium">Adversário</Text>
            </View>
          </View>

          {/* Sets */}
          {data.score.teamA.map((_, setIndex) => (
            <View key={setIndex} className="flex-row items-center mb-4">
              {/* Team A Score */}
              <View className="flex-1 flex-row items-center justify-center gap-3">
                <TouchableOpacity
                  onPress={() => updateSetScore(setIndex, 'teamA', Math.max(0, data.score.teamA[setIndex] - 1))}
                  className="w-10 h-10 bg-neutral-200 rounded-xl items-center justify-center"
                >
                  <MaterialIcons name="remove" size={20} color="#737373" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-black w-10 text-center">
                  {data.score.teamA[setIndex]}
                </Text>
                <TouchableOpacity
                  onPress={() => updateSetScore(setIndex, 'teamA', data.score.teamA[setIndex] + 1)}
                  className="w-10 h-10 bg-black rounded-xl items-center justify-center"
                >
                  <MaterialIcons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* X Divider */}
              <View className="w-12 items-center">
                <Text className="text-neutral-300 text-xl">×</Text>
              </View>

              {/* Team B Score */}
              <View className="flex-1 flex-row items-center justify-center gap-3">
                <TouchableOpacity
                  onPress={() => updateSetScore(setIndex, 'teamB', Math.max(0, data.score.teamB[setIndex] - 1))}
                  className="w-10 h-10 bg-neutral-200 rounded-xl items-center justify-center"
                >
                  <MaterialIcons name="remove" size={20} color="#737373" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-black w-10 text-center">
                  {data.score.teamB[setIndex]}
                </Text>
                <TouchableOpacity
                  onPress={() => updateSetScore(setIndex, 'teamB', data.score.teamB[setIndex] + 1)}
                  className="w-10 h-10 bg-black rounded-xl items-center justify-center"
                >
                  <MaterialIcons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add Set Button */}
          <TouchableOpacity
            onPress={addSet}
            className="py-3 items-center"
          >
            <Text className="text-neutral-500 font-medium">+ Adicionar set</Text>
          </TouchableOpacity>
        </View>

        {/* Players */}
        <Text className="text-base font-bold text-black mb-3">Jogadores</Text>

        {/* Your Team */}
        <Text className="text-xs text-neutral-400 mb-2 uppercase tracking-wide font-semibold">
          Seu Time
        </Text>
        <View className="mb-4">
          {/* Current User */}
          <View className="flex-row items-center bg-green-50 border border-green-200 p-3 rounded-2xl mb-2">
            <View className="w-10 h-10 bg-black rounded-full items-center justify-center">
              <MaterialIcons name="person" size={20} color="#fff" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-black">Você</Text>
              <Text className="text-sm text-neutral-500">@alexandrepato</Text>
            </View>
            <View className="bg-green-100 px-2 py-1 rounded">
              <Text className="text-green-700 text-xs font-bold">VOCÊ</Text>
            </View>
          </View>

          {/* Team A Players */}
          {teamAPlayers.map((player) => (
            <View
              key={player.id}
              className="flex-row items-center bg-neutral-50 p-3 rounded-2xl mb-2"
            >
              {player.avatar_url ? (
                <Image source={{ uri: player.avatar_url }} className="w-10 h-10 rounded-full" />
              ) : (
                <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
                  <MaterialIcons name="person" size={20} color="#737373" />
                </View>
              )}
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-black">{player.name}</Text>
                {player.username && (
                  <Text className="text-sm text-neutral-500">@{player.username}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => removePlayer(player.id)}>
                <MaterialIcons name="close" size={20} color="#A3A3A3" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Opponents */}
        <Text className="text-xs text-neutral-400 mb-2 uppercase tracking-wide font-semibold">
          Adversários
        </Text>
        <View className="mb-6">
          {teamBPlayers.map((player) => (
            <View
              key={player.id}
              className="flex-row items-center bg-neutral-50 p-3 rounded-2xl mb-2"
            >
              {player.avatar_url ? (
                <Image source={{ uri: player.avatar_url }} className="w-10 h-10 rounded-full" />
              ) : (
                <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
                  <MaterialIcons name="person" size={20} color="#737373" />
                </View>
              )}
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-black">{player.name}</Text>
                {player.username && (
                  <Text className="text-sm text-neutral-500">@{player.username}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => removePlayer(player.id)}>
                <MaterialIcons name="close" size={20} color="#A3A3A3" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Opponent Button */}
          <TouchableOpacity
            onPress={() => {
              setSelectedTeam('B');
              setShowPlayerSearch(true);
            }}
            className="flex-row items-center justify-center gap-2 py-4 border-2 border-dashed border-neutral-200 rounded-2xl"
          >
            <MaterialIcons name="person-add" size={20} color="#A3A3A3" />
            <Text className="text-neutral-400 font-medium">Adicionar adversário</Text>
          </TouchableOpacity>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-black py-4 rounded-full items-center"
        >
          <Text className="text-white font-bold text-base">Próximo</Text>
        </TouchableOpacity>
      </View>

      {/* Player Search Modal */}
      <Modal
        visible={showPlayerSearch}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlayerSearch(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 pb-8 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-black">
                {selectedTeam === 'A' ? 'Adicionar ao seu time' : 'Adicionar adversário'}
              </Text>
              <TouchableOpacity onPress={() => setShowPlayerSearch(false)}>
                <MaterialIcons name="close" size={24} color="#737373" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3 mb-4">
              <MaterialIcons name="search" size={20} color="#A3A3A3" />
              <TextInput
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Buscar jogador..."
                placeholderTextColor="#A3A3A3"
                className="flex-1 ml-2 text-black"
                autoFocus
              />
            </View>

            {/* Search Results */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {searchResults.map((profile) => {
                const alreadyAdded = data.players.some(p => p.id === profile.id);
                return (
                  <TouchableOpacity
                    key={profile.id}
                    onPress={() => !alreadyAdded && handleAddPlayer(profile)}
                    disabled={alreadyAdded}
                    className={`flex-row items-center p-3 rounded-xl mb-2 ${
                      alreadyAdded ? 'bg-neutral-100 opacity-50' : 'bg-neutral-50'
                    }`}
                  >
                    {profile.avatar_url ? (
                      <Image source={{ uri: profile.avatar_url }} className="w-12 h-12 rounded-full" />
                    ) : (
                      <View className="w-12 h-12 bg-neutral-200 rounded-full items-center justify-center">
                        <MaterialIcons name="person" size={24} color="#737373" />
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <Text className="font-semibold text-black">{profile.name}</Text>
                      {profile.username && (
                        <Text className="text-sm text-neutral-500">@{profile.username}</Text>
                      )}
                    </View>
                    {alreadyAdded ? (
                      <MaterialIcons name="check" size={24} color="#22C55E" />
                    ) : (
                      <MaterialIcons name="add-circle-outline" size={24} color="#737373" />
                    )}
                  </TouchableOpacity>
                );
              })}
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <Text className="text-center text-neutral-500 py-8">
                  Nenhum jogador encontrado
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
