import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';

const goalOptions = [
  { id: 'improve', label: 'Melhorar minhas habilidades', icon: 'trending-up' },
  { id: 'meet-people', label: 'Conhecer novos jogadores', icon: 'group' },
  { id: 'compete', label: 'Competir em torneios', icon: 'emoji-events' },
  { id: 'stay-active', label: 'Manter-me ativo', icon: 'fitness-center' },
  { id: 'fun', label: 'Diversão', icon: 'mood' },
];

export default function GoalsScreen() {
  const { goals, setGoals, completeOnboarding } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(goals);
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelected((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId],
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      setGoals(selected);
      await completeOnboarding();
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Erro', 'Falha ao salvar objetivos');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Pressable onPress={() => router.back()} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <View className="flex-row gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} className="h-2 w-5 rounded-full bg-black" />
          ))}
        </View>
        <Pressable onPress={handleSkip}>
          <Text className="text-sm text-neutral-500">Pular</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-xs text-neutral-500 mb-1">Pergunta 6 de 6</Text>
        <Text className="text-2xl font-bold text-black mb-2">
          Quais seus objetivos?
        </Text>
        <Text className="text-sm text-neutral-500 mb-6">
          Selecione todos que se aplicam
        </Text>

        {/* Goal Options */}
        <View className="gap-3 mb-6">
          {goalOptions.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <Pressable
                key={option.id}
                onPress={() => toggleGoal(option.id)}
                className={`flex-row items-center p-4 rounded-2xl border-2 ${
                  isSelected
                    ? 'bg-black border-black'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <View
                  className={`w-12 h-12 rounded-xl items-center justify-center ${
                    isSelected ? 'bg-white' : 'bg-neutral-100'
                  }`}
                >
                  <MaterialIcons
                    name={option.icon as any}
                    size={24}
                    color="#000"
                  />
                </View>
                <Text
                  className={`flex-1 ml-4 font-semibold ${
                    isSelected ? 'text-white' : 'text-black'
                  }`}
                >
                  {option.label}
                </Text>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    isSelected
                      ? 'bg-white border-white'
                      : 'border-neutral-300'
                  }`}
                >
                  {isSelected && (
                    <MaterialIcons name="check" size={16} color="#000" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-5 pb-8 pt-4">
        <Pressable
          onPress={handleFinish}
          disabled={loading || selected.length === 0}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
            selected.length > 0 && !loading ? 'bg-black' : 'bg-neutral-300'
          }`}
        >
          <Text className="font-semibold text-[15px] text-white">
            {loading ? 'Salvando...' : 'Finalizar'}
          </Text>
          {!loading && (
            <MaterialIcons name="check" size={20} color="#FFF" />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
