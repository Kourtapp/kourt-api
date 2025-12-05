import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';

const levelOptions = [
  { id: 'beginner', label: 'Iniciante', short: 'Inic.' },
  { id: 'intermediate', label: 'Intermediário', short: 'Inter.' },
  { id: 'advanced', label: 'Avançado', short: 'Avanç.' },
  { id: 'pro', label: 'Pro', short: 'Pro' },
];

const sportNames: Record<string, string> = {
  'beach-tennis': 'Beach Tennis',
  padel: 'Padel',
  football: 'Futebol',
  tennis: 'Tênis',
  basketball: 'Basquete',
  volleyball: 'Vôlei',
  handball: 'Handebol',
  other: 'Outros',
};

export default function LevelScreen() {
  const { selectedSports, sportLevels, setLevels } = useOnboardingStore();
  const [levels, setLocalLevels] =
    useState<Record<string, string>>(sportLevels);

  const setLevel = (sportId: string, levelId: string) => {
    setLocalLevels((prev) => ({ ...prev, [sportId]: levelId }));
  };

  const handleContinue = () => {
    setLevels(levels);
    router.push('/frequency');
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const allLevelsSet = selectedSports.every((sport) => levels[sport]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <View className="flex-row gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i <= 2 ? 'w-6 bg-black' : 'w-2 bg-neutral-200'
              }`}
            />
          ))}
        </View>
        <Pressable onPress={handleSkip}>
          <Text className="text-sm text-neutral-500">Pular</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-xs text-neutral-500 mb-1">Pergunta 3 de 5</Text>
        <Text className="text-2xl font-bold text-black mb-2">
          Qual seu nível em cada esporte?
        </Text>
        <Text className="text-sm text-neutral-500 mb-6">
          Baseado nos esportes selecionados
        </Text>

        {/* Sports with Level Selectors */}
        <View className="gap-4 mb-6">
          {selectedSports.map((sportId) => (
            <View
              key={sportId}
              className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100"
            >
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="sports-tennis" size={20} color="#525252" />
                <Text className="font-semibold text-black">
                  {sportNames[sportId] || sportId}
                </Text>
              </View>
              <View className="flex-row gap-2">
                {levelOptions.map((level) => {
                  const isSelected = levels[sportId] === level.id;
                  return (
                    <Pressable
                      key={level.id}
                      onPress={() => setLevel(sportId, level.id)}
                      className={`flex-1 py-2.5 rounded-xl items-center ${
                        isSelected
                          ? 'bg-black'
                          : 'bg-white border border-neutral-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          isSelected ? 'text-white' : 'text-neutral-600'
                        }`}
                      >
                        {level.short}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Legend */}
        <View className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 mb-6">
          <Text className="text-xs font-semibold text-neutral-500 mb-3">
            LEGENDA DOS NÍVEIS
          </Text>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-neutral-400" />
              <Text className="text-sm text-neutral-600">
                <Text className="font-medium">Iniciante</Text> — Aprendendo o
                básico
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-neutral-400" />
              <Text className="text-sm text-neutral-600">
                <Text className="font-medium">Intermediário</Text> — Joga
                regularmente
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-neutral-400" />
              <Text className="text-sm text-neutral-600">
                <Text className="font-medium">Avançado</Text> — Nível
                competitivo
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-neutral-400" />
              <Text className="text-sm text-neutral-600">
                <Text className="font-medium">Pro</Text> — Joga torneios
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-5 pb-8 pt-4">
        <Pressable
          onPress={handleContinue}
          disabled={!allLevelsSet}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
            allLevelsSet ? 'bg-black' : 'bg-neutral-300'
          }`}
        >
          <Text className="text-white font-semibold text-[15px]">
            Continuar
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
