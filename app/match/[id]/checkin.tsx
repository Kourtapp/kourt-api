import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';

interface Player {
  id: string;
  name: string;
  avatar_url?: string;
  checkedIn: boolean;
  checkedInTime?: string;
}

export default function CheckinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [verifyingLocation, setVerifyingLocation] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  // Mock match data
  const [matchData] = useState({
    sport: 'BeachTennis',
    courtName: 'Quadra Parque Ibirapuera',
    courtDetails: 'Portão 10 · Você está aqui',
    startTime: '18:00',
    endTime: '20:00',
    maxPlayers: 4,
  });

  // Mock players
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: profile?.name || 'Você', avatar_url: profile?.avatar_url || undefined, checkedIn: false },
    { id: '2', name: 'Lucas Mendes', checkedIn: true, checkedInTime: '17:55' },
    { id: '3', name: 'Fernanda Oliveira', checkedIn: false },
    { id: '4', name: 'Ricardo Santos', checkedIn: false },
  ]);

  // Pulse animation
  useEffect(() => {
    if (verifyingLocation) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [verifyingLocation]);

  const handleCheckin = async () => {
    setVerifyingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setTimeout(() => doCheckin(), 1500);
        return;
      }

      await Location.getCurrentPositionAsync({});
      setTimeout(() => doCheckin(), 2000);
    } catch (e) {
      setTimeout(() => doCheckin(), 1500);
    }
  };

  const doCheckin = () => {
    setVerifyingLocation(false);
    setCheckedIn(true);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setPlayers((prev) =>
      prev.map((p) => (p.id === '1' ? { ...p, checkedIn: true, checkedInTime: timeStr } : p))
    );

    // Simulate others checking in
    setTimeout(() => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === '3' ? { ...p, checkedIn: true, checkedInTime: '18:03' } : p))
      );
    }, 2000);

    setTimeout(() => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === '4' ? { ...p, checkedIn: true, checkedInTime: '18:05' } : p))
      );
    }, 4000);
  };

  const handleRegisterMatch = () => {
    router.push('/match/register/photos');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Estou jogando ${matchData.sport} na ${matchData.courtName}! Vem pro Kourt!`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleViewChat = () => {
    // Navigate to chat
  };

  const checkedInCount = players.filter((p) => p.checkedIn).length;

  // Before check-in UI
  if (!checkedIn && !verifyingLocation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text className="text-lg font-bold text-black">Check-in da Partida</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center px-5">
          <View className="w-32 h-32 bg-neutral-100 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="location-on" size={48} color="#737373" />
          </View>
          <Text className="text-xl font-bold text-black mb-2">Faça seu check-in</Text>
          <Text className="text-neutral-500 text-center px-8">
            Confirme sua presença na quadra para iniciar a partida
          </Text>
        </View>

        <View className="px-5 pb-8">
          <Pressable
            onPress={handleCheckin}
            className="bg-black py-4 rounded-full flex-row items-center justify-center"
          >
            <MaterialIcons name="location-on" size={22} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">Fazer Check-in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Verifying location UI
  if (verifyingLocation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text className="text-lg font-bold text-black">Check-in da Partida</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center px-5">
          <Animated.View
            style={{ transform: [{ scale: pulseAnim }] }}
            className="w-32 h-32 bg-green-100 rounded-full items-center justify-center mb-6"
          >
            <View className="w-24 h-24 bg-green-200 rounded-full items-center justify-center">
              <MaterialIcons name="location-searching" size={40} color="#22C55E" />
            </View>
          </Animated.View>
          <Text className="text-xl font-bold text-black mb-2">Verificando localização...</Text>
          <Text className="text-neutral-500 text-center px-8">
            Confirme que você está na quadra
          </Text>
        </View>

        <View className="px-5 pb-8">
          <View className="bg-neutral-100 py-4 rounded-full items-center">
            <ActivityIndicator color="#737373" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Check-in realizado UI (matches the design)
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Close Button */}
      <View className="absolute top-14 right-5 z-10">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
        >
          <MaterialIcons name="close" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View className="items-center pt-16 pb-6">
          <View className="w-28 h-28 bg-green-500 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="check" size={56} color="#fff" />
          </View>
          <Text className="text-2xl font-bold text-black mb-1">Check-in realizado!</Text>
          <Text className="text-neutral-500">Você está na quadra. Bom jogo!</Text>
        </View>

        {/* Location Map Card */}
        <View className="mx-5 mb-6">
          <View className="bg-green-100 rounded-2xl p-4 items-center">
            <View className="w-12 h-12 bg-green-200 rounded-full items-center justify-center mb-3">
              <MaterialIcons name="location-on" size={24} color="#22C55E" />
            </View>
            <Text className="font-bold text-black text-lg">{matchData.courtName}</Text>
            <Text className="text-neutral-500">{matchData.courtDetails}</Text>
          </View>
        </View>

        {/* Match Info */}
        <View className="mx-5 mb-6 bg-white border border-neutral-200 rounded-2xl p-4">
          <View className="flex-row items-center py-3 border-b border-neutral-100">
            <MaterialIcons name="schedule" size={20} color="#737373" />
            <Text className="flex-1 ml-3 text-neutral-600">Horário</Text>
            <Text className="font-bold text-black">{matchData.startTime} - {matchData.endTime}</Text>
          </View>
          <View className="flex-row items-center py-3 border-b border-neutral-100">
            <MaterialIcons name="sports-tennis" size={20} color="#737373" />
            <Text className="flex-1 ml-3 text-neutral-600">Esporte</Text>
            <Text className="font-bold text-black">{matchData.sport}</Text>
          </View>
          <View className="flex-row items-center py-3">
            <MaterialIcons name="people" size={20} color="#737373" />
            <Text className="flex-1 ml-3 text-neutral-600">Jogadores</Text>
            <Text className="font-bold text-black">{checkedInCount} confirmados</Text>
          </View>
        </View>

        {/* Players Section */}
        <View className="mx-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            QUEM ESTÁ JOGANDO:
          </Text>

          <View className="gap-2">
            {players.filter(p => p.checkedIn).map((player) => (
              <View
                key={player.id}
                className="flex-row items-center bg-green-50 rounded-xl p-3"
              >
                <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center overflow-hidden">
                  {player.avatar_url ? (
                    <Image source={{ uri: player.avatar_url }} className="w-full h-full" />
                  ) : (
                    <MaterialIcons name="person" size={20} color="#fff" />
                  )}
                </View>
                <Text className="flex-1 ml-3 font-medium text-black">
                  {player.name}
                </Text>
                {player.id === '1' && (
                  <View className="bg-green-200 px-2 py-0.5 rounded mr-2">
                    <Text className="text-green-700 text-xs font-bold">AQUI</Text>
                  </View>
                )}
                <Text className="text-neutral-500 text-sm">{player.checkedInTime}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={handleRegisterMatch}
            className="flex-1 bg-black py-4 rounded-full flex-row items-center justify-center"
          >
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
            <Text className="text-white font-bold ml-2">Registrar Partida</Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            className="w-14 h-14 bg-neutral-100 rounded-full items-center justify-center"
          >
            <MaterialIcons name="share" size={24} color="#525252" />
          </Pressable>
        </View>

        <Pressable onPress={handleViewChat} className="items-center">
          <Text className="text-black font-medium">Ver chat do grupo</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
