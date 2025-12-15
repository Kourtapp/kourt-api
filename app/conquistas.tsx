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

const ACHIEVEMENTS = [
  { id: 'estreante', icon: 'sports-tennis', label: 'Estreante', color: '#22C55E', bgColor: '#DCFCE7', unlocked: true },
  { id: 'madrugador', icon: 'schedule', label: 'Madrugador', color: '#3B82F6', bgColor: '#DBEAFE', unlocked: true },
  { id: '5estrelas', icon: 'star', label: '5 Estrelas', color: '#F59E0B', bgColor: '#FEF3C7', unlocked: true },
  { id: 'veloz', icon: 'bolt', label: 'Veloz', color: '#8B5CF6', bgColor: '#EDE9FE', unlocked: true },
  { id: 'emchamas', icon: 'local-fire-department', label: 'Em Chamas', color: '#EF4444', bgColor: '#FEE2E2', unlocked: true },
  { id: 'social', icon: 'groups', label: 'Social', color: '#06B6D4', bgColor: '#CFFAFE', unlocked: true },
  { id: 'locked1', icon: 'lock', label: '???', color: '#D4D4D4', bgColor: '#F5F5F5', unlocked: false },
  { id: 'locked2', icon: 'lock', label: '???', color: '#D4D4D4', bgColor: '#F5F5F5', unlocked: false },
];

const RECENT_ACHIEVEMENTS = [
  {
    id: '1',
    name: 'Sequência de Vitórias',
    description: '10 vitórias consecutivas',
    unlockedAt: 'Desbloqueada há 2 dias',
    rarity: 'LENDÁRIA',
    gradient: ['#8B5CF6', '#EC4899'],
    icon: 'local-fire-department',
  },
  {
    id: '2',
    name: 'Networker',
    description: 'Jogou com 50 pessoas diferentes',
    unlockedAt: 'Desbloqueada há 1 semana',
    rarity: 'RARA',
    borderColor: '#F59E0B',
    bgColor: '#FEF3C7',
    iconBg: '#FDE68A',
    icon: 'groups',
  },
  {
    id: '3',
    name: 'Primeira Vitória',
    description: 'Venceu sua primeira partida',
    unlockedAt: 'Desbloqueada em Jan 2023',
    rarity: 'COMUM',
    borderColor: '#E5E5E5',
    bgColor: '#F5F5F5',
    iconBg: '#DCFCE7',
    icon: 'emoji-events',
  },
];

const IN_PROGRESS = [
  { id: '1', name: 'Centurião', description: 'Jogue 100 partidas', progress: 89, total: 100, icon: 'military-tech' },
  { id: '2', name: 'Explorador', description: 'Jogue em 30 quadras diferentes', progress: 23, total: 30, icon: 'explore' },
  { id: '3', name: 'Campeão Regional', description: 'Alcance o Top 10 do ranking', progress: 47, total: 10, isRanking: true, rarity: 'RARA', icon: 'emoji-events' },
];

