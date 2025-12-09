// KourtPremiumCard.tsx
// Card 3D animado para Kourt Premium PRO - React Native

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ============================================
// ÍCONE DE MEDALHA ANIMADO
// ============================================

interface MedalIconProps {
  size?: number;
  animated?: boolean;
}

const MedalIcon: React.FC<MedalIconProps> = ({ size = 48, animated = true }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!animated) return;

    // Subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animated]);

  return (
    <Animated.View
      style={[
        styles.medalContainer,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.medalGlow,
          { opacity: glowAnim },
        ]}
      />

      {/* Medal background */}
      <View style={styles.medalBg}>
        <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
          <Defs>
            <SvgGradient id="medalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#fbbf24" />
              <Stop offset="50%" stopColor="#f59e0b" />
              <Stop offset="100%" stopColor="#d97706" />
            </SvgGradient>
          </Defs>
          {/* Medal ribbon */}
          <Path
            d="M12 15l-3 6h6l-3-6z"
            fill="url(#medalGrad)"
          />
          {/* Medal circle */}
          <Circle
            cx="12"
            cy="9"
            r="6"
            fill="none"
            stroke="url(#medalGrad)"
            strokeWidth="2"
          />
          {/* Star */}
          <Path
            d="M12 5l1.09 2.41L15.5 7.72l-1.73 1.81.29 2.47L12 11l-2.06 1l.29-2.47-1.73-1.81 2.41-.31L12 5z"
            fill="url(#medalGrad)"
          />
        </Svg>
      </View>
    </Animated.View>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface KourtPremiumCardProps {
  onPress?: () => void;
}

export const KourtPremiumCard: React.FC<KourtPremiumCardProps> = ({
  onPress,
}) => {
  const cardScale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Chevron bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(chevronAnim, {
          toValue: 6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(chevronAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: cardScale }] },
      ]}
    >
      {/* 3D Shadow Layers */}
      <View style={[styles.shadow, styles.shadow4]} />
      <View style={[styles.shadow, styles.shadow3]} />
      <View style={[styles.shadow, styles.shadow2]} />
      <View style={[styles.shadow, styles.shadow1]} />

      {/* Main Card */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <LinearGradient
          colors={['#292524', '#1c1917', '#0c0a09']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Top shine */}
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'transparent']}
            style={styles.topShine}
          />

          {/* Shimmer */}
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerTranslate }] },
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(251,191,36,0.08)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>

          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          {/* Content */}
          <View style={styles.content}>
            {/* Medal Icon */}
            <MedalIcon size={52} />

            {/* Title Row */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>Kourt Premium</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proText}>PRO</Text>
              </View>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Desbloqueie estatísticas, ranking global e jogue sem taxas.
            </Text>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.chevronContainer,
                  { transform: [{ translateX: chevronAnim }] },
                ]}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path
                    d="M9 5l7 7-7 7"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Inner border */}
          <View style={styles.innerBorder} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    position: 'relative',
  },

  // 3D Shadows
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },
  shadow4: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    transform: [{ translateY: 14 }, { translateX: 2 }],
  },
  shadow3: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    transform: [{ translateY: 10 }],
  },
  shadow2: {
    backgroundColor: 'rgba(41,37,36,0.5)',
    transform: [{ translateY: 6 }],
  },
  shadow1: {
    backgroundColor: 'rgba(28,25,23,0.6)',
    transform: [{ translateY: 3 }],
  },

  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.15)',
    minHeight: 160,
  },

  topShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
  },
  shimmerGradient: {
    flex: 1,
    width: 120,
  },

  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(251,191,36,0.03)',
    top: -80,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245,158,11,0.02)',
    bottom: -30,
    left: -20,
  },

  innerBorder: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },

  content: {
    position: 'relative',
    zIndex: 1,
  },

  // Medal
  medalContainer: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  medalGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(251,191,36,0.2)',
  },
  medalBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(251,191,36,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },

  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  proBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Subtitle
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
    marginBottom: 16,
  },

  // CTA
  ctaButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chevronContainer: {
    width: 20,
    height: 20,
  },
});

export default KourtPremiumCard;
