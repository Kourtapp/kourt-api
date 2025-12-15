import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

interface EarningsSummary {
  available_balance: number;
  pending_balance: number;
  lifetime_revenue: number;
  total_bookings: number;
  this_month: number;
  last_month: number;
}

interface Transaction {
  id: string;
  booking_id: string;
  gross_amount: number;
  net_amount: number;
  platform_fee: number;
  status: string;
  created_at: string;
  booking?: {
    date: string;
    court?: {
      name: string;
    };
  };
}

export default function HostEarningsScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<EarningsSummary>({
    available_balance: 0,
    pending_balance: 0,
    lifetime_revenue: 0,
    total_bookings: 0,
    this_month: 0,
    last_month: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch host data
      const { data: host } = await supabase
        .from('hosts')
        .select('id, available_balance, pending_balance, lifetime_revenue')
        .eq('user_id', user.id)
        .single();

      if (host) {
        // Fetch earnings
        const { data: earnings } = await supabase
          .from('host_earnings')
          .select(`
            *,
            booking:bookings(
              date,
              court:courts(name)
            )
          `)
          .eq('host_id', host.id)
          .order('created_at', { ascending: false })
          .limit(50);

        // Calculate monthly stats
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

        const thisMonthEarnings = earnings?.filter(e => e.created_at >= thisMonthStart)
          .reduce((sum, e) => sum + (e.net_amount || 0), 0) || 0;

        const lastMonthEarnings = earnings?.filter(e =>
          e.created_at >= lastMonthStart && e.created_at <= lastMonthEnd
        ).reduce((sum, e) => sum + (e.net_amount || 0), 0) || 0;

        setSummary({
          available_balance: host.available_balance || 0,
          pending_balance: host.pending_balance || 0,
          lifetime_revenue: host.lifetime_revenue || 0,
          total_bookings: earnings?.length || 0,
          this_month: thisMonthEarnings,
          last_month: lastMonthEarnings,
        });

        setTransactions(earnings || []);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const growthPercent = summary.last_month > 0
    ? ((summary.this_month - summary.last_month) / summary.last_month * 100).toFixed(0)
    : summary.this_month > 0 ? '100' : '0';

  const filteredTransactions = transactions.filter(t =>
    activeTab === 'pending' ? t.status === 'pending' : t.status === 'paid'
  );

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
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-[#F0F0F0]">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#222" />
        </Pressable>
        <Text className="text-xl font-bold text-[#222]">Ganhos</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <LinearGradient
          colors={['#222222', '#3D3D3D']}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <Text className="text-white/60 text-sm font-medium mb-1">Saldo Disponivel</Text>
          <Text className="text-white text-4xl font-bold mb-4">
            {formatCurrency(summary.available_balance)}
          </Text>

          <View className="flex-row gap-3">
            <Pressable className="flex-1 bg-white rounded-xl py-3 items-center">
              <Text className="text-[#222] font-bold">Sacar</Text>
            </Pressable>
            <Pressable className="flex-1 bg-white/20 rounded-xl py-3 items-center">
              <Text className="text-white font-bold">Historico</Text>
            </Pressable>
          </View>

          {summary.pending_balance > 0 && (
            <View className="mt-4 pt-4 border-t border-white/20">
              <View className="flex-row justify-between items-center">
                <Text className="text-white/60 text-sm">Pendente de liberacao</Text>
                <Text className="text-white font-bold">{formatCurrency(summary.pending_balance)}</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Stats Row */}
        <View className="flex-row gap-3 px-4 mt-4">
          <View className="flex-1 bg-white rounded-xl p-4 border border-[#E5E5E5]">
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialIcons name="trending-up" size={18} color="#22C55E" />
              <Text className="text-xs text-[#717171]">Este mes</Text>
            </View>
            <Text className="text-xl font-bold text-[#222]">{formatCurrency(summary.this_month)}</Text>
            {Number(growthPercent) !== 0 && (
              <View className="flex-row items-center mt-1">
                <MaterialIcons
                  name={Number(growthPercent) > 0 ? "arrow-upward" : "arrow-downward"}
                  size={12}
                  color={Number(growthPercent) > 0 ? "#22C55E" : "#EF4444"}
                />
                <Text className={`text-xs font-medium ${Number(growthPercent) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growthPercent}% vs mes anterior
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 border border-[#E5E5E5]">
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialIcons name="calendar-today" size={18} color="#3B82F6" />
              <Text className="text-xs text-[#717171]">Total reservas</Text>
            </View>
            <Text className="text-xl font-bold text-[#222]">{summary.total_bookings}</Text>
            <Text className="text-xs text-[#717171] mt-1">Desde o inicio</Text>
          </View>
        </View>

        {/* Lifetime Revenue */}
        <View className="mx-4 mt-4 bg-white rounded-xl p-4 border border-[#E5E5E5]">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xs text-[#717171]">Faturamento total</Text>
              <Text className="text-2xl font-bold text-[#222]">{formatCurrency(summary.lifetime_revenue)}</Text>
            </View>
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
              <MaterialIcons name="account-balance-wallet" size={24} color="#22C55E" />
            </View>
          </View>
        </View>

        {/* Transactions */}
        <View className="mt-6 px-4">
          <Text className="text-lg font-bold text-[#222] mb-4">Transacoes</Text>

          {/* Tabs */}
          <View className="flex-row bg-[#F0F0F0] rounded-xl p-1 mb-4">
            <Pressable
              onPress={() => setActiveTab('pending')}
              className={`flex-1 py-2 rounded-lg items-center ${
                activeTab === 'pending' ? 'bg-white' : ''
              }`}
            >
              <Text className={`font-medium ${activeTab === 'pending' ? 'text-[#222]' : 'text-[#717171]'}`}>
                Pendentes
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('paid')}
              className={`flex-1 py-2 rounded-lg items-center ${
                activeTab === 'paid' ? 'bg-white' : ''
              }`}
            >
              <Text className={`font-medium ${activeTab === 'paid' ? 'text-[#222]' : 'text-[#717171]'}`}>
                Pagos
              </Text>
            </Pressable>
          </View>

          {/* Transaction List */}
          {filteredTransactions.length > 0 ? (
            <View className="gap-3 pb-6">
              {filteredTransactions.map((transaction) => (
                <View
                  key={transaction.id}
                  className="bg-white rounded-xl p-4 border border-[#E5E5E5]"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="font-semibold text-[#222]">
                        {transaction.booking?.court?.name || 'Reserva'}
                      </Text>
                      <Text className="text-sm text-[#717171]">
                        {formatDate(transaction.created_at)}
                      </Text>
                    </View>
                    <Text className="font-bold text-green-600">
                      +{formatCurrency(transaction.net_amount)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center pt-2 border-t border-[#F0F0F0]">
                    <Text className="text-xs text-[#717171]">
                      Bruto: {formatCurrency(transaction.gross_amount)}
                    </Text>
                    <Text className="text-xs text-[#717171]">
                      Taxa: -{formatCurrency(transaction.platform_fee)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-10">
              <MaterialIcons name="receipt-long" size={48} color="#D4D4D4" />
              <Text className="text-[#717171] mt-2 text-center">
                {activeTab === 'pending'
                  ? 'Nenhuma transacao pendente'
                  : 'Nenhuma transacao paga'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
