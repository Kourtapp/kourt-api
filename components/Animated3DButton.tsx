import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Animated3DButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'plus' | 'pro';
  disabled?: boolean;
}

export const Animated3DButton = ({
  onPress,
  title,
  variant = 'plus',
  disabled = false,
}: Animated3DButtonProps) => {
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  const colors = {
    plus: {
      top: ['#4ade80', '#22c55e'] as [string, string],
      bottom: '#15803d',
      shadow: '#14532d',
      text: '#ffffff',
    },
    pro: {
      top: ['#fde047', '#facc15'] as [string, string],
      bottom: '#ca8a04',
      shadow: '#713f12',
      text: '#000000',
    },
  };

  const currentColors = colors[variant];

  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 15, stiffness: 400 });
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 15, stiffness: 400 });
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: interpolate(pressed.value, [0, 1], [0, 4]) },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    height: interpolate(pressed.value, [0, 1], [8, 4]),
    opacity: interpolate(pressed.value, [0, 1], [1, 0.7]),
  }));

  const topStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(pressed.value, [0, 1], [0, 2]) }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, containerStyle]}
    >
      {/* Shadow layer */}
      <Animated.View
        style={[
          styles.shadow,
          { backgroundColor: currentColors.shadow },
          shadowStyle,
        ]}
      />

      {/* Bottom layer (3D depth) */}
      <View style={[styles.bottom, { backgroundColor: currentColors.bottom }]} />

      {/* Top layer with gradient */}
      <Animated.View style={[styles.top, topStyle]}>
        <LinearGradient
          colors={currentColors.top}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.text, { color: currentColors.text }]}>
            {title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: 8,
    borderRadius: 16,
  },
  bottom: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    height: 52,
    borderRadius: 16,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  text: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
