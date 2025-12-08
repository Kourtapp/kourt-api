import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface PerformanceData {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  occupancyRate: number;
  avgRating: number;
  totalReviews: number;
  responseTime: string;
  acceptanceRate: number;
  repeatCustomers: number;
  peakHours: { hour: string; bookings: number }[];
  weeklyStats: { day: string; bookings: number }[];
}

export default function HostPerformanceScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [data, setData] = useState<PerformanceData>({
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    occupancyRate: 0,
    avgRating: 0,
    totalReviews: 0,
    responseTime: '< 1h',
    acceptanceRate: 100,
    repeatCustomers: 0,
    peakHours: [],
    weeklyStats: [],
  });

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch host and bookings data
      const { data: host } = await supabase
        .from('hosts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!host) {
        setLoading(false);
        return;
      }

      // Fetch courts owned by this host
      const { data: courts } = await supabase
        .from('courts')
        .select('id')
        .eq('owner_id', user.id);

      if (!courts?.length) {
        setLoading(false);
        return;
      }

      const courtIds = courts.map(c => c.id);

      // Fetch bookings
      const periodStart = new Date();
      if (period === 'week') periodStart.setDate(periodStart.getDate() - 7);
      else if (period === 'month') periodStart.setMonth(periodStart.getMonth() - 1);
      else periodStart.setFullYear(periodStart.getFullYear() - 1);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .in('court_id', courtIds)
        .gte('created_at', periodStart.toISOString());

      const completed = bookings?.filter(b => b.status === 'completed').length || 0;
      const cancelled = bookings?.filter(b => b.status === 'cancelled').length || 0;
      const total = bookings?.length || 0;

      // Calculate occupancy (simplified)
      const totalPossibleHours = courtIds.length * 12 * (period === 'week' ? 7 : period === 'month' ? 30 : 365);
      const bookedHours = bookings?.reduce((sum, b) => sum + (b.duration_hours || 1), 0) || 0;
      const occupancy = totalPossibleHours > 0 ? (bookedHours / totalPossibleHours) * 100 : 0;

      // Peak hours analysis
      const hourCounts: Record<number, number> = {};
      bookings?.forEach(b => {
        if (b.start_time) {
          const hour = parseInt(b.start_time.split(':')[0]);
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });

      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({
          hour: `${hour}:00`,
          bookings: count
        }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      // Weekly distribution
      const dayCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      bookings?.forEach(b => {
        const day = new Date(b.date).getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      const weeklyStats = Object.entries(dayCounts).map(([day, count]) => ({
        day: dayNames[parseInt(day)],
        bookings: count
      }));

      // Unique customers
      const uniqueUsers = new Set(bookings?.map(b => b.user_id)).size;
      const totalUsers = bookings?.length || 0;
      const repeatRate = totalUsers > 0 ? ((totalUsers - uniqueUsers) / totalUsers) * 100 : 0;

      setData({
        totalBookings: total,
        completedBookings: completed,
        cancelledBookings: cancelled,
        occupancyRate: Math.min(occupancy, 100),
        avgRating: 4.8, // TODO: Implement ratings
        totalReviews: 0,
        responseTime: '< 1h',
        acceptanceRate: total > 0 ? ((total - cancelled) / total) * 100 : 100,
        repeatCustomers: Math.round(repeatRate),
        peakHours,
        weeklyStats,
      });
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const maxBookings = Math.max(...data.weeklyStats.map(s => s.bookings), 1);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#222" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-[#F0F0F0]">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="#222" />
          </Pressable>
          <Text className="text-xl font-bold text-[#222]">Desempenho</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Period Selector */}
        <View className="flex-row mx-4 mt-4 bg-white rounded-xl p-1 border border-[#E5E5E5]">
          {(['week', 'month', 'year'] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg items-center ${
                period === p ? 'bg-[#222]' : ''
              }`}
            >
              <Text className={`font-medium ${period === p ? 'text-white' : 'text-[#717171]'}`}>
                {p === 'week' ? '7 dias' : p === 'month' ? '30 dias' : '1 ano'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-4 mt-4 gap-3">
          {/* Bookings */}
          <View className="bg-white rounded-xl p-4 border border-[#E5E5E5]" style={{ width: (width - 44) / 2 }}>
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center">
                <MaterialIcons name="calendar-today" size={18} color="#3B82F6" />
              </View>
              <Text className="text-xs text-[#717171]">Reservas</Text>
            </View>
            <Text className="text-2xl font-bold text-[#222]">{data.totalBookings}</Text>
            <Text className="text-xs text-green-600">{data.completedBookings} concluidas</Text>
          </View>

          {/* Occupancy */}
          <View className="bg-white rounded-xl p-4 border border-[#E5E5E5]" style={{ width: (width - 44) / 2 }}>
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center">
                <MaterialIcons name="pie-chart" size={18} color="#22C55E" />
              </View>
              <Text className="text-xs text-[#717171]">Ocupacao</Text>
            </View>
            <Text className="text-2xl font-bold text-[#222]">{data.occupancyRate.toFixed(0)}%</Text>
            <View className="h-1.5 bg-[#E5E5E5] rounded-full mt-2">
              <View
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.min(data.occupancyRate, 100)}%` }}
              />
            </View>
          </View>

          {/* Rating */}
          <View className="bg-white rounded-xl p-4 border border-[#E5E5E5]" style={{ width: (width - 44) / 2 }}>
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 bg-amber-100 rounded-lg items-center justify-center">
                <MaterialIcons name="star" size={18} color="#F59E0B" />
              </View>
              <Text className="text-xs text-[#717171]">Avaliacao</Text>
            </View>
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold text-[#222]">{data.avgRating.toFixed(1)}</Text>
              <Text className="text-sm text-[#717171] ml-1">/ 5.0</Text>
            </View>
            <Text className="text-xs text-[#717171]">{data.totalReviews} avaliacoes</Text>
          </View>

          {/* Acceptance Rate */}
          <View className="bg-white rounded-xl p-4 border border-[#E5E5E5]" style={{ width: (width - 44) / 2 }}>
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center">
                <MaterialIcons name="check-circle" size={18} color="#8B5CF6" />
              </View>
              <Text className="text-xs text-[#717171]">Aceitacao</Text>
            </View>
            <Text className="text-2xl font-bold text-[#222]">{data.acceptanceRate.toFixed(0)}%</Text>
            <Text className="text-xs text-[#717171]">Taxa de aceitacao</Text>
          </View>
        </View>

        {/* Weekly Distribution */}
        <View className="mx-4 mt-6 bg-white rounded-xl p-4 border border-[#E5E5E5]">
          <Text className="font-bold text-[#222] mb-4">Distribuicao Semanal</Text>
          <View className="flex-row justify-between items-end h-24">
            {data.weeklyStats.map((stat, index) => (
              <View key={index} className="items-center flex-1">
                <View
                  className="bg-blue-500 rounded-t w-6"
                  style={{
                    height: stat.bookings > 0 ? (stat.bookings / maxBookings) * 80 : 4,
                    minHeight: 4,
                  }}
                />
                <Text className="text-xs text-[#717171] mt-2">{stat.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Peak Hours */}
        <View className="mx-4 mt-4 bg-white rounded-xl p-4 border border-[#E5E5E5]">
          <Text className="font-bold text-[#222] mb-4">Horarios de Pico</Text>
          {data.peakHours.length > 0 ? (
            <View className="gap-3">
              {data.peakHours.map((peak, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="w-8 h-8 bg-[#F0F0F0] rounded-lg items-center justify-center mr-3">
                    <MaterialIcons name="access-time" size={16} color="#717171" />
                  </View>
                  <Text className="flex-1 font-medium text-[#222]">{peak.hour}</Text>
                  <Text className="text-[#717171]">{peak.bookings} reservas</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-[#717171] text-center py-4">
              Sem dados suficientes
            </Text>
          )}
        </View>

        {/* Tips */}
        <View className="mx-4 mt-4 mb-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialIcons name="lightbulb" size={20} color="#3B82F6" />
            <Text className="font-bold text-blue-900">Dica para melhorar</Text>
          </View>
          <Text className="text-blue-800 text-sm leading-5">
            Mantenha sua taxa de aceitacao acima de 90% para aparecer em destaque nas buscas
            e atrair mais jogadores.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
