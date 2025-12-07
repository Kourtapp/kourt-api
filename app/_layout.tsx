import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';
import '../global.css';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isInitialized } = useAuthStore();
  const segments = useSegments();
  const previousUserId = useRef<string | undefined>(undefined);
  const hasInitialNavigated = useRef(false);

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

    // Check if user just logged out (had user before, doesn't have now)
    const justLoggedOut = previousUserId.current && !userId;

    // Check if user just logged in (didn't have user before, has now)
    const justLoggedIn = !previousUserId.current && userId;

    // Update previous user ID
    previousUserId.current = userId;

    // If user is already in onboarding, don't redirect unless they just logged out
    if (inOnboardingGroup && userId && !justLoggedOut) {
      return; // Let them continue onboarding without interruption
    }

    // If user is already in tabs and onboarding is complete, don't redirect
    if (inTabsGroup && userId && onboardingCompleted) {
      return;
    }

    if (!userId && (inTabsGroup || inOnboardingGroup || inChatGroup || justLoggedOut)) {
      // Not authenticated, redirect to welcome
      console.log('[Auth] Redirecting to welcome - user not authenticated');
      router.replace('/');
    } else if (userId && (inAuthGroup || !firstSegment || firstSegment === 'index' || justLoggedIn)) {
      // Authenticated and in auth/welcome screens, or just logged in
      if (onboardingCompleted) {
        // Onboarding completed, go to tabs
        console.log('[Auth] Redirecting to tabs - onboarding completed');
        router.replace('/(tabs)');
      } else if (!inOnboardingGroup) {
        // Onboarding not completed and not already in onboarding
        console.log('[Auth] Redirecting to onboarding - onboarding not completed');
        router.replace('/(onboarding)/welcome');
      }
    }
  }, [userId, onboardingCompleted, isInitialized, segments]);

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

  // Request location permission on app start
  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        await Location.requestForegroundPermissionsAsync();
      }
    };
    requestLocationPermission();
  }, []);

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
