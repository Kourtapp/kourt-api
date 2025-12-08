import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TwoFactorScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Autenticação 2FA</Text>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
          <View className="w-16 h-16 bg-lime-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="security" size={32} color="#84cc16" />
          </View>
          <Text className="text-lg font-semibold text-neutral-700 mt-2">Em breve</Text>
          <Text className="text-sm text-neutral-500 text-center mt-2">
            A autenticação de dois fatores estará disponível em breve para maior segurança da sua conta.
          </Text>
        </View>

        <View className="mt-6 bg-white rounded-2xl border border-neutral-200 p-4">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">O que é 2FA?</Text>
          <Text className="text-sm text-neutral-500">
            A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta. Além da senha, você precisará confirmar sua identidade usando um código gerado por um aplicativo autenticador.
          </Text>
        </View>

        <View className="mt-4 bg-white rounded-2xl border border-neutral-200 p-4">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Benefícios</Text>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="check-circle" size={20} color="#22c55e" />
              <Text className="text-sm text-neutral-600">Proteção contra acessos não autorizados</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="check-circle" size={20} color="#22c55e" />
              <Text className="text-sm text-neutral-600">Segurança mesmo se sua senha vazar</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="check-circle" size={20} color="#22c55e" />
              <Text className="text-sm text-neutral-600">Notificação de tentativas de login</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
