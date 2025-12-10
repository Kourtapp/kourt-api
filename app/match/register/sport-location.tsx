import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useRegisterMatch } from '@/contexts/RegisterMatchContext';
import { useCourts } from '@/hooks';

const SPORTS = [
  { id: 'BeachTennis', name: 'BeachTennis', icon: 'sports-tennis' },
  { id: 'Padel', name: 'Padel', icon: 'sports-tennis' },
  { id: 'Tênis', name: 'Tênis', icon: 'sports-tennis' },
  { id: 'Futebol', name: 'Futebol', icon: 'sports-soccer' },
  { id: 'Vôlei', name: 'Vôlei', icon: 'sports-volleyball' },
  { id: 'Basquete', name: 'Basquete', icon: 'sports-basketball' },
];

const DURATIONS = [
  { value: 30, label: '30min' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2h' },
];

export default function RegisterSportLocationScreen() {
  const { data, updateData } = useRegisterMatch();
  const { courts } = useCourts();
  const [showCourtPicker, setShowCourtPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [nearbyCourtDetected, setNearbyCourtDetected] = useState<any>(null);

  useEffect(() => {
    detectNearbyCourt();
  }, [courts]);

  const detectNearbyCourt = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      await Location.getCurrentPositionAsync({});

      if (courts.length > 0) {
        const detected = courts[0];
        setNearbyCourtDetected(detected);
        if (!data.courtId) {
          updateData({
            courtId: detected.id,
            courtName: detected.name,
            courtDetectedByGPS: true,
          });
        }
      }
    } catch (e) {
      console.log('Error detecting location:', e);
    }
  };

  const handleNext = () => {
    router.push('/match/register/result');
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) return 'Hoje';
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = 6 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Esporte e Local</Text>
        <Text className="text-neutral-400 font-medium">2/4</Text>
      </View>

      {/* Progress Bar */}
      <View className="flex-row px-5 gap-2 mb-6">
        <View className="flex-1 h-1 bg-black rounded-full" />
        <View className="flex-1 h-1 bg-black rounded-full" />
        <View className="flex-1 h-1 bg-neutral-200 rounded-full" />
        <View className="flex-1 h-1 bg-neutral-200 rounded-full" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Sport Selection */}
        <Text className="text-base font-bold text-black mb-3">Qual esporte você jogou?</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {SPORTS.map((sport) => {
            const isSelected = data.sport === sport.id;
            return (
              <TouchableOpacity
                key={sport.id}
                onPress={() => updateData({ sport: sport.id })}
                className={`px-4 py-3 rounded-2xl flex-row items-center gap-2 ${
                  isSelected ? 'bg-black' : 'bg-neutral-100'
                }`}
              >
                <MaterialIcons
                  name={sport.icon as any}
                  size={20}
                  color={isSelected ? '#fff' : '#525252'}
                />
                <Text className={`font-medium ${isSelected ? 'text-white' : 'text-black'}`}>
                  {sport.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Court Selection */}
        <Text className="text-base font-bold text-black mb-3">Onde você jogou?</Text>

        {/* Detected Court */}
        {data.courtDetectedByGPS && data.courtName && (
          <TouchableOpacity
            onPress={() => setShowCourtPicker(true)}
            className="flex-row items-center bg-green-50 border border-green-200 p-4 rounded-2xl mb-3"
          >
            <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center">
              <MaterialIcons name="location-on" size={24} color="#22C55E" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-black">{data.courtName}</Text>
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 bg-red-500 rounded-full" />
                <Text className="text-sm text-green-600">Detectado por GPS</Text>
              </View>
            </View>
            <MaterialIcons name="check-circle" size={24} color="#22C55E" />
          </TouchableOpacity>
        )}

        {/* Search Other Court */}
        <TouchableOpacity
          onPress={() => setShowCourtPicker(true)}
          className="flex-row items-center bg-neutral-50 p-4 rounded-2xl mb-6"
        >
          <MaterialIcons name="search" size={20} color="#A3A3A3" />
          <Text className="flex-1 ml-3 text-neutral-400">Buscar outra quadra...</Text>
        </TouchableOpacity>

        {/* Date and Time */}
        <Text className="text-base font-bold text-black mb-3">Quando você jogou?</Text>
        <View className="flex-row gap-3 mb-6">
          {/* Date */}
          <View className="flex-1 bg-neutral-100 rounded-2xl p-4">
            <Text className="text-xs text-neutral-500 mb-1">Data</Text>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="event" size={18} color="#525252" />
              <Text className="font-semibold text-black">{formatDate(data.date)}</Text>
            </View>
          </View>

          {/* Time */}
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="flex-1 bg-neutral-100 rounded-2xl p-4"
          >
            <Text className="text-xs text-neutral-500 mb-1">Horário</Text>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="schedule" size={18} color="#525252" />
              <Text className="font-semibold text-black">{data.time}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Duration */}
        <Text className="text-base font-bold text-black mb-3">Quanto tempo jogou?</Text>
        <View className="flex-row gap-2 mb-6">
          {DURATIONS.map((d) => {
            const isSelected = data.duration === d.value;
            return (
              <TouchableOpacity
                key={d.value}
                onPress={() => updateData({ duration: d.value })}
                className={`flex-1 py-3 rounded-2xl items-center ${
                  isSelected ? 'bg-black' : 'bg-neutral-100'
                }`}
              >
                <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-black'}`}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-black py-4 rounded-full items-center"
        >
          <Text className="text-white font-bold text-base">Próximo</Text>
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-black">Selecionar Horário</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <MaterialIcons name="close" size={24} color="#737373" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {timeSlots.map((slot) => {
                const isSelected = data.time === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => {
                      updateData({ time: slot });
                      setShowTimePicker(false);
                    }}
                    className={`w-[23%] py-3 rounded-xl items-center ${
                      isSelected ? 'bg-black' : 'bg-neutral-100'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-black'}`}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Court Picker Modal */}
      <Modal
        visible={showCourtPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCourtPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 pb-8 max-h-[70%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-black">Selecionar Quadra</Text>
              <TouchableOpacity onPress={() => setShowCourtPicker(false)}>
                <MaterialIcons name="close" size={24} color="#737373" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {courts.map((court) => {
                const isSelected = data.courtId === court.id;
                return (
                  <TouchableOpacity
                    key={court.id}
                    onPress={() => {
                      updateData({
                        courtId: court.id,
                        courtName: court.name,
                        courtDetectedByGPS: false,
                      });
                      setShowCourtPicker(false);
                    }}
                    className={`p-4 rounded-2xl flex-row items-center mb-2 ${
                      isSelected ? 'bg-lime-100 border-2 border-lime-500' : 'bg-neutral-50'
                    }`}
                  >
                    <View className={`w-12 h-12 rounded-xl items-center justify-center ${
                      isSelected ? 'bg-lime-500' : 'bg-neutral-200'
                    }`}>
                      <MaterialIcons
                        name="sports-tennis"
                        size={24}
                        color={isSelected ? '#1A2E05' : '#737373'}
                      />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="font-semibold text-black">{court.name}</Text>
                      <Text className="text-sm text-neutral-500">{court.address}</Text>
                    </View>
                    {isSelected && (
                      <MaterialIcons name="check-circle" size={24} color="#84CC16" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
