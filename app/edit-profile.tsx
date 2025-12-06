import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { storageService } from '@/services/storageService';

export default function EditProfileScreen() {
  const { user, profile, refreshProfile } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form state
  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [neighborhood, setNeighborhood] = useState(profile?.neighborhood || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setNeighborhood(profile.neighborhood || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handlePickImage = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar Foto', 'Escolher da Galeria'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await takePhoto();
          } else if (buttonIndex === 2) {
            await pickFromGallery();
          }
        }
      );
    } else {
      Alert.alert('Alterar Foto', 'Escolha uma opção', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tirar Foto', onPress: takePhoto },
        { text: 'Escolher da Galeria', onPress: pickFromGallery },
      ]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para escolher fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?.id) return;

    setUploadingPhoto(true);
    try {
      const publicUrl = await storageService.uploadAvatar(user.id, uri);

      if (publicUrl) {
        setAvatarUrl(publicUrl);

        // Update profile in database
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (error) throw error;

        await refreshProfile();
        Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível fazer upload da foto.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar a foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    // Validate
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório.');
      return;
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Erro', 'O username deve conter apenas letras, números e underscore.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          username: username.trim().toLowerCase() || null,
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          city: city.trim() || null,
          neighborhood: neighborhood.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.code === '23505') {
        Alert.alert('Erro', 'Este username já está em uso.');
      } else {
        Alert.alert('Erro', 'Não foi possível salvar as alterações.');
      }
    } finally {
      setLoading(false);
    }
  };

  const userInitial = (name || 'U').charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Editar Perfil</Text>
        <Pressable onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#84CC16" />
          ) : (
            <Text className="text-lime-600 font-semibold">Salvar</Text>
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center py-8">
          <Pressable onPress={handlePickImage} disabled={uploadingPhoto}>
            <View className="relative">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-28 h-28 rounded-full"
                />
              ) : (
                <View className="w-28 h-28 bg-neutral-200 rounded-full items-center justify-center">
                  <Text className="text-4xl font-bold text-neutral-400">{userInitial}</Text>
                </View>
              )}
              {uploadingPhoto ? (
                <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <View className="absolute bottom-0 right-0 w-9 h-9 bg-lime-500 rounded-full items-center justify-center border-3 border-white">
                  <MaterialIcons name="camera-alt" size={18} color="#fff" />
                </View>
              )}
            </View>
          </Pressable>
          <Pressable onPress={handlePickImage} disabled={uploadingPhoto}>
            <Text className="text-lime-600 font-medium mt-3">Alterar foto</Text>
          </Pressable>
        </View>

        {/* Form */}
        <View className="px-5">
          {/* Name */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-neutral-500 mb-2">Nome</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
              placeholderTextColor="#A3A3A3"
              autoComplete="name"
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-black"
            />
          </View>

          {/* Username */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-neutral-500 mb-2">Username</Text>
            <View className="flex-row items-center bg-neutral-50 border border-neutral-200 rounded-xl px-4">
              <Text className="text-neutral-400">@</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="seu_username"
                placeholderTextColor="#A3A3A3"
                autoCapitalize="none"
                className="flex-1 py-3.5 text-black ml-1"
              />
            </View>
          </View>

          {/* Bio */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-neutral-500 mb-2">Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Conte um pouco sobre você..."
              placeholderTextColor="#A3A3A3"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-black min-h-[100px]"
            />
            <Text className="text-xs text-neutral-400 mt-1 text-right">
              {bio.length}/150
            </Text>
          </View>

          {/* Phone */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-neutral-500 mb-2">Telefone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#A3A3A3"
              keyboardType="phone-pad"
              autoComplete="tel"
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-black"
            />
          </View>

          {/* Location */}
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Localização
          </Text>

          <View className="mb-5">
            <Text className="text-sm font-medium text-neutral-500 mb-2">Cidade</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="São Paulo"
              placeholderTextColor="#A3A3A3"
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-black"
            />
          </View>

          <View className="mb-8">
            <Text className="text-sm font-medium text-neutral-500 mb-2">Bairro</Text>
            <TextInput
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Pinheiros"
              placeholderTextColor="#A3A3A3"
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-black"
            />
          </View>

          {/* Account Info */}
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Informações da Conta
          </Text>

          <View className="bg-neutral-50 rounded-xl p-4 mb-8">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-neutral-500">Email</Text>
              <Text className="text-black">{user?.email || '-'}</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-neutral-200">
              <Text className="text-neutral-500">Membro desde</Text>
              <Text className="text-black">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
                    month: 'short',
                    year: 'numeric',
                  })
                  : '-'}
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-neutral-200">
              <Text className="text-neutral-500">Plano</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-black">{profile?.subscription === 'pro' ? 'PRO' : 'Gratuito'}</Text>
                {profile?.subscription !== 'pro' && (
                  <Pressable
                    onPress={() => router.push('/premium' as any)}
                    className="bg-lime-100 px-2 py-1 rounded-full"
                  >
                    <Text className="text-xs text-lime-700 font-medium">Upgrade</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
