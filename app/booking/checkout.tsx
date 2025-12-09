import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { useCourtDetail, useCreateBooking, useAvailableSlots } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/useBookingStore';

const durations = [
  { hours: 1, label: '1 hora' },
  { hours: 1.5, label: '1h30' },
  { hours: 2, label: '2 horas' },
];

export default function CheckoutScreen() {
  const { courtId } = useLocalSearchParams<{ courtId: string }>();
  const { user } = useAuthStore();
  const { court, loading: courtLoading, error } = useCourtDetail(courtId);
  const { createBooking, loading: bookingLoading } = useCreateBooking();
  const { setCourt, setDate, setTime, setDuration } = useBookingStore();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(1);

  // Get available slots for selected date
  const { slots, loading: slotsLoading } = useAvailableSlots(
    courtId,
    selectedDate,
  );

  // Generate next 7 days
  const availableDates = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day:
          i === 0
            ? 'Hoje'
            : i === 1
              ? 'Amanhã'
              : d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dayNum: d.getDate(),
      });
    }
    return days;
  }, []);

  // Set initial date
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0].date);
    }
  }, [availableDates, selectedDate]);

  // Generate time slots
  const timeSlots = useMemo(() => {
    const defaultSlots = [
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
    ];

    return defaultSlots.map((time) => ({
      time,
      available: slots.length === 0 || slots.includes(time),
    }));
  }, [slots]);

  if (courtLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error || !court) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-5">
        <MaterialIcons name="error-outline" size={48} color="#A3A3A3" />
        <Text className="text-lg font-semibold text-black mt-4">
          Quadra não encontrada
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-black rounded-xl"
        >
          <Text className="text-white font-medium">Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const pricePerHour = court.price_per_hour || 0;
  const totalPrice = pricePerHour * selectedDuration;

  const handleConfirm = async () => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para realizar uma reserva', [
        { text: 'Cancelar' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (!selectedTime) {
      Alert.alert('Atenção', 'Selecione um horário');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Atenção', 'Selecione uma data');
      return;
    }

    try {
      // Calculate end time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endHours = hours + selectedDuration;
      const endTime = `${String(Math.floor(endHours)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

      const booking = await createBooking({
        court_id: courtId,
        user_id: user.id,
        date: selectedDate,
        start_time: selectedTime + ':00',
        end_time: endTime,
        total_price: totalPrice,
        duration_hours: selectedDuration,
      });

      // Store booking data for confirmation screens
      setCourt(court);
      setDate(new Date(selectedDate + 'T12:00:00'));
      setTime(selectedTime);
      setDuration(selectedDuration);

      // For paid courts, redirect to payment page
      // For free courts, go directly to confirmation
      if (!court.is_free && totalPrice > 0) {
        router.push({
          pathname: '/booking/payment',
          params: { bookingId: booking.id },
        } as any);
      } else {
        router.push({
          pathname: '/booking/confirmation',
          params: { bookingId: booking.id },
        } as any);
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao realizar reserva');
    }
  };

  const loading = bookingLoading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Reservar</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Court Info */}
        <View className="px-5 py-4 border-b border-neutral-100">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-neutral-200 rounded-xl items-center justify-center">
              <MaterialIcons name="sports-tennis" size={28} color="#A3A3A3" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="font-semibold text-black">{court.name}</Text>
              <Text className="text-sm text-neutral-500">{court.sport}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MaterialIcons name="location-on" size={14} color="#737373" />
                <Text className="text-xs text-neutral-500" numberOfLines={1}>
                  {court.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View className="px-5 py-5">
          <Text className="text-base font-bold text-black mb-4">
            Escolha a data
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5 px-5"
          >
            <View className="flex-row gap-2">
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.date;
                return (
                  <Pressable
                    key={item.date}
                    onPress={() => {
                      setSelectedDate(item.date);
                      setSelectedTime(null); // Reset time when date changes
                    }}
                    className={`w-20 py-4 rounded-2xl items-center border-2 ${
                      isSelected
                        ? 'bg-black border-black'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        isSelected ? 'text-white/60' : 'text-neutral-500'
                      }`}
                    >
                      {item.day}
                    </Text>
                    <Text
                      className={`text-lg font-bold mt-0.5 ${
                        isSelected ? 'text-white' : 'text-black'
                      }`}
                    >
                      {item.dayNum}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View className="px-5 py-5 border-t border-neutral-100">
          <Text className="text-base font-bold text-black mb-4">
            Escolha o horário
          </Text>
          {slotsLoading ? (
            <View className="h-20 items-center justify-center">
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {timeSlots.map((item) => {
                const isSelected = selectedTime === item.time;
                return (
                  <Pressable
                    key={item.time}
                    onPress={() => item.available && setSelectedTime(item.time)}
                    disabled={!item.available}
                    className={`px-5 py-3 rounded-xl border-2 ${
                      isSelected
                        ? 'bg-black border-black'
                        : item.available
                          ? 'bg-white border-neutral-200'
                          : 'bg-neutral-100 border-neutral-100'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected
                          ? 'text-white'
                          : item.available
                            ? 'text-black'
                            : 'text-neutral-400'
                      }`}
                    >
                      {item.time}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Duration Selection */}
        <View className="px-5 py-5 border-t border-neutral-100">
          <Text className="text-base font-bold text-black mb-4">Duração</Text>
          <View className="flex-row gap-3">
            {durations.map((item) => {
              const isSelected = selectedDuration === item.hours;
              return (
                <Pressable
                  key={item.hours}
                  onPress={() => setSelectedDuration(item.hours)}
                  className={`flex-1 py-4 rounded-xl border-2 items-center ${
                    isSelected
                      ? 'bg-black border-black'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-black'
                    }`}
                  >
                    {item.label}
                  </Text>
                  <Text
                    className={`text-xs mt-0.5 ${
                      isSelected ? 'text-white/60' : 'text-neutral-500'
                    }`}
                  >
                    R$ {(pricePerHour * item.hours).toFixed(0)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View className="px-5 py-5 border-t border-neutral-100">
          <Text className="text-base font-bold text-black mb-4">Resumo</Text>
          <View className="bg-neutral-50 rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-neutral-600">Quadra</Text>
              <Text className="text-sm font-medium text-black">
                {court.name}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-neutral-600">Data</Text>
              <Text className="text-sm font-medium text-black">
                {availableDates.find((d) => d.date === selectedDate)?.day ||
                  '-'}
                ,{' '}
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString(
                  'pt-BR',
                )}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-neutral-600">Horário</Text>
              <Text className="text-sm font-medium text-black">
                {selectedTime || 'Não selecionado'}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-neutral-600">Duração</Text>
              <Text className="text-sm font-medium text-black">
                {durations.find((d) => d.hours === selectedDuration)?.label}
              </Text>
            </View>
            <View className="h-px bg-neutral-200 my-3" />
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-black">Total</Text>
              <Text className="text-xl font-bold text-lime-600">
                {court.is_free ? 'Gratuito' : `R$ ${totalPrice.toFixed(2)}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <Pressable
          onPress={handleConfirm}
          disabled={loading || !selectedTime}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${
            selectedTime && !loading ? 'bg-[#1a2634]' : 'bg-neutral-300'
          }`}
        >
          <Text className="font-semibold text-[15px] text-white">
            {loading
              ? 'Processando...'
              : court.is_free
                ? 'Confirmar Reserva'
                : `Confirmar R$ ${totalPrice.toFixed(2)}`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
