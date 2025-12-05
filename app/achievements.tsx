import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/stores/authStore';

const { width } = Dimensions.get('window');

type Tab = 'achievements' | 'badges' | 'stats';

const achievements = [
  {
    id: '1',
    title: 'Primeira Partida',
    description: 'Complete sua primeira partida',
    icon: 'sports-tennis',
    xp: 100,
    unlocked: true,
    unlockedAt: '2024-01-15',
    color: '#22C55E',
  },
  {
    id: '2',
    title: 'Maratonista',
    description: 'Jogue 10 partidas em uma semana',
    icon: 'directions-run',
    xp: 500,
    progress: 7,
    target: 10,
    unlocked: false,
    color: '#3B82F6',
  },
  {
    id: '3',
    title: 'Social',
    description: 'Adicione 5 amigos',
    icon: 'people',
    xp: 200,
    progress: 3,
    target: 5,
    unlocked: false,
    color: '#8B5CF6',
  },
  {
    id: '4',
    title: 'Sequência de Fogo',
    description: 'Mantenha uma sequência de 7 dias',
    icon: 'local-fire-department',
    xp: 300,
    unlocked: true,
    unlockedAt: '2024-02-01',
    color: '#F59E0B',
  },
  {
    id: '5',
    title: 'Campeão',
    description: 'Vença seu primeiro torneio',
    icon: 'emoji-events',
    xp: 1000,
    unlocked: false,
    color: '#EF4444',
  },
  {
    id: '6',
    title: 'Explorador',
    description: 'Jogue em 10 quadras diferentes',
    icon: 'explore',
    xp: 400,
    progress: 4,
    target: 10,
    unlocked: false,
    color: '#10B981',
  },
];

const badges = [
  {
    id: '1',
    title: 'Veterano',
    description: 'Membro há mais de 1 ano',
    icon: 'military-tech',
    tier: 'gold',
    unlocked: false,
  },
  {
    id: '2',
    title: 'Top Player',
    description: 'Entre os 10% melhores',
    icon: 'star',
    tier: 'platinum',
    unlocked: false,
  },
  {
    id: '3',
    title: 'Influencer',
    description: 'Mais de 100 seguidores',
    icon: 'trending-up',
    tier: 'silver',
    unlocked: false,
  },
  {
    id: '4',
    title: 'Iniciante',
    description: 'Completou o tutorial',
    icon: 'school',
    tier: 'bronze',
    unlocked: true,
  },
];

const tierColors = {
  bronze: { bg: '#CD7F32', text: '#fff' },
  silver: { bg: '#C0C0C0', text: '#000' },
  gold: { bg: '#FFD700', text: '#000' },
  platinum: { bg: '#E5E4E2', text: '#000' },
};

