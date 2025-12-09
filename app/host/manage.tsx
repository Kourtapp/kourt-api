import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

interface ManageCard {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bgColor: string;
  route: string;
  badge?: number;
}

const manageCards: ManageCard[] = [
  {
    id: 'courts',
    title: 'Minhas Quadras',
    subtitle: 'Gerenciar quadras e horários',
    icon: 'sports-tennis',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    route: '/host/courts',
  },
  {
    id: 'tournaments',
    title: 'Meus Torneios',
    subtitle: 'Criar e gerenciar torneios',
    icon: 'emoji-events',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    route: '/tournaments/manage',
  },
  {
    id: 'earnings',
    title: 'Financeiro',
    subtitle: 'Ganhos, pagamentos e extratos',
    icon: 'account-balance-wallet',
    color: '#22C55E',
    bgColor: '#F0FDF4',
    route: '/host/earnings',
  },
  {
    id: 'performance',
    title: 'Desempenho',
    subtitle: 'Métricas e relatórios',
    icon: 'analytics',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    route: '/host/performance',
  },
];

const quickActions = [
  {
    id: 'add-court',
    label: 'Nova Quadra',
    icon: 'add-circle' as keyof typeof MaterialIcons.glyphMap,
    route: '/court/add',
  },
  {
    id: 'add-tournament',
    label: 'Novo Torneio',
    icon: 'emoji-events' as keyof typeof MaterialIcons.glyphMap,
    route: '/tournaments/create',
  },
  {
    id: 'block-time',
    label: 'Bloquear Horário',
    icon: 'block' as keyof typeof MaterialIcons.glyphMap,
    route: '/host/agenda',
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: 'settings' as keyof typeof MaterialIcons.glyphMap,
    route: '/host/menu',
  },
];

export default function HostManageScreen() {
  const { profile } = useAuthStore();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-4">
        <Text className="text-2xl font-bold text-black">Gestão</Text>
        <Text className="text-sm text-neutral-500 mt-1">
          Gerencie seu negócio
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Quick Stats */}
        <View className="px-5 mb-6">
          <View className="bg-gradient-to-r from-pink-500 to-rose-500 bg-[#EC4899] rounded-2xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white/80 text-sm font-medium">Este mês</Text>
              <View className="bg-white/20 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Dezembro</Text>
              </View>
            </View>
            <View className="flex-row">
              <View className="flex-1">
                <Text className="text-white/60 text-xs mb-1">Faturamento</Text>
                <Text className="text-white text-2xl font-bold">R$ 0,00</Text>
              </View>
              <View className="w-px bg-white/20 mx-4" />
              <View className="flex-1">
                <Text className="text-white/60 text-xs mb-1">Reservas</Text>
                <Text className="text-white text-2xl font-bold">0</Text>
              </View>
              <View className="w-px bg-white/20 mx-4" />
              <View className="flex-1">
                <Text className="text-white/60 text-xs mb-1">Ocupação</Text>
                <Text className="text-white text-2xl font-bold">0%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mb-6">
          <Text className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Ações Rápidas
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => router.push(action.route as any)}
                className="items-center"
              >
                <View className="w-14 h-14 bg-neutral-100 rounded-2xl items-center justify-center mb-2">
                  <MaterialIcons name={action.icon} size={24} color="#525252" />
                </View>
                <Text className="text-xs text-neutral-600 font-medium text-center">
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Management Cards */}
        <View className="px-5">
          <Text className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Gerenciar
          </Text>
          <View className="gap-3">
            {manageCards.map((card) => (
              <Pressable
                key={card.id}
                onPress={() => router.push(card.route as any)}
                className="flex-row items-center p-4 bg-white border border-neutral-200 rounded-2xl active:bg-neutral-50"
              >
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <MaterialIcons name={card.icon} size={24} color={card.color} />
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-semibold text-black text-base">
                      {card.title}
                    </Text>
                    {card.badge && card.badge > 0 && (
                      <View className="bg-red-500 px-1.5 py-0.5 rounded-full">
                        <Text className="text-white text-xs font-bold">{card.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-neutral-500 mt-0.5">
                    {card.subtitle}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#D4D4D4" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Help Section */}
        <View className="px-5 mt-6">
          <Pressable
            onPress={() => router.push('/help' as any)}
            className="flex-row items-center p-4 bg-neutral-50 rounded-2xl"
          >
            <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
              <MaterialIcons name="help-outline" size={20} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-medium text-black">Precisa de ajuda?</Text>
              <Text className="text-sm text-neutral-500">Central de suporte para hosts</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color="#A3A3A3" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
