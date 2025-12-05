import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBookings } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { Booking } from '@/types/database.types';

type TabType = 'upcoming' | 'past';

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Pendente', color: 'text-amber-600', bg: 'bg-amber-50' },
  confirmed: {
    label: 'Confirmada',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  cancelled: { label: 'Cancelada', color: 'text-red-500', bg: 'bg-red-50' },
  completed: {
    label: 'Concluída',
    color: 'text-neutral-500',
    bg: 'bg-neutral-100',
  },
};

function BookingCard({ booking }: { booking: Booking }) {
  const status = statusConfig[booking.status] || statusConfig.pending;
  const court = booking.court as any;

  const formattedDate = new Date(booking.date + 'T12:00:00').toLocaleDateString(
    'pt-BR',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    },
  );

  const formattedTime = `${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}`;

  return (
    <Pressable
      onPress={() =>
        router.push(`/booking/confirmation?bookingId=${booking.id}` as any)
      }
      className="bg-white rounded-2xl p-4 mb-3 border border-neutral-100"
    >
      <View className="flex-row">
        {/* Image */}
        <View className="w-20 h-20 bg-neutral-200 rounded-xl items-center justify-center">
          <MaterialIcons name="sports-tennis" size={28} color="#A3A3A3" />
        </View>

        {/* Info */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-bold text-black" numberOfLines={1}>
                {court?.name || 'Quadra'}
              </Text>
              <Text className="text-xs text-neutral-500 mt-0.5">
                {court?.sport || 'Esporte'}
              </Text>
            </View>
            <View className={`px-2 py-1 rounded-full ${status.bg}`}>
              <Text className={`text-xs font-medium ${status.color}`}>
                {status.label}
              </Text>
            </View>
          </View>

          {/* Date & Time */}
          <View className="flex-row items-center gap-3 mt-3">
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="event" size={14} color="#737373" />
              <Text className="text-xs text-neutral-600">{formattedDate}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="schedule" size={14} color="#737373" />
              <Text className="text-xs text-neutral-600">{formattedTime}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Price */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <View className="flex-row items-center gap-1">
          <MaterialIcons name="location-on" size={14} color="#A3A3A3" />
          <Text className="text-xs text-neutral-500" numberOfLines={1}>
            {court?.address || 'Endereço'}
          </Text>
        </View>
        <Text className="font-bold text-black">
          {booking.total_price > 0 ? `R$ ${booking.total_price}` : 'Grátis'}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyState({ type }: { type: TabType }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
        <MaterialIcons
          name={type === 'upcoming' ? 'event-available' : 'history'}
          size={40}
          color="#A3A3A3"
        />
      </View>
      <Text className="text-lg font-bold text-black text-center">
        {type === 'upcoming'
          ? 'Nenhuma reserva agendada'
          : 'Nenhuma reserva anterior'}
      </Text>
      <Text className="text-neutral-500 text-center mt-2">
        {type === 'upcoming'
          ? 'Suas próximas reservas aparecerão aqui'
          : 'Seu histórico de reservas aparecerá aqui'}
      </Text>
      {type === 'upcoming' && (
        <Pressable
          onPress={() => router.push('/(tabs)/map')}
          className="mt-6 px-6 py-3 bg-black rounded-xl"
        >
          <Text className="text-white font-medium">Buscar quadras</Text>
        </Pressable>
      )}
    </View>
  );
}

function LoginPrompt() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
        <MaterialIcons name="person-outline" size={40} color="#A3A3A3" />
      </View>
      <Text className="text-lg font-bold text-black text-center">
        Faça login para ver suas reservas
      </Text>
      <Text className="text-neutral-500 text-center mt-2">
        Acesse sua conta para visualizar e gerenciar suas reservas
      </Text>
      <Pressable
        onPress={() => router.push('/(auth)/login')}
        className="mt-6 px-6 py-3 bg-black rounded-xl"
      >
        <Text className="text-white font-medium">Fazer login</Text>
      </Pressable>
    </View>
  );
}

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const { bookings, loading, refetch } = useBookings(user?.id);

  const today = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(
    (b) =>
      b.date >= today && b.status !== 'cancelled' && b.status !== 'completed',
  );

  const pastBookings = bookings.filter(
    (b) =>
      b.date < today || b.status === 'cancelled' || b.status === 'completed',
  );

  const displayedBookings =
    activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <LoginPrompt />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-2 pb-4">
        <Text className="text-2xl font-bold text-black">Minhas Reservas</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-5 mb-4">
        <Pressable
          onPress={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 rounded-xl mr-2 ${
            activeTab === 'upcoming'
              ? 'bg-black'
              : 'bg-white border border-neutral-200'
          }`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === 'upcoming' ? 'text-white' : 'text-neutral-600'
            }`}
          >
            Próximas ({upcomingBookings.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('past')}
          className={`flex-1 py-3 rounded-xl ml-2 ${
            activeTab === 'past'
              ? 'bg-black'
              : 'bg-white border border-neutral-200'
          }`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === 'past' ? 'text-white' : 'text-neutral-600'
            }`}
          >
            Histórico ({pastBookings.length})
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : displayedBookings.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <FlatList
          data={displayedBookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookingCard booking={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#000']}
              tintColor="#000"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
