import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const activities = [
  {
    id: '1',
    type: 'login',
    title: 'Login realizado',
    description: 'iPhone · Brasil',
    time: 'Agora',
    icon: 'login',
    color: '#22c55e',
  },
  {
    id: '2',
    type: 'profile',
    title: 'Perfil atualizado',
    description: 'Foto de perfil alterada',
    time: 'Há 2 dias',
    icon: 'person',
    color: '#3b82f6',
  },
  {
    id: '3',
    type: 'password',
    title: 'Conta criada',
    description: 'Bem-vindo ao Kourt!',
    time: 'Há 1 semana',
    icon: 'celebration',
    color: '#8b5cf6',
  },
];

export default function ActivityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Atividade Recente</Text>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl border border-neutral-200">
          {activities.map((activity, index) => (
            <View
              key={activity.id}
              className={`p-4 flex-row items-center ${
                index < activities.length - 1 ? 'border-b border-neutral-100' : ''
              }`}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${activity.color}20` }}
              >
                <MaterialIcons
                  name={activity.icon as any}
                  size={20}
                  color={activity.color}
                />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-medium text-black">{activity.title}</Text>
                <Text className="text-sm text-neutral-500">{activity.description}</Text>
              </View>
              <Text className="text-xs text-neutral-400">{activity.time}</Text>
            </View>
          ))}
        </View>

        <Text className="text-xs text-neutral-400 text-center mt-4">
          Mostrando atividades dos últimos 30 dias
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
