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

// Level filters
const LEVELS = [
  { id: 'all', name: 'Todos' },
  { id: 'iniciante', name: 'Iniciante' },
  { id: 'intermediario', name: 'Intermediário' },
  { id: 'avancado', name: 'Avançado' },
];

// Mock ranking data PRO
const MOCK_PRO_RANKING = [
  { id: '1', name: 'Ana Silva', score: 2534, level: 'pro', isPro: true },
  { id: '2', name: 'Pedro F.', score: 2156, level: 'pro', isPro: true },
  { id: '3', name: 'Lucas M.', score: 1947, level: 'pro', isPro: true },
  { id: '4', name: 'Julia Santos', score: 1823, level: 'avancado', isPro: true },
  { id: '5', name: 'Carlos Lima', score: 1756, level: 'avancado', isPro: true },
  { id: '6', name: 'Fernanda Costa', score: 1689, level: 'avancado', isPro: true },
  { id: '7', name: 'Rafael Mendes', score: 1634, level: 'intermediario', isPro: true },
  { id: '8', name: 'Camila Rocha', score: 1578, level: 'intermediario', isPro: true },
];

// Mock ranking data Amador
const MOCK_AMADOR_RANKING = [
  { id: '1', name: 'Julia Santos', score: 1734, level: 'intermediario', isPro: false },
  { id: '2', name: 'Marcos L.', score: 1456, level: 'intermediario', isPro: false },
  { id: '3', name: 'Rafael M.', score: 1398, level: 'iniciante', isPro: false },
  { id: '4', name: 'Ana Lima', score: 1287, level: 'iniciante', isPro: false },
  { id: '5', name: 'Carlos Souza', score: 1234, level: 'iniciante', isPro: false },
  { id: '6', name: 'Marina Costa', score: 1189, level: 'iniciante', isPro: false },
  { id: '7', name: 'Bruno Alves', score: 1145, level: 'iniciante', isPro: false },
  { id: '8', name: 'Leticia Ferreira', score: 1098, level: 'iniciante', isPro: false },
];

