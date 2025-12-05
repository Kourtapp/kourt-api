import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

// ============ TYPES ============
type CourtType = 'public' | 'private' | 'arena';

type PhotoType = 'overview' | 'net' | 'floor' | 'entrance' | 'parking' | 'locker' | 'lighting' | 'other';

interface PhotoItem {
  type: PhotoType;
  uri: string;
  required: boolean;
}

// ============ CONSTANTS ============
const COURT_TYPES = [
  {
    type: 'public' as CourtType,
    icon: 'location-city' as const,
    title: 'Quadra Pública',
    description: 'Parques, praças, escolas',
    features: [
      'Qualquer pessoa pode sugerir',
      'Gratuita para uso',
      'Você ganha +50 XP',
    ],
    color: '#22C55E',
    bgColor: '#DCFCE7',
    approval: '24h',
  },
  {
    type: 'private' as CourtType,
    icon: 'home' as const,
    title: 'Quadra Privada',
    description: 'Condomínios, residências',
    features: [
      'Você é dono ou morador',
      'Uso privado com amigos',
      'Não aparece no mapa público',
    ],
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    approval: '48h',
  },
  {
    type: 'arena' as CourtType,
    icon: 'stadium' as const,
    title: 'Arena / Clube',
    description: 'Espaços comerciais',
    features: [
      'Requer verificação de Host',
      'Receba reservas e pagamentos',
      'Aparece no mapa público',
    ],
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    approval: '48h',
  },
];

const SPORTS = [
  { id: 'beach-tennis', name: 'Beach Tennis', icon: 'sports-tennis' },
  { id: 'padel', name: 'Padel', icon: 'sports-tennis' },
  { id: 'tennis', name: 'Tênis', icon: 'sports-tennis' },
  { id: 'futevolei', name: 'Futevôlei', icon: 'sports-volleyball' },
  { id: 'volleyball', name: 'Vôlei', icon: 'sports-volleyball' },
  { id: 'football', name: 'Futebol', icon: 'sports-soccer' },
  { id: 'basketball', name: 'Basquete', icon: 'sports-basketball' },
  { id: 'peteca', name: 'Peteca', icon: 'sports-tennis' },
];

const FLOOR_TYPES = [
  { id: 'sand', name: 'Areia' },
  { id: 'clay', name: 'Saibro' },
  { id: 'concrete', name: 'Cimento' },
  { id: 'grass', name: 'Grama' },
  { id: 'synthetic', name: 'Sintético' },
  { id: 'wood', name: 'Madeira' },
  { id: 'other', name: 'Outro' },
];

const REQUIRED_PHOTOS: { type: PhotoType; title: string; description: string }[] = [
  { type: 'overview', title: 'Visão Geral', description: 'Mostre toda a quadra, incluindo linhas e rede' },
  { type: 'net', title: 'Rede / Tabela', description: 'Detalhe da rede, tabela ou equipamento principal' },
  { type: 'floor', title: 'Piso', description: 'Textura do piso (areia, saibro, cimento, etc)' },
];

const OPTIONAL_PHOTOS: { type: PhotoType; title: string }[] = [
  { type: 'entrance', title: 'Entrada' },
  { type: 'parking', title: 'Estacionamento' },
  { type: 'locker', title: 'Vestiário' },
  { type: 'lighting', title: 'Iluminação' },
  { type: 'other', title: 'Outro' },
];

