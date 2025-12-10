import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PrivacySettingsScreen() {
  const [showProfile, setShowProfile] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

  const privacyOptions = [
    {
      id: 'profile',
      title: 'Perfil público',
      description: 'Outros jogadores podem ver seu perfil',
      value: showProfile,
      onChange: setShowProfile,
    },
    {
      id: 'stats',
      title: 'Estatísticas públicas',
      description: 'Mostrar suas estatísticas no perfil',
      value: showStats,
      onChange: setShowStats,
    },
    {
      id: 'activity',
      title: 'Atividade visível',
      description: 'Mostrar suas partidas recentes',
      value: showActivity,
      onChange: setShowActivity,
    },
    {
      id: 'messages',
      title: 'Receber mensagens',
      description: 'Permitir mensagens de outros jogadores',
      value: allowMessages,
      onChange: setAllowMessages,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black ml-4">Privacidade</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            VISIBILIDADE
          </Text>
          <View className="bg-white rounded-2xl border border-neutral-200">
            {privacyOptions.map((option, index) => (
              <View
                key={option.id}
                className={`flex-row items-center p-4 ${
                  index > 0 ? 'border-t border-neutral-100' : ''
                }`}
              >
                <View className="flex-1">
                  <Text className="font-medium text-black">{option.title}</Text>
                  <Text className="text-sm text-neutral-500">{option.description}</Text>
                </View>
                <Switch
                  value={option.value}
                  onValueChange={option.onChange}
                  trackColor={{ false: '#E5E5E5', true: '#22C55E' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        <View className="px-5 py-4">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            DADOS
          </Text>
          <View className="bg-white rounded-2xl border border-neutral-200">
            <TouchableOpacity className="flex-row items-center p-4">
              <MaterialIcons name="download" size={24} color="#525252" />
              <Text className="flex-1 ml-3 font-medium text-black">Baixar meus dados</Text>
              <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-4 border-t border-neutral-100">
              <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
              <Text className="flex-1 ml-3 font-medium text-red-500">Excluir conta</Text>
              <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
