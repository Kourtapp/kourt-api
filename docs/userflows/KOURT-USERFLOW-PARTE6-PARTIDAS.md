# 🎯 KOURT APP - USERFLOW COMPLETO
## PARTE 6: Fluxo de Partidas e Gamificação

---

# 14. CRIAR PARTIDA (`/match/create`)

## 14.1 LAYOUT - STEP 1: ESPORTE

```
┌─────────────────────────────────────┐
│  ←  Criar Partida            1/4   │
├─────────────────────────────────────┤
│  [●───────────────────────────]    │
│                                     │
│  Qual esporte?                      │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │  🎾    │  │  🎾    │          │
│  │ Beach  │  │ Padel  │          │
│  │ Tennis │  │ ●      │          │
│  │        │  │        │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │  ⚽    │  │  🎾    │          │
│  │Futebol │  │ Tênis  │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │  🏀    │  │  🏐    │          │
│  │Basquete│  │ Vôlei  │          │
│  └─────────┘  └─────────┘          │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        CONTINUAR       →    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 14.2 LAYOUT - STEP 2: LOCAL E DATA

```
┌─────────────────────────────────────┐
│  ←  Criar Partida            2/4   │
├─────────────────────────────────────┤
│  [●●──────────────────────────]    │
│                                     │
│  Onde e quando?                     │
│                                     │
│  Local                              │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Buscar quadra            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Ou selecione:                      │
│  ┌─────────────────────────────┐   │
│  │ ○ Arena Beach Tennis        │   │
│  │   2.5 km · R$ 80/h          │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ● Padel Club SP             │   │
│  │   3.2 km · R$ 120/h         │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ○ Quadra Pública Ibira      │   │
│  │   1.8 km · Gratuita         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Data                               │
│  [Hoje] [Amanhã] [Ter 26] [Qua 27] │
│                                     │
│  Horário                            │
│  [14:00●] [15:00] [16:00] [17:00]  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        CONTINUAR       →    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 14.3 LAYOUT - STEP 3: JOGADORES

```
┌─────────────────────────────────────┐
│  ←  Criar Partida            3/4   │
├─────────────────────────────────────┤
│  [●●●─────────────────────────]    │
│                                     │
│  Quantos jogadores?                 │
│                                     │
│  Tipo de partida                    │
│  ┌────────────┐ ┌────────────┐     │
│  │ ●          │ │            │     │
│  │  Pública   │ │  Privada   │     │
│  │ Qualquer   │ │ Só convid. │     │
│  │ pode entrar│ │            │     │
│  └────────────┘ └────────────┘     │
│                                     │
│  Número de jogadores                │
│  [2] [●4] [6] [8] [10] [+]         │
│                                     │
│  Nível de habilidade                │
│  [Todos] [●Intermed.] [Avançado]   │
│                                     │
│  Jogadores confirmados (1/4)        │
│  ┌─────────────────────────────┐   │
│  │ 👤 Você (organizador)   ✓   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ + Convidar jogador          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        CONTINUAR       →    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 14.4 LAYOUT - STEP 4: CONFIRMAR

```
┌─────────────────────────────────────┐
│  ←  Criar Partida            4/4   │
├─────────────────────────────────────┤
│  [●●●●────────────────────────]    │
│                                     │
│  Confirme os detalhes               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🎾 Beach Tennis            │   │
│  │                             │   │
│  │  📍 Arena Beach Tennis      │   │
│  │  📅 Terça, 26 Nov           │   │
│  │  🕐 14:00 - 15:00           │   │
│  │  👥 4 jogadores (1/4)       │   │
│  │  🌐 Partida pública         │   │
│  │                             │   │
│  │  ─────────────────────────  │   │
│  │                             │   │
│  │  Reserva da quadra          │   │
│  │  R$ 80,00 ÷ 4 = R$ 20/cada │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Título (opcional)                  │
│  ┌─────────────────────────────┐   │
│  │ Beach Tennis com amigos     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Descrição (opcional)               │
│  ┌─────────────────────────────┐   │
│  │ Partida casual, todos os    │   │
│  │ níveis são bem-vindos!      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   🎾 CRIAR PARTIDA          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 14.5 CÓDIGO COMPLETO

