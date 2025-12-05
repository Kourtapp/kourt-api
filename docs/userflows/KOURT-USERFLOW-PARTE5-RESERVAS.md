# 🎯 KOURT APP - USERFLOW COMPLETO
## PARTE 5: Fluxo de Reserva e Checkout

---

# 10. DETALHES DA QUADRA (`/court/[id]`)

## 10.1 LAYOUT COMPLETO

```
┌─────────────────────────────────────┐
│           9:41        📶 📡 🔋      │
├─────────────────────────────────────┤
│  ←                          ♡  ⋮   │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      [FOTO DA QUADRA]       │   │
│  │                             │   │
│  │  1/5  ●○○○○                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  Arena Beach Tennis                 │
│  ⭐ 4.8 (127 avaliações)           │
│                                     │
│  📍 Av. Ibirapuera, 1234           │
│     São Paulo, SP · 2.5 km          │
│                                     │
├─────────────────────────────────────┤
│  Sobre                              │
│  Quadra de beach tennis coberta    │
│  com areia de alta qualidade...    │
│  Ver mais                           │
├─────────────────────────────────────┤
│  Comodidades                        │
│  [🚿Vestiário] [🅿️Estacion.]       │
│  [💡Iluminação] [🪑Arquibancada]   │
│  [🍺Bar] [📶WiFi]                  │
├─────────────────────────────────────┤
│  Horários disponíveis               │
│  ← Ter, 26 Nov →                   │
│                                     │
│  [08:00] [09:00] [10:00]           │
│  [11:00] [●14:00] [15:00]          │
│  [16:00] [17:00] [18:00]           │
│  [19:00] [20:00] [21:00]           │
├─────────────────────────────────────┤
│  Avaliações            Ver todas →  │
│  ┌─────────────────────────────┐   │
│  │ 👤 Pedro · ⭐⭐⭐⭐⭐        │   │
│  │ "Excelente quadra!"         │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Localização                        │
│  [────────MAPA────────]            │
│  📍 Como chegar                     │
├─────────────────────────────────────┤
│  Regras da quadra                   │
│  • Uso obrigatório de tênis...     │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │  R$ 80/h      [RESERVAR]    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 10.2 ELEMENTOS E FUNÇÕES

| Elemento | Tipo | Ação | Navegação/API |
|----------|------|------|---------------|
| **Botão Voltar (←)** | Pressable | Voltar | `router.back()` |
| **Botão Favorito (♡)** | Pressable | Favoritar | `toggleFavorite(courtId)` |
| **Botão Menu (⋮)** | Pressable | Abrir menu | ActionSheet: Compartilhar, Reportar |
| **Galeria de Fotos** | FlatList horizontal | Ver foto | Swipe ou tap abre galeria fullscreen |
| **Indicador 1/5** | View | - | `currentIndex + 1 / total` |
| **Nome da Quadra** | Text | - | `court.name` |
| **Rating** | Pressable | Ver avaliações | `router.push('/court/[id]/reviews')` |
| **Endereço** | Pressable | Abrir mapa | `openMaps(court.latitude, court.longitude)` |
| **Ver mais (descrição)** | Pressable | Expandir | `setExpanded(!expanded)` |
| **Comodidade** | View | - | Ícone + label |
| **Seta Data (← →)** | Pressable | Mudar dia | `setSelectedDate(date ± 1)` |
| **Time Slot** | Pressable | Selecionar horário | `setSelectedTime(time)` |
| **Time Slot Selecionado** | View | - | `bg-black text-white` |
| **Time Slot Indisponível** | View | - | `bg-neutral-100 text-neutral-300` (disabled) |
| **Avaliação Card** | Pressable | Ver todas | `router.push('/court/[id]/reviews')` |
| **Mapa** | MapView | - | Mostra localização |
| **Como chegar** | Pressable | Abrir navegação | `openMaps()` |
| **Botão RESERVAR** | Button | Checkout | `router.push('/booking/checkout')` |

## 10.3 CÓDIGO COMPLETO

```typescript
// app/court/[id].tsx
import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useCourtStore } from '@/stores/useCourtStore';
import { useBookingStore } from '@/stores/useBookingStore';
import { supabase } from '@/services/supabase';

