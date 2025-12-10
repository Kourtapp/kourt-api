import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/stores/authStore';
import { paymentService } from '@/services/paymentService';

type PlanTier = 'plus' | 'pro';
type BillingPeriod = 'monthly' | 'yearly';

interface Feature {
  text: string;
  badge?: 'new' | 'plus' | 'pro';
  disabled?: boolean;
}

const plusFeatures: Feature[] = [
  { text: 'Tudo do plano Free' },
  { text: 'Análise de IA da partida', badge: 'new' },
  { text: 'Placar e stats automáticos' },
  { text: 'Highlights automáticos (30-60s)' },
  { text: 'Reserva com 14 dias de antecedência' },
  { text: 'Sem anúncios' },
  { text: 'Badge Plus no perfil' },
];

const proFeatures: Feature[] = [
  { text: 'Tudo do plano Plus' },
  { text: 'Dicas da IA para melhorar', badge: 'new' },
  { text: 'Análise de evolução mensal' },
  { text: 'Comparativo com outros jogadores' },
  { text: 'Criar torneios e eventos' },
  { text: 'R$ 15 em créditos/mês para quadras' },
  { text: 'Descontos em lojas parceiras' },
  { text: 'Badge Pro exclusivo' },
];

const pricing = {
  plus: {
    monthly: { price: 14.90 },
    yearly: { price: 119, monthlyEquivalent: 9.90, originalPrice: 178.80, savings: 40 },
  },
  pro: {
    monthly: { price: 49.90 },
    yearly: { price: 539, monthlyEquivalent: 44.90, originalPrice: 598.80, savings: 10 },
  },
};

