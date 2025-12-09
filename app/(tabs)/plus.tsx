import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import {
  TennisBall,
  BasketballBall,
  SoccerBall,
  CrownSticker,
  VolleyballSticker,
  RacketSticker,
} from '@/components/stickers';
import { Animated3DButton } from '@/components/Animated3DButton';
import { FEATURES } from '@/lib/featureFlags';

// Action cards for quick access
const ACTION_CARDS = [
  {
    icon: 'photo-camera',
    title: 'Registrar Partida',
    description: 'Foto, metricas e pontos XP',
    route: '/match/record',
    style: 'light',
    requiresFeature: 'XP_SYSTEM' as const,
  },
  {
    icon: 'radio-button-unchecked',
    title: 'Criar Jogo',
    description: 'Monte uma partida com amigos',
    route: '/match/create',
    style: 'dark',
    requiresFeature: null,
  },
  {
    icon: 'location-on',
    title: 'Adicionar Quadra',
    description: 'Publica, privada ou arena',
    route: '/court/add',
    style: 'light',
    requiresFeature: null,
  },
];

// Plus plan features
const PLUS_FEATURES = [
  {
    icon: 'all-inclusive',
    title: 'Partidas Ilimitadas',
    description: 'Jogue quantas partidas quiser',
    isNew: false,
  },
  {
    icon: 'bar-chart',
    title: 'Estatisticas Avancadas',
    description: 'Acompanhe seu desempenho',
    isNew: false,
  },
  {
    icon: 'verified',
    title: 'Badge Exclusivo Plus',
    description: 'Destaque no seu perfil',
    isNew: false,
  },
];

// Pro plan features
const PRO_FEATURES = [
  {
    icon: 'bolt',
    title: 'Tudo do Plus +',
    description: 'Todas as vantagens Plus incluidas',
    isNew: false,
  },
  {
    icon: 'emoji-events',
    title: 'Criar Torneios',
    description: 'Organize seus proprios campeonatos',
    isNew: false,
  },
  {
    icon: 'workspace-premium',
    title: 'Badge PRO Exclusivo',
    description: 'Destaque maximo no perfil',
    isNew: true,
  },
];

