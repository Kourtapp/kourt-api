import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function StatisticsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Estatisticas</Text>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
          <MaterialIcons name="bar-chart" size={48} color="#A3A3A3" />
          <Text className="text-lg font-semibold text-neutral-700 mt-4">Em breve</Text>
          <Text className="text-sm text-neutral-500 text-center mt-2">
            Estatisticas detalhadas das suas partidas estarao disponiveis em breve
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
