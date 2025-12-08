import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform } from 'react-native';

export default function DevicesScreen() {
  const currentDevice = {
    name: Platform.OS === 'ios' ? 'iPhone' : 'Android',
    lastActive: 'Agora',
    location: 'Brasil',
    current: true,
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Dispositivos</Text>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Dispositivo atual
        </Text>

        <View className="bg-white rounded-2xl border border-neutral-200 mb-6">
          <View className="p-4 flex-row items-center">
            <View className="w-12 h-12 bg-lime-100 rounded-xl items-center justify-center">
              <MaterialIcons
                name={Platform.OS === 'ios' ? 'phone-iphone' : 'phone-android'}
                size={24}
                color="#84cc16"
              />
            </View>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center gap-2">
                <Text className="font-medium text-black">{currentDevice.name}</Text>
                <View className="bg-lime-100 px-2 py-0.5 rounded-full">
                  <Text className="text-xs text-lime-700 font-medium">Este dispositivo</Text>
                </View>
              </View>
              <Text className="text-sm text-neutral-500">
                {currentDevice.lastActive} · {currentDevice.location}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Outros dispositivos
        </Text>

        <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
          <MaterialIcons name="devices" size={48} color="#A3A3A3" />
          <Text className="text-lg font-semibold text-neutral-700 mt-4">Nenhum outro dispositivo</Text>
          <Text className="text-sm text-neutral-500 text-center mt-2">
            Você está conectado apenas neste dispositivo
          </Text>
        </View>

        <View className="mt-6 bg-amber-50 rounded-2xl border border-amber-200 p-4">
          <View className="flex-row items-start gap-3">
            <MaterialIcons name="info" size={20} color="#f59e0b" />
            <Text className="flex-1 text-sm text-amber-800">
              Se você notar algum dispositivo desconhecido, desconecte-o imediatamente e altere sua senha.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
