import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function SecurityScreen() {
  const { user, profile } = useAuthStore();

  const emailVerified = profile?.email_verified ?? true;
  const phoneVerified = profile?.phone_verified ?? false;
  const isFullyVerified = emailVerified && phoneVerified;

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Segurança</Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View
          className={`rounded-2xl p-5 mb-6 ${
            isFullyVerified ? 'bg-lime-500' : 'bg-amber-500'
          }`}
        >
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <MaterialIcons
                name={isFullyVerified ? 'verified-user' : 'warning'}
                size={24}
                color={isFullyVerified ? '#1a2e05' : '#78350f'}
              />
            </View>
            <View>
              <Text
                className={`text-xs ${isFullyVerified ? 'text-lime-900/60' : 'text-amber-900/60'}`}
              >
                {isFullyVerified ? 'CONTA VERIFICADA' : 'VERIFICAÇÃO PENDENTE'}
              </Text>
              <Text
                className={`text-2xl font-bold ${isFullyVerified ? 'text-lime-950' : 'text-amber-950'}`}
              >
                {isFullyVerified ? 'Tudo certo!' : 'Quase lá!'}
              </Text>
            </View>
          </View>
          <Text
            className={`text-sm ${isFullyVerified ? 'text-lime-900/80' : 'text-amber-900/80'}`}
          >
            {isFullyVerified
              ? 'Email e telefone verificados. Sua conta está protegida.'
              : 'Verifique seu telefone para completar a segurança.'}
          </Text>
        </View>

        {/* Verificações */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Verificações
        </Text>

        <View className="bg-white rounded-2xl border border-neutral-200 mb-6">
          {/* Email */}
          <View className="p-4 flex-row items-center border-b border-neutral-100">
            <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="email" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Email</Text>
              <Text className="text-sm text-neutral-500">{user?.email}</Text>
            </View>
            {emailVerified ? (
              <View className="flex-row items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                <MaterialIcons name="check-circle" size={14} color="#16a34a" />
                <Text className="text-xs text-green-700 font-medium">
                  Verificado
                </Text>
              </View>
            ) : (
              <Pressable className="px-3 py-1.5 bg-black rounded-full">
                <Text className="text-xs text-white font-medium">
                  Verificar
                </Text>
              </Pressable>
            )}
          </View>

          {/* Telefone */}
          <Pressable
            onPress={() =>
              !phoneVerified && router.push('/security/verify-phone' as any)
            }
            className="p-4 flex-row items-center"
          >
            <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="phone" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Telefone</Text>
              <Text className="text-sm text-neutral-500">
                {profile?.phone || 'Não cadastrado'}
              </Text>
            </View>
            {phoneVerified ? (
              <View className="flex-row items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                <MaterialIcons name="check-circle" size={14} color="#16a34a" />
                <Text className="text-xs text-green-700 font-medium">
                  Verificado
                </Text>
              </View>
            ) : (
              <Pressable className="px-3 py-1.5 bg-black rounded-full">
                <Text className="text-xs text-white font-medium">
                  Verificar
                </Text>
              </Pressable>
            )}
          </Pressable>
        </View>

        {/* Proteção Adicional */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Proteção Adicional
        </Text>

        <View className="bg-white rounded-2xl border border-neutral-200 mb-6">
          <Pressable
            onPress={() => router.push('/security/two-factor' as any)}
            className="p-4 flex-row items-center"
          >
            <View className="w-10 h-10 bg-lime-100 rounded-xl items-center justify-center">
              <MaterialIcons name="security" size={20} color="#84cc16" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Autenticação 2FA</Text>
              <Text className="text-sm text-neutral-500">
                Opcional · Recomendado
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>
        </View>

        {/* Atividade */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Atividade
        </Text>

        <View className="bg-white rounded-2xl border border-neutral-200 mb-6">
          <Pressable
            onPress={() => router.push('/security/devices' as any)}
            className="p-4 flex-row items-center border-b border-neutral-100"
          >
            <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="devices" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Dispositivos</Text>
              <Text className="text-sm text-neutral-500">
                1 dispositivo ativo
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>

          <Pressable
            onPress={() => router.push('/security/activity' as any)}
            className="p-4 flex-row items-center"
          >
            <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="history" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Atividade recente</Text>
              <Text className="text-sm text-neutral-500">
                Último login: agora
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>
        </View>

        {/* Senha */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Senha
        </Text>

        <View className="bg-white rounded-2xl border border-neutral-200 mb-10">
          <Pressable
            onPress={() => router.push('/security/change-password' as any)}
            className="p-4 flex-row items-center"
          >
            <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="lock" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Alterar senha</Text>
              <Text className="text-sm text-neutral-500">
                Última alteração: nunca
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