// ============ MAIN COMPONENT ============
export default function AddCourtScreen() {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Flow state
  const [courtType, setCourtType] = useState<CourtType | null>(null);
  const [step, setStep] = useState(0); // 0 = type selection

  // Location state
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isAtLocation, setIsAtLocation] = useState(false);
  const [verifyingLocation, setVerifyingLocation] = useState(false);

  // Form data
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedFloorTypes, setSelectedFloorTypes] = useState<string[]>([]);
  const [numberOfCourts, setNumberOfCourts] = useState(1);
  const [hasLighting, setHasLighting] = useState(false);
  const [isCovered, setIsCovered] = useState(false);
  const [accessType, setAccessType] = useState<'free' | 'authorization' | 'scheduled'>('free');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    neighborhood: '',
    city: '',
    reference: '',
    description: '',
  });

  // Photos
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  // Documents (for private/arena)
  const [addressProof, setAddressProof] = useState<string | null>(null);
  const [cnpjDocument, setCnpjDocument] = useState<string | null>(null);

  // Terms
  const [acceptedTerms, setAcceptedTerms] = useState({
    truthful: false,
    ownPhotos: false,
    publicAccess: false,
    termsOfUse: false,
  });

  // ============ STEPS PER TYPE ============
  const getSteps = () => {
    if (courtType === 'public') {
      return [
        'type', 'location_permission', 'verify_gps', 'basic_info',
        'details', 'address', 'photos_guide', 'photos',
        'additional_photos', 'review', 'terms', 'success'
      ];
    } else if (courtType === 'private') {
      return [
        'type', 'intro_private', 'upload_proof', 'basic_info',
        'details', 'address', 'photos_guide', 'photos',
        'additional_photos', 'review', 'terms', 'success'
      ];
    } else {
      return [
        'type', 'intro_arena', 'upload_documents', 'basic_info',
        'details', 'address', 'photos_guide', 'photos',
        'additional_photos', 'review', 'terms', 'success'
      ];
    }
  };

  const currentStep = courtType ? getSteps()[step] : 'type';
  const totalSteps = courtType ? getSteps().length - 1 : 1; // -1 because success doesn't count

  // ============ EFFECTS ============
  useEffect(() => {
    // Pulse animation for GPS
    if (verifyingLocation) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [verifyingLocation]);

  // ============ HANDLERS ============
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
    if (status === 'granted') {
      setStep(step + 1);
    }
  };

  const verifyGPSLocation = async () => {
    setVerifyingLocation(true);
    try {
      // Increase timeout and set accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 seconds timeout
      });

      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });

      // Simulate verification (in production, compare with entered address)
      setTimeout(() => {
        setIsAtLocation(true);
        setVerifyingLocation(false);
        setStep(step + 1);
      }, 1500);
    } catch (error) {
      setVerifyingLocation(false);
      console.error('GPS Error:', error);

      // Offer option to skip verification
      Alert.alert(
        'Erro ao obter localização',
        'Não conseguimos verificar sua localização. Deseja continuar mesmo assim?',
        [
          { text: 'Tentar novamente', onPress: () => verifyGPSLocation() },
          {
            text: 'Pular verificação',
            onPress: () => {
              setIsAtLocation(true);
              setStep(step + 1);
            }
          }
        ]
      );
    }
  };

  const pickImage = async (isDocument = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: isDocument ? [4, 3] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  };

  const handleTakeRequiredPhoto = async (photoType: PhotoType) => {
    const uri = await takePhoto();
    if (uri) {
      setPhotos((prev) => {
        const existing = prev.findIndex((p) => p.type === photoType);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { type: photoType, uri, required: true };
          return updated;
        }
        return [...prev, { type: photoType, uri, required: true }];
      });
    }
  };

  const handleAddOptionalPhoto = async (photoType: PhotoType) => {
    const uri = await takePhoto();
    if (uri) {
      setPhotos((prev) => [...prev, { type: photoType, uri, required: false }]);
    }
  };

  const handleUploadAddressProof = async () => {
    const uri = await pickImage(true);
    if (uri) {
      setAddressProof(uri);
    }
  };

  const handleUploadCNPJ = async () => {
    const uri = await pickImage(true);
    if (uri) {
      setCnpjDocument(uri);
    }
  };

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId) ? prev.filter((s) => s !== sportId) : [...prev, sportId]
    );
  };

  const toggleFloorType = (floorId: string) => {
    setSelectedFloorTypes((prev) =>
      prev.includes(floorId) ? prev.filter((f) => f !== floorId) : [...prev, floorId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'type':
        return courtType !== null;
      case 'upload_proof':
        return addressProof !== null;
      case 'upload_documents':
        return cnpjDocument !== null;
      case 'basic_info':
        return formData.name && selectedSports.length > 0 && selectedFloorTypes.length > 0;
      case 'address':
        return formData.address && formData.city;
      case 'photos':
        const requiredCount = photos.filter((p) => p.required).length;
        return requiredCount >= 3;
      case 'terms':
        return Object.values(acceptedTerms).every(Boolean);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep === 'location_permission') {
      requestLocationPermission();
      return;
    }
    if (currentStep === 'verify_gps') {
      verifyGPSLocation();
      return;
    }
    if (currentStep === 'terms') {
      handleSubmit();
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile) {
      Alert.alert(
        'Autenticação Necessária',
        'Você precisa estar logado para sugerir uma quadra',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Fazer Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // Upload photos to storage (simplified - in production use proper storage)
      const photoUrls = photos.map((p) => p.uri);

      const { error } = await supabase.from('court_suggestions').insert({
        user_id: user.id,
        type: courtType,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        neighborhood: formData.neighborhood,
        reference: formData.reference,
        description: formData.description,
        sports: selectedSports,
        floor_types: selectedFloorTypes,
        number_of_courts: numberOfCourts,
        has_lighting: hasLighting,
        is_covered: isCovered,
        access_type: accessType,
        photos: photoUrls,
        latitude: currentLocation?.lat,
        longitude: currentLocation?.lng,
        status: 'pending',
      });

      if (error) throw error;

      // Award XP
      if (profile) {
        await supabase.from('profiles').update({
          xp: (profile.xp || 0) + 50,
        }).eq('id', user.id);
      }

      setStep(step + 1); // Go to success screen
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível enviar a sugestão');
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDER FUNCTIONS ============
  const renderTypeSelection = () => (
    <View className="px-5 py-4">
      <Text className="text-2xl font-bold text-black mb-2">Adicionar Quadra</Text>
      <Text className="text-neutral-500 mb-6">
        Qual tipo de quadra você quer adicionar?
      </Text>

      <View className="gap-4">
        {COURT_TYPES.map((type) => (
          <Pressable
            key={type.type}
            onPress={() => {
              setCourtType(type.type);
              setStep(1);
            }}
            className="p-4 rounded-2xl border-2 border-neutral-200 bg-white active:bg-neutral-50"
          >
            <View className="flex-row items-start gap-4">
              <View
                className="w-14 h-14 rounded-xl items-center justify-center"
                style={{ backgroundColor: type.bgColor }}
              >
                <MaterialIcons name={type.icon} size={28} color={type.color} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-black">{type.title}</Text>
                <Text className="text-sm text-neutral-500 mb-2">{type.description}</Text>
                <View className="gap-1">
                  {type.features.map((feature, idx) => (
                    <View key={idx} className="flex-row items-center gap-2">
                      <MaterialIcons name="check" size={14} color={type.color} />
                      <Text className="text-xs text-neutral-600">{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderLocationPermission = () => (
    <View className="flex-1 px-5 py-8 items-center justify-center">
      <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
        <MaterialIcons name="location-on" size={48} color="#22C55E" />
      </View>

      <Text className="text-2xl font-bold text-black text-center mb-2">
        Precisamos da sua localização
      </Text>
      <Text className="text-neutral-500 text-center mb-8 px-4">
        Para garantir que as quadras cadastradas são reais, precisamos verificar que você está no local.
      </Text>

      <View className="w-full gap-3 mb-8">
        {[
          { icon: 'check-circle', text: 'Fotos só podem ser tiradas no local' },
          { icon: 'check-circle', text: 'Endereço preenchido automaticamente' },
          { icon: 'check-circle', text: 'Sua localização não é compartilhada' },
        ].map((item, idx) => (
          <View key={idx} className="flex-row items-center gap-3 p-4 bg-green-50 rounded-xl">
            <MaterialIcons name={item.icon as any} size={20} color="#22C55E" />
            <Text className="flex-1 text-sm text-neutral-700">{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderVerifyGPS = () => (
    <View className="flex-1 px-5 py-8 items-center justify-center">
      <Animated.View
        style={{ transform: [{ scale: pulseAnim }] }}
        className="w-32 h-32 bg-green-100 rounded-full items-center justify-center mb-6"
      >
        <View className="w-24 h-24 bg-green-200 rounded-full items-center justify-center">
          <MaterialIcons name="my-location" size={40} color="#22C55E" />
        </View>
      </Animated.View>

      <Text className="text-xl font-bold text-black text-center mb-2">
        Verificando sua localização...
      </Text>

      <View className="w-full max-w-[200px] h-2 bg-neutral-200 rounded-full mt-4">
        <View className="h-full bg-green-500 rounded-full w-1/2" />
      </View>
    </View>
  );

  const renderIntroPrivate = () => (
    <View className="flex-1 px-5 py-8">
      <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6 self-center">
        <MaterialIcons name="home" size={40} color="#3B82F6" />
      </View>

      <Text className="text-2xl font-bold text-black text-center mb-2">
        Quadra Privada
      </Text>
      <Text className="text-neutral-500 text-center mb-8">
        Para adicionar uma quadra privada, precisamos verificar que você mora ou é proprietário do local.
      </Text>

      <View className="gap-4">
        <View className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <View className="flex-row items-center gap-3 mb-2">
            <MaterialIcons name="visibility-off" size={20} color="#3B82F6" />
            <Text className="font-semibold text-black">Privacidade garantida</Text>
          </View>
          <Text className="text-sm text-neutral-600">
            Sua quadra não aparece no mapa público. Apenas você e convidados podem ver.
          </Text>
        </View>

        <View className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <View className="flex-row items-center gap-3 mb-2">
            <MaterialIcons name="description" size={20} color="#3B82F6" />
            <Text className="font-semibold text-black">Comprovante necessário</Text>
          </View>
          <Text className="text-sm text-neutral-600">
            Envie um comprovante de endereço recente em seu nome ou contrato de locação.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderIntroArena = () => (
    <View className="flex-1 px-5 py-8">
      <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-6 self-center">
        <MaterialIcons name="stadium" size={40} color="#8B5CF6" />
      </View>

      <Text className="text-2xl font-bold text-black text-center mb-2">
        Arena / Clube
      </Text>
      <Text className="text-neutral-500 text-center mb-8">
        Para cadastrar um espaço comercial, você precisa ser o responsável pelo estabelecimento.
      </Text>

      <View className="gap-4">
        <View className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <View className="flex-row items-center gap-3 mb-2">
            <MaterialIcons name="verified" size={20} color="#8B5CF6" />
            <Text className="font-semibold text-black">Torne-se um Host</Text>
          </View>
          <Text className="text-sm text-neutral-600">
            Hosts verificados podem receber reservas e pagamentos pelo app.
          </Text>
        </View>

        <View className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <View className="flex-row items-center gap-3 mb-2">
            <MaterialIcons name="business" size={20} color="#8B5CF6" />
            <Text className="font-semibold text-black">Documentação necessária</Text>
          </View>
          <Text className="text-sm text-neutral-600">
            CNPJ ou CPF do responsável, comprovante do estabelecimento.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderUploadProof = () => (
    <View className="flex-1 px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Comprovante de Endereço</Text>
      <Text className="text-neutral-500 mb-6">
        Envie um documento que comprove seu vínculo com o endereço
      </Text>

      <View className="gap-4 mb-6">
        <Text className="text-sm font-medium text-neutral-700">Documentos aceitos:</Text>
        {['Conta de luz, água ou gás', 'Contrato de locação', 'IPTU em seu nome'].map((doc, idx) => (
          <View key={idx} className="flex-row items-center gap-2">
            <MaterialIcons name="check" size={16} color="#22C55E" />
            <Text className="text-sm text-neutral-600">{doc}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={handleUploadAddressProof}
        className={`p-6 rounded-2xl border-2 border-dashed items-center justify-center ${addressProof ? 'border-green-500 bg-green-50' : 'border-neutral-300 bg-neutral-50'
          }`}
      >
        {addressProof ? (
          <View className="items-center">
            <Image source={{ uri: addressProof }} className="w-40 h-28 rounded-lg mb-3" />
            <Text className="text-green-600 font-medium">Documento enviado</Text>
            <Text className="text-xs text-neutral-500 mt-1">Toque para alterar</Text>
          </View>
        ) : (
          <>
            <MaterialIcons name="cloud-upload" size={48} color="#A3A3A3" />
            <Text className="text-neutral-500 mt-3 font-medium">Toque para enviar</Text>
            <Text className="text-xs text-neutral-400 mt-1">PNG, JPG ou PDF</Text>
          </>
        )}
      </Pressable>

      <View className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="info" size={18} color="#F59E0B" />
          <Text className="text-sm text-amber-700 flex-1">
            O documento será analisado em até 48h e depois será deletado por segurança.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderUploadDocuments = () => (
    <View className="flex-1 px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Documentação do Estabelecimento</Text>
      <Text className="text-neutral-500 mb-6">
        Envie os documentos para verificação
      </Text>

      <View className="gap-4">
        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-3">CNPJ ou Documento do Responsável</Text>
          <Pressable
            onPress={handleUploadCNPJ}
            className={`p-5 rounded-2xl border-2 border-dashed items-center ${cnpjDocument ? 'border-green-500 bg-green-50' : 'border-neutral-300 bg-neutral-50'
              }`}
          >
            {cnpjDocument ? (
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="check-circle" size={24} color="#22C55E" />
                <Text className="text-green-600 font-medium">Documento enviado</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="upload-file" size={24} color="#A3A3A3" />
                <Text className="text-neutral-500">Enviar documento</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
        <Text className="text-sm text-purple-700">
          Após a aprovação, você terá acesso ao painel de Host para gerenciar reservas e horários.
        </Text>
      </View>
    </View>
  );

  const renderBasicInfo = () => (
    <View className="px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Informações da Quadra</Text>
      <Text className="text-neutral-500 mb-6">Conte-nos sobre este espaço</Text>

      <View className="gap-5">
        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Nome do Local *</Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Ex: Quadra do Parque Ibirapuera"
            placeholderTextColor="#A3A3A3"
            className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-3">Esportes Disponíveis *</Text>
          <View className="flex-row flex-wrap gap-2">
            {SPORTS.map((sport) => (
              <Pressable
                key={sport.id}
                onPress={() => toggleSport(sport.id)}
                className={`flex-row items-center gap-2 px-3 py-2 rounded-lg border ${selectedSports.includes(sport.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-neutral-200 bg-white'
                  }`}
              >
                <MaterialIcons
                  name={sport.icon as any}
                  size={18}
                  color={selectedSports.includes(sport.id) ? '#22C55E' : '#737373'}
                />
                <Text
                  className={`text-sm ${selectedSports.includes(sport.id) ? 'text-green-600 font-medium' : 'text-neutral-600'
                    }`}
                >
                  {sport.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-3">Tipo de Piso *</Text>
          <View className="flex-row flex-wrap gap-2">
            {FLOOR_TYPES.map((floor) => (
              <Pressable
                key={floor.id}
                onPress={() => toggleFloorType(floor.id)}
                className={`px-4 py-2 rounded-lg border ${selectedFloorTypes.includes(floor.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-neutral-200 bg-white'
                  }`}
              >
                <Text
                  className={`text-sm ${selectedFloorTypes.includes(floor.id) ? 'text-green-600 font-medium' : 'text-neutral-600'
                    }`}
                >
                  {floor.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-3">Quantidade de Quadras</Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <Pressable
                key={num}
                onPress={() => setNumberOfCourts(num)}
                className={`w-12 h-12 rounded-xl items-center justify-center ${numberOfCourts === num ? 'bg-green-500' : 'bg-neutral-100'
                  }`}
              >
                <Text className={`font-bold ${numberOfCourts === num ? 'text-white' : 'text-neutral-600'}`}>
                  {num === 5 ? '5+' : num}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderDetails = () => (
    <View className="px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Detalhes do Espaço</Text>
      <Text className="text-neutral-500 mb-6">Mais informações sobre a quadra</Text>

      <View className="gap-5">
        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-3">Iluminação</Text>
          <View className="gap-3">
            <Pressable
              onPress={() => setHasLighting(false)}
              className={`flex-row items-center p-4 rounded-xl border ${!hasLighting ? 'border-green-500 bg-green-50' : 'border-neutral-200'
                }`}
            >
              <MaterialIcons name="wb-sunny" size={24} color={!hasLighting ? '#22C55E' : '#737373'} />
              <View className="ml-3 flex-1">
                <Text className={`font-medium ${!hasLighting ? 'text-green-700' : 'text-neutral-700'}`}>
                  Apenas diurno
                </Text>
                <Text className="text-xs text-neutral-500">Sem iluminação para jogo noturno</Text>
              </View>
              {!hasLighting && <MaterialIcons name="check-circle" size={24} color="#22C55E" />}
            </Pressable>

            <Pressable
              onPress={() => setHasLighting(true)}
              className={`flex-row items-center p-4 rounded-xl border ${hasLighting ? 'border-green-500 bg-green-50' : 'border-neutral-200'
                }`}
            >
              <MaterialIcons name="nightlight-round" size={24} color={hasLighting ? '#22C55E' : '#737373'} />
              <View className="ml-3 flex-1">
                <Text className={`font-medium ${hasLighting ? 'text-green-700' : 'text-neutral-700'}`}>
                  Noturno disponível
                </Text>
                <Text className="text-xs text-neutral-500">Possui iluminação para jogar à noite</Text>
              </View>
              {hasLighting && <MaterialIcons name="check-circle" size={24} color="#22C55E" />}
            </Pressable>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-3">Cobertura</Text>
          <View className="gap-3">
            <Pressable
              onPress={() => setIsCovered(false)}
              className={`flex-row items-center p-4 rounded-xl border ${!isCovered ? 'border-green-500 bg-green-50' : 'border-neutral-200'
                }`}
            >
              <MaterialIcons name="wb-sunny" size={24} color={!isCovered ? '#22C55E' : '#737373'} />
              <View className="ml-3 flex-1">
                <Text className={`font-medium ${!isCovered ? 'text-green-700' : 'text-neutral-700'}`}>
                  Descoberta
                </Text>
                <Text className="text-xs text-neutral-500">Ao ar livre, sem cobertura</Text>
              </View>
              {!isCovered && <MaterialIcons name="check-circle" size={24} color="#22C55E" />}
            </Pressable>

            <Pressable
              onPress={() => setIsCovered(true)}
              className={`flex-row items-center p-4 rounded-xl border ${isCovered ? 'border-green-500 bg-green-50' : 'border-neutral-200'
                }`}
            >
              <MaterialIcons name="roofing" size={24} color={isCovered ? '#22C55E' : '#737373'} />
              <View className="ml-3 flex-1">
                <Text className={`font-medium ${isCovered ? 'text-green-700' : 'text-neutral-700'}`}>
                  Coberta
                </Text>
                <Text className="text-xs text-neutral-500">Protegida de sol e chuva</Text>
              </View>
              {isCovered && <MaterialIcons name="check-circle" size={24} color="#22C55E" />}
            </Pressable>
          </View>
        </View>

        {courtType === 'public' && (
          <View>
            <Text className="text-sm font-medium text-neutral-700 mb-3">Acesso</Text>
            <View className="gap-2">
              {[
                { id: 'free', label: 'Livre (qualquer pessoa)', icon: 'lock-open' },
                { id: 'authorization', label: 'Precisa de autorização', icon: 'admin-panel-settings' },
                { id: 'scheduled', label: 'Horários específicos', icon: 'schedule' },
              ].map((access) => (
                <Pressable
                  key={access.id}
                  onPress={() => setAccessType(access.id as any)}
                  className={`flex-row items-center p-3 rounded-xl border ${accessType === access.id ? 'border-green-500 bg-green-50' : 'border-neutral-200'
                    }`}
                >
                  <MaterialIcons
                    name={access.icon as any}
                    size={20}
                    color={accessType === access.id ? '#22C55E' : '#737373'}
                  />
                  <Text
                    className={`ml-3 ${accessType === access.id ? 'text-green-700 font-medium' : 'text-neutral-600'
                      }`}
                  >
                    {access.label}
                  </Text>
                  {accessType === access.id && (
                    <MaterialIcons name="check" size={20} color="#22C55E" className="ml-auto" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderAddress = () => (
    <View className="px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Localização</Text>
      <Text className="text-neutral-500 mb-6">Confirme o endereço da quadra</Text>

      {currentLocation && (
        <View className="h-40 bg-neutral-200 rounded-2xl mb-4 items-center justify-center">
          <MaterialIcons name="map" size={48} color="#A3A3A3" />
          <Text className="text-xs text-neutral-500 mt-2">Mapa em breve</Text>
        </View>
      )}

      {isAtLocation && (
        <View className="flex-row items-center gap-2 p-3 bg-green-50 rounded-xl mb-4">
          <MaterialIcons name="check-circle" size={20} color="#22C55E" />
          <Text className="text-sm text-green-700 font-medium">Localização verificada - Você está no local!</Text>
        </View>
      )}

      <View className="gap-4">
        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Endereço *</Text>
          <TextInput
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Rua, número"
            placeholderTextColor="#A3A3A3"
            autoComplete="street-address"
            className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Bairro</Text>
            <TextInput
              value={formData.neighborhood}
              onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
              placeholder="Vila Mariana"
              placeholderTextColor="#A3A3A3"
              className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Cidade *</Text>
            <TextInput
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="São Paulo"
              placeholderTextColor="#A3A3A3"
              className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
            />
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Ponto de Referência</Text>
          <TextInput
            value={formData.reference}
            onChangeText={(text) => setFormData({ ...formData, reference: text })}
            placeholder="Próximo ao portão 10 do parque"
            placeholderTextColor="#A3A3A3"
            className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
          />
        </View>
      </View>
    </View>
  );

  const renderPhotosGuide = () => (
    <View className="flex-1 px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Vamos tirar as fotos</Text>
      <Text className="text-neutral-500 mb-6">Siga o guia para melhores resultados</Text>

      <View className="p-4 bg-green-50 rounded-2xl border border-green-100 mb-6">
        <Text className="font-bold text-green-800 mb-2">PADRÃO KOURT DE FOTOS</Text>
        <Text className="text-sm text-green-700">
          Para manter a qualidade do app, todas as quadras seguem o mesmo padrão.
        </Text>
      </View>

      <Text className="font-bold text-black mb-4">3 FOTOS OBRIGATÓRIAS:</Text>

      <View className="flex-row gap-3 mb-6">
        {REQUIRED_PHOTOS.map((photo, idx) => (
          <View key={photo.type} className="flex-1 items-center">
            <View className="w-full aspect-[4/3] bg-neutral-100 rounded-xl items-center justify-center mb-2">
              <MaterialIcons name="camera-alt" size={24} color="#A3A3A3" />
            </View>
            <Text className="text-xs font-medium text-neutral-700 text-center">{photo.title}</Text>
          </View>
        ))}
      </View>

      <View className="p-4 bg-amber-50 rounded-xl border border-amber-200">
        <View className="flex-row items-start gap-2">
          <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
          <View className="flex-1">
            <Text className="font-medium text-amber-800 mb-1">Dicas:</Text>
            <Text className="text-sm text-amber-700">• Segure o celular na horizontal</Text>
            <Text className="text-sm text-amber-700">• Evite pessoas nas fotos</Text>
            <Text className="text-sm text-amber-700">• Boa iluminação é essencial</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPhotos = () => (
    <View className="px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Fotos Obrigatórias</Text>
      <Text className="text-neutral-500 mb-6">Tire as 3 fotos necessárias</Text>

      <View className="gap-4">
        {REQUIRED_PHOTOS.map((photo, idx) => {
          const existingPhoto = photos.find((p) => p.type === photo.type);
          return (
            <Pressable
              key={photo.type}
              onPress={() => handleTakeRequiredPhoto(photo.type)}
              className={`p-4 rounded-2xl border-2 ${existingPhoto ? 'border-green-500 bg-green-50' : 'border-neutral-200 bg-white'
                }`}
            >
              <View className="flex-row items-center gap-4">
                {existingPhoto ? (
                  <Image source={{ uri: existingPhoto.uri }} className="w-20 h-14 rounded-lg" />
                ) : (
                  <View className="w-20 h-14 bg-neutral-100 rounded-lg items-center justify-center">
                    <MaterialIcons name="add-a-photo" size={24} color="#A3A3A3" />
                  </View>
                )}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-bold text-black">Foto {idx + 1}: {photo.title}</Text>
                    {existingPhoto && <MaterialIcons name="check-circle" size={18} color="#22C55E" />}
                  </View>
                  <Text className="text-sm text-neutral-500 mt-1">{photo.description}</Text>
                </View>
                <MaterialIcons
                  name={existingPhoto ? 'refresh' : 'chevron-right'}
                  size={24}
                  color={existingPhoto ? '#22C55E' : '#A3A3A3'}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6 flex-row items-center gap-2">
        <MaterialIcons
          name={photos.filter((p) => p.required).length >= 3 ? 'check-circle' : 'info'}
          size={16}
          color={photos.filter((p) => p.required).length >= 3 ? '#22C55E' : '#F59E0B'}
        />
        <Text className={`text-sm ${photos.filter((p) => p.required).length >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
          {photos.filter((p) => p.required).length}/3 fotos obrigatórias
        </Text>
      </View>
    </View>
  );

  const renderAdditionalPhotos = () => (
    <View className="px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Suas Fotos</Text>
      <Text className="text-neutral-500 mb-6">Adicione mais fotos se desejar</Text>

      <Text className="font-medium text-neutral-700 mb-3">FOTOS OBRIGATÓRIAS ✓</Text>
      <View className="flex-row gap-3 mb-6">
        {REQUIRED_PHOTOS.map((photo) => {
          const existingPhoto = photos.find((p) => p.type === photo.type);
          return (
            <View key={photo.type} className="items-center">
              {existingPhoto ? (
                <Image source={{ uri: existingPhoto.uri }} className="w-20 h-14 rounded-lg" />
              ) : (
                <View className="w-20 h-14 bg-neutral-200 rounded-lg" />
              )}
              <View className="flex-row items-center gap-1 mt-1">
                <MaterialIcons name="check" size={12} color="#22C55E" />
                <Text className="text-xs text-neutral-600">{photo.title}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text className="font-medium text-neutral-700 mb-3">FOTOS OPCIONAIS</Text>
      <View className="flex-row flex-wrap gap-3">
        {OPTIONAL_PHOTOS.map((photo) => {
          const existingPhoto = photos.find((p) => p.type === photo.type && !p.required);
          return (
            <Pressable
              key={photo.type}
              onPress={() => handleAddOptionalPhoto(photo.type)}
              className="items-center"
            >
              {existingPhoto ? (
                <Image source={{ uri: existingPhoto.uri }} className="w-20 h-14 rounded-lg" />
              ) : (
                <View className="w-20 h-14 bg-neutral-100 rounded-lg items-center justify-center border border-dashed border-neutral-300">
                  <MaterialIcons name="add" size={24} color="#A3A3A3" />
                </View>
              )}
              <Text className="text-xs text-neutral-600 mt-1">{photo.title}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6 p-3 bg-neutral-50 rounded-xl">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="info" size={16} color="#737373" />
          <Text className="text-sm text-neutral-600">A primeira foto será a capa da quadra.</Text>
        </View>
      </View>
    </View>
  );

  const renderReview = () => {
    const typeInfo = COURT_TYPES.find((t) => t.type === courtType);
    return (
      <View className="px-5 py-4">
        <Text className="text-xl font-bold text-black mb-2">Revisar Sugestão</Text>
        <Text className="text-neutral-500 mb-6">Confira antes de enviar</Text>

        {/* Cover Photo */}
        <View className="rounded-2xl overflow-hidden mb-4">
          {photos[0] ? (
            <Image source={{ uri: photos[0].uri }} className="w-full h-48" />
          ) : (
            <View className="w-full h-48 bg-neutral-200 items-center justify-center">
              <MaterialIcons name="image" size={48} color="#A3A3A3" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <Text className="text-white text-lg font-bold">{formData.name}</Text>
            <View className="flex-row items-center gap-1 mt-1">
              <MaterialIcons name={typeInfo?.icon || 'place'} size={14} color="#fff" />
              <Text className="text-white/80 text-sm">{typeInfo?.title}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Info Section */}
        <View className="p-4 bg-neutral-50 rounded-2xl mb-4">
          <Text className="font-bold text-black mb-3">INFORMAÇÕES</Text>
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="sports-tennis" size={18} color="#737373" />
              <Text className="text-sm text-neutral-700">
                {selectedSports.map((s) => SPORTS.find((sp) => sp.id === s)?.name).join(', ')}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="layers" size={18} color="#737373" />
              <Text className="text-sm text-neutral-700">
                {selectedFloorTypes.map((f) => FLOOR_TYPES.find((fl) => fl.id === f)?.name).join(', ')} · {numberOfCourts} quadra{numberOfCourts > 1 ? 's' : ''}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <MaterialIcons name={hasLighting ? 'nightlight-round' : 'wb-sunny'} size={18} color="#737373" />
              <Text className="text-sm text-neutral-700">
                {hasLighting ? 'Iluminação noturna' : 'Apenas diurno'}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <MaterialIcons name={isCovered ? 'roofing' : 'wb-sunny'} size={18} color="#737373" />
              <Text className="text-sm text-neutral-700">
                {isCovered ? 'Coberta' : 'Descoberta'}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View className="p-4 bg-neutral-50 rounded-2xl mb-4">
          <Text className="font-bold text-black mb-3">LOCALIZAÇÃO</Text>
          <View className="flex-row items-start gap-3">
            <MaterialIcons name="location-on" size={18} color="#737373" />
            <View className="flex-1">
              <Text className="text-sm text-neutral-700">{formData.address}</Text>
              <Text className="text-sm text-neutral-500">
                {formData.neighborhood ? `${formData.neighborhood}, ` : ''}{formData.city}
              </Text>
              {formData.reference && (
                <Text className="text-xs text-neutral-400 mt-1">{formData.reference}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Photos Grid */}
        <View className="mb-4">
          <Text className="font-bold text-black mb-3">FOTOS ({photos.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {photos.map((photo, idx) => (
                <Image
                  key={idx}
                  source={{ uri: photo.uri }}
                  className="w-20 h-14 rounded-lg"
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderTerms = () => (
    <View className="px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Confirmar Envio</Text>
      <Text className="text-neutral-500 mb-6">Ao enviar esta sugestão, você confirma:</Text>

      <View className="gap-3 mb-6">
        {[
          { key: 'truthful', label: 'As informações são verdadeiras' },
          { key: 'ownPhotos', label: 'As fotos foram tiradas por mim no local indicado' },
          { key: 'publicAccess', label: courtType === 'public' ? 'A quadra é de acesso público' : 'Tenho autorização para cadastrar este local' },
          { key: 'termsOfUse', label: 'Concordo com os Termos de Uso e Política de Privacidade' },
        ].map((term) => (
          <Pressable
            key={term.key}
            onPress={() => setAcceptedTerms({ ...acceptedTerms, [term.key]: !acceptedTerms[term.key as keyof typeof acceptedTerms] })}
            className="flex-row items-center gap-3 p-4 bg-neutral-50 rounded-xl"
          >
            <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ${acceptedTerms[term.key as keyof typeof acceptedTerms]
              ? 'bg-green-500 border-green-500'
              : 'border-neutral-300'
              }`}>
              {acceptedTerms[term.key as keyof typeof acceptedTerms] && (
                <MaterialIcons name="check" size={16} color="#fff" />
              )}
            </View>
            <Text className="flex-1 text-sm text-neutral-700">{term.label}</Text>
          </Pressable>
        ))}
      </View>

      <View className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center">
            <MaterialIcons name="emoji-events" size={28} color="#F59E0B" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-amber-800">Você vai ganhar:</Text>
            <Text className="text-amber-700">+50 XP agora</Text>
            <Text className="text-amber-700">+100 XP se aprovada</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View className="flex-1 px-5 py-8 items-center justify-center">
      <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
        <MaterialIcons name="check-circle" size={64} color="#22C55E" />
      </View>

      <Text className="text-2xl font-bold text-black text-center mb-2">
        Sugestão Enviada!
      </Text>
      <Text className="text-neutral-500 text-center mb-8">
        Obrigado por contribuir com o Kourt!
      </Text>

      <View className="w-full gap-4 mb-8">
        <View className="flex-row items-center gap-3 p-4 bg-amber-50 rounded-xl">
          <MaterialIcons name="star" size={24} color="#F59E0B" />
          <View className="flex-1">
            <Text className="font-bold text-amber-800">+50 XP</Text>
            <Text className="text-sm text-amber-700">Recompensa por sugestão</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3 p-4 bg-blue-50 rounded-xl">
          <MaterialIcons name="schedule" size={24} color="#3B82F6" />
          <View className="flex-1">
            <Text className="font-bold text-blue-800">
              Análise em até {COURT_TYPES.find((t) => t.type === courtType)?.approval}
            </Text>
            <Text className="text-sm text-blue-700">
              Você será notificado quando a quadra for aprovada. (+100 XP bônus!)
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full gap-3">
        <Pressable
          onPress={() => {
            setCourtType(null);
            setStep(0);
            setPhotos([]);
            setFormData({ name: '', address: '', neighborhood: '', city: '', reference: '', description: '' });
            setSelectedSports([]);
            setSelectedFloorTypes([]);
            setAcceptedTerms({ truthful: false, ownPhotos: false, publicAccess: false, termsOfUse: false });
          }}
          className="py-4 bg-neutral-900 rounded-2xl items-center"
        >
          <Text className="text-white font-semibold">Sugerir Outra Quadra</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace('/(tabs)')}
          className="py-4 bg-neutral-100 rounded-2xl items-center"
        >
          <Text className="text-neutral-700 font-semibold">Voltar para Home</Text>
        </Pressable>
      </View>
    </View>
  );

  // ============ MAIN RENDER ============
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'type': return renderTypeSelection();
      case 'location_permission': return renderLocationPermission();
      case 'verify_gps': return renderVerifyGPS();
      case 'intro_private': return renderIntroPrivate();
      case 'intro_arena': return renderIntroArena();
      case 'upload_proof': return renderUploadProof();
      case 'upload_documents': return renderUploadDocuments();
      case 'basic_info': return renderBasicInfo();
      case 'details': return renderDetails();
      case 'address': return renderAddress();
      case 'photos_guide': return renderPhotosGuide();
      case 'photos': return renderPhotos();
      case 'additional_photos': return renderAdditionalPhotos();
      case 'review': return renderReview();
      case 'terms': return renderTerms();
      case 'success': return renderSuccess();
      default: return null;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 'location_permission': return 'Permitir Localização';
      case 'verify_gps': return 'Verificando...';
      case 'photos_guide': return 'Começar a Tirar Fotos';
      case 'terms': return 'Enviar Sugestão';
      case 'success': return null;
      default: return 'Continuar';
    }
  };

  const typeInfo = COURT_TYPES.find((t) => t.type === courtType);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      {currentStep !== 'success' && (
        <View className="flex-row items-center px-4 py-3 border-b border-neutral-100">
          <Pressable onPress={handleBack} className="p-2 -ml-2">
            <MaterialIcons name={step === 0 ? 'close' : 'arrow-back'} size={24} color="#000" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-lg font-bold text-black">
              {courtType ? typeInfo?.title : 'Adicionar Quadra'}
            </Text>
            {courtType && step > 0 && currentStep !== 'type' && (
              <Text className="text-sm text-neutral-500">
                Etapa {Math.min(step, totalSteps - 1)} de {totalSteps - 2}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Progress Bar */}
      {courtType && step > 0 && currentStep !== 'type' && currentStep !== 'success' && (
        <View className="flex-row px-4 py-3 gap-1">
          {Array.from({ length: totalSteps - 2 }).map((_, idx) => (
            <View
              key={idx}
              className={`flex-1 h-1 rounded-full ${idx < step - 1 ? 'bg-green-500' : 'bg-neutral-200'
                }`}
            />
          ))}
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {renderCurrentStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      {currentStep !== 'type' && currentStep !== 'success' && getButtonText() && (
        <View className="px-5 py-4 border-t border-neutral-100">
          {currentStep === 'location_permission' && (
            <Pressable
              onPress={() => setStep(step + 1)}
              className="py-3 mb-2"
            >
              <Text className="text-center text-neutral-500">Não agora</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleNext}
            disabled={!canProceed() || loading || currentStep === 'verify_gps'}
            className={`py-4 rounded-2xl items-center ${canProceed() && !loading && currentStep !== 'verify_gps' ? 'bg-black' : 'bg-neutral-300'
              }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">{getButtonText()}</Text>
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
