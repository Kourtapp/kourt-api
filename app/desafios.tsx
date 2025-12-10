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

const MY_CHALLENGES = [
  {
    id: '1',
    name: 'Maratonista',
    description: 'Jogue 5 partidas em uma semana',
    progress: 3,
    total: 5,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    icon: 'directions-run',
  },
  {
    id: '2',
    name: 'Early Bird',
    description: '3 partidas antes das 9h',
    progress: 2,
    total: 3,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'wb-sunny',
  },
  {
    id: '3',
    name: 'Primeira Vitória',
    description: 'Completado!',
    progress: 1,
    total: 1,
    completed: true,
    color: '#22C55E',
    bgColor: '#DCFCE7',
    icon: 'check',
  },
];

const AVAILABLE_CHALLENGES = [
  {
    id: '1',
    name: 'Social Butterfly',
    description: 'Jogue com 10 pessoas diferentes',
    xp: 200,
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    icon: 'groups',
  },
  {
    id: '2',
    name: 'Em Chamas',
    description: '5 vitórias seguidas',
    xp: 500,
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: 'local-fire-department',
  },
  {
    id: '3',
    name: 'Campeonato Regional',
    description: 'Ganhe o torneio do mês',
    xp: 1000,
    badge: true,
    isPro: true,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'emoji-events',
  },
];

export default function DesafiosScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-4">
        <Text className="text-2xl font-bold text-black">Desafios</Text>
        <Text className="text-neutral-500">Complete desafios e ganhe recompensas</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Featured Challenge */}
        <View className="mx-5 mb-6">
          <View className="bg-black rounded-3xl p-5">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
                  <MaterialIcons name="local-fire-department" size={20} color="#fff" />
                </View>
                <View>
                  <Text className="text-neutral-400 text-xs uppercase">Desafio do Mês</Text>
                  <Text className="text-white font-bold text-xl">Dezembro em Chamas</Text>
                </View>
              </View>
              <View className="bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">ATIVO</Text>
              </View>
            </View>
            <Text className="text-neutral-400 mb-4">
              Jogue 15 partidas em dezembro e ganhe um badge exclusivo!
            </Text>
            <View className="mb-2">
              <View className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <View className="h-full bg-white rounded-full" style={{ width: '60%' }} />
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-neutral-400">9/15 partidas</Text>
              <Text className="text-neutral-400">Faltam 12 dias</Text>
            </View>
          </View>
        </View>

        {/* My Challenges */}
        <Text className="px-5 text-base font-bold text-black mb-3">Seus Desafios</Text>
        {MY_CHALLENGES.map((challenge) => (
          <View
            key={challenge.id}
            className={`mx-5 mb-3 p-4 rounded-2xl border ${
              challenge.completed ? 'border-green-200 bg-green-50' : 'border-neutral-100 bg-white'
            }`}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: challenge.bgColor }}
              >
                <MaterialIcons name={challenge.icon as any} size={24} color={challenge.color} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-black">{challenge.name}</Text>
                <Text className="text-neutral-500 text-sm">{challenge.description}</Text>
              </View>
              {challenge.completed ? (
                <MaterialIcons name="emoji-events" size={24} color="#22C55E" />
              ) : (
                <View className="bg-neutral-100 px-2 py-1 rounded">
                  <Text className="text-neutral-600 text-sm font-semibold">
                    {challenge.progress}/{challenge.total}
                  </Text>
                </View>
              )}
            </View>
            {!challenge.completed && (
              <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: challenge.color,
                    width: `${(challenge.progress / challenge.total) * 100}%`,
                  }}
                />
              </View>
            )}
          </View>
        ))}

        {/* Available Challenges */}
        <Text className="px-5 text-base font-bold text-black mt-6 mb-3">Disponíveis</Text>
        {AVAILABLE_CHALLENGES.map((challenge) => (
          <View
            key={challenge.id}
            className={`mx-5 mb-3 p-4 rounded-2xl border ${
              challenge.isPro ? 'border-amber-200 bg-amber-50' : 'border-neutral-100 bg-white'
            }`}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: challenge.bgColor }}
              >
                <MaterialIcons name={challenge.icon as any} size={24} color={challenge.color} />
              </View>
              <View className="flex-1">
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
                <MaterialIcons name="stars" size={16} color="#F59E0B" />
                <Text className="text-neutral-600 font-medium">
                  +{challenge.xp} XP{challenge.badge ? ' + Badge' : ''}
                </Text>
              </View>
              <TouchableOpacity className="bg-black px-5 py-2 rounded-full">
                <Text className="text-white font-semibold">
                  {challenge.isPro ? 'Upgrade' : 'Participar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
