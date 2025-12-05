import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useConversations } from '@/hooks/useChat';
import { useAuthStore } from '@/stores/authStore';

interface Conversation {
  id: string;
  title: string;
  sport: string;
  date: string;
  organizer: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  lastMessage: string;
  lastMessageAt: string;
}

function ConversationItem({ conversation }: { conversation: Conversation }) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/chat/${conversation.id}`)}
      className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100"
    >
      <View className="w-12 h-12 bg-neutral-200 rounded-full items-center justify-center">
        <MaterialIcons name="sports-tennis" size={24} color="#737373" />
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-black" numberOfLines={1}>
            {conversation.title}
          </Text>
          <Text className="text-xs text-neutral-500">
            {formatTime(conversation.lastMessageAt)}
          </Text>
        </View>
        <Text className="text-sm text-neutral-500 mt-0.5" numberOfLines={1}>
          {conversation.lastMessage}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ChatListScreen() {
  const { user } = useAuthStore();
  const { conversations, loading } = useConversations(user?.id);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Mensagens</Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationItem conversation={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20 px-5">
            <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="chat-bubble-outline" size={40} color="#D4D4D4" />
            </View>
            <Text className="text-lg font-semibold text-black mb-2">
              Nenhuma conversa ainda
            </Text>
            <Text className="text-sm text-neutral-500 text-center">
              Participe de uma partida para{'\n'}conversar com outros jogadores
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)' as any)}
              className="mt-6 px-6 py-3 bg-black rounded-xl"
            >
              <Text className="text-white font-semibold">Encontrar Partidas</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}
