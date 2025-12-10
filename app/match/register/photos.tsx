import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRegisterMatch } from '@/contexts/RegisterMatchContext';

export default function RegisterPhotosScreen() {
  const { data, updateData, addPhoto, removePhoto } = useRegisterMatch();
  const params = useLocalSearchParams<{
    matchId?: string;
    duration?: string;
    sport?: string;
    courtName?: string;
    scoreA?: string;
    scoreB?: string;
    result?: string;
  }>();

  // Pre-fill data from live match if available
  useEffect(() => {
    if (params.duration || params.sport || params.courtName || params.result) {
      const updates: any = {};

      if (params.duration) {
        updates.duration = parseInt(params.duration, 10);
      }
      if (params.sport) {
        updates.sport = params.sport;
      }
      if (params.courtName) {
        updates.courtName = params.courtName;
      }
      if (params.result) {
        updates.result = params.result as 'win' | 'loss' | 'draw';
      }
      if (params.scoreA && params.scoreB) {
        const setsA = parseInt(params.scoreA, 10);
        const setsB = parseInt(params.scoreB, 10);
        if (setsA > 0 || setsB > 0) {
          updates.score = { teamA: [setsA], teamB: [setsB] };
        }
      }

      updateData(updates);
    }
  }, []);

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      addPhoto({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'photo',
      });
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      result.assets.forEach(asset => {
        addPhoto({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
        });
      });
    }
  };

  const handleNext = () => {
    router.push('/match/register/sport-location');
  };

  const handleSkip = () => {
    router.push('/match/register/sport-location');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Registrar Partida</Text>
        <Text className="text-neutral-400 font-medium">1/4</Text>
      </View>

      {/* Progress Bar */}
      <View className="flex-row px-5 gap-2 mb-6">
        <View className="flex-1 h-1 bg-black rounded-full" />
        <View className="flex-1 h-1 bg-neutral-200 rounded-full" />
        <View className="flex-1 h-1 bg-neutral-200 rounded-full" />
        <View className="flex-1 h-1 bg-neutral-200 rounded-full" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Photo Upload Area */}
        <TouchableOpacity
          onPress={handlePickFromGallery}
          className="border-2 border-dashed border-neutral-300 rounded-2xl items-center justify-center mb-6"
          style={{ minHeight: 280, paddingVertical: 40 }}
        >
          {data.photos.length > 0 ? (
            <View className="w-full px-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {data.photos.map((photo, index) => (
                  <View key={index} className="relative">
                    <Image
                      source={{ uri: photo.uri }}
                      className="w-32 h-32 rounded-xl"
                    />
                    {photo.type === 'video' && (
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                          <MaterialIcons name="play-arrow" size={24} color="#fff" />
                        </View>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full items-center justify-center"
                    >
                      <MaterialIcons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  className="w-32 h-32 border-2 border-dashed border-neutral-300 rounded-xl items-center justify-center"
                >
                  <MaterialIcons name="add" size={32} color="#A3A3A3" />
                </TouchableOpacity>
              </ScrollView>
            </View>
          ) : (
            <>
              <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="camera-alt" size={36} color="#A3A3A3" />
              </View>
              <Text className="text-xl font-bold text-black text-center mb-1">
                Adicione fotos da partida
              </Text>
              <Text className="text-neutral-500 text-center">
                Quadra, grupo, placar ou momentos
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={handleTakePhoto}
            className="flex-1 flex-row items-center justify-center gap-2 bg-black py-4 rounded-2xl"
          >
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
            <Text className="text-white font-semibold">Tirar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickFromGallery}
            className="flex-1 flex-row items-center justify-center gap-2 bg-neutral-100 py-4 rounded-2xl"
          >
            <MaterialIcons name="photo-library" size={20} color="#525252" />
            <Text className="text-black font-semibold">Galeria</Text>
          </TouchableOpacity>
        </View>

        {/* Kourt Branding Toggle */}
        <TouchableOpacity
          onPress={() => updateData({ addKourtBranding: !data.addKourtBranding })}
          className="flex-row items-center justify-between bg-neutral-50 p-4 rounded-2xl mb-6"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-black rounded-xl items-center justify-center">
              <Text className="text-white font-bold text-sm">K</Text>
            </View>
            <View>
              <Text className="text-black font-semibold">Adicionar marca Kourt</Text>
              <Text className="text-sm text-neutral-500">Logo + métricas na foto</Text>
            </View>
          </View>
          <View
            className={`w-12 h-7 rounded-full p-0.5 ${
              data.addKourtBranding ? 'bg-black' : 'bg-neutral-300'
            }`}
          >
            <View
              className={`w-6 h-6 bg-white rounded-full shadow ${
                data.addKourtBranding ? 'ml-auto' : ''
              }`}
            />
          </View>
        </TouchableOpacity>

        {/* Skip Option */}
        <TouchableOpacity onPress={handleSkip} className="items-center py-4">
          <Text className="text-neutral-500 text-base">Pular foto →</Text>
        </TouchableOpacity>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-black py-4 rounded-full items-center"
        >
          <Text className="text-white font-bold text-base">Próximo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
