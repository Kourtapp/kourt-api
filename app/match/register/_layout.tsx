import { Stack } from 'expo-router';
import { RegisterMatchProvider } from '@/contexts/RegisterMatchContext';

export default function RegisterMatchLayout() {
  return (
    <RegisterMatchProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </RegisterMatchProvider>
  );
}