```typescript
// app/match/create.tsx
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useMatchStore } from '@/stores/useMatchStore';
import { createMatch } from '@/services/matches';

const sports = [
  { id: 'beach-tennis', name: 'Beach Tennis', icon: 'sports-tennis' },
  { id: 'padel', name: 'Padel', icon: 'sports-tennis' },
  { id: 'football', name: 'Futebol', icon: 'sports-soccer' },
  { id: 'tennis', name: 'Tênis', icon: 'sports-tennis' },
  { id: 'basketball', name: 'Basquete', icon: 'sports-basketball' },
  { id: 'volleyball', name: 'Vôlei', icon: 'sports-volleyball' },
];

export default function CreateMatchScreen() {
  const { bookingId } = useLocalSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [skillLevel, setSkillLevel] = useState('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [invitedPlayers, setInvitedPlayers] = useState([]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleCreate();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleCreate = async () => {
    setLoading(true);

    try {
      const match = await createMatch({
        sport: selectedSport,
        court_id: selectedCourt?.id,
        booking_id: bookingId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedTime,
        is_public: isPublic,
        max_players: maxPlayers,
        skill_level: skillLevel,
        title: title || `${selectedSport} - ${format(selectedDate, 'dd/MM')}`,
        description,
        invited_players: invitedPlayers.map(p => p.id),
      });

      router.replace({
        pathname: '/match/[id]',
        params: { id: match.id },
      });
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedSport;
      case 2: return !!selectedCourt && !!selectedTime;
      case 3: return maxPlayers >= 2;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between border-b border-neutral-100">
        <Pressable onPress={handleBack} className="w-10 h-10 items-center justify-center">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Criar Partida</Text>
        <Text className="text-sm text-neutral-500">{step}/4</Text>
      </View>

      {/* Progress Bar */}
      <View className="px-5 py-3">
        <View className="h-1 bg-neutral-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-black rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Step 1: Esporte */}
        {step === 1 && (
          <View>
            <Text className="text-xl font-bold text-black mb-6">
              Qual esporte?
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {sports.map((sport) => (
                <Pressable
                  key={sport.id}
                  onPress={() => setSelectedSport(sport.id)}
                  className={`w-[48%] p-4 rounded-2xl border-2 ${
                    selectedSport === sport.id
                      ? 'bg-black border-black'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <MaterialIcons
                    name={sport.icon}
                    size={32}
                    color={selectedSport === sport.id ? '#FFF' : '#000'}
                  />
                  <Text
                    className={`mt-2 font-semibold ${
                      selectedSport === sport.id ? 'text-white' : 'text-black'
                    }`}
                  >
                    {sport.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Local e Data */}
        {step === 2 && (
          <View>
            <Text className="text-xl font-bold text-black mb-6">
              Onde e quando?
            </Text>

            {/* Busca de quadra */}
            <Pressable
              onPress={() => router.push('/match/search-court')}
              className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3.5 mb-4"
            >
              <MaterialIcons name="search" size={20} color="#737373" />
              <Text className="ml-2 text-neutral-500">Buscar quadra</Text>
            </Pressable>

            {/* Lista de quadras sugeridas */}
            <Text className="text-sm text-neutral-500 mb-3">Ou selecione:</Text>
            {/* ... courts list ... */}

            {/* Data */}
            <Text className="text-base font-bold text-black mt-6 mb-3">Data</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                const date = addDays(new Date(), offset);
                const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                return (
                  <Pressable
                    key={offset}
                    onPress={() => setSelectedDate(date)}
                    className={`px-4 py-3 rounded-xl mr-2 ${
                      isSelected ? 'bg-black' : 'bg-neutral-100'
                    }`}
                  >
                    <Text className={`text-xs ${isSelected ? 'text-white/70' : 'text-neutral-500'}`}>
                      {offset === 0 ? 'Hoje' : offset === 1 ? 'Amanhã' : format(date, 'EEE', { locale: ptBR })}
                    </Text>
                    <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                      {format(date, 'd')}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Horário */}
            <Text className="text-base font-bold text-black mt-6 mb-3">Horário</Text>
            <View className="flex-row flex-wrap gap-2">
              {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((time) => (
                <Pressable
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  className={`px-4 py-3 rounded-xl ${
                    selectedTime === time ? 'bg-black' : 'bg-neutral-100'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedTime === time ? 'text-white' : 'text-black'
                  }`}>
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Jogadores */}
        {step === 3 && (
          <View>
            <Text className="text-xl font-bold text-black mb-6">
              Quantos jogadores?
            </Text>

            {/* Tipo de partida */}
            <Text className="text-base font-bold text-black mb-3">Tipo de partida</Text>
            <View className="flex-row gap-3 mb-6">
              <Pressable
                onPress={() => setIsPublic(true)}
                className={`flex-1 p-4 rounded-2xl border-2 ${
                  isPublic ? 'bg-black border-black' : 'bg-white border-neutral-200'
                }`}
              >
                <MaterialIcons name="public" size={24} color={isPublic ? '#FFF' : '#000'} />
                <Text className={`mt-2 font-semibold ${isPublic ? 'text-white' : 'text-black'}`}>
                  Pública
                </Text>
                <Text className={`text-xs mt-1 ${isPublic ? 'text-white/70' : 'text-neutral-500'}`}>
                  Qualquer um pode entrar
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsPublic(false)}
                className={`flex-1 p-4 rounded-2xl border-2 ${
                  !isPublic ? 'bg-black border-black' : 'bg-white border-neutral-200'
                }`}
              >
                <MaterialIcons name="lock" size={24} color={!isPublic ? '#FFF' : '#000'} />
                <Text className={`mt-2 font-semibold ${!isPublic ? 'text-white' : 'text-black'}`}>
                  Privada
                </Text>
                <Text className={`text-xs mt-1 ${!isPublic ? 'text-white/70' : 'text-neutral-500'}`}>
                  Apenas convidados
                </Text>
              </Pressable>
            </View>

            {/* Número de jogadores */}
            <Text className="text-base font-bold text-black mb-3">Número de jogadores</Text>
            <View className="flex-row gap-2 mb-6">
              {[2, 4, 6, 8, 10].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => setMaxPlayers(num)}
                  className={`w-12 h-12 rounded-xl items-center justify-center ${
                    maxPlayers === num ? 'bg-black' : 'bg-neutral-100'
                  }`}
                >
                  <Text className={`font-bold ${maxPlayers === num ? 'text-white' : 'text-black'}`}>
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Nível de habilidade */}
            <Text className="text-base font-bold text-black mb-3">Nível de habilidade</Text>
            <View className="flex-row gap-2">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'beginner', label: 'Iniciante' },
                { id: 'intermediate', label: 'Intermed.' },
                { id: 'advanced', label: 'Avançado' },
              ].map((level) => (
                <Pressable
                  key={level.id}
                  onPress={() => setSkillLevel(level.id)}
                  className={`px-4 py-2.5 rounded-full ${
                    skillLevel === level.id ? 'bg-black' : 'bg-neutral-100'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    skillLevel === level.id ? 'text-white' : 'text-black'
                  }`}>
                    {level.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Confirmar */}
        {step === 4 && (
          <View>
            <Text className="text-xl font-bold text-black mb-6">
              Confirme os detalhes
            </Text>

            {/* Resumo */}
            <View className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 mb-6">
              {/* ... details ... */}
            </View>

            {/* Título */}
            <Text className="text-sm font-medium text-neutral-500 mb-2">
              Título (opcional)
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Beach Tennis com amigos"
              className="bg-neutral-100 rounded-xl px-4 py-3.5 text-sm text-black mb-4"
              placeholderTextColor="#A3A3A3"
            />

            {/* Descrição */}
            <Text className="text-sm font-medium text-neutral-500 mb-2">
              Descrição (opcional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Adicione mais detalhes sobre a partida..."
              multiline
              numberOfLines={3}
              className="bg-neutral-100 rounded-xl px-4 py-3.5 text-sm text-black"
              placeholderTextColor="#A3A3A3"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Footer */}
      <View className="px-5 py-4 pb-8 border-t border-neutral-100">
        <Pressable
          onPress={handleNext}
          disabled={!canProceed() || loading}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${
            canProceed() && !loading ? 'bg-black' : 'bg-neutral-300'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              {step === 4 ? (
                <>
                  <MaterialIcons name="sports-tennis" size={20} color="#FFF" />
                  <Text className="text-white font-semibold text-[15px] ml-2">
                    Criar Partida
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-white font-semibold text-[15px]">
                    Continuar
                  </Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
```

---

# 15. PLACAR AO VIVO (`/match/[id]/live`)

## 15.1 LAYOUT

```
┌─────────────────────────────────────┐
│  ←  Placar ao Vivo          [⋮]   │
├─────────────────────────────────────┤
│                                     │
│         🎾 Beach Tennis             │
│         Arena Ibirapuera            │
│         ⏱️ 45:23                    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    TIME A              TIME B       │
│                                     │
│    👤 👤              👤 👤        │
│    Bruno              Pedro         │
│    Marina             Lucas         │
│                                     │
│  ┌─────────┐      ┌─────────┐      │
│  │         │      │         │      │
│  │    6    │      │    4    │      │
│  │         │      │         │      │
│  └─────────┘      └─────────┘      │
│                                     │
│      SET 1         SET 2            │
│       6-4          3-2              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Último ponto: Time A               │
│  Ace do Bruno! 🔥                   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐     ┌──────────┐     │
│  │ +1 Time A│     │ +1 Time B│     │
│  └──────────┘     └──────────┘     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      FINALIZAR PARTIDA      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 15.2 CÓDIGO

```typescript
// app/match/[id]/live.tsx
import { View, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

import { supabase } from '@/services/supabase';
import { useRealtime } from '@/hooks/useRealtime';

export default function LiveScoreScreen() {
  const { id } = useLocalSearchParams();
  const [match, setMatch] = useState(null);
  const [score, setScore] = useState({
    teamA: { sets: [0], games: 0 },
    teamB: { sets: [0], games: 0 },
  });
  const [currentSet, setCurrentSet] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastPoint, setLastPoint] = useState(null);

  // Animação do placar
  const scoreAScale = useSharedValue(1);
  const scoreBScale = useSharedValue(1);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Realtime subscription
  useRealtime(`match_score:${id}`, (payload) => {
    setScore(payload.score);
    setLastPoint(payload.lastPoint);
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addPoint = async (team: 'A' | 'B') => {
    // Animação
    if (team === 'A') {
      scoreAScale.value = withSpring(1.2, {}, () => {
        scoreAScale.value = withSpring(1);
      });
    } else {
      scoreBScale.value = withSpring(1.2, {}, () => {
        scoreBScale.value = withSpring(1);
      });
    }

    // Atualizar placar
    const newScore = { ...score };
    if (team === 'A') {
      newScore.teamA.games += 1;
    } else {
      newScore.teamB.games += 1;
    }

    // Verificar fim do set (6 games)
    if (newScore.teamA.games >= 6 || newScore.teamB.games >= 6) {
      // Lógica de set...
    }

    // Enviar para Supabase (realtime)
    await supabase.from('match_scores').upsert({
      match_id: id,
      score: newScore,
      last_point: { team, timestamp: new Date().toISOString() },
    });

    setScore(newScore);
  };

  const finishMatch = () => {
    Alert.alert(
      'Finalizar Partida',
      'Tem certeza que deseja finalizar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: async () => {
            await supabase
              .from('matches')
              .update({
                status: 'completed',
                score: score,
                duration_minutes: Math.floor(elapsedTime / 60),
              })
              .eq('id', id);

            router.replace({
              pathname: '/match/register/score',
              params: { matchId: id, score: JSON.stringify(score) },
            });
          },
        },
      ]
    );
  };

  const scoreAStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreAScale.value }],
  }));

  const scoreBStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreBScale.value }],
  }));

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-black px-5 pt-14 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </Pressable>
          <Text className="text-white font-bold">Placar ao Vivo</Text>
          <Pressable>
            <MaterialIcons name="more-vert" size={24} color="#FFF" />
          </Pressable>
        </View>

        <View className="items-center">
          <View className="flex-row items-center gap-2 mb-1">
            <MaterialIcons name="sports-tennis" size={16} color="#FFF" />
            <Text className="text-white font-medium">Beach Tennis</Text>
          </View>
          <Text className="text-white/70 text-sm mb-2">{match?.court?.name}</Text>
          <View className="flex-row items-center gap-1 px-3 py-1 bg-red-500 rounded-full">
            <View className="w-2 h-2 bg-white rounded-full" />
            <Text className="text-white text-sm font-medium">
              ⏱️ {formatTime(elapsedTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* Placar */}
      <View className="px-5 py-8">
        <View className="flex-row items-center justify-between">
          {/* Time A */}
          <View className="items-center flex-1">
            <Text className="text-sm text-neutral-500 mb-2">TIME A</Text>
            <View className="flex-row gap-2 mb-3">
              <View className="w-10 h-10 bg-black rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">B</Text>
              </View>
              <View className="w-10 h-10 bg-neutral-300 rounded-full" />
            </View>
            <Text className="text-sm font-medium text-black">Bruno</Text>
            <Text className="text-xs text-neutral-500">Marina</Text>
          </View>

          {/* Placar Central */}
          <View className="flex-row items-center gap-4">
            <Animated.View
              style={scoreAStyle}
              className="w-20 h-24 bg-black rounded-2xl items-center justify-center"
            >
              <Text className="text-5xl font-black text-white">
                {score.teamA.games}
              </Text>
            </Animated.View>

            <Text className="text-2xl text-neutral-300">:</Text>

            <Animated.View
              style={scoreBStyle}
              className="w-20 h-24 bg-neutral-100 rounded-2xl items-center justify-center"
            >
              <Text className="text-5xl font-black text-black">
                {score.teamB.games}
              </Text>
            </Animated.View>
          </View>

          {/* Time B */}
          <View className="items-center flex-1">
            <Text className="text-sm text-neutral-500 mb-2">TIME B</Text>
            <View className="flex-row gap-2 mb-3">
              <View className="w-10 h-10 bg-neutral-300 rounded-full" />
              <View className="w-10 h-10 bg-neutral-300 rounded-full" />
            </View>
            <Text className="text-sm font-medium text-black">Pedro</Text>
            <Text className="text-xs text-neutral-500">Lucas</Text>
          </View>
        </View>

        {/* Sets anteriores */}
        <View className="flex-row justify-center gap-6 mt-6">
          {score.teamA.sets.map((_, index) => (
            <View key={index} className="items-center">
              <Text className="text-xs text-neutral-500 mb-1">SET {index + 1}</Text>
              <Text className="text-sm font-bold text-black">
                {score.teamA.sets[index]}-{score.teamB.sets[index]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Último ponto */}
      {lastPoint && (
        <View className="mx-5 p-4 bg-lime-50 border border-lime-200 rounded-2xl mb-6">
          <Text className="text-sm text-lime-800">
            Último ponto: <Text className="font-bold">Time {lastPoint.team}</Text>
          </Text>
        </View>
      )}

      {/* Botões de ponto */}
      <View className="px-5 flex-row gap-3 mb-6">
        <Pressable
          onPress={() => addPoint('A')}
          className="flex-1 py-4 bg-black rounded-2xl items-center"
        >
          <Text className="text-white font-semibold">+1 Time A</Text>
        </Pressable>
        <Pressable
          onPress={() => addPoint('B')}
          className="flex-1 py-4 bg-neutral-100 rounded-2xl items-center"
        >
          <Text className="text-black font-semibold">+1 Time B</Text>
        </Pressable>
      </View>

      {/* Finalizar */}
      <View className="px-5">
        <Pressable
          onPress={finishMatch}
          className="w-full py-4 bg-red-500 rounded-2xl items-center"
        >
          <Text className="text-white font-semibold">Finalizar Partida</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

# 16. REGISTRAR RESULTADO (`/match/register/*`)

## 16.1 STEP 1: PLACAR FINAL

```
┌─────────────────────────────────────┐
│  ←  Registrar Partida        1/4   │
├─────────────────────────────────────┤
│  [●───────────────────────────]    │
│                                     │
│  Qual foi o resultado?              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🏆 VITÓRIA                 │   │
│  │  ○ Derrota                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Placar                             │
│  ┌─────────────────────────────┐   │
│  │    Você         Adversário  │   │
│  │   [ 6 ]    -    [ 4 ]      │   │
│  │   [ 6 ]    -    [ 3 ]      │   │
│  │   [   ]    -    [   ]      │   │
│  │        + Adicionar set      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Duração                            │
│  ┌─────────────────────────────┐   │
│  │  [-]    1h 30min    [+]     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        CONTINUAR       →    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 16.2 STEP 2: AVALIAR JOGADORES

```
┌─────────────────────────────────────┐
│  ←  Registrar Partida        2/4   │
├─────────────────────────────────────┤
│  [●●──────────────────────────]    │
│                                     │
│  Como foi jogar com cada um?        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Pedro Ferreira           │   │
│  │    @pedrotennis             │   │
│  │                             │   │
│  │    Habilidade               │   │
│  │    ⭐⭐⭐⭐⭐                │   │
│  │                             │   │
│  │    Pontualidade             │   │
│  │    ⭐⭐⭐⭐⭐                │   │
│  │                             │   │
│  │    Comportamento            │   │
│  │    ⭐⭐⭐⭐⭐                │   │
│  │                             │   │
│  │    Comentário (opcional)    │   │
│  │    ┌───────────────────┐   │   │
│  │    │ Excelente parceiro│   │   │
│  │    └───────────────────┘   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Marina Silva             │   │
│  │    ...                      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        CONTINUAR       →    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 16.3 STEP 3: FOTOS

```
┌─────────────────────────────────────┐
│  ←  Registrar Partida        3/4   │
├─────────────────────────────────────┤
│  [●●●─────────────────────────]    │
│                                     │
│  Adicione fotos da partida          │
│  Mostre os melhores momentos!       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     📷                      │   │
│  │                             │   │
│  │     Tirar foto              │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     🖼️                      │   │
│  │                             │   │
│  │     Escolher da galeria     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Fotos selecionadas                 │
│  [img1] [img2] [img3] [+]          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        CONTINUAR       →    │   │
│  └─────────────────────────────┘   │
│                                     │
│           Pular                     │
│                                     │
└─────────────────────────────────────┘
```

## 16.4 STEP 4: MÉTRICAS E COMPARTILHAR

```
┌─────────────────────────────────────┐
│  ←  Registrar Partida        4/4   │
├─────────────────────────────────────┤
│  [●●●●────────────────────────]    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📊 Dados do Apple Watch     │   │
│  │    Sincronizado             │   │
│  │                             │   │
│  │  142 BPM  450 kcal  4.2 km │   │
│  └─────────────────────────────┘   │
│                                     │
│  Métricas manuais                   │
│                                     │
│  Intensidade                        │
│  [█][█][█][░][░] Moderada          │
│                                     │
│  Como se sentiu?                    │
│  [😫] [😐] [●😊] [🤩]              │
│                                     │
│  Winners                            │
│  [-] 5 [+]                         │
│                                     │
│  Erros não forçados                 │
│  [-] 3 [+]                         │
│                                     │
│  Notas (opcional)                   │
│  ┌─────────────────────────────┐   │
│  │ Partida intensa, preciso    │   │
│  │ melhorar o backhand...      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎾 PUBLICAR PARTIDA        │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

# 17. GAMIFICAÇÃO

## 17.1 SISTEMA DE XP

```typescript
// Sistema de XP
const XP_REWARDS = {
  // Partidas
  MATCH_PLAYED: 10,
  MATCH_WON: 25,
  MATCH_STREAK_3: 50,
  MATCH_STREAK_7: 100,
  
  // Reservas
  BOOKING_COMPLETED: 5,
  FIRST_BOOKING: 50,
  
  // Social
  FOLLOW_PLAYER: 2,
  FIRST_FRIEND: 25,
  INVITE_FRIEND: 100,
  
  // Avaliações
  REVIEW_COURT: 10,
  RATE_PLAYER: 5,
  
  // Desafios
  DAILY_CHALLENGE: 50,
  WEEKLY_CHALLENGE: 150,
  MONTHLY_CHALLENGE: 500,
  
  // Conquistas
  ACHIEVEMENT_BRONZE: 25,
  ACHIEVEMENT_SILVER: 50,
  ACHIEVEMENT_GOLD: 100,
};

// Níveis e XP necessário
const LEVELS = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 250 },
  { level: 4, xpRequired: 500 },
  { level: 5, xpRequired: 1000 },
  { level: 6, xpRequired: 1500 },
  { level: 7, xpRequired: 2000 },
  { level: 8, xpRequired: 3000 },
  { level: 9, xpRequired: 4000 },
  { level: 10, xpRequired: 5000 },
  { level: 11, xpRequired: 7500 },
  { level: 12, xpRequired: 10000 },
  // ...
];
```

## 17.2 CONQUISTAS (ACHIEVEMENTS)

```typescript
const ACHIEVEMENTS = [
  // Partidas
  { id: 'first_match', title: 'Primeira Partida', icon: '🎾', xp: 50 },
  { id: 'matches_10', title: '10 Partidas', icon: '🔟', xp: 100 },
  { id: 'matches_50', title: '50 Partidas', icon: '5️⃣0️⃣', xp: 250 },
  { id: 'matches_100', title: 'Centenário', icon: '💯', xp: 500 },
  
  // Vitórias
  { id: 'first_win', title: 'Primeira Vitória', icon: '🏆', xp: 50 },
  { id: 'wins_10', title: '10 Vitórias', icon: '🥇', xp: 100 },
  { id: 'win_streak_3', title: 'Hat-trick', icon: '🔥', xp: 75 },
  { id: 'win_streak_7', title: 'Imbatível', icon: '⚡', xp: 200 },
  
  // Esportes
  { id: 'multi_sport', title: 'Multiatleta', icon: '🎯', xp: 100, desc: 'Jogue 3 esportes diferentes' },
  
  // Social
  { id: 'first_friend', title: 'Primeiro Amigo', icon: '🤝', xp: 25 },
  { id: 'friends_10', title: 'Popular', icon: '👥', xp: 100 },
  { id: 'organizer', title: 'Organizador', icon: '📋', xp: 75, desc: 'Crie 10 partidas' },
  
  // Streaks
  { id: 'streak_7', title: 'Semana Perfeita', icon: '📅', xp: 100 },
  { id: 'streak_30', title: 'Mês de Ferro', icon: '💪', xp: 500 },
  
  // Secretas
  { id: 'night_owl', title: 'Coruja', icon: '🦉', xp: 50, desc: 'Jogue após 22h', secret: true },
  { id: 'early_bird', title: 'Madrugador', icon: '🐦', xp: 50, desc: 'Jogue antes das 7h', secret: true },
];
```

## 17.3 DESAFIOS DIÁRIOS

```typescript
const DAILY_CHALLENGES = [
  { 
    id: 'play_match',
    title: 'Jogue uma partida',
    description: 'Complete uma partida hoje',
    xp: 50,
    requirement: { type: 'matches', value: 1 },
  },
  {
    id: 'play_2_matches',
    title: 'Dupla vitória',
    description: 'Jogue 2 partidas hoje',
    xp: 100,
    requirement: { type: 'matches', value: 2 },
  },
  {
    id: 'win_match',
    title: 'Vença uma partida',
    description: 'Ganhe uma partida hoje',
    xp: 75,
    requirement: { type: 'wins', value: 1 },
  },
  {
    id: 'rate_players',
    title: 'Avaliador',
    description: 'Avalie 3 jogadores',
    xp: 30,
    requirement: { type: 'ratings', value: 3 },
  },
  {
    id: 'invite_friend',
    title: 'Traga um amigo',
    description: 'Convide alguém para uma partida',
    xp: 50,
    requirement: { type: 'invites', value: 1 },
  },
];
```

---

**Continua na PARTE 7: Segurança, Coach Marks e Comandos Finais**
