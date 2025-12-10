import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { useRegisterMatch } from '@/contexts/RegisterMatchContext';
import { useAuthStore } from '@/stores/authStore';

export default function MatchCompleteScreen() {
  const { data, reset } = useRegisterMatch();
  const { profile } = useAuthStore();
  const params = useLocalSearchParams<{ matchId?: string }>();

  const handleShare = async (platform: string) => {
    try {
      if (platform === 'more') {
        await Share.share({
          message: 'Acabei de registrar uma partida no Kourt! Baixe o app e jogue comigo.',
          url: 'https://kourt.app',
        });
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleViewFeed = () => {
    reset();
    router.replace('/(tabs)/social');
  };

  const handleClose = () => {
    reset();
    router.replace('/(tabs)');
  };

  const scoreText = data.score.teamA.map((a, i) => `${a} - ${data.score.teamB[i]}`).join(', ');
  const resultLabel = data.result === 'win' ? 'VITÓRIA' : data.result === 'loss' ? 'DERROTA' : 'EMPATE';
  const today = new Date();
  const dateText = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-end px-5 py-4">
        <TouchableOpacity onPress={handleClose}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <Animated.View entering={BounceIn.delay(200)} className="items-center pt-4 pb-6">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="check" size={40} color="#22C55E" />
          </View>
          <Text className="text-2xl font-bold text-black mb-2">Partida Registrada!</Text>
          <Text className="text-green-600 font-semibold">+25 XP · +15 pontos ranking</Text>
        </Animated.View>

        {/* Match Card */}
        <Animated.View entering={FadeIn.delay(400)} className="mx-5 mb-6">
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 20 }}
          >
            {/* Header Row */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 bg-white rounded-lg items-center justify-center">
                  <Text className="font-bold text-green-600">K</Text>
                </View>
                <Text className="text-white font-bold">KOURT</Text>
              </View>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-bold">{resultLabel}</Text>
              </View>
            </View>

            {/* Sport and Location */}
            <Text className="text-white/80 text-sm mb-1">
              {data.sport} · {data.courtName || 'Arena Ibirapuera'}
            </Text>

            {/* Score */}
            <Text className="text-white text-5xl font-bold mb-4">{scoreText}</Text>

            {/* Stats Row */}
            <View className="flex-row gap-2 flex-wrap mb-4">
              <View className="bg-white/20 px-3 py-2 rounded-xl">
                <Text className="text-white text-xs font-medium">
                  {formatDuration(data.duration)}
                </Text>
                <Text className="text-white/60 text-xs">DURAÇÃO</Text>
              </View>
              {data.appleWatchData && (
                <>
                  <View className="bg-white/20 px-3 py-2 rounded-xl">
                    <Text className="text-white text-xs font-medium">
                      {data.appleWatchData.calories}
                    </Text>
                    <Text className="text-white/60 text-xs">CALORIAS</Text>
                  </View>
                  <View className="bg-white/20 px-3 py-2 rounded-xl">
                    <Text className="text-white text-xs font-medium">
                      {data.appleWatchData.avgBPM}
                    </Text>
                    <Text className="text-white/60 text-xs">BPM MÉD</Text>
                  </View>
                  <View className="bg-white/20 px-3 py-2 rounded-xl">
                    <Text className="text-white text-xs font-medium">
                      {data.appleWatchData.distance}
                    </Text>
                    <Text className="text-white/60 text-xs">KM</Text>
                  </View>
                </>
              )}
            </View>

            {/* Player Info */}
            <View className="flex-row items-center justify-between pt-4 border-t border-white/20">
              <View className="flex-row items-center gap-2">
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} className="w-8 h-8 rounded-full" />
                ) : (
                  <View className="w-8 h-8 bg-white/30 rounded-full items-center justify-center">
                    <Text className="text-white font-bold text-sm">
                      {profile?.name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
                <Text className="text-white font-semibold">{profile?.name || 'Jogador'}</Text>
              </View>
              <Text className="text-white/70 text-sm">{dateText} · {data.time}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Share Section */}
        <Animated.View entering={FadeIn.delay(600)} className="px-5 mb-6">
          <Text className="text-base font-bold text-black mb-4">Compartilhar</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleShare('instagram')}
              className="flex-1 bg-neutral-50 rounded-2xl py-4 items-center"
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                style={{ backgroundColor: '#E1306C' }}
              >
                <MaterialIcons name="camera-alt" size={24} color="#fff" />
              </View>
              <Text className="text-black font-medium text-sm">Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare('whatsapp')}
              className="flex-1 bg-neutral-50 rounded-2xl py-4 items-center"
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                style={{ backgroundColor: '#25D366' }}
              >
                <MaterialIcons name="chat" size={24} color="#fff" />
              </View>
              <Text className="text-black font-medium text-sm">WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare('twitter')}
              className="flex-1 bg-neutral-50 rounded-2xl py-4 items-center"
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                style={{ backgroundColor: '#000' }}
              >
                <Text className="text-white font-bold text-lg">X</Text>
              </View>
              <Text className="text-black font-medium text-sm">Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare('more')}
              className="flex-1 bg-neutral-50 rounded-2xl py-4 items-center"
            >
              <View className="w-12 h-12 bg-neutral-200 rounded-xl items-center justify-center mb-2">
                <MaterialIcons name="more-horiz" size={24} color="#737373" />
              </View>
              <Text className="text-black font-medium text-sm">Mais</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Save Image Button */}
        <Animated.View entering={FadeIn.delay(700)} className="px-5 mb-6">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-4 border border-neutral-200 rounded-full"
          >
            <MaterialIcons name="save-alt" size={20} color="#000" />
            <Text className="text-black font-semibold">Salvar imagem na galeria</Text>
          </TouchableOpacity>
        </Animated.View>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <TouchableOpacity
          onPress={handleViewFeed}
          className="bg-black py-4 rounded-full items-center"
        >
          <Text className="text-white font-bold text-base">Ver no Feed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
