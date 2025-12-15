import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'comum' | 'rara' | 'lendaria';
  unlockedAt?: string;
  progress?: { current: number; total: number };
}

export default function AchievementsScreen() {
  const progress = {
    level: 12,
    percentage: 65,
    currentXP: 1250,
    nextLevelXP: 2000,
  };

  const stats = {
    total: 24,
    raras: 8,
    lendarias: 2,
  };

  const recentAchievements: Achievement[] = [
    {
      id: '1',
      name: 'Sequência de Vitórias',
      description: '10 vitórias consecutivas',
      icon: 'local-fire-department',
      rarity: 'lendaria',
      unlockedAt: 'Desbloqueada há 2 dias',
    },
    {
      id: '2',
      name: 'Networker',
      description: 'Jogou com 50 pessoas diferentes',
      icon: 'groups',
      rarity: 'rara',
      unlockedAt: 'Desbloqueada há 1 semana',
    },
    {
      id: '3',
      name: 'Primeira Vitória',
      description: 'Venceu sua primeira partida',
      icon: 'emoji-events',
      rarity: 'comum',
      unlockedAt: 'Desbloqueada em Jan 2023',
    },
  ];

  const allAchievements: Achievement[] = [
    { id: 'a1', name: 'Estreante', description: 'Primeira partida', icon: 'sports-tennis', rarity: 'comum' },
    { id: 'a2', name: 'Madrugador', description: 'Jogue antes das 7h', icon: 'schedule', rarity: 'comum' },
    { id: 'a3', name: '5 Estrelas', description: 'Avaliação 5 estrelas', icon: 'star', rarity: 'rara' },
    { id: 'a4', name: 'Veloz', description: 'Partida em menos de 30min', icon: 'bolt', rarity: 'rara' },
    { id: 'a5', name: 'Em Chamas', description: '5 vitórias seguidas', icon: 'local-fire-department', rarity: 'comum' },
    { id: 'a6', name: 'Social', description: 'Jogue com 10 pessoas', icon: 'groups', rarity: 'comum' },
  ];

  const progressAchievements: Achievement[] = [
    { id: 'p1', name: 'Centurião', description: 'Jogue 100 partidas', icon: 'emoji-events', rarity: 'comum', progress: { current: 89, total: 100 } },
    { id: 'p2', name: 'Explorador', description: 'Jogue em 30 quadras diferentes', icon: 'explore', rarity: 'comum', progress: { current: 23, total: 30 } },
    { id: 'p3', name: 'Campeão Regional', description: 'Alcance o Top 10 do ranking', icon: 'military-tech', rarity: 'rara', progress: { current: 47, total: 10 } },
  ];

  const getRarityColors = (rarity: string): [string, string] => {
    switch (rarity) {
      case 'lendaria':
        return ['#A855F7', '#EC4899'];
      case 'rara':
        return ['#F59E0B', '#FBBF24'];
      default:
        return ['#22C55E', '#4ADE80'];
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'lendaria':
        return '#FAE8FF';
      case 'rara':
        return '#FEF3C7';
      default:
        return '#DCFCE7';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'lendaria':
        return 'LENDÁRIA';
      case 'rara':
        return 'RARA';
      default:
        return 'COMUM';
    }
  };

  const getRarityLabelColor = (rarity: string) => {
    switch (rarity) {
      case 'lendaria':
        return '#A855F7';
      case 'rara':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black ml-4">Conquistas</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View className="mx-5 mb-6 p-4 bg-black rounded-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-semibold">Seu progresso</Text>
            <Text className="text-white">Nível {progress.level}</Text>
          </View>
          <View className="flex-row items-center gap-3 mb-2">
            <View className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <View
                className="h-full bg-white rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </View>
            <Text className="text-white font-bold">{progress.percentage}%</Text>
          </View>
          <Text className="text-white/60 text-sm">
            {progress.currentXP} / {progress.nextLevelXP} XP para o próximo nível
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row mx-5 mb-6 gap-3">
          <View className="flex-1 p-4 bg-white rounded-2xl border border-neutral-200 items-center">
            <Text className="text-2xl font-bold text-black">{stats.total}</Text>
            <Text className="text-neutral-500 text-sm">Conquistas</Text>
          </View>
          <View className="flex-1 p-4 bg-white rounded-2xl border border-neutral-200 items-center">
            <Text className="text-2xl font-bold text-amber-500">{stats.raras}</Text>
            <Text className="text-neutral-500 text-sm">Raras</Text>
          </View>
          <View className="flex-1 p-4 bg-white rounded-2xl border border-neutral-200 items-center">
            <Text className="text-2xl font-bold text-purple-500">{stats.lendarias}</Text>
            <Text className="text-neutral-500 text-sm">Lendárias</Text>
          </View>
        </View>

        {/* Recent Achievements */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            RECENTES
          </Text>
          <View className="gap-3">
            {recentAchievements.map((achievement) => (
              <View
                key={achievement.id}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: getRarityBgColor(achievement.rarity) }}
              >
                {achievement.rarity === 'lendaria' ? (
                  <LinearGradient
                    colors={getRarityColors(achievement.rarity)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 16 }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-14 h-14 bg-white/20 rounded-xl items-center justify-center">
                        <MaterialIcons name={achievement.icon as any} size={28} color="#fff" />
                      </View>
                      <View className="flex-1 ml-3">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-white font-bold text-lg">{achievement.name}</Text>
                          <View className="bg-white/20 px-2 py-0.5 rounded">
                            <Text className="text-white text-xs font-bold">
                              {getRarityLabel(achievement.rarity)}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-white/80">{achievement.description}</Text>
                        <Text className="text-white/60 text-sm mt-1">{achievement.unlockedAt}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                ) : (
                  <View className="p-4 flex-row items-center">
                    <View
                      className="w-14 h-14 rounded-xl items-center justify-center"
                      style={{ backgroundColor: getRarityBgColor(achievement.rarity) }}
                    >
                      <MaterialIcons
                        name={achievement.icon as any}
                        size={28}
                        color={getRarityLabelColor(achievement.rarity)}
                      />
                    </View>
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-black font-bold text-lg">{achievement.name}</Text>
                        <View
                          className="px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${getRarityLabelColor(achievement.rarity)}20` }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: getRarityLabelColor(achievement.rarity) }}
                          >
                            {getRarityLabel(achievement.rarity)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-neutral-600">{achievement.description}</Text>
                      <Text className="text-neutral-400 text-sm mt-1">{achievement.unlockedAt}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* All Achievements Grid */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            TODAS AS CONQUISTAS
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {allAchievements.map((achievement) => (
              <View
                key={achievement.id}
                className="w-[23%] p-3 rounded-2xl border border-neutral-200 items-center"
              >
                <View
                  className="w-14 h-14 rounded-xl items-center justify-center mb-2"
                  style={{ backgroundColor: getRarityBgColor(achievement.rarity) }}
                >
                  <MaterialIcons
                    name={achievement.icon as any}
                    size={24}
                    color={getRarityLabelColor(achievement.rarity)}
                  />
                </View>
                <Text className="text-black font-medium text-sm text-center" numberOfLines={1}>
                  {achievement.name}
                </Text>
              </View>
            ))}
            {/* Locked achievements */}
            {[1, 2].map((i) => (
              <View
                key={`locked-${i}`}
                className="w-[23%] p-3 rounded-2xl border border-neutral-200 items-center opacity-50"
              >
                <View className="w-14 h-14 rounded-xl items-center justify-center mb-2 bg-neutral-100">
                  <MaterialIcons name="lock" size={24} color="#A3A3A3" />
                </View>
                <Text className="text-neutral-400 font-medium text-sm text-center">???</Text>
              </View>
            ))}
          </View>
        </View>

        {/* In Progress */}
        <View className="px-5 mb-8">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            EM PROGRESSO
          </Text>
          <View className="gap-3">
            {progressAchievements.map((achievement) => (
              <View
                key={achievement.id}
                className="p-4 bg-white rounded-2xl border border-neutral-200"
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center">
                    <MaterialIcons name={achievement.icon as any} size={24} color="#525252" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-bold text-black">{achievement.name}</Text>
                    <Text className="text-neutral-500 text-sm">{achievement.description}</Text>
                  </View>
                  <Text className="font-bold text-black">
                    {achievement.progress?.current}/{achievement.progress?.total}
                  </Text>
                </View>
                <View className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-black rounded-full"
                    style={{
                      width: `${Math.min(
                        ((achievement.progress?.current || 0) / (achievement.progress?.total || 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
