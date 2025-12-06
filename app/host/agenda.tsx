import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HostAgendaScreen() {
  const hasPublishedCourt = false; // TODO: Check if user has published courts

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-[#F0F0F0]">
        <Text className="text-2xl font-bold text-[#222]">Agenda</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {hasPublishedCourt ? (
          <View className="p-6">
            {/* Calendar would go here */}
            <Text>Calendario</Text>
          </View>
        ) : (
          /* Empty State */
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View className="w-20 h-20 border-2 border-[#E5E5E5] rounded-2xl items-center justify-center mb-6">
              <MaterialIcons name="calendar-month" size={32} color="#B0B0B0" />
            </View>
            <Text className="text-xl font-semibold text-[#222] text-center mb-2">
              Agenda
            </Text>
            <Text className="text-sm text-[#717171] text-center leading-5 mb-6">
              Ao publicar um anuncio, voce podera ver e editar seu calendario aqui.
            </Text>
            <Pressable
              onPress={() => router.push('/court/add')}
              className="bg-[#222] px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Adicionar Quadra</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
