import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function HostInboxScreen() {
  const messages: any[] = []; // TODO: Fetch messages

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-[#F0F0F0]">
        <Text className="text-2xl font-bold text-[#222]">Inbox</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {messages.length > 0 ? (
          <View className="p-6">
            {/* Messages would go here */}
          </View>
        ) : (
          /* Empty State */
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View className="w-20 h-20 border-2 border-[#E5E5E5] rounded-2xl items-center justify-center mb-6">
              <MaterialIcons name="chat-bubble-outline" size={32} color="#B0B0B0" />
            </View>
            <Text className="text-xl font-semibold text-[#222] text-center mb-2">
              Nenhuma mensagem
            </Text>
            <Text className="text-sm text-[#717171] text-center leading-5">
              Quando jogadores entrarem em contato, as mensagens aparecerao aqui.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
