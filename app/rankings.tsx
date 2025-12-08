import { View, Text, ScrollView, Pressable, Image, Modal, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { PrivateRanking, PrivateRankingMember } from '@/types/database.types';

// Sports options
const SPORTS = [
  { id: 'beach-tennis', name: 'BeachTennis' },
  { id: 'padel', name: 'Padel' },
  { id: 'tenis', name: 'Tênis' },
  { id: 'futsal', name: 'Futsal' },
  { id: 'volei', name: 'Vôlei' },
];

// Ranking types
const RANKING_TYPES = [
  { id: 'pro', name: 'PRO', icon: 'emoji-events' },
  { id: 'amador', name: 'Amador', icon: 'people' },
];

// Scope filters
const SCOPES = [
  { id: 'regional', name: 'Regional' },
  { id: 'estadual', name: 'Estadual' },
  { id: 'nacional', name: 'Nacional' },
  { id: 'mundial', name: 'Mundial' },
];



export default function RankingsScreen() {
  const { profile } = useAuthStore();
  const [selectedSport, setSelectedSport] = useState('padel');
  const [selectedType, setSelectedType] = useState<'pro' | 'amador' | 'privado'>('amador');
  const [selectedScope, setSelectedScope] = useState('estadual');
  const [showSportPicker, setShowSportPicker] = useState(false);

  // Private Rankings State
  const [privateRankings, setPrivateRankings] = useState<PrivateRanking[]>([]);
  const [loadingPrivate, setLoadingPrivate] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRankingName, setNewRankingName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const isPro = profile?.subscription === 'pro';
  const currentSport = SPORTS.find((s) => s.id === selectedSport);

  useEffect(() => {
    if (selectedType === 'privado') {
      fetchPrivateRankings();
    }
  }, [selectedType]);

  const fetchPrivateRankings = async () => {
    if (!profile?.id) return;
    setLoadingPrivate(true);
    try {
      // Fetch rankings where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('private_ranking_members')
        .select('ranking_id')
        .eq('user_id', profile.id);

      if (memberError) throw memberError;

      const rankingIds = memberData.map(m => m.ranking_id);

      // Also fetch rankings owned by user
      const { data: ownedData, error: ownedError } = await supabase
        .from('private_rankings')
        .select('*')
        .eq('owner_id', profile.id);

      if (ownedError) throw ownedError;

      // Combine IDs
      const allIds = [...new Set([...rankingIds, ...ownedData.map(r => r.id)])];

      if (allIds.length > 0) {
        const { data, error } = await supabase
          .from('private_rankings')
          .select('*')
          .in('id', allIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPrivateRankings(data || []);
      } else {
        setPrivateRankings([]);
      }
    } catch (error) {
      console.error('Error fetching private rankings:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus rankings privados.');
    } finally {
      setLoadingPrivate(false);
    }
  };

  const handleCreateRanking = async () => {
    if (!newRankingName.trim() || !profile?.id) {
      Alert.alert('Erro', 'Nome do ranking é obrigatório.');
      return;
    }

    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('private_rankings')
        .insert({
          name: newRankingName.trim(),
          sport: selectedSport,
          owner_id: profile.id,
          code: code,
        })
        .select()
        .single();

      if (error) throw error;

      // Add owner as member
      await supabase.from('private_ranking_members').insert({
        ranking_id: data.id,
        user_id: profile.id,
        points: 1000,
      });

      Alert.alert('Sucesso', `Ranking criado! Código de convite: ${code}`);
      setNewRankingName('');
      setShowCreateModal(false);
      fetchPrivateRankings();
    } catch (error) {
      console.error('Error creating ranking:', error);
      Alert.alert('Erro', 'Não foi possível criar o ranking.');
    }
  };

  const handleJoinRanking = async () => {
    if (!joinCode.trim() || !profile?.id) {
      Alert.alert('Erro', 'Código é obrigatório.');
      return;
    }

    try {
      // Find ranking by code
      const { data: ranking, error: rankingError } = await supabase
        .from('private_rankings')
        .select('id, name')
        .eq('code', joinCode.trim().toUpperCase())
        .single();

      if (rankingError || !ranking) {
        Alert.alert('Erro', 'Ranking não encontrado com este código.');
        return;
      }

      // Check if already member
      const { data: existing } = await supabase
        .from('private_ranking_members')
        .select('id')
        .eq('ranking_id', ranking.id)
        .eq('user_id', profile.id)
        .single();

      if (existing) {
        Alert.alert('Aviso', 'Você já participa deste ranking.');
        return;
      }

      // Join
      const { error: joinError } = await supabase
        .from('private_ranking_members')
        .insert({
          ranking_id: ranking.id,
          user_id: profile.id,
          points: 1000,
        });

      if (joinError) throw joinError;

      Alert.alert('Sucesso', `Você entrou no ranking "${ranking.name}"!`);
      setJoinCode('');
      setShowJoinModal(false);
      fetchPrivateRankings();
    } catch (error) {
      console.error('Error joining ranking:', error);
      Alert.alert('Erro', 'Não foi possível entrar no ranking.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-5 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()} className="mr-1">
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </Pressable>
            <Text className="text-2xl font-bold text-black">Rankings</Text>
          </View>

          {/* Sport Selector */}
          <Pressable
            onPress={() => setShowSportPicker(true)}
            className="flex-row items-center gap-2 px-3 py-2 bg-neutral-100 rounded-full"
          >
            <MaterialIcons name="sports-tennis" size={18} color="#525252" />
            <Text className="text-sm font-medium text-neutral-700">{currentSport?.name}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={18} color="#525252" />
          </Pressable>
        </View>

        {/* PRO / Amador / Privado Tabs */}
        <View className="flex-row mt-4 bg-neutral-100 rounded-xl p-1">
          {[...RANKING_TYPES, { id: 'privado', name: 'Privado', icon: 'lock' }].map((type) => (
            <Pressable
              key={type.id}
              onPress={() => {
                if (type.id === 'pro' && !isPro) {
                  router.push('/subscription' as any);
                  return;
                }
                setSelectedType(type.id as 'pro' | 'amador' | 'privado');
              }}
              className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg ${selectedType === type.id ? 'bg-black' : ''
                }`}
            >
              <MaterialIcons
                name={type.icon as any}
                size={18}
                color={selectedType === type.id ? '#fff' : '#525252'}
              />
              <Text
                className={`font-semibold ${selectedType === type.id ? 'text-white' : 'text-neutral-600'
                  }`}
              >
                {type.name}
              </Text>
              {type.id === 'pro' && !isPro && (
                <MaterialIcons name="lock" size={14} color="#9CA3AF" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Scope Filters (Hide for Private) */}
        {selectedType !== 'privado' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 -mx-5 px-5"
            contentContainerStyle={{ gap: 8 }}
          >
            {SCOPES.map((scope) => (
              <Pressable
                key={scope.id}
                onPress={() => setSelectedScope(scope.id)}
                className={`px-4 py-2 rounded-full ${selectedScope === scope.id ? 'bg-black' : 'bg-neutral-100'
                  }`}
              >
                <Text
                  className={`text-sm font-medium ${selectedScope === scope.id ? 'text-white' : 'text-neutral-600'
                    }`}
                >
                  {scope.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          selectedType === 'privado' ? (
            <RefreshControl refreshing={loadingPrivate} onRefresh={fetchPrivateRankings} />
          ) : undefined
        }
      >
        {selectedType === 'privado' ? (
          <View className="flex-1 px-5 py-6">
            <View className="flex-row gap-3 mb-6">
              <Pressable
                onPress={() => setShowCreateModal(true)}
                className="flex-1 bg-black py-4 rounded-xl items-center flex-row justify-center gap-2"
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text className="text-white font-bold">Criar</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowJoinModal(true)}
                className="flex-1 bg-neutral-100 py-4 rounded-xl items-center flex-row justify-center gap-2"
              >
                <MaterialIcons name="login" size={20} color="#000" />
                <Text className="text-black font-bold">Entrar</Text>
              </Pressable>
            </View>

            {loadingPrivate ? (
              <ActivityIndicator size="large" color="#000" className="mt-10" />
            ) : privateRankings.length > 0 ? (
              <View className="gap-4">
                {privateRankings.map((ranking) => (
                  <View key={ranking.id} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
                    <View className="flex-row justify-between items-start mb-2">
                      <View>
                        <Text className="text-lg font-bold text-black">{ranking.name}</Text>
                        <Text className="text-neutral-500 text-sm capitalize">{ranking.sport}</Text>
                      </View>
                      <View className="bg-neutral-100 px-2 py-1 rounded">
                        <Text className="text-xs font-mono text-neutral-600">{ranking.code}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between mt-2">
                      <View className="flex-row -space-x-2">
                        {/* Mock avatars for now */}
                        <View className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white" />
                        <View className="w-8 h-8 rounded-full bg-neutral-300 border-2 border-white" />
                        <View className="w-8 h-8 rounded-full bg-neutral-400 border-2 border-white items-center justify-center">
                          <Text className="text-[10px] font-bold text-white">+3</Text>
                        </View>
                      </View>
                      <Pressable className="flex-row items-center gap-1">
                        <Text className="text-lime-600 font-bold text-sm">Ver Ranking</Text>
                        <MaterialIcons name="chevron-right" size={16} color="#65a30d" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center justify-center py-10">
                <View className="w-24 h-24 bg-neutral-100 rounded-full items-center justify-center mb-6">
                  <MaterialIcons name="lock" size={40} color="#525252" />
                </View>
                <Text className="text-xl font-bold text-black text-center mb-2">
                  Nenhum Ranking Privado
                </Text>
                <Text className="text-neutral-500 text-center px-4">
                  Crie um grupo com amigos ou entre em um existente usando um código.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View className="flex-1 px-5 py-10 items-center justify-center">
            <View className="w-24 h-24 bg-neutral-100 rounded-full items-center justify-center mb-6">
              <MaterialIcons
                name={selectedType === 'pro' ? 'emoji-events' : 'leaderboard'}
                size={40}
                color="#525252"
              />
            </View>
            <Text className="text-xl font-bold text-black text-center mb-2">
              Ranking {selectedType === 'pro' ? 'PRO' : 'Amador'}
            </Text>
            <Text className="text-neutral-500 text-center px-8 mb-6">
              Em breve voce podera competir nos rankings publicos e ver sua posicao!
            </Text>
            <View className={`px-6 py-3 rounded-xl ${selectedType === 'pro' ? 'bg-amber-500' : 'bg-blue-500'}`}>
              <Text className="font-bold text-white">Em breve</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sport Picker Modal */}
      <Modal visible={showSportPicker} transparent animationType="slide">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowSportPicker(false)}
        >
          <View className="bg-white rounded-t-3xl p-5">
            <Text className="text-lg font-bold text-black mb-4">Selecionar esporte</Text>
            {SPORTS.map((sport) => (
              <Pressable
                key={sport.id}
                onPress={() => {
                  setSelectedSport(sport.id);
                  setShowSportPicker(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${selectedSport === sport.id ? 'bg-black' : 'bg-neutral-100'
                  }`}
              >
                <Text
                  className={`font-medium ${selectedSport === sport.id ? 'text-white' : 'text-black'
                    }`}
                >
                  {sport.name}
                </Text>
                {selectedSport === sport.id && (
                  <MaterialIcons name="check" size={20} color="#fff" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Create Ranking Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-3xl p-6 w-full">
            <Text className="text-xl font-bold text-black mb-4">Criar Ranking Privado</Text>

            <Text className="text-sm font-medium text-neutral-500 mb-2">Nome do Ranking</Text>
            <TextInput
              value={newRankingName}
              onChangeText={setNewRankingName}
              placeholder="Ex: Turma do Beach"
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 mb-6"
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowCreateModal(false)}
                className="flex-1 bg-neutral-100 py-3 rounded-xl items-center"
              >
                <Text className="font-bold text-black">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateRanking}
                className="flex-1 bg-black py-3 rounded-xl items-center"
              >
                <Text className="font-bold text-white">Criar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Ranking Modal */}
      <Modal visible={showJoinModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-3xl p-6 w-full">
            <Text className="text-xl font-bold text-black mb-4">Entrar em Ranking</Text>

            <Text className="text-sm font-medium text-neutral-500 mb-2">Código do Convite</Text>
            <TextInput
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="Ex: KOURT-123"
              autoCapitalize="characters"
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 mb-6"
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowJoinModal(false)}
                className="flex-1 bg-neutral-100 py-3 rounded-xl items-center"
              >
                <Text className="font-bold text-black">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleJoinRanking}
                className="flex-1 bg-black py-3 rounded-xl items-center"
              >
                <Text className="font-bold text-white">Entrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
