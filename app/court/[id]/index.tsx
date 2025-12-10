import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCourtDetail } from '@/hooks';

const { width } = Dimensions.get('window');

const AMENITIES = [
  { id: 'lights', icon: 'lightbulb-outline', label: 'Iluminação noturna' },
  { id: 'parking', icon: 'local-parking', label: 'Estacionamento' },
  { id: 'locker', icon: 'checkroom', label: 'Vestiário' },
  { id: 'water', icon: 'water-drop', label: 'Bebedouro' },
  { id: 'restaurant', icon: 'restaurant', label: 'Restaurante' },
  { id: 'rental', icon: 'sports-tennis', label: 'Aluguel de equip.' },
  { id: 'wifi', icon: 'wifi', label: 'Wi-Fi grátis' },
  { id: 'lounge', icon: 'weekend', label: 'Área de descanso' },
];

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { court, reviews, loading } = useCourtDetail(id);

  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, []);

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const images = court?.images?.length ? court.images : [null, null, null, null];
  const sports = court?.sport ? [court.sport] : ['BeachTennis', 'Futevôlei', 'Vôlei de Praia'];
  const pricePerHour = court?.price_per_hour || 120;

  // Rating distribution (mock)
  const ratingDistribution = [70, 22, 5, 2, 1]; // 5 to 1 stars

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!court) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-5">
        <MaterialIcons name="error-outline" size={48} color="#A3A3A3" />
        <Text className="text-lg font-semibold text-black mt-4">Quadra não encontrada</Text>
        <Pressable onPress={() => router.back()} className="mt-6 px-6 py-3 bg-black rounded-xl">
          <Text className="text-white font-medium">Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleReserve = () => {
    if (court.is_free) {
      router.push(`/court/${id}/public` as any);
    } else if (selectedTime) {
      router.push({
        pathname: `/court/${id}/checkout`,
        params: {
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          duration: '60',
          price: pricePerHour.toString(),
        },
      } as any);
    }
  };

  const openMaps = (app: 'waze' | 'google' | 'apple') => {
    const lat = court.latitude || -23.5505;
    const lng = court.longitude || -46.6333;
    const urls = {
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      apple: `http://maps.apple.com/?daddr=${lat},${lng}`,
    };
    Linking.openURL(urls[app]);
  };

  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="relative" style={{ height: 280 }}>
          <View className="flex-1 bg-neutral-200" />

          {/* Header Buttons */}
          <SafeAreaView className="absolute top-0 left-0 right-0">
            <View className="flex-row items-center justify-between px-5 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-white rounded-full items-center justify-center"
              >
                <MaterialIcons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <View className="flex-row gap-2">
                <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center">
                  <MaterialIcons name="favorite-border" size={22} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center">
                  <MaterialIcons name="share" size={22} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          {/* Thumbnail Strip */}
          <View className="absolute bottom-4 left-5 right-5 flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push(`/court/${id}/gallery?index=0` as any)}
              className="flex-1 h-16 bg-neutral-300 rounded-xl border-2 border-white"
            />
            {[1, 2].map((i) => (
              <TouchableOpacity
                key={i}
                onPress={() => router.push(`/court/${id}/gallery?index=${i}` as any)}
                className="w-12 h-16 bg-neutral-400 rounded-xl"
              />
            ))}
            <TouchableOpacity
              onPress={() => router.push(`/court/${id}/gallery` as any)}
              className="w-12 h-16 bg-neutral-500 rounded-xl items-center justify-center"
            >
              <Text className="text-white font-bold">+{Math.max(0, images.length - 3)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 pt-4">
          {/* Sport & Court */}
          <Text className="text-neutral-500 text-sm mb-1">
            {court.sport || 'BeachTennis'} · Quadra {(court as any).court_number || 3}
          </Text>

          {/* Name */}
          <Text className="text-2xl font-bold text-black mb-2">{court.name}</Text>

          {/* Rating & Location */}
          <View className="flex-row items-center gap-2 mb-1">
            <MaterialIcons name="star" size={16} color="#000" />
            <Text className="font-semibold text-black">{court.rating?.toFixed(1) || '4.8'}</Text>
            <TouchableOpacity onPress={() => router.push(`/court/${id}/reviews` as any)}>
              <Text className="text-neutral-500 underline">
                {reviews?.length || 124} avaliações
              </Text>
            </TouchableOpacity>
            <Text className="text-neutral-400">·</Text>
            <Text className="text-neutral-500">{court.city || 'São Paulo'}, SP</Text>
          </View>

          {/* Address */}
          <View className="flex-row items-center gap-2 mb-6">
            <MaterialIcons name="place" size={16} color="#737373" />
            <Text className="text-neutral-500 flex-1">{court.address}</Text>
          </View>

          {/* About */}
          <Text className="text-lg font-bold text-black mb-2">Sobre a quadra</Text>
          <Text className="text-neutral-600 leading-6 mb-6">
            {court.description ||
              'Quadra de BeachTennis profissional com areia importada de alta qualidade. Recentemente reformada, oferece uma experiência premium para jogadores de todos os níveis. Localizada no coração do Ibirapuera, com fácil acesso e estacionamento.'}
          </Text>

          {/* Sports */}
          <Text className="text-lg font-bold text-black mb-3">Esportes disponíveis</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {sports.map((sport: string) => (
              <TouchableOpacity
                key={sport}
                onPress={() => setSelectedSport(selectedSport === sport ? null : sport)}
                className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                  selectedSport === sport || (!selectedSport && sport === sports[0])
                    ? 'bg-black'
                    : 'bg-white border border-neutral-200'
                }`}
              >
                <MaterialIcons
                  name="sports-tennis"
                  size={16}
                  color={selectedSport === sport || (!selectedSport && sport === sports[0]) ? '#fff' : '#000'}
                />
                <Text
                  className={`font-medium ${
                    selectedSport === sport || (!selectedSport && sport === sports[0])
                      ? 'text-white'
                      : 'text-black'
                  }`}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amenities */}
          <Text className="text-lg font-bold text-black mb-3">Comodidades</Text>
          <View className="flex-row flex-wrap mb-6">
            {AMENITIES.map((amenity) => (
              <View key={amenity.id} className="w-1/2 flex-row items-center gap-3 py-2">
                <MaterialIcons name={amenity.icon as any} size={20} color="#737373" />
                <Text className="text-neutral-700">{amenity.label}</Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View className="h-px bg-neutral-200 mb-6" />

          {/* Price & Availability */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-black">R$ {pricePerHour}</Text>
              <Text className="text-neutral-500">/ hora</Text>
            </View>
            <View className="bg-green-50 border border-green-200 px-3 py-1 rounded-full flex-row items-center gap-1">
              <View className="w-2 h-2 bg-green-500 rounded-full" />
              <Text className="text-green-700 font-medium">Disponível hoje</Text>
            </View>
          </View>

          {/* Calendar */}
          <Text className="font-semibold text-black mb-3">Selecione data e horário</Text>

          {/* Month Header */}
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity>
              <MaterialIcons name="chevron-left" size={24} color="#737373" />
            </TouchableOpacity>
            <Text className="font-semibold text-black">
              {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity>
              <MaterialIcons name="chevron-right" size={24} color="#737373" />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View className="flex-row mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-xs text-neutral-400">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap mb-4">
            {calendarDays.map((date, index) => (
              <TouchableOpacity
                key={index}
                disabled={!date || isPastDate(date)}
                onPress={() => date && setSelectedDate(date)}
                className="items-center justify-center"
                style={{ width: (width - 40) / 7, height: 40 }}
              >
                {date && (
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      isSameDay(date, selectedDate)
                        ? 'bg-black'
                        : ''
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        isPastDate(date)
                          ? 'text-neutral-300'
                          : isSameDay(date, selectedDate)
                            ? 'text-white'
                            : 'text-black'
                      }`}
                    >
                      {date.getDate()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Time Slots */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  className={`px-5 py-3 rounded-xl ${
                    selectedTime === time ? 'bg-black' : 'border border-neutral-200'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedTime === time ? 'text-white' : 'text-black'
                    }`}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Reserve Button */}
          <TouchableOpacity
            onPress={handleReserve}
            disabled={!selectedTime && !court.is_free}
            className="w-full py-4 rounded-xl items-center mb-2"
            style={{ backgroundColor: '#84CC16' }}
          >
            <Text className="font-bold text-black text-lg">
              Reservar · R$ {pricePerHour}
            </Text>
          </TouchableOpacity>
          <Text className="text-center text-neutral-400 text-sm mb-6">
            Você não será cobrado ainda
          </Text>

          {/* Divider */}
          <View className="h-px bg-neutral-200 mb-6" />

          {/* Reviews */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-black">Avaliações</Text>
            <TouchableOpacity onPress={() => router.push(`/court/${id}/reviews` as any)}>
              <Text className="text-neutral-500 underline">Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-6 mb-6">
            {/* Rating */}
            <View>
              <Text className="text-4xl font-bold text-black">{court.rating?.toFixed(1) || '4.8'}</Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={14}
                    color={i <= 4 ? '#000' : '#D4D4D4'}
                  />
                ))}
              </View>
              <Text className="text-neutral-500 text-sm">{reviews?.length || 124} avaliações</Text>
            </View>

            {/* Distribution */}
            <View className="flex-1">
              {[5, 4, 3, 2, 1].map((stars, index) => (
                <View key={stars} className="flex-row items-center gap-2 mb-1">
                  <Text className="w-3 text-xs text-neutral-500">{stars}</Text>
                  <View className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-black rounded-full"
                      style={{ width: `${ratingDistribution[index]}%` }}
                    />
                  </View>
                  <Text className="w-8 text-xs text-neutral-500 text-right">
                    {ratingDistribution[index]}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sample Review */}
          {reviews && reviews.length > 0 && (
            <View className="bg-neutral-50 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-10 h-10 bg-neutral-300 rounded-full items-center justify-center">
                  <MaterialIcons name="person" size={20} color="#737373" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-black">Pedro Ferreira</Text>
                  <Text className="text-neutral-500 text-sm">Novembro 2024</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="star" size={14} color="#000" />
                  <Text className="font-semibold text-black">5.0</Text>
                </View>
              </View>
              <Text className="text-neutral-700 leading-5">
                Quadra excelente! Areia de ótima qualidade e iluminação perfeita para jogos
                noturnos. Vestiário limpo e bem equipado. Super recomendo!
              </Text>
            </View>
          )}

          {/* Divider */}
          <View className="h-px bg-neutral-200 mb-6" />

          {/* Location */}
          <Text className="text-lg font-bold text-black mb-2">Localização</Text>
          <Text className="text-neutral-500 mb-4">{court.address}</Text>

          {/* Map Placeholder */}
          <View className="h-48 bg-neutral-100 rounded-2xl mb-4 items-center justify-center">
            <View className="w-12 h-12 bg-black rounded-full items-center justify-center">
              <MaterialIcons name="sports-tennis" size={24} color="#fff" />
            </View>
          </View>

          {/* Map Buttons */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => openMaps('waze')}
              className="flex-1 py-4 border border-neutral-200 rounded-2xl items-center"
            >
              <View className="w-10 h-10 bg-blue-400 rounded-xl items-center justify-center mb-1">
                <Text className="text-white font-bold">W</Text>
              </View>
              <Text className="text-sm text-black">Waze</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openMaps('google')}
              className="flex-1 py-4 border border-neutral-200 rounded-2xl items-center"
            >
              <View className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center mb-1">
                <MaterialIcons name="map" size={20} color="#fff" />
              </View>
              <Text className="text-sm text-black">Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openMaps('apple')}
              className="flex-1 py-4 border border-neutral-200 rounded-2xl items-center"
            >
              <View className="w-10 h-10 bg-black rounded-xl items-center justify-center mb-1">
                <MaterialIcons name="navigation" size={20} color="#fff" />
              </View>
              <Text className="text-sm text-black">Apple Maps</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-px bg-neutral-200 mb-6" />

          {/* Court Info */}
          <Text className="text-lg font-bold text-black mb-4">Informações</Text>
          {[
            { icon: 'schedule', label: 'Horário', value: '06:00 - 23:00' },
            { icon: 'crop-square', label: 'Tamanho', value: '16m x 8m' },
            { icon: 'terrain', label: 'Piso', value: 'Areia' },
            { icon: 'wb-sunny', label: 'Tipo', value: 'Ao ar livre' },
            { icon: 'groups', label: 'Capacidade', value: '4 jogadores' },
          ].map((info) => (
            <View key={info.label} className="flex-row items-center justify-between py-3 border-b border-neutral-100">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name={info.icon as any} size={20} color="#737373" />
                <Text className="text-neutral-600">{info.label}</Text>
              </View>
              <Text className="font-medium text-black">{info.value}</Text>
            </View>
          ))}

          {/* Divider */}
          <View className="h-px bg-neutral-200 my-6" />

          {/* Court Rules */}
          <Text className="text-lg font-bold text-black mb-4">Regras da quadra</Text>
          {[
            { text: 'Cancelamento gratuito até 24h antes', allowed: true },
            { text: 'Chegue 10 min antes do horário', allowed: true },
            { text: 'Não é permitido fumar nas quadras', allowed: false },
            { text: 'Proibido entrar com alimentos', allowed: false },
          ].map((rule, index) => (
            <View key={index} className="flex-row items-center gap-3 py-2">
              <MaterialIcons
                name={rule.allowed ? 'check-circle' : 'cancel'}
                size={20}
                color={rule.allowed ? '#22C55E' : '#EF4444'}
              />
              <Text className={rule.allowed ? 'text-neutral-700' : 'text-neutral-400'}>
                {rule.text}
              </Text>
            </View>
          ))}

          <View className="h-32" />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-xl font-bold text-black">R$ {pricePerHour}</Text>
              <Text className="text-neutral-500">/ hora</Text>
            </View>
            {selectedTime && (
              <Text className="text-neutral-500 text-sm">
                {selectedDate.getDate()} {selectedDate.toLocaleDateString('pt-BR', { month: 'short' })} · {selectedTime}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleReserve}
            disabled={!selectedTime && !court.is_free}
            className={`px-8 py-4 rounded-full ${
              selectedTime || court.is_free ? 'bg-black' : 'bg-neutral-200'
            }`}
          >
            <Text className={`font-bold ${selectedTime || court.is_free ? 'text-white' : 'text-neutral-400'}`}>
              Reservar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
