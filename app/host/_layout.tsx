import { Tabs } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HostLayout() {
  return (
    <View className="flex-1 bg-white">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            height: 80,
            paddingTop: 8,
            paddingBottom: 24,
          },
          tabBarActiveTintColor: '#222222',
          tabBarInactiveTintColor: '#717171',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Hoje',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="bookmark" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="agenda"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="calendar-month" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="courts"
          options={{
            title: 'Quadras',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="other-houses" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="chat-bubble-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="menu" size={24} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Mode Switcher - Botão flutuante */}
      <Pressable
        onPress={() => router.replace('/(tabs)')}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#222] px-5 py-3 rounded-full flex-row items-center gap-2 shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
          transform: [{ translateX: -70 }],
        }}
      >
        <MaterialIcons name="sports-tennis" size={18} color="#FFF" />
        <Text className="text-white font-semibold text-sm">Modo Jogador</Text>
      </Pressable>
    </View>
  );
}
