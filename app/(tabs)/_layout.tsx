import { Tabs, router } from 'expo-router';
import { View, Pressable, GestureResponderEvent, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';

interface CenterButtonProps {
  onPress?: (
    e: GestureResponderEvent | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => void;
}

// Antigravity Center Button - Airbnb style square with rounded corners
function CenterButton({ onPress }: CenterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        top: -8,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: '#222222',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Feather name="plus" size={22} color="#FFFFFF" strokeWidth={2.5} />
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
        tabBarActiveTintColor: '#222222',
        tabBarInactiveTintColor: '#717171',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EBEBEB',
          borderTopWidth: 1,
          height: 84,
          paddingTop: 10,
          paddingHorizontal: 20,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '400',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <Feather name="map" size={24} color={color} />
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
            <Feather name="users" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
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
          <Feather name="home" size={18} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>
            Modo Host
          </Text>
        </Pressable>
      )}
    </View>
  );
}
