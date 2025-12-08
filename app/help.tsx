import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const faqItems = [
  {
    question: 'Como reservar uma quadra?',
    answer: 'Navegue ate a aba Mapa ou Home, encontre uma quadra e clique em "Reservar". Escolha o horario disponivel e confirme o pagamento.',
  },
  {
    question: 'Como criar uma partida?',
    answer: 'Clique no botao "+" na barra inferior e selecione "Nova Partida". Preencha os detalhes e convide seus amigos.',
  },
  {
    question: 'Como funciona o sistema de niveis?',
    answer: 'Voce ganha XP jogando partidas, completando desafios e sendo ativo no app. Quanto mais XP, maior seu nivel.',
  },
  {
    question: 'Posso cancelar uma reserva?',
    answer: 'Sim, voce pode cancelar ate 24 horas antes do horario reservado para receber reembolso total.',
  },
  {
    question: 'Como me tornar um Host?',
    answer: 'Va em Configuracoes e clique no banner "Seja um Host". Preencha os dados da sua quadra e aguarde a aprovacao.',
  },
];

export default function HelpScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Central de Ajuda</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="mt-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 mb-2">
            Acoes Rapidas
          </Text>
          <View className="bg-white mx-5 rounded-2xl border border-neutral-200 overflow-hidden">
            <Pressable
              onPress={() => router.push('/contact' as any)}
              className="flex-row items-center p-4 border-b border-neutral-100"
            >
              <View className="w-10 h-10 bg-lime-100 rounded-xl items-center justify-center">
                <MaterialIcons name="chat" size={20} color="#84CC16" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-medium text-black">Fale Conosco</Text>
                <Text className="text-sm text-neutral-500">Envie uma mensagem</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL('mailto:suporte@kourt.app')}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
                <MaterialIcons name="email" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-medium text-black">Email</Text>
                <Text className="text-sm text-neutral-500">suporte@kourt.app</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
            </Pressable>
          </View>
        </View>

        {/* FAQ Section */}
        <View className="mt-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 mb-2">
            Perguntas Frequentes
          </Text>
          <View className="bg-white mx-5 rounded-2xl border border-neutral-200 overflow-hidden">
            {faqItems.map((item, index) => (
              <View
                key={index}
                className={`p-4 ${index < faqItems.length - 1 ? 'border-b border-neutral-100' : ''}`}
              >
                <Text className="font-medium text-black mb-2">{item.question}</Text>
                <Text className="text-sm text-neutral-600">{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
