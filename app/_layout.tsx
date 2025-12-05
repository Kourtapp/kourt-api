import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import '../global.css';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isInitialized } = useAuthStore();
  const segments = useSegments();
  const hasNavigated = useRef(false);

  // Use refs to track values without causing re-renders
  const onboardingCompleted = profile?.onboarding_completed;
  const userId = user?.id;

  useEffect(() => {
    if (!isInitialized) return;

    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';
    const inTabsGroup = firstSegment === '(tabs)';
    const inOnboardingGroup = firstSegment === '(onboarding)';
    const inChatGroup = firstSegment === 'chat';

    // Prevent multiple navigations
    if (hasNavigated.current) return;

    if (!userId && (inTabsGroup || inOnboardingGroup || inChatGroup)) {
      // Not authenticated, redirect to welcome
      hasNavigated.current = true;
      router.replace('/');
    } else if (userId && (inAuthGroup || !firstSegment || firstSegment === 'index')) {
      // Authenticated, check if onboarding is completed
      hasNavigated.current = true;
      if (onboardingCompleted) {
        // Onboarding completed, go to tabs
        router.replace('/(tabs)');
      } else {
        // Onboarding not completed, go to onboarding
        router.replace('/(onboarding)/welcome');
      }
    }
  }, [userId, onboardingCompleted, isInitialized, segments]);

  // Reset navigation flag when user changes
  useEffect(() => {
    hasNavigated.current = false;
  }, [userId]);

  if (!isInitialized) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat" />
        </Stack>
      </AuthGuard>
    </GestureHandlerRootView>
  );
}
