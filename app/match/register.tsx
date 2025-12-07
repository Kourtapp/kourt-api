import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useAuthStore } from '@/stores/authStore';
import { useSocialPostsStore } from '@/stores/socialPostsStore';

type ResultType = 'victory' | 'defeat' | 'draw';

interface SportMetric {
  id: string;
  label: string;
  placeholder: string;
  unit?: string;
  keyboardType?: 'default' | 'number-pad';
}

interface Sport {
  id: string;
  name: string;
  icon: string;
  scoreFormat: 'sets' | 'goals' | 'points';
  metrics: SportMetric[];
}

const SPORTS: Sport[] = [
  {
    id: 'beach',
    name: 'Beach Tennis',
    icon: 'sports-tennis',
    scoreFormat: 'sets',
    metrics: [
      { id: 'aces', label: 'Aces', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'winners', label: 'Winners', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'double_faults', label: 'Duplas Faltas', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'unforced_errors', label: 'Erros não forçados', placeholder: '0', keyboardType: 'number-pad' },
    ],
  },
  {
    id: 'padel',
    name: 'Padel',
    icon: 'sports-tennis',
    scoreFormat: 'sets',
    metrics: [
      { id: 'winners', label: 'Winners', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'smashes', label: 'Smashes', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'volleys', label: 'Voleios', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'unforced_errors', label: 'Erros não forçados', placeholder: '0', keyboardType: 'number-pad' },
    ],
  },
  {
    id: 'futebol',
    name: 'Futebol',
    icon: 'sports-soccer',
    scoreFormat: 'goals',
    metrics: [
      { id: 'goals', label: 'Gols marcados', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'assists', label: 'Assistências', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'shots', label: 'Chutes ao gol', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'saves', label: 'Defesas', placeholder: '0', keyboardType: 'number-pad' },
    ],
  },
  {
    id: 'volei',
    name: 'Vôlei',
    icon: 'sports-volleyball',
    scoreFormat: 'sets',
    metrics: [
      { id: 'aces', label: 'Aces de saque', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'attacks', label: 'Ataques', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'blocks', label: 'Bloqueios', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'digs', label: 'Defesas', placeholder: '0', keyboardType: 'number-pad' },
    ],
  },
  {
    id: 'basquete',
    name: 'Basquete',
    icon: 'sports-basketball',
    scoreFormat: 'points',
    metrics: [
      { id: 'points', label: 'Pontos', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'rebounds', label: 'Rebotes', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'assists', label: 'Assistências', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'steals', label: 'Roubos de bola', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'three_pointers', label: 'Cestas de 3', placeholder: '0', keyboardType: 'number-pad' },
    ],
  },
  {
    id: 'tenis',
    name: 'Tênis',
    icon: 'sports-tennis',
    scoreFormat: 'sets',
    metrics: [
      { id: 'aces', label: 'Aces', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'double_faults', label: 'Duplas Faltas', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'winners', label: 'Winners', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'unforced_errors', label: 'Erros não forçados', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'break_points', label: 'Break points', placeholder: '0', keyboardType: 'number-pad' },
    ],
  },
  {
    id: 'futevolei',
    name: 'Futevôlei',
    icon: 'sports-volleyball',
    scoreFormat: 'sets',
    metrics: [
      { id: 'shark_attacks', label: 'Ataques de tubarão', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'headers', label: 'Cabeçadas', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'aces', label: 'Aces de saque', placeholder: '0', keyboardType: 'number-pad' },
    ],
  },
  {
    id: 'handebol',
    name: 'Handebol',
    icon: 'sports-handball',
    scoreFormat: 'goals',
    metrics: [
      { id: 'goals', label: 'Gols', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'assists', label: 'Assistências', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'saves', label: 'Defesas (goleiro)', placeholder: '0', keyboardType: 'number-pad' },
      { id: 'steals', label: 'Roubos de bola', placeholder: '0', keyboardType: 'number-pad' },
    ],
  },
];

const XP_REWARDS = {
  photo: 50,
  metrics: 30,
  description: 20,
  base: 100,
};

