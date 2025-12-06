import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

interface MenuItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  route?: string;
  action?: () => void;
  danger?: boolean;
}

export default function HostMenuScreen() {
  const { profile, signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const quickActions = [
    { icon: 'bar-chart' as const, label: 'Desempenho', route: '/host/performance' },
    { icon: 'payments' as const, label: 'Ganhos', route: '/host/earnings' },
    { icon: 'calendar-month' as const, label: 'Disponibilidade', route: '/host/availability' },
    { icon: 'sell' as const, label: 'Promocoes', route: '/host/promotions' },
  ];

  const menuItems: MenuItem[] = [
    { icon: 'home-work', label: 'Minhas quadras', route: '/host/courts' },
    { icon: 'settings', label: 'Configuracoes da conta', route: '/settings' },
    { icon: 'menu-book', label: 'Recursos para hosts', route: '/host/resources' },
    { icon: 'help', label: 'Obtenha ajuda', route: '/help' },
    { icon: 'handshake', label: 'Encontrar um co-host', route: '/host/cohost' },
    { icon: 'add', label: 'Criar novo anuncio', route: '/court/add' },
    { icon: 'group-add', label: 'Indique um host', route: '/host/refer' },
    { icon: 'gavel', label: 'Juridico', route: '/legal' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
        <Text className="text-2xl font-bold text-[#222]">Menu</Text>
        <View className="flex-row gap-3">
          <Pressable className="w-10 h-10 items-center justify-center">
            <MaterialIcons name="notifications" size={24} color="#222" />
          </Pressable>
          <Pressable
            onPress={() => router.push(('/profile/' + profile?.id) as any)}
            className="w-10 h-10 bg-[#E5E5E5] rounded-full items-center justify-center"
          >
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <Text className="font-bold text-[#717171]">
                {profile?.name?.charAt(0) || 'U'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View className="mx-6 mt-6 bg-[#FAFAFA] rounded-2xl p-6 border border-[#E5E5E5]">
          <View className="flex-row gap-3 mb-4">
            <MaterialIcons name="sports-tennis" size={24} color="#222" />
            <MaterialIcons name="stadium" size={24} color="#222" />
            <MaterialIcons name="emoji-events" size={24} color="#222" />
          </View>
          <Text className="text-lg font-semibold text-[#222] mb-2">
            Novo no Kourt Host?
          </Text>
          <Text className="text-sm text-[#717171] leading-5 mb-4">
            Confira dicas e praticas recomendadas por hosts super bem avaliados.
          </Text>
          <Pressable className="bg-[#222] py-3 rounded-lg items-center">
            <Text className="text-white font-semibold">Comece ja</Text>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View className="flex-row flex-wrap gap-3 px-6 mt-6">
          {quickActions.map((action, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(action.route as any)}
              className="flex-1 min-w-[45%] bg-white border border-[#E5E5E5] rounded-xl p-4 items-center"
            >
              <MaterialIcons name={action.icon} size={24} color="#222" />
              <Text className="text-xs font-medium text-[#222] mt-2 text-center">
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Menu List */}
        <View className="mt-6 px-6">
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => {
                if (item.action) {
                  item.action();
                } else if (item.route) {
                  router.push(item.route as any);
                }
              }}
              className="flex-row items-center py-4 border-b border-[#F0F0F0]"
            >
              <View className="w-10 h-10 bg-[#F5F5F5] rounded-xl items-center justify-center mr-4">
                <MaterialIcons name={item.icon} size={20} color="#222" />
              </View>
              <Text className="flex-1 text-[#222] font-medium">{item.label}</Text>
              <MaterialIcons name="chevron-right" size={24} color="#B0B0B0" />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center py-4 px-6 mt-4 mb-8"
        >
          <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center mr-4">
            <MaterialIcons name="logout" size={20} color="#EF4444" />
          </View>
          <Text className="flex-1 text-red-500 font-medium">Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
