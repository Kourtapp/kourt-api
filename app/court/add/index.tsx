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
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { storageService } from '@/services/storageService';
import {
  verifyCourtSubmission,
  getVerificationFeedback,
  verifyIdentityDocument,
  verifyBusinessDocument,
  getDocumentVerificationFeedback,
  PhotoToVerify,
  CourtInfoToVerify,
  DocumentVerificationResult,
  PhotoContentValidation,
} from '@/services/courtVerificationService';
import { useDeviceCheck } from '@/hooks/useDeviceCheck';

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

const AMENITIES = [
  { id: 'parking', name: 'Estacionamento', icon: 'local-parking' },
  { id: 'locker_room', name: 'Vestiário', icon: 'checkroom' },
  { id: 'shower', name: 'Chuveiro', icon: 'shower' },
  { id: 'bathroom', name: 'Banheiro', icon: 'wc' },
  { id: 'water_fountain', name: 'Bebedouro', icon: 'water-drop' },
  { id: 'snack_bar', name: 'Lanchonete', icon: 'restaurant' },
  { id: 'equipment_rental', name: 'Aluguel de Equipamento', icon: 'sports-tennis' },
  { id: 'wifi', name: 'Wi-Fi', icon: 'wifi' },
  { id: 'security', name: 'Segurança', icon: 'security' },
  { id: 'accessibility', name: 'Acessibilidade', icon: 'accessible' },
  { id: 'first_aid', name: 'Primeiros Socorros', icon: 'medical-services' },
  { id: 'sound_system', name: 'Som Ambiente', icon: 'volume-up' },
];