export default function RankingsScreen() {
  const { profile } = useAuthStore();
  const [selectedSport, setSelectedSport] = useState('padel');
  const [selectedType, setSelectedType] = useState<'pro' | 'amador' | 'privado'>('amador');
  const [selectedScope, setSelectedScope] = useState('estadual');
  const [selectedLevel, setSelectedLevel] = useState('all');
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
  const ranking = selectedType === 'pro' ? MOCK_PRO_RANKING : MOCK_AMADOR_RANKING;

  // User position based on type
  const userPosition = selectedType === 'pro'
    ? { position: 47, score: 1247, change: 12, nextPosition: 46, nextScore: 1251, gap: 4 }
    : { position: 23, score: 892, change: 5, nextPosition: 22, nextScore: 901, gap: 9 };

  // Podium (top 3)
  const podium = ranking.slice(0, 3);
  const restOfRanking = ranking.slice(3);

  // Ranking info
  const totalPlayers = selectedType === 'pro' ? 1247 : 4892;
  const location = 'São Paulo';

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
          <>
            {/* Ranking Info Card */}
            <View
              className={`mx-5 mt-2 p-4 rounded-2xl ${selectedType === 'pro' ? 'bg-neutral-900' : 'bg-blue-500'
                }`}
            >
              {/* ... existing card content ... */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center ${selectedType === 'pro' ? 'bg-neutral-800' : 'bg-blue-400'
                      }`}
                  >
                    <MaterialIcons
                      name={selectedType === 'pro' ? 'emoji-events' : 'people'}
                      size={22}
                      color="#fff"
                    />
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-bold text-lg">
                        Ranking {selectedType === 'pro' ? 'PRO' : 'Amador'}
                      </Text>
                      <View
                        className={`px-2 py-0.5 rounded ${selectedType === 'pro' ? 'bg-amber-500' : 'bg-blue-400'
                          }`}
                      >
                        <Text className="text-[10px] font-bold text-white">
                          {selectedType === 'pro' ? 'EXCLUSIVO PRO' : 'GRÁTIS + PLUS'}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-white/70 text-sm">
                      {location} · {totalPlayers.toLocaleString()} jogadores
                    </Text>
                  </View>
                </View>
                <Pressable className="w-8 h-8 items-center justify-center">
                  <MaterialIcons name="info-outline" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Level Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4 -mx-5 px-5 pb-4"
              contentContainerStyle={{ gap: 8 }}
            >
              {LEVELS.map((level) => (
                <Pressable
                  key={level.id}
                  onPress={() => setSelectedLevel(level.id)}
                  className={`px-4 py-2 rounded-full border ${selectedLevel === level.id
                    ? 'bg-black border-black'
                    : 'bg-white border-neutral-200'
                    }`}
                >
                  <Text
                    className={`text-sm font-medium ${selectedLevel === level.id ? 'text-white' : 'text-neutral-700'
                      }`}
                  >
                    {level.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Podium */}
            <View className="px-5 py-6">
              <View className="flex-row items-end justify-center gap-4">
                {/* 2nd Place */}
                <View className="items-center">
                  <View className="relative">
                    <View className="w-16 h-16 bg-neutral-200 rounded-full items-center justify-center border-4 border-neutral-300">
                      <MaterialIcons name="person" size={28} color="#9CA3AF" />
                    </View>
                    {podium[1]?.isPro && (
                      <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full items-center justify-center">
                        <Text className="text-[8px] font-bold text-white">PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-semibold text-black mt-2">{podium[1]?.name}</Text>
                  <Text className="text-sm text-neutral-500">{podium[1]?.score.toLocaleString()} pts</Text>
                  <View className="bg-neutral-200 px-4 py-2 rounded-xl mt-2">
                    <Text className="text-xl font-bold text-neutral-600">2</Text>
                  </View>
                </View>

                {/* 1st Place */}
                <View className="items-center -mt-6">
                  <View className="absolute -top-4">
                    <MaterialIcons name="diamond" size={24} color={selectedType === 'pro' ? '#F59E0B' : '#3B82F6'} />
                  </View>
                  <View className="relative mt-4">
                    <View
                      className={`w-20 h-20 rounded-full items-center justify-center border-4 ${selectedType === 'pro' ? 'bg-amber-100 border-amber-400' : 'bg-blue-100 border-blue-400'
                        }`}
                    >
                      <MaterialIcons name="person" size={36} color={selectedType === 'pro' ? '#F59E0B' : '#3B82F6'} />
                    </View>
                    {podium[0]?.isPro && (
                      <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full items-center justify-center">
                        <Text className="text-[8px] font-bold text-white">PRO</Text>
                      </View>
                    )}
                    <View className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full items-center justify-center shadow">
                      <MaterialIcons name="emoji-events" size={16} color="#F59E0B" />
                    </View>
                  </View>
                  <Text className="font-bold text-black mt-2">{podium[0]?.name}</Text>
                  <Text className="text-sm text-neutral-600 font-medium">{podium[0]?.score.toLocaleString()} pts</Text>
                  <View className={`px-5 py-3 rounded-xl mt-2 ${selectedType === 'pro' ? 'bg-amber-400' : 'bg-blue-400'}`}>
                    <Text className="text-2xl font-bold text-white">1</Text>
                  </View>
                </View>

                {/* 3rd Place */}
                <View className="items-center">
                  <View className="relative">
                    <View className="w-16 h-16 bg-neutral-200 rounded-full items-center justify-center border-4 border-neutral-300">
                      <MaterialIcons name="person" size={28} color="#9CA3AF" />
                    </View>
                    {podium[2]?.isPro && (
                      <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full items-center justify-center">
                        <Text className="text-[8px] font-bold text-white">PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-semibold text-black mt-2">{podium[2]?.name}</Text>
                  <Text className="text-sm text-neutral-500">{podium[2]?.score.toLocaleString()} pts</Text>
                  <View className="bg-orange-400 px-4 py-2 rounded-xl mt-2">
                    <Text className="text-xl font-bold text-white">3</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* User Position Card */}
            <View className={`mx-5 p-4 rounded-2xl ${selectedType === 'pro' ? 'bg-neutral-900' : 'bg-blue-500'}`}>
              <View className="flex-row items-center">
                <Text className="text-3xl font-bold text-white">#{userPosition.position}</Text>
                <View className="ml-4 flex-row items-center gap-3">
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                    {profile?.avatar_url ? (
                      <Image source={{ uri: profile.avatar_url }} className="w-full h-full rounded-full" />
                    ) : (
                      <MaterialIcons name="person" size={24} color="#fff" />
                    )}
                    {isPro && (
                      <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full items-center justify-center">
                        <Text className="text-[7px] font-bold text-white">PRO</Text>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text className="text-white font-bold">Você</Text>
                    <Text className="text-white/70">{userPosition.score.toLocaleString()} pontos</Text>
                  </View>
                </View>
                <View className="ml-auto flex-row items-center gap-1">
                  <MaterialIcons name="arrow-upward" size={18} color="#22C55E" />
                  <Text className="text-green-400 font-bold">+{userPosition.change}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-white/20">
                <Text className="text-white/70">
                  Próximo: #{userPosition.nextPosition} ({userPosition.nextScore.toLocaleString()} pts)
                </Text>
                <Text className={`font-bold ${selectedType === 'pro' ? 'text-amber-400' : 'text-blue-200'}`}>
                  Faltam {userPosition.gap} pts
                </Text>
              </View>
            </View>

            {/* Full Ranking Header */}
            <View className="flex-row items-center justify-between px-5 mt-6 mb-3">
              <Text className="text-lg font-bold text-black">CLASSIFICAÇÃO GERAL</Text>
              <Pressable className="flex-row items-center gap-1">
                <Text className="text-sm font-medium text-neutral-500">Ver todos</Text>
                <MaterialIcons name="chevron-right" size={18} color="#737373" />
              </Pressable>
            </View>

            {/* Ranking List */}
            <View className="px-5 pb-8">
              {restOfRanking.map((player, index) => (
                <Pressable
                  key={player.id}
                  className="flex-row items-center py-3 border-b border-neutral-100"
                >
                  <Text className="w-8 text-base font-bold text-neutral-400">{index + 4}</Text>
                  <View className="relative">
                    <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
                      <MaterialIcons name="person" size={20} color="#9CA3AF" />
                    </View>
                    {player.isPro && (
                      <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-black rounded-full items-center justify-center">
                        <Text className="text-[6px] font-bold text-white">PRO</Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-black">{player.name}</Text>
                    <Text className="text-xs text-neutral-500 capitalize">{player.level}</Text>
                  </View>
                  <Text className="font-bold text-neutral-700">{player.score.toLocaleString()} pts</Text>
                </Pressable>
              ))}
            </View>
          </>
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
