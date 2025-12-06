import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/stores/authStore';

type PlanType = 'monthly' | 'yearly';

const plans = {
  monthly: {
    price: 29.90,
    period: 'mês',
    savings: null,
  },
  yearly: {
    price: 239.90,
    period: 'ano',
    savings: '33%',
    monthlyEquivalent: 19.99,
  },
};

const features = [
  {
    icon: 'emoji-events',
    title: 'Criar Torneios',
    description: 'Organize torneios com chaves automáticas',
    free: false,
  },
  {
    icon: 'business',
    title: 'Cadastrar Arena',
    description: 'Registre sua arena e receba reservas',
    free: false,
  },
  {
    icon: 'analytics',
    title: 'Estatísticas Avançadas',
    description: 'Métricas detalhadas do seu desempenho',
    free: false,
  },
  {
    icon: 'star',
    title: 'Badge PRO',
    description: 'Destaque seu perfil na comunidade',
    free: false,
  },
  {
    icon: 'bolt',
    title: 'Desafios Exclusivos',
    description: 'Acesso a desafios com mais XP',
    free: false,
  },
  {
    icon: 'support-agent',
    title: 'Suporte Prioritário',
    description: 'Atendimento rápido e dedicado',
    free: false,
  },
  {
    icon: 'sports-tennis',
    title: 'Criar Partidas',
    description: 'Organize partidas com amigos',
    free: true,
  },
  {
    icon: 'search',
    title: 'Buscar Quadras',
    description: 'Encontre quadras perto de você',
    free: true,
  },
  {
    icon: 'people',
    title: 'Comunidade',
    description: 'Conecte-se com outros jogadores',
    free: true,
  },
];

export default function SubscriptionScreen() {
  const { profile } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [loading, setLoading] = useState(false);

  const isPro = profile?.subscription === 'pro';

  const handleSubscribe = async () => {
    setLoading(true);
    // Simulate subscription process
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Assinatura PRO',
        'Funcionalidade de pagamento será integrada em breve!',
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  if (isPro) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-neutral-100">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text className="flex-1 text-lg font-bold text-black ml-2">Assinatura</Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-amber-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="star" size={40} color="#F59E0B" />
          </View>
          <Text className="text-2xl font-bold text-black">Você é PRO!</Text>
          <Text className="text-neutral-500 text-center mt-2">
            Você já possui acesso a todos os recursos premium do Kourt.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 px-8 py-3 bg-black rounded-xl"
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-black ml-2">Seja PRO</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={['#171717', '#262626', '#404040']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-4 mt-4 p-6 rounded-3xl border border-neutral-800"
        >
          <View className="items-center">
            <View className="w-16 h-16 bg-amber-500/20 rounded-2xl items-center justify-center mb-3 border border-amber-500/30">
              <MaterialIcons name="star" size={36} color="#F59E0B" />
            </View>
            <Text className="text-2xl font-bold text-white">Kourt PRO</Text>
            <Text className="text-white/80 text-center mt-2">
              Desbloqueie todo o potencial do app e leve seu jogo para o próximo nível
            </Text>
          </View>
        </LinearGradient>

        {/* Plan Selection */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-black mb-4">Escolha seu plano</Text>

          <View className="flex-row gap-3">
            {/* Monthly */}
            <Pressable
              onPress={() => setSelectedPlan('monthly')}
              className={`flex-1 p-4 rounded-2xl border-2 ${selectedPlan === 'monthly'
                ? 'border-amber-500 bg-amber-50'
                : 'border-neutral-200 bg-white'
                }`}
            >
              <Text className="text-sm font-medium text-neutral-500">Mensal</Text>
              <Text className="text-2xl font-bold text-black mt-1">
                R$ {plans.monthly.price.toFixed(2).replace('.', ',')}
              </Text>
              <Text className="text-xs text-neutral-400">por mês</Text>
            </Pressable>

            {/* Yearly */}
            <Pressable
              onPress={() => setSelectedPlan('yearly')}
              className={`flex-1 p-4 rounded-2xl border-2 relative ${selectedPlan === 'yearly'
                ? 'border-amber-500 bg-amber-50'
                : 'border-neutral-200 bg-white'
                }`}
            >
              {plans.yearly.savings && (
                <View className="absolute -top-3 -right-2 px-3 py-1 bg-black rounded-full border border-amber-500 shadow-sm">
                  <Text className="text-[10px] font-bold text-amber-500">MELHOR VALOR</Text>
                </View>
              )}
              <Text className="text-sm font-medium text-neutral-500">Anual</Text>
              <Text className="text-2xl font-bold text-black mt-1">
                R$ {plans.yearly.price.toFixed(2).replace('.', ',')}
              </Text>
              <Text className="text-xs text-neutral-400">
                R$ {plans.yearly.monthlyEquivalent?.toFixed(2).replace('.', ',')}/mês
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Features */}
        <View className="px-4 mt-8">
          <Text className="text-lg font-bold text-black mb-4">O que você ganha</Text>

          <View className="gap-3">
            {features
              .filter((f) => !f.free)
              .map((feature, index) => (
                <View
                  key={index}
                  className="flex-row items-center p-4 bg-amber-50 rounded-xl"
                >
                  <View className="w-10 h-10 bg-amber-100 rounded-xl items-center justify-center">
                    <MaterialIcons name={feature.icon as any} size={22} color="#F59E0B" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-black">{feature.title}</Text>
                    <Text className="text-sm text-neutral-500">{feature.description}</Text>
                  </View>
                  <MaterialIcons name="check-circle" size={22} color="#22C55E" />
                </View>
              ))}
          </View>
        </View>

        {/* Free Features */}
        <View className="px-4 mt-8 mb-6">
          <Text className="text-sm font-semibold text-neutral-400 uppercase mb-3">
            Também incluso no plano gratuito
          </Text>

          <View className="gap-2">
            {features
              .filter((f) => f.free)
              .map((feature, index) => (
                <View
                  key={index}
                  className="flex-row items-center py-2"
                >
                  <MaterialIcons name="check" size={18} color="#22C55E" />
                  <Text className="text-sm text-neutral-600 ml-2">{feature.title}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Guarantee */}
        <View className="mx-4 mb-6 p-4 bg-neutral-50 rounded-xl">
          <View className="flex-row items-center gap-3">
            <MaterialIcons name="verified-user" size={24} color="#22C55E" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black">Garantia de 7 dias</Text>
              <Text className="text-xs text-neutral-500">
                Cancele a qualquer momento e receba reembolso total
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-4 py-4 border-t border-neutral-100">
        <Pressable onPress={handleSubscribe} disabled={loading}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 rounded-2xl items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-lg font-bold text-white">
                  Assinar PRO por R$ {plans[selectedPlan].price.toFixed(2).replace('.', ',')}
                </Text>
                <Text className="text-xs text-white/80 mt-1">
                  {selectedPlan === 'yearly' ? 'Cobrança anual' : 'Cobrança mensal'} • Cancele quando quiser
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