// ============ MAIN COMPONENT ============
export default function AddCourtScreen() {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Device check for iPhone 11+ requirement
  const deviceCheck = useDeviceCheck();

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
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [loadingCep, setLoadingCep] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cep: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    reference: '',
    description: '',
  });

  // Photos
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [photoValidation, setPhotoValidation] = useState<{
    validating: boolean;
    results: PhotoContentValidation[];
  }>({ validating: false, results: [] });

  // Documents (for private/arena)
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [cnpjDocument, setCnpjDocument] = useState<string | null>(null);
  const [documentVerification, setDocumentVerification] = useState<{
    verified: boolean;
    result: DocumentVerificationResult | null;
    loading: boolean;
  }>({ verified: false, result: null, loading: false });

  // Pricing (for private/arena)
  const [pricing, setPricing] = useState({
    hourlyRate: '',
    peakHourRate: '',
    monthlyRate: '',
    hasPromotion: false,
    promotionDetails: '',
  });

  // Availability
  const [availability, setAvailability] = useState({
    monday: { open: true, start: '06:00', end: '22:00' },
    tuesday: { open: true, start: '06:00', end: '22:00' },
    wednesday: { open: true, start: '06:00', end: '22:00' },
    thursday: { open: true, start: '06:00', end: '22:00' },
    friday: { open: true, start: '06:00', end: '22:00' },
    saturday: { open: true, start: '08:00', end: '20:00' },
    sunday: { open: true, start: '08:00', end: '18:00' },
  });

  // Payment methods (for arena)
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);

  // Rules
  const [rules, setRules] = useState({
    minAdvanceBooking: '1', // hours
    maxAdvanceBooking: '30', // days
    cancellationPolicy: 'flexible', // flexible, moderate, strict
    allowedAgeGroups: ['all'],
    requiresDeposit: false,
    depositAmount: '',
    additionalRules: '',
  });

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
      // Quadra pública: sem preço, sem disponibilidade comercial
      return [
        'type', 'location_permission', 'verify_gps', 'basic_info',
        'details', 'address', 'photos_guide', 'photos',
        'additional_photos', 'review', 'terms', 'success'
      ];
    } else if (courtType === 'private') {
      // Quadra privada: documento, preço, disponibilidade, regras
      return [
        'type', 'intro_private', 'upload_id', 'basic_info',
        'details', 'pricing', 'availability', 'rules',
        'address', 'photos_guide', 'photos',
        'additional_photos', 'review', 'terms', 'success'
      ];
    } else {
      // Arena/Clube: CNPJ, preço, disponibilidade, pagamento, regras
      return [
        'type', 'intro_arena', 'upload_documents', 'basic_info',
        'details', 'pricing', 'availability', 'payment_methods', 'rules',
        'address', 'photos_guide', 'photos',
        'additional_photos', 'review', 'terms', 'success'
      ];
    }
  };

  const currentStep = courtType ? getSteps()[step] : 'type';
  const totalSteps = courtType ? getSteps().length : 1;
  const visibleSteps = totalSteps - 2; // Exclude 'type' and 'success' from count

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

  // Auto-start GPS verification when reaching that step
  useEffect(() => {
    if (currentStep === 'verify_gps' && !verifyingLocation && !isAtLocation) {
      verifyGPSLocation();
    }
  }, [currentStep]);

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

    // Timeout de segurança para não travar
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 10000); // 10 segundos máximo
    });

    try {
      // Check permission again
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão de localização não concedida');
      }

      // Race entre obter localização e timeout
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // Mais rápido
      });

      const location = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;

      if (location) {
        setCurrentLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }

      // Continuar imediatamente
      setIsAtLocation(true);
      setVerifyingLocation(false);
      setStep(step + 1);
    } catch (error) {
      setVerifyingLocation(false);
      console.error('GPS Error:', error);

      // Pular automaticamente se falhar - mostrar opção ao usuário
      Alert.alert(
        'Verificação de Localização',
        'Não foi possível obter sua localização GPS. Você pode continuar o cadastro e adicionar as fotos no local.',
        [
          {
            text: 'Continuar sem GPS',
            style: 'default',
            onPress: () => {
              setIsAtLocation(true);
              setStep(step + 1);
            }
          },
          { text: 'Tentar novamente', onPress: () => verifyGPSLocation() },
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const handleUploadIdDocument = async () => {
    const uri = await pickImage(true);
    if (uri) {
      setIdDocument(uri);

      // Iniciar verificação automática
      setDocumentVerification({ verified: false, result: null, loading: true });

      try {
        // Upload temporário para verificação
        const tempUrl = await storageService.uploadImage(
          'documents-temp',
          `verify_${Date.now()}.jpg`,
          uri
        );

        if (tempUrl) {
          const result = await verifyIdentityDocument(tempUrl, {
            name: profile?.name || '',
            cpf: profile?.cpf || undefined,
            birthDate: profile?.birth_date || undefined,
          });

          setDocumentVerification({ verified: true, result, loading: false });

          if (!result.isValid || !result.nameMatch) {
            const feedback = getDocumentVerificationFeedback(result);
            Alert.alert(feedback.title, feedback.message);
          }
        } else {
          setDocumentVerification({ verified: false, result: null, loading: false });
        }
      } catch (error) {
        console.error('Document verification error:', error);
        setDocumentVerification({ verified: false, result: null, loading: false });
      }
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

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  const formatCep = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  const toggleFloorType = (floorId: string) => {
    setSelectedFloorTypes((prev) => {
      if (prev.includes(floorId)) {
        // Always allow removal
        return prev.filter((f) => f !== floorId);
      } else {
        // Only add if under the limit (numberOfCourts)
        if (prev.length < numberOfCourts) {
          return [...prev, floorId];
        }
        return prev;
      }
    });
  };

  const handleNumberOfCourtsChange = (num: number) => {
    setNumberOfCourts(num);
    // Clear floor types that exceed the new limit
    if (selectedFloorTypes.length > num) {
      setSelectedFloorTypes(selectedFloorTypes.slice(0, num));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'type':
        return courtType !== null;
      case 'upload_id':
        return idDocument !== null;
      case 'upload_documents':
        return cnpjDocument !== null;
      case 'pricing':
        return pricing.hourlyRate !== '';
      case 'availability':
        return true; // Já tem valores default
      case 'payment_methods':
        return paymentMethods.length > 0;
      case 'rules':
        return true; // Já tem valores default
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
      // 1. Upload photos to Supabase storage
      const uploadedPhotos: { type: string; url: string }[] = [];

      for (const photo of photos) {
        try {
          const fileName = `court_${Date.now()}_${photo.type}.jpg`;
          const publicUrl = await storageService.uploadImage(
            'court-photos',
            fileName,
            photo.uri
          );
          if (publicUrl) {
            uploadedPhotos.push({
              type: photo.type,
              url: publicUrl,
            });
          }
        } catch (uploadErr) {
          console.error('Error uploading photo:', uploadErr);
        }
      }

      if (uploadedPhotos.length === 0) {
        throw new Error('Não foi possível fazer upload das fotos. Tente novamente.');
      }

      // 2. Verify photos with AI
      const photosToVerify: PhotoToVerify[] = uploadedPhotos.map(p => ({
        type: p.type === 'net' ? 'equipment' : p.type as PhotoToVerify['type'],
        url: p.url,
      }));

      const courtInfo: CourtInfoToVerify = {
        name: formData.name,
        description: formData.description,
        sports: selectedSports,
        floorTypes: selectedFloorTypes,
        hasLighting,
        isCovered,
      };

      const verificationResult = await verifyCourtSubmission(photosToVerify, courtInfo);
      const feedback = getVerificationFeedback(verificationResult);

      // 3. Determine status based on AI verification
      let aiStatus: 'pending' | 'verified' | 'rejected' | 'manual_review' = 'pending';
      if (verificationResult.isValid && verificationResult.confidence >= 0.8) {
        aiStatus = 'verified';
      } else if (!verificationResult.isSportsCourt || verificationResult.confidence < 0.3) {
        aiStatus = 'rejected';
      } else {
        aiStatus = 'manual_review';
      }

      // 4. Insert court suggestion with verification results
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
        photos: uploadedPhotos.map(p => p.url),
        latitude: currentLocation?.lat,
        longitude: currentLocation?.lng,
        status: 'pending',
        ai_verification_status: aiStatus,
        ai_verification_result: verificationResult,
        photos_metadata: uploadedPhotos,
      });

      if (error) throw error;

      // 5. Award XP
      if (profile) {
        await supabase.from('profiles').update({
          xp: (profile.xp || 0) + 50,
        }).eq('id', user.id);
      }

      // 6. Show feedback based on verification
      if (feedback.type === 'error') {
        Alert.alert(
          feedback.title,
          feedback.message + '\n\nSua sugestão foi enviada para revisão manual.',
          [{ text: 'OK' }]
        );
      } else if (feedback.type === 'warning') {
        Alert.alert(feedback.title, feedback.message);
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

  const renderUploadId = () => (
    <View className="flex-1 px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Documento de Identificação</Text>
      <Text className="text-neutral-500 mb-6">
        Precisamos validar sua identidade para garantir a segurança da plataforma
      </Text>

      {/* Dados do perfil que serão verificados */}
      <View className="mb-4 p-4 bg-neutral-50 rounded-xl">
        <Text className="text-xs text-neutral-500 mb-2">Dados a serem verificados:</Text>
        <Text className="text-sm font-medium text-neutral-700">Nome: {profile?.name || 'Não informado'}</Text>
        {profile?.cpf && (
          <Text className="text-sm text-neutral-600">CPF: {profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</Text>
        )}
      </View>

      <View className="gap-4 mb-6">
        <Text className="text-sm font-medium text-neutral-700">Documentos aceitos:</Text>
        {['RG (frente e verso)', 'CNH (Carteira de Motorista)', 'Passaporte'].map((doc, idx) => (
          <View key={idx} className="flex-row items-center gap-2">
            <MaterialIcons name="check" size={16} color="#22C55E" />
            <Text className="text-sm text-neutral-600">{doc}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={handleUploadIdDocument}
        disabled={documentVerification.loading}
        className={`p-6 rounded-2xl border-2 border-dashed items-center justify-center ${idDocument
          ? documentVerification.result?.nameMatch
            ? 'border-green-500 bg-green-50'
            : documentVerification.result && !documentVerification.result.nameMatch
              ? 'border-amber-500 bg-amber-50'
              : 'border-blue-500 bg-blue-50'
          : 'border-neutral-300 bg-neutral-50'
          }`}
      >
        {documentVerification.loading ? (
          <View className="items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-blue-600 mt-3 font-medium">Verificando documento...</Text>
            <Text className="text-xs text-neutral-500 mt-1">Analisando dados com IA</Text>
          </View>
        ) : idDocument ? (
          <View className="items-center">
            <Image source={{ uri: idDocument }} className="w-40 h-28 rounded-lg mb-3" />
            {documentVerification.result ? (
              <>
                {documentVerification.result.nameMatch ? (
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="verified" size={20} color="#22C55E" />
                    <Text className="text-green-600 font-medium">Documento verificado!</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="warning" size={20} color="#F59E0B" />
                    <Text className="text-amber-600 font-medium">Verificar dados</Text>
                  </View>
                )}
                {documentVerification.result.extractedData.name && (
                  <Text className="text-xs text-neutral-500 mt-1">
                    Nome encontrado: {documentVerification.result.extractedData.name}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text className="text-green-600 font-medium">Documento enviado</Text>
                <Text className="text-xs text-neutral-500 mt-1">Toque para alterar</Text>
              </>
            )}
          </View>
        ) : (
          <>
            <MaterialIcons name="badge" size={48} color="#A3A3A3" />
            <Text className="text-neutral-500 mt-3 font-medium">Toque para enviar</Text>
            <Text className="text-xs text-neutral-400 mt-1">PNG ou JPG</Text>
          </>
        )}
      </Pressable>

      {/* Status da verificação */}
      {documentVerification.result && !documentVerification.result.nameMatch && (
        <View className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <View className="flex-row items-start gap-2">
            <MaterialIcons name="warning" size={18} color="#F59E0B" />
            <View className="flex-1">
              <Text className="text-sm text-amber-700 font-medium">Nome não confere</Text>
              <Text className="text-xs text-amber-600 mt-1">
                O nome no documento não corresponde ao seu cadastro. Verifique se seus dados estão corretos ou envie outro documento.
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <View className="flex-row items-start gap-2">
          <MaterialIcons name="security" size={18} color="#3B82F6" />
          <Text className="text-sm text-blue-700 flex-1">
            Seus dados são protegidos e o documento será usado apenas para verificação por IA.
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

  const renderPricing = () => (
    <View className="px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Preços</Text>
      <Text className="text-neutral-500 mb-6">Defina os valores para reserva da quadra</Text>

      <View className="gap-5">
        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Valor por Hora *</Text>
          <View className="flex-row items-center px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <Text className="text-neutral-500 mr-2">R$</Text>
            <TextInput
              value={pricing.hourlyRate}
              onChangeText={(text) => setPricing({ ...pricing, hourlyRate: text.replace(/[^0-9,]/g, '') })}
              placeholder="100,00"
              placeholderTextColor="#A3A3A3"
              keyboardType="numeric"
              className="flex-1 text-base text-black"
            />
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Valor Horário de Pico (opcional)</Text>
          <View className="flex-row items-center px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <Text className="text-neutral-500 mr-2">R$</Text>
            <TextInput
              value={pricing.peakHourRate}
              onChangeText={(text) => setPricing({ ...pricing, peakHourRate: text.replace(/[^0-9,]/g, '') })}
              placeholder="150,00"
              placeholderTextColor="#A3A3A3"
              keyboardType="numeric"
              className="flex-1 text-base text-black"
            />
          </View>
          <Text className="text-xs text-neutral-400 mt-1">Fins de semana e feriados</Text>
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Mensalista (opcional)</Text>
          <View className="flex-row items-center px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <Text className="text-neutral-500 mr-2">R$</Text>
            <TextInput
              value={pricing.monthlyRate}
              onChangeText={(text) => setPricing({ ...pricing, monthlyRate: text.replace(/[^0-9,]/g, '') })}
              placeholder="800,00"
              placeholderTextColor="#A3A3A3"
              keyboardType="numeric"
              className="flex-1 text-base text-black"
            />
            <Text className="text-neutral-500">/mês</Text>
          </View>
        </View>

        <View className="p-4 bg-green-50 rounded-xl border border-green-200">
          <View className="flex-row items-start gap-2">
            <MaterialIcons name="lightbulb" size={18} color="#22C55E" />
            <Text className="text-sm text-green-700 flex-1">
              Preços competitivos atraem mais reservas! Pesquise os valores da região.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAvailability = () => {
    const days = [
      { key: 'monday', label: 'Segunda' },
      { key: 'tuesday', label: 'Terça' },
      { key: 'wednesday', label: 'Quarta' },
      { key: 'thursday', label: 'Quinta' },
      { key: 'friday', label: 'Sexta' },
      { key: 'saturday', label: 'Sábado' },
      { key: 'sunday', label: 'Domingo' },
    ];

    return (
      <ScrollView className="flex-1 px-5 py-4">
        <Text className="text-xl font-bold text-black mb-2">Disponibilidade</Text>
        <Text className="text-neutral-500 mb-6">Defina os horários de funcionamento</Text>

        <View className="gap-3">
          {days.map(({ key, label }) => {
            const day = availability[key as keyof typeof availability];
            return (
              <View key={key} className="flex-row items-center p-3 bg-neutral-50 rounded-xl">
                <Pressable
                  onPress={() => setAvailability({
                    ...availability,
                    [key]: { ...day, open: !day.open }
                  })}
                  className="mr-3"
                >
                  <MaterialIcons
                    name={day.open ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={day.open ? '#22C55E' : '#A3A3A3'}
                  />
                </Pressable>
                <Text className={`flex-1 font-medium ${day.open ? 'text-black' : 'text-neutral-400'}`}>
                  {label}
                </Text>
                {day.open && (
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={day.start}
                      onChangeText={(text) => setAvailability({
                        ...availability,
                        [key]: { ...day, start: text }
                      })}
                      className="w-14 px-2 py-1 bg-white rounded-lg text-center text-sm border border-neutral-200"
                      keyboardType="numbers-and-punctuation"
                    />
                    <Text className="text-neutral-500">às</Text>
                    <TextInput
                      value={day.end}
                      onChangeText={(text) => setAvailability({
                        ...availability,
                        [key]: { ...day, end: text }
                      })}
                      className="w-14 px-2 py-1 bg-white rounded-lg text-center text-sm border border-neutral-200"
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderPaymentMethods = () => {
    const methods = [
      { id: 'pix', name: 'PIX', icon: 'qr-code' },
      { id: 'credit_card', name: 'Cartão de Crédito', icon: 'credit-card' },
      { id: 'debit_card', name: 'Cartão de Débito', icon: 'credit-card' },
      { id: 'cash', name: 'Dinheiro', icon: 'payments' },
      { id: 'transfer', name: 'Transferência', icon: 'account-balance' },
    ];

    const togglePaymentMethod = (methodId: string) => {
      setPaymentMethods((prev) =>
        prev.includes(methodId) ? prev.filter((m) => m !== methodId) : [...prev, methodId]
      );
    };

    return (
      <View className="px-5 py-4">
        <Text className="text-xl font-bold text-black mb-2">Formas de Pagamento</Text>
        <Text className="text-neutral-500 mb-6">Selecione as formas aceitas</Text>

        <View className="gap-3">
          {methods.map((method) => {
            const isSelected = paymentMethods.includes(method.id);
            return (
              <Pressable
                key={method.id}
                onPress={() => togglePaymentMethod(method.id)}
                className={`flex-row items-center p-4 rounded-xl border ${isSelected ? 'border-green-500 bg-green-50' : 'border-neutral-200'
                  }`}
              >
                <MaterialIcons
                  name={method.icon as any}
                  size={24}
                  color={isSelected ? '#22C55E' : '#737373'}
                />
                <Text className={`flex-1 ml-3 font-medium ${isSelected ? 'text-green-700' : 'text-neutral-600'}`}>
                  {method.name}
                </Text>
                {isSelected && <MaterialIcons name="check-circle" size={24} color="#22C55E" />}
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <View className="flex-row items-start gap-2">
            <MaterialIcons name="info" size={18} color="#3B82F6" />
            <Text className="text-sm text-blue-700 flex-1">
              O pagamento é feito diretamente entre você e o cliente. O Kourt não processa pagamentos.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRules = () => (
    <ScrollView className="flex-1 px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Regras e Políticas</Text>
      <Text className="text-neutral-500 mb-6">Configure as regras de reserva</Text>

      <View className="gap-5">
        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-3">Política de Cancelamento</Text>
          <View className="gap-2">
            {[
              { id: 'flexible', label: 'Flexível', desc: 'Cancelamento gratuito até 24h antes' },
              { id: 'moderate', label: 'Moderada', desc: 'Cancelamento gratuito até 48h antes' },
              { id: 'strict', label: 'Rígida', desc: 'Cancelamento gratuito até 7 dias antes' },
            ].map((policy) => (
              <Pressable
                key={policy.id}
                onPress={() => setRules({ ...rules, cancellationPolicy: policy.id })}
                className={`p-4 rounded-xl border ${rules.cancellationPolicy === policy.id ? 'border-green-500 bg-green-50' : 'border-neutral-200'
                  }`}
              >
                <Text className={`font-medium ${rules.cancellationPolicy === policy.id ? 'text-green-700' : 'text-neutral-700'}`}>
                  {policy.label}
                </Text>
                <Text className="text-xs text-neutral-500 mt-1">{policy.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Antecedência Mínima</Text>
          <View className="flex-row items-center px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <TextInput
              value={rules.minAdvanceBooking}
              onChangeText={(text) => setRules({ ...rules, minAdvanceBooking: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
              className="w-12 text-center text-base text-black"
            />
            <Text className="text-neutral-500 ml-2">horas antes</Text>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Antecedência Máxima</Text>
          <View className="flex-row items-center px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <TextInput
              value={rules.maxAdvanceBooking}
              onChangeText={(text) => setRules({ ...rules, maxAdvanceBooking: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
              className="w-12 text-center text-base text-black"
            />
            <Text className="text-neutral-500 ml-2">dias de antecedência</Text>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Regras Adicionais (opcional)</Text>
          <TextInput
            value={rules.additionalRules}
            onChangeText={(text) => setRules({ ...rules, additionalRules: text })}
            placeholder="Ex: Proibido uso de chuteiras, uso obrigatório de tênis..."
            placeholderTextColor="#A3A3A3"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black min-h-[100px]"
          />
        </View>
      </View>
    </ScrollView>
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
          <Text className="text-sm font-medium text-neutral-700 mb-3">Quantidade de Quadras</Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <Pressable
                key={num}
                onPress={() => handleNumberOfCourtsChange(num)}
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

        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-neutral-700">Tipo de Piso *</Text>
            <Text className="text-xs text-neutral-500">
              {selectedFloorTypes.length}/{numberOfCourts} {numberOfCourts === 1 ? 'selecionado' : 'selecionados'}
            </Text>
          </View>
          <Text className="text-xs text-neutral-400 mb-3">
            Selecione {numberOfCourts === 1 ? 'o tipo de piso da quadra' : `até ${numberOfCourts} tipos (um para cada quadra)`}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {FLOOR_TYPES.map((floor) => {
              const isSelected = selectedFloorTypes.includes(floor.id);
              const isDisabled = !isSelected && selectedFloorTypes.length >= numberOfCourts;
              return (
                <Pressable
                  key={floor.id}
                  onPress={() => toggleFloorType(floor.id)}
                  disabled={isDisabled}
                  className={`px-4 py-2 rounded-lg border ${isSelected
                    ? 'border-green-500 bg-green-50'
                    : isDisabled
                      ? 'border-neutral-100 bg-neutral-50'
                      : 'border-neutral-200 bg-white'
                    }`}
                >
                  <Text
                    className={`text-sm ${isSelected
                      ? 'text-green-600 font-medium'
                      : isDisabled
                        ? 'text-neutral-300'
                        : 'text-neutral-600'
                      }`}
                  >
                    {floor.name}
                  </Text>
                </Pressable>
              );
            })}
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

        {/* Comodidades */}
        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Comodidades</Text>
          <Text className="text-xs text-neutral-400 mb-3">
            Selecione as comodidades disponíveis no local
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <Pressable
                  key={amenity.id}
                  onPress={() => toggleAmenity(amenity.id)}
                  className={`flex-row items-center px-3 py-2 rounded-lg border ${isSelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-neutral-200 bg-white'
                    }`}
                >
                  <MaterialIcons
                    name={amenity.icon as any}
                    size={16}
                    color={isSelected ? '#22C55E' : '#737373'}
                  />
                  <Text
                    className={`text-sm ml-2 ${isSelected ? 'text-green-600 font-medium' : 'text-neutral-600'
                      }`}
                  >
                    {amenity.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );

  const renderAddress = () => (
    <View className="px-5 py-4">
      <Text className="text-xl font-bold text-black mb-2">Localização</Text>
      <Text className="text-neutral-500 mb-6">Confirme o endereço da quadra</Text>

      {currentLocation && (
        <View className="h-40 rounded-2xl mb-4 overflow-hidden">
          <MapView
            provider={PROVIDER_DEFAULT}
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: currentLocation.lat,
                longitude: currentLocation.lng,
              }}
            >
              <View
                style={{
                  backgroundColor: courtType === 'public' ? '#22C55E' : courtType === 'private' ? '#F59E0B' : '#3B82F6',
                  padding: 8,
                  borderRadius: 999,
                }}
              >
                <MaterialIcons
                  name={courtType === 'public' ? 'location-city' : courtType === 'private' ? 'home' : 'stadium'}
                  size={20}
                  color="#fff"
                />
              </View>
            </Marker>
          </MapView>
        </View>
      )}

      {isAtLocation && (
        <View className="flex-row items-center gap-2 p-3 bg-green-50 rounded-xl mb-4">
          <MaterialIcons name="check-circle" size={20} color="#22C55E" />
          <Text className="text-sm text-green-700 font-medium">Localização verificada - Você está no local!</Text>
        </View>
      )}

      <View className="gap-4">
        {/* CEP com autofill */}
        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">CEP</Text>
          <View className="flex-row items-center">
            <TextInput
              value={formData.cep}
              onChangeText={(text) => {
                const formatted = formatCep(text);
                setFormData({ ...formData, cep: formatted });
                if (formatted.replace(/\D/g, '').length === 8) {
                  fetchAddressByCep(formatted);
                }
              }}
              placeholder="00000-000"
              placeholderTextColor="#A3A3A3"
              keyboardType="numeric"
              maxLength={9}
              autoComplete="postal-code"
              className="flex-1 px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
            />
            {loadingCep && (
              <ActivityIndicator size="small" color="#22C55E" className="ml-3" />
            )}
          </View>
          <Text className="text-xs text-neutral-400 mt-1">
            Digite o CEP para preencher automaticamente
          </Text>
        </View>

        {/* Endereço */}
        <View className="flex-row gap-3">
          <View className="flex-[3]">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Endereço *</Text>
            <TextInput
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Rua, Avenida..."
              placeholderTextColor="#A3A3A3"
              autoComplete="street-address"
              className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Nº</Text>
            <TextInput
              value={formData.number}
              onChangeText={(text) => setFormData({ ...formData, number: text })}
              placeholder="123"
              placeholderTextColor="#A3A3A3"
              keyboardType="numeric"
              className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
            />
          </View>
        </View>

        {/* Bairro */}
        <View>
          <Text className="text-sm font-medium text-neutral-700 mb-2">Bairro</Text>
          <TextInput
            value={formData.neighborhood}
            onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
            placeholder="Vila Mariana"
            placeholderTextColor="#A3A3A3"
            className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
          />
        </View>

        {/* Cidade e Estado */}
        <View className="flex-row gap-3">
          <View className="flex-[2]">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Cidade *</Text>
            <TextInput
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="São Paulo"
              placeholderTextColor="#A3A3A3"
              className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Estado</Text>
            <TextInput
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text.toUpperCase().slice(0, 2) })}
              placeholder="SP"
              placeholderTextColor="#A3A3A3"
              maxLength={2}
              autoCapitalize="characters"
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

  const renderPhotos = () => {
    // Helper to get validation result for a photo type
    const getPhotoValidation = (photoType: string) => {
      return photoValidation.results.find(
        (v) => v.type === photoType || (photoType === 'net' && v.type === 'equipment')
      );
    };

    return (
      <View className="px-5 py-4">
        <Text className="text-xl font-bold text-black mb-2">Fotos Obrigatórias</Text>
        <Text className="text-neutral-500 mb-4">Tire as 3 fotos necessárias</Text>

        {/* AI Verification Info */}
        <View className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="auto-awesome" size={18} color="#3B82F6" />
            <Text className="text-sm text-blue-700 flex-1">
              Suas fotos serão verificadas por IA para garantir que mostram as informações necessárias.
            </Text>
          </View>
        </View>

        <View className="gap-4">
          {REQUIRED_PHOTOS.map((photo, idx) => {
            const existingPhoto = photos.find((p) => p.type === photo.type);
            const validation = getPhotoValidation(photo.type);
            const hasValidationIssue = validation && !validation.hasRequiredContent;

            return (
              <Pressable
                key={photo.type}
                onPress={() => handleTakeRequiredPhoto(photo.type)}
                className={`p-4 rounded-2xl border-2 ${
                  hasValidationIssue
                    ? 'border-red-500 bg-red-50'
                    : existingPhoto
                      ? 'border-green-500 bg-green-50'
                      : 'border-neutral-200 bg-white'
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
                      {existingPhoto && !hasValidationIssue && (
                        <MaterialIcons name="check-circle" size={18} color="#22C55E" />
                      )}
                      {hasValidationIssue && (
                        <MaterialIcons name="error" size={18} color="#EF4444" />
                      )}
                    </View>
                    <Text className="text-sm text-neutral-500 mt-1">{photo.description}</Text>

                    {/* Validation feedback */}
                    {validation && validation.hasRequiredContent && validation.detectedElements.length > 0 && (
                      <View className="mt-2 flex-row flex-wrap gap-1">
                        {validation.detectedElements.slice(0, 3).map((element, i) => (
                          <View key={i} className="px-2 py-0.5 bg-green-100 rounded-full">
                            <Text className="text-xs text-green-700">{element}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {hasValidationIssue && validation?.issues && validation.issues.length > 0 && (
                      <View className="mt-2 p-2 bg-red-100 rounded-lg">
                        <Text className="text-xs text-red-700">{validation.issues[0]}</Text>
                      </View>
                    )}
                  </View>
                  <MaterialIcons
                    name={existingPhoto ? 'refresh' : 'chevron-right'}
                    size={24}
                    color={hasValidationIssue ? '#EF4444' : existingPhoto ? '#22C55E' : '#A3A3A3'}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Validation loading */}
        {photoValidation.validating && (
          <View className="mt-4 flex-row items-center justify-center gap-2 p-3 bg-blue-50 rounded-xl">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-sm text-blue-700">Verificando fotos com IA...</Text>
          </View>
        )}

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
  };

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
            setFormData({ name: '', cep: '', address: '', number: '', neighborhood: '', city: '', state: '', reference: '', description: '' });
            setSelectedSports([]);
            setSelectedFloorTypes([]);
            setSelectedAmenities([]);
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

  // ============ DEVICE NOT SUPPORTED ============
  const renderDeviceNotSupported = () => (
    <View className="flex-1 px-5 py-8 items-center justify-center">
      <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
        <MaterialIcons name="phone-iphone" size={48} color="#EF4444" />
      </View>

      <Text className="text-2xl font-bold text-black text-center mb-2">
        Dispositivo Incompatível
      </Text>
      <Text className="text-neutral-500 text-center mb-8 px-4">
        {deviceCheck.reason || 'Para garantir a qualidade das fotos, o registro de quadras requer iPhone 11 ou superior.'}
      </Text>

      <View className="w-full gap-4 mb-8">
        <View className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <View className="flex-row items-start gap-3">
            <MaterialIcons name="camera-alt" size={24} color="#F59E0B" />
            <View className="flex-1">
              <Text className="font-bold text-amber-800">Por que essa restrição?</Text>
              <Text className="text-sm text-amber-700 mt-1">
                iPhones mais recentes têm câmeras de alta qualidade essenciais para verificação precisa das quadras por IA.
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <View className="flex-row items-start gap-3">
            <MaterialIcons name="devices-other" size={24} color="#3B82F6" />
            <View className="flex-1">
              <Text className="font-bold text-blue-800">Seu dispositivo</Text>
              <Text className="text-sm text-blue-700 mt-1">
                {deviceCheck.deviceName || 'Desconhecido'} {deviceCheck.modelId ? `(${deviceCheck.modelId})` : ''}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="w-full gap-3">
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          className="py-4 bg-neutral-900 rounded-2xl items-center"
        >
          <Text className="text-white font-semibold">Voltar para Home</Text>
        </Pressable>

        <Text className="text-center text-xs text-neutral-400 mt-2">
          Modelos compatíveis: iPhone 11, 12, 13, 14, 15, 16 e superiores
        </Text>
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
      case 'upload_id': return renderUploadId();
      case 'upload_documents': return renderUploadDocuments();
      case 'pricing': return renderPricing();
      case 'availability': return renderAvailability();
      case 'payment_methods': return renderPaymentMethods();
      case 'rules': return renderRules();
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

  // Check device compatibility first (only for iOS)
  if (!deviceCheck.isSupported && deviceCheck.isIOS) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {renderDeviceNotSupported()}
      </SafeAreaView>
    );
  }

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
                Etapa {step} de {visibleSteps}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Progress Bar */}
      {courtType && step > 0 && currentStep !== 'type' && currentStep !== 'success' && (
        <View className="flex-row px-4 py-3 gap-1">
          {Array.from({ length: visibleSteps }).map((_, idx) => (
            <View
              key={idx}
              className={`flex-1 h-1 rounded-full ${idx < step ? 'bg-green-500' : 'bg-neutral-200'
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
