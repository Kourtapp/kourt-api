import { Stack } from 'expo-router';

export default function SecurityLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="verify-phone" />
      <Stack.Screen name="two-factor" />
      <Stack.Screen name="devices" />
      <Stack.Screen name="activity" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
