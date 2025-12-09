import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';

const sports = [
  { id: 'beach-tennis', name: 'Beach Tennis', icon: 'sports-tennis' },
  { id: 'padel', name: 'Padel', icon: 'sports-tennis' },
  { id: 'football', name: 'Futebol', icon: 'sports-soccer' },
  { id: 'tennis', name: 'Tênis', icon: 'sports-tennis' },
  { id: 'basketball', name: 'Basquete', icon: 'sports-basketball' },
  { id: 'volleyball', name: 'Vôlei', icon: 'sports-volleyball' },
  { id: 'handball', name: 'Handebol', icon: 'sports-handball' },
  { id: 'other', name: 'Outros', icon: 'more-horiz' },
];

export default function SportsScreen() {
  const { selectedSports, setSports } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(selectedSports);

  const toggleSport = (sportId: string) => {
    setSelected((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : [...prev, sportId],
    );
  };

  const handleContinue = () => {
    setSports(selected);
    router.push('/level');
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
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i <= 1 ? 'w-6 bg-black' : 'w-2 bg-neutral-200'
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
        <Text className="text-xs text-neutral-500 mb-1">Pergunta 2 de 5</Text>
        <Text className="text-2xl font-bold text-black mb-2">
          Quais esportes você pratica?
        </Text>
        <Text className="text-sm text-neutral-500 mb-6">
          Selecione todos que se aplicam
        </Text>

        {/* Sports Grid */}
        <View className="flex-row flex-wrap gap-3">
          {sports.map((sport) => {
            const isSelected = selected.includes(sport.id);
            return (
              <Pressable
                key={sport.id}
                onPress={() => toggleSport(sport.id)}
                className={`w-[48%] p-4 rounded-2xl border-2 ${
                  isSelected
                    ? 'bg-black border-black'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <MaterialIcons
                    name={sport.icon as any}
                    size={28}
                    color={isSelected ? '#FFF' : '#525252'}
                  />
                  {isSelected && (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#FFF"
                    />
                  )}
                </View>
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? 'text-white' : 'text-black'
                  }`}
                >
                  {sport.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-5 pb-8 pt-4">
        <Pressable
          onPress={handleContinue}
          disabled={selected.length === 0}
          className={`w-full py-4 rounded-full flex-row items-center justify-center gap-2 ${
            selected.length > 0 ? 'bg-black' : 'bg-neutral-300'
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