export default function SubscriptionScreen() {
  // TODO: Implement usePremium hook to check user subscription status
  const isPremium = false;
  const isPro = false;
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('plus');

  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      // Obter preço correto
      const price = pricing[selectedPlan][billingPeriod].price;

      // 1. Inicializar Payment Sheet
      const initialized = await paymentService.initializePaymentSheet(price);
      if (!initialized) {
        setLoading(false);
        return;
      }

      // 2. Abrir Sheet
      const { success, error } = await paymentService.openPaymentSheet();

      if (success) {
        Alert.alert('Sucesso! 🎉', 'Sua assinatura foi ativada. Bem-vindo ao Kourt Premium!');
        // Idealmente: Refetch profile ou aguardar webhook
      } else {
        if (error) {
          Alert.alert('Erro no pagamento', error);
        }
        // Se foi cancelado, não faz nada
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // Theme colors based on selected plan
  const isPlanPro = selectedPlan === 'pro';
  const bgColor = isPlanPro ? 'bg-[#0a0a0a]' : 'bg-[#f0fdf4]'; // Verde claro para Plus
  const textColor = isPlanPro ? 'text-white' : 'text-gray-900';
  const textMutedColor = isPlanPro ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isPlanPro ? 'border-gray-800' : 'border-green-200';
  const cardBgColor = isPlanPro ? 'bg-[#1a1a1a]' : 'bg-white';

  // Current plan features
  const features = isPlanPro ? proFeatures : plusFeatures;
  const currentPricing = pricing[selectedPlan];

  if (isPremium) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable onPress={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center">
            <MaterialIcons name="close" size={20} color="#222" />
          </Pressable>
          <Pressable>
            <Text className="text-sm text-gray-500">Restaurar compra</Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <LinearGradient
            colors={isPro ? ['#d4af37', '#f4e4a6', '#d4af37'] : ['#84cc16', '#22c55e']}
            className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
          >
            <MaterialIcons name={isPro ? "workspace-premium" : "verified"} size={40} color="#fff" />
          </LinearGradient>
          <Text className="text-2xl font-bold text-gray-900">
            Você é {isPro ? 'PRO' : 'Plus'}!
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Você já possui acesso a todos os recursos {isPro ? 'Pro' : 'Plus'} do Kourt.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 px-8 py-3 bg-gray-900 rounded-xl"
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isPlanPro ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className={`w-9 h-9 rounded-full items-center justify-center ${isPlanPro ? 'bg-[#1a1a1a] border border-gray-700' : 'bg-gray-100'}`}
        >
          <MaterialIcons name="close" size={20} color={isPlanPro ? '#d4af37' : '#222'} />
        </Pressable>
        <Pressable>
          <Text className={`text-sm ${isPlanPro ? 'text-gray-500' : 'text-gray-500'}`}>
            Restaurar compra
          </Text>
        </Pressable>
      </View>

      {/* Plan Tabs */}
      <View className="flex-row gap-2 px-6 mb-6">
        <Pressable
          onPress={() => setSelectedPlan('plus')}
          className={`flex-1 py-3 px-4 rounded-xl border-2 items-center ${selectedPlan === 'plus'
            ? 'border-gray-900 bg-gray-900'
            : isPlanPro
              ? 'border-gray-700 bg-[#1a1a1a]'
              : 'border-gray-200 bg-white'
            }`}
        >
          <Text className={`text-xs font-semibold uppercase tracking-wide ${selectedPlan === 'plus' ? 'text-white' : textMutedColor
            }`}>
            Plus
          </Text>
          <Text className={`text-[11px] mt-0.5 ${selectedPlan === 'plus' ? 'text-gray-400' : isPlanPro ? 'text-gray-600' : 'text-gray-400'
            }`}>
            R$ 14,90/mês
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSelectedPlan('pro')}
          style={selectedPlan === 'pro' ? {
            borderWidth: 2,
            borderColor: '#d4af37',
          } : undefined}
          className={`flex-1 py-3 px-4 rounded-xl items-center ${selectedPlan === 'pro'
            ? 'bg-gradient-to-r'
            : isPlanPro
              ? 'border-2 border-gray-700 bg-[#1a1a1a]'
              : 'border-2 border-gray-200 bg-white'
            }`}
        >
          {selectedPlan === 'pro' ? (
            <LinearGradient
              colors={['#d4af37', '#f4e4a6', '#d4af37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute inset-0 rounded-xl"
              style={{ borderRadius: 12 }}
            />
          ) : null}
          <Text className={`text-xs font-semibold uppercase tracking-wide ${selectedPlan === 'pro' ? 'text-[#0a0a0a]' : textMutedColor
            }`}>
            Pro
          </Text>
          <Text className={`text-[11px] mt-0.5 ${selectedPlan === 'pro' ? 'text-[#333]' : isPlanPro ? 'text-gray-600' : 'text-gray-400'
            }`}>
            R$ 49,90/mês
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {/* Illustration Box */}
          <View className={`rounded-2xl p-8 mb-8 border-2 border-dashed relative overflow-hidden ${isPlanPro ? 'border-gray-700 bg-[#111]' : 'border-green-200 bg-white'
            }`}>
            {/* Decorative elements */}
            <View className={`absolute top-5 right-7 w-10 h-10 rounded-lg ${isPlanPro ? 'bg-[#d4af37]' : 'bg-gray-900'}`} />
            <View className={`absolute bottom-7 left-7 w-6 h-6 rounded-full ${isPlanPro ? 'bg-[#f4e4a6]' : 'bg-lime-500'}`} />
            <View className={`absolute top-10 left-10 w-8 h-2 rounded ${isPlanPro ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <View className={`absolute bottom-10 right-12 w-2 h-8 rounded ${isPlanPro ? 'bg-gray-700' : 'bg-gray-200'}`} />

            {/* Icon */}
            <View className="items-center">
              {isPlanPro ? (
                <LinearGradient
                  colors={['#d4af37', '#f4e4a6', '#d4af37']}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16
                  }}
                >
                  <MaterialIcons name="workspace-premium" size={40} color="#fff" />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={['#84cc16', '#22c55e']}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    shadowColor: '#84cc16',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16
                  }}
                >
                  <MaterialIcons name="videocam" size={40} color="#fff" />
                </LinearGradient>
              )}
            </View>
          </View>

          {/* Title */}
          <Text className={`text-3xl font-bold text-center mb-2 ${textColor}`}>
            {isPlanPro ? 'Performance máxima' : 'Análise inteligente'}
          </Text>
          <Text className={`text-base text-center mb-6 ${textMutedColor}`}>
            {isPlanPro
              ? 'Análise avançada de IA, dicas personalizadas e benefícios exclusivos.'
              : 'IA que analisa suas partidas e preenche estatísticas automaticamente.'}
          </Text>

          {/* Features List */}
          <View className="mb-6">
            {features.map((feature, index) => (
              <View
                key={index}
                className={`flex-row items-center py-3 border-b ${isPlanPro ? 'border-gray-800' : 'border-gray-100'
                  }`}
              >
                {isPlanPro ? (
                  <LinearGradient
                    colors={['#d4af37', '#f4e4a6']}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MaterialIcons name="check" size={16} color="#0a0a0a" />
                  </LinearGradient>
                ) : (
                  <View className="w-6 h-6 rounded-full bg-lime-500 items-center justify-center">
                    <MaterialIcons name="check" size={16} color="#fff" />
                  </View>
                )}
                <Text className={`flex-1 ml-3 text-[15px] ${textColor}`}>
                  {feature.text}
                </Text>
                {feature.badge === 'new' && (
                  <View className={`px-2 py-0.5 rounded-full ${isPlanPro ? 'bg-[#d4af37]/20' : 'bg-green-100'
                    }`}>
                    <Text className={`text-[10px] font-semibold uppercase ${isPlanPro ? 'text-[#d4af37]' : 'text-green-700'
                      }`}>
                      Novo
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Pricing Cards */}
          <View className="flex-row gap-3 mb-6">
            {/* Yearly */}
            <Pressable
              onPress={() => setBillingPeriod('yearly')}
              className={`flex-1 p-4 rounded-2xl border-2 relative ${billingPeriod === 'yearly'
                ? isPlanPro
                  ? 'border-[#d4af37] bg-[#1a1a1a]'
                  : 'border-lime-500 bg-white'
                : isPlanPro
                  ? 'border-gray-700 bg-[#111]'
                  : 'border-green-200 bg-white'
                }`}
            >
              {/* Savings Badge */}
              <View
                className="absolute -top-2.5 left-1/2 px-3 py-1 rounded-full"
                style={{
                  transform: [{ translateX: -45 }],
                  backgroundColor: isPlanPro ? '#d4af37' : '#84cc16',
                }}
              >
                <Text className={`text-[10px] font-bold ${isPlanPro ? 'text-[#0a0a0a]' : 'text-white'}`}>
                  ECONOMIZE {currentPricing.yearly.savings}%
                </Text>
              </View>

              {/* Radio */}
              <View className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 items-center justify-center ${billingPeriod === 'yearly'
                ? isPlanPro
                  ? 'border-[#d4af37] bg-[#d4af37]'
                  : 'border-lime-500 bg-lime-500'
                : isPlanPro
                  ? 'border-gray-600'
                  : 'border-green-300'
                }`}>
                {billingPeriod === 'yearly' && (
                  <View className={`w-2 h-2 rounded-full ${isPlanPro ? 'bg-[#0a0a0a]' : 'bg-white'}`} />
                )}
              </View>

              <Text className={`text-xs ${textMutedColor}`}>Anual</Text>
              <Text className={`text-2xl font-bold ${textColor}`}>
                R$ {currentPricing.yearly.price}<Text className={`text-sm font-normal ${textMutedColor}`}>/ano</Text>
              </Text>
              <Text className={`text-xs ${textMutedColor}`}>
                R$ {currentPricing.yearly.monthlyEquivalent.toFixed(2).replace('.', ',')}/mês
              </Text>
              <Text className={`text-xs line-through ${isPlanPro ? 'text-gray-600' : 'text-gray-400'}`}>
                R$ {currentPricing.yearly.originalPrice.toFixed(2).replace('.', ',')}
              </Text>
            </Pressable>

            {/* Monthly */}
            <Pressable
              onPress={() => setBillingPeriod('monthly')}
              className={`flex-1 p-4 rounded-2xl border-2 relative ${billingPeriod === 'monthly'
                ? isPlanPro
                  ? 'border-[#d4af37] bg-[#1a1a1a]'
                  : 'border-lime-500 bg-white'
                : isPlanPro
                  ? 'border-gray-700 bg-[#111]'
                  : 'border-green-200 bg-white'
                }`}
            >
              {/* Radio */}
              <View className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 items-center justify-center ${billingPeriod === 'monthly'
                ? isPlanPro
                  ? 'border-[#d4af37] bg-[#d4af37]'
                  : 'border-lime-500 bg-lime-500'
                : isPlanPro
                  ? 'border-gray-600'
                  : 'border-green-300'
                }`}>
                {billingPeriod === 'monthly' && (
                  <View className={`w-2 h-2 rounded-full ${isPlanPro ? 'bg-[#0a0a0a]' : 'bg-white'}`} />
                )}
              </View>

              <Text className={`text-xs ${textMutedColor}`}>Mensal</Text>
              <Text className={`text-2xl font-bold ${textColor}`}>
                R$ {currentPricing.monthly.price.toFixed(2).replace('.', ',')}<Text className={`text-sm font-normal ${textMutedColor}`}>/mês</Text>
              </Text>
              <Text className={`text-xs ${textMutedColor}`}>
                Cancele quando quiser
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className={`px-6 pt-4 pb-8 border-t ${isPlanPro ? 'border-gray-800' : 'border-gray-100'} ${bgColor}`}>
        {/* Footer Links */}
        <View className="flex-row justify-center gap-6 mb-4">
          <Pressable>
            <Text className={`text-[13px] ${isPlanPro ? 'text-gray-600' : 'text-gray-500'}`}>Termos</Text>
          </Pressable>
          <Pressable>
            <Text className={`text-[13px] ${isPlanPro ? 'text-gray-600' : 'text-gray-500'}`}>Privacidade</Text>
          </Pressable>
          <Pressable>
            <Text className={`text-[13px] ${isPlanPro ? 'text-gray-600' : 'text-gray-500'}`}>Comparar planos</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleSubscribe} disabled={loading}>
          {isPlanPro ? (
            <LinearGradient
              colors={['#d4af37', '#f4e4a6', '#d4af37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 rounded-2xl items-center"
            >
              {loading ? (
                <ActivityIndicator color="#0a0a0a" />
              ) : (
                <Text className="text-base font-bold text-[#0a0a0a]">
                  Assinar Pro
                </Text>
              )}
            </LinearGradient>
          ) : (
            <View className="py-4 rounded-2xl items-center bg-lime-500">
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Assinar Plus
                </Text>
              )}
            </View>
          )}
        </Pressable>
        <Text className={`text-center text-[13px] mt-3 ${textMutedColor}`}>
          <Text className={isPlanPro ? 'text-[#d4af37] font-semibold' : 'text-gray-900 font-semibold'}>7 dias grátis</Text> para testar • Cancele quando quiser
        </Text>
      </View>
    </SafeAreaView>
  );
}
