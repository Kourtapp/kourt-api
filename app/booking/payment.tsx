import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useBookingDetail } from '@/hooks';
import { stripeService } from '@/lib/stripe';

type PaymentMethod = 'card' | 'pix' | 'boleto';

const SAVED_CARDS = [
  { id: '1', last4: '4589', brand: 'Nubank', expiry: '12/28' },
  { id: '2', last4: '1234', brand: 'Itaú', expiry: '06/26' },
];

export default function PaymentScreen() {
  const { bookingId, amount } = useLocalSearchParams<{ bookingId: string; amount?: string }>();
  const { booking, loading: bookingLoading } = useBookingDetail(bookingId);
  const { confirmPayment } = useStripe();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [useNewCard, setUseNewCard] = useState(true);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixExpiry, setPixExpiry] = useState<number>(15 * 60); // 15 minutes

  const court = booking?.court as any;
  const totalPrice = amount ? parseFloat(amount) : (booking?.total_price || 0);

  // Create PaymentIntent when booking loads
  useEffect(() => {
    if (booking && totalPrice > 0 && !clientSecret && paymentMethod === 'card') {
      createPaymentIntent();
    }
  }, [booking, paymentMethod]);

  // PIX timer
  useEffect(() => {
    if (paymentMethod === 'pix' && pixExpiry > 0) {
      const timer = setInterval(() => {
        setPixExpiry((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentMethod, pixExpiry]);

  const createPaymentIntent = async () => {
    if (!booking) return;

    try {
      const amountInCents = Math.round(totalPrice * 100);
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
    if (paymentMethod === 'pix') {
      // Simulate PIX payment
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        router.replace({
          pathname: '/booking/confirmed',
          params: { bookingId: booking?.id },
        } as any);
      }, 2000);
      return;
    }

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

  const generatePixCode = () => {
    // Generate a mock PIX code
    setPixCode('00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266141740000211Kourt5204000053039865802BR5913KOURT SPORTS6008SAOPAULO62070503***6304ABCD');
    setPixExpiry(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyPixCode = () => {
    // In real app, use Clipboard
    Alert.alert('Copiado!', 'Código Pix copiado para a área de transferência');
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
        <View className="flex-row items-center gap-1">
          <MaterialIcons name="lock" size={16} color="#22C55E" />
          <Text className="text-xs text-green-600">Seguro</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Payment Method Selection */}
        <View className="px-5 py-5">
          <Text className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">
            Forma de Pagamento
          </Text>

          {/* Card Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('card')}
            className={`flex-row items-center p-4 rounded-2xl border-2 mb-3 ${
              paymentMethod === 'card' ? 'border-black bg-neutral-50' : 'border-neutral-200'
            }`}
          >
            <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
              paymentMethod === 'card' ? 'border-black bg-black' : 'border-neutral-300'
            }`}>
              {paymentMethod === 'card' && (
                <View className="w-2.5 h-2.5 bg-white rounded-full" />
              )}
            </View>
            <MaterialIcons name="credit-card" size={24} color="#000" />
            <Text className="flex-1 ml-3 font-medium text-black">Cartão de Crédito</Text>
          </TouchableOpacity>

          {/* PIX Option */}
          <TouchableOpacity
            onPress={() => {
              setPaymentMethod('pix');
              if (!pixCode) generatePixCode();
            }}
            className={`flex-row items-center p-4 rounded-2xl border-2 mb-3 ${
              paymentMethod === 'pix' ? 'border-black bg-neutral-50' : 'border-neutral-200'
            }`}
          >
            <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
              paymentMethod === 'pix' ? 'border-black bg-black' : 'border-neutral-300'
            }`}>
              {paymentMethod === 'pix' && (
                <View className="w-2.5 h-2.5 bg-white rounded-full" />
              )}
            </View>
            <MaterialIcons name="qr-code" size={24} color="#000" />
            <Text className="flex-1 ml-3 font-medium text-black">Pix</Text>
            <View className="bg-green-100 px-2 py-1 rounded">
              <Text className="text-xs text-green-700 font-medium">Instantâneo</Text>
            </View>
          </TouchableOpacity>

          {/* Boleto Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('boleto')}
            className={`flex-row items-center p-4 rounded-2xl border-2 ${
              paymentMethod === 'boleto' ? 'border-black bg-neutral-50' : 'border-neutral-200'
            }`}
          >
            <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
              paymentMethod === 'boleto' ? 'border-black bg-black' : 'border-neutral-300'
            }`}>
              {paymentMethod === 'boleto' && (
                <View className="w-2.5 h-2.5 bg-white rounded-full" />
              )}
            </View>
            <MaterialIcons name="receipt" size={24} color="#000" />
            <Text className="flex-1 ml-3 font-medium text-black">Boleto Bancário</Text>
            <Text className="text-xs text-neutral-500">até 3 dias úteis</Text>
          </TouchableOpacity>
        </View>

        {/* Card Details */}
        {paymentMethod === 'card' && (
          <View className="px-5 py-4 border-t border-neutral-100">
            {/* Saved Cards */}
            {SAVED_CARDS.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">
                  Cartões Salvos
                </Text>
                {SAVED_CARDS.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    onPress={() => {
                      setSelectedCard(card.id);
                      setUseNewCard(false);
                    }}
                    className={`flex-row items-center p-4 rounded-xl border mb-2 ${
                      selectedCard === card.id && !useNewCard
                        ? 'border-black bg-neutral-50'
                        : 'border-neutral-200'
                    }`}
                  >
                    <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                      selectedCard === card.id && !useNewCard ? 'border-black bg-black' : 'border-neutral-300'
                    }`}>
                      {selectedCard === card.id && !useNewCard && (
                        <View className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </View>
                    <MaterialIcons name="credit-card" size={20} color="#737373" />
                    <Text className="flex-1 ml-3 text-black">•••• {card.last4} ({card.brand})</Text>
                    <Text className="text-neutral-500 text-sm">Venc: {card.expiry}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => {
                    setUseNewCard(true);
                    setSelectedCard(null);
                  }}
                  className={`flex-row items-center p-4 rounded-xl border ${
                    useNewCard ? 'border-black bg-neutral-50' : 'border-neutral-200'
                  }`}
                >
                  <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                    useNewCard ? 'border-black bg-black' : 'border-neutral-300'
                  }`}>
                    {useNewCard && <View className="w-2 h-2 bg-white rounded-full" />}
                  </View>
                  <MaterialIcons name="add" size={20} color="#737373" />
                  <Text className="flex-1 ml-3 text-black">Adicionar novo cartão</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* New Card Input */}
            {useNewCard && (
              <View>
                <Text className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">
                  Dados do Cartão
                </Text>
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
                    Use: 4242 4242 4242 4242, data futura, qualquer CVC
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* PIX Payment */}
        {paymentMethod === 'pix' && pixCode && (
          <View className="px-5 py-4 border-t border-neutral-100">
            <Text className="text-center text-neutral-600 mb-4">
              Escaneie o QR Code ou copie o código
            </Text>

            {/* QR Code Placeholder */}
            <View className="items-center mb-6">
              <View className="w-48 h-48 bg-neutral-100 rounded-2xl items-center justify-center border-2 border-dashed border-neutral-300">
                <MaterialIcons name="qr-code-2" size={120} color="#737373" />
              </View>
            </View>

            {/* PIX Code */}
            <View className="bg-neutral-100 rounded-xl p-4 mb-4">
              <Text className="text-xs text-neutral-500 mb-2">Pix Copia e Cola</Text>
              <View className="flex-row items-center">
                <Text className="flex-1 text-sm text-black" numberOfLines={1}>
                  {pixCode.slice(0, 40)}...
                </Text>
                <TouchableOpacity
                  onPress={copyPixCode}
                  className="bg-black px-4 py-2 rounded-lg ml-2"
                >
                  <Text className="text-white font-medium text-sm">Copiar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Timer */}
            <View className="items-center">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="timer" size={18} color="#F59E0B" />
                <Text className="text-amber-600 font-medium">
                  Expira em {formatTime(pixExpiry)}
                </Text>
              </View>
              <Text className="text-neutral-500 text-sm mt-2">
                Valor: R$ {totalPrice.toFixed(2)}
              </Text>
            </View>

            {/* Waiting indicator */}
            <View className="mt-6 items-center">
              <Text className="text-neutral-600 mb-3">Aguardando pagamento...</Text>
              <View className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                <View className="h-full bg-green-500 rounded-full w-1/3" />
              </View>
              <Text className="text-xs text-neutral-500 mt-2">
                O pagamento será confirmado automaticamente
              </Text>
            </View>
          </View>
        )}

        {/* Boleto */}
        {paymentMethod === 'boleto' && (
          <View className="px-5 py-4 border-t border-neutral-100">
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <MaterialIcons name="info" size={18} color="#D97706" />
                <Text className="font-medium text-amber-800">Importante</Text>
              </View>
              <Text className="text-amber-700 text-sm">
                O boleto pode levar até 3 dias úteis para compensar. Sua reserva só será
                confirmada após a confirmação do pagamento.
              </Text>
            </View>
          </View>
        )}

        {/* Security Info */}
        <View className="px-5 py-4">
          <View className="flex-row items-center justify-center gap-2">
            <MaterialIcons name="lock" size={16} color="#22C55E" />
            <Text className="text-xs text-neutral-500">
              Pagamento seguro processado por Stripe
            </Text>
          </View>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-neutral-500">Total</Text>
          <Text className="text-xl font-bold text-black">R$ {totalPrice.toFixed(2)}</Text>
        </View>
        <Pressable
          onPress={handlePayment}
          disabled={
            (paymentMethod === 'card' && !cardComplete && useNewCard && !selectedCard) ||
            processing
          }
          className={`w-full py-4 rounded-full flex-row items-center justify-center ${
            processing ? 'bg-neutral-300' : 'bg-black'
          }`}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="lock" size={18} color="#fff" />
              <Text className="font-bold text-white ml-2">
                {paymentMethod === 'pix'
                  ? 'Já fiz o pagamento'
                  : `Pagar R$ ${totalPrice.toFixed(2)}`}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
