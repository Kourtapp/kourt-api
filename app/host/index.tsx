import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';

type TabType = 'hoje' | 'proximos';

interface Reservation {
  id: string;
  date: string;
  time: string;
  endTime: string;
  sport: string;
  courtName: string;
  userName: string;
  userAvatar?: string;
  players: number;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Mock data - substituir por dados reais
const mockReservations: Reservation[] = [];

export default function HostTodayScreen() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('hoje');

  const todayReservations = mockReservations.filter(r => r.date === 'hoje');
  const upcomingReservations = mockReservations.filter(r => r.date !== 'hoje');

  const reservations = activeTab === 'hoje' ? todayReservations : upcomingReservations;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmada' };
      case 'pending':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pendente' };
      case 'cancelled':
        return { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelada' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', label: status };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Tabs */}
      <View className="flex-row border-b border-[#F0F0F0]">
        <Pressable
          onPress={() => setActiveTab('hoje')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'hoje' ? 'border-[#222]' : 'border-transparent'
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'hoje' ? 'text-[#222]' : 'text-[#717171]'
            }`}
          >
            Hoje
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('proximos')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'proximos' ? 'border-[#222]' : 'border-transparent'
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'proximos' ? 'text-[#222]' : 'text-[#717171]'
            }`}
          >
            Proximos
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {reservations.length > 0 ? (
          <View className="p-6">
            {/* Stats Row */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-[#F5F5F5] rounded-xl p-4 items-center">
                <Text className="text-2xl font-bold text-[#222]">
                  {reservations.length}
                </Text>
                <Text className="text-xs text-[#717171]">Reservas</Text>
              </View>
              <View className="flex-1 bg-[#F5F5F5] rounded-xl p-4 items-center">
                <Text className="text-2xl font-bold text-[#222]">
                  R$ {reservations.reduce((acc, r) => acc + r.price, 0)}
                </Text>
                <Text className="text-xs text-[#717171]">Faturamento</Text>
              </View>
              <View className="flex-1 bg-[#F5F5F5] rounded-xl p-4 items-center">
                <Text className="text-2xl font-bold text-[#222]">
                  {reservations.length}h
                </Text>
                <Text className="text-xs text-[#717171]">Ocupacao</Text>
              </View>
            </View>

            {/* Reservations List */}
            <View className="gap-4">
              {reservations.map((reservation) => {
                const status = getStatusStyle(reservation.status);
                return (
                  <Pressable
                    key={reservation.id}
                    className="bg-white border border-[#E5E5E5] rounded-2xl p-4"
                  >
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <Text className="font-semibold text-[#222]">
                          {reservation.date === 'hoje' ? 'Hoje' : reservation.date}, {reservation.time} - {reservation.endTime}
                        </Text>
                        <Text className="text-sm text-[#717171]">
                          {reservation.sport} - {reservation.courtName}
                        </Text>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${status.bg}`}>
                        <Text className={`text-xs font-medium ${status.text}`}>
                          {status.label}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View className="h-px bg-[#E5E5E5] my-3" />

                    {/* User Info */}
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-[#E5E5E5] rounded-full items-center justify-center">
                        {reservation.userAvatar ? (
                          <Image
                            source={{ uri: reservation.userAvatar }}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <Text className="font-bold text-[#717171]">
                            {reservation.userName.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="font-medium text-[#222]">
                          {reservation.userName}
                        </Text>
                        <Text className="text-sm text-[#717171]">
                          {reservation.players} jogadores
                        </Text>
                      </View>
                      <Text className="font-semibold text-[#222]">
                        R$ {reservation.price}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          /* Empty State */
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View className="w-20 h-20 border-2 border-[#E5E5E5] rounded-2xl items-center justify-center mb-6">
              <MaterialIcons name="calendar-today" size={32} color="#B0B0B0" />
            </View>
            <Text className="text-xl font-semibold text-[#222] text-center mb-2">
              {activeTab === 'hoje'
                ? 'Voce nao tem reservas hoje'
                : 'Nenhuma reserva proxima'}
            </Text>
            <Text className="text-sm text-[#717171] text-center leading-5">
              Quando jogadores reservarem sua quadra, as reservas aparecerao aqui.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
