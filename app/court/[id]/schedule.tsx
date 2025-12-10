import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCourtDetail, useAvailableSlots } from '@/hooks';

const DURATIONS = [
  { value: 60, label: '1h' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2h' },
];

export default function ScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { court, loading: courtLoading } = useCourtDetail(id);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);

  // Generate next 7 days for calendar
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  // Get available slots for selected date
  const dateStr = selectedDate.toISOString().split('T')[0];
  const { slots, loading: slotsLoading } = useAvailableSlots(id, dateStr);

  // Generate time slots and group by time of day
  const timeSlots = useMemo(() => {
    const defaultSlots = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00',
    ];

    return defaultSlots.map((time) => ({
      time,
      available: slots.length === 0 || slots.includes(time),
    }));
  }, [slots]);

  const groupedSlots = useMemo(() => {
    const morning = timeSlots.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 6 && hour < 12;
    });
    const afternoon = timeSlots.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 12 && hour < 18;
    });
    const night = timeSlots.filter(s => {
      const hour = parseInt(s.time.split(':')[0]);
      return hour >= 18 && hour <= 23;
    });
    return { morning, afternoon, night };
  }, [timeSlots]);

  const pricePerHour = court?.price_per_hour || 0;
  const totalPrice = pricePerHour * (duration / 60);

  const formatWeekDay = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.toDateString() === d2.toDateString();
  };

  const handleContinue = () => {
    if (!selectedTime) return;

    router.push({
      pathname: `/court/${id}/checkout`,
      params: {
        date: dateStr,
        time: selectedTime,
        duration: duration.toString(),
        price: totalPrice.toString(),
      },
    } as any);
  };

  if (courtLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black ml-4">Reservar</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Court Info */}
        <View className="px-5 py-4 border-b border-neutral-100">
          <Text className="font-bold text-black text-lg">{court?.name}</Text>
          <Text className="text-neutral-500">{court?.sport} • Quadra 1</Text>
        </View>

        {/* Date Selection */}
        <View className="px-5 py-5">
          <Text className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">
            Escolha a data
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {weekDays.map((date, index) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  className={`w-16 py-3 rounded-2xl items-center ${
                    isSelected ? 'bg-black' : 'bg-neutral-100'
                  }`}
                >
                  <Text className={`text-xs capitalize ${isSelected ? 'text-white/60' : 'text-neutral-500'}`}>
                    {isToday ? 'Hoje' : formatWeekDay(date)}
                  </Text>
                  <Text className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View className="px-5 py-4">
          <Text className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">
            Horários Disponíveis - {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
          </Text>

          {slotsLoading ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : (
            <>
              {/* Morning */}
              {groupedSlots.morning.length > 0 && (
                <View className="mb-6">
                  <Text className="text-sm font-medium text-black mb-3">Manhã</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {groupedSlots.morning.map((slot) => (
                      <TouchableOpacity
                        key={slot.time}
                        onPress={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`px-4 py-3 rounded-xl ${
                          selectedTime === slot.time
                            ? 'bg-black'
                            : slot.available
                              ? 'bg-neutral-100'
                              : 'bg-neutral-50'
                        }`}
                      >
                        <Text className={`font-medium ${
                          selectedTime === slot.time
                            ? 'text-white'
                            : slot.available
                              ? 'text-black'
                              : 'text-neutral-300'
                        }`}>
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Afternoon */}
              {groupedSlots.afternoon.length > 0 && (
                <View className="mb-6">
                  <Text className="text-sm font-medium text-black mb-3">Tarde</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {groupedSlots.afternoon.map((slot) => (
                      <TouchableOpacity
                        key={slot.time}
                        onPress={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`px-4 py-3 rounded-xl ${
                          selectedTime === slot.time
                            ? 'bg-black'
                            : slot.available
                              ? 'bg-neutral-100'
                              : 'bg-neutral-50'
                        }`}
                      >
                        <Text className={`font-medium ${
                          selectedTime === slot.time
                            ? 'text-white'
                            : slot.available
                              ? 'text-black'
                              : 'text-neutral-300'
                        }`}>
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Night */}
              {groupedSlots.night.length > 0 && (
                <View className="mb-6">
                  <Text className="text-sm font-medium text-black mb-3">Noite</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {groupedSlots.night.map((slot) => (
                      <TouchableOpacity
                        key={slot.time}
                        onPress={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`px-4 py-3 rounded-xl ${
                          selectedTime === slot.time
                            ? 'bg-black'
                            : slot.available
                              ? 'bg-neutral-100'
                              : 'bg-neutral-50'
                        }`}
                      >
                        <Text className={`font-medium ${
                          selectedTime === slot.time
                            ? 'text-white'
                            : slot.available
                              ? 'text-black'
                              : 'text-neutral-300'
                        }`}>
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Duration */}
        <View className="px-5 py-4 border-t border-neutral-100">
          <Text className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">
            Duração
          </Text>
          <View className="flex-row gap-3">
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d.value}
                onPress={() => setDuration(d.value)}
                className={`flex-1 py-4 rounded-xl items-center ${
                  duration === d.value ? 'bg-black' : 'bg-neutral-100'
                }`}
              >
                <Text className={`font-bold ${duration === d.value ? 'text-white' : 'text-black'}`}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm text-neutral-500">
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
              {selectedTime && ` • ${selectedTime} - ${calculateEndTime(selectedTime, duration)}`}
            </Text>
          </View>
          <Text className="text-xl font-bold text-black">
            {court?.is_free ? 'Gratuito' : `R$ ${totalPrice.toFixed(0)}`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedTime}
          className={`w-full py-4 rounded-full items-center ${
            selectedTime ? 'bg-black' : 'bg-neutral-200'
          }`}
        >
          <Text className={`font-bold ${selectedTime ? 'text-white' : 'text-neutral-400'}`}>
            Continuar
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}
