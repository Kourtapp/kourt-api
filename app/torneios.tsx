import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const TOURNAMENTS = [
  {
    id: '1',
    name: 'Torneio Padel Mix',
    date: '22-23 Dez',
    location: 'Clube Pinheiros',
    spots: '16/32',
    price: 'R$ 80',
    status: 'ABERTO',
    statusColor: '#22C55E',
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
  },
  {
    id: '2',
    name: 'Meu Torneio',
    date: '28 Dez',
    location: 'Arena Beach',
    spots: '8/16',
    price: 'Gratuito',
    isOrganizer: true,
    iconBg: '#000',
    iconColor: '#fff',
  },
];

export default function TorneiosScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-bold text-black">Torneios</Text>
          <View className="bg-black px-2 py-0.5 rounded">
            <Text className="text-white text-xs font-bold">PRO</Text>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-black rounded-full items-center justify-center">
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Featured Tournament */}
        <View className="mx-5 mb-6">
          <View className="bg-black rounded-3xl p-5">
            <View className="bg-amber-500 px-3 py-1 rounded-full self-start mb-3">
              <Text className="text-black text-xs font-bold">DESTAQUE</Text>
            </View>
            <Text className="text-white font-bold text-2xl mb-2">Copa Beach Tennis SP</Text>
            <Text className="text-neutral-400 mb-4">15-17 Dez · Arena Ibirapuera</Text>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="groups" size={16} color="#9CA3AF" />
                <Text className="text-neutral-400">32/64</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="emoji-events" size={16} color="#9CA3AF" />
                <Text className="text-neutral-400">R$ 5.000</Text>
              </View>
            </View>

            <TouchableOpacity className="bg-white py-3 rounded-full items-center">
              <Text className="text-black font-bold">Inscrever-se</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Tournaments */}
        <Text className="px-5 text-xs text-neutral-400 uppercase tracking-wide mb-3">Próximos</Text>

        {TOURNAMENTS.map((tournament) => (
          <TouchableOpacity
            key={tournament.id}
            className="mx-5 mb-3 p-4 bg-white border border-neutral-100 rounded-2xl"
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: tournament.iconBg }}
              >
                <MaterialIcons name="emoji-events" size={24} color={tournament.iconColor} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold text-black">{tournament.name}</Text>
                  {tournament.status && (
                    <View
                      className="px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${tournament.statusColor}20` }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: tournament.statusColor }}
                      >
                        {tournament.status}
                      </Text>
                    </View>
                  )}
                  {tournament.isOrganizer && (
                    <View className="bg-black px-2 py-0.5 rounded">
                      <Text className="text-white text-xs font-semibold">ORGANIZADOR</Text>
                    </View>
                  )}
                </View>
                <Text className="text-neutral-500 text-sm">
                  {tournament.date} · {tournament.location}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#D4D4D4" />
            </View>
            <View className="flex-row items-center gap-4">
              <Text className="text-neutral-600">{tournament.spots}</Text>
              <Text className="text-neutral-600">{tournament.price}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Create Tournament */}
        <TouchableOpacity className="mx-5 mt-3 p-4 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center mr-3">
              <MaterialIcons name="add" size={24} color="#737373" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-black">Criar Torneio</Text>
              <Text className="text-neutral-500 text-sm">Organize seu campeonato</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#D4D4D4" />
          </View>
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
