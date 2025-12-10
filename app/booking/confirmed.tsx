import { View, Text, Pressable, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import * as Calendar from 'expo-calendar';
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

  const handleViewBookings = () => {
    reset();
    router.replace('/bookings' as any);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Reservei uma quadra no Kourt! ${court?.name} - ${date ? format(date, 'EEE, d MMM', { locale: ptBR }) : ''} às ${time}. Bora jogar?`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleAddToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(
          (cal: Calendar.Calendar) => cal.allowsModifications && cal.source.name === 'iCloud'
        ) || calendars[0];

        if (defaultCalendar && date) {
          const startDate = new Date(date);
          const [hours, minutes] = (time || '18:00').split(':').map(Number);
          startDate.setHours(hours, minutes, 0);

          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + (duration || 1));

          await Calendar.createEventAsync(defaultCalendar.id, {
            title: `Beach Tennis - ${court?.name}`,
            startDate,
            endDate,
            location: court?.address,
            notes: 'Reserva feita pelo Kourt',
          });

          alert('Evento adicionado ao calendário!');
        }
      }
    } catch (error) {
      console.log('Calendar error:', error);
    }
  };

  const calculateEndTime = (startTime: string, hours: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const endHour = h + hours;
    return `${endHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const totalPrice = (court?.price_per_hour || 180) * (duration || 1);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Close Button */}
      <View className="px-5 pt-4 flex-row justify-end">
        <Pressable
          onPress={handleGoHome}
          className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
        >
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
        <Animated.View entering={FadeIn.delay(400).duration(400)} className="items-center">
          <Text className="text-2xl font-bold text-black text-center mb-2">
            Reserva Confirmada!
          </Text>
          <Text className="text-neutral-500 text-center">
            Enviamos a confirmação para seu e-mail.
          </Text>
        </Animated.View>

        {/* Booking Card */}
        <Animated.View
          entering={FadeIn.delay(600).duration(400)}
          className="w-full bg-white border border-neutral-200 rounded-2xl p-5 mt-8"
        >
          {/* Court Info */}
          <View className="flex-row items-center gap-4 mb-4 pb-4 border-b border-neutral-100">
            <View className="w-16 h-16 bg-neutral-100 rounded-xl items-center justify-center">
              <MaterialIcons name="sports-tennis" size={28} color="#A3A3A3" />
            </View>
            <View>
              <Text className="font-bold text-black text-lg">
                {court?.name || 'Arena BeachPremium'}
              </Text>
              <Text className="text-neutral-500">
                {court?.sport || 'BeachTennis'} · Quadra 2
              </Text>
            </View>
          </View>

          {/* Details Grid */}
          <View className="flex-row mb-4">
            <View className="flex-1">
              <Text className="text-neutral-400 text-sm mb-1">Data</Text>
              <Text className="font-semibold text-black">
                {date ? format(date, 'd MMMM, yyyy', { locale: ptBR }) : '9 Dezembro, 2024'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-neutral-400 text-sm mb-1">Horário</Text>
              <Text className="font-semibold text-black">
                {time ? `${time} - ${calculateEndTime(time, duration || 1)}` : '18:00 - 19:00'}
              </Text>
            </View>
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1">
              <Text className="text-neutral-400 text-sm mb-1">Localização</Text>
              <Text className="font-semibold text-black" numberOfLines={2}>
                {court?.address || 'Rua Augusta, 1200\nMoema, São Paulo'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-neutral-400 text-sm mb-1">Duração</Text>
              <Text className="font-semibold text-black">{duration || 1} hora</Text>
            </View>
          </View>

          {/* Total */}
          <View className="flex-row items-center justify-between pt-4 border-t border-neutral-100">
            <Text className="text-neutral-500">Total pago</Text>
            <Text className="text-2xl font-bold text-black">
              R$ {totalPrice.toFixed(2)}
            </Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          entering={FadeIn.delay(800).duration(400)}
          className="w-full mt-6 gap-3"
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleAddToCalendar}
              className="flex-1 py-4 bg-black rounded-full flex-row items-center justify-center gap-2"
            >
              <MaterialIcons name="event" size={20} color="#fff" />
              <Text className="text-white font-semibold">Adicionar ao Calendário</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              className="w-14 h-14 border border-neutral-200 rounded-full items-center justify-center"
            >
              <MaterialIcons name="share" size={22} color="#000" />
            </TouchableOpacity>
          </View>

          <Pressable onPress={handleViewBookings}>
            <Text className="text-center text-neutral-500 font-medium py-4">
              Ver minhas reservas
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
