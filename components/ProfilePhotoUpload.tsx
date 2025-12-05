import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { imageService } from '@/services/imageService';
import { useAuthStore } from '@/stores/authStore';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  size?: number;
  onPhotoUpdated?: (url: string) => void;
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  size = 100,
  onPhotoUpdated,
}: ProfilePhotoUploadProps) {
  const { user, profile, fetchProfile } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handlePickImage = async () => {
    setShowOptions(false);
    const uri = await imageService.pickImage({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (uri) {
      await uploadImage(uri);
    }
  };

  const handleTakePhoto = async () => {
    setShowOptions(false);
    const uri = await imageService.takePhoto({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (uri) {
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado');
      return;
    }

    setUploading(true);

    try {
      const result = await imageService.uploadProfileImage(user.id, uri);

      if (result.success && result.url) {
        onPhotoUpdated?.(result.url);
        await fetchProfile();
        Alert.alert('Sucesso', 'Foto atualizada!');
      } else {
        Alert.alert('Erro', result.error || 'Falha ao atualizar foto');
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const photoUrl = currentPhotoUrl || profile?.avatar_url;

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowOptions(true)}
        disabled={uploading}
        className="relative"
        style={{ width: size, height: size }}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            className="rounded-full"
            style={{ width: size, height: size }}
          />
        ) : (
          <View
            className="rounded-full bg-gray-200 items-center justify-center"
            style={{ width: size, height: size }}
          >
            <Text className="text-gray-500 font-bold" style={{ fontSize: size / 2.5 }}>
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}

        {/* Edit badge */}
        <View
          className="absolute bottom-0 right-0 bg-[#22C55E] rounded-full items-center justify-center"
          style={{ width: size / 3.5, height: size / 3.5 }}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="camera-alt" size={size / 6} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-6" />

            <Text className="text-lg font-bold text-gray-900 mb-4">
              Alterar foto de perfil
            </Text>

            <TouchableOpacity
              onPress={handleTakePhoto}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <MaterialIcons name="camera-alt" size={20} color="#374151" />
              </View>
              <Text className="ml-4 text-base text-gray-900">Tirar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickImage}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <MaterialIcons name="photo-library" size={20} color="#374151" />
              </View>
              <Text className="ml-4 text-base text-gray-900">Escolher da galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowOptions(false)}
              className="mt-4 py-3 items-center"
            >
              <Text className="text-gray-500 font-medium">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