const { width } = Dimensions.get('window');

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const { setBookingCourt, setBookingDate, setBookingTime } = useBookingStore();

  useEffect(() => {
    fetchCourt();
  }, [id]);

  useEffect(() => {
    if (court) {
      fetchAvailableSlots();
    }
  }, [court, selectedDate]);

  const fetchCourt = async () => {
    const { data, error } = await supabase
      .from('courts')
      .select(`
        *,
        reviews (
          id,
          rating,
          comment,
          created_at,
          user:profiles (name, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (data) {
      setCourt(data);
    }
    setLoading(false);
  };

  const fetchAvailableSlots = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Buscar reservas existentes
    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time')
      .eq('court_id', id)
      .eq('date', dateStr)
      .in('status', ['pending', 'confirmed']);

    const bookedTimes = bookings?.map(b => b.start_time) || [];

    // Gerar slots disponíveis
    const slots: string[] = [];
    const openingHour = parseInt(court.opening_time.split(':')[0]);
    const closingHour = parseInt(court.closing_time.split(':')[0]);

    for (let hour = openingHour; hour < closingHour; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      if (!bookedTimes.includes(timeStr)) {
        slots.push(timeStr);
      }
    }

    setAvailableSlots(slots);
  };

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    // API call para salvar favorito
  };

  const handleReserve = () => {
    if (!selectedTime) {
      Alert.alert('Atenção', 'Selecione um horário');
      return;
    }

    setBookingCourt(court);
    setBookingDate(selectedDate);
    setBookingTime(selectedTime);
    router.push('/booking/checkout');
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${court.latitude},${court.longitude}`;
    Linking.openURL(url);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header com Galeria */}
        <View className="relative">
          {/* Galeria de Fotos */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {court.images.map((image, index) => (
              <Pressable
                key={index}
                onPress={() => router.push(`/court/${id}/gallery?index=${index}`)}
              >
                <Image
                  source={{ uri: image }}
                  style={{ width, height: 280 }}
                  className="bg-neutral-200"
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* Overlay Header */}
          <View className="absolute top-12 left-0 right-0 px-4 flex-row justify-between">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow"
            >
              <MaterialIcons name="arrow-back" size={20} color="#000" />
            </Pressable>

            <View className="flex-row gap-2">
              <Pressable
                onPress={toggleFavorite}
                className="w-10 h-10 bg-white rounded-full items-center justify-center shadow"
              >
                <MaterialIcons
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={20}
                  color={isFavorite ? '#EF4444' : '#000'}
                />
              </Pressable>
              <Pressable
                onPress={() => {/* ActionSheet */}}
                className="w-10 h-10 bg-white rounded-full items-center justify-center shadow"
              >
                <MaterialIcons name="more-vert" size={20} color="#000" />
              </Pressable>
            </View>
          </View>

          {/* Indicador de Fotos */}
          <View className="absolute bottom-4 left-4 px-2 py-1 bg-black/60 rounded-full">
            <Text className="text-white text-xs font-medium">
              {currentImageIndex + 1}/{court.images.length}
            </Text>
          </View>

          {/* Dots */}
          <View className="absolute bottom-4 right-0 left-0 flex-row justify-center gap-1">
            {court.images.map((_, index) => (
              <View
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Conteúdo */}
        <View className="px-5 py-4">
          {/* Título e Rating */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-black mb-2">
              {court.name}
            </Text>
            <Pressable
              onPress={() => router.push(`/court/${id}/reviews`)}
              className="flex-row items-center gap-1"
            >
              <MaterialIcons name="star" size={16} color="#000" />
              <Text className="text-sm font-medium text-black">
                {court.rating}
              </Text>
              <Text className="text-sm text-neutral-500">
                ({court.total_reviews} avaliações)
              </Text>
            </Pressable>
          </View>

          {/* Localização */}
          <Pressable
            onPress={openMaps}
            className="flex-row items-start gap-3 mb-6"
          >
            <MaterialIcons name="location-on" size={20} color="#737373" />
            <View className="flex-1">
              <Text className="text-sm text-black">{court.address}</Text>
              <Text className="text-sm text-neutral-500">
                {court.city}, {court.state} · 2.5 km
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
          </Pressable>

          {/* Sobre */}
          <View className="mb-6">
            <Text className="text-base font-bold text-black mb-2">Sobre</Text>
            <Text
              className="text-sm text-neutral-600 leading-5"
              numberOfLines={descriptionExpanded ? undefined : 3}
            >
              {court.description}
            </Text>
            {court.description?.length > 150 && (
              <Pressable onPress={() => setDescriptionExpanded(!descriptionExpanded)}>
                <Text className="text-sm text-black font-medium mt-1">
                  {descriptionExpanded ? 'Ver menos' : 'Ver mais'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Comodidades */}
          <View className="mb-6">
            <Text className="text-base font-bold text-black mb-3">Comodidades</Text>
            <View className="flex-row flex-wrap gap-2">
              {court.amenities.map((amenity) => (
                <View
                  key={amenity}
                  className="flex-row items-center gap-1.5 px-3 py-2 bg-neutral-100 rounded-lg"
                >
                  <MaterialIcons
                    name={amenityIcons[amenity] || 'check'}
                    size={16}
                    color="#525252"
                  />
                  <Text className="text-xs text-neutral-700">{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Horários */}
          <View className="mb-6">
            <Text className="text-base font-bold text-black mb-3">
              Horários disponíveis
            </Text>

            {/* Date Selector */}
            <View className="flex-row items-center justify-between mb-4">
              <Pressable
                onPress={() => setSelectedDate(subDays(selectedDate, 1))}
                className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
              >
                <MaterialIcons name="chevron-left" size={24} color="#000" />
              </Pressable>

              <Text className="text-sm font-medium text-black">
                {format(selectedDate, "EEE, d 'de' MMM", { locale: ptBR })}
              </Text>

              <Pressable
                onPress={() => setSelectedDate(addDays(selectedDate, 1))}
                className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
              >
                <MaterialIcons name="chevron-right" size={24} color="#000" />
              </Pressable>
            </View>

            {/* Time Slots Grid */}
            <View className="flex-row flex-wrap gap-2">
              {generateTimeSlots(court.opening_time, court.closing_time).map((time) => {
                const isAvailable = availableSlots.includes(time);
                const isSelected = selectedTime === time;

                return (
                  <Pressable
                    key={time}
                    onPress={() => isAvailable && setSelectedTime(time)}
                    disabled={!isAvailable}
                    className={`w-[72px] py-3 rounded-xl items-center ${
                      isSelected
                        ? 'bg-black'
                        : isAvailable
                        ? 'bg-white border border-neutral-200'
                        : 'bg-neutral-100'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected
                          ? 'text-white'
                          : isAvailable
                          ? 'text-black'
                          : 'text-neutral-300'
                      }`}
                    >
                      {time}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Avaliações Preview */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-black">Avaliações</Text>
              <Pressable onPress={() => router.push(`/court/${id}/reviews`)}>
                <Text className="text-sm text-neutral-500">Ver todas</Text>
              </Pressable>
            </View>

            {court.reviews?.slice(0, 2).map((review) => (
              <View
                key={review.id}
                className="bg-neutral-50 rounded-xl p-4 mb-2"
              >
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="w-10 h-10 bg-neutral-300 rounded-full" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-black">
                      {review.user.name}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MaterialIcons
                          key={i}
                          name="star"
                          size={12}
                          color={i < review.rating ? '#000' : '#E5E5E5'}
                        />
                      ))}
                    </View>
                  </View>
                </View>
                <Text className="text-sm text-neutral-600">{review.comment}</Text>
              </View>
            ))}
          </View>

          {/* Mapa */}
          <View className="mb-6">
            <Text className="text-base font-bold text-black mb-3">Localização</Text>
            <View className="h-40 rounded-2xl overflow-hidden mb-2">
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: court.latitude,
                  longitude: court.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: court.latitude,
                    longitude: court.longitude,
                  }}
                />
              </MapView>
            </View>
            <Pressable
              onPress={openMaps}
              className="flex-row items-center gap-2"
            >
              <MaterialIcons name="directions" size={18} color="#000" />
              <Text className="text-sm font-medium text-black">Como chegar</Text>
            </Pressable>
          </View>

          {/* Regras */}
          {court.rules && (
            <View className="mb-6">
              <Text className="text-base font-bold text-black mb-3">
                Regras da quadra
              </Text>
              <Text className="text-sm text-neutral-600 leading-5">
                {court.rules}
              </Text>
            </View>
          )}

          {/* Espaço para footer */}
          <View className="h-24" />
        </View>
      </ScrollView>

      {/* Footer Fixo */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-black">
              {court.is_free ? 'Gratuita' : `R$ ${court.price_per_hour}`}
            </Text>
            {!court.is_free && (
              <Text className="text-sm text-neutral-500">por hora</Text>
            )}
          </View>

          <Pressable
            onPress={handleReserve}
            disabled={!selectedTime}
            className={`px-8 py-4 rounded-2xl ${
              selectedTime ? 'bg-black' : 'bg-neutral-300'
            }`}
          >
            <Text className="text-white font-semibold text-[15px]">
              Reservar
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// Helper: Ícones das comodidades
const amenityIcons: Record<string, string> = {
  'Vestiário': 'shower',
  'Estacionamento': 'local-parking',
  'Iluminação': 'lightbulb',
  'Arquibancada': 'event-seat',
  'Bar': 'local-bar',
  'WiFi': 'wifi',
  'Bola': 'sports-tennis',
  'Raquete': 'sports-tennis',
};

// Helper: Gerar slots de horário
const generateTimeSlots = (opening: string, closing: string): string[] => {
  const slots: string[] = [];
  const openHour = parseInt(opening.split(':')[0]);
  const closeHour = parseInt(closing.split(':')[0]);

  for (let hour = openHour; hour < closeHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  return slots;
};
```

---

# 11. CHECKOUT (`/booking/checkout`)

## 11.1 LAYOUT

```
┌─────────────────────────────────────┐
│  ←  Checkout                        │
├─────────────────────────────────────┤
│                                     │
│  Sua reserva                        │
│  ┌─────────────────────────────┐   │
│  │ [img] Arena Beach Tennis    │   │
│  │       📅 Ter, 26 Nov        │   │
│  │       🕐 14:00 - 15:00      │   │
│  │       ⏱️ 1 hora             │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  Pagamento                          │
│  ┌─────────────────────────────┐   │
│  │ 💳 •••• 4242           →    │   │
│  │    Mastercard               │   │
│  └─────────────────────────────┘   │
│                                     │
│  + Adicionar cupom                  │
│                                     │
├─────────────────────────────────────┤
│  Resumo                             │
│  1h de quadra          R$ 80,00    │
│  Taxa de serviço        R$ 8,00    │
│  ──────────────────────────────    │
│  Total                 R$ 88,00    │
│                                     │
├─────────────────────────────────────┤
│  Política de cancelamento           │
│  Cancelamento grátis até 24h       │
│  antes da reserva.                  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │    CONFIRMAR E PAGAR        │   │
│  │        R$ 88,00             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 11.2 ELEMENTOS E FUNÇÕES

| Elemento | Ação | API/Função |
|----------|------|------------|
| **Card da Reserva** | - | Display: court, date, time |
| **Método de Pagamento** | Pressable | `router.push('/booking/payment-method')` |
| **Adicionar cupom** | Pressable | Modal input cupom → `validateCoupon(code)` |
| **Botão Confirmar** | Button | `createBooking()` → `processPayment()` → redirect |

## 11.3 CÓDIGO

```typescript
// app/booking/checkout.tsx
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useBookingStore } from '@/stores/useBookingStore';
import { usePaymentStore } from '@/stores/usePaymentStore';
import { createBooking, processPayment } from '@/services/bookings';

export default function CheckoutScreen() {
  const { court, date, time, duration } = useBookingStore();
  const { selectedCard } = usePaymentStore();
  
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = court?.price_per_hour * duration;
  const serviceFee = subtotal * 0.1; // 10%
  const total = subtotal + serviceFee - discount;

  const handleConfirm = async () => {
    if (!selectedCard) {
      Alert.alert('Atenção', 'Selecione um método de pagamento');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar reserva
      const booking = await createBooking({
        court_id: court.id,
        date: format(date, 'yyyy-MM-dd'),
        start_time: time,
        duration_hours: duration,
        total_price: total,
      });

      // 2. Processar pagamento
      const payment = await processPayment({
        booking_id: booking.id,
        amount: total,
        payment_method_id: selectedCard.id,
      });

      if (payment.status === 'succeeded') {
        // 3. Redirecionar para confirmação
        router.replace({
          pathname: '/booking/confirmed',
          params: { bookingId: booking.id },
        });
      } else {
        Alert.alert('Erro', 'Falha no pagamento. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    // Validar cupom
    const result = await validateCoupon(couponCode);
    if (result.valid) {
      setDiscount(result.discount);
      Alert.alert('Sucesso', `Desconto de R$ ${result.discount} aplicado!`);
    } else {
      Alert.alert('Erro', 'Cupom inválido');
    }
  };

  return (
    <View className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 flex-row items-center gap-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Checkout</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Resumo da Reserva */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-neutral-500 mb-3">
            Sua reserva
          </Text>
          <View className="bg-white border border-neutral-200 rounded-2xl p-4 flex-row gap-4">
            <Image
              source={{ uri: court?.cover_image }}
              className="w-20 h-20 rounded-xl bg-neutral-200"
            />
            <View className="flex-1">
              <Text className="font-semibold text-black mb-2">{court?.name}</Text>
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="event" size={14} color="#737373" />
                <Text className="text-sm text-neutral-600">
                  {format(date, "EEE, d 'de' MMM", { locale: ptBR })}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="schedule" size={14} color="#737373" />
                <Text className="text-sm text-neutral-600">
                  {time} - {calculateEndTime(time, duration)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="timer" size={14} color="#737373" />
                <Text className="text-sm text-neutral-600">
                  {duration} hora{duration > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pagamento */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-neutral-500 mb-3">
            Pagamento
          </Text>
          <Pressable
            onPress={() => router.push('/booking/payment-method')}
            className="bg-white border border-neutral-200 rounded-2xl p-4 flex-row items-center"
          >
            {selectedCard ? (
              <>
                <View className="w-10 h-10 bg-neutral-100 rounded-lg items-center justify-center">
                  <MaterialIcons name="credit-card" size={20} color="#000" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="font-medium text-black">
                    •••• {selectedCard.last4}
                  </Text>
                  <Text className="text-sm text-neutral-500">
                    {selectedCard.brand}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View className="w-10 h-10 bg-neutral-100 rounded-lg items-center justify-center">
                  <MaterialIcons name="add" size={20} color="#000" />
                </View>
                <Text className="flex-1 ml-3 text-neutral-500">
                  Adicionar método de pagamento
                </Text>
              </>
            )}
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>

          {/* Cupom */}
          <Pressable
            onPress={() => {/* Modal de cupom */}}
            className="flex-row items-center gap-2 mt-3"
          >
            <MaterialIcons name="local-offer" size={18} color="#737373" />
            <Text className="text-sm text-neutral-600">Adicionar cupom</Text>
          </Pressable>
        </View>

        {/* Resumo de Valores */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-neutral-500 mb-3">
            Resumo
          </Text>
          <View className="bg-white border border-neutral-200 rounded-2xl p-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-neutral-600">
                {duration}h de quadra
              </Text>
              <Text className="text-sm text-black">
                R$ {subtotal.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-neutral-600">Taxa de serviço</Text>
              <Text className="text-sm text-black">
                R$ {serviceFee.toFixed(2)}
              </Text>
            </View>
            {discount > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-green-600">Desconto</Text>
                <Text className="text-sm text-green-600">
                  -R$ {discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View className="h-px bg-neutral-200 my-3" />
            <View className="flex-row justify-between">
              <Text className="font-semibold text-black">Total</Text>
              <Text className="font-bold text-black text-lg">
                R$ {total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Política de Cancelamento */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-neutral-500 mb-2">
            Política de cancelamento
          </Text>
          <Text className="text-sm text-neutral-600">
            Cancelamento grátis até 24h antes da reserva. Após esse período,
            será cobrada uma taxa de 50% do valor.
          </Text>
        </View>

        {/* Espaço para botão */}
        <View className="h-24" />
      </ScrollView>

      {/* Botão Fixo */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <Pressable
          onPress={handleConfirm}
          disabled={loading || !selectedCard}
          className={`w-full py-4 rounded-2xl items-center ${
            loading || !selectedCard ? 'bg-neutral-300' : 'bg-black'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text className="text-white font-semibold text-[15px]">
                Confirmar e Pagar
              </Text>
              <Text className="text-white/70 text-sm">
                R$ {total.toFixed(2)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
```

---

# 12. CONFIRMAÇÃO (`/booking/confirmed`)

## 12.1 LAYOUT

```
┌─────────────────────────────────────┐
│           9:41        📶 📡 🔋      │
├─────────────────────────────────────┤
│                              ✕      │
│                                     │
│              ✓                      │
│         (animação)                  │
│                                     │
│       Reserva Confirmada!           │
│                                     │
│    Você ganhou +25 XP               │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   Arena Beach Tennis        │   │
│  │                             │   │
│  │   📅 Terça, 26 Nov 2024     │   │
│  │   🕐 14:00 - 15:00          │   │
│  │   📍 Av. Ibirapuera, 1234   │   │
│  │                             │   │
│  │   ──────────────────────    │   │
│  │                             │   │
│  │   [QR CODE]                 │   │
│  │   Use para check-in         │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      CRIAR PARTIDA          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      CONVIDAR AMIGOS        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    ADICIONAR AO CALENDÁRIO  │   │
│  └─────────────────────────────┘   │
│                                     │
│           Ir para Home              │
│                                     │
└─────────────────────────────────────┘
```

## 12.2 ELEMENTOS E FUNÇÕES

| Elemento | Ação |
|----------|------|
| **Botão Fechar (✕)** | `router.replace('/(tabs)')` |
| **Animação ✓** | Lottie animation |
| **QR Code** | Gerado com booking ID |
| **Criar Partida** | `router.push('/match/create?bookingId=...')` |
| **Convidar Amigos** | Share sheet com link |
| **Adicionar ao Calendário** | `Calendar.createEventAsync()` |
| **Ir para Home** | `router.replace('/(tabs)')` |

---

# 13. CANCELAR RESERVA (`/booking/cancel`)

## 13.1 LAYOUT

```
┌─────────────────────────────────────┐
│  ←  Cancelar Reserva                │
├─────────────────────────────────────┤
│                                     │
│  ⚠️                                 │
│                                     │
│  Tem certeza que deseja             │
│  cancelar esta reserva?             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Arena Beach Tennis          │   │
│  │ 📅 Ter, 26 Nov · 14:00      │   │
│  │ 💰 R$ 88,00 pagos           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Política de reembolso              │
│  ┌─────────────────────────────┐   │
│  │ ✓ Mais de 24h: 100%         │   │
│  │ ○ Menos de 24h: 50%         │   │
│  │ ○ Menos de 2h: 0%           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Você receberá: R$ 88,00           │
│                                     │
│  Motivo do cancelamento             │
│  ┌─────────────────────────────┐   │
│  │ ○ Mudança de planos         │   │
│  │ ○ Encontrei opção melhor    │   │
│  │ ○ Problema pessoal          │   │
│  │ ○ Outro                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    CANCELAR RESERVA         │   │
│  └─────────────────────────────┘   │
│                                     │
│         Manter Reserva             │
│                                     │
└─────────────────────────────────────┘
```

## 13.2 BACKEND

```typescript
// services/bookings.ts
export async function cancelBooking(bookingId: string, reason: string) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  // Calcular reembolso
  const hoursUntilBooking = differenceInHours(
    new Date(`${booking.date} ${booking.start_time}`),
    new Date()
  );

  let refundPercent = 0;
  if (hoursUntilBooking >= 24) {
    refundPercent = 100;
  } else if (hoursUntilBooking >= 2) {
    refundPercent = 50;
  }

  const refundAmount = booking.total_price * (refundPercent / 100);

  // Atualizar reserva
  await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId,
      cancellation_reason: reason,
    })
    .eq('id', bookingId);

  // Processar reembolso se aplicável
  if (refundAmount > 0 && booking.payment_intent_id) {
    await stripe.refunds.create({
      payment_intent: booking.payment_intent_id,
      amount: Math.round(refundAmount * 100),
    });
  }

  return { refundAmount, refundPercent };
}
```

---

**Continua na PARTE 6: Fluxo de Partidas e Gamificação**
