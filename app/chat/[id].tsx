import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMatchChat, ChatMessage } from '@/hooks/useChat';
import { useMatchDetail } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';

function MessageBubble({
  message,
  isOwn,
}: {
  message: ChatMessage;
  isOwn: boolean;
}) {
  const time = new Date(message.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (message.type === 'system') {
    return (
      <View className="items-center my-2">
        <Text className="text-xs text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
          {message.content}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-row mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && (
        <View className="w-8 h-8 bg-neutral-200 rounded-full items-center justify-center mr-2">
          <Text className="text-xs font-bold text-neutral-600">
            {message.user?.name?.charAt(0) || '?'}
          </Text>
        </View>
      )}

      <View className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <Text className="text-xs text-neutral-500 mb-1 ml-1">
            {message.user?.name || 'Usuário'}
          </Text>
        )}
        <View
          className={`px-4 py-3 rounded-2xl ${
            isOwn ? 'bg-black rounded-br-sm' : 'bg-neutral-100 rounded-bl-sm'
          }`}
        >
          <Text className={isOwn ? 'text-white' : 'text-black'}>
            {message.content}
          </Text>
        </View>
        <Text className="text-xs text-neutral-400 mt-1 mx-1">{time}</Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { match, loading: matchLoading } = useMatchDetail(id);
  const { messages, loading, sendMessage } = useMatchChat(id, user?.id);

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(inputText.trim());
      setInputText('');
    } catch {
      // Error handled in hook
    } finally {
      setSending(false);
    }
  };

  if (matchLoading || loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>

        <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
          <MaterialIcons name="sports-tennis" size={20} color="#737373" />
        </View>

        <View className="flex-1 ml-3">
          <Text className="font-semibold text-black" numberOfLines={1}>
            {match?.title || 'Chat da Partida'}
          </Text>
          <Text className="text-xs text-neutral-500">
            {match?.current_players || 0} participantes
          </Text>
        </View>

        <Pressable
          onPress={() => router.push(`/match/${id}` as any)}
          className="p-2"
        >
          <MaterialIcons name="info-outline" size={24} color="#737373" />
        </Pressable>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwn={item.user_id === user?.id} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <MaterialIcons
                name="chat-bubble-outline"
                size={48}
                color="#D4D4D4"
              />
              <Text className="text-neutral-400 mt-3 text-center">
                Nenhuma mensagem ainda.{'\n'}Comece a conversa!
              </Text>
            </View>
          }
        />

        {/* Input */}
        <View className="flex-row items-end px-4 py-3 border-t border-neutral-100 bg-white">
          <View className="flex-1 flex-row items-end bg-neutral-100 rounded-2xl px-4 py-2 mr-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#A3A3A3"
              multiline
              maxLength={500}
              className="flex-1 text-black max-h-24 py-1"
              style={{ fontSize: 16 }}
            />
          </View>

          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              inputText.trim() && !sending ? 'bg-black' : 'bg-neutral-300'
            }`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>

        {/* Bottom safe area */}
        <View className="h-6 bg-white" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
