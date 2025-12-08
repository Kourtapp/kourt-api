import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Line, Rect, Polyline } from 'react-native-svg';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Tennis Ball Icon (Kourt logo style)
const TennisBallIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5}>
    <Circle cx={12} cy={12} r={10} />
  </Svg>
);

// Trophy Icon
const TrophyIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth={2}>
    <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <Path d="M4 22h16" />
    <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Svg>
);

// Money Icon
const MoneyIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2}>
    <Rect x={2} y={6} width={20} height={12} rx={2} />
    <Circle cx={12} cy={12} r={2} />
    <Path d="M6 12h.01M18 12h.01" />
  </Svg>
);

// Calendar Icon
const CalendarIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth={2}>
    <Rect x={3} y={4} width={18} height={18} rx={2} />
    <Path d="M16 2v4" />
    <Path d="M8 2v4" />
    <Path d="M3 10h18" />
  </Svg>
);

// Arrow Icon
const ArrowRightIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
    <Line x1={5} y1={12} x2={19} y2={12} />
    <Polyline points="12 5 19 12 12 19" />
  </Svg>
);

// Kourt Logo Icon
const KourtLogoIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth={2.5}>
    <Circle cx={12} cy={12} r={10} />
  </Svg>
);

const KourtHostBanner = () => {
  // Animation values for stickers
  const tennisBallRotate = useSharedValue(-12);
  const tennisBallY = useSharedValue(0);
  const trophyScale = useSharedValue(1);
  const trophyY = useSharedValue(0);
  const moneyRotate = useSharedValue(8);
  const moneyY = useSharedValue(0);
  const calendarRotate = useSharedValue(-5);
  const calendarY = useSharedValue(0);

  useEffect(() => {
    // Tennis ball wiggle + float
    tennisBallRotate.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-12, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    tennisBallY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Trophy bounce + scale
    trophyScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    trophyY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Money wiggle + float (delayed)
    moneyRotate.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 1800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    moneyY.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Calendar rotate + float (delayed)
    calendarRotate.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    calendarY.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  // Animated styles
  const tennisBallStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${tennisBallRotate.value}deg` },
      { translateY: tennisBallY.value },
    ],
  }));

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { translateY: trophyY.value },
    ],
  }));

  const moneyStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${moneyRotate.value}deg` },
      { translateY: moneyY.value },
    ],
  }));

  const calendarStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${calendarRotate.value}deg` },
      { translateY: calendarY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />

      {/* Floating Stickers */}
      {/* Tennis Ball - Top Left */}
      <Animated.View style={[styles.stickerTennisBall, tennisBallStyle]}>
        <TennisBallIcon />
      </Animated.View>

      {/* Trophy - Top Right */}
      <Animated.View style={[styles.stickerTrophy, trophyStyle]}>
        <TrophyIcon />
      </Animated.View>

      {/* Money - Bottom Left */}
      <Animated.View style={[styles.stickerMoney, moneyStyle]}>
        <MoneyIcon />
      </Animated.View>

      {/* Calendar - Bottom Right */}
      <Animated.View style={[styles.stickerCalendar, calendarStyle]}>
        <CalendarIcon />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <KourtLogoIcon />
          <Text style={styles.logoText}>Kourt Host</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>
          Cadastre. Reserve.{'\n'}Receba.
        </Text>
        <Text style={styles.headlineGreen}>Ganhe dinheiro.</Text>

        {/* Description */}
        <Text style={styles.description}>
          Sua quadra, suas regras. Defina horários, preços e comece a receber reservas hoje.
        </Text>

        {/* CTA Button */}
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push('/host/register' as any)}
        >
          <Text style={styles.ctaText}>Começar agora</Text>
          <ArrowRightIcon />
        </Pressable>

        {/* Terms Link */}
        <Pressable onPress={() => router.push('/terms' as any)}>
          <Text style={styles.termsText}>
            <Text style={styles.termsUnderline}>Termos</Text> aplicáveis
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 420,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#a3e635',
  },
  // Sticker base style - TripAdvisor cartoon style
  stickerBase: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 5,
  },
  stickerTennisBall: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 72,
    height: 72,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 5,
  },
  stickerTrophy: {
    position: 'absolute',
    top: 30,
    right: 15,
    width: 64,
    height: 64,
    backgroundColor: '#facc15',
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 5,
  },
  stickerMoney: {
    position: 'absolute',
    bottom: 60,
    left: 15,
    width: 64,
    height: 64,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 5,
  },
  stickerCalendar: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: 64,
    height: 64,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0a0a0a',
    textAlign: 'center',
    lineHeight: 38,
  },
  headlineGreen: {
    fontSize: 32,
    fontWeight: '800',
    color: '#15803d',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  termsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  termsUnderline: {
    textDecorationLine: 'underline',
  },
});

export default KourtHostBanner;
