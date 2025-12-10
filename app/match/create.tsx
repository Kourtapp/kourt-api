import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useCreateMatch, useCourts } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { CreateMatchInput } from '@/types/database.types';

const sports = [
  { id: 'beach-tennis', name: 'BeachTennis', icon: 'sports-tennis' },
  { id: 'padel', name: 'Padel', icon: 'sports-tennis' },
  { id: 'futebol', name: 'Futebol', icon: 'sports-soccer' },
  { id: 'volei', name: 'Vôlei', icon: 'sports-volleyball' },
  { id: 'tenis', name: 'Tênis', icon: 'sports-tennis' },
  { id: 'basquete', name: 'Basquete', icon: 'sports-basketball' },
];

const durations = ['1h', '1h30', '2h', '2h30'];

const levels = [
  { id: 'beginner', label: 'Iniciante' },
  { id: 'intermediate', label: 'Intermed.' },
  { id: 'advanced', label: 'Avançado' },
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

export default function CreateMatchScreen() {
  const { user, profile } = useAuthStore();
  const { createMatch, loading } = useCreateMatch();
  const { courts } = useCourts();

  const getDefaultDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 4);
    return today.toISOString().split('T')[0];
  };

  const [matchType, setMatchType] = useState<'casual' | 'ranked'>('ranked');
  const [selectedSport, setSelectedSport] = useState<string | null>('beach-tennis');
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [date, setDate] = useState(getDefaultDate());
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState('1h30');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCourtPicker, setShowCourtPicker] = useState(false);

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
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
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
        ...(selectedCourt && { court_id: selectedCourt }),
      };

      const match = await createMatch(input, user.id);

      if (match?.id) {
        router.replace(`/match/${match.id}/invite` as any);
      } else {
        throw new Error('ID da partida não retornado');
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao criar partida. Tente novamente.');
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
              className={`flex-1 p-4 rounded-2xl border-2 items-center ${
                matchType === 'casual' ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-200 bg-white'
              }`}
            >
              <View className="w-14 h-14 bg-neutral-100 rounded-full items-center justify-center mb-3">
                <MaterialIcons name="sports-tennis" size={28} color="#737373" />
              </View>
              <Text className="font-bold text-black text-base">Casual</Text>
              <Text className="text-sm text-neutral-500 mt-0.5">Jogo informal</Text>
            </Pressable>

            {/* Ranqueada */}
            <Pressable
              onPress={() => setMatchType('ranked')}
              className={`flex-1 p-4 rounded-2xl border-2 items-center relative ${
                matchType === 'ranked' ? 'border-amber-400 bg-white' : 'border-neutral-200 bg-white'
              }`}
            >
              <View className="absolute top-2 right-2 px-2 py-0.5 bg-black rounded">
                <Text className="text-[10px] font-bold text-white">PRO</Text>
              </View>
              <View className="w-14 h-14 bg-black rounded-full items-center justify-center mb-3">
                <MaterialIcons name="emoji-events" size={28} color="#fff" />
              </View>
              <Text className="font-bold text-black text-base">Ranqueada</Text>
              <Text className="text-sm text-amber-600 mt-0.5">Vale pontos XP</Text>
            </Pressable>
          </View>

          {/* PRO Features */}
          {matchType === 'ranked' && (
            <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="auto-awesome" size={18} color="#D97706" />
                <Text className="font-bold text-amber-700">PARTIDA PRO ATIVA</Text>
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
                  className={`w-24 py-4 rounded-2xl items-center ${
                    isSelected ? 'bg-black' : 'bg-white border border-neutral-200'
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
            onPress={() => setShowCourtPicker(true)}
            className={`rounded-2xl p-4 flex-row items-center mb-6 ${
              selectedCourtData ? 'bg-green-50 border border-green-200' : 'bg-neutral-50'
            }`}
          >
            <View className={`w-12 h-12 rounded-xl items-center justify-center ${
              selectedCourtData ? 'bg-green-100' : 'bg-neutral-200'
            }`}>
              {selectedCourtData ? (
                <MaterialIcons name="check" size={24} color="#22C55E" />
              ) : (
                <MaterialIcons name="location-on" size={24} color="#737373" />
              )}
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-black">
                {selectedCourtData?.name || 'Selecionar quadra'}
              </Text>
              <Text className="text-sm text-neutral-500">
                {selectedCourtData
                  ? `${sports.find(s => s.id === selectedSport)?.name || ''} · Quadra ${(selectedCourtData as any).court_number || 1}`
                  : 'Toque para escolher'}
              </Text>
            </View>
            {selectedCourtData ? (
              <MaterialIcons name="edit" size={20} color="#A3A3A3" />
            ) : (
              <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
            )}
          </Pressable>

          {/* Quando? */}
          <Text className="text-base font-bold text-black mb-3">Quando?</Text>
          <View className="flex-row gap-3 mb-6">
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="flex-1 bg-neutral-50 rounded-2xl p-4 border border-neutral-200"
            >
              <Text className="text-xs text-neutral-500 mb-1">Data</Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="event" size={18} color="#525252" />
                <Text className="font-semibold text-black">
                  {selectedDate?.shortLabel || 'Selecionar'}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="flex-1 bg-neutral-50 rounded-2xl p-4 border border-neutral-200"
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
                  className={`flex-1 py-3 rounded-2xl items-center border ${
                    isSelected ? 'bg-black border-black' : 'bg-white border-neutral-200'
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
          <View className="bg-neutral-50 rounded-2xl p-4 flex-row items-center justify-between mb-6 border border-neutral-200">
            <View>
              <Text className="font-medium text-black">Total de jogadores</Text>
              <Text className="text-sm text-neutral-500">Incluindo você</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
                className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center"
              >
                <MaterialIcons name="remove" size={20} color="#737373" />
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
                  className={`flex-1 py-3 rounded-2xl items-center border ${
                    isSelected ? 'bg-black border-black' : 'bg-white border-neutral-200'
                  }`}
                >
                  <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-black'}`}>
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
              className={`flex-1 p-4 rounded-2xl flex-row items-center gap-3 border ${
                visibility === 'public' ? 'bg-black border-black' : 'bg-white border-neutral-200'
              }`}
            >
              <MaterialIcons
                name="public"
                size={22}
                color={visibility === 'public' ? '#fff' : '#525252'}
              />
              <Text className={`font-semibold ${visibility === 'public' ? 'text-white' : 'text-black'}`}>
                Aberto
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setVisibility('private')}
              className={`flex-1 p-4 rounded-2xl flex-row items-center gap-3 border ${
                visibility === 'private' ? 'bg-black border-black' : 'bg-white border-neutral-200'
              }`}
            >
              <MaterialIcons
                name="lock"
                size={22}
                color={visibility === 'private' ? '#fff' : '#525252'}
              />
              <Text className={`font-semibold ${visibility === 'private' ? 'text-white' : 'text-black'}`}>
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
          className="py-4 rounded-full flex-row items-center justify-center"
          style={{ backgroundColor: matchType === 'ranked' ? '#84CC16' : '#000' }}
        >
          {matchType === 'ranked' && (
            <MaterialIcons name="emoji-events" size={22} color="#1A2E05" />
          )}
          <Text
            className="font-bold text-base ml-2"
            style={{ color: matchType === 'ranked' ? '#1A2E05' : '#fff' }}
          >
            {loading ? 'Criando...' : matchType === 'ranked' ? 'Criar Partida PRO' : 'Criar Partida'}
          </Text>
        </Pressable>

        {matchType === 'ranked' && (
          <Text className="text-center text-sm text-neutral-500 mt-3">
            +150 XP por criar partida ranqueada
          </Text>
        )}
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-black">Selecionar Data</Text>
              <Pressable onPress={() => setShowDatePicker(false)}>
                <MaterialIcons name="close" size={24} color="#737373" />
              </Pressable>
            </View>
            <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap gap-2">
                {getNextDays().map((day) => {
                  const isSelected = date === day.date;
                  return (
                    <Pressable
                      key={day.date}
                      onPress={() => {
                        setDate(day.date);
                        setShowDatePicker(false);
                      }}
                      className={`w-[31%] py-4 rounded-xl items-center ${isSelected ? 'bg-black' : 'bg-neutral-100'}`}
                    >
                      <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-black'}`}>
                        {day.shortLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-black">Selecionar Horário</Text>
              <Pressable onPress={() => setShowTimePicker(false)}>
                <MaterialIcons name="close" size={24} color="#737373" />
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {timeSlots.map((slot) => {
                const isSelected = time === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => {
                      setTime(slot);
                      setShowTimePicker(false);
                    }}
                    className={`w-[23%] py-3 rounded-xl items-center ${isSelected ? 'bg-black' : 'bg-neutral-100'}`}
                  >
                    <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-black'}`}>
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Court Picker Modal */}
      <Modal
        visible={showCourtPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCourtPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 pb-8 max-h-[70%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-black">Selecionar Quadra</Text>
              <Pressable onPress={() => setShowCourtPicker(false)}>
                <MaterialIcons name="close" size={24} color="#737373" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {courts.length === 0 ? (
                <View className="py-8 items-center">
                  <MaterialIcons name="location-off" size={48} color="#A3A3A3" />
                  <Text className="text-neutral-500 mt-2">Nenhuma quadra disponível</Text>
                </View>
              ) : (
                <View className="gap-3">
                  {courts.map((court) => {
                    const isSelected = selectedCourt === court.id;
                    return (
                      <Pressable
                        key={court.id}
                        onPress={() => {
                          setSelectedCourt(court.id);
                          setShowCourtPicker(false);
                        }}
                        className={`p-4 rounded-2xl flex-row items-center ${
                          isSelected ? 'bg-lime-100 border-2 border-lime-500' : 'bg-neutral-50 border border-neutral-200'
                        }`}
                      >
                        <View className={`w-12 h-12 rounded-xl items-center justify-center ${
                          isSelected ? 'bg-lime-500' : 'bg-neutral-200'
                        }`}>
                          <MaterialIcons name="sports-tennis" size={24} color={isSelected ? '#1A2E05' : '#737373'} />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="font-semibold text-black">{court.name}</Text>
                          <Text className="text-sm text-neutral-500">{court.sport} · {court.address}</Text>
                        </View>
                        {isSelected && (
                          <MaterialIcons name="check-circle" size={24} color="#84CC16" />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
