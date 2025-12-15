import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated as RNAnimated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

// Import Reanimated conditionally to avoid crash in development builds
let Animated: any = RNAnimated;
let useSharedValue: any = null;
let useAnimatedStyle: any = null;
let withRepeat: any = null;
let withSequence: any = null;
let withTiming: any = null;
let Easing: any = null;
let IS_REANIMATED_AVAILABLE = false;

try {
  const Reanimated = require('react-native-reanimated');
  Animated = Reanimated.default;
  useSharedValue = Reanimated.useSharedValue;
  useAnimatedStyle = Reanimated.useAnimatedStyle;
  withRepeat = Reanimated.withRepeat;
  withSequence = Reanimated.withSequence;
  withTiming = Reanimated.withTiming;
  Easing = Reanimated.Easing;
  IS_REANIMATED_AVAILABLE = true;
} catch (e) {
  console.log('[PlusSubscriptionCard] Reanimated not available - using static version');
}

const { width } = Dimensions.get('window');

const LightningIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      fill="#10b981"
      stroke="#10b981"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M12 5l7 7-7 7"
      stroke="#10b981"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface PlusSubscriptionCardProps {
  onPress?: () => void;
}

export const PlusSubscriptionCard: React.FC<PlusSubscriptionCardProps> = ({ onPress }) => {
  // Use reanimated if available, otherwise fallback to static view
  const lightningScale = IS_REANIMATED_AVAILABLE ? useSharedValue(1) : { value: 1 };
  const lightningGlow = IS_REANIMATED_AVAILABLE ? useSharedValue(0.3) : { value: 0.3 };
  const arrowX = IS_REANIMATED_AVAILABLE ? useSharedValue(0) : { value: 0 };
  const shimmerX = IS_REANIMATED_AVAILABLE ? useSharedValue(-width) : { value: -width };

  useEffect(() => {
    if (!IS_REANIMATED_AVAILABLE) return;

    // Lightning pulse
    lightningScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    // Glow
    lightningGlow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    // Arrow bounce
    arrowX.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    // Shimmer
    shimmerX.value = withRepeat(
      withTiming(width, { duration: 3000, easing: Easing.linear }),
      -1
    );
  }, []);

  // Static styles when reanimated is not available
  const iconStyle = IS_REANIMATED_AVAILABLE
    ? useAnimatedStyle(() => ({ transform: [{ scale: lightningScale.value }] }))
    : { transform: [{ scale: 1 }] };

  const glowStyle = IS_REANIMATED_AVAILABLE
    ? useAnimatedStyle(() => ({ opacity: lightningGlow.value }))
    : { opacity: 0.3 };

  const arrowStyle = IS_REANIMATED_AVAILABLE
    ? useAnimatedStyle(() => ({ transform: [{ translateX: arrowX.value }] }))
    : { transform: [{ translateX: 0 }] };

  const shimmerStyle = IS_REANIMATED_AVAILABLE
    ? useAnimatedStyle(() => ({ transform: [{ translateX: shimmerX.value }] }))
    : { transform: [{ translateX: -width }] };

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={['#065f46', '#047857', '#064e3b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Top Shine */}
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'transparent']}
          style={styles.topShine}
        />

        {/* Shimmer */}
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <Animated.View style={[styles.iconBox, iconStyle]}>
            <Animated.View style={[styles.iconGlow, glowStyle]} />
            <LightningIcon />
          </Animated.View>

          {/* Text */}
          <View style={styles.textBox}>
            <Text style={styles.title}>Seja Plus</Text>
            <Text style={styles.subtitle}>Comece com R$ 14,90/mes</Text>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <CheckIcon />
                <Text style={styles.tagText}>Estatisticas</Text>
              </View>
              <View style={styles.tag}>
                <CheckIcon />
                <Text style={styles.tagText}>Ilimitado</Text>
              </View>
            </View>
          </View>

          {/* Arrow */}
          <Animated.View style={[styles.arrowBtn, arrowStyle]}>
            <ArrowIcon />
          </Animated.View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    minHeight: 120,
  },
  topShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
  },
  shimmerGradient: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.3)',
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default PlusSubscriptionCard;
