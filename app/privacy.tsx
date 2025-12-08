import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PrivacyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Politica de Privacidade</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <Text className="text-sm text-neutral-500 mb-6">
            Ultima atualizacao: Dezembro de 2024
          </Text>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">1. Informacoes que Coletamos</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Coletamos informacoes que voce nos fornece diretamente, como nome, email,
              telefone e localizacao. Tambem coletamos dados de uso do aplicativo para
              melhorar nossos servicos.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">2. Como Usamos suas Informacoes</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Usamos suas informacoes para fornecer e melhorar nossos servicos, processar
              pagamentos, enviar notificacoes sobre suas reservas e partidas, e personalizar
              sua experiencia no aplicativo.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">3. Compartilhamento de Dados</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Compartilhamos suas informacoes apenas com provedores de servicos necessarios
              para operar nossa plataforma, como processadores de pagamento e servicos de
              hospedagem.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">4. Localizacao</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Usamos sua localizacao para mostrar quadras proximas e permitir check-in em
              partidas. Voce pode desativar o acesso a localizacao nas configuracoes do
              seu dispositivo.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">5. Seguranca dos Dados</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Implementamos medidas de seguranca tecnicas e organizacionais para proteger
              suas informacoes pessoais contra acesso nao autorizado, alteracao ou destruicao.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">6. Seus Direitos</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Voce tem o direito de acessar, corrigir ou excluir suas informacoes pessoais.
              Entre em contato conosco para exercer esses direitos.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">7. Retencao de Dados</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Mantemos suas informacoes enquanto sua conta estiver ativa ou conforme
              necessario para fornecer nossos servicos e cumprir obrigacoes legais.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">8. Contato</Text>
            <Text className="text-sm text-neutral-700 leading-6">
              Para duvidas sobre esta Politica de Privacidade, entre em contato pelo
              email: privacidade@kourt.app
            </Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
