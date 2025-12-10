import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AboutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black ml-4">Sobre o Kourt</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center py-8">
          <View className="w-20 h-20 bg-black rounded-2xl items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">K</Text>
          </View>
          <Text className="text-2xl font-bold text-black">Kourt</Text>
          <Text className="text-neutral-500">Versão 1.0.0</Text>
        </View>

        <View className="bg-neutral-50 rounded-2xl p-5 mb-6">
          <Text className="text-neutral-600 leading-6">
            O Kourt é a plataforma definitiva para jogadores de esportes de raquete.
            Conecte-se com outros jogadores, encontre quadras, organize partidas e
            acompanhe seu progresso.
          </Text>
        </View>

        <View className="gap-3 mb-8">
          <TouchableOpacity
            onPress={() => Linking.openURL('https://kourt.app')}
            className="flex-row items-center p-4 bg-white rounded-2xl border border-neutral-200"
          >
            <MaterialIcons name="language" size={24} color="#525252" />
            <Text className="flex-1 ml-3 font-medium text-black">Website</Text>
            <MaterialIcons name="open-in-new" size={20} color="#A3A3A3" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://instagram.com/kourt.app')}
            className="flex-row items-center p-4 bg-white rounded-2xl border border-neutral-200"
          >
            <MaterialIcons name="camera-alt" size={24} color="#525252" />
            <Text className="flex-1 ml-3 font-medium text-black">Instagram</Text>
            <MaterialIcons name="open-in-new" size={20} color="#A3A3A3" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:contato@kourt.app')}
            className="flex-row items-center p-4 bg-white rounded-2xl border border-neutral-200"
          >
            <MaterialIcons name="email" size={24} color="#525252" />
            <Text className="flex-1 ml-3 font-medium text-black">Contato</Text>
            <MaterialIcons name="open-in-new" size={20} color="#A3A3A3" />
          </TouchableOpacity>
        </View>

        <Text className="text-center text-neutral-400 text-sm mb-8">
          © 2024 Kourt. Todos os direitos reservados.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
