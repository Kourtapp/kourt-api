// app/settings/linked-accounts.tsx
import { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuthStore } from '@/stores/authStore';
import { isAppleSignInAvailable } from '@/services/socialAuth';

export default function LinkedAccountsScreen() {
  const { profile } = useAuthStore();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [loading, _setLoading] = useState<string | null>(null);

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const isLinked = (provider: string) => profile?.auth_provider === provider;

  const handleLink = async (provider: string) => {
    Alert.alert(
      'Vincular Conta',
      `Para vincular sua conta ${provider}, você precisará fazer login com ela.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            Alert.alert('Info', 'Funcionalidade em desenvolvimento');
          },
        },
      ],
    );
  };

  const _handleUnlink = async (provider: string) => {
    Alert.alert(
      'Desvincular Conta',
      `Tem certeza que deseja desvincular sua conta ${provider}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Funcionalidade em desenvolvimento');
          },
        },
      ],
    );
  };

  const providers = [
    {
      id: 'email',
      name: 'Email e Senha',
      icon: 'email' as const,
      available: true,
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: 'apple' as const,
      available: appleAvailable,
    },
    {
      id: 'google',
      name: 'Google',
      icon: 'g-mobiledata' as const,
      available: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-5 py-4 flex-row items-center gap-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Contas Vinculadas</Text>
      </View>

      <View className="flex-1 px-5 pt-5">
        <Text className="text-sm text-neutral-500 mb-4">
          Gerencie as formas de login da sua conta.
        </Text>

        <View className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          {providers.map((provider, index) => {
            if (!provider.available) return null;

            const linked = isLinked(provider.id);

            return (
              <View
                key={provider.id}
                className={`flex-row items-center p-4 ${
                  index < providers.length - 1
                    ? 'border-b border-neutral-100'
                    : ''
                }`}
              >
                <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
                  <MaterialIcons
                    name={provider.icon}
                    size={20}
                    color="#525252"
                  />
                </View>

                <View className="flex-1 ml-3">
                  <Text className="font-medium text-black">
                    {provider.name}
                  </Text>
                  <Text className="text-sm text-neutral-500">
                    {linked ? 'Vinculado' : 'Não vinculado'}
                  </Text>
                </View>

                {loading === provider.id ? (
                  <ActivityIndicator size="small" />
                ) : linked ? (
                  <View className="flex-row items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                    <MaterialIcons name="check" size={14} color="#16a34a" />
                    <Text className="text-xs text-green-700 font-medium">
                      Ativo
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleLink(provider.id)}
                    className="px-4 py-2 bg-neutral-100 rounded-full"
                  >
                    <Text className="text-sm font-medium text-black">
                      Vincular
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        {/* Info */}
        <View className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <View className="flex-row items-start gap-2">
            <MaterialIcons name="info" size={18} color="#2563eb" />
            <Text className="flex-1 text-sm text-blue-800">
              Você pode vincular múltiplas contas para ter mais opções de login.
              Sua conta principal será sempre a usada para criar o perfil.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
