// components/home/ProgressCard.tsx
import { View, Text, Pressable, Animated as RNAnimated } from 'react-native';
import { router } from 'expo-router';

// Import Reanimated conditionally
let Animated: any = { View };
let FadeInDown: any = null;
let IS_REANIMATED_AVAILABLE = false;

try {
  const Reanimated = require('react-native-reanimated');
  Animated = Reanimated.default;
  FadeInDown = Reanimated.FadeInDown;
  IS_REANIMATED_AVAILABLE = true;
} catch (e) {
  console.log('[ProgressCard] Reanimated not available');
}

interface ProgressCardProps {
  xp: number;
  xpToNextLevel: number;
  level: number;
  totalMatches: number;
  winRate: number;
  streak: number;
}

export function ProgressCard({
  xp,
  xpToNextLevel,
  level,
  totalMatches,
  winRate,
  streak,
}: ProgressCardProps) {
  const xpProgress = (xp / xpToNextLevel) * 100;
  const xpRemaining = xpToNextLevel - xp;

  // Use static View when reanimated is not available
  const enteringAnimation = IS_REANIMATED_AVAILABLE && FadeInDown
    ? FadeInDown.delay(200).duration(400)
    : undefined;

  return (
    <Animated.View entering={enteringAnimation}>
      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        className="mx-5 bg-black rounded-3xl p-5 overflow-hidden"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl">🏆</Text>
            <Text className="text-white font-bold text-lg">Seu Progresso</Text>
          </View>
          <View className="bg-amber-400 px-3 py-1 rounded-full">
            <Text className="text-black font-bold text-sm">NÍVEL {level}</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white font-semibold">
              {xp.toLocaleString()} XP
            </Text>
            <Text className="text-white/60">
              {xpToNextLevel.toLocaleString()} XP
            </Text>
          </View>
          <View className="h-3 bg-white/20 rounded-full overflow-hidden">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </View>
          <Text className="text-white/60 text-sm mt-1">
            {xpRemaining} XP para o próximo nível
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3">
          {/* Partidas */}
          <View className="flex-1 bg-white/10 rounded-2xl p-4 items-center">
            <Text className="text-white text-2xl font-bold">
              {totalMatches}
            </Text>
            <Text className="text-white/60 text-sm">Partidas</Text>
          </View>

          {/* Taxa de Vitória */}
          <View className="flex-1 bg-white/10 rounded-2xl p-4 items-center">
            <Text className="text-white text-2xl font-bold">{winRate}%</Text>
            <Text className="text-white/60 text-sm">Vitórias</Text>
          </View>

          {/* Sequência */}
          <View className="flex-1 bg-white/10 rounded-2xl p-4 items-center">
            <Text className="text-white text-2xl font-bold">{streak}</Text>
            <Text className="text-white/60 text-sm">Sequência</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
