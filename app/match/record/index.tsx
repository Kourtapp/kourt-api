import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useAuthStore } from '@/stores/authStore';
import { useSocialPostsStore } from '@/stores/socialPostsStore';

type ResultType = 'victory' | 'defeat' | 'draw';
type FeelingType = 'bad' | 'neutral' | 'good' | 'great';

interface Sport {
  id: string;
  name: string;
  icon: string;
  scoreFormat: 'sets' | 'goals' | 'points';
  metrics: { id: string; label: string; icon: string }[];
}

const SPORTS: Sport[] = [
  {
    id: 'beach',
    name: 'Beach Tennis',
    icon: 'sports-tennis',
    scoreFormat: 'sets',
    metrics: [
      { id: 'aces', label: 'Aces / Winners', icon: 'flag' },
      { id: 'errors', label: 'Erros não forçados', icon: 'error-outline' },
    ],
  },
  {
    id: 'padel',
    name: 'Padel',
    icon: 'sports-tennis',
    scoreFormat: 'sets',
    metrics: [
      { id: 'winners', label: 'Winners / Smashes', icon: 'flag' },
      { id: 'errors', label: 'Erros não forçados', icon: 'error-outline' },
    ],
  },
  {
    id: 'futebol',
    name: 'Futebol',
    icon: 'sports-soccer',
    scoreFormat: 'goals',
    metrics: [
      { id: 'goals', label: 'Gols marcados', icon: 'sports-soccer' },
      { id: 'assists', label: 'Assistências', icon: 'group' },
    ],
  },
  {
    id: 'volei',
    name: 'Vôlei',
    icon: 'sports-volleyball',
    scoreFormat: 'sets',
    metrics: [
      { id: 'aces', label: 'Aces de saque', icon: 'flag' },
      { id: 'blocks', label: 'Bloqueios', icon: 'block' },
    ],
  },
  {
    id: 'basquete',
    name: 'Basquete',
    icon: 'sports-basketball',
    scoreFormat: 'points',
    metrics: [
      { id: 'points', label: 'Pontos', icon: 'sports-basketball' },
      { id: 'rebounds', label: 'Rebotes', icon: 'replay' },
    ],
  },
  {
    id: 'tenis',
    name: 'Tênis',
    icon: 'sports-tennis',
    scoreFormat: 'sets',
    metrics: [
      { id: 'aces', label: 'Aces / Winners', icon: 'flag' },
      { id: 'errors', label: 'Erros não forçados', icon: 'error-outline' },
    ],
  },
];

const FEELINGS: { type: FeelingType; emoji: string }[] = [
  { type: 'bad', emoji: '😫' },
  { type: 'neutral', emoji: '😐' },
  { type: 'good', emoji: '😊' },
  { type: 'great', emoji: '🤩' },
];

