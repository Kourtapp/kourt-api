import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function CheckinSuccessScreen() {
  const params = useLocalSearchParams();

  const venue = (params.venue as string) || 'Quadra Parque Ibirapuera';
  const court = (params.court as string) || 'Partida 10';
  const time = (params.time as string) || '18:00 - 20:00';
  const sport = (params.sport as string) || 'BeachTennis';
  const confirmedPlayers = Number(params.confirmedPlayers) || 4;

  const matchId = (params.matchId as string) || '1';

  const handleStartMatch = () => {
    router.push(`/match/tracking?matchId=${matchId}&sport=${sport}&venue=${venue}` as any);
  };

  const handleRegisterMatch = () => {
    router.push(`/match/tracking?matchId=${matchId}&sport=${sport}&venue=${venue}` as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="close" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Success Content */}
      <View className="flex-1 px-6 pt-8">
        {/* Success Icon */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-[#22C55E] items-center justify-center mb-6">
            <MaterialIcons name="check" size={48} color="#fff" />
          </View>

          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Check-in realizado!
          </Text>
          <Text className="text-base text-gray-500 text-center">
            Você está na quadra. Bom jogo!
          </Text>
        </View>

        {/* Match Info Card */}
        <View className="bg-white border border-gray-200 rounded-2xl p-4 mt-4">
          {/* Venue */}
          <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
            <View className="w-10 h-10 rounded-full bg-[#22C55E]/10 items-center justify-center">
              <MaterialIcons name="location-on" size={20} color="#22C55E" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-gray-900">{venue}</Text>
              <Text className="text-sm text-gray-500">{court} • Você está aqui</Text>
            </View>
            <View className="w-3 h-3 rounded-full bg-[#22C55E]" />
          </View>

          {/* Details */}
          <View className="space-y-3">
            {/* Time */}
            <View className="flex-row items-center">
              <MaterialIcons name="access-time" size={20} color="#6B7280" />
              <Text className="ml-3 text-base text-gray-700">Horário</Text>
              <Text className="ml-auto text-base font-medium text-gray-900">{time}</Text>
            </View>

            {/* Sport */}
            <View className="flex-row items-center mt-3">
              <MaterialIcons name="sports-tennis" size={20} color="#6B7280" />
              <Text className="ml-3 text-base text-gray-700">Esporte</Text>
              <Text className="ml-auto text-base font-medium text-gray-900">{sport}</Text>
            </View>

            {/* Players */}
            <View className="flex-row items-center mt-3">
              <MaterialIcons name="people" size={20} color="#6B7280" />
              <Text className="ml-3 text-base text-gray-700">Jogadores</Text>
              <Text className="ml-auto text-base font-medium text-gray-900">
                {confirmedPlayers} confirmados
              </Text>
            </View>
          </View>
        </View>

        {/* Players Who Confirmed */}
        <View className="mt-6">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quem está jogando
          </Text>
          <View className="flex-row items-center">
            {/* Player avatars */}
            <View className="flex-row -space-x-2">
              {[1, 2, 3, 4].slice(0, confirmedPlayers).map((_, index) => (
                <View
                  key={index}
                  className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white items-center justify-center"
                  style={{ marginLeft: index > 0 ? -8 : 0 }}
                >
                  <Text className="text-gray-600 font-medium text-sm">
                    {['L', 'F', 'R', 'M'][index]}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="ml-3 text-sm text-gray-600">
              {confirmedPlayers} jogadores confirmados
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-6 py-4 pb-8">
        <TouchableOpacity onPress={handleRegisterMatch}>
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl py-4 flex-row items-center justify-center"
          >
            <MaterialIcons name="play-arrow" size={24} color="#fff" />
            <Text className="text-white font-semibold text-base ml-2">
              Registrar Partida
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
