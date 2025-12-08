import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TermsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Termos de Uso</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <Text className="text-sm text-neutral-500 mb-6">
            Ultima atualizacao: Dezembro de 2024
          </Text>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">1. Aceitacao dos Termos</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Ao acessar e usar o aplicativo Kourt, voce concorda em cumprir estes Termos de Uso.
              Se voce nao concordar com qualquer parte destes termos, nao podera usar nosso servico.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">2. Uso do Servico</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              O Kourt e uma plataforma para reserva de quadras esportivas e organizacao de partidas.
              Voce concorda em usar o servico apenas para fins legais e de acordo com estes termos.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">3. Conta do Usuario</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Voce e responsavel por manter a confidencialidade de sua conta e senha.
              Voce concorda em notificar imediatamente sobre qualquer uso nao autorizado de sua conta.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">4. Reservas e Pagamentos</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              As reservas estao sujeitas a disponibilidade. Os pagamentos sao processados por
              provedores terceiros seguros. Politicas de cancelamento podem variar por quadra.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">5. Conduta do Usuario</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Voce concorda em nao usar o servico para atividades ilegais, assediar outros usuarios,
              ou violar direitos de propriedade intelectual.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">6. Limitacao de Responsabilidade</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              O Kourt nao e responsavel por danos diretos, indiretos ou consequentes decorrentes
              do uso ou incapacidade de usar o servico.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">7. Alteracoes nos Termos</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Reservamos o direito de modificar estes termos a qualquer momento.
              Alteracoes serao notificadas atraves do aplicativo.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">8. Contato</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Para duvidas sobre estes Termos de Uso, entre em contato pelo email: legal@kourt.app
            </Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
