import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCourtDetail } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';

type SlotStatus = 'vago' | 'lotado' | 'voce_vai' | 'vazio';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  status: SlotStatus;
  players: { id: string; name: string; level: string }[];
  capacity: number;
}

const TIME_SLOTS: TimeSlot[] = [
  {
    id: '1',
    start: '06:00',
    end: '08:00',
    status: 'vago',
    players: [
      { id: '1', name: 'João', level: 'Intermediário' },
      { id: '2', name: 'Maria', level: 'Avançado' },
    ],
    capacity: 4,
  },
  {
    id: '2',
    start: '08:00',
    end: '10:00',
    status: 'lotado',
    players: [
      { id: '1', name: 'P1', level: '' },
      { id: '2', name: 'P2', level: '' },
      { id: '3', name: 'P3', level: '' },
      { id: '4', name: 'P4', level: '' },
    ],
    capacity: 4,
  },
  {
    id: '3',
    start: '18:00',
    end: '20:00',
    status: 'voce_vai',
    players: [
      { id: 'me', name: 'Você', level: 'Intermediário' },
      { id: '2', name: 'Pedro F.', level: 'Avançado' },
      { id: '3', name: 'Marina S.', level: 'Intermediário' },
    ],
    capacity: 4,
  },
  {
    id: '4',
    start: '20:00',
    end: '22:00',
    status: 'vazio',
    players: [],
    capacity: 4,
  },
];

const AMENITIES = [
  { name: 'Iluminação', has: true },
  { name: 'Bebedouro', has: true },
  { name: 'Banheiro público', has: true },
  { name: 'Vestiário', has: false },
  { name: 'Estacionamento', has: false },
  { name: 'Aluguel equip.', has: false },
];

const BEST_TIMES = [
  { label: 'Manhã', level: 'Calmo', color: '#22C55E', percentage: 30 },
  { label: 'Tarde', level: 'Movim.', color: '#F59E0B', percentage: 55 },
  { label: 'Noite', level: 'Lotado', color: '#EF4444', percentage: 80 },
  { label: 'Fim de sem.', level: 'Cheio', color: '#EF4444', percentage: 90 },
];

const TIPS = [
  'Chegue cedo nos fins de semana',
  'Leve sua própria água',
  'Estacionamento mais perto: Portão 3',
];

