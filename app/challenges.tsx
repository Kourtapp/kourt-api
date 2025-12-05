import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/stores/authStore';

type Tab = 'daily' | 'weekly' | 'special';

const dailyChallenges = [
  {
    id: '1',
    title: 'Jogador Ativo',
    description: 'Jogue 2 partidas hoje',
    xp: 150,
    progress: 1,
    target: 2,
    icon: 'sports-tennis',
    color: '#22C55E',
    expiresIn: '8h restantes',
  },
  {
    id: '2',
    title: 'Social',
    description: 'Convide 1 amigo para uma partida',
    xp: 100,
    progress: 0,
    target: 1,
    icon: 'group-add',
    color: '#3B82F6',
    expiresIn: '8h restantes',
  },
  {
    id: '3',
    title: 'Explorador',
    description: 'Jogue em uma quadra nova',
    xp: 200,
    progress: 0,
    target: 1,
    icon: 'explore',
    color: '#8B5CF6',
    expiresIn: '8h restantes',
  },
];

const weeklyChallenges = [
  {
    id: '4',
    title: 'Maratonista',
    description: 'Complete 10 partidas esta semana',
    xp: 500,
    progress: 7,
    target: 10,
    icon: 'directions-run',
    color: '#F59E0B',
    expiresIn: '3 dias restantes',
  },
  {
    id: '5',
    title: 'Campeão da Semana',
    description: 'Vença 5 partidas',
    xp: 350,
    progress: 3,
    target: 5,
    icon: 'emoji-events',
    color: '#EF4444',
    expiresIn: '3 dias restantes',
  },
  {
    id: '6',
    title: 'Networking',
    description: 'Jogue com 5 jogadores diferentes',
    xp: 400,
    progress: 2,
    target: 5,
    icon: 'people',
    color: '#10B981',
    expiresIn: '3 dias restantes',
  },
];

const specialChallenges = [
  {
    id: '7',
    title: 'Torneio de Verão',
    description: 'Participe do torneio especial de verão',
    xp: 1000,
    progress: 0,
    target: 1,
    icon: 'wb-sunny',
    color: '#F59E0B',
    expiresIn: '15 dias restantes',
    isPro: true,
  },
  {
    id: '8',
    title: 'Lenda da Quadra',
    description: 'Alcance o nível 10',
    xp: 2000,
    progress: 3,
    target: 10,
    icon: 'military-tech',
    color: '#8B5CF6',
    expiresIn: null,
    isPro: false,
  },
];

