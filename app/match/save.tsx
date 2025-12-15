import React, { useState } from 'react';
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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type ResultType = 'victory' | 'defeat' | 'draw';
type VisibilityType = 'public' | 'friends' | 'private';

export default function SaveMatchScreen() {
  const params = useLocalSearchParams();

  const [title, setTitle] = useState('Vitória no Beach');
  const [description, setDescription] = useState('');
  const [selectedSport, setSelectedSport] = useState('BeachTennis');
  const [result, setResult] = useState<ResultType>('victory');
  const [visibility, setVisibility] = useState<VisibilityType>('public');
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showResultPicker, setShowResultPicker] = useState(false);

  const venue = (params.venue as string) || 'Arena Ibirapuera';
  const duration = (params.duration as string) || '1h30';
  const finalScore = (params.score as string) || '6-4, 6-2';

  const sports = ['BeachTennis', 'Padel', 'Futebol', 'Vôlei', 'Tênis', 'Basquete'];

  const results: { value: ResultType; label: string; color: string }[] = [
    { value: 'victory', label: 'Vitória', color: '#22C55E' },
    { value: 'defeat', label: 'Derrota', color: '#EF4444' },
    { value: 'draw', label: 'Empate', color: '#6B7280' },
  ];

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
    // TODO: Save match to database
    router.replace('/(tabs)' as any);
  };

  const handleAddPhotos = () => {
    // TODO: Open photo picker
  };

  const getResultColor = () => {
    return results.find(r => r.value === result)?.color || '#22C55E';
  };

  const getResultLabel = () => {
    return results.find(r => r.value === result)?.label || 'Vitória';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={handleCancel}>
          <Text className="text-gray-600 font-medium">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Salvar Partida</Text>
        <View className="w-16" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View className="px-4 pt-4">
            <TextInput
              className="text-2xl font-bold text-gray-900 py-2"
              placeholder="Título da partida"
              placeholderTextColor="#D1D5DB"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description Input */}
          <View className="px-4 pb-4 border-b border-gray-100">
            <TextInput
              className="text-base text-gray-600 py-2"
              placeholder="Como foi a partida? Marque outros jogadores com @..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Sport Selector */}
          <TouchableOpacity
            onPress={() => setShowSportPicker(!showSportPicker)}
            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="sports-tennis" size={24} color="#6B7280" />
              <Text className="ml-3 text-base text-gray-900">{selectedSport}</Text>
            </View>
            <MaterialIcons
              name={showSportPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showSportPicker && (
            <View className="bg-gray-50 border-b border-gray-100">
              {sports.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  onPress={() => {
                    setSelectedSport(sport);
                    setShowSportPicker(false);
                  }}
                  className="flex-row items-center justify-between px-4 py-3"
                >
                  <Text className={`text-base ${
                    sport === selectedSport ? 'text-[#22C55E] font-medium' : 'text-gray-700'
                  }`}>
                    {sport}
                  </Text>
                  {sport === selectedSport && (
                    <MaterialIcons name="check" size={20} color="#22C55E" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Map Preview */}
          <View className="px-4 py-4">
            <View className="flex-row">
              {/* Map Thumbnail */}
              <View className="w-40 h-28 bg-yellow-100 rounded-xl overflow-hidden mr-4">
                <View className="flex-1 items-center justify-center">
                  {/* Simplified court visual */}
                  <View className="w-20 h-14 bg-yellow-300 rounded border border-yellow-400">
                    <View className="absolute inset-0 items-center justify-center">
                      <View className="w-0.5 h-full bg-white/40" />
                      <View className="absolute w-full h-0.5 bg-white/40" />
                    </View>
                  </View>
                </View>
                {/* Venue Label */}
                <View className="absolute bottom-2 left-2 bg-[#22C55E] px-2 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-medium">{venue}</Text>
                </View>
              </View>

              {/* Add Photos Button */}
              <TouchableOpacity
                onPress={handleAddPhotos}
                className="flex-1 h-28 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center"
              >
                <MaterialIcons name="add-photo-alternate" size={32} color="#9CA3AF" />
                <Text className="text-sm text-gray-400 mt-2">Adicionar fotos</Text>
              </TouchableOpacity>
            </View>

            {/* Change Map Type Button */}
            <TouchableOpacity className="mt-4 py-3 border border-gray-200 rounded-xl items-center">
              <Text className="text-gray-700 font-medium">Alterar tipo de mapa</Text>
            </TouchableOpacity>
          </View>

          {/* Details Section */}
          <View className="px-4 py-4 border-t border-gray-100">
            <Text className="text-base font-semibold text-gray-900 mb-4">Detalhes</Text>

            {/* Result Selector */}
            <TouchableOpacity
              onPress={() => setShowResultPicker(!showResultPicker)}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <MaterialIcons name="emoji-events" size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">Resultado</Text>
              </View>
              <View className="flex-row items-center">
                <Text style={{ color: getResultColor() }} className="font-medium mr-2">
                  {getResultLabel()}
                </Text>
                <MaterialIcons
                  name={showResultPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color="#6B7280"
                />
              </View>
            </TouchableOpacity>

            {showResultPicker && (
              <View className="bg-gray-50 rounded-xl mb-3">
                {results.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => {
                      setResult(r.value);
                      setShowResultPicker(false);
                    }}
                    className="flex-row items-center justify-between px-4 py-3"
                  >
                    <Text style={{ color: r.color }} className="text-base font-medium">
                      {r.label}
                    </Text>
                    {r.value === result && (
                      <MaterialIcons name="check" size={20} color={r.color} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Duration */}
            <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <MaterialIcons name="timer" size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">Duração</Text>
              </View>
              <Text className="text-gray-900 font-medium">{duration}</Text>
            </View>

            {/* Final Score */}
            <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <MaterialIcons name="scoreboard" size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">Placar Final</Text>
              </View>
              <Text className="text-gray-900 font-medium">{finalScore}</Text>
            </View>

            {/* Venue */}
            <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <MaterialIcons name="location-on" size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">Local</Text>
              </View>
              <Text className="text-gray-900 font-medium">{venue}</Text>
            </View>

            {/* Visibility */}
            <View className="py-3 border-t border-gray-100">
              <View className="flex-row items-center mb-3">
                <MaterialIcons name="visibility" size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">Visibilidade</Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setVisibility('public')}
                  className={`flex-1 py-2 rounded-l-lg border ${
                    visibility === 'public'
                      ? 'bg-[#22C55E] border-[#22C55E]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-center font-medium ${
                    visibility === 'public' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Público
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setVisibility('friends')}
                  className={`flex-1 py-2 border-t border-b ${
                    visibility === 'friends'
                      ? 'bg-[#22C55E] border-[#22C55E]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-center font-medium ${
                    visibility === 'friends' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Amigos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setVisibility('private')}
                  className={`flex-1 py-2 rounded-r-lg border ${
                    visibility === 'private'
                      ? 'bg-[#22C55E] border-[#22C55E]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-center font-medium ${
                    visibility === 'private' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Privado
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Spacer for bottom button */}
          <View className="h-24" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Save Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 pb-8">
        <TouchableOpacity onPress={handleSave}>
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text className="text-white font-semibold text-base">Salvar Partida</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
