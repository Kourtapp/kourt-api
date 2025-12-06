import { Tabs, router } from 'expo-router';
import { View, Pressable, GestureResponderEvent, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';

interface CenterButtonProps {
  onPress?: (
    e: GestureResponderEvent | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => void;
}

function CenterButton({ onPress }: CenterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <MaterialIcons name="add" size={30} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { profile } = useAuthStore();

  // Verificar se o usuário tem quadras cadastradas (é host)
  const isHost = profile?.is_host || false;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F5F5F5',
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plus"
        options={{
          title: '',
          tabBarButton: (props) => <CenterButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="forum" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          href: null, // Ocultar da Tab Bar
        }}
      />
    </Tabs>

      {/* Mode Switcher - Modo Host */}
      {isHost && (
        <Pressable
          onPress={() => router.push('/host')}
          style={{
            position: 'absolute',
            bottom: 100,
            left: 24,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#222',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            gap: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <MaterialIcons name="home-work" size={18} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>
            Modo Host
          </Text>
        </Pressable>
      )}
    </View>
  );
}
