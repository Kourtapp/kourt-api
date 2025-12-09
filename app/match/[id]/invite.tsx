import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Profile } from '@/types/database.types';

interface InvitedPlayer extends Profile {
  status: 'confirmed' | 'pending' | 'declined' | 'removed';
}

export default function InvitePlayersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const [invitedPlayers, setInvitedPlayers] = useState<InvitedPlayer[]>([]);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState<any>(null);

  useEffect(() => {
    fetchMatchDetails();
    fetchInvitedPlayers();
    fetchSuggestions();
  }, [id]);

  const fetchMatchDetails = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('matches')
      .select('*, court:courts(name)')
      .eq('id', id)
      .single();

    if (data) setMatchDetails(data);
  };

  const fetchInvitedPlayers = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('match_players')
      .select('*, user:profiles(*)')
      .eq('match_id', id);

    if (data) {
      const formatted = data.map((mp: any) => ({
        ...mp.user,
        status: mp.status,
      }));
      setInvitedPlayers(formatted);
    }
  };

  const fetchSuggestions = async () => {
    // Fetch users who are NOT already invited
    // For simplicity, just fetching random 5 users for now
    // In production, this should be smarter (friends, same level, etc)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', profile?.id)
      .limit(10);

    if (data) {
      // Filter out already invited
      setSuggestions(data);
    }
    setLoading(false);
  };

  const handleInvite = async (player: Profile) => {
    if (!id || !profile) return;

    try {
      const { error } = await supabase
        .from('match_players')
        .insert({
          match_id: id,
          user_id: player.id,
          status: 'pending',
          team: 1, // Default team
        });

      if (error) throw error;

      // Update local state
      setSuggestions(prev => prev.filter(p => p.id !== player.id));
      setInvitedPlayers(prev => [...prev, { ...player, status: 'pending' }]);

      Alert.alert('Sucesso', `Convite enviado para ${player.name || player.username}!`);
    } catch (error) {
      console.error('Error inviting player:', error);
      Alert.alert('Erro', 'Não foi possível enviar o convite.');
    }
  };

  const handleRemove = async (playerId: string) => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('match_players')
        .delete()
        .eq('match_id', id)
        .eq('user_id', playerId);

      if (error) throw error;

      const player = invitedPlayers.find(p => p.id === playerId);
      if (player) {
        setInvitedPlayers(prev => prev.filter(p => p.id !== playerId));
        // Add back to suggestions if appropriate
        setSuggestions(prev => [...prev, player]);
      }
    } catch (error) {
      console.error('Error removing player:', error);
      Alert.alert('Erro', 'Não foi possível remover o jogador.');
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

  const PlayerAvatar = ({ url, name }: { url?: string | null, name?: string | null }) => (
    <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
      {url ? (
        <Image source={{ uri: url }} className="w-full h-full" />
      ) : (
        <Text className="text-gray-600 font-semibold text-lg">
          {name?.charAt(0).toUpperCase() || '?'}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  const confirmedCount = invitedPlayers.filter(p => p.status === 'confirmed').length;
  const maxPlayers = matchDetails?.max_players || 4;

  // Filter suggestions to exclude already invited
  const filteredSuggestions = suggestions.filter(
    s => !invitedPlayers.some(ip => ip.id === s.id)
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
        {matchDetails && (
          <View className="mx-4 mb-6 p-4 bg-gray-50 rounded-2xl">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-[#22C55E]/10 items-center justify-center mr-3">
                <MaterialIcons name="sports-tennis" size={20} color="#22C55E" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">{matchDetails.sport}</Text>
                <Text className="text-sm text-gray-500">{matchDetails.court?.name || matchDetails.location_name || 'Local não definido'}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="flex-row items-center mr-6">
                <MaterialIcons name="event" size={16} color="#6B7280" />
                <Text className="ml-1.5 text-sm text-gray-600">{matchDetails.date}</Text>
              </View>
              <View className="flex-row items-center mr-6">
                <MaterialIcons name="access-time" size={16} color="#6B7280" />
                <Text className="ml-1.5 text-sm text-gray-600">{matchDetails.start_time?.substring(0, 5)}</Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="people" size={16} color="#6B7280" />
                <Text className="ml-1.5 text-sm text-gray-600">{confirmedCount}/{maxPlayers}</Text>
              </View>
            </View>
          </View>
        )}

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
                  <PlayerAvatar url={player.avatar_url} name={player.name} />
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-medium text-gray-900">{player.name || 'Usuário'}</Text>
                    <Text className="text-sm text-gray-500">{player.username || '@usuario'}</Text>
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
            Jogadores da comunidade
          </Text>

          <View className="space-y-3">
            {filteredSuggestions.map((player) => (
              <View
                key={player.id}
                className="flex-row items-center bg-white border border-gray-100 rounded-xl p-3"
              >
                <PlayerAvatar url={player.avatar_url} name={player.name} />
                <View className="flex-1 ml-3">
                  <Text className="text-base font-medium text-gray-900">{player.name || 'Usuário'}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-500">{player.username || '@usuario'}</Text>
                    <Text className="text-sm text-gray-300 mx-1">•</Text>
                    <Text className="text-sm text-gray-500">Nível {player.level || 1}</Text>
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
        <TouchableOpacity
          onPress={handleComplete}
          className="bg-black rounded-full py-4 items-center shadow-lg"
          activeOpacity={0.8}
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }}
        >
          <Text className="text-white font-semibold text-base">
            Concluir ({confirmedCount}/{maxPlayers} jogadores)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
