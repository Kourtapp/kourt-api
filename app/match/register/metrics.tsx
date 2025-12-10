import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRegisterMatch } from '@/contexts/RegisterMatchContext';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const FEELINGS = [
  { id: 'bad', emoji: '😣' },
  { id: 'neutral', emoji: '😐' },
  { id: 'good', emoji: '😊' },
  { id: 'great', emoji: '🤩' },
];

export default function RegisterMetricsScreen() {
  const { user } = useAuthStore();
  const { data, updateData, reset } = useRegisterMatch();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para publicar');
      return;
    }

    setIsPublishing(true);

    try {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          created_by: user.id,
          sport: data.sport,
          court_id: data.courtId,
          match_date: data.date.toISOString().split('T')[0],
          start_time: data.time,
          duration: data.duration,
          status: 'completed',
          result: data.result,
          score: data.score,
          players: data.players,
          intensity: data.intensity,
          effort: data.effort,
          feeling: data.feeling,
          aces_winners: data.acesWinners,
          unforced_errors: data.unforcedErrors,
          notes: data.notes,
        })
        .select()
        .single();

      if (matchError) throw matchError;

      if (!data.silentActivity) {
        const postContent = generatePostContent();

        await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            match_id: matchData.id,
            content: postContent,
            visibility: data.visibility,
            media: data.photos.map(p => ({
              url: p.uri,
              type: p.type,
            })),
          });
      }

      router.replace({
        pathname: '/match/register/complete',
        params: { matchId: matchData.id },
      } as any);
    } catch (error: any) {
      console.error('Error publishing match:', error);
      Alert.alert('Erro', 'Não foi possível publicar a partida. Tente novamente.');
      setIsPublishing(false);
    }
  };

  const generatePostContent = () => {
    const resultText = data.result === 'win' ? 'Vitória!' : data.result === 'loss' ? 'Derrota' : 'Empate';
    const scoreText = data.score.teamA.map((a, i) => `${a}-${data.score.teamB[i]}`).join(', ');
    return `${data.sport} - ${resultText} ${scoreText} ${data.courtName ? `em ${data.courtName}` : ''}`.trim();
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 1) return 'Leve';
    if (value <= 2) return 'Baixa';
    if (value <= 3) return 'Moderada';
    if (value <= 4) return 'Alta';
    return 'Intensa';
  };

  const getEffortLabel = (value: number) => {
    if (value <= 1) return 'Pouco';
    if (value <= 2) return 'Baixo';
    if (value <= 3) return 'Médio';
    if (value <= 4) return 'Alto';
    return 'Máximo';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Métricas</Text>
        <Text className="text-neutral-400 font-medium">4/4</Text>
      </View>

      {/* Progress Bar */}
      <View className="flex-row px-5 gap-2 mb-6">
        <View className="flex-1 h-1 bg-black rounded-full" />
        <View className="flex-1 h-1 bg-black rounded-full" />
        <View className="flex-1 h-1 bg-black rounded-full" />
        <View className="flex-1 h-1 bg-black rounded-full" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Apple Watch Data Card */}
        {data.appleWatchData && (
          <LinearGradient
            colors={['#EC4899', '#F472B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 20, marginBottom: 24 }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                <MaterialIcons name="watch" size={20} color="#fff" />
              </View>
              <View>
                <Text className="text-white font-semibold">Dados do Apple Watch</Text>
                <Text className="text-white/70 text-sm">Sincronizado automaticamente</Text>
              </View>
            </View>
            <View className="flex-row">
              <View className="flex-1 bg-white/20 rounded-2xl p-4 mr-2">
                <Text className="text-white text-3xl font-bold">{data.appleWatchData.avgBPM}</Text>
                <Text className="text-white/70 text-sm">BPM Médio</Text>
              </View>
              <View className="flex-1 bg-white/20 rounded-2xl p-4 mr-2">
                <Text className="text-white text-3xl font-bold">{data.appleWatchData.calories}</Text>
                <Text className="text-white/70 text-sm">Calorias</Text>
              </View>
              <View className="flex-1 bg-white/20 rounded-2xl p-4">
                <Text className="text-white text-3xl font-bold">{data.appleWatchData.distance}</Text>
                <Text className="text-white/70 text-sm">Km</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Metrics Section */}
        <Text className="text-base font-bold text-black mb-4">Adicionar métricas</Text>

        {/* Intensity and Effort Row */}
        <View className="flex-row gap-3 mb-4">
          {/* Intensity */}
          <View className="flex-1 bg-neutral-50 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="local-fire-department" size={18} color="#000" />
              <Text className="font-semibold text-black">Intensidade</Text>
            </View>
            <View className="flex-row gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => updateData({ intensity: level })}
                  className={`flex-1 h-8 rounded-lg ${
                    level <= data.intensity
                      ? level <= 3 ? 'bg-black' : 'bg-amber-400'
                      : 'bg-neutral-200'
                  }`}
                />
              ))}
            </View>
            <Text className="text-neutral-500 text-sm">{getIntensityLabel(data.intensity)}</Text>
          </View>

          {/* Effort */}
          <View className="flex-1 bg-neutral-50 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="fitness-center" size={18} color="#3B82F6" />
              <Text className="font-semibold text-black">Esforço</Text>
            </View>
            <View className="flex-row gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => updateData({ effort: level })}
                  className={`flex-1 h-8 rounded-lg ${
                    level <= data.effort ? 'bg-blue-500' : 'bg-blue-100'
                  }`}
                />
              ))}
            </View>
            <Text className="text-neutral-500 text-sm">{getEffortLabel(data.effort)}</Text>
          </View>
        </View>

        {/* Feeling */}
        <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="mood" size={18} color="#22C55E" />
              <Text className="font-semibold text-black">Como se sentiu?</Text>
            </View>
            <View className="flex-row gap-2">
              {FEELINGS.map((feeling) => (
                <TouchableOpacity
                  key={feeling.id}
                  onPress={() => updateData({ feeling: feeling.id as any })}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    data.feeling === feeling.id ? 'bg-white shadow' : ''
                  }`}
                >
                  <Text className={`text-2xl ${data.feeling === feeling.id ? '' : 'opacity-40'}`}>
                    {feeling.emoji}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Aces/Winners */}
        <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">🎾</Text>
              <Text className="font-semibold text-black">Aces / Winners</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => updateData({ acesWinners: Math.max(0, data.acesWinners - 1) })}
                className="w-10 h-10 bg-neutral-200 rounded-xl items-center justify-center"
              >
                <MaterialIcons name="remove" size={20} color="#737373" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-black w-8 text-center">
                {data.acesWinners}
              </Text>
              <TouchableOpacity
                onPress={() => updateData({ acesWinners: data.acesWinners + 1 })}
                className="w-10 h-10 bg-black rounded-xl items-center justify-center"
              >
                <MaterialIcons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Unforced Errors */}
        <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="w-5 h-5 bg-red-100 rounded-full items-center justify-center">
                <MaterialIcons name="error-outline" size={14} color="#EF4444" />
              </View>
              <Text className="font-semibold text-black">Erros não forçados</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => updateData({ unforcedErrors: Math.max(0, data.unforcedErrors - 1) })}
                className="w-10 h-10 bg-neutral-200 rounded-xl items-center justify-center"
              >
                <MaterialIcons name="remove" size={20} color="#737373" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-black w-8 text-center">
                {data.unforcedErrors}
              </Text>
              <TouchableOpacity
                onPress={() => updateData({ unforcedErrors: data.unforcedErrors + 1 })}
                className="w-10 h-10 bg-black rounded-xl items-center justify-center"
              >
                <MaterialIcons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notes */}
        <Text className="text-base font-bold text-black mb-3">Notas (opcional)</Text>
        <TextInput
          value={data.notes}
          onChangeText={(text) => updateData({ notes: text })}
          placeholder="Como foi o jogo? O que você aprendeu?"
          placeholderTextColor="#A3A3A3"
          multiline
          numberOfLines={3}
          className="bg-neutral-50 rounded-2xl p-4 text-black mb-6"
          style={{ textAlignVertical: 'top', minHeight: 100 }}
        />

        <View className="h-32" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <TouchableOpacity
          onPress={handlePublish}
          disabled={isPublishing}
          className="py-4 rounded-full items-center"
          style={{ backgroundColor: '#84CC16' }}
        >
          {isPublishing ? (
            <ActivityIndicator color="#1A2E05" />
          ) : (
            <Text className="text-[#1A2E05] font-bold text-base">Publicar Partida</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