export default function RegisterMatchScreen() {
  const { profile, user } = useAuthStore();
  const { addPost } = useSocialPostsStore();
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState(SPORTS[0]);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [result, setResult] = useState<ResultType>('victory');
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [duration, setDuration] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [opponents, setOpponents] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shareToInstagram, setShareToInstagram] = useState(false);
  const [sportMetrics, setSportMetrics] = useState<Record<string, string>>({});
  const [showMetrics, setShowMetrics] = useState(false);

  const calculateXP = () => {
    let xp = XP_REWARDS.base;
    if (photo) xp += XP_REWARDS.photo;
    if (myScore && opponentScore) xp += XP_REWARDS.metrics;
    if (description.length > 10) xp += XP_REWARDS.description;
    if (result === 'victory') xp += 50;
    // Bonus XP for filling sport metrics
    const filledMetrics = Object.values(sportMetrics).filter(v => v && v !== '0').length;
    if (filledMetrics >= 2) xp += 20;
    return xp;
  };

  const updateMetric = (metricId: string, value: string) => {
    setSportMetrics(prev => ({ ...prev, [metricId]: value }));
  };

  // Reset metrics when sport changes
  const handleSportChange = (sport: Sport) => {
    setSelectedSport(sport);
    setShowSportPicker(false);
    setSportMetrics({}); // Reset metrics for new sport
  };

  // Get score label based on sport format
  const getScoreLabels = () => {
    switch (selectedSport.scoreFormat) {
      case 'sets':
        return { you: 'SETS', opponent: 'SETS', placeholder: '0' };
      case 'goals':
        return { you: 'GOLS', opponent: 'GOLS', placeholder: '0' };
      case 'points':
        return { you: 'PONTOS', opponent: 'PONTOS', placeholder: '0' };
      default:
        return { you: 'VOCÊ', opponent: 'ADVERSÁRIO', placeholder: '0' };
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à câmera para registrar sua partida.'
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à galeria para selecionar fotos.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a foto. Tente novamente.');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Adicionar Foto',
      'Como você quer adicionar a foto?',
      [
        { text: 'Tirar Foto', onPress: takePhoto },
        { text: 'Escolher da Galeria', onPress: pickFromGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const getResultColor = (r: ResultType) => {
    switch (r) {
      case 'victory': return '#22C55E';
      case 'defeat': return '#EF4444';
      case 'draw': return '#6B7280';
    }
  };

  const shareToInstagramStories = async () => {
    if (!photo) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
        return;
      }

      await Sharing.shareAsync(photo, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Compartilhar no Instagram',
        UTI: 'public.jpeg',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a imagem');
    }
  };

  const handleRegister = async () => {
    if (!myScore || !opponentScore) {
      Alert.alert('Atenção', 'Preencha o placar da partida.');
      return;
    }

    setIsLoading(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Criar e salvar post no feed social
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
      score: `${myScore} x ${opponentScore}`,
      venue: venue || 'Quadra não informada',
      duration: duration ? `${duration} min` : undefined,
      description: description,
      photo: photo,
      xpEarned: calculateXP(),
      metrics: Object.keys(sportMetrics).length > 0 ? sportMetrics : undefined,
    });

    console.log('[RegisterMatch] Post added to social feed');

    setIsLoading(false);

    // Share to Instagram if enabled
    if (shareToInstagram && photo) {
      await shareToInstagramStories();
    }

    Alert.alert(
      'Partida Registrada!',
      `Você ganhou +${calculateXP()} XP\n\nSua partida foi publicada no feed!`,
      [
        {
          text: 'Ver no Feed',
          onPress: () => router.replace('/(tabs)/social'),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Registrar Partida</Text>
        <View className="flex-row items-center bg-lime-100 px-3 py-1.5 rounded-full">
          <MaterialIcons name="bolt" size={16} color="#84CC16" />
          <Text className="text-lime-700 font-bold ml-1">+{calculateXP()} XP</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Photo Section */}
          <View className="px-4 py-4">
            <TouchableOpacity
              onPress={showPhotoOptions}
              className="relative"
            >
              {photo ? (
                <View className="relative">
                  <Image
                    source={{ uri: photo }}
                    className="w-full h-64 rounded-2xl"
                    resizeMode="cover"
                  />
                  {/* Logo Overlay */}
                  <View className="absolute bottom-3 right-3 bg-black/70 px-3 py-1.5 rounded-lg flex-row items-center">
                    <View className="w-5 h-5 bg-lime-500 rounded items-center justify-center mr-2">
                      <Text className="text-[10px] font-black text-black">K</Text>
                    </View>
                    <Text className="text-white font-bold text-xs">KOURT</Text>
                  </View>
                  {/* Change Photo Button */}
                  <TouchableOpacity
                    onPress={showPhotoOptions}
                    className="absolute top-3 right-3 bg-black/50 p-2 rounded-full"
                  >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                  </TouchableOpacity>
                  {/* XP Badge */}
                  <View className="absolute top-3 left-3 bg-lime-500 px-2 py-1 rounded-full flex-row items-center">
                    <MaterialIcons name="add" size={14} color="#1A2E05" />
                    <Text className="text-xs font-bold text-lime-950">50 XP</Text>
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={['#F5F5F5', '#E5E5E5']}
                  className="w-full h-64 rounded-2xl items-center justify-center border-2 border-dashed border-gray-300"
                >
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-3">
                    <MaterialIcons name="camera-alt" size={32} color="#9CA3AF" />
                  </View>
                  <Text className="text-gray-500 font-medium">Adicionar foto da partida</Text>
                  <View className="flex-row items-center mt-2 bg-lime-100 px-3 py-1 rounded-full">
                    <MaterialIcons name="add" size={14} color="#84CC16" />
                    <Text className="text-lime-700 font-bold text-xs ml-1">+50 XP</Text>
                  </View>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>

          {/* Sport Selector */}
          <View className="px-4 pb-4">
            <Text className="text-sm font-medium text-gray-500 mb-2">ESPORTE</Text>
            <TouchableOpacity
              onPress={() => setShowSportPicker(!showSportPicker)}
              className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <View className="flex-row items-center">
                <MaterialIcons name={selectedSport.icon as any} size={24} color="#374151" />
                <Text className="ml-3 text-base font-medium text-gray-900">{selectedSport.name}</Text>
              </View>
              <MaterialIcons
                name={showSportPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showSportPicker && (
              <View className="mt-2 bg-gray-50 rounded-xl overflow-hidden">
                {SPORTS.map((sport) => (
                  <TouchableOpacity
                    key={sport.id}
                    onPress={() => handleSportChange(sport)}
                    className={`flex-row items-center justify-between px-4 py-3 ${
                      sport.id === selectedSport.id ? 'bg-lime-50' : ''
                    }`}
                  >
                    <View className="flex-row items-center">
                      <MaterialIcons name={sport.icon as any} size={20} color="#374151" />
                      <Text className={`ml-3 ${
                        sport.id === selectedSport.id ? 'text-lime-700 font-medium' : 'text-gray-700'
                      }`}>
                        {sport.name}
                      </Text>
                    </View>
                    {sport.id === selectedSport.id && (
                      <MaterialIcons name="check" size={20} color="#84CC16" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Result Selection */}
          <View className="px-4 pb-4">
            <Text className="text-sm font-medium text-gray-500 mb-2">RESULTADO</Text>
            <View className="flex-row gap-2">
              {(['victory', 'defeat', 'draw'] as ResultType[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setResult(r)}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    result === r ? 'border-2' : 'bg-gray-50'
                  }`}
                  style={result === r ? { borderColor: getResultColor(r), backgroundColor: `${getResultColor(r)}10` } : {}}
                >
                  <MaterialIcons
                    name={r === 'victory' ? 'emoji-events' : r === 'defeat' ? 'sentiment-dissatisfied' : 'handshake'}
                    size={24}
                    color={result === r ? getResultColor(r) : '#9CA3AF'}
                  />
                  <Text
                    className={`mt-1 font-medium ${result === r ? '' : 'text-gray-400'}`}
                    style={result === r ? { color: getResultColor(r) } : {}}
                  >
                    {r === 'victory' ? 'Vitória' : r === 'defeat' ? 'Derrota' : 'Empate'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Score Input */}
          <View className="px-4 pb-4">
            <View className="flex-row items-center mb-2">
              <Text className="text-sm font-medium text-gray-500">PLACAR</Text>
              <View className="ml-2 bg-lime-100 px-2 py-0.5 rounded-full flex-row items-center">
                <MaterialIcons name="add" size={12} color="#84CC16" />
                <Text className="text-lime-700 font-bold text-[10px] ml-0.5">+30 XP</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-center gap-4">
              <View className="flex-1 items-center">
                <Text className="text-xs text-gray-400 mb-1">{getScoreLabels().you}</Text>
                <TextInput
                  className="w-full text-center text-3xl font-bold text-gray-900 bg-gray-50 rounded-xl py-4"
                  placeholder={getScoreLabels().placeholder}
                  placeholderTextColor="#D1D5DB"
                  value={myScore}
                  onChangeText={setMyScore}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              <Text className="text-2xl font-bold text-gray-300">×</Text>
              <View className="flex-1 items-center">
                <Text className="text-xs text-gray-400 mb-1">{getScoreLabels().opponent}</Text>
                <TextInput
                  className="w-full text-center text-3xl font-bold text-gray-900 bg-gray-50 rounded-xl py-4"
                  placeholder={getScoreLabels().placeholder}
                  placeholderTextColor="#D1D5DB"
                  value={opponentScore}
                  onChangeText={setOpponentScore}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>
          </View>

          {/* Duration Input */}
          <View className="px-4 pb-4">
            <Text className="text-sm font-medium text-gray-500 mb-2">DURAÇÃO (minutos)</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4">
              <MaterialIcons name="timer" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 text-base text-gray-900 py-4 ml-3"
                placeholder="Ex: 60"
                placeholderTextColor="#D1D5DB"
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
              />
              <Text className="text-gray-400">min</Text>
            </View>
          </View>

          {/* Sport-Specific Metrics */}
          <View className="px-4 pb-4">
            <TouchableOpacity
              onPress={() => setShowMetrics(!showMetrics)}
              className="flex-row items-center justify-between mb-2"
            >
              <View className="flex-row items-center">
                <Text className="text-sm font-medium text-gray-500">
                  ESTATÍSTICAS DE {selectedSport.name.toUpperCase()}
                </Text>
                <View className="ml-2 bg-lime-100 px-2 py-0.5 rounded-full flex-row items-center">
                  <MaterialIcons name="add" size={12} color="#84CC16" />
                  <Text className="text-lime-700 font-bold text-[10px] ml-0.5">+20 XP</Text>
                </View>
              </View>
              <MaterialIcons
                name={showMetrics ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showMetrics && (
              <View className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row flex-wrap gap-3">
                  {selectedSport.metrics.map((metric) => (
                    <View key={metric.id} className="w-[47%]">
                      <Text className="text-xs text-gray-500 mb-1">{metric.label}</Text>
                      <TextInput
                        className="text-center text-lg font-semibold text-gray-900 bg-white rounded-lg py-3 border border-gray-200"
                        placeholder={metric.placeholder}
                        placeholderTextColor="#D1D5DB"
                        value={sportMetrics[metric.id] || ''}
                        onChangeText={(value) => updateMetric(metric.id, value)}
                        keyboardType={metric.keyboardType || 'number-pad'}
                      />
                    </View>
                  ))}
                </View>
                <Text className="text-xs text-gray-400 mt-3 text-center">
                  Preencha pelo menos 2 estatísticas para ganhar +20 XP
                </Text>
              </View>
            )}
          </View>

          {/* Venue Input */}
          <View className="px-4 pb-4">
            <Text className="text-sm font-medium text-gray-500 mb-2">LOCAL</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4">
              <MaterialIcons name="location-on" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 text-base text-gray-900 py-4 ml-3"
                placeholder="Ex: Arena Ibirapuera"
                placeholderTextColor="#D1D5DB"
                value={venue}
                onChangeText={setVenue}
              />
            </View>
          </View>

          {/* Opponents Input */}
          <View className="px-4 pb-4">
            <Text className="text-sm font-medium text-gray-500 mb-2">ADVERSÁRIOS (opcional)</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4">
              <MaterialIcons name="people" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 text-base text-gray-900 py-4 ml-3"
                placeholder="Marque com @usuario"
                placeholderTextColor="#D1D5DB"
                value={opponents}
                onChangeText={setOpponents}
              />
            </View>
          </View>

          {/* Description Input */}
          <View className="px-4 pb-4">
            <View className="flex-row items-center mb-2">
              <Text className="text-sm font-medium text-gray-500">DESCRIÇÃO</Text>
              <View className="ml-2 bg-lime-100 px-2 py-0.5 rounded-full flex-row items-center">
                <MaterialIcons name="add" size={12} color="#84CC16" />
                <Text className="text-lime-700 font-bold text-[10px] ml-0.5">+20 XP</Text>
              </View>
            </View>
            <View className="bg-gray-50 rounded-xl px-4">
              <TextInput
                className="text-base text-gray-900 py-4"
                placeholder="Como foi a partida? Conte os melhores momentos..."
                placeholderTextColor="#D1D5DB"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* XP Summary */}
          <View className="mx-4 mb-4 p-4 bg-neutral-900 rounded-2xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-lime-500 rounded-xl items-center justify-center">
                  <MaterialIcons name="bolt" size={24} color="#1A2E05" />
                </View>
                <View className="ml-3">
                  <Text className="text-white font-bold">XP Total</Text>
                  <Text className="text-neutral-400 text-xs">Baseado nas informações</Text>
                </View>
              </View>
              <Text className="text-2xl font-black text-lime-400">+{calculateXP()}</Text>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-3">
              <View className="bg-neutral-800 px-2 py-1 rounded-full">
                <Text className="text-neutral-300 text-xs">Base: +100</Text>
              </View>
              {photo && (
                <View className="bg-lime-500/20 px-2 py-1 rounded-full">
                  <Text className="text-lime-400 text-xs">Foto: +50</Text>
                </View>
              )}
              {myScore && opponentScore && (
                <View className="bg-lime-500/20 px-2 py-1 rounded-full">
                  <Text className="text-lime-400 text-xs">Placar: +30</Text>
                </View>
              )}
              {description.length > 10 && (
                <View className="bg-lime-500/20 px-2 py-1 rounded-full">
                  <Text className="text-lime-400 text-xs">Descrição: +20</Text>
                </View>
              )}
              {result === 'victory' && (
                <View className="bg-lime-500/20 px-2 py-1 rounded-full">
                  <Text className="text-lime-400 text-xs">Vitória: +50</Text>
                </View>
              )}
              {Object.values(sportMetrics).filter(v => v && v !== '0').length >= 2 && (
                <View className="bg-lime-500/20 px-2 py-1 rounded-full">
                  <Text className="text-lime-400 text-xs">Estatísticas: +20</Text>
                </View>
              )}
            </View>
          </View>

          {/* Share Options */}
          <View className="mx-4 mb-4">
            <Text className="text-sm font-medium text-gray-500 mb-3">COMPARTILHAR</Text>

            {/* Post to Kourt Feed */}
            <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-2">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-black rounded-xl items-center justify-center">
                  <Text className="text-lime-500 font-black text-sm">K</Text>
                </View>
                <View className="ml-3">
                  <Text className="font-medium text-gray-900">Feed Kourt</Text>
                  <Text className="text-xs text-gray-500">Publicar no feed social</Text>
                </View>
              </View>
              <View className="w-6 h-6 bg-lime-500 rounded-full items-center justify-center">
                <MaterialIcons name="check" size={16} color="#fff" />
              </View>
            </View>

            {/* Share to Instagram */}
            {photo && (
              <TouchableOpacity
                onPress={() => setShareToInstagram(!shareToInstagram)}
                className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={['#833AB4', '#FD1D1D', '#F77737']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-10 h-10 rounded-xl items-center justify-center"
                  >
                    <MaterialIcons name="camera-alt" size={20} color="#fff" />
                  </LinearGradient>
                  <View className="ml-3">
                    <Text className="font-medium text-gray-900">Instagram</Text>
                    <Text className="text-xs text-gray-500">Compartilhar nos stories</Text>
                  </View>
                </View>
                <View className={`w-6 h-6 rounded-full items-center justify-center ${
                  shareToInstagram ? 'bg-lime-500' : 'bg-gray-200'
                }`}>
                  {shareToInstagram && <MaterialIcons name="check" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Spacer for bottom button */}
          <View className="h-28" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Register Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 pb-8">
        <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
          <LinearGradient
            colors={['#84CC16', '#65A30D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl py-4 items-center flex-row justify-center"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  Registrar Partida (+{calculateXP()} XP)
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
