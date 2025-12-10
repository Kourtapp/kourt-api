import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
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
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMatchDetails();
    fetchInvitedPlayers();
    fetchFriends();
  }, [id]);

  const fetchMatchDetails = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('matches')
      .select('*, court:courts(name)')
      .eq('id', id)
      .single();

    if (data) setMatchDetails(data);
  };

  const fetchInvitedPlayers = async () => {
    if (!id) return;
    const { data } = await supabase
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

  const fetchFriends = async () => {
    if (!profile?.id) return;

    // For now, fetch suggested players (in production, fetch actual friends)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', profile.id)
      .limit(10);

    if (data) setFriends(data);
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
          team: 1,
        });

      if (error) throw error;

      setFriends(prev => prev.filter(p => p.id !== player.id));
      setInvitedPlayers(prev => [...prev, { ...player, status: 'pending' }]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o convite.');
    }
  };

  const handleSkip = () => {
    router.push(`/match/${id}/checkin` as any);
  };

  const handleShareWhatsApp = async () => {
    const sportName = matchDetails?.sport || 'partida';
    const date = matchDetails?.date ? new Date(matchDetails.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
    const time = matchDetails?.start_time?.substring(0, 5) || '';
    const location = matchDetails?.court?.name || matchDetails?.location_name || '';

    const message = `Bora jogar ${sportName}? ${date} às ${time} em ${location}. Entre pelo Kourt: https://kourt.app/match/${id}`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const formatMatchDate = () => {
    if (!matchDetails?.date) return '';
    const date = new Date(matchDetails.date);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const confirmedCount = invitedPlayers.filter(p => p.status === 'confirmed').length + 1; // +1 for creator
  const maxPlayers = matchDetails?.max_players || 4;

  const filteredFriends = friends.filter(
    f => !invitedPlayers.some(ip => ip.id === f.id) &&
    (searchQuery === '' ||
     f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     f.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Convidar Jogadores</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-neutral-500 font-medium">Pular</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3">
            <MaterialIcons name="search" size={20} color="#A3A3A3" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar jogadores..."
              placeholderTextColor="#A3A3A3"
              className="flex-1 ml-3 text-black"
            />
          </View>
        </View>

        {/* Match Info Card */}
        {matchDetails && (
          <View className="mx-5 mb-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-black rounded-xl items-center justify-center">
                <MaterialIcons name="sports-tennis" size={24} color="#fff" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-base font-bold text-black">
                  {matchDetails.sport} · {formatMatchDate()} · {matchDetails.start_time?.substring(0, 5)}
                </Text>
                <Text className="text-sm text-neutral-500">
                  {matchDetails.court?.name || matchDetails.location_name || 'Local não definido'}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-black">{confirmedCount}/{maxPlayers}</Text>
                <Text className="text-xs text-neutral-500">jogadores</Text>
              </View>
            </View>
          </View>
        )}

        {/* Friends Section */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            SEUS AMIGOS
          </Text>

          {filteredFriends.length === 0 ? (
            <View className="py-8 items-center">
              <MaterialIcons name="person-search" size={40} color="#D1D5DB" />
              <Text className="mt-2 text-neutral-400 text-center">
                Nenhum amigo encontrado
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredFriends.map((player) => (
                <View
                  key={player.id}
                  className="flex-row items-center bg-neutral-50 rounded-2xl p-3 border border-neutral-100"
                >
                  <View className="w-12 h-12 rounded-full bg-neutral-200 items-center justify-center overflow-hidden">
                    {player.avatar_url ? (
                      <Image source={{ uri: player.avatar_url }} className="w-full h-full" />
                    ) : (
                      <MaterialIcons name="person" size={24} color="#737373" />
                    )}
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-black">
                      {player.name || 'Jogador'}
                    </Text>
                    <Text className="text-sm text-neutral-500">
                      Amigo · {matchDetails?.sport || 'BeachTennis'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleInvite(player)}
                    className="bg-black px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold text-sm">Convidar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Share Link Section */}
        <View className="mx-5 mb-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-neutral-200 rounded-xl items-center justify-center">
              <MaterialIcons name="link" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-black">Compartilhar link</Text>
              <Text className="text-sm text-neutral-500">
                Convide por WhatsApp ou redes sociais
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleShareWhatsApp}
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: '#25D366' }}
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="share" size={20} color="#fff" />
              <Text className="text-white font-bold">Compartilhar no WhatsApp</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