export default function ConquistasScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black ml-4">Conquistas</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View className="mx-5 mb-6 bg-black rounded-3xl p-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-semibold">Seu progresso</Text>
            <Text className="text-white">Nível 12</Text>
          </View>
          <View className="flex-row items-center gap-3 mb-2">
            <View className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
              <View className="h-full bg-white rounded-full" style={{ width: '65%' }} />
            </View>
            <Text className="text-white font-semibold">65%</Text>
          </View>
          <Text className="text-neutral-400 text-sm">1.250 / 2.000 XP para o próximo nível</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row mx-5 gap-3 mb-6">
          <View className="flex-1 bg-neutral-50 rounded-2xl p-4 items-center">
            <Text className="text-2xl font-bold text-black">24</Text>
            <Text className="text-neutral-500 text-sm">Conquistas</Text>
          </View>
          <View className="flex-1 bg-neutral-50 rounded-2xl p-4 items-center">
            <Text className="text-2xl font-bold text-orange-500">8</Text>
            <Text className="text-neutral-500 text-sm">Raras</Text>
          </View>
          <View className="flex-1 bg-neutral-50 rounded-2xl p-4 items-center">
            <Text className="text-2xl font-bold text-purple-500">2</Text>
            <Text className="text-neutral-500 text-sm">Lendárias</Text>
          </View>
        </View>

        {/* Recent Achievements */}
        <Text className="px-5 text-xs text-neutral-400 uppercase tracking-wide mb-3">Recentes</Text>

        {RECENT_ACHIEVEMENTS.map((achievement) => (
          <TouchableOpacity
            key={achievement.id}
            className="mx-5 mb-3 rounded-2xl overflow-hidden"
          >
            {achievement.gradient ? (
              <LinearGradient
                colors={achievement.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' }}
              >
                <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4">
                  <MaterialIcons name={achievement.icon as any} size={32} color="#fff" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-white font-bold text-lg">{achievement.name}</Text>
                    <View className="bg-white/20 px-2 py-0.5 rounded">
                      <Text className="text-white text-xs font-semibold">{achievement.rarity}</Text>
                    </View>
                  </View>
                  <Text className="text-white/80 mb-1">{achievement.description}</Text>
                  <Text className="text-white/60 text-sm">{achievement.unlockedAt}</Text>
                </View>
              </LinearGradient>
            ) : (
              <View
                className="p-4 flex-row items-center border-2 rounded-2xl"
                style={{
                  backgroundColor: achievement.bgColor,
                  borderColor: achievement.borderColor,
                }}
              >
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: achievement.iconBg }}
                >
                  <MaterialIcons name={achievement.icon as any} size={32} color="#22C55E" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-black font-bold text-lg">{achievement.name}</Text>
                    <View className="bg-neutral-200 px-2 py-0.5 rounded">
                      <Text className="text-neutral-600 text-xs font-semibold">{achievement.rarity}</Text>
                    </View>
                  </View>
                  <Text className="text-neutral-600 mb-1">{achievement.description}</Text>
                  <Text className="text-neutral-400 text-sm">{achievement.unlockedAt}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* All Achievements Grid */}
        <Text className="px-5 text-xs text-neutral-400 uppercase tracking-wide mt-6 mb-3">
          Todas as Conquistas
        </Text>
        <View className="flex-row flex-wrap px-5 gap-3 mb-6">
          {ACHIEVEMENTS.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              className="items-center"
              style={{ width: '22%' }}
            >
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                style={{ backgroundColor: achievement.bgColor }}
              >
                <MaterialIcons
                  name={achievement.icon as any}
                  size={28}
                  color={achievement.color}
                />
              </View>
              <Text className={`text-xs text-center ${achievement.unlocked ? 'text-black' : 'text-neutral-400'}`}>
                {achievement.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* In Progress */}
        <Text className="px-5 text-xs text-neutral-400 uppercase tracking-wide mb-3">Em Progresso</Text>
        {IN_PROGRESS.map((item) => (
          <View
            key={item.id}
            className={`mx-5 mb-3 p-4 rounded-2xl border ${
              item.rarity === 'RARA' ? 'border-orange-200 bg-orange-50' : 'border-neutral-100 bg-neutral-50'
            }`}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mr-3">
                <MaterialIcons name={item.icon as any} size={24} color="#737373" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold text-black">{item.name}</Text>
                  {item.rarity && (
                    <View className="bg-orange-100 px-2 py-0.5 rounded">
                      <Text className="text-orange-600 text-xs font-semibold">{item.rarity}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-neutral-500 text-sm">{item.description}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${item.rarity === 'RARA' ? 'bg-orange-400' : 'bg-black'}`}
                  style={{ width: `${(item.progress / item.total) * 100}%` }}
                />
              </View>
              <Text className="text-neutral-500 font-medium">
                {item.isRanking ? `#${item.progress}` : `${item.progress}/${item.total}`}
              </Text>
            </View>
          </View>
        ))}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
