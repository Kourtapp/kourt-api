import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  xpReward: number;
  progress?: { current: number; total: number };
  completed?: boolean;
  isPro?: boolean;
}

export default function ChallengesScreen() {
  const monthlyChallenge = {
    name: 'Dezembro em Chamas',
    description: 'Jogue 15 partidas em dezembro e ganhe um badge exclusivo!',
    progress: { current: 9, total: 15 },
    daysLeft: 12,
  };

  const activeChallenges: Challenge[] = [
    {
      id: '1',
      name: 'Maratonista',
      description: 'Jogue 5 partidas em uma semana',
      icon: 'directions-run',
      iconBgColor: '#DBEAFE',
      iconColor: '#3B82F6',
      xpReward: 100,
      progress: { current: 3, total: 5 },
    },
    {
      id: '2',
      name: 'Early Bird',
      description: '3 partidas antes das 9h',
      icon: 'wb-sunny',
      iconBgColor: '#FEF3C7',
      iconColor: '#F59E0B',
      xpReward: 150,
      progress: { current: 2, total: 3 },
    },
    {
      id: '3',
      name: 'Primeira Vitória',
      description: 'Vença uma partida',
      icon: 'check',
      iconBgColor: '#DCFCE7',
      iconColor: '#22C55E',
      xpReward: 50,
      completed: true,
    },
  ];

  const availableChallenges: Challenge[] = [
    {
      id: '4',
      name: 'Social Butterfly',
      description: 'Jogue com 10 pessoas diferentes',
      icon: 'groups',
      iconBgColor: '#F3E8FF',
      iconColor: '#A855F7',
      xpReward: 200,
    },
    {
      id: '5',
      name: 'Em Chamas',
      description: '5 vitórias seguidas',
      icon: 'local-fire-department',
      iconBgColor: '#FEE2E2',
      iconColor: '#EF4444',
      xpReward: 500,
    },
    {
      id: '6',
      name: 'Campeonato Regional',
      description: 'Ganhe o torneio do mês',
      icon: 'military-tech',
      iconBgColor: '#FEF3C7',
      iconColor: '#F59E0B',
      xpReward: 1000,
      isPro: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-4">
        <Text className="text-2xl font-bold text-black">Desafios</Text>
        <Text className="text-neutral-500">Complete desafios e ganhe recompensas</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Monthly Challenge */}
        <View className="mx-5 mb-6 bg-black rounded-2xl p-5">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center">
                <MaterialIcons name="local-fire-department" size={24} color="#fff" />
              </View>
              <View>
                <Text className="text-white/60 text-xs uppercase tracking-wider">DESAFIO DO MÊS</Text>
                <Text className="text-white text-xl font-bold">{monthlyChallenge.name}</Text>
              </View>
            </View>
            <View className="bg-green-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">ATIVO</Text>
            </View>
          </View>

          <Text className="text-white/80 mb-4">{monthlyChallenge.description}</Text>

          <View className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
            <View
              className="h-full bg-white rounded-full"
              style={{
                width: `${(monthlyChallenge.progress.current / monthlyChallenge.progress.total) * 100}%`,
              }}
            />
          </View>

          <View className="flex-row justify-between">
            <Text className="text-white/60">
              {monthlyChallenge.progress.current}/{monthlyChallenge.progress.total} partidas
            </Text>
            <Text className="text-white/60">Faltam {monthlyChallenge.daysLeft} dias</Text>
          </View>
        </View>

        {/* Active Challenges */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-black mb-4">Seus Desafios</Text>
          <View className="gap-3">
            {activeChallenges.map((challenge) => (
              <View
                key={challenge.id}
                className={`p-4 rounded-2xl border ${
                  challenge.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: challenge.completed ? '#DCFCE7' : challenge.iconBgColor }}
                  >
                    <MaterialIcons
                      name={challenge.completed ? 'check' : (challenge.icon as any)}
                      size={24}
                      color={challenge.completed ? '#22C55E' : challenge.iconColor}
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-bold text-black">{challenge.name}</Text>
                    <Text className="text-neutral-500 text-sm">
                      {challenge.completed ? 'Completado!' : challenge.description}
                    </Text>
                  </View>
                  {challenge.progress && !challenge.completed && (
                    <Text className="font-bold text-black">
                      {challenge.progress.current}/{challenge.progress.total}
                    </Text>
                  )}
                  {challenge.completed && (
                    <MaterialIcons name="emoji-events" size={24} color="#22C55E" />
                  )}
                </View>

                {challenge.progress && !challenge.completed && (
                  <View className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${(challenge.progress.current / challenge.progress.total) * 100}%`,
                        backgroundColor: challenge.iconColor,
                      }}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Available Challenges */}
        <View className="px-5 mb-8">
          <Text className="text-lg font-bold text-black mb-4">Disponíveis</Text>
          <View className="gap-3">
            {availableChallenges.map((challenge) => (
              <View
                key={challenge.id}
                className={`p-4 rounded-2xl border ${
                  challenge.isPro ? 'bg-amber-50 border-amber-200' : 'bg-white border-neutral-200'
                }`}
              >
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: challenge.iconBgColor }}
                  >
                    <MaterialIcons name={challenge.icon as any} size={24} color={challenge.iconColor} />
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-bold text-black">{challenge.name}</Text>
                      {challenge.isPro && (
                        <View className="bg-black px-2 py-0.5 rounded">
                          <Text className="text-white text-xs font-bold">PRO</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-neutral-500 text-sm">{challenge.description}</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="star" size={16} color="#F59E0B" />
                    <Text className="text-amber-600 font-medium">+{challenge.xpReward} XP</Text>
                    {challenge.isPro && (
                      <Text className="text-amber-600 font-medium"> + Badge</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-full ${
                      challenge.isPro ? 'bg-black' : 'bg-black'
                    }`}
                  >
                    <Text className="text-white font-semibold">
                      {challenge.isPro ? 'Upgrade' : 'Participar'}
                    </Text>
                  </TouchableOpacity>
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