export default function PlusScreen() {
  const { profile } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'pro'>('plus');

  const isPro = profile?.subscription === 'pro';
  const features = selectedPlan === 'plus' ? PLUS_FEATURES : PRO_FEATURES;

  // Animation shared values
  const ball1Y = useSharedValue(0);
  const ball1Rotate = useSharedValue(0);
  const ball2Y = useSharedValue(0);
  const ball2X = useSharedValue(0);
  const ball3Y = useSharedValue(0);

  useEffect(() => {
    // Sticker 1: bounce + rotate
    ball1Y.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    ball1Rotate.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 2400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Sticker 2: diagonal movement
    ball2Y.value = withRepeat(
      withSequence(
        withDelay(300, withTiming(-5, { duration: 1400, easing: Easing.inOut(Easing.ease) })),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    ball2X.value = withRepeat(
      withSequence(
        withDelay(300, withTiming(3, { duration: 1400, easing: Easing.inOut(Easing.ease) })),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Sticker 3: float
    ball3Y.value = withRepeat(
      withSequence(
        withDelay(600, withTiming(-4, { duration: 1800, easing: Easing.inOut(Easing.ease) })),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const ball1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: ball1Y.value },
      { rotate: `${ball1Rotate.value}deg` },
    ],
  }));

  const ball2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: ball2Y.value },
      { translateX: ball2X.value },
    ],
  }));

  const ball3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: ball3Y.value }],
  }));

  // Colors based on plan
  const planColors = {
    plus: {
      primary: '#22C55E',
      gradient: ['#22C55E', '#16A34A'],
      iconBg: 'rgba(34, 197, 94, 0.15)',
      bannerGradient: ['#14532D', '#166534', '#14532D'] as [string, string, string],
    },
    pro: {
      primary: '#FACC15',
      gradient: ['#F97316', '#FACC15'],
      iconBg: 'rgba(250, 204, 21, 0.15)',
      bannerGradient: ['#78350F', '#92400E', '#78350F'] as [string, string, string],
    },
  };

  const colors = planColors[selectedPlan];

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-[28px] font-semibold text-[#222222] tracking-tight">
            O que vamos jogar?
          </Text>
        </View>

        {/* Action Cards */}
        <View className="px-5 gap-3 mb-8">
          {ACTION_CARDS
            .filter(card => !card.requiresFeature || FEATURES[card.requiresFeature])
            .map((card, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(card.route as any)}
              className={`flex-row items-center p-4 rounded-2xl ${
                card.style === 'dark'
                  ? 'bg-[#222222]'
                  : 'bg-white border border-[#EBEBEB]'
              }`}
            >
              {/* Icon */}
              <View
                className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                  card.style === 'dark' ? 'bg-white/10' : 'bg-[#F5F5F5]'
                }`}
              >
                <MaterialIcons
                  name={card.icon as any}
                  size={24}
                  color={card.style === 'dark' ? '#FFFFFF' : '#222222'}
                />
              </View>

              {/* Text */}
              <View className="flex-1">
                <Text
                  className={`text-[16px] font-semibold ${
                    card.style === 'dark' ? 'text-white' : 'text-[#222222]'
                  }`}
                >
                  {card.title}
                </Text>
                <Text
                  className={`text-[13px] ${
                    card.style === 'dark' ? 'text-white/60' : 'text-[#717171]'
                  }`}
                >
                  {card.description}
                </Text>
              </View>

              {/* Arrow */}
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={card.style === 'dark' ? 'rgba(255,255,255,0.4)' : '#CCCCCC'}
              />
            </Pressable>
          ))}
        </View>

        {/* Plans Section - only show if subscriptions are enabled */}
        {FEATURES.SUBSCRIPTIONS && (
        <View className="mx-5 rounded-3xl overflow-hidden">
          <LinearGradient
            colors={['#1A1A1A', '#0D0D0D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ padding: 20, position: 'relative', overflow: 'hidden' }}
          >
            {/* Animated Stickers */}
            {selectedPlan === 'plus' ? (
              <>
                <Animated.View
                  style={[
                    { position: 'absolute', top: -8, left: -8, zIndex: 10 },
                    ball1Style,
                  ]}
                >
                  <TennisBall size={44} />
                </Animated.View>
                <Animated.View
                  style={[
                    { position: 'absolute', top: 60, right: -6, zIndex: 10 },
                    ball2Style,
                  ]}
                >
                  <BasketballBall size={40} />
                </Animated.View>
                <Animated.View
                  style={[
                    { position: 'absolute', bottom: 80, left: -4, zIndex: 10 },
                    ball3Style,
                  ]}
                >
                  <SoccerBall size={34} />
                </Animated.View>
              </>
            ) : (
              <>
                <Animated.View
                  style={[
                    { position: 'absolute', top: -10, left: -10, zIndex: 10 },
                    ball1Style,
                  ]}
                >
                  <CrownSticker size={52} />
                </Animated.View>
                <Animated.View
                  style={[
                    { position: 'absolute', top: 50, right: -8, zIndex: 10 },
                    ball2Style,
                  ]}
                >
                  <VolleyballSticker size={44} />
                </Animated.View>
                <Animated.View
                  style={[
                    { position: 'absolute', bottom: 70, left: -6, zIndex: 10 },
                    ball3Style,
                  ]}
                >
                  <RacketSticker size={46} />
                </Animated.View>
              </>
            )}

            {/* Header */}
            <View className="flex-row items-center gap-2 mb-5">
              <MaterialIcons name="star" size={20} color="#FACC15" />
              <Text className="text-[14px] font-bold text-[#FACC15] tracking-wider">
                PLANOS
              </Text>
            </View>

            {/* Plan Tabs */}
            <View className="flex-row gap-3 mb-6">
              {/* Plus Tab */}
              <Pressable
                onPress={() => setSelectedPlan('plus')}
                className="flex-1 rounded-xl p-4"
                style={{
                  backgroundColor: selectedPlan === 'plus' ? '#22C55E' : 'transparent',
                  borderWidth: selectedPlan === 'plus' ? 0 : 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <Text
                  className={`text-[15px] font-semibold ${
                    selectedPlan === 'plus' ? 'text-white' : 'text-white/50'
                  }`}
                >
                  Plus
                </Text>
                <Text
                  className={`text-[13px] mt-1 ${
                    selectedPlan === 'plus' ? 'text-white/80' : 'text-white/30'
                  }`}
                >
                  R$ 14,90/mes
                </Text>
              </Pressable>

              {/* Pro Tab */}
              <Pressable
                onPress={() => setSelectedPlan('pro')}
                className="flex-1 rounded-xl p-4"
                style={{
                  backgroundColor: selectedPlan === 'pro' ? '#FACC15' : 'transparent',
                  borderWidth: selectedPlan === 'pro' ? 0 : 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <Text
                  className={`text-[15px] font-semibold ${
                    selectedPlan === 'pro' ? 'text-[#0A0A0A]' : 'text-white/50'
                  }`}
                >
                  Pro
                </Text>
                <Text
                  className={`text-[13px] mt-1 ${
                    selectedPlan === 'pro' ? 'text-black/60' : 'text-white/30'
                  }`}
                >
                  R$ 49,90/mes
                </Text>
              </Pressable>
            </View>

            {/* Features List */}
            <View className="gap-3">
              {features.map((feature, index) => (
                <View
                  key={index}
                  className="flex-row items-center p-4 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Icon */}
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: colors.iconBg }}
                  >
                    <MaterialIcons
                      name={feature.icon as any}
                      size={20}
                      color={colors.primary}
                    />
                  </View>

                  {/* Text */}
                  <View className="flex-1">
                    <Text className="text-[14px] font-semibold text-white">
                      {feature.title}
                    </Text>
                    <Text className="text-[12px] text-white/40">
                      {feature.description}
                    </Text>
                  </View>

                  {/* New Badge */}
                  {feature.isNew && (
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text
                        className="text-[10px] font-bold"
                        style={{ color: selectedPlan === 'pro' ? '#000000' : '#FFFFFF' }}
                      >
                        NOVO
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Subscribe Button - 3D Animated */}
            <View className="mt-6">
              <Animated3DButton
                onPress={() => router.push('/subscription' as any)}
                title={`Assinar ${selectedPlan === 'plus' ? 'Plus' : 'Pro'}`}
                variant={selectedPlan}
              />
            </View>

            {/* Compare Plans Link */}
            <Pressable
              onPress={() => router.push('/subscription' as any)}
              className="mt-4 items-center"
            >
              <Text className="text-[14px] text-white/50 underline">
                Comparar planos
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
