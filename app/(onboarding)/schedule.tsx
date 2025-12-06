import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';

const scheduleOptions = [
  {
    id: 'morning_weekday',
    label: 'Manhã (dias úteis)',
    desc: '6h - 12h',
    icon: 'wb-sunny',
  },
  {
    id: 'afternoon_weekday',
    label: 'Tarde (dias úteis)',
    desc: '12h - 18h',
    icon: 'brightness-5',
  },
  {
    id: 'evening_weekday',
    label: 'Noite (dias úteis)',
    desc: '18h - 22h',
    icon: 'nights-stay',
  },
  {
    id: 'morning_weekend',
    label: 'Manhã (fim de semana)',
    desc: 'Sábado e domingo, 6h - 12h',
    icon: 'wb-sunny',
  },
  {
    id: 'afternoon_weekend',
    label: 'Tarde (fim de semana)',
    desc: 'Sábado e domingo, 12h - 18h',
    icon: 'brightness-5',
  },
  {
    id: 'evening_weekend',
    label: 'Noite (fim de semana)',
    desc: 'Sábado e domingo, 18h - 22h',
    icon: 'nights-stay',
  },
];

export default function ScheduleScreen() {
  const { preferredSchedule, setPreferredSchedule } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(preferredSchedule);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleContinue = () => {
    setPreferredSchedule(selected);
    router.push('/goals');
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
                i <= 4 ? 'w-5 bg-black' : 'w-2 bg-neutral-200'
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
        <Text className="text-xs text-neutral-500 mb-1">Pergunta 5 de 6</Text>
        <Text className="text-2xl font-bold text-black mb-2">
          Quando você prefere jogar?
        </Text>
        <Text className="text-sm text-neutral-500 mb-6">
          Selecione todos os horários que funcionam para você
        </Text>

        {/* Schedule Options */}
        <View className="gap-2.5">
          {scheduleOptions.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <Pressable
                key={option.id}
                onPress={() => toggleOption(option.id)}
                className={`flex-row items-center p-3.5 rounded-2xl border-2 ${
                  isSelected
                    ? 'bg-black border-black'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    isSelected ? 'bg-white' : 'bg-neutral-100'
                  }`}
                >
                  <MaterialIcons
                    name={option.icon as any}
                    size={20}
                    color="#000"
                  />
                </View>
                <View className="flex-1 ml-3">
                  <Text
                    className={`font-semibold text-sm ${
                      isSelected ? 'text-white' : 'text-black'
                    }`}
                  >
                    {option.label}
                  </Text>
                  <Text
                    className={`text-xs ${
                      isSelected ? 'text-white/70' : 'text-neutral-500'
                    }`}
                  >
                    {option.desc}
                  </Text>
                </View>
                <View
                  className={`w-5 h-5 rounded-md border-2 items-center justify-center ${
                    isSelected
                      ? 'bg-white border-white'
                      : 'border-neutral-300'
                  }`}
                >
                  {isSelected && (
                    <MaterialIcons name="check" size={14} color="#000" />
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
          className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 bg-black"
        >
          <Text className="text-white font-semibold text-[15px]">
            {selected.length > 0 ? 'Continuar' : 'Pular'}
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
