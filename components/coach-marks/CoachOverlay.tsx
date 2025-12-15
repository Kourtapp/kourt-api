// components/coach-marks/CoachOverlay.tsx
import { View, Text, Pressable, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';

// Import Reanimated conditionally
let Animated: any = { View };
let FadeIn: any = { duration: () => undefined };
let FadeOut: any = { duration: () => undefined };
let useAnimatedStyle: any = () => ({});
let useSharedValue: any = () => ({ value: 1 });
let withRepeat: any = (x: any) => x;
let withTiming: any = (x: any) => x;
let IS_REANIMATED_AVAILABLE = false;

try {
  const Reanimated = require('react-native-reanimated');
  Animated = Reanimated.default;
  FadeIn = Reanimated.FadeIn;
  FadeOut = Reanimated.FadeOut;
  useAnimatedStyle = Reanimated.useAnimatedStyle;
  useSharedValue = Reanimated.useSharedValue;
  withRepeat = Reanimated.withRepeat;
  withTiming = Reanimated.withTiming;
  IS_REANIMATED_AVAILABLE = true;
} catch (e) {
  console.log('[CoachOverlay] Reanimated not available');
}

import { useCoachStore } from '@/stores/useCoachStore';
import { COACH_MARKS } from '@/constants/coachMarks';

const { height } = Dimensions.get('window');

interface CoachOverlayProps {
  screen: string;
}

export function CoachOverlay({ screen }: CoachOverlayProps) {
  const { isActive, currentStep, nextStep, skipTutorial, completeTutorial } =
    useCoachStore();

  // Filter marks for current screen
  const screenMarks = COACH_MARKS.filter((m) => m.screen === screen);
  const currentMark = screenMarks[currentStep];

  // Pulsing animation
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.05, { duration: 800 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!isActive || !currentMark) return null;

  const isLast = currentStep === screenMarks.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeTutorial();
    } else {
      nextStep();
    }
  };

  // Position the tooltip based on target
  const getTooltipPosition = () => {
    switch (currentMark.position) {
      case 'top':
        return { top: 150 };
      case 'bottom':
        return { bottom: 200 };
      default:
        return { top: height / 2 - 100 };
    }
  };

  // Conditional animations
  const enteringAnim = IS_REANIMATED_AVAILABLE ? FadeIn.duration(200) : undefined;
  const exitingAnim = IS_REANIMATED_AVAILABLE ? FadeOut.duration(200) : undefined;

  return (
    <Animated.View
      entering={enteringAnim}
      exiting={exitingAnim}
      className="absolute inset-0 z-50"
      pointerEvents="box-none"
    >
      {/* Dark Overlay */}
      <View className="absolute inset-0 bg-black/60" />

      {/* Highlight Area */}
      <Animated.View
        style={[
          pulseStyle,
          {
            position: 'absolute',
            top: currentMark.position === 'top' ? 250 : 100,
            left: 20,
            right: 20,
            height: 80,
            borderRadius: 16,
            borderWidth: 3,
            borderColor: '#84cc16',
            shadowColor: '#a3e635',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 10,
          },
        ]}
      />

      {/* Tooltip */}
      <View
        className="absolute left-5 right-5 bg-white rounded-2xl p-5 shadow-2xl"
        style={getTooltipPosition()}
      >
        {/* Icon */}
        <View className="w-12 h-12 bg-lime-500 rounded-xl items-center justify-center mb-3">
          <MaterialIcons name="lightbulb" size={24} color="#1a2e05" />
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-black mb-2">
          {currentMark.title}
        </Text>

        {/* Description */}
        <Text className="text-sm text-neutral-600 mb-4 leading-5">
          {currentMark.description}
        </Text>

        {/* Progress Dots */}
        <View className="flex-row items-center gap-1.5 mb-4">
          {screenMarks.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === currentStep
                  ? 'bg-lime-500 w-6'
                  : index < currentStep
                    ? 'bg-lime-500 w-2'
                    : 'bg-neutral-200 w-2'
              }`}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={skipTutorial}
            className="flex-1 py-3 rounded-xl items-center"
          >
            <Text className="text-neutral-500 font-medium">Pular</Text>
          </Pressable>

          <Pressable
            onPress={handleNext}
            className="flex-1 py-3 bg-lime-500 rounded-xl items-center"
          >
            <Text className="text-lime-950 font-semibold">
              {isLast ? 'Entendi!' : 'Proximo'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
