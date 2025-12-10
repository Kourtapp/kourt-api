import { Stack } from 'expo-router';

export default function CourtDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="gallery" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="public" />
    </Stack>
  );
}
