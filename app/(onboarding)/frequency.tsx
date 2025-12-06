import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';

const frequencyOptions = [
  {
    id: 'rarely',
    label: 'Raramente',
    desc: '1-2 vezes por mês',
    icon: 'brightness-low',
  },
  {
    id: 'occasionally',
    label: 'Ocasionalmente',
    desc: '1 vez por semana',
    icon: 'brightness-medium',
  },
  {
    id: 'regularly',
    label: 'Regularmente',
    desc: '2-3 vezes por semana',
    icon: 'brightness-high',
  },
  {
    id: 'intensely',
    label: 'Intensamente',
    desc: '4+ vezes por semana',
    icon: 'local-fire-department',
  },
];

export default function FrequencyScreen() {
  const { playFrequency, setFrequency } = useOnboardingStore();
  const [selected, setSelected] = useState<string>(playFrequency);

  const handleContinue = () => {
    setFrequency(selected);
    router.push('/schedule');
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
            <View
              key={i}
              className={`h-2 rounded-full ${
                i <= 3 ? 'w-5 bg-black' : 'w-2 bg-neutral-200'
              }`}
            />
          ))}
        </View>
        <Pressable onPress={handleSkip}>
          <Text className="text-sm text-neutral-500">Pular</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1 px-5">
        <Text className="text-xs text-neutral-500 mb-1">Pergunta 4 de 6</Text>
        <Text className="text-2xl font-bold text-black mb-2">
          Com que frequência você joga?
        </Text>
        <Text className="text-sm text-neutral-500 mb-6">
          Nos ajuda a sugerir horários
        </Text>

        {/* Frequency Options */}
        <View className="gap-3">
          {frequencyOptions.map((option) => {
            const isSelected = selected === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setSelected(option.id)}
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
                <View className="flex-1 ml-4">
                  <Text
                    className={`font-semibold ${
                      isSelected ? 'text-white' : 'text-black'
                    }`}
                  >
                    {option.label}
                  </Text>
                  <Text
                    className={`text-sm ${
                      isSelected ? 'text-white/70' : 'text-neutral-500'
                    }`}
                  >
                    {option.desc}
                  </Text>
                </View>
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
      </View>

      {/* Footer */}
      <View className="px-5 pb-8 pt-4">
        <Pressable
          onPress={handleContinue}
          disabled={!selected}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
            selected ? 'bg-black' : 'bg-neutral-300'
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
