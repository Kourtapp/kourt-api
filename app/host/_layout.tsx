import { Tabs } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HostLayout() {
  const insets = useSafeAreaInsets();
  const topBarHeight = insets.top + 44;

  return (
    <View className="flex-1 bg-white">
      {/* Mode Switcher - Barra fixa no topo */}
      <View
        className="absolute top-0 left-0 right-0 z-50 bg-[#222] px-4 flex-row items-center"
        style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
      >
        <MaterialIcons name="business" size={18} color="#EC4899" />
        <Text className="text-white font-semibold text-sm ml-2 flex-1">Modo Anfitrião</Text>
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
        >
          <MaterialIcons name="sports-tennis" size={14} color="#FFF" />
          <Text className="text-white font-medium text-xs">Jogador</Text>
        </Pressable>
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            height: 60 + insets.bottom,
            paddingTop: 8,
            paddingBottom: insets.bottom,
          },
          tabBarActiveTintColor: '#EC4899',
          tabBarInactiveTintColor: '#717171',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          sceneStyle: {
            paddingTop: topBarHeight,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Hoje',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="today" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="agenda"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="calendar-month" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="manage"
          options={{
            title: 'Gestão',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="dashboard" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Mensagens',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="chat-bubble-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="menu" size={24} color={color} />
            ),
          }}
        />
        {/* Hidden screens - não aparecem na tab bar */}
        <Tabs.Screen
          name="courts"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="register"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="become"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="earnings"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="performance"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