export default function ChallengesScreen() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [refreshing, setRefreshing] = useState(false);

  const isPro = profile?.subscription === 'pro';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getChallenges = () => {
    switch (activeTab) {
      case 'daily':
        return dailyChallenges;
      case 'weekly':
        return weeklyChallenges;
      case 'special':
        return specialChallenges;
    }
  };

  const completedDaily = dailyChallenges.filter((c) => c.progress >= c.target).length;
  const completedWeekly = weeklyChallenges.filter((c) => c.progress >= c.target).length;

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-black ml-2">Desafios</Text>
      </View>

      {/* Summary Card */}
      <View className="mx-4 mt-4">
        <LinearGradient
          colors={['#38BDF8', '#0EA5E9', '#0284C7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5 rounded-2xl"
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <MaterialIcons name="bolt" size={28} color="#fff" />
            </View>
            <View>
              <Text className="text-lg font-bold text-white">Progresso de Hoje</Text>
              <Text className="text-sm text-white/80">
                Complete desafios para ganhar XP
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-around">
            <View className="items-center">
              <Text className="text-3xl font-bold text-white">
                {completedDaily}/{dailyChallenges.length}
              </Text>
              <Text className="text-xs text-white/70">Diários</Text>
            </View>
            <View className="w-px h-10 bg-white/30" />
            <View className="items-center">
              <Text className="text-3xl font-bold text-white">
                {completedWeekly}/{weeklyChallenges.length}
              </Text>
              <Text className="text-xs text-white/70">Semanais</Text>
            </View>
            <View className="w-px h-10 bg-white/30" />
            <View className="items-center">
              <Text className="text-3xl font-bold text-amber-300">
                {dailyChallenges.reduce((sum, c) => sum + (c.progress >= c.target ? c.xp : 0), 0)}
              </Text>
              <Text className="text-xs text-white/70">XP Ganho</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 mt-4 bg-white rounded-xl p-1">
        {[
          { id: 'daily', label: 'Diários', count: dailyChallenges.length },
          { id: 'weekly', label: 'Semanais', count: weeklyChallenges.length },
          { id: 'special', label: 'Especiais', count: specialChallenges.length },
        ].map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 py-3 rounded-lg items-center ${
              activeTab === tab.id ? 'bg-black' : ''
            }`}
          >
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

      <ScrollView
        className="flex-1 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 gap-3">
          {getChallenges().map((challenge) => {
            const isCompleted = challenge.progress >= challenge.target;
            const isLocked = (challenge as any).isPro && !isPro;

            return (
              <View
                key={challenge.id}
                className={`p-4 rounded-2xl ${
                  isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : isLocked
                    ? 'bg-neutral-100'
                    : 'bg-white'
                }`}
              >
                <View className="flex-row items-start">
                  <View
                    className={`w-14 h-14 rounded-xl items-center justify-center ${
                      isLocked ? 'opacity-50' : ''
                    }`}
                    style={{ backgroundColor: `${challenge.color}20` }}
                  >
                    {isLocked ? (
                      <MaterialIcons name="lock" size={28} color="#A3A3A3" />
                    ) : isCompleted ? (
                      <MaterialIcons name="check" size={28} color="#22C55E" />
                    ) : (
                      <MaterialIcons
                        name={challenge.icon as any}
                        size={28}
                        color={challenge.color}
                      />
                    )}
                  </View>

                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={`text-base font-semibold ${
                          isCompleted
                            ? 'text-green-700'
                            : isLocked
                            ? 'text-neutral-400'
                            : 'text-black'
                        }`}
                      >
                        {challenge.title}
                      </Text>
                      {(challenge as any).isPro && (
                        <View className="px-1.5 py-0.5 bg-amber-100 rounded">
                          <Text className="text-[10px] font-bold text-amber-700">PRO</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className={`text-sm mt-0.5 ${
                        isLocked ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      {challenge.description}
                    </Text>

                    {/* Progress Bar */}
                    {!isLocked && (
                      <View className="mt-3">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-xs text-neutral-400">
                            {challenge.progress}/{challenge.target}
                          </Text>
                          {challenge.expiresIn && (
                            <Text className="text-xs text-neutral-400">
                              {challenge.expiresIn}
                            </Text>
                          )}
                        </View>
                        <View className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <View
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`,
                              backgroundColor: isCompleted ? '#22C55E' : challenge.color,
                            }}
                          />
                        </View>
                      </View>
                    )}
                  </View>

                  <View
                    className={`px-3 py-1.5 rounded-lg ${
                      isCompleted
                        ? 'bg-green-500'
                        : isLocked
                        ? 'bg-neutral-200'
                        : 'bg-neutral-100'
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        isCompleted
                          ? 'text-white'
                          : isLocked
                          ? 'text-neutral-400'
                          : 'text-black'
                      }`}
                    >
                      +{challenge.xp}
                    </Text>
                    <Text
                      className={`text-[10px] text-center ${
                        isCompleted ? 'text-white/80' : 'text-neutral-400'
                      }`}
                    >
                      XP
                    </Text>
                  </View>
                </View>

                {isLocked && (
                  <Pressable
                    onPress={() => router.push('/subscription' as any)}
                    className="mt-3 py-2 bg-amber-500 rounded-xl items-center"
                  >
                    <Text className="text-sm font-semibold text-white">
                      Desbloquear com PRO
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        {/* Info Card */}
        <View className="mx-4 mt-6 p-4 bg-blue-50 rounded-xl">
          <View className="flex-row items-start gap-3">
            <MaterialIcons name="info" size={20} color="#3B82F6" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-blue-800">
                Dica: Complete desafios diários
              </Text>
              <Text className="text-xs text-blue-600 mt-1">
                Desafios diários são renovados à meia-noite. Não perca a chance de
                ganhar XP extra todos os dias!
              </Text>
            </View>
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
