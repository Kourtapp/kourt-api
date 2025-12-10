import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCourtDetail, useCreateBooking } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/useBookingStore';

export default function CheckoutScreen() {
  const { id, date, time, duration, price } = useLocalSearchParams<{
    id: string;
    date: string;
    time: string;
    duration: string;
    price: string;
  }>();

  const { court, loading: courtLoading } = useCourtDetail(id);
  const { user } = useAuthStore();
  const { createBooking, loading: bookingLoading } = useCreateBooking();
  const { setCourt, setDate, setTime, setDuration } = useBookingStore();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const pricePerHour = parseFloat(price || '120');
  const durationMinutes = parseInt(duration || '60');
  const durationHours = durationMinutes / 60;
  const basePrice = pricePerHour * durationHours;
  const serviceFee = basePrice * 0.05;
  const firstBookingDiscount = 20; // First booking discount
  const totalPrice = basePrice + serviceFee - firstBookingDiscount - promoDiscount;

  const endTime = calculateEndTime(time || '18:00', durationMinutes);
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'KOURT10') {
      setPromoDiscount(basePrice * 0.1);
      setPromoApplied(true);
      Alert.alert('Cupom aplicado!', '10% de desconto');
    } else {
      Alert.alert('Cupom inválido', 'Verifique o código e tente novamente');
    }
  };

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para realizar uma reserva', [
        { text: 'Cancelar' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    try {
      const booking = await createBooking({
        court_id: id,
        user_id: user.id,
        date: date,
        start_time: time + ':00',
        end_time: endTime + ':00',
        total_price: totalPrice,
        duration_hours: durationHours,
      });

      if (court) setCourt(court);
      setDate(new Date(date + 'T12:00:00'));
      setTime(time);
      setDuration(durationHours);

      router.push({
        pathname: '/booking/payment',
        params: { bookingId: booking.id, amount: totalPrice.toString() },
      } as any);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao realizar reserva');
    }
  };

  if (courtLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black ml-4">Confirmar Reserva</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Court Card */}
          <View className="mx-5 mt-5 p-4 border border-neutral-200 rounded-2xl">
            <View className="flex-row gap-4">
              <View className="w-20 h-20 bg-neutral-100 rounded-xl items-center justify-center">
                <MaterialIcons name="sports-tennis" size={32} color="#A3A3A3" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-black text-lg">{court?.name}</Text>
                <Text className="text-neutral-500">
                  {court?.sport || 'BeachTennis'} · Quadra {(court as any)?.court_number || 2}
                </Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <MaterialIcons name="star" size={14} color="#000" />
                  <Text className="font-medium text-black">{court?.rating?.toFixed(1) || '4.8'}</Text>
                  <Text className="text-neutral-400">(124)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Booking Details */}
          <View className="mx-5 mt-4 p-4 border border-neutral-200 rounded-2xl">
            <View className="flex-row items-center justify-between py-3 border-b border-neutral-100">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="event" size={20} color="#737373" />
                <Text className="text-neutral-600">Data</Text>
              </View>
              <Text className="font-medium text-black capitalize">{formattedDate}</Text>
            </View>
            <View className="flex-row items-center justify-between py-3 border-b border-neutral-100">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="schedule" size={20} color="#737373" />
                <Text className="text-neutral-600">Horário</Text>
              </View>
              <Text className="font-medium text-black">{time} - {endTime}</Text>
            </View>
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="timer" size={20} color="#737373" />
                <Text className="text-neutral-600">Duração</Text>
              </View>
              <Text className="font-medium text-black">
                {durationHours >= 1 ? `${Math.floor(durationHours)}h` : ''}
                {durationMinutes % 60 > 0 ? ` ${durationMinutes % 60}min` : ''}
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          <View className="mx-5 mt-4 p-4 border border-neutral-200 rounded-2xl">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-bold text-black">Pagamento</Text>
              <TouchableOpacity onPress={() => router.push('/booking/payment-methods' as any)}>
                <Text className="text-neutral-500 underline">Alterar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/booking/payment-methods' as any)}
              className="flex-row items-center gap-3 py-2"
            >
              <View className="w-12 h-8 bg-blue-600 rounded items-center justify-center">
                <Text className="text-white font-bold text-xs">VISA</Text>
              </View>
              <View className="flex-1">
                <Text className="text-black">•••• •••• •••• 4532</Text>
                <Text className="text-neutral-500 text-sm">Vencimento 12/26</Text>
              </View>
              <MaterialIcons name="check-circle" size={24} color="#22C55E" />
            </TouchableOpacity>
          </View>

          {/* Promo Code */}
          <View className="mx-5 mt-4 p-4 border border-neutral-200 rounded-2xl">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="confirmation-number" size={24} color="#A3A3A3" />
              <TextInput
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Código promocional"
                placeholderTextColor="#A3A3A3"
                className="flex-1 py-2 text-black"
                editable={!promoApplied}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                onPress={handleApplyPromo}
                disabled={promoApplied || !promoCode}
                className={`px-4 py-2 rounded-lg ${
                  promoApplied ? 'bg-green-100' : 'bg-neutral-100'
                }`}
              >
                <Text className={promoApplied ? 'text-green-700 font-medium' : 'text-black font-medium'}>
                  {promoApplied ? 'Aplicado' : 'Aplicar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Summary */}
          <View className="mx-5 mt-4 p-4 border border-neutral-200 rounded-2xl">
            <Text className="font-bold text-black mb-4">Resumo</Text>

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-neutral-600">
                {durationHours >= 1 ? `${Math.floor(durationHours)}h` : ''}
                {durationMinutes % 60 > 0 ? ` ${durationMinutes % 60}min` : ''} × R$ {pricePerHour.toFixed(0)}/hora
              </Text>
              <Text className="text-black">R$ {basePrice.toFixed(2)}</Text>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-neutral-600">Taxa de serviço</Text>
              <Text className="text-black">R$ {serviceFee.toFixed(2)}</Text>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-green-600">Desconto primeira reserva</Text>
              <Text className="text-green-600">-R$ {firstBookingDiscount.toFixed(2)}</Text>
            </View>

            {promoApplied && promoDiscount > 0 && (
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-green-600">Cupom promocional</Text>
                <Text className="text-green-600">-R$ {promoDiscount.toFixed(2)}</Text>
              </View>
            )}

            <View className="h-px bg-neutral-200 my-3" />

            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-black text-lg">Total</Text>
              <Text className="font-bold text-black text-2xl">R$ {totalPrice.toFixed(2)}</Text>
            </View>
          </View>

          {/* Cancellation Policy */}
          <View className="mx-5 mt-4 p-4 bg-neutral-50 rounded-2xl">
            <View className="flex-row items-start gap-3">
              <MaterialIcons name="info-outline" size={20} color="#737373" />
              <View className="flex-1">
                <Text className="font-medium text-black mb-1">Política de cancelamento</Text>
                <Text className="text-neutral-500 text-sm leading-5">
                  Cancelamento gratuito até 24h antes. Após esse período, será cobrado 50% do valor.
                </Text>
              </View>
            </View>
          </View>

          <View className="h-32" />
        </ScrollView>

        {/* Bottom CTA */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
          <TouchableOpacity
            onPress={handlePayment}
            disabled={bookingLoading}
            className="w-full py-4 rounded-full flex-row items-center justify-center gap-2"
            style={{ backgroundColor: '#84CC16' }}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <MaterialIcons name="lock" size={20} color="#000" />
                <Text className="font-bold text-black text-lg">
                  Pagar R$ {totalPrice.toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text className="text-center text-neutral-400 text-sm mt-2">
            Pagamento seguro com criptografia SSL
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}
