import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const GAME_CHATS = [
  {
    id: '1',
    sport: 'BeachTennis',
    title: 'Hoje 18:00',
    lastMessage: 'Pedro: Vou chegar 10 min antes!',
    time: '12:30',
    unread: 3,
    participants: 4,
  },
  {
    id: '2',
    sport: 'Padel',
    title: 'Sáb 20:00',
    lastMessage: 'Marina: Confirmado pessoal!',
    time: 'Ontem',
    unread: 0,
    participants: 4,
  },
];

const DIRECT_MESSAGES = [
  {
    id: '1',
    name: 'Lucas Mendes',
    lastMessage: 'E aí, bora jogar quinta?',
    time: '10:45',
    unread: 1,
    online: true,
  },
  {
    id: '2',
    name: 'Ana Costa',
    lastMessage: 'Foi muito bom o jogo!',
    time: 'Seg',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Pedro Fernandes',
    lastMessage: 'Valeu pelo jogo, até a próxima!',
    time: '25/11',
    unread: 0,
    online: false,
  },
  {
    id: '4',
    name: 'Carlos Souza',
    lastMessage: 'Show! Fechado então',
    time: '20/11',
    unread: 0,
    online: false,
  },
];

export default function MensagensScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text className="text-2xl font-bold text-black">Mensagens</Text>
        <TouchableOpacity className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
          <MaterialIcons name="edit" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="mx-5 mb-4">
        <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3">
          <MaterialIcons name="search" size={20} color="#A3A3A3" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar conversas..."
            placeholderTextColor="#A3A3A3"
            className="flex-1 ml-2 text-black"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Game Chats */}
        <Text className="px-5 text-xs text-neutral-400 uppercase tracking-wide mb-3">Jogos</Text>
        {GAME_CHATS.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            className="mx-5 mb-2 p-4 bg-white border border-neutral-100 rounded-2xl"
            onPress={() => router.push(`/chat/${chat.id}` as any)}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-black rounded-xl items-center justify-center mr-3 relative">
                <MaterialIcons name="sports-tennis" size={20} color="#fff" />
                {chat.participants > 0 && (
                  <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">{chat.participants}</Text>
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className="font-bold text-black">{chat.sport} · {chat.title}</Text>
                <Text className="text-neutral-500 text-sm" numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-neutral-400 text-sm mb-1">{chat.time}</Text>
                {chat.unread > 0 && (
                  <View className="w-5 h-5 bg-black rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">{chat.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Direct Messages */}
        <Text className="px-5 text-xs text-neutral-400 uppercase tracking-wide mt-6 mb-3">
          Mensagens Diretas
        </Text>
        {DIRECT_MESSAGES.map((dm) => (
          <TouchableOpacity
            key={dm.id}
            className="mx-5 mb-2 p-4 bg-white border border-neutral-100 rounded-2xl"
            onPress={() => router.push(`/chat/${dm.id}` as any)}
          >
            <View className="flex-row items-center">
              <View className="relative mr-3">
                <View className="w-12 h-12 bg-neutral-200 rounded-full items-center justify-center">
                  <MaterialIcons name="person" size={24} color="#737373" />
                </View>
                {dm.online && (
                  <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-bold text-black">{dm.name}</Text>
                <Text className="text-neutral-500 text-sm" numberOfLines={1}>
                  {dm.lastMessage}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-neutral-400 text-sm mb-1">{dm.time}</Text>
                {dm.unread > 0 && (
                  <View className="w-5 h-5 bg-black rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">{dm.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
