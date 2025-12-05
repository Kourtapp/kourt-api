import { View, Text, ScrollView, Pressable, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [selectedType, setSelectedType] = useState<'pro' | 'amador'>('amador');
  const [selectedScope, setSelectedScope] = useState('estadual');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showSportPicker, setShowSportPicker] = useState(false);

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

        {/* PRO / Amador Tabs */}
        <View className="flex-row mt-4 bg-neutral-100 rounded-xl p-1">
          {RANKING_TYPES.map((type) => (
            <Pressable
              key={type.id}
              onPress={() => {
                if (type.id === 'pro' && !isPro) {
                  router.push('/subscription');
                  return;
                }
                setSelectedType(type.id as 'pro' | 'amador');
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

        {/* Scope Filters */}
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
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Ranking Info Card */}
        <View
          className={`mx-5 mt-2 p-4 rounded-2xl ${selectedType === 'pro' ? 'bg-neutral-900' : 'bg-blue-500'
            }`}
        >
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
    </SafeAreaView>
  );
}
