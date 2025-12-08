import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PremiumScreen() {
  // Redireciona para subscription
  router.replace('/subscription' as any);

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-1 items-center justify-center">
        <Text className="text-neutral-500">Redirecionando...</Text>
      </View>
    </SafeAreaView>
  );
}
