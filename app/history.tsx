import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserMatches } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const { matches, loading } = useUserMatches(user?.id);

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Atividades</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {matches.length === 0 ? (
            <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
              <MaterialIcons name="event" size={48} color="#A3A3A3" />
              <Text className="text-lg font-semibold text-neutral-700 mt-4">Nenhuma atividade</Text>
              <Text className="text-sm text-neutral-500 text-center mt-2">
                Suas partidas e atividades aparecerao aqui
              </Text>
            </View>
          ) : (
            matches.map((match: any) => (
              <Pressable
                key={match.id}
                onPress={() => router.push(`/match/${match.id}` as any)}
                className="bg-white rounded-2xl border border-neutral-200 p-4 mb-3"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-black">{match.title || match.sport}</Text>
                    <Text className="text-sm text-neutral-500 mt-1">
                      {new Date(match.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${match.status === 'completed' ? 'bg-lime-100' : 'bg-neutral-100'}`}>
                    <Text className={`text-xs font-medium ${match.status === 'completed' ? 'text-lime-800' : 'text-neutral-600'}`}>
                      {match.status === 'completed' ? 'Concluida' : match.status}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
