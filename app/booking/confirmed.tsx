// app/booking/confirmed.tsx
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useBookingStore } from '@/stores/useBookingStore';

export default function BookingConfirmedScreen() {
  const { bookingId } = useLocalSearchParams();
  const { court, date, time, duration, reset } = useBookingStore();

  const handleGoHome = () => {
    reset();
    router.replace('/(tabs)');
  };

  const handleCreateMatch = () => {
    router.push({
      pathname: '/match/create',
      params: { bookingId: bookingId as string },
    });
  };

  const calculateEndTime = (startTime: string, hours: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const endHour = h + hours;
    return `${endHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 flex-row justify-end">
        <Pressable onPress={handleGoHome}>
          <MaterialIcons name="close" size={24} color="#000" />
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 items-center justify-center">
        {/* Success Icon */}
        <Animated.View
          entering={BounceIn.delay(200).duration(600)}
          className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6"
        >
          <MaterialIcons name="check" size={48} color="#22C55E" />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeIn.delay(400).duration(400)}>
          <Text className="text-2xl font-bold text-black text-center mb-2">
            Reserva Confirmada!
          </Text>
          <Text className="text-sm text-neutral-500 text-center mb-8">
            +25 XP adicionados
          </Text>
        </Animated.View>

        {/* Booking Card */}
        <Animated.View
          entering={FadeIn.delay(600).duration(400)}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-5 mb-8"
        >
          <Text className="font-bold text-black text-lg mb-4 text-center">
            {court?.name || 'Arena Beach Tennis'}
          </Text>

          <View className="flex-row items-center justify-center gap-6 mb-4">
            <View className="items-center">
              <MaterialIcons name="event" size={20} color="#525252" />
              <Text className="text-sm text-neutral-600 mt-1">
                {date ? format(date, 'EEE, d MMM', { locale: ptBR }) : 'Data'}
              </Text>
            </View>
            <View className="items-center">
              <MaterialIcons name="schedule" size={20} color="#525252" />
              <Text className="text-sm text-neutral-600 mt-1">
                {time
                  ? `${time} - ${calculateEndTime(time, duration)}`
                  : 'Horário'}
              </Text>
            </View>
          </View>

          {/* QR Code Placeholder */}
          <View className="items-center py-4">
            <View className="w-32 h-32 bg-white border border-neutral-200 rounded-xl items-center justify-center">
              <MaterialIcons name="qr-code-2" size={80} color="#000" />
            </View>
            <Text className="text-xs text-neutral-500 mt-2">
              Use para check-in
            </Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          entering={FadeIn.delay(800).duration(400)}
          className="w-full gap-3"
        >
          <Pressable
            onPress={handleCreateMatch}
            className="w-full py-4 bg-black rounded-2xl items-center"
          >
            <Text className="text-white font-semibold">Criar Partida</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              /* Share */
            }}
            className="w-full py-4 bg-neutral-100 rounded-2xl items-center"
          >
            <Text className="text-black font-semibold">Convidar Amigos</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              /* Add to calendar */
            }}
            className="w-full py-4 items-center"
          >
            <Text className="text-neutral-500 font-medium">
              Adicionar ao Calendário
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Footer */}
      <View className="px-6 pb-8">
        <Pressable onPress={handleGoHome}>
          <Text className="text-center text-neutral-500">Ir para Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
