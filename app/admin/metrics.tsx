import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { analyticsService } from '@/services/analyticsService';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

function MetricCard({ title, value, subtitle, change, icon, color }: MetricCardProps) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-neutral-100">
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <MaterialIcons name={icon} size={20} color={color} />
        </View>
        {change !== undefined && (
          <View
            className={`flex-row items-center px-2 py-1 rounded-full ${
              change >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <MaterialIcons
              name={change >= 0 ? 'trending-up' : 'trending-down'}
              size={12}
              color={change >= 0 ? '#22C55E' : '#EF4444'}
            />
            <Text
              className={`text-xs font-medium ml-1 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-black">{value}</Text>
      <Text className="text-sm text-neutral-500">{title}</Text>
      {subtitle && <Text className="text-xs text-neutral-400 mt-1">{subtitle}</Text>}
    </View>
  );
}

function FunnelStep({
  label,
  value,
  percentage,
  isLast,
}: {
  label: string;
  value: number;
  percentage: number;
  isLast?: boolean;
}) {
  return (
    <View className="items-center">
      <View
        className="h-16 bg-lime-500 rounded-lg items-center justify-center"
        style={{ width: `${Math.max(percentage, 30)}%` }}
      >
        <Text className="text-white font-bold">{value}</Text>
      </View>
      <Text className="text-xs text-neutral-500 mt-2">{label}</Text>
      <Text className="text-xs font-medium text-neutral-700">{percentage}%</Text>
      {!isLast && (
        <MaterialIcons name="keyboard-arrow-down" size={20} color="#A3A3A3" />
      )}
    </View>
  );
}

export default function MetricsDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Metrics state
  const [northStar, setNorthStar] = useState({
    thisWeek: 0,
    lastWeek: 0,
    weeklyGrowth: 0,
    monthlyTotal: 0,
  });

  const [growth, setGrowth] = useState({
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalUsers: 0,
    matchesCreated: 0,
    bookingsCompleted: 0,
    activeSubscribers: 0,
  });

  const [revenue, setRevenue] = useState({
    totalGMV: 0,
    totalRevenue: 0,
    takeRate: 10,
    monthlyGMV: 0,
    monthlyRevenue: 0,
    avgTransactionValue: 0,
  });

  const [funnel, setFunnel] = useState({
    signups: 0,
    onboardingCompleted: 0,
    firstMatch: 0,
    subscription: 0,
    conversionRates: {
      signupToOnboarding: 0,
      onboardingToMatch: 0,
      matchToSubscription: 0,
    },
  });

  const [retention, setRetention] = useState({
    dailyActiveUsers: [] as number[],
    weeklyActiveUsers: [] as number[],
    monthlyActiveUsers: 0,
    retentionRate: 0,
  });

  const loadMetrics = async () => {
    try {
      const [northStarData, growthData, revenueData, funnelData, retentionData] =
        await Promise.all([
          analyticsService.getNorthStarMetric(),
          analyticsService.getGrowthMetrics(),
          analyticsService.getRevenueMetrics(),
          analyticsService.getConversionFunnel(),
          analyticsService.getRetentionMetrics(30),
        ]);

      setNorthStar(northStarData);
      setGrowth(growthData);
      setRevenue(revenueData);
      setFunnel(funnelData);
      setRetention(retentionData);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMetrics();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#fafafa] items-center justify-center">
        <ActivityIndicator size="large" color="#84CC16" />
        <Text className="text-neutral-500 mt-4">Carregando métricas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-black">Dashboard</Text>
          <Text className="text-sm text-neutral-500">Métricas de Crescimento</Text>
        </View>
        <Pressable
          onPress={onRefresh}
          className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
        >
          <MaterialIcons name="refresh" size={20} color="#525252" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* North Star Metric */}
        <View className="px-5 pt-6">
          <View className="flex-row items-center gap-2 mb-4">
            <MaterialIcons name="star" size={20} color="#F59E0B" />
            <Text className="text-lg font-bold text-black">North Star Metric</Text>
          </View>
          <View className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-2xl p-5">
            <Text className="text-white/80 text-sm">Partidas Jogadas (Esta Semana)</Text>
            <View className="flex-row items-end gap-3 mt-2">
              <Text className="text-5xl font-bold text-white">{northStar.thisWeek}</Text>
              {northStar.weeklyGrowth !== 0 && (
                <View
                  className={`flex-row items-center px-3 py-1 rounded-full mb-2 ${
                    northStar.weeklyGrowth >= 0 ? 'bg-white/20' : 'bg-red-500/30'
                  }`}
                >
                  <MaterialIcons
                    name={northStar.weeklyGrowth >= 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color="#fff"
                  />
                  <Text className="text-white font-medium ml-1">
                    {northStar.weeklyGrowth > 0 ? '+' : ''}
                    {northStar.weeklyGrowth}%
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-6 mt-4">
              <View>
                <Text className="text-white/60 text-xs">Semana Passada</Text>
                <Text className="text-white font-semibold">{northStar.lastWeek}</Text>
              </View>
              <View>
                <Text className="text-white/60 text-xs">Este Mês</Text>
                <Text className="text-white font-semibold">{northStar.monthlyTotal}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* KPIs Principais */}
        <View className="px-5 pt-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            KPIs Principais
          </Text>
          <View className="flex-row gap-3 mb-3">
            <MetricCard
              title="Novos Usuários"
              value={growth.newUsersToday}
              subtitle="Hoje"
              icon="person-add"
              color="#3B82F6"
            />
            <MetricCard
              title="GMV Mensal"
              value={formatCurrency(revenue.monthlyGMV)}
              subtitle={`Take Rate: ${revenue.takeRate}%`}
              icon="attach-money"
              color="#22C55E"
            />
          </View>
          <View className="flex-row gap-3">
            <MetricCard
              title="Receita Mensal"
              value={formatCurrency(revenue.monthlyRevenue)}
              icon="trending-up"
              color="#8B5CF6"
            />
            <MetricCard
              title="LTV/CAC"
              value="3.2x"
              subtitle="Saudável > 3x"
              icon="analytics"
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Aquisição */}
        <View className="px-5 pt-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Aquisição
          </Text>
          <View className="bg-white rounded-2xl p-4 border border-neutral-100">
            <View className="flex-row">
              <View className="flex-1 items-center py-3 border-r border-neutral-100">
                <Text className="text-2xl font-bold text-black">{growth.newUsersToday}</Text>
                <Text className="text-xs text-neutral-500">Hoje</Text>
              </View>
              <View className="flex-1 items-center py-3 border-r border-neutral-100">
                <Text className="text-2xl font-bold text-black">{growth.newUsersThisWeek}</Text>
                <Text className="text-xs text-neutral-500">Semana</Text>
              </View>
              <View className="flex-1 items-center py-3 border-r border-neutral-100">
                <Text className="text-2xl font-bold text-black">{growth.newUsersThisMonth}</Text>
                <Text className="text-xs text-neutral-500">Mês</Text>
              </View>
              <View className="flex-1 items-center py-3">
                <Text className="text-2xl font-bold text-black">{growth.totalUsers}</Text>
                <Text className="text-xs text-neutral-500">Total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Funil de Conversão */}
        <View className="px-5 pt-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Funil de Ativação
          </Text>
          <View className="bg-white rounded-2xl p-4 border border-neutral-100">
            <FunnelStep
              label="Cadastros"
              value={funnel.signups}
              percentage={100}
            />
            <FunnelStep
              label="Onboarding Completo"
              value={funnel.onboardingCompleted}
              percentage={funnel.conversionRates.signupToOnboarding}
            />
            <FunnelStep
              label="Primeira Partida"
              value={funnel.firstMatch}
              percentage={funnel.conversionRates.onboardingToMatch}
            />
            <FunnelStep
              label="Assinatura"
              value={funnel.subscription}
              percentage={funnel.conversionRates.matchToSubscription}
              isLast
            />
          </View>
        </View>

        {/* Retenção */}
        <View className="px-5 pt-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Retenção
          </Text>
          <View className="bg-white rounded-2xl p-4 border border-neutral-100">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm text-neutral-500">Taxa de Retenção (7 dias)</Text>
                <Text className="text-3xl font-bold text-black">{retention.retentionRate}%</Text>
              </View>
              <View className="items-end">
                <Text className="text-sm text-neutral-500">MAU</Text>
                <Text className="text-2xl font-bold text-black">
                  {retention.monthlyActiveUsers}
                </Text>
              </View>
            </View>
            {/* DAU Chart Placeholder */}
            <View className="h-20 bg-neutral-50 rounded-xl flex-row items-end justify-around px-2 pt-2">
              {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                <View
                  key={i}
                  className="flex-1 mx-0.5 bg-lime-400 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </View>
            <View className="flex-row justify-between mt-2 px-1">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                <Text key={d} className="text-[10px] text-neutral-400">
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Receita */}
        <View className="px-5 pt-6 pb-8">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Receita
          </Text>
          <View className="bg-white rounded-2xl border border-neutral-100">
            <View className="flex-row p-4 border-b border-neutral-100">
              <View className="flex-1">
                <Text className="text-sm text-neutral-500">GMV Total</Text>
                <Text className="text-xl font-bold text-black">
                  {formatCurrency(revenue.totalGMV)}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-sm text-neutral-500">Receita Total</Text>
                <Text className="text-xl font-bold text-lime-600">
                  {formatCurrency(revenue.totalRevenue)}
                </Text>
              </View>
            </View>
            <View className="flex-row p-4">
              <View className="flex-1">
                <Text className="text-sm text-neutral-500">Ticket Médio</Text>
                <Text className="text-lg font-semibold text-black">
                  {formatCurrency(revenue.avgTransactionValue)}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-sm text-neutral-500">Assinantes PRO</Text>
                <Text className="text-lg font-semibold text-black">
                  {growth.activeSubscribers}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