export default function AchievementsScreen() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('achievements');

  const gamification = {
    level: profile?.level || 1,
    xp: profile?.xp || 1250,
    xpToNext: profile?.xp_to_next_level || 3000,
    streak: profile?.streak || 7,
    totalMatches: 42,
    wins: 28,
    winRate: 67,
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXp = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-black ml-2">Conquistas</Text>
      </View>

      {/* Level Card */}
      <View className="mx-4 mt-4">
        <LinearGradient
          colors={['#1F2937', '#111827']}
          className="p-5 rounded-2xl"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 bg-neutral-700 rounded-2xl items-center justify-center border-2 border-neutral-600">
                <Text className="text-3xl font-black text-white">{gamification.level}</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-white">Nível {gamification.level}</Text>
                <Text className="text-sm text-neutral-400">
                  {gamification.xp.toLocaleString()} / {gamification.xpToNext.toLocaleString()} XP
                </Text>
              </View>
            </View>
            <View className="items-end">
              <View className="flex-row items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-lg">
                <MaterialIcons name="local-fire-department" size={16} color="#F59E0B" />
                <Text className="text-sm font-bold text-amber-500">{gamification.streak}</Text>
              </View>
            </View>
          </View>

          {/* XP Bar */}
          <View className="mt-4 h-3 bg-neutral-700 rounded-full overflow-hidden">
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full rounded-full"
              style={{ width: `${(gamification.xp / gamification.xpToNext) * 100}%` }}
            />
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center justify-around mt-4 pt-4 border-t border-neutral-700">
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">{gamification.totalMatches}</Text>
              <Text className="text-xs text-neutral-400">Partidas</Text>
            </View>
            <View className="w-px h-8 bg-neutral-700" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">{gamification.wins}</Text>
              <Text className="text-xs text-neutral-400">Vitórias</Text>
            </View>
            <View className="w-px h-8 bg-neutral-700" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-400">{gamification.winRate}%</Text>
              <Text className="text-xs text-neutral-400">Taxa</Text>
            </View>
            <View className="w-px h-8 bg-neutral-700" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-amber-400">{totalXp}</Text>
              <Text className="text-xs text-neutral-400">XP Total</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 mt-4 bg-white rounded-xl p-1">
        {[
          { id: 'achievements', label: 'Conquistas', icon: 'emoji-events' },
          { id: 'badges', label: 'Badges', icon: 'military-tech' },
          { id: 'stats', label: 'Estatísticas', icon: 'analytics' },
        ].map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 flex-row items-center justify-center gap-1 py-3 rounded-lg ${
              activeTab === tab.id ? 'bg-black' : ''
            }`}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? '#fff' : '#737373'}
            />
            <Text
              className={`text-sm font-medium ${
                activeTab === tab.id ? 'text-white' : 'text-neutral-500'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <View className="px-4">
            <Text className="text-sm text-neutral-500 mb-3">
              {unlockedCount} de {achievements.length} desbloqueadas
            </Text>

            <View className="gap-3">
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  className={`p-4 rounded-2xl ${
                    achievement.unlocked ? 'bg-white' : 'bg-neutral-100'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-14 h-14 rounded-xl items-center justify-center ${
                        achievement.unlocked ? '' : 'opacity-50'
                      }`}
                      style={{ backgroundColor: `${achievement.color}20` }}
                    >
                      <MaterialIcons
                        name={achievement.icon as any}
                        size={28}
                        color={achievement.unlocked ? achievement.color : '#A3A3A3'}
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-center gap-2">
                        <Text
                          className={`text-base font-semibold ${
                            achievement.unlocked ? 'text-black' : 'text-neutral-500'
                          }`}
                        >
                          {achievement.title}
                        </Text>
                        {achievement.unlocked && (
                          <MaterialIcons name="check-circle" size={16} color="#22C55E" />
                        )}
                      </View>
                      <Text className="text-sm text-neutral-500 mt-0.5">
                        {achievement.description}
                      </Text>
                      {achievement.progress !== undefined && !achievement.unlocked && (
                        <View className="mt-2">
                          <View className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <View
                              className="h-full rounded-full"
                              style={{
                                width: `${(achievement.progress / (achievement.target || 1)) * 100}%`,
                                backgroundColor: achievement.color,
                              }}
                            />
                          </View>
                          <Text className="text-xs text-neutral-400 mt-1">
                            {achievement.progress}/{achievement.target}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="items-end">
                      <View
                        className={`px-2 py-1 rounded-lg ${
                          achievement.unlocked ? 'bg-green-100' : 'bg-neutral-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            achievement.unlocked ? 'text-green-600' : 'text-neutral-500'
                          }`}
                        >
                          +{achievement.xp} XP
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <View className="px-4">
            <View className="flex-row flex-wrap gap-3">
              {badges.map((badge) => (
                <View
                  key={badge.id}
                  className={`w-[48%] p-4 rounded-2xl items-center ${
                    badge.unlocked ? 'bg-white' : 'bg-neutral-100'
                  }`}
                >
                  <View
                    className={`w-16 h-16 rounded-full items-center justify-center ${
                      badge.unlocked ? '' : 'opacity-40'
                    }`}
                    style={{
                      backgroundColor: badge.unlocked
                        ? tierColors[badge.tier as keyof typeof tierColors].bg
                        : '#D4D4D4',
                    }}
                  >
                    <MaterialIcons
                      name={badge.icon as any}
                      size={32}
                      color={
                        badge.unlocked
                          ? tierColors[badge.tier as keyof typeof tierColors].text
                          : '#fff'
                      }
                    />
                  </View>
                  <Text
                    className={`text-sm font-semibold mt-3 ${
                      badge.unlocked ? 'text-black' : 'text-neutral-400'
                    }`}
                  >
                    {badge.title}
                  </Text>
                  <Text className="text-xs text-neutral-500 text-center mt-1">
                    {badge.description}
                  </Text>
                  <View
                    className="mt-2 px-2 py-0.5 rounded capitalize"
                    style={{
                      backgroundColor: badge.unlocked
                        ? tierColors[badge.tier as keyof typeof tierColors].bg
                        : '#E5E5E5',
                    }}
                  >
                    <Text
                      className="text-[10px] font-bold uppercase"
                      style={{
                        color: badge.unlocked
                          ? tierColors[badge.tier as keyof typeof tierColors].text
                          : '#737373',
                      }}
                    >
                      {badge.tier}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <View className="px-4">
            <View className="bg-white rounded-2xl p-4 gap-4">
              {[
                { label: 'Total de Partidas', value: '42', icon: 'sports-tennis' },
                { label: 'Vitórias', value: '28', icon: 'emoji-events' },
                { label: 'Derrotas', value: '14', icon: 'close' },
                { label: 'Taxa de Vitória', value: '67%', icon: 'trending-up' },
                { label: 'Maior Sequência', value: '12 dias', icon: 'local-fire-department' },
                { label: 'Quadras Jogadas', value: '8', icon: 'place' },
                { label: 'Parceiros', value: '15', icon: 'people' },
                { label: 'Tempo Total', value: '84h', icon: 'schedule' },
              ].map((stat, index) => (
                <View key={index} className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
                      <MaterialIcons name={stat.icon as any} size={20} color="#525252" />
                    </View>
                    <Text className="text-base text-neutral-600">{stat.label}</Text>
                  </View>
                  <Text className="text-lg font-bold text-black">{stat.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
