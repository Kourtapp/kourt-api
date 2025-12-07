import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';

type MenuItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  route: string;
  isPrimary?: boolean;
  isLime?: boolean;
  pro?: boolean;
};

const gratuitoItems: MenuItem[] = [
  {
    icon: 'camera-alt',
    title: 'Registrar Partida',
    description: 'Foto, métricas e pontos XP',
    route: '/match/record',
    isPrimary: true,
  },
  {
    icon: 'groups',
    title: 'Criar Jogo',
    description: 'Monte uma partida com amigos',
    route: '/match/create',
    isLime: true,
  },
  {
    icon: 'add-location-alt',
    title: 'Adicionar Quadra',
    description: 'Pública, privada ou arena',
    route: '/court/add',
  },
];

const proItems: MenuItem[] = [
  {
    icon: 'person-add',
    title: 'Convidar Jogadores',
    description: 'Chame amigos para suas partidas',
    route: '/invite',
    pro: true,
  },
  {
    icon: 'emoji-events',
    title: 'Torneios',
    description: 'Organize campeonatos',
    route: '/tournament/create',
    pro: true,
  },
  {
    icon: 'leaderboard',
    title: 'Ranking Privado',
    description: 'Rankings do seu grupo',
    route: '/rankings/private',
    pro: true,
  },
  {
    icon: 'bar-chart',
    title: 'Analytics',
    description: 'Estatísticas avançadas',
    route: '/analytics',
    pro: true,
  },
];

export default function PlusScreen() {
  const { profile } = useAuthStore();
  const isPro = profile?.subscription === 'pro';

  const handleItemPress = (item: MenuItem) => {
    if (item.pro && !isPro) {
      router.push('/subscription' as any);
    } else {
      router.push(item.route as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Section Label */}
        <View className="px-5 pt-5 pb-2">
          <Text className="text-xs font-medium text-neutral-400 tracking-wide">
            GRATUITO
          </Text>
        </View>

        {/* Gratuito Items */}
        <View className="px-5 gap-3 pb-6">
          {gratuitoItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleItemPress(item)}
              className={`flex-row items-center p-4 rounded-2xl overflow-hidden ${
                item.isPrimary ? 'bg-neutral-900' : item.isLime ? 'bg-lime-50 border border-lime-200' : 'bg-white border border-neutral-200'
              }`}
            >
              <View
                className={`w-12 h-12 rounded-xl items-center justify-center ${
                  item.isPrimary ? 'bg-white' : item.isLime ? 'bg-lime-500' : 'bg-neutral-900'
                }`}
              >
                <MaterialIcons
                  name={item.icon}
                  size={24}
                  color={item.isPrimary ? '#000' : item.isLime ? '#1A2E05' : '#fff'}
                />
              </View>
              <View className="flex-1 ml-4">
                <Text
                  className={`text-base font-semibold ${
                    item.isPrimary ? 'text-white' : 'text-black'
                  }`}
                >
                  {item.title}
                </Text>
                <Text
                  className={`text-sm mt-0.5 ${
                    item.isPrimary ? 'text-neutral-400' : item.isLime ? 'text-lime-700' : 'text-neutral-500'
                  }`}
                >
                  {item.description}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={item.isPrimary ? '#fff' : item.isLime ? '#84CC16' : '#A3A3A3'}
              />
            </Pressable>
          ))}
        </View>

        {/* PRO Section Label */}
        <View className="px-5 pb-2 flex-row items-center gap-2">
          <Text className="text-xs font-medium text-neutral-400 tracking-wide">
            PRO
          </Text>
          {!isPro && (
            <View className="px-2 py-0.5 bg-neutral-900 rounded">
              <Text className="text-[10px] font-bold text-white">UPGRADE</Text>
            </View>
          )}
        </View>

        {/* PRO Items */}
        <View className="px-5 gap-3">
          {proItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleItemPress(item)}
              className="flex-row items-center p-4 rounded-2xl bg-white border border-neutral-200"
            >
              <View className="w-12 h-12 rounded-xl items-center justify-center bg-neutral-900">
                <MaterialIcons name={item.icon} size={24} color="#fff" />
              </View>
              <View className="flex-1 ml-4">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-semibold text-black">
                    {item.title}
                  </Text>
                  {!isPro && (
                    <MaterialIcons name="lock" size={14} color="#F59E0B" />
                  )}
                </View>
                <Text className="text-sm text-neutral-500 mt-0.5">
                  {item.description}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
            </Pressable>
          ))}
        </View>

        {/* Bottom Upgrade Banner */}
        {!isPro && (
          <Pressable
            onPress={() => router.push('/subscription' as any)}
            className="mx-5 mt-8 mb-8 p-4 bg-neutral-900 rounded-2xl"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-lime-500/20 rounded-xl items-center justify-center">
                <MaterialIcons name="rocket-launch" size={24} color="#84CC16" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold text-white">
                  Upgrade para Pro
                </Text>
                <Text className="text-sm text-neutral-400 mt-0.5">
                  Desbloqueie torneios e muito mais
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/subscription' as any)}
                className="px-4 py-2 bg-white rounded-xl"
              >
                <Text className="text-sm font-semibold text-lime-600">
                  Ver planos
                </Text>
              </Pressable>
            </View>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
