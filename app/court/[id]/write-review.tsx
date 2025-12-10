import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCourtDetail } from '@/hooks';

const TAGS = [
  'Quadra impecável',
  'Boa iluminação',
  'Areia de qualidade',
  'Atendimento top',
  'Vestiário limpo',
  'Fácil estacionamento',
  'Ótima localização',
  'Rede nova',
  'Bom preço',
  'Ambiente agradável',
];

export default function WriteReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { court } = useCourtDetail(id);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Avaliação obrigatória', 'Por favor, selecione uma nota.');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert(
        'Avaliação enviada!',
        'Obrigado por compartilhar sua experiência.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1:
        return 'Péssimo';
      case 2:
        return 'Ruim';
      case 3:
        return 'Regular';
      case 4:
        return 'Bom';
      case 5:
        return 'Excelente';
      default:
        return 'Toque para avaliar';
    }
  };

  const isValid = rating > 0 && comment.length >= 10;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black ml-4">Escrever Avaliação</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Court Info */}
          <View className="px-5 py-4 border-b border-neutral-100">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 bg-neutral-100 rounded-xl items-center justify-center">
                <MaterialIcons name="sports-tennis" size={28} color="#A3A3A3" />
              </View>
              <View>
                <Text className="font-bold text-black text-lg">
                  {court?.name || 'Arena BeachClub'}
                </Text>
                <Text className="text-neutral-500">
                  {court?.sport || 'BeachTennis'} · {court?.city || 'São Paulo'}
                </Text>
              </View>
            </View>
          </View>

          {/* Rating */}
          <View className="px-5 py-6 items-center border-b border-neutral-100">
            <Text className="text-lg font-bold text-black mb-2">Como foi sua experiência?</Text>
            <Text className="text-neutral-500 mb-4">{getRatingText(rating)}</Text>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  className="p-2"
                >
                  <MaterialIcons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#FBBF24' : '#D4D4D4'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comment */}
          <View className="px-5 py-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">
              Conte mais sobre sua experiência
            </Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="O que você achou da quadra? Conte detalhes sobre a estrutura, atendimento, limpeza..."
              placeholderTextColor="#A3A3A3"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="border border-neutral-200 rounded-xl p-4 text-black min-h-[120px]"
            />
            <Text className="text-neutral-400 text-sm mt-2">
              Mínimo 10 caracteres ({comment.length}/10)
            </Text>
          </View>

          {/* Tags */}
          <View className="px-5 py-4">
            <Text className="text-sm font-medium text-neutral-700 mb-3">
              Destaques (opcional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedTags.includes(tag)
                      ? 'bg-black border-black'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedTags.includes(tag) ? 'text-white' : 'text-neutral-700'
                    }`}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Photos */}
          <View className="px-5 py-4">
            <Text className="text-sm font-medium text-neutral-700 mb-3">
              Adicionar fotos (opcional)
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {/* Add Photo Buttons */}
              {photos.length < 5 && (
                <>
                  <TouchableOpacity
                    onPress={takePhoto}
                    className="w-24 h-24 bg-neutral-100 rounded-xl items-center justify-center border-2 border-dashed border-neutral-300"
                  >
                    <MaterialIcons name="camera-alt" size={28} color="#737373" />
                    <Text className="text-xs text-neutral-500 mt-1">Câmera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={pickImage}
                    className="w-24 h-24 bg-neutral-100 rounded-xl items-center justify-center border-2 border-dashed border-neutral-300"
                  >
                    <MaterialIcons name="photo-library" size={28} color="#737373" />
                    <Text className="text-xs text-neutral-500 mt-1">Galeria</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Photo Previews */}
              {photos.map((photo, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri: photo }}
                    className="w-24 h-24 rounded-xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                  >
                    <MaterialIcons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Text className="text-neutral-400 text-sm mt-2">
              {photos.length}/5 fotos
            </Text>
          </View>

          {/* Tips */}
          <View className="mx-5 p-4 bg-amber-50 rounded-xl mb-4">
            <View className="flex-row items-start gap-3">
              <MaterialIcons name="tips-and-updates" size={20} color="#F59E0B" />
              <View className="flex-1">
                <Text className="font-medium text-amber-800 mb-1">Dicas para uma boa avaliação</Text>
                <Text className="text-amber-700 text-sm leading-5">
                  • Seja específico sobre o que gostou ou não{'\n'}
                  • Mencione detalhes úteis para outros jogadores{'\n'}
                  • Adicione fotos para ilustrar sua experiência
                </Text>
              </View>
            </View>
          </View>

          <View className="h-32" />
        </ScrollView>

        {/* Bottom CTA */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isValid || loading}
            className={`w-full py-4 rounded-full items-center ${
              isValid && !loading ? 'bg-black' : 'bg-neutral-200'
            }`}
          >
            <Text
              className={`font-bold text-lg ${
                isValid && !loading ? 'text-white' : 'text-neutral-400'
              }`}
            >
              {loading ? 'Enviando...' : 'Publicar Avaliação'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
