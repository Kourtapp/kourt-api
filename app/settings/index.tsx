import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

const menuSections = [
  {
    title: 'Conta',
    items: [
      { icon: 'person', label: 'Editar Perfil', route: '/edit-profile' },
      { icon: 'security', label: 'Segurança', route: '/settings/security' },
      {
        icon: 'notifications',
        label: 'Notificações',
        route: '/settings/notifications',
      },
      { icon: 'credit-card', label: 'Pagamentos', route: '/payments' },
    ],
  },
  {
    title: 'Preferências',
    items: [
      {
        icon: 'sports-tennis',
        label: 'Meus Esportes',
        route: '/settings/sports',
      },
      {
        icon: 'location-on',
        label: 'Localização',
        route: '/settings/location',
      },
      {
        icon: 'language',
        label: 'Idioma',
        route: '/settings/language',
        value: 'Português',
      },
    ],
  },
  {
    title: 'Suporte',
    items: [
      { icon: 'help-outline', label: 'Central de Ajuda', route: '/help' },
      { icon: 'chat', label: 'Fale Conosco', route: '/contact' },
      { icon: 'description', label: 'Termos de Uso', route: '/terms' },
      {
        icon: 'privacy-tip',
        label: 'Política de Privacidade',
        route: '/privacy',
      },
    ],
  },
];

export default function SettingsScreen() {
  const { signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Configurações</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {menuSections.map((section) => (
          <View key={section.title} className="mt-6">
            <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 mb-2">
              {section.title}
            </Text>
            <View className="bg-white mx-5 rounded-2xl border border-neutral-200 overflow-hidden">
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  onPress={() => router.push(item.route as any)}
                  className={`flex-row items-center p-4 ${
                    index < section.items.length - 1
                      ? 'border-b border-neutral-100'
                      : ''
                  }`}
                >
                  <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color="#525252"
                    />
                  </View>
                  <Text className="flex-1 ml-3 text-black font-medium">
                    {item.label}
                  </Text>
                  {item.value && (
                    <Text className="text-sm text-neutral-500 mr-2">
                      {item.value}
                    </Text>
                  )}
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color="#A3A3A3"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="mt-6 px-5">
          <View className="bg-white rounded-2xl border border-neutral-200 p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-bold text-black">Kourt</Text>
                <Text className="text-sm text-neutral-500">Versão 1.0.0</Text>
              </View>
              <View className="px-3 py-1 bg-lime-100 rounded-full">
                <Text className="text-xs font-medium text-lime-800">
                  Atualizado
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="mx-5 mt-6 mb-8 flex-row items-center justify-center py-4"
        >
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text className="ml-2 text-red-500 font-medium">Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
