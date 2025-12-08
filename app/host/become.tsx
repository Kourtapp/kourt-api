import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function BecomeHostScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Seja um Host</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#84cc16', '#65a30d']}
          className="mx-5 mt-5 p-6 rounded-2xl"
        >
          <View className="items-center">
            <MaterialIcons name="home-work" size={48} color="#fff" />
            <Text className="text-2xl font-bold text-white mt-4 text-center">
              Ganhe dinheiro com sua quadra
            </Text>
            <Text className="text-white/80 text-center mt-2">
              Cadastre sua quadra no Kourt e comece a receber reservas
            </Text>
          </View>
        </LinearGradient>

        <View className="p-5">
          <Text className="text-lg font-bold text-black mb-4">Como funciona</Text>

          <View className="bg-white rounded-2xl border border-neutral-200 p-5">
            <View className="flex-row items-start gap-4 mb-6">
              <View className="w-10 h-10 bg-lime-100 rounded-full items-center justify-center">
                <Text className="text-lg font-bold text-lime-700">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-black">Cadastre sua quadra</Text>
                <Text className="text-sm text-neutral-500 mt-1">
                  Adicione fotos, horarios disponiveis e valores
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-4 mb-6">
              <View className="w-10 h-10 bg-lime-100 rounded-full items-center justify-center">
                <Text className="text-lg font-bold text-lime-700">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-black">Receba reservas</Text>
                <Text className="text-sm text-neutral-500 mt-1">
                  Jogadores encontram e reservam sua quadra pelo app
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-4">
              <View className="w-10 h-10 bg-lime-100 rounded-full items-center justify-center">
                <Text className="text-lg font-bold text-lime-700">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-black">Receba pagamentos</Text>
                <Text className="text-sm text-neutral-500 mt-1">
                  Pagamento seguro direto na sua conta
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-lg font-bold text-black mt-6 mb-4">Beneficios</Text>

          <View className="bg-white rounded-2xl border border-neutral-200 p-5 gap-4">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="check-circle" size={24} color="#84cc16" />
              <Text className="text-neutral-700">Sem taxa de adesao</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="check-circle" size={24} color="#84cc16" />
              <Text className="text-neutral-700">Visibilidade para milhares de jogadores</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="check-circle" size={24} color="#84cc16" />
              <Text className="text-neutral-700">Sistema de agendamento automatico</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="check-circle" size={24} color="#84cc16" />
              <Text className="text-neutral-700">Suporte dedicado</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="p-5 bg-white border-t border-neutral-100">
        <Pressable
          onPress={() => router.push('/host/register' as any)}
          className="bg-black rounded-xl py-4 items-center"
        >
          <Text className="text-white font-semibold">Comecar agora</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
