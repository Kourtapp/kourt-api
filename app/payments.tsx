import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PaymentsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Pagamentos</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Payment Methods Section */}
        <View className="mt-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 mb-2">
            Metodos de Pagamento
          </Text>
          <View className="bg-white mx-5 rounded-2xl border border-neutral-200 overflow-hidden">
            <Pressable className="flex-row items-center p-4 border-b border-neutral-100">
              <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
                <MaterialIcons name="add" size={20} color="#525252" />
              </View>
              <Text className="flex-1 ml-3 text-black font-medium">Adicionar cartao</Text>
              <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
            </Pressable>
          </View>
        </View>

        {/* Empty State */}
        <View className="mt-8 mx-5 items-center">
          <View className="w-16 h-16 bg-neutral-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="credit-card" size={32} color="#A3A3A3" />
          </View>
          <Text className="text-lg font-semibold text-neutral-700">Nenhum cartao cadastrado</Text>
          <Text className="text-sm text-neutral-500 text-center mt-2">
            Adicione um cartao para reservar quadras e pagar partidas
          </Text>
        </View>

        {/* Transaction History Section */}
        <View className="mt-8">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 mb-2">
            Historico de Transacoes
          </Text>
          <View className="bg-white mx-5 rounded-2xl border border-neutral-200 p-8 items-center">
            <MaterialIcons name="receipt-long" size={32} color="#A3A3A3" />
            <Text className="text-sm text-neutral-500 text-center mt-2">
              Suas transacoes aparecerao aqui
            </Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
