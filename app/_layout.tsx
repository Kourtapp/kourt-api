import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';
import { StripeProvider } from '@stripe/stripe-react-native';
import '../global.css';

// Stripe Publishable Key from environment variables
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isInitialized } = useAuthStore();
  const segments = useSegments();
  const previousUserId = useRef<string | undefined>(undefined);

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

    const justLoggedOut = previousUserId.current && !userId;
    const justLoggedIn = !previousUserId.current && userId;
    previousUserId.current = userId;

    if (inOnboardingGroup && userId && !justLoggedOut) {
      return;
    }

    if (inTabsGroup && userId && onboardingCompleted) {
      return;
    }

    if (!userId && (inTabsGroup || inOnboardingGroup || inChatGroup || justLoggedOut)) {
      console.log('[Auth] Redirecting to welcome - user not authenticated');
      router.replace('/');
    } else if (userId && (inAuthGroup || !firstSegment || firstSegment === 'index' || justLoggedIn)) {
      if (onboardingCompleted) {
        console.log('[Auth] Redirecting to tabs - onboarding completed');
        router.replace('/(tabs)');
      } else if (!inOnboardingGroup) {
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
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.kourt"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
            <Stack.Screen name="tournaments" />
            <Stack.Screen name="booking" />
            <Stack.Screen name="admin" />
          </Stack>
        </AuthGuard>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}
