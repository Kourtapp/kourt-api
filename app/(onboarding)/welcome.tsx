import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="w-10" />
        <View className="flex-row gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === 0 ? 'w-6 bg-black' : 'w-2 bg-neutral-200'
              }`}
            />
          ))}
        </View>
        <Pressable onPress={handleSkip}>
          <Text className="text-sm text-neutral-500">Pular</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1 px-5 justify-center items-center">
        {/* Illustration */}
        <View className="w-32 h-32 bg-neutral-100 rounded-full items-center justify-center mb-8">
          <View className="flex-row gap-3">
            <MaterialIcons name="sports-tennis" size={28} color="#000" />
            <MaterialIcons name="sports-soccer" size={28} color="#000" />
          </View>
          <View className="flex-row gap-3 mt-2">
            <MaterialIcons name="sports-basketball" size={28} color="#000" />
            <MaterialIcons name="sports-volleyball" size={28} color="#000" />
          </View>
        </View>

        <Text className="text-3xl font-black text-black text-center mb-4">
          Bem-vindo ao Kourt!
        </Text>
        <Text className="text-base text-neutral-500 text-center leading-6 px-4">
          Encontre quadras, organize partidas e conecte-se com jogadores da sua
          região.
        </Text>
      </View>

      {/* Footer */}
      <View className="px-5 pb-8">
        <Pressable
          onPress={() => router.push('/sports')}
          className="w-full py-4 bg-[#1a2634] rounded-2xl flex-row items-center justify-center gap-2"
        >
          <Text className="text-white font-semibold text-[15px]">Começar</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
