import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Vibration,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT, Polygon } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

import {
  MatchScore,
  getMatchScore,
  updateMatchScore,
  startMatch,
  togglePauseMatch,
  finishSet,
  finishMatch,
  subscribeToScoreUpdates,
} from '@/services/matchScore';

const { width, height } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = 320;

// Court dimensions (roughly)
const COURT_OFFSET = 0.0003;

export default function LiveMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // State
  const [score, setScore] = useState<MatchScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showScorePanel, setShowScorePanel] = useState(false);

  // Location for court
  const [courtLocation, setCourtLocation] = useState({
    latitude: -23.5874,
    longitude: -46.6576,
  });

  // Simulated player positions
  const [players, setPlayers] = useState([
    { id: '1', position: { lat: -23.5874 - 0.0001, lng: -46.6576 - 0.0001 }, team: 'a' },
    { id: '2', position: { lat: -23.5874 - 0.0001, lng: -46.6576 + 0.0001 }, team: 'a' },
    { id: '3', position: { lat: -23.5874 + 0.0002, lng: -46.6576 - 0.0001 }, team: 'b' },
    { id: '4', position: { lat: -23.5874 + 0.0002, lng: -46.6576 + 0.0001 }, team: 'b' },
  ]);

  // Match info
  const [matchInfo, setMatchInfo] = useState({
    sport: 'BeachTennis',
    courtName: 'Arena BeachIbirapuera',
    courtNumber: 'Quadra 2',
  });

  // Fetch initial score
  useEffect(() => {
    fetchScore();
    getCurrentLocation();
  }, [id]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToScoreUpdates(id, (newScore) => {
      setScore(newScore);
    });
    return () => unsubscribe();
  }, [id]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning && score?.status === 'in_progress') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, score?.status]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCourtLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (e) {
      console.log('Location error:', e);
    }
  };

  const fetchScore = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getMatchScore(id);
    if (data) {
      setScore(data);
    } else {
      // Create mock score if none exists
      setScore({
        id: `mock_${id}`,
        match_id: id,
        team_a_score: 0,
        team_b_score: 0,
        team_a_sets: 0,
        team_b_sets: 0,
        current_set: 1,
        status: 'not_started',
        sets_history: [],
        started_at: null,
        finished_at: null,
        winner_team: null,
        updated_at: new Date().toISOString(),
      });
    }
    setLoading(false);
  };

  const handleStart = async () => {
    if (!id) return;
    setUpdating(true);
    Vibration.vibrate(100);

    try {
      const result = await startMatch(id);
      if (result.success) {
        setTimerRunning(true);
        setTimer(0);
        setScore((prev) => prev ? { ...prev, status: 'in_progress' } : null);
      }
    } catch (e) {
      // Just start locally if API fails
      setTimerRunning(true);
      setTimer(0);
      setScore((prev) => prev ? { ...prev, status: 'in_progress' } : null);
    }
    setUpdating(false);
  };

  const handlePauseResume = async () => {
    if (!id || !score) return;
    const isPaused = score.status === 'paused';
    setTimerRunning(isPaused);
    setScore((prev) => prev ? { ...prev, status: isPaused ? 'in_progress' : 'paused' } : null);
  };

  const handleAddPoint = async (team: 'a' | 'b') => {
    if (!score || score.status !== 'in_progress') return;
    Vibration.vibrate(30);

    setScore((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        team_a_score: team === 'a' ? prev.team_a_score + 1 : prev.team_a_score,
        team_b_score: team === 'b' ? prev.team_b_score + 1 : prev.team_b_score,
      };
    });
  };

  const handleFinishSet = async () => {
    if (!score) return;
    const winnerTeam = score.team_a_score > score.team_b_score ? 'a' : 'b';

    Alert.alert(
      'Finalizar Set',
      `Time ${winnerTeam.toUpperCase()} venceu o set. Confirmar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setScore((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                team_a_sets: winnerTeam === 'a' ? prev.team_a_sets + 1 : prev.team_a_sets,
                team_b_sets: winnerTeam === 'b' ? prev.team_b_sets + 1 : prev.team_b_sets,
                team_a_score: 0,
                team_b_score: 0,
                current_set: prev.current_set + 1,
              };
            });
          },
        },
      ],
    );
  };

  const handleFinishMatch = async () => {
    if (!score) return;
    const winnerTeam = score.team_a_sets > score.team_b_sets ? 'a' : 'b';

    Alert.alert(
      'Finalizar Partida',
      `Time ${winnerTeam.toUpperCase()} venceu! Confirmar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            setTimerRunning(false);
            setScore((prev) => prev ? { ...prev, status: 'finished', winner_team: winnerTeam } : null);
            // Navigate to results
            setTimeout(() => {
              router.push(`/match/${id}` as any);
            }, 1500);
          },
        },
      ],
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
    Animated.spring(sheetAnim, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const toggle3D = () => {
    setIs3D(!is3D);
    if (mapRef.current) {
      mapRef.current.animateCamera({
        pitch: is3D ? 0 : 60,
      }, { duration: 500 });
    }
  };

  const centerOnCourt = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...courtLocation,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      }, 500);
    }
  };

  // Court polygon coordinates (beach tennis court)
  const courtCoords = [
    { latitude: courtLocation.latitude - COURT_OFFSET, longitude: courtLocation.longitude - COURT_OFFSET * 0.5 },
    { latitude: courtLocation.latitude - COURT_OFFSET, longitude: courtLocation.longitude + COURT_OFFSET * 0.5 },
    { latitude: courtLocation.latitude + COURT_OFFSET, longitude: courtLocation.longitude + COURT_OFFSET * 0.5 },
    { latitude: courtLocation.latitude + COURT_OFFSET, longitude: courtLocation.longitude - COURT_OFFSET * 0.5 },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-100 items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-neutral-500 mt-4">Carregando partida...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-100">
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={{
          ...courtLocation,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        pitchEnabled
        camera={{
          center: courtLocation,
          pitch: is3D ? 60 : 0,
          heading: 0,
          altitude: 500,
          zoom: 18,
        }}
      >
        {/* Court Polygon (Beach Tennis court - sand colored) */}
        <Polygon
          coordinates={courtCoords}
          fillColor="rgba(251, 191, 36, 0.8)"
          strokeColor="#D97706"
          strokeWidth={2}
        />

        {/* Net line */}
        <Polygon
          coordinates={[
            { latitude: courtLocation.latitude, longitude: courtLocation.longitude - COURT_OFFSET * 0.5 },
            { latitude: courtLocation.latitude, longitude: courtLocation.longitude + COURT_OFFSET * 0.5 },
            { latitude: courtLocation.latitude + 0.00001, longitude: courtLocation.longitude + COURT_OFFSET * 0.5 },
            { latitude: courtLocation.latitude + 0.00001, longitude: courtLocation.longitude - COURT_OFFSET * 0.5 },
          ]}
          fillColor="rgba(0, 0, 0, 0.5)"
          strokeColor="#000"
          strokeWidth={1}
        />

        {/* Player markers */}
        {players.map((player) => (
          <Marker
            key={player.id}
            coordinate={{
              latitude: player.position.lat,
              longitude: player.position.lng,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View className={`w-5 h-5 rounded-full ${player.team === 'a' ? 'bg-blue-500' : 'bg-blue-500'
              } border-2 border-white shadow-lg`} />
          </Marker>
        ))}
      </MapView>

      {/* Header Overlay */}
      <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
        <View className="flex-row items-center justify-between px-4 py-2">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <MaterialIcons name="arrow-back" size={22} color="#000" />
          </Pressable>

          {/* Live indicator */}
          {score?.status === 'in_progress' && (
            <View className="flex-row items-center gap-2 px-4 py-2 bg-red-500 rounded-full">
              <View className="w-2 h-2 bg-white rounded-full" />
              <Text className="text-white text-sm font-bold">AO VIVO</Text>
            </View>
          )}

          <Pressable
            onPress={() => {/* Share */ }}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <MaterialIcons name="share" size={22} color="#000" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Map Controls (right side) */}
      <View className="absolute right-4 top-1/3 gap-3">
        <Pressable
          onPress={toggle3D}
          className={`w-12 h-12 rounded-xl items-center justify-center shadow-lg ${is3D ? 'bg-black' : 'bg-white'
            }`}
        >
          <Text className={`text-base font-bold ${is3D ? 'text-white' : 'text-black'}`}>3D</Text>
        </Pressable>

        <Pressable
          onPress={centerOnCourt}
          className="w-12 h-12 bg-white rounded-xl items-center justify-center shadow-lg"
        >
          <MaterialIcons name="my-location" size={24} color="#000" />
        </Pressable>
      </View>

      {/* Bottom Sheet */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
        style={{ paddingBottom: insets.bottom }}
      >
        {/* Handle */}
        <View className="items-center py-3">
          <View className="w-10 h-1.5 bg-neutral-300 rounded-full" />
        </View>

        {/* Sport Name & Expand */}
        <View className="flex-row items-center justify-between px-5 pb-4">
          <Text className="text-2xl font-bold text-black">{matchInfo.sport}</Text>
          <Pressable onPress={toggleExpanded}>
            <MaterialIcons
              name={expanded ? 'fullscreen-exit' : 'open-in-full'}
              size={24}
              color="#000"
            />
          </Pressable>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center justify-around px-5 pb-5">
          {/* Tempo */}
          <View className="items-center">
            <Text className="text-4xl font-bold text-black">{formatTime(timer)}</Text>
            <Text className="text-sm text-neutral-500 mt-1">Tempo</Text>
          </View>

          {/* Placar */}
          <Pressable onPress={() => setShowScorePanel(true)}>
            <View className="items-center">
              <Text className="text-4xl font-bold text-black">
                {score?.team_a_score || 0}-{score?.team_b_score || 0}
              </Text>
              <Text className="text-sm text-neutral-500 mt-1">Placar</Text>
            </View>
          </Pressable>

          {/* Sets */}
          <View className="items-center">
            <Text className="text-4xl font-bold text-black">
              {(score?.team_a_sets || 0) + (score?.team_b_sets || 0)}
            </Text>
            <Text className="text-sm text-neutral-500 mt-1">Sets</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center justify-center gap-6 px-5 pb-6">
          {/* Sport Icon / Confirm */}
          <Pressable
            onPress={() => {/* Sport settings */ }}
            className="w-16 h-16 bg-neutral-100 rounded-full items-center justify-center relative"
          >
            <MaterialIcons name="sports-tennis" size={28} color="#525252" />
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full items-center justify-center">
              <MaterialIcons name="check" size={14} color="#fff" />
            </View>
          </Pressable>

          {/* Main Play/Pause Button */}
          {score?.status === 'not_started' ? (
            <Pressable
              onPress={handleStart}
              disabled={updating}
              className="w-20 h-20 bg-black rounded-full items-center justify-center shadow-lg"
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="items-center">
                  <MaterialIcons name="play-arrow" size={36} color="#fff" />
                </View>
              )}
            </Pressable>
          ) : score?.status === 'in_progress' ? (
            <Pressable
              onPress={handlePauseResume}
              className="w-20 h-20 bg-black rounded-full items-center justify-center shadow-lg"
            >
              <MaterialIcons name="pause" size={36} color="#fff" />
            </Pressable>
          ) : score?.status === 'paused' ? (
            <Pressable
              onPress={handlePauseResume}
              className="w-20 h-20 bg-lime-500 rounded-full items-center justify-center shadow-lg"
            >
              <MaterialIcons name="play-arrow" size={36} color="#1A2E05" />
            </Pressable>
          ) : (
            <View className="w-20 h-20 bg-neutral-200 rounded-full items-center justify-center">
              <MaterialIcons name="check" size={36} color="#22C55E" />
            </View>
          )}

          {/* Add Players / Invite */}
          <Pressable
            onPress={() => router.push(`/match/${id}/invite` as any)}
            className="w-16 h-16 bg-neutral-100 rounded-full items-center justify-center"
          >
            <MaterialIcons name="person-add" size={28} color="#525252" />
          </Pressable>

          {/* Record Button */}
          <Pressable
            onPress={() => router.push(`/match/record/${id}` as any)}
            className="w-16 h-16 bg-red-50 rounded-full items-center justify-center border border-red-100"
          >
            <MaterialIcons name="videocam" size={28} color="#EF4444" />
          </Pressable>
        </View>

        {/* Iniciar Label */}
        {score?.status === 'not_started' && (
          <Text className="text-center text-sm text-neutral-500 -mt-2 pb-4">Iniciar</Text>
        )}

        {/* Quick Actions (when in progress) */}
        {(score?.status === 'in_progress' || score?.status === 'paused') && (
          <View className="flex-row items-center justify-center gap-3 px-5 pb-4">
            <Pressable
              onPress={() => handleAddPoint('a')}
              className="flex-1 py-3 bg-blue-500 rounded-xl items-center"
            >
              <Text className="text-white font-bold">+1 Time A</Text>
            </Pressable>
            <Pressable
              onPress={() => handleAddPoint('b')}
              className="flex-1 py-3 bg-blue-500 rounded-xl items-center"
            >
              <Text className="text-white font-bold">+1 Time B</Text>
            </Pressable>
          </View>
        )}

        {/* More Controls */}
        {(score?.status === 'in_progress' || score?.status === 'paused') && (
          <View className="flex-row items-center justify-center gap-3 px-5 pb-4">
            <Pressable
              onPress={handleFinishSet}
              className="flex-1 py-3 bg-neutral-100 rounded-xl items-center flex-row justify-center gap-2"
            >
              <MaterialIcons name="flag" size={18} color="#525252" />
              <Text className="text-neutral-700 font-medium">Fim do Set</Text>
            </Pressable>
            <Pressable
              onPress={handleFinishMatch}
              className="flex-1 py-3 bg-red-50 rounded-xl items-center flex-row justify-center gap-2"
            >
              <MaterialIcons name="stop" size={18} color="#EF4444" />
              <Text className="text-red-500 font-medium">Encerrar</Text>
            </Pressable>
          </View>
        )}

        {/* Finished State */}
        {score?.status === 'finished' && (
          <View className="px-5 pb-4">
            <View className="bg-lime-50 border border-lime-200 rounded-2xl p-4 items-center">
              <MaterialIcons name="emoji-events" size={40} color="#84CC16" />
              <Text className="text-lime-700 font-bold text-lg mt-2">Partida Finalizada!</Text>
              <Text className="text-lime-600 mt-1">
                Vencedor: Time {score.winner_team?.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Score Panel Modal */}
      {showScorePanel && (
        <Pressable
          onPress={() => setShowScorePanel(false)}
          className="absolute inset-0 bg-black/50 items-center justify-center"
        >
          <View className="w-[90%] bg-white rounded-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-black">Placar Detalhado</Text>
              <Pressable onPress={() => setShowScorePanel(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </Pressable>
            </View>

            {/* Teams */}
            <View className="flex-row justify-between mb-6">
              {/* Team A */}
              <View className="flex-1 items-center">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl font-bold text-blue-600">A</Text>
                </View>
                <Text className="text-4xl font-bold text-black">{score?.team_a_score || 0}</Text>
                <Text className="text-sm text-neutral-500 mt-1">{score?.team_a_sets || 0} sets</Text>
              </View>

              <View className="items-center justify-center px-4">
                <Text className="text-3xl font-light text-neutral-300">vs</Text>
              </View>

              {/* Team B */}
              <View className="flex-1 items-center">
                <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl font-bold text-red-600">B</Text>
                </View>
                <Text className="text-4xl font-bold text-black">{score?.team_b_score || 0}</Text>
                <Text className="text-sm text-neutral-500 mt-1">{score?.team_b_sets || 0} sets</Text>
              </View>
            </View>

            {/* Quick Score Buttons */}
            {score?.status === 'in_progress' && (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    handleAddPoint('a');
                    setShowScorePanel(false);
                  }}
                  className="flex-1 py-4 bg-blue-500 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">+1 Time A</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    handleAddPoint('b');
                    setShowScorePanel(false);
                  }}
                  className="flex-1 py-4 bg-red-500 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">+1 Time B</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>
      )}
    </View>
  );
}