export default function RecordMatchScreen() {
  const { profile, user } = useAuthStore();
  const { addPost } = useSocialPostsStore();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Photo
  const [photo, setPhoto] = useState<string | null>(null);
  const [addKourtBrand, setAddKourtBrand] = useState(true);

  // Step 2: Sport & Location
  const [selectedSport, setSelectedSport] = useState(SPORTS[0]);
  const [selectedVenue, setSelectedVenue] = useState({
    name: 'Arena BeachIbirapuera',
    isGPS: true,
  });
  const [venueSearch, setVenueSearch] = useState('');
  const [matchDate, setMatchDate] = useState('Hoje');
  const [matchTime, setMatchTime] = useState('18:00');

  // Step 3: Result & Score
  const [result, setResult] = useState<ResultType>('victory');
  const [sets, setSets] = useState([{ myScore: 6, opponentScore: 4 }]);
  const [description, setDescription] = useState('');
  const [teamPlayers, setTeamPlayers] = useState([
    { id: 'me', name: 'Você', username: '@' + (profile?.username || 'usuario'), isMe: true },
  ]);
  const [opponentPlayers, setOpponentPlayers] = useState<{ id: string; name: string; username: string }[]>([]);

  // Removed: Details step merged into other steps
  const [duration, setDuration] = useState('');
  const venue = selectedVenue.name;

  // Step 4: Metrics
  const [intensity, setIntensity] = useState(3);
  const [effort, setEffort] = useState(4);
  const [feeling, setFeeling] = useState<FeelingType>('good');
  const [sportMetrics, setSportMetrics] = useState<Record<string, number>>({});

  const [watchData] = useState({
    bpm: 142,
    calories: 450,
    distance: 4.2,
  });

  const [shareToInstagram, setShareToInstagram] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const calculateXP = () => {
    let xp = 100;
    if (photo) xp += 50;
    if (sets.some(s => s.myScore > 0 || s.opponentScore > 0)) xp += 30;
    if (description.length > 10) xp += 20;
    if (result === 'victory') xp += 50;
    if (Object.keys(sportMetrics).length >= 1) xp += 20;
    return xp;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const updateMetric = (metricId: string, delta: number) => {
    setSportMetrics(prev => ({
      ...prev,
      [metricId]: Math.max(0, (prev[metricId] || 0) + delta),
    }));
  };

  const updateSetScore = (setIndex: number, side: 'myScore' | 'opponentScore', delta: number) => {
    setSets(prev => prev.map((set, i) =>
      i === setIndex
        ? { ...set, [side]: Math.max(0, set[side] + delta) }
        : set
    ));
  };

  const addSet = () => {
    setSets(prev => [...prev, { myScore: 0, opponentScore: 0 }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removePlayer = (playerId: string) => {
    setTeamPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const getScoreLabel = () => {
    switch (selectedSport.scoreFormat) {
      case 'sets': return { singular: 'Set', plural: 'Sets', add: '+ Adicionar set' };
      case 'goals': return { singular: 'Tempo', plural: 'Tempos', add: '+ Adicionar tempo' };
      case 'points': return { singular: 'Período', plural: 'Períodos', add: '+ Adicionar período' };
      default: return { singular: 'Set', plural: 'Sets', add: '+ Adicionar set' };
    }
  };

  const getTotalScore = () => {
    // Para esportes com sets (tênis, beach tennis, padel, vôlei): mostrar set a set
    if (selectedSport.scoreFormat === 'sets') {
      // Formato: "6-4, 7-5, 6-3"
      return sets.map(set => `${set.myScore}-${set.opponentScore}`).join(', ');
    }

    // Para goals (futebol) e points (basquete): soma total
    const myTotal = sets.reduce((sum, set) => sum + set.myScore, 0);
    const oppTotal = sets.reduce((sum, set) => sum + set.opponentScore, 0);
    return `${myTotal} x ${oppTotal}`;
  };

  const getIntensityLabel = (level: number) => {
    const labels = ['Muito Leve', 'Leve', 'Moderada', 'Intensa', 'Muito Intensa'];
    return labels[level - 1] || 'Moderada';
  };

  const getEffortLabel = (level: number) => {
    const labels = ['Mínimo', 'Baixo', 'Médio', 'Alto', 'Máximo'];
    return labels[level - 1] || 'Médio';
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Photo is optional
      case 2:
        return selectedSport !== null; // Sport selected
      case 3:
        return true; // Score is optional now
      case 4:
        return true; // Metrics optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addPost({
      type: 'match_result',
      user: {
        id: user?.id,
        name: profile?.name || 'Você',
        avatar: profile?.avatar_url,
        username: profile?.username ? `@${profile.username}` : undefined,
      },
      sport: selectedSport.name,
      result: result,
      score: getTotalScore(),
      venue: venue || 'Quadra não informada',
      duration: duration ? `${duration} min` : undefined,
      description: description,
      photo: photo,
      xpEarned: calculateXP(),
      metrics: Object.fromEntries(
        Object.entries(sportMetrics).map(([k, v]) => [k, String(v)])
      ),
    });

    setIsLoading(false);

    if (shareToInstagram && photo) {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(photo, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Compartilhar no Instagram',
          });
        }
      } catch (e) {
        console.error('Share error:', e);
      }
    }

    Alert.alert(
      'Partida Registrada!',
      `Você ganhou +${calculateXP()} XP\n\nSua partida foi publicada no feed!`,
      [{ text: 'Ver no Feed', onPress: () => router.replace('/(tabs)/social') }]
    );
  };

  const getResultColor = (r: ResultType) => {
    switch (r) {
      case 'victory': return '#22C55E';
      case 'defeat': return '#EF4444';
      case 'draw': return '#6B7280';
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Registrar Partida';
      case 2: return 'Esporte e Local';
      case 3: return 'Resultado';
      case 4: return 'Métricas';
      default: return '';
    }
  };

  // Step 1: Photo
  const renderStep1 = () => (
    <View className="flex-1 px-6">
      {/* Photo Area */}
      <View className="flex-1 mb-6">
        {photo ? (
          <View className="flex-1 rounded-2xl overflow-hidden relative">
            <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
            {addKourtBrand && (
              <View className="absolute bottom-4 right-4 bg-black/70 px-3 py-2 rounded-lg flex-row items-center">
                <View className="w-6 h-6 bg-lime-500 rounded items-center justify-center mr-2">
                  <Text className="text-xs font-black text-black">K</Text>
                </View>
                <Text className="text-white font-bold text-sm">KOURT</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center bg-gray-50">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="photo-camera" size={36} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-1">Adicione fotos da partida</Text>
            <Text className="text-base text-gray-400">Quadra, grupo, placar ou momentos</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-4">
        <TouchableOpacity
          onPress={takePhoto}
          className="flex-1 flex-row items-center justify-center py-4 bg-gray-900 rounded-xl"
        >
          <MaterialIcons name="photo-camera" size={22} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">Tirar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickFromGallery}
          className="flex-1 flex-row items-center justify-center py-4 bg-white border-2 border-gray-200 rounded-xl"
        >
          <MaterialIcons name="photo-library" size={22} color="#374151" />
          <Text className="text-gray-900 font-semibold text-base ml-2">Galeria</Text>
        </TouchableOpacity>
      </View>

      {/* Kourt Brand Toggle */}
      <View className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-4">
        <View className="w-12 h-12 bg-gray-900 rounded-xl items-center justify-center">
          <Text className="text-white font-black text-lg">K</Text>
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-gray-900">Adicionar marca Kourt</Text>
          <Text className="text-sm text-gray-500">Logo + métricas na foto</Text>
        </View>
        <Switch
          value={addKourtBrand}
          onValueChange={setAddKourtBrand}
          trackColor={{ false: '#E5E7EB', true: '#1F2937' }}
          thumbColor="#fff"
        />
      </View>

      {/* Skip Photo */}
      <TouchableOpacity
        onPress={handleNext}
        className="items-center py-3"
      >
        <Text className="text-base text-gray-400">
          Pular foto <Text className="text-gray-400">→</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Step 2: Sport & Location
  const renderStep2 = () => (
    <View className="flex-1 px-6">
      {/* Sport Selection - Grid 3x2 */}
      <Text className="text-base font-medium text-gray-900 mb-4">Qual esporte você jogou?</Text>
      <View className="flex-row flex-wrap mb-8" style={{ marginHorizontal: -6 }}>
        {SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            onPress={() => setSelectedSport(sport)}
            className={`items-center justify-center py-4 rounded-xl mx-1.5 mb-3 ${
              selectedSport.id === sport.id
                ? 'bg-gray-900'
                : 'bg-white border border-gray-200'
            }`}
            style={{ width: '30%' }}
          >
            <MaterialIcons
              name={sport.icon as any}
              size={24}
              color={selectedSport.id === sport.id ? '#fff' : '#374151'}
            />
            <Text
              className={`mt-2 text-xs font-medium ${
                selectedSport.id === sport.id ? 'text-white' : 'text-gray-700'
              }`}
            >
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location Section */}
      <Text className="text-base font-medium text-gray-900 mb-4">Onde você jogou?</Text>

      {/* GPS Detected Location */}
      <TouchableOpacity
        className="flex-row items-center bg-green-50 border border-green-200 rounded-xl p-4 mb-3"
        onPress={() => setSelectedVenue({ name: 'Arena BeachIbirapuera', isGPS: true })}
      >
        <View className="w-10 h-10 rounded-full items-center justify-center">
          <MaterialIcons name="location-on" size={24} color="#22C55E" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-gray-900">{selectedVenue.name}</Text>
          <View className="flex-row items-center mt-0.5">
            <MaterialIcons name="gps-fixed" size={12} color="#EF4444" />
            <Text className="text-xs text-red-500 ml-1">Detectado por GPS</Text>
          </View>
        </View>
        {selectedVenue.isGPS && (
          <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
            <MaterialIcons name="check" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Search Other Court */}
      <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
        <MaterialIcons name="search" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 text-base text-gray-900 py-4 ml-3"
          placeholder="Buscar outra quadra..."
          placeholderTextColor="#9CA3AF"
          value={venueSearch}
          onChangeText={setVenueSearch}
        />
      </View>

      {/* When Section */}
      <Text className="text-base font-medium text-gray-900 mt-8 mb-4">Quando você jogou?</Text>

      <View className="flex-row gap-4">
        {/* Date Picker */}
        <View className="flex-1">
          <Text className="text-xs text-gray-500 mb-2">Data</Text>
          <TouchableOpacity className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-4">
            <MaterialIcons name="event" size={20} color="#9CA3AF" />
            <Text className="flex-1 text-base text-gray-900 ml-3">{matchDate}</Text>
          </TouchableOpacity>
        </View>

        {/* Time Picker */}
        <View className="flex-1">
          <Text className="text-xs text-gray-500 mb-2">Horário</Text>
          <TouchableOpacity className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-4">
            <MaterialIcons name="access-time" size={20} color="#9CA3AF" />
            <Text className="flex-1 text-base text-gray-900 ml-3">{matchTime}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Step 3: Result & Score
  const renderStep3 = () => (
    <View className="flex-1 px-6">
      {/* Result Selection */}
      <Text className="text-lg font-bold text-gray-900 mb-4">Como foi a partida?</Text>
      <View className="flex-row gap-3 mb-8">
        {(['victory', 'defeat', 'draw'] as ResultType[]).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setResult(r)}
            className={`flex-1 py-5 rounded-xl items-center border-2 ${
              result === r
                ? r === 'victory'
                  ? 'border-green-500 bg-green-50'
                  : r === 'defeat'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-500 bg-gray-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <MaterialIcons
              name={r === 'victory' ? 'emoji-events' : r === 'defeat' ? 'close' : 'handshake'}
              size={28}
              color={result === r ? getResultColor(r) : '#9CA3AF'}
            />
            <Text
              className={`mt-2 font-medium ${result === r ? '' : 'text-gray-400'}`}
              style={result === r ? { color: getResultColor(r) } : {}}
            >
              {r === 'victory' ? 'Vitória' : r === 'defeat' ? 'Derrota' : 'Empate'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Score with +/- buttons */}
      <Text className="text-lg font-bold text-gray-900 mb-4">Placar (opcional)</Text>
      <View className="bg-gray-50 rounded-2xl p-5 mb-6">
        {sets.map((set, index) => (
          <View key={index} className="mb-4">
            {/* Set/Tempo/Período header with delete button */}
            <View className="flex-row items-center justify-center mb-2">
              {sets.length > 1 && (
                <>
                  <Text className="text-xs text-gray-400">
                    {getScoreLabel().singular} {index + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeSet(index)}
                    className="ml-2 w-5 h-5 bg-red-100 rounded-full items-center justify-center"
                  >
                    <MaterialIcons name="close" size={12} color="#EF4444" />
                  </TouchableOpacity>
                </>
              )}
            </View>
            <View className="flex-row items-center justify-center">
              {/* My Score */}
              <View className="items-center">
                <Text className="text-xs text-gray-400 mb-2">Você</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => updateSetScore(index, 'myScore', -1)}
                    className="w-12 h-12 bg-gray-200 rounded-xl items-center justify-center"
                  >
                    <MaterialIcons name="remove" size={24} color="#6B7280" />
                  </TouchableOpacity>
                  <Text className="text-4xl font-bold text-gray-900 w-12 text-center">
                    {set.myScore}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateSetScore(index, 'myScore', 1)}
                    className="w-12 h-12 bg-gray-900 rounded-xl items-center justify-center"
                  >
                    <MaterialIcons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* X separator */}
              <Text className="text-2xl font-bold text-gray-300 mx-4">×</Text>

              {/* Opponent Score */}
              <View className="items-center">
                <Text className="text-xs text-gray-400 mb-2">Adversário</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => updateSetScore(index, 'opponentScore', -1)}
                    className="w-12 h-12 bg-gray-200 rounded-xl items-center justify-center"
                  >
                    <MaterialIcons name="remove" size={24} color="#6B7280" />
                  </TouchableOpacity>
                  <Text className="text-4xl font-bold text-gray-900 w-12 text-center">
                    {set.opponentScore}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateSetScore(index, 'opponentScore', 1)}
                    className="w-12 h-12 bg-gray-900 rounded-xl items-center justify-center"
                  >
                    <MaterialIcons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Add Set/Tempo/Período Button */}
        <TouchableOpacity onPress={addSet} className="items-center mt-2">
          <Text className="text-base text-gray-400">{getScoreLabel().add}</Text>
        </TouchableOpacity>
      </View>

      {/* Players Section */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">Jogadores</Text>
        <TouchableOpacity
          onPress={() => router.push('/match/search-players' as any)}
          className="flex-row items-center"
        >
          <MaterialIcons name="person-add" size={18} color="#374151" />
          <Text className="ml-1 text-sm font-medium text-gray-700">Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* My Team */}
      <Text className="text-xs text-gray-400 tracking-wide mb-2">SEU TIME</Text>
      <View className="gap-2">
        {teamPlayers.map((player) => (
          <View
            key={player.id}
            className={`flex-row items-center p-4 rounded-xl ${
              player.isMe ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <View className={`w-12 h-12 rounded-full items-center justify-center ${
              player.isMe ? 'bg-gray-900' : 'bg-gray-300'
            }`}>
              <MaterialIcons name="person" size={24} color={player.isMe ? '#fff' : '#6B7280'} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-gray-900">{player.name}</Text>
              <Text className="text-sm text-gray-500">{player.username}</Text>
            </View>
            {player.isMe ? (
              <View className="px-3 py-1 bg-green-100 rounded-lg">
                <Text className="text-xs font-bold text-green-600">VOCÊ</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => removePlayer(player.id)}>
                <MaterialIcons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  // Step 4: Metrics
  const getIntensityColor = (level: number, currentIntensity: number) => {
    if (level > currentIntensity) return '#E5E7EB'; // gray-200
    if (level <= 3) return '#1F2937'; // gray-900
    if (level === 4) return '#FCD34D'; // yellow-300
    return '#E5E7EB'; // gray-200
  };

  const getEffortColor = (level: number, currentEffort: number) => {
    if (level > currentEffort) return '#DBEAFE'; // blue-100
    return '#3B82F6'; // blue-500
  };

  const renderStep4 = () => (
    <View className="flex-1 px-6">
      {/* Apple Watch Card */}
      <LinearGradient
        colors={['#EC4899', '#F472B6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 16, marginBottom: 24 }}
      >
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
            <MaterialIcons name="watch" size={24} color="#fff" />
          </View>
          <View className="ml-3">
            <Text className="text-white font-bold">Dados do Apple Watch</Text>
            <Text className="text-white/70 text-xs">Sincronizado automaticamente</Text>
          </View>
        </View>
        <View className="flex-row justify-between">
          <View className="bg-white/20 rounded-xl px-4 py-3 items-center flex-1 mr-2">
            <Text className="text-2xl font-bold text-white">{watchData.bpm}</Text>
            <Text className="text-white/70 text-xs">BPM Médio</Text>
          </View>
          <View className="bg-white/20 rounded-xl px-4 py-3 items-center flex-1 mx-1">
            <Text className="text-2xl font-bold text-white">{watchData.calories}</Text>
            <Text className="text-white/70 text-xs">Calorias</Text>
          </View>
          <View className="bg-white/20 rounded-xl px-4 py-3 items-center flex-1 ml-2">
            <Text className="text-2xl font-bold text-white">{watchData.distance}</Text>
            <Text className="text-white/70 text-xs">Km</Text>
          </View>
        </View>
      </LinearGradient>

      <Text className="text-lg font-bold text-gray-900 mb-4">Adicionar métricas</Text>

      {/* Intensity and Effort side by side */}
      <View className="flex-row gap-3 mb-4">
        {/* Intensity */}
        <View className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="whatshot" size={18} color="#374151" />
            <Text className="ml-2 font-medium text-gray-900">Intensidade</Text>
          </View>
          <View className="flex-row gap-1.5 mb-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setIntensity(level)}
                className="flex-1 h-10 rounded-lg"
                style={{ backgroundColor: getIntensityColor(level, intensity) }}
              />
            ))}
          </View>
          <Text className="text-sm text-gray-500">{getIntensityLabel(intensity)}</Text>
        </View>

        {/* Effort */}
        <View className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="build" size={18} color="#3B82F6" />
            <Text className="ml-2 font-medium text-gray-900">Esforço</Text>
          </View>
          <View className="flex-row gap-1.5 mb-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setEffort(level)}
                className="flex-1 h-10 rounded-lg"
                style={{ backgroundColor: getEffortColor(level, effort) }}
              />
            ))}
          </View>
          <Text className="text-sm text-gray-500">{getEffortLabel(effort)}</Text>
        </View>
      </View>

      {/* Feeling */}
      <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="mood" size={20} color="#22C55E" />
            <Text className="ml-2 font-medium text-gray-900">Como se sentiu?</Text>
          </View>
          <View className="flex-row gap-2">
            {FEELINGS.map((f) => (
              <TouchableOpacity
                key={f.type}
                onPress={() => setFeeling(f.type)}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  feeling === f.type ? 'bg-lime-100' : ''
                }`}
              >
                <Text className="text-2xl">{f.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Sport-specific metrics */}
      {selectedSport.metrics.map((metric) => (
        <View key={metric.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">{metric.id === 'errors' ? '⚠️' : '🎯'}</Text>
              <Text className="font-medium text-gray-900">{metric.label}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => updateMetric(metric.id, -1)}
                className="w-10 h-10 bg-gray-200 rounded-lg items-center justify-center"
              >
                <MaterialIcons name="remove" size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900 w-8 text-center">
                {sportMetrics[metric.id] || 0}
              </Text>
              <TouchableOpacity
                onPress={() => updateMetric(metric.id, 1)}
                className="w-10 h-10 bg-gray-900 rounded-lg items-center justify-center"
              >
                <MaterialIcons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* Notes */}
      <Text className="text-lg font-bold text-gray-900 mt-4 mb-3">Notas (opcional)</Text>
      <View className="bg-gray-50 border border-gray-200 rounded-xl px-4">
        <TextInput
          className="text-base text-gray-900 py-4"
          placeholder="Como foi o jogo? O que você aprendeu?"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ minHeight: 80 }}
        />
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">{getStepTitle()}</Text>
        <Text className="text-base text-gray-400">{currentStep}/{totalSteps}</Text>
      </View>

      {/* Progress bar */}
      <View className="flex-row px-6 gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            className={`flex-1 h-1 rounded-full ${
              i < currentStep ? 'bg-gray-900' : 'bg-gray-200'
            }`}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderStepContent()}
        <View className="h-28" />
      </ScrollView>

      {/* Bottom button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 pb-8 border-t border-gray-100">
        {currentStep < totalSteps ? (
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed()}
            className={`w-full py-4 rounded-xl items-center ${
              canProceed() ? 'bg-gray-900' : 'bg-gray-200'
            }`}
          >
            <Text className={`font-semibold text-base ${canProceed() ? 'text-white' : 'text-gray-400'}`}>
              Próximo
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePublish}
            disabled={isLoading}
            className="w-full py-4 rounded-xl items-center bg-lime-500"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Publicar Partida
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
