import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Line, Polyline } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

// Ícone SVG como componente
const StoreIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
    <Path d="M3 3h18v18H3z" />
    <Path d="M3 9h18" />
    <Path d="M9 21V9" />
  </Svg>
);

const TennisBallIcon = ({ size = 32, color = "#22c55e" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx={12} cy={12} r={10} />
    <Path d="M2.5 12c0-4.5 3.5-8.5 8-9.5" />
    <Path d="M21.5 12c0 4.5-3.5 8.5-8 9.5" />
  </Svg>
);

const MoneyIcon = ({ size = 20, color = "#0a0a0a" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1={12} y1={1} x2={12} y2={23} />
    <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Svg>
);

const ArrowIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5}>
    <Line x1={5} y1={12} x2={19} y2={12} />
    <Polyline points="12 5 19 12 12 19" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

const SejaHostCard = () => {
  // Animated values
  const tennisBallY = useSharedValue(0);
  const tennisBallRotate = useSharedValue(0);
  const moneyY = useSharedValue(0);
  const moneyRotate = useSharedValue(-8);
  const sparkle1 = useSharedValue(0.3);
  const sparkle2 = useSharedValue(0.3);

  useEffect(() => {
    // Tennis ball floating animation
    tennisBallY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    tennisBallRotate.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Money floating animation (delayed)
    moneyY.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    moneyRotate.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(5, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Sparkle animations
    sparkle1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    sparkle2.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  // Animated styles
  const tennisBallStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: tennisBallY.value },
      { rotate: `${tennisBallRotate.value}deg` },
    ],
  }));

  const moneyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: moneyY.value },
      { rotate: `${moneyRotate.value}deg` },
    ],
  }));

  const sparkle1Style = useAnimatedStyle(() => ({
    opacity: sparkle1.value,
    transform: [{ scale: interpolate(sparkle1.value, [0.3, 1], [1, 1.5]) }],
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    opacity: sparkle2.value,
    transform: [{ scale: interpolate(sparkle2.value, [0.3, 1], [1, 1.5]) }],
  }));

  return (
    <Pressable
      onPress={() => router.push('/host/become' as any)}
      style={styles.container}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={['#22c55e', '#16a34a', '#15803d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Elements */}
      <View style={styles.floatingContainer}>
        {/* Tennis Ball */}
        <Animated.View style={[styles.tennisBall, tennisBallStyle]}>
          <TennisBallIcon size={24} color="#22c55e" />
        </Animated.View>

        {/* Money Icon */}
        <Animated.View style={[styles.moneyIcon, moneyStyle]}>
          <MoneyIcon size={22} color="#0a0a0a" />
        </Animated.View>

        {/* Sparkles */}
        <Animated.View style={[styles.sparkle1, sparkle1Style]} />
        <Animated.View style={[styles.sparkle2, sparkle2Style]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon Box */}
        <View style={styles.iconBox}>
          <StoreIcon />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Seja um Host</Text>
          <Text style={styles.subtitle}>
            Cadastre sua quadra e receba reservas
          </Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <CheckIcon />
              <Text style={styles.tagText}>Grátis</Text>
            </View>
            <View style={styles.tag}>
              <CheckIcon />
              <Text style={styles.tagText}>Rápido</Text>
            </View>
          </View>
        </View>

        {/* Arrow Button */}
        <View style={styles.arrowButton}>
          <ArrowIcon />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginVertical: 8,
    minHeight: 140,
  },
  floatingContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  tennisBall: {
    position: 'absolute',
    top: -8,
    right: 55,
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  moneyIcon: {
    position: 'absolute',
    bottom: -5,
    right: 12,
    width: 42,
    height: 42,
    backgroundColor: '#facc15',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  sparkle1: {
    position: 'absolute',
    top: '45%',
    right: '28%',
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 4,
  },
  sparkle2: {
    position: 'absolute',
    top: '25%',
    right: '40%',
    width: 6,
    height: 6,
    backgroundColor: 'rgba(250,204,21,0.7)',
    borderRadius: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  arrowButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default SejaHostCard;
