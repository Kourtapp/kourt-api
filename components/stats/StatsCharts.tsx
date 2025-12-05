import { View, Text, Dimensions } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(115, 115, 115, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#84CC16',
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export function StatCard({
  label,
  value,
  icon,
  color = '#000',
}: StatCardProps) {
  return (
    <View className="flex-1 bg-neutral-50 rounded-2xl p-4">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}15` }}
      >
        <MaterialIcons name={icon as any} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold text-black">{value}</Text>
      <Text className="text-xs text-neutral-500">{label}</Text>
    </View>
  );
}

interface WeeklyChartProps {
  data: { week: string; matches: number }[];
}

export function WeeklyProgressChart({ data }: WeeklyChartProps) {
  if (data.length === 0) return null;

  return (
    <View className="bg-neutral-50 rounded-2xl p-4">
      <Text className="text-base font-bold text-black mb-4">
        Partidas por Semana
      </Text>
      <LineChart
        data={{
          labels: data.map((d) => d.week),
          datasets: [{ data: data.map((d) => d.matches || 0) }],
        }}
        width={chartWidth - 32}
        height={180}
        chartConfig={{
          ...chartConfig,
          backgroundGradientFrom: '#FAFAFA',
          backgroundGradientTo: '#FAFAFA',
        }}
        bezier
        style={{ marginLeft: -16, borderRadius: 12 }}
        withInnerLines={false}
        withOuterLines={false}
      />
    </View>
  );
}

interface SportDistributionProps {
  data: { sport: string; count: number }[];
}

const pieColors = ['#000000', '#84CC16', '#3B82F6', '#F59E0B', '#EF4444'];

export function SportDistributionChart({ data }: SportDistributionProps) {
  if (data.length === 0) {
    return (
      <View className="bg-neutral-50 rounded-2xl p-4">
        <Text className="text-base font-bold text-black mb-4">
          Distribuição por Esporte
        </Text>
        <View className="h-32 items-center justify-center">
          <Text className="text-neutral-400 text-sm">Sem dados ainda</Text>
        </View>
      </View>
    );
  }

  const pieData = data.map((item, index) => ({
    name: item.sport,
    count: item.count,
    color: pieColors[index % pieColors.length],
    legendFontColor: '#737373',
    legendFontSize: 12,
  }));

  return (
    <View className="bg-neutral-50 rounded-2xl p-4">
      <Text className="text-base font-bold text-black mb-4">
        Distribuição por Esporte
      </Text>
      <PieChart
        data={pieData}
        width={chartWidth - 32}
        height={180}
        chartConfig={chartConfig}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
      />
    </View>
  );
}

interface WinRateChartProps {
  wins: number;
  losses: number;
}

export function WinRateChart({ wins, losses }: WinRateChartProps) {
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <View className="bg-neutral-50 rounded-2xl p-4">
      <Text className="text-base font-bold text-black mb-4">
        Vitórias vs Derrotas
      </Text>
      {total > 0 ? (
        <>
          <BarChart
            data={{
              labels: ['Vitórias', 'Derrotas'],
              datasets: [{ data: [wins, losses] }],
            }}
            width={chartWidth - 32}
            height={150}
            chartConfig={{
              ...chartConfig,
              backgroundGradientFrom: '#FAFAFA',
              backgroundGradientTo: '#FAFAFA',
              barPercentage: 0.6,
              color: (opacity = 1, index) =>
                index === 0
                  ? `rgba(132, 204, 22, ${opacity})`
                  : `rgba(239, 68, 68, ${opacity})`,
            }}
            style={{ marginLeft: -16, borderRadius: 12 }}
            showValuesOnTopOfBars
            withInnerLines={false}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
          />
          <View className="flex-row items-center justify-center mt-2">
            <Text className="text-sm text-neutral-600">
              Win Rate:{' '}
              <Text className="font-bold text-lime-600">{winRate}%</Text>
            </Text>
          </View>
        </>
      ) : (
        <View className="h-32 items-center justify-center">
          <Text className="text-neutral-400 text-sm">
            Jogue para ver seus dados
          </Text>
        </View>
      )}
    </View>
  );
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  label: string;
  value: string;
}

export function ProgressRing({
  progress,
  size = 80,
  label,
  value,
}: ProgressRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View className="items-center">
      <View
        style={{ width: size, height: size }}
        className="items-center justify-center"
      >
        {/* Background circle */}
        <View
          className="absolute rounded-full border-neutral-200"
          style={{
            width: size,
            height: size,
            borderWidth: strokeWidth,
          }}
        />
        {/* Progress indicator - simplified visual */}
        <View
          className="absolute rounded-full"
          style={{
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            backgroundColor: '#84CC1620',
          }}
        />
        {/* Center text */}
        <Text className="text-lg font-bold text-black">{value}</Text>
      </View>
      <Text className="text-xs text-neutral-500 mt-2">{label}</Text>
    </View>
  );
}
