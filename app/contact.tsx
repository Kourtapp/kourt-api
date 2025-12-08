import { View, Text, ScrollView, Pressable, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

export default function ContactScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    Alert.alert(
      'Mensagem enviada!',
      'Obrigado pelo contato. Responderemos em ate 24 horas.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Fale Conosco</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View className="mt-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 mb-2">
            Outras formas de contato
          </Text>
          <View className="bg-white mx-5 rounded-2xl border border-neutral-200 overflow-hidden">
            <Pressable
              onPress={() => Linking.openURL('mailto:suporte@kourt.app')}
              className="flex-row items-center p-4 border-b border-neutral-100"
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
            <Pressable
              onPress={() => Linking.openURL('https://instagram.com/kourt.app')}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 bg-pink-100 rounded-xl items-center justify-center">
                <MaterialIcons name="camera-alt" size={20} color="#EC4899" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-medium text-black">Instagram</Text>
                <Text className="text-sm text-neutral-500">@kourt.app</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#A3A3A3" />
            </Pressable>
          </View>
        </View>

        {/* Contact Form */}
        <View className="mt-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 mb-2">
            Enviar Mensagem
          </Text>
          <View className="bg-white mx-5 rounded-2xl border border-neutral-200 p-4">
            <View className="mb-4">
              <Text className="text-sm font-medium text-neutral-700 mb-2">Assunto</Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Ex: Problema com reserva"
                className="bg-neutral-100 rounded-xl px-4 py-3 text-black"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-neutral-700 mb-2">Mensagem</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Descreva sua duvida ou problema..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="bg-neutral-100 rounded-xl px-4 py-3 text-black min-h-[120px]"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              className="bg-black rounded-xl py-4 items-center"
            >
              <Text className="text-white font-semibold">Enviar</Text>
            </Pressable>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
