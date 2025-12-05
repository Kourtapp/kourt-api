import { useState, useEffect } from 'react';
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
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useBookingDetail } from '@/hooks';
import { stripeService } from '@/lib/stripe';

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { booking, loading: bookingLoading } = useBookingDetail(bookingId);
  const { confirmPayment } = useStripe();

  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const court = booking?.court as any;

  // Create PaymentIntent when booking loads
  useEffect(() => {
    if (booking && booking.total_price > 0 && !clientSecret) {
      createPaymentIntent();
    }
  }, [booking]);

  const createPaymentIntent = async () => {
    if (!booking) return;

    try {
      const amountInCents = Math.round(booking.total_price * 100);
      const { clientSecret: secret, paymentIntentId: intentId } =
        await stripeService.createPaymentIntent({
          amount: amountInCents,
          bookingId: booking.id,
        });

      setClientSecret(secret);
      setPaymentIntentId(intentId);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao iniciar pagamento');
    }
  };

  const handlePayment = async () => {
    if (!clientSecret || !paymentIntentId || !booking) {
      Alert.alert('Erro', 'Pagamento não inicializado');
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        await stripeService.handlePaymentFailure(booking.id, error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'Succeeded') {
        await stripeService.confirmPaymentSuccess(booking.id, paymentIntentId);

        router.replace({
          pathname: '/booking/confirmed',
          params: { bookingId: booking.id },
        } as any);
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  if (bookingLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-5">
        <MaterialIcons name="error-outline" size={48} color="#A3A3A3" />
        <Text className="text-lg font-semibold text-black mt-4">
          Reserva não encontrada
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Pagamento</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View className="px-5 py-5 border-b border-neutral-100">
          <Text className="text-base font-bold text-black mb-4">
            Resumo da Reserva
          </Text>
          <View className="bg-neutral-50 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 bg-neutral-200 rounded-xl items-center justify-center">
                <MaterialIcons name="sports-tennis" size={24} color="#A3A3A3" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-black">
                  {court?.name || 'Quadra'}
                </Text>
                <Text className="text-xs text-neutral-500">
                  {court?.sport || 'Esporte'}
                </Text>
              </View>
            </View>

            <View className="h-px bg-neutral-200 my-3" />

            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-neutral-600">Data</Text>
              <Text className="text-sm font-medium text-black">
                {new Date(booking.date + 'T12:00:00').toLocaleDateString(
                  'pt-BR',
                )}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-neutral-600">Horário</Text>
              <Text className="text-sm font-medium text-black">
                {booking.start_time.slice(0, 5)} -{' '}
                {booking.end_time.slice(0, 5)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-neutral-600">Duração</Text>
              <Text className="text-sm font-medium text-black">
                {booking.duration_hours}h
              </Text>
            </View>

            <View className="h-px bg-neutral-200 my-3" />

            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-black">Total</Text>
              <Text className="text-xl font-bold text-lime-600">
                R$ {booking.total_price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className="px-5 py-5">
          <Text className="text-base font-bold text-black mb-4">
            Dados do Cartão
          </Text>

          {/* Stripe Card Input */}
          <View className="bg-neutral-50 rounded-2xl p-4">
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
                borderColor: '#E5E5E5',
                borderWidth: 1,
                borderRadius: 12,
                fontSize: 16,
                placeholderColor: '#A3A3A3',
              }}
              style={{
                width: '100%',
                height: 50,
              }}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
          </View>

          {/* Test Card Info */}
          <View className="mt-4 p-3 bg-blue-50 rounded-xl">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="info" size={16} color="#3B82F6" />
              <Text className="text-xs text-blue-600 font-medium">
                Modo de teste
              </Text>
            </View>
            <Text className="text-xs text-blue-600 mt-1">
              Use o cartão: 4242 4242 4242 4242, qualquer data futura e CVC.
            </Text>
          </View>
        </View>

        {/* Security Info */}
        <View className="px-5 py-4">
          <View className="flex-row items-center justify-center gap-2">
            <MaterialIcons name="lock" size={16} color="#737373" />
            <Text className="text-xs text-neutral-500">
              Pagamento seguro processado por Stripe
            </Text>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <Pressable
          onPress={handlePayment}
          disabled={!cardComplete || processing || !clientSecret}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${
            cardComplete && !processing && clientSecret
              ? 'bg-lime-500'
              : 'bg-neutral-300'
          }`}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons
                name="lock"
                size={20}
                color={cardComplete ? '#1a2e05' : '#fff'}
              />
              <Text
                className={`font-semibold text-[15px] ml-2 ${
                  cardComplete ? 'text-lime-950' : 'text-white'
                }`}
              >
                Pagar R$ {booking.total_price.toFixed(2)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
