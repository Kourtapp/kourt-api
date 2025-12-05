import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';

interface Player {
  id: string;
  name: string;
  avatar_url?: string;
  checkedIn: boolean;
}

export default function CheckinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [loading, setLoading] = useState(false);
  const [verifyingLocation, setVerifyingLocation] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);

  // Mock match data
  const [matchData, setMatchData] = useState({
    sport: 'BeachTennis',
    courtName: 'Arena BeachIbirapuera',
    courtNumber: 'Quadra 2',
    date: 'Hoje',
    time: '18:00',
    maxPlayers: 4,
  });

  // Mock players
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: profile?.name || 'Você', avatar_url: profile?.avatar_url || undefined, checkedIn: false },
    { id: '2', name: 'Lucas Mendes', checkedIn: true },
    { id: '3', name: 'Fernanda Oliveira', checkedIn: false },
    { id: '4', name: 'Ricardo Santos', checkedIn: false },
  ]);

  // Pulse animation for location
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

  // Check if all players are ready
  useEffect(() => {
    const allReady = players.every((p) => p.checkedIn);
    setAllPlayersReady(allReady);
  }, [players]);

  const handleCheckin = async () => {
    setVerifyingLocation(true);

    try {
      // Request location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Skip location check for now
        setTimeout(() => {
          doCheckin();
        }, 1500);
        return;
      }

      // Get current position
      await Location.getCurrentPositionAsync({});

      // Simulate location verification
      setTimeout(() => {
        doCheckin();
      }, 2000);
    } catch (e) {
      // Skip location check on error
      setTimeout(() => {
        doCheckin();
      }, 1500);
    }
  };

  const doCheckin = () => {
    setVerifyingLocation(false);
    setCheckedIn(true);

    // Update player status
    setPlayers((prev) =>
      prev.map((p) => (p.id === '1' ? { ...p, checkedIn: true } : p))
    );

    // Simulate other players checking in
    setTimeout(() => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === '3' ? { ...p, checkedIn: true } : p))
      );
    }, 2000);

    setTimeout(() => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === '4' ? { ...p, checkedIn: true } : p))
      );
    }, 4000);
  };

  const handleStartMatch = () => {
    router.replace(`/match/live/${id}` as any);
  };

  const checkedInCount = players.filter((p) => p.checkedIn).length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Check-in da Partida</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-5 py-6">
        {/* Match Info */}
        <View className="bg-neutral-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-lime-100 rounded-xl items-center justify-center">
              <MaterialIcons name="sports-tennis" size={24} color="#84CC16" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-bold text-black text-lg">{matchData.sport}</Text>
              <Text className="text-neutral-500">{matchData.courtName} · {matchData.courtNumber}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="event" size={16} color="#737373" />
              <Text className="text-sm text-neutral-600">{matchData.date}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="schedule" size={16} color="#737373" />
              <Text className="text-sm text-neutral-600">{matchData.time}</Text>
            </View>
          </View>
        </View>

        {/* Check-in Status */}
        <View className="items-center mb-8">
          {!checkedIn ? (
            verifyingLocation ? (
              <>
                <Animated.View
                  style={{ transform: [{ scale: pulseAnim }] }}
                  className="w-28 h-28 bg-lime-100 rounded-full items-center justify-center mb-4"
                >
                  <View className="w-20 h-20 bg-lime-200 rounded-full items-center justify-center">
                    <MaterialIcons name="location-searching" size={32} color="#84CC16" />
                  </View>
                </Animated.View>
                <Text className="text-lg font-semibold text-black">Verificando localização...</Text>
                <Text className="text-neutral-500 mt-1">Confirme que você está na quadra</Text>
              </>
            ) : (
              <>
                <View className="w-28 h-28 bg-neutral-100 rounded-full items-center justify-center mb-4">
                  <MaterialIcons name="location-on" size={40} color="#737373" />
                </View>
                <Text className="text-lg font-semibold text-black">Faça seu check-in</Text>
                <Text className="text-neutral-500 mt-1 text-center px-8">
                  Confirme sua presença na quadra para iniciar a partida
                </Text>
              </>
            )
          ) : (
            <>
              <View className="w-28 h-28 bg-lime-100 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="check-circle" size={48} color="#84CC16" />
              </View>
              <Text className="text-lg font-semibold text-black">Check-in realizado!</Text>
              <Text className="text-neutral-500 mt-1">Aguardando outros jogadores...</Text>
            </>
          )}
        </View>

        {/* Players Status */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-bold text-black">Jogadores</Text>
            <Text className="text-neutral-500">{checkedInCount}/{players.length} confirmados</Text>
          </View>

          <View className="gap-3">
            {players.map((player) => (
              <View
                key={player.id}
                className={`flex-row items-center p-3 rounded-xl ${
                  player.checkedIn ? 'bg-lime-50 border border-lime-200' : 'bg-neutral-50'
                }`}
              >
                <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center overflow-hidden">
                  {player.avatar_url ? (
                    <Image source={{ uri: player.avatar_url }} className="w-full h-full" />
                  ) : (
                    <Text className="text-neutral-600 font-semibold">
                      {player.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text className="flex-1 ml-3 font-medium text-black">
                  {player.name}
                  {player.id === '1' && ' (você)'}
                </Text>
                {player.checkedIn ? (
                  <View className="flex-row items-center gap-1 px-3 py-1 bg-lime-500 rounded-full">
                    <MaterialIcons name="check" size={14} color="#fff" />
                    <Text className="text-white text-xs font-medium">Pronto</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1 px-3 py-1 bg-neutral-200 rounded-full">
                    <MaterialIcons name="schedule" size={14} color="#737373" />
                    <Text className="text-neutral-500 text-xs font-medium">Aguardando</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mb-6">
          <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-lime-500 rounded-full"
              style={{ width: `${(checkedInCount / players.length) * 100}%` }}
            />
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-5 pb-8">
        {!checkedIn ? (
          <Pressable
            onPress={handleCheckin}
            disabled={verifyingLocation}
            className="overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={['#84CC16', '#65A30D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 flex-row items-center justify-center"
            >
              {verifyingLocation ? (
                <ActivityIndicator color="#1A2E05" />
              ) : (
                <>
                  <MaterialIcons name="location-on" size={22} color="#1A2E05" />
                  <Text className="text-lime-950 font-semibold text-base ml-2">
                    Fazer Check-in
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        ) : allPlayersReady ? (
          <Pressable
            onPress={handleStartMatch}
            className="overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={['#000', '#262626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 flex-row items-center justify-center"
            >
              <MaterialIcons name="play-arrow" size={24} color="#84CC16" />
              <Text className="text-white font-semibold text-base ml-2">
                Iniciar Partida
              </Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View className="py-4 bg-neutral-100 rounded-2xl items-center">
            <Text className="text-neutral-500 font-medium">
              Aguardando {players.length - checkedInCount} jogador{players.length - checkedInCount > 1 ? 'es' : ''}...
            </Text>
          </View>
        )}

        {checkedIn && !allPlayersReady && (
          <Pressable
            onPress={handleStartMatch}
            className="mt-3 py-3 items-center"
          >
            <Text className="text-neutral-500">Iniciar mesmo assim</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
