import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useCreateMatch, useCourts } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { CreateMatchInput } from '@/types/database.types';
import { LinearGradient } from 'expo-linear-gradient';

const sports = [
  { id: 'beach-tennis', name: 'BeachTennis', icon: 'sports-tennis' },
  { id: 'padel', name: 'Padel', icon: 'sports-tennis' },
  { id: 'futebol', name: 'Futebol', icon: 'sports-soccer' },
  { id: 'volei', name: 'Vôlei', icon: 'sports-volleyball' },
];

const durations = ['1h', '1h30', '2h', '2h30'];

const levels = [
  { id: 'beginner', label: 'Iniciante' },
  { id: 'intermediate', label: 'Intermed.' },
  { id: 'advanced', label: 'Avançado' },
];

export default function CreateMatchScreen() {
  const { user, profile } = useAuthStore();
  const { createMatch, loading } = useCreateMatch();
  const { courts } = useCourts();

  const isPro = profile?.subscription === 'pro';

  // Set default date to 4 days from now (Saturday)
  const getDefaultDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 4);
    return today.toISOString().split('T')[0];
  };

  const [matchType, setMatchType] = useState<'casual' | 'ranked'>('casual');
  const [selectedSport, setSelectedSport] = useState<string | null>('beach-tennis');
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [date, setDate] = useState(getDefaultDate()); // Default to 4 days from now
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState('1h30');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  // Generate next 14 days
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }),
        shortLabel: d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', ''),
      });
    }
    return days;
  };

  const handleCreate = async () => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para criar uma partida', [
        { text: 'Cancelar' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (!selectedSport || !date || !time) {
      const missing = [];
      if (!selectedSport) missing.push('Esporte');
      if (!date) missing.push('Data');
      if (!time) missing.push('Horário');

      console.log('Validation failed:', { selectedSport, date, time, missing }); // Debug
      Alert.alert(
        'Atenção',
        `Preencha os seguintes campos:\n${missing.join(', ')}`
      );
      return;
    }

    try {
      const sportName = sports.find(s => s.id === selectedSport)?.name || 'Partida';
      const input: CreateMatchInput = {
        title: `${sportName} ${matchType === 'ranked' ? 'Ranqueada' : 'Casual'}`,
        sport: selectedSport,
        date,
        start_time: time + ':00',
        max_players: maxPlayers,
        level: selectedLevel as 'beginner' | 'intermediate' | 'advanced' | 'any' | 'pro',
        is_public: visibility === 'public',
        court_id: selectedCourt || undefined,
      };

      const match = await createMatch(input, user.id);

      // Navigate to invite players screen
      router.replace(`/match/${match.id}/invite` as any);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao criar partida');
    }
  };

  const selectedCourtData = courts.find((c) => c.id === selectedCourt);
  const selectedDate = getNextDays().find(d => d.date === date);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="w-8">
          <MaterialIcons name="close" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Criar Jogo</Text>
        <View className="px-3 py-1 bg-black rounded-lg">
          <Text className="text-xs font-bold text-white">PRO</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5">
          {/* Tipo de partida */}
          <Text className="text-base font-bold text-black mb-3">Tipo de partida</Text>
          <View className="flex-row gap-3 mb-4">
            {/* Casual */}
            <Pressable
              onPress={() => setMatchType('casual')}
              className={`flex-1 p-4 rounded-2xl border-2 items-center ${matchType === 'casual' ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-200 bg-white'
                }`}
            >
              <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mb-2">
                <MaterialIcons name="sports-tennis" size={24} color="#525252" />
              </View>
              <Text className="font-semibold text-black">Casual</Text>
              <Text className="text-xs text-neutral-500 mt-0.5">Jogo informal</Text>
            </Pressable>

            {/* Ranqueada */}
            <Pressable
              onPress={() => setMatchType('ranked')}
              className={`flex-1 p-4 rounded-2xl border-2 items-center relative ${matchType === 'ranked' ? 'border-amber-400 bg-amber-50' : 'border-neutral-200 bg-white'
                }`}
            >
              <View className="absolute top-2 right-2 px-2 py-0.5 bg-black rounded">
                <Text className="text-[10px] font-bold text-white">PRO</Text>
              </View>
              <View className="w-12 h-12 bg-black rounded-xl items-center justify-center mb-2">
                <MaterialIcons name="emoji-events" size={24} color="#fff" />
              </View>
              <Text className="font-semibold text-black">Ranqueada</Text>
              <Text className="text-xs text-amber-600 mt-0.5">Vale pontos XP</Text>
            </Pressable>
          </View>

          {/* PRO Features (when ranked selected) */}
          {matchType === 'ranked' && (
            <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="auto-awesome" size={18} color="#D97706" />
                <Text className="font-bold text-amber-800">PARTIDA PRO ATIVA</Text>
              </View>
              <View className="flex-row flex-wrap gap-y-2">
                <View className="flex-row items-center w-1/2">
                  <MaterialIcons name="check" size={16} color="#D97706" />
                  <Text className="text-sm text-amber-700 ml-1">3x XP por vitória</Text>
                </View>
                <View className="flex-row items-center w-1/2">
                  <MaterialIcons name="check" size={16} color="#D97706" />
                  <Text className="text-sm text-amber-700 ml-1">Ranking PRO</Text>
                </View>
                <View className="flex-row items-center w-1/2">
                  <MaterialIcons name="check" size={16} color="#D97706" />
                  <Text className="text-sm text-amber-700 ml-1">Estatísticas completas</Text>
                </View>
                <View className="flex-row items-center w-1/2">
                  <MaterialIcons name="check" size={16} color="#D97706" />
                  <Text className="text-sm text-amber-700 ml-1">Análise IA</Text>
                </View>
              </View>
            </View>
          )}

          {/* Qual esporte? */}
          <Text className="text-base font-bold text-black mb-3">Qual esporte?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ gap: 12 }}
          >
            {sports.map((sport) => {
              const isSelected = selectedSport === sport.id;
              return (
                <Pressable
                  key={sport.id}
                  onPress={() => setSelectedSport(sport.id)}
                  className={`w-24 py-4 rounded-2xl items-center ${isSelected ? 'bg-black' : 'bg-white border border-neutral-200'
                    }`}
                >
                  <MaterialIcons
                    name={sport.icon as any}
                    size={28}
                    color={isSelected ? '#fff' : '#525252'}
                  />
                  <Text className={`text-sm font-medium mt-2 ${isSelected ? 'text-white' : 'text-black'}`}>
                    {sport.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Onde vai ser? */}
          <Text className="text-base font-bold text-black mb-3">Onde vai ser?</Text>
          <Pressable
            onPress={() => router.push('/courts/select' as any)}
            className="bg-green-50 border border-green-200 rounded-2xl p-4 flex-row items-center mb-6"
          >
            <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center">
              <MaterialIcons name="check-circle" size={24} color="#22C55E" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-black">
                {selectedCourtData?.name || 'Arena BeachIbirapuera'}
              </Text>
              <Text className="text-sm text-neutral-500">
                {selectedCourtData?.sport || 'BeachTennis'} · Quadra 2
              </Text>
            </View>
            <MaterialIcons name="edit" size={20} color="#A3A3A3" />
          </Pressable>

          {/* Quando? */}
          <Text className="text-base font-bold text-black mb-3">Quando?</Text>
          <View className="flex-row gap-3 mb-6">
            {/* Data */}
            <Pressable
              onPress={() => {
                // Show date picker
                const today = new Date();
                today.setDate(today.getDate() + 4); // Default to 4 days from now (Saturday)
                setDate(today.toISOString().split('T')[0]);
              }}
              className="flex-1 bg-neutral-100 rounded-2xl p-4"
            >
              <Text className="text-xs text-neutral-500 mb-1">Data</Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="event" size={18} color="#525252" />
                <Text className="font-semibold text-black">
                  {selectedDate?.shortLabel || 'Sáb, 7 Dez'}
                </Text>
              </View>
            </Pressable>

            {/* Horário */}
            <Pressable
              className="flex-1 bg-neutral-100 rounded-2xl p-4"
            >
              <Text className="text-xs text-neutral-500 mb-1">Horário</Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="schedule" size={18} color="#525252" />
                <Text className="font-semibold text-black">{time}</Text>
              </View>
            </Pressable>
          </View>

          {/* Duração */}
          <Text className="text-base font-bold text-black mb-3">Duração</Text>
          <View className="flex-row gap-2 mb-6">
            {durations.map((d) => {
              const isSelected = duration === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDuration(d)}
                  className={`flex-1 py-3 rounded-xl items-center ${isSelected ? 'bg-black' : 'bg-neutral-100'
                    }`}
                >
                  <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-black'}`}>
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Quantos jogadores? */}
          <Text className="text-base font-bold text-black mb-3">Quantos jogadores?</Text>
          <View className="bg-neutral-100 rounded-2xl p-4 flex-row items-center justify-between mb-6">
            <View>
              <Text className="font-medium text-black">Total de jogadores</Text>
              <Text className="text-sm text-neutral-500">Incluindo você</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
                className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center"
              >
                <MaterialIcons name="remove" size={20} color="#525252" />
              </Pressable>
              <Text className="text-2xl font-bold text-black w-8 text-center">{maxPlayers}</Text>
              <Pressable
                onPress={() => setMaxPlayers(Math.min(12, maxPlayers + 1))}
                className="w-10 h-10 bg-black rounded-full items-center justify-center"
              >
                <MaterialIcons name="add" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Nível dos jogadores */}
          <Text className="text-base font-bold text-black mb-3">Nível dos jogadores</Text>
          <View className="flex-row gap-2 mb-6">
            {levels.map((level) => {
              const isSelected = selectedLevel === level.id;
              return (
                <Pressable
                  key={level.id}
                  onPress={() => setSelectedLevel(level.id)}
                  className={`flex-1 py-3 rounded-xl items-center ${isSelected ? 'bg-black' : 'bg-neutral-100'
                    }`}
                >
                  <Text className={`font-medium ${isSelected ? 'text-white' : 'text-black'}`}>
                    {level.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Visibilidade */}
          <Text className="text-base font-bold text-black mb-3">Visibilidade</Text>
          <View className="flex-row gap-3 mb-8">
            <Pressable
              onPress={() => setVisibility('public')}
              className={`flex-1 p-4 rounded-2xl flex-row items-center gap-3 ${visibility === 'public' ? 'bg-black' : 'bg-neutral-100'
                }`}
            >
              <MaterialIcons
                name="public"
                size={22}
                color={visibility === 'public' ? '#fff' : '#525252'}
              />
              <Text className={`font-medium ${visibility === 'public' ? 'text-white' : 'text-black'}`}>
                Aberto
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setVisibility('private')}
              className={`flex-1 p-4 rounded-2xl flex-row items-center gap-3 ${visibility === 'private' ? 'bg-black' : 'bg-neutral-100'
                }`}
            >
              <MaterialIcons
                name="lock"
                size={22}
                color={visibility === 'private' ? '#fff' : '#525252'}
              />
              <Text className={`font-medium ${visibility === 'private' ? 'text-white' : 'text-black'}`}>
                Privado
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="h-28" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <Pressable
          onPress={handleCreate}
          disabled={loading}
          className="overflow-hidden rounded-2xl"
        >
          <LinearGradient
            colors={matchType === 'ranked' ? ['#84CC16', '#65A30D'] : ['#000', '#262626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 px-4 flex-row items-center"
          >
            {matchType === 'ranked' ? (
              <View className="w-10 h-10 bg-white/30 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="emoji-events" size={22} color="#1A2E05" />
              </View>
            ) : (
              <MaterialIcons name="sports-tennis" size={20} color="#fff" />
            )}
            <Text
              className={`font-semibold text-base ${matchType === 'ranked' ? 'text-lime-950' : 'text-white ml-2'
                }`}
            >
              {loading ? 'Criando...' : matchType === 'ranked' ? 'Criar Partida Ranqueada' : 'Criar Partida'}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* XP indicator */}
        {matchType === 'ranked' && (
          <Text className="text-center text-sm text-neutral-500 mt-3">
            +150 XP por criar partida ranqueada
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
