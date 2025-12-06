import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

const SPORTS = [
  { id: 'beach_tennis', name: 'Beach Tennis', icon: 'sports-tennis', color: '#F59E0B' },
  { id: 'padel', name: 'Padel', icon: 'sports-tennis', color: '#3B82F6' },
  { id: 'tenis', name: 'Tênis', icon: 'sports-tennis', color: '#22C55E' },
  { id: 'futevolei', name: 'Futevôlei', icon: 'sports-volleyball', color: '#EF4444' },
  { id: 'volei', name: 'Vôlei', icon: 'sports-volleyball', color: '#8B5CF6' },
  { id: 'futebol', name: 'Futebol', icon: 'sports-soccer', color: '#10B981' },
  { id: 'basquete', name: 'Basquete', icon: 'sports-basketball', color: '#F97316' },
  { id: 'handebol', name: 'Handebol', icon: 'sports-handball', color: '#06B6D4' },
];

const LEVELS = [
  { id: 'beginner', name: 'Iniciante', description: 'Estou começando' },
  { id: 'intermediate', name: 'Intermediário', description: 'Jogo regularmente' },
  { id: 'advanced', name: 'Avançado', description: 'Jogo competitivamente' },
];

export default function SportsSettingsScreen() {
  const { user, profile, refreshProfile } = useAuthStore();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [sportLevels, setSportLevels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setSelectedSports(profile.sports || []);
      setSportLevels(profile.sport_levels || {});
    }
  }, [profile]);

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        // Remove sport and its level
        const newLevels = { ...sportLevels };
        delete newLevels[sportId];
        setSportLevels(newLevels);
        return prev.filter(s => s !== sportId);
      } else {
        // Add sport with default level
        setSportLevels(prev => ({ ...prev, [sportId]: 'intermediate' }));
        return [...prev, sportId];
      }
    });
  };

  const setLevel = (sportId: string, level: string) => {
    setSportLevels(prev => ({ ...prev, [sportId]: level }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (selectedSports.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um esporte.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          sports: selectedSports,
          sport_levels: sportLevels,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('Sucesso', 'Seus esportes foram atualizados!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error saving sports:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-neutral-100">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text className="text-xl font-bold text-black">Meus Esportes</Text>
        </View>
        <Pressable onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#84CC16" />
          ) : (
            <Text className="text-lime-600 font-semibold text-base">Salvar</Text>
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Sports Selection */}
        <View className="px-5 pt-5">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Selecione seus esportes
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {SPORTS.map((sport) => {
              const isSelected = selectedSports.includes(sport.id);
              return (
                <Pressable
                  key={sport.id}
                  onPress={() => toggleSport(sport.id)}
                  className={`flex-row items-center px-4 py-3 rounded-xl border-2 ${
                    isSelected
                      ? 'border-lime-500 bg-lime-50'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <MaterialIcons
                    name={sport.icon as any}
                    size={20}
                    color={isSelected ? sport.color : '#A3A3A3'}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      isSelected ? 'text-black' : 'text-neutral-500'
                    }`}
                  >
                    {sport.name}
                  </Text>
                  {isSelected && (
                    <MaterialIcons
                      name="check-circle"
                      size={18}
                      color="#84CC16"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Levels for selected sports */}
        {selectedSports.length > 0 && (
          <View className="px-5 pt-8 pb-10">
            <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Seu nível em cada esporte
            </Text>
            <View className="gap-4">
              {selectedSports.map((sportId) => {
                const sport = SPORTS.find(s => s.id === sportId);
                if (!sport) return null;

                return (
                  <View
                    key={sportId}
                    className="bg-white rounded-2xl border border-neutral-200 p-4"
                  >
                    <View className="flex-row items-center mb-4">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${sport.color}20` }}
                      >
                        <MaterialIcons
                          name={sport.icon as any}
                          size={20}
                          color={sport.color}
                        />
                      </View>
                      <Text className="ml-3 font-semibold text-black text-base">
                        {sport.name}
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      {LEVELS.map((level) => {
                        const isSelected = sportLevels[sportId] === level.id;
                        return (
                          <Pressable
                            key={level.id}
                            onPress={() => setLevel(sportId, level.id)}
                            className={`flex-1 py-3 px-2 rounded-xl border-2 items-center ${
                              isSelected
                                ? 'border-lime-500 bg-lime-50'
                                : 'border-neutral-200 bg-neutral-50'
                            }`}
                          >
                            <Text
                              className={`text-sm font-medium ${
                                isSelected ? 'text-lime-700' : 'text-neutral-600'
                              }`}
                            >
                              {level.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Empty state */}
        {selectedSports.length === 0 && (
          <View className="items-center py-12 px-5">
            <MaterialIcons name="sports" size={48} color="#D1D5DB" />
            <Text className="text-neutral-400 text-center mt-4">
              Selecione os esportes que você pratica para encontrar partidas e jogadores compatíveis.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
