import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

const SPORTS = [
  { id: 'futebol', name: 'Futebol', icon: 'sports-soccer' },
  { id: 'volei', name: 'Vôlei', icon: 'sports-volleyball' },
  { id: 'beach-tennis', name: 'Beach Tennis', icon: 'sports-tennis' },
  { id: 'futevolei', name: 'Futevôlei', icon: 'sports-volleyball' },
  { id: 'tenis', name: 'Tênis', icon: 'sports-tennis' },
  { id: 'padel', name: 'Padel', icon: 'sports-tennis' },
  { id: 'basquete', name: 'Basquete', icon: 'sports-basketball' },
  { id: 'handebol', name: 'Handebol', icon: 'sports-handball' },
];

export default function SegmentsScreen() {
  const { profile, user } = useAuthStore();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Carregar esportes salvos do perfil
    if (profile?.favorite_sports) {
      setSelectedSports(profile.favorite_sports);
    }
  }, [profile]);

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((s) => s !== sportId)
        : [...prev, sportId]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_sports: selectedSports })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Seus esportes favoritos foram atualizados!');
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="p-1 -ml-1">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Meus Esportes</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          <Text className="text-sm text-neutral-500 mb-4">
            Selecione os esportes que você pratica. Isso nos ajuda a personalizar suas recomendações.
          </Text>

          <View className="gap-3">
            {SPORTS.map((sport) => {
              const isSelected = selectedSports.includes(sport.id);
              return (
                <Pressable
                  key={sport.id}
                  onPress={() => toggleSport(sport.id)}
                  className={`flex-row items-center p-4 rounded-2xl border-2 ${
                    isSelected
                      ? 'border-[#84CC16] bg-lime-50'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center ${
                      isSelected ? 'bg-[#84CC16]' : 'bg-neutral-100'
                    }`}
                  >
                    <MaterialIcons
                      name={sport.icon as any}
                      size={24}
                      color={isSelected ? '#fff' : '#525252'}
                    />
                  </View>
                  <Text
                    className={`flex-1 ml-4 font-semibold text-base ${
                      isSelected ? 'text-lime-800' : 'text-black'
                    }`}
                  >
                    {sport.name}
                  </Text>
                  {isSelected && (
                    <MaterialIcons name="check-circle" size={24} color="#84CC16" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-5 py-4 pb-8 border-t border-neutral-100">
        <Pressable
          onPress={handleSave}
          disabled={saving || selectedSports.length === 0}
          className={`py-4 rounded-2xl items-center ${
            selectedSports.length > 0 && !saving
              ? 'bg-[#84CC16]'
              : 'bg-neutral-300'
          }`}
        >
          <Text className="font-semibold text-base text-white">
            {saving ? 'Salvando...' : `Salvar (${selectedSports.length} selecionado${selectedSports.length !== 1 ? 's' : ''})`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
