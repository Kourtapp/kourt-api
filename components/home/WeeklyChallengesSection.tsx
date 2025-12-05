// components/home/WeeklyChallengesSection.tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBgColor: string;
  xpReward: number;
  progress: number;
  total: number;
  isCompleted: boolean;
}

interface WeeklyChallengesSectionProps {
  challenges: Challenge[];
}

export function WeeklyChallengesSection({
  challenges,
}: WeeklyChallengesSectionProps) {
  return (
    <View className="mt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mb-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="flag" size={20} color="#000" />
          <Text className="text-black font-bold text-lg">
            Desafios da Semana
          </Text>
        </View>
        <Pressable onPress={() => router.push('/achievements')}>
          <Text className="text-neutral-500">Ver todos</Text>
        </Pressable>
      </View>

      {/* Challenges Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </ScrollView>
    </View>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progressPercent = (challenge.progress / challenge.total) * 100;

  return (
    <Pressable
      onPress={() => router.push('/achievements')}
      className="w-[200px] bg-white border border-neutral-200 rounded-2xl p-4"
    >
      {/* Icon and XP */}
      <View className="flex-row items-start justify-between mb-3">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: challenge.iconBgColor }}
        >
          <Text className="text-2xl">{challenge.icon}</Text>
        </View>
        <View className="bg-lime-100 px-2 py-1 rounded-full">
          <Text className="text-lime-700 font-bold text-xs">
            +{challenge.xpReward} XP
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text className="text-black font-bold text-base mb-1">
        {challenge.title}
      </Text>
      <Text className="text-neutral-500 text-sm mb-3" numberOfLines={1}>
        {challenge.description}
      </Text>

      {/* Progress */}
      <View className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-2">
        <View
          className={`h-full rounded-full ${
            challenge.isCompleted ? 'bg-lime-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      {/* Progress Text */}
      {challenge.isCompleted ? (
        <View className="flex-row items-center gap-1">
          <MaterialIcons name="check-circle" size={14} color="#22c55e" />
          <Text className="text-lime-600 font-medium text-sm">Completado!</Text>
        </View>
      ) : (
        <Text className="text-neutral-500 text-sm">
          {challenge.progress}/{challenge.total} partidas
        </Text>
      )}
    </Pressable>
  );
}