export default function PublicCourtScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { court, reviews } = useCourtDetail(id);
  const { user } = useAuthStore();

  const [slots, setSlots] = useState(TIME_SLOTS);
  const [expandedSlot, setExpandedSlot] = useState<string | null>('3');

  const sports = court?.sport ? [court.sport] : ['BeachTennis', 'Vôlei', 'Futevôlei'];

  const handleCheckIn = (slotId: string) => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para fazer check-in', [
        { text: 'Cancelar' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              status: 'voce_vai' as SlotStatus,
              players: [
                ...slot.players,
                { id: 'me', name: 'Você', level: 'Intermediário' },
              ],
            }
          : slot
      )
    );
    Alert.alert('Check-in confirmado!', 'Você confirmou presença neste horário.');
  };

  const handleCancel = (slotId: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              status: slot.players.length <= 1 ? 'vazio' : 'vago',
              players: slot.players.filter((p) => p.id !== 'me'),
            }
          : slot
      )
    );
  };

  const openMaps = (app: 'waze' | 'google' | 'apple') => {
    const lat = court?.latitude || -23.5505;
    const lng = court?.longitude || -46.6333;
    const urls = {
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      apple: `http://maps.apple.com/?daddr=${lat},${lng}`,
    };
    Linking.openURL(urls[app]);
  };

  const getSlotIcon = (start: string) => {
    const hour = parseInt(start.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'wb-sunny';
    if (hour >= 12 && hour < 18) return 'wb-sunny';
    return 'nightlight-round';
  };

  const getStatusBadge = (status: SlotStatus) => {
    switch (status) {
      case 'vago':
        return { text: 'VAGO', bg: 'bg-green-100', color: 'text-green-700' };
      case 'lotado':
        return { text: 'LOTADO', bg: 'bg-red-100', color: 'text-red-600' };
      case 'voce_vai':
        return { text: 'VOCÊ VAI', bg: 'bg-lime-400', color: 'text-black' };
      case 'vazio':
        return { text: 'VAZIO', bg: 'bg-neutral-100', color: 'text-neutral-600' };
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Green Header Image */}
        <LinearGradient
          colors={['#22C55E', '#16A34A']}
          style={{ height: 280 }}
        >
          <SafeAreaView>
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
            <View className="flex-1 h-16 bg-white/30 rounded-xl" />
            <View className="w-12 h-16 bg-white/20 rounded-xl" />
            <View className="w-12 h-16 bg-white/20 rounded-xl" />
            <View className="w-12 h-16 bg-white/10 rounded-xl items-center justify-center">
              <Text className="text-white font-bold">+3</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-5 pt-4">
          {/* Badges */}
          <View className="flex-row gap-2 mb-2">
            <View className="bg-green-100 px-3 py-1 rounded">
              <Text className="text-green-700 font-semibold text-xs">GRATUITA</Text>
            </View>
            <View className="bg-neutral-100 px-3 py-1 rounded">
              <Text className="text-neutral-600 font-semibold text-xs">PÚBLICA</Text>
            </View>
          </View>

          {/* Name */}
          <Text className="text-2xl font-bold text-black mb-2">
            {court?.name || 'Quadra Parque Ibirapuera'}
          </Text>

          {/* Rating & Location */}
          <View className="flex-row items-center gap-2 mb-1">
            <MaterialIcons name="star" size={16} color="#000" />
            <Text className="font-semibold text-black">{court?.rating?.toFixed(1) || '4.5'}</Text>
            <TouchableOpacity onPress={() => router.push(`/court/${id}/reviews` as any)}>
              <Text className="text-neutral-500 underline">
                {reviews?.length || 89} avaliações
              </Text>
            </TouchableOpacity>
            <Text className="text-neutral-400">·</Text>
            <Text className="text-neutral-500">São Paulo, SP</Text>
          </View>

          {/* Address */}
          <View className="flex-row items-center gap-2 mb-4">
            <MaterialIcons name="place" size={16} color="#737373" />
            <Text className="text-neutral-500">
              {court?.address || 'Parque Ibirapuera · Portão 10'} · 800m de você
            </Text>
          </View>

          {/* Free Court Info */}
          <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <MaterialIcons name="savings" size={20} color="#16A34A" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-green-800">Quadra gratuita</Text>
                <Text className="text-green-700 text-sm">
                  Não é possível reservar. Faça check-in para avisar que você vai!
                </Text>
              </View>
            </View>
          </View>

          {/* Sports */}
          <Text className="text-lg font-bold text-black mb-3">Esportes praticados</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {sports.map((sport: string, index: number) => (
              <View
                key={sport}
                className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                  index === 0 ? 'bg-black' : 'bg-white border border-neutral-200'
                }`}
              >
                <MaterialIcons
                  name="sports-tennis"
                  size={16}
                  color={index === 0 ? '#fff' : '#000'}
                />
                <Text className={index === 0 ? 'text-white font-medium' : 'text-black font-medium'}>
                  {sport}
                </Text>
              </View>
            ))}
          </View>

          {/* Who's Playing Today */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-black">Quem vai jogar hoje</Text>
            <Text className="text-neutral-400 text-sm">Atualizado agora</Text>
          </View>

          {/* Time Slots */}
          {slots.map((slot) => {
            const badge = getStatusBadge(slot.status);
            const isExpanded = expandedSlot === slot.id;
            const spotsLeft = slot.capacity - slot.players.length;

            return (
              <TouchableOpacity
                key={slot.id}
                onPress={() => setExpandedSlot(isExpanded ? null : slot.id)}
                className={`mb-3 p-4 rounded-2xl border ${
                  slot.status === 'voce_vai'
                    ? 'border-green-500 bg-green-50'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                {/* Header */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons
                      name={getSlotIcon(slot.start) as any}
                      size={18}
                      color="#737373"
                    />
                    <Text className="font-semibold text-black">
                      {slot.start} - {slot.end}
                    </Text>
                    {slot.status === 'voce_vai' && (
                      <View className="bg-lime-400 px-2 py-0.5 rounded">
                        <Text className="text-black text-xs font-bold">VOCÊ VAI</Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row items-center gap-2">
                    {spotsLeft > 0 && slot.status !== 'lotado' && (
                      <Text className="text-amber-500 font-medium text-sm">FALTA {spotsLeft}</Text>
                    )}
                    <View className={`px-2 py-1 rounded ${badge.bg}`}>
                      <Text className={`text-xs font-semibold ${badge.color}`}>{badge.text}</Text>
                    </View>
                  </View>
                </View>

                {/* Players */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    {slot.players.slice(0, 4).map((_, i) => (
                      <View
                        key={i}
                        className={`w-8 h-8 rounded-full bg-neutral-200 border-2 border-white items-center justify-center ${
                          i > 0 ? '-ml-2' : ''
                        }`}
                      >
                        <MaterialIcons name="person" size={16} color="#737373" />
                      </View>
                    ))}
                    {spotsLeft > 0 && (
                      <View className="w-8 h-8 rounded-full border-2 border-dashed border-neutral-300 -ml-2 items-center justify-center">
                        <MaterialIcons name="add" size={14} color="#A3A3A3" />
                      </View>
                    )}
                    <Text className="ml-3 text-neutral-600">
                      {slot.players.length}/{slot.capacity}
                      {spotsLeft > 0 && (
                        <Text className="text-green-600"> · Falta {spotsLeft}!</Text>
                      )}
                    </Text>
                  </View>

                  {/* Action Button */}
                  {slot.status === 'vago' && (
                    <TouchableOpacity
                      onPress={() => handleCheckIn(slot.id)}
                      className="bg-black px-4 py-2 rounded-full"
                    >
                      <Text className="text-white font-medium">Vou</Text>
                    </TouchableOpacity>
                  )}
                  {slot.status === 'lotado' && (
                    <View className="bg-neutral-200 px-4 py-2 rounded-full">
                      <Text className="text-neutral-500 font-medium">Cheio</Text>
                    </View>
                  )}
                  {slot.status === 'voce_vai' && (
                    <TouchableOpacity
                      onPress={() => handleCancel(slot.id)}
                      className="border border-neutral-300 px-4 py-2 rounded-full"
                    >
                      <Text className="text-black font-medium">Cancelar</Text>
                    </TouchableOpacity>
                  )}
                  {slot.status === 'vazio' && (
                    <TouchableOpacity
                      onPress={() => handleCheckIn(slot.id)}
                      className="bg-black px-4 py-2 rounded-full"
                    >
                      <Text className="text-white font-medium">Ser o 1º</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Expanded Players List */}
                {isExpanded && slot.players.length > 0 && (
                  <View className="mt-4 pt-4 border-t border-neutral-200">
                    <Text className="text-xs text-neutral-400 uppercase tracking-wide mb-3">
                      QUEM VAI:
                    </Text>
                    {slot.players.map((player) => (
                      <View
                        key={player.id}
                        className="flex-row items-center justify-between py-2"
                      >
                        <View className="flex-row items-center gap-3">
                          <View className="w-8 h-8 bg-neutral-200 rounded-full items-center justify-center">
                            <MaterialIcons name="person" size={16} color="#737373" />
                          </View>
                          <Text className="font-medium text-black">{player.name}</Text>
                        </View>
                        <Text className="text-neutral-500 text-sm">{player.level}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Share */}
          <TouchableOpacity className="flex-row items-center justify-center gap-2 py-4 border border-neutral-200 rounded-2xl mb-6">
            <MaterialIcons name="share" size={20} color="#000" />
            <Text className="font-medium text-black">Compartilhar para achar jogadores</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="h-px bg-neutral-200 mb-6" />

          {/* Amenities */}
          <Text className="text-lg font-bold text-black mb-4">O que tem aqui</Text>
          <View className="flex-row flex-wrap mb-6">
            {AMENITIES.map((amenity) => (
              <View key={amenity.name} className="w-1/2 flex-row items-center gap-3 py-2">
                <MaterialIcons
                  name={amenity.has ? 'check-circle' : 'cancel'}
                  size={20}
                  color={amenity.has ? '#22C55E' : '#EF4444'}
                />
                <Text className={amenity.has ? 'text-neutral-700' : 'text-neutral-400'}>
                  {amenity.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View className="h-px bg-neutral-200 mb-6" />

          {/* Best Times */}
          <Text className="text-lg font-bold text-black mb-2">Melhores horários</Text>
          <Text className="text-neutral-500 text-sm mb-4">Baseado em check-ins anteriores</Text>
          {BEST_TIMES.map((time) => (
            <View key={time.label} className="flex-row items-center gap-4 mb-3">
              <Text className="w-16 text-neutral-600">{time.label}</Text>
              <View className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${time.percentage}%`, backgroundColor: time.color }}
                />
              </View>
              <Text className="w-14 text-right text-neutral-600">{time.level}</Text>
            </View>
          ))}

          {/* Divider */}
          <View className="h-px bg-neutral-200 my-6" />

          {/* Reviews Preview */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="star" size={18} color="#000" />
              <Text className="font-bold text-black">{court?.rating?.toFixed(1) || '4.5'}</Text>
              <Text className="text-neutral-500">· {reviews?.length || 89} avaliações</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/court/${id}/reviews` as any)}>
              <Text className="text-neutral-500 underline">Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-neutral-50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 bg-neutral-300 rounded-full items-center justify-center">
                <MaterialIcons name="person" size={20} color="#737373" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-black">Lucas M.</Text>
                <Text className="text-neutral-500 text-sm">Há 2 dias</Text>
              </View>
            </View>
            <Text className="text-neutral-700 leading-5">
              Quadra boa para quem está começando. Areia bem cuidada, só falta vestiário mesmo.
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-neutral-200 mb-6" />

          {/* Location */}
          <Text className="text-lg font-bold text-black mb-2">Como chegar</Text>
          <Text className="text-neutral-500 mb-4">Parque Ibirapuera · Portão 10</Text>

          {/* Map Placeholder */}
          <View className="h-40 bg-green-100 rounded-2xl mb-4 items-center justify-center">
            <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center">
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
              <Text className="text-sm text-black">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openMaps('apple')}
              className="flex-1 py-4 border border-neutral-200 rounded-2xl items-center"
            >
              <View className="w-10 h-10 bg-black rounded-xl items-center justify-center mb-1">
                <MaterialIcons name="navigation" size={20} color="#fff" />
              </View>
              <Text className="text-sm text-black">Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-px bg-neutral-200 mb-6" />

          {/* Community Tips */}
          <Text className="text-lg font-bold text-black mb-4">Dicas da comunidade</Text>
          {TIPS.map((tip, index) => (
            <View key={index} className="flex-row items-center gap-3 py-2">
              <MaterialIcons name="lightbulb-outline" size={20} color="#F59E0B" />
              <Text className="text-neutral-700">{tip}</Text>
            </View>
          ))}

          <View className="h-32" />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-xl font-bold text-green-600">Gratuita</Text>
              <MaterialIcons name="check-circle" size={20} color="#22C55E" />
            </View>
            <Text className="text-neutral-500 text-sm">Faça check-in para avisar que vai</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleCheckIn(slots[0]?.id)}
            className="bg-black px-6 py-4 rounded-full flex-row items-center gap-2"
          >
            <MaterialIcons name="add-location" size={20} color="#fff" />
            <Text className="text-white font-bold">Check-in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
