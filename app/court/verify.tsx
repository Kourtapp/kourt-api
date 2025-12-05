import { View, Text, ScrollView, Pressable, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
}

export default function VerifyCourtScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState({
    exists: false,
    accessible: false,
    goodCondition: false,
    correctLocation: false,
    hasAmenities: false,
  });

  const verificationSteps: VerificationStep[] = [
    {
      id: 'exists',
      title: 'Quadra existe',
      description: 'Confirme que a quadra realmente existe no local',
      icon: 'check-circle',
      completed: checklist.exists,
    },
    {
      id: 'accessible',
      title: 'Acesso público',
      description: 'A quadra é acessível ao público ou requer reserva',
      icon: 'accessibility',
      completed: checklist.accessible,
    },
    {
      id: 'goodCondition',
      title: 'Boas condições',
      description: 'Piso, rede e estrutura em bom estado',
      icon: 'thumb-up',
      completed: checklist.goodCondition,
    },
    {
      id: 'correctLocation',
      title: 'Localização correta',
      description: 'O endereço no mapa está correto',
      icon: 'place',
      completed: checklist.correctLocation,
    },
    {
      id: 'hasAmenities',
      title: 'Possui estrutura',
      description: 'Vestiário, estacionamento, iluminação, etc.',
      icon: 'local-parking',
      completed: checklist.hasAmenities,
    },
  ];

  const toggleStep = (stepId: string) => {
    setChecklist((prev) => ({
      ...prev,
      [stepId]: !prev[stepId as keyof typeof prev],
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset: { uri: string }) => asset.uri);
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos.');
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

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const canSubmit = completedCount >= 3 && photos.length >= 1;

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert(
        'Verificação incompleta',
        'Complete pelo menos 3 itens do checklist e adicione pelo menos 1 foto.'
      );
      return;
    }

    // TODO: Submit verification to backend
    Alert.alert(
      'Verificação enviada!',
      'Obrigado por contribuir! Você ganhou +100 XP.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-neutral-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <View>
            <Text className="text-lg font-bold text-black">Verificar Quadra</Text>
            <Text className="text-sm text-neutral-500">Ganhe +100 XP por verificar</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View className="px-5 py-4 bg-lime-50 border-b border-lime-100">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-lime-800">Progresso da verificação</Text>
            <Text className="text-sm font-bold text-lime-700">{completedCount}/5</Text>
          </View>
          <View className="h-2 bg-lime-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-lime-500 rounded-full"
              style={{ width: `${(completedCount / 5) * 100}%` }}
            />
          </View>
        </View>

        {/* Checklist */}
        <View className="px-5 py-4">
          <Text className="text-base font-bold text-black mb-4">Checklist de Verificação</Text>
          <View className="gap-3">
            {verificationSteps.map((step) => (
              <Pressable
                key={step.id}
                onPress={() => toggleStep(step.id)}
                className={`flex-row items-center p-4 rounded-xl border ${
                  step.completed
                    ? 'bg-lime-50 border-lime-300'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    step.completed ? 'bg-lime-500' : 'bg-neutral-100'
                  }`}
                >
                  <MaterialIcons
                    name={step.completed ? 'check' : (step.icon as any)}
                    size={22}
                    color={step.completed ? '#fff' : '#525252'}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${step.completed ? 'text-lime-800' : 'text-black'}`}>
                    {step.title}
                  </Text>
                  <Text className={`text-sm ${step.completed ? 'text-lime-600' : 'text-neutral-500'}`}>
                    {step.description}
                  </Text>
                </View>
                <MaterialIcons
                  name={step.completed ? 'check-circle' : 'radio-button-unchecked'}
                  size={24}
                  color={step.completed ? '#84CC16' : '#D4D4D4'}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Photos Section */}
        <View className="px-5 py-4 border-t border-neutral-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-bold text-black">Fotos da Quadra</Text>
            <Text className="text-sm text-neutral-500">{photos.length}/5</Text>
          </View>

          {/* Photo Grid */}
          <View className="flex-row flex-wrap gap-3 mb-4">
            {photos.map((photo, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: photo }}
                  className="w-24 h-24 rounded-xl"
                />
                <Pressable
                  onPress={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                >
                  <MaterialIcons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}

            {photos.length < 5 && (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={pickImage}
                  className="w-24 h-24 bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-300 items-center justify-center"
                >
                  <MaterialIcons name="photo-library" size={28} color="#A3A3A3" />
                  <Text className="text-xs text-neutral-500 mt-1">Galeria</Text>
                </Pressable>
                <Pressable
                  onPress={takePhoto}
                  className="w-24 h-24 bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-300 items-center justify-center"
                >
                  <MaterialIcons name="camera-alt" size={28} color="#A3A3A3" />
                  <Text className="text-xs text-neutral-500 mt-1">Câmera</Text>
                </Pressable>
              </View>
            )}
          </View>

          <Text className="text-xs text-neutral-500">
            Adicione pelo menos 1 foto para completar a verificação
          </Text>
        </View>

        {/* Notes */}
        <View className="px-5 py-4 border-t border-neutral-100">
          <Text className="text-base font-bold text-black mb-3">Observações (opcional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex: Boa iluminação, estacionamento pago, quadra coberta..."
            placeholderTextColor="#A3A3A3"
            multiline
            numberOfLines={4}
            className="bg-neutral-100 rounded-xl px-4 py-3 text-black min-h-[100px] border border-neutral-200"
            textAlignVertical="top"
          />
        </View>

        {/* Reward Info */}
        <View className="mx-5 my-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
              <MaterialIcons name="emoji-events" size={22} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-amber-800">Recompensa por verificar</Text>
              <Text className="text-sm text-amber-700">
                Você ganhará <Text className="font-bold">+100 XP</Text> após a verificação ser aprovada
              </Text>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Submit Button */}
      <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-neutral-100">
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 ${
            canSubmit ? 'bg-lime-500' : 'bg-neutral-200'
          }`}
        >
          <MaterialIcons
            name="verified"
            size={20}
            color={canSubmit ? '#000' : '#A3A3A3'}
          />
          <Text className={`font-bold ${canSubmit ? 'text-black' : 'text-neutral-400'}`}>
            Enviar Verificação
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
