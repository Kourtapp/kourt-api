// components/home/AchievementsSection.tsx
import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  isNew: boolean;
  isLocked: boolean;
}

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export function AchievementsSection({
  achievements,
}: AchievementsSectionProps) {
  return (
    <View className="mt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mb-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="emoji-events" size={20} color="#000" />
          <Text className="text-black font-bold text-lg">
            Conquistas Recentes
          </Text>
        </View>
        <Pressable onPress={() => router.push('/achievements')}>
          <Text className="text-neutral-500">Ver todas</Text>
        </Pressable>
      </View>

      {/* Achievements Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </ScrollView>
    </View>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Pressable
      onPress={() => !achievement.isLocked && router.push('/achievements')}
      className="w-[100px] items-center"
    >
      {/* Badge Container */}
      <View className="relative mb-2">
        {/* New Badge */}
        {achievement.isNew && (
          <View className="absolute -top-2 -right-2 z-10 bg-red-500 px-2 py-0.5 rounded-full">
            <Text className="text-white text-[10px] font-bold">NOVO</Text>
          </View>
        )}

        {/* Icon */}
        <View
          className={`w-20 h-20 rounded-2xl items-center justify-center ${
            achievement.isLocked ? 'bg-neutral-200' : ''
          }`}
          style={
            !achievement.isLocked
              ? { backgroundColor: achievement.bgColor }
              : undefined
          }
        >
          {achievement.isLocked ? (
            <MaterialIcons name="lock" size={32} color="#A3A3A3" />
          ) : (
            <Text className="text-3xl">{achievement.icon}</Text>
          )}
        </View>
      </View>

      {/* Title */}
      <Text
        className={`text-sm font-semibold text-center ${
          achievement.isLocked ? 'text-neutral-400' : 'text-black'
        }`}
        numberOfLines={1}
      >
        {achievement.isLocked ? '???' : achievement.title}
      </Text>

      {/* Description */}
      <Text className="text-xs text-neutral-500 text-center" numberOfLines={1}>
        {achievement.isLocked ? 'Em breve' : achievement.description}
      </Text>
    </Pressable>
  );
}
