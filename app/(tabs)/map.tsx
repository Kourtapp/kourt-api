import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  PanResponder,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT, Region, Callout } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocation, useCourts } from '@/hooks';
import { Court } from '@/types/database.types';
import { MapFiltersModal, MapFilters } from '@/components/map/MapFiltersModal';

const { width, height } = Dimensions.get('window');
const BOTTOM_SHEET_MAX = height * 0.6;
const BOTTOM_SHEET_MID = height * 0.35;
const BOTTOM_SHEET_MIN = 100;

// Sport filters - ordenado por popularidade no Brasil
const SPORT_FILTERS = [
  { id: 'all', label: 'Todos', icon: 'apps' },
  { id: 'Futebol', label: 'Futebol', icon: 'sports-soccer' },
  { id: 'Vôlei', label: 'Vôlei', icon: 'sports-volleyball' },
  { id: 'Beach Tennis', label: 'Beach', icon: 'sports-tennis' },
  { id: 'Futevôlei', label: 'Futevôlei', icon: 'sports-volleyball' },
  { id: 'Tênis', label: 'Tênis', icon: 'sports-tennis' },
  { id: 'Padel', label: 'Padel', icon: 'sports-tennis' },
  { id: 'Basquete', label: 'Basquete', icon: 'sports-basketball' },
];

// Price filters
const PRICE_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'free', label: 'Grátis' },
  { id: 'paid', label: 'Pago' },
];

// Court type filters with colors
const COURT_TYPE_FILTERS = [
  { id: 'all', label: 'Todos', icon: 'apps', color: '#222222', bgColor: '#F5F5F5' },
  { id: 'public', label: 'Públicas', icon: 'park', color: '#22C55E', bgColor: '#DCFCE7' },
  { id: 'private', label: 'Privadas', icon: 'grid-view', color: '#3B82F6', bgColor: '#DBEAFE' },
  { id: 'arena', label: 'Particulares', icon: 'home', color: '#F59E0B', bgColor: '#FEF3C7' },
];

// Custom marker component - minimalist
const CourtMarker = ({
  court,
  isSelected,
  onPress
}: {
  court: Court;
  isSelected: boolean;
  onPress: () => void;
}) => {
  return (
    <Marker
      coordinate={{
        latitude: court.latitude!,
        longitude: court.longitude!,
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View className="items-center">
        {/* Pin - minimalist black/white */}
        <View
          className="px-3 py-2 rounded-full shadow-lg"
          style={{
            backgroundColor: isSelected ? '#000' : '#fff',
            borderWidth: 1,
            borderColor: isSelected ? '#000' : '#E5E5E5',
            transform: [{ scale: isSelected ? 1.1 : 1 }],
          }}
        >
          <Text
            className="text-xs font-bold"
            style={{ color: isSelected ? '#fff' : '#000' }}
          >
            {court.is_free ? 'Grátis' : `R$${court.price_per_hour}`}
          </Text>
        </View>
        {/* Small dot pointer */}
        <View
          className="w-2 h-2 rounded-full -mt-1"
          style={{ backgroundColor: isSelected ? '#000' : '#fff', borderWidth: 1, borderColor: '#E5E5E5' }}
        />
      </View>
    </Marker>
  );
};

// Court card component
const CourtCard = ({
  court,
  onPress,
  compact = false
}: {
  court: Court;
  onPress: () => void;
  compact?: boolean;
}) => {
  const getSportIcon = (sport: string) => {
    if (sport.includes('Tennis') || sport.includes('Padel') || sport.includes('Tênis')) {
      return 'sports-tennis';
    }
    if (sport.includes('Vôlei') || sport.includes('Futevôlei')) {
      return 'sports-volleyball';
    }
    if (sport.includes('Futebol')) {
      return 'sports-soccer';
    }
    return 'sports';
  };

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center p-3 bg-white rounded-2xl border border-neutral-100 shadow-sm"
      >
        {/* Image */}
        <View className="w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden">
          {court.images && court.images.length > 0 ? (
            <Image source={{ uri: court.images[0] }} className="w-full h-full" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <MaterialIcons name={getSportIcon(court.sport)} size={24} color="#A3A3A3" />
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 ml-3">
          <Text className="font-bold text-black text-base" numberOfLines={1}>
            {court.name}
          </Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <MaterialIcons name="location-on" size={12} color="#737373" />
            <Text className="text-xs text-neutral-500" numberOfLines={1}>
              {court.neighborhood || court.city}
            </Text>
          </View>
          <View className="flex-row items-center gap-3 mt-1">
            <Text className="text-sm font-bold text-black">
              {court.is_free ? 'Grátis' : `R$${court.price_per_hour}/h`}
            </Text>
            <View className="flex-row items-center gap-0.5">
              <MaterialIcons name="star" size={12} color="#000" />
              <Text className="text-xs text-neutral-600">
                {court.rating?.toFixed(1) || '—'}
              </Text>
            </View>
          </View>
        </View>

        <MaterialIcons name="chevron-right" size={24} color="#D4D4D4" />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-neutral-100"
      style={{ width: width - 40 }}
    >
      {/* Image */}
      <View className="h-36 bg-neutral-100">
        {court.images && court.images.length > 0 ? (
          <Image source={{ uri: court.images[0] }} className="w-full h-full" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name={getSportIcon(court.sport)} size={48} color="#D4D4D4" />
          </View>
        )}

        {/* Badges */}
        <View className="absolute top-3 left-3 right-3 flex-row justify-between">
          <View className="px-2.5 py-1 bg-white rounded-full">
            <Text className="text-black text-xs font-medium">
              {court.sport}
            </Text>
          </View>
          {court.verified && (
            <View className="px-2.5 py-1 bg-white rounded-full flex-row items-center gap-1">
              <MaterialIcons name="verified" size={12} color="#000" />
              <Text className="text-black text-xs font-medium">Verificada</Text>
            </View>
          )}
        </View>

        {/* Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
          }}
        />
      </View>

      {/* Content */}
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-bold text-black text-lg" numberOfLines={1}>
              {court.name}
            </Text>
            <View className="flex-row items-center gap-1 mt-1">
              <MaterialIcons name="location-on" size={14} color="#737373" />
              <Text className="text-sm text-neutral-500" numberOfLines={1}>
                {court.address}
              </Text>
            </View>
          </View>

          <View className="items-end ml-3">
            <Text className="text-lg font-bold text-black">
              {court.is_free ? 'Grátis' : `R$${court.price_per_hour}`}
            </Text>
            <Text className="text-xs text-neutral-400">/hora</Text>
          </View>
        </View>

        {/* Features */}
        <View className="flex-row items-center gap-4 mt-3">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="star" size={16} color="#000" />
            <Text className="text-sm font-medium text-black">
              {court.rating?.toFixed(1) || '0.0'}
            </Text>
            <Text className="text-xs text-neutral-400">
              ({court.review_count || 0})
            </Text>
          </View>

          {court.has_lighting && (
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="lightbulb" size={16} color="#737373" />
              <Text className="text-xs text-neutral-500">Iluminação</Text>
            </View>
          )}

          {court.is_covered && (
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="roofing" size={16} color="#737373" />
              <Text className="text-xs text-neutral-500">Coberta</Text>
            </View>
          )}
        </View>

        {/* CTA */}
        <Pressable
          onPress={onPress}
          className="mt-4 py-3 bg-black rounded-xl items-center"
        >
          <Text className="text-white font-semibold">Ver Detalhes</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const {
    location,
    error: locationError,
  } = useLocation();
  const { courts, loading: courtsLoading } = useCourts();

  // States
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<MapFilters>({
    priceMin: 0,
    priceMax: 200,
    includeFree: true,
    sports: [],
    courtTypes: [],
  });

  // Bottom sheet animation
  const sheetAnim = useRef(new Animated.Value(BOTTOM_SHEET_MID)).current;
  const [sheetPosition, setSheetPosition] = useState(BOTTOM_SHEET_MID);

  // Selected court card animation
  const cardAnim = useRef(new Animated.Value(200)).current;

  // Pan responder for bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPosition = sheetPosition - gestureState.dy;
        if (newPosition >= BOTTOM_SHEET_MIN && newPosition <= BOTTOM_SHEET_MAX) {
          sheetAnim.setValue(newPosition);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        let targetPosition = sheetPosition;

        if (gestureState.dy > 50) {
          // Swiped down
          if (sheetPosition > BOTTOM_SHEET_MID) {
            targetPosition = BOTTOM_SHEET_MID;
          } else {
            targetPosition = BOTTOM_SHEET_MIN;
          }
        } else if (gestureState.dy < -50) {
          // Swiped up
          if (sheetPosition < BOTTOM_SHEET_MID) {
            targetPosition = BOTTOM_SHEET_MID;
          } else {
            targetPosition = BOTTOM_SHEET_MAX;
          }
        }

        Animated.spring(sheetAnim, {
          toValue: targetPosition,
          useNativeDriver: false,
          tension: 50,
          friction: 10,
        }).start();

        setSheetPosition(targetPosition);
      },
    })
  ).current;

  // Filtered courts
  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      // Sport filter (quick filter)
      const sportMatch = selectedSport === 'all' || court.sport === selectedSport;

      // Price filter (quick filter)
      const priceMatch =
        selectedPrice === 'all' ||
        (selectedPrice === 'free' && court.is_free) ||
        (selectedPrice === 'paid' && !court.is_free);

      // Advanced filters
      const priceInRange = court.is_free
        ? advancedFilters.includeFree
        : (court.price_per_hour || 0) >= advancedFilters.priceMin &&
          (court.price_per_hour || 0) <= advancedFilters.priceMax;

      const advancedSportMatch =
        advancedFilters.sports.length === 0 ||
        advancedFilters.sports.some((s) => court.sport?.includes(s));

      return sportMatch && priceMatch && priceInRange && advancedSportMatch;
    });
  }, [courts, selectedSport, selectedPrice, advancedFilters]);

  // Courts with valid coordinates
  const courtsWithLocation = useMemo(() => {
    return filteredCourts.filter(c => c.latitude && c.longitude);
  }, [filteredCourts]);

  // Handle marker press
  const handleMarkerPress = useCallback((court: Court) => {
    setSelectedCourt(court);

    // Collapse bottom sheet
    Animated.timing(sheetAnim, {
      toValue: BOTTOM_SHEET_MIN,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setSheetPosition(BOTTOM_SHEET_MIN);

    // Show court card
    Animated.spring(cardAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Center map on court
    if (mapRef.current && court.latitude && court.longitude) {
      mapRef.current.animateToRegion({
        latitude: court.latitude,
        longitude: court.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 300);
    }
  }, [sheetAnim, cardAnim]);

  // Handle map press
  const handleMapPress = useCallback(() => {
    if (selectedCourt) {
      Animated.timing(cardAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setSelectedCourt(null));
    }
  }, [selectedCourt, cardAnim]);

  // Handle my location
  const handleMyLocation = useCallback(() => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(location, 500);
    }
  }, [location]);

  // Handle court press from list
  const handleCourtPress = useCallback((court: Court) => {
    if (viewMode === 'map') {
      handleMarkerPress(court);
    } else {
      router.push(`/court/${court.id}` as any);
    }
  }, [viewMode, handleMarkerPress]);

  return (
    <View className="flex-1 bg-neutral-100">
      {/* Map */}
      {location && viewMode === 'map' && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={{ flex: 1 }}
          initialRegion={location}
          showsUserLocation
          showsMyLocationButton={false}
          onPress={handleMapPress}
          mapPadding={{ top: 160, right: 0, bottom: 120, left: 0 }}
        >
          {courtsWithLocation.map((court) => (
            <CourtMarker
              key={court.id}
              court={court}
              isSelected={selectedCourt?.id === court.id}
              onPress={() => handleMarkerPress(court)}
            />
          ))}
        </MapView>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingTop: 170, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 gap-3">
            {filteredCourts.length === 0 ? (
              <View className="py-20 items-center">
                <MaterialIcons name="search-off" size={48} color="#D4D4D4" />
                <Text className="text-neutral-500 mt-4 text-center">
                  Nenhuma quadra encontrada{'\n'}com os filtros selecionados
                </Text>
              </View>
            ) : (
              filteredCourts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  compact
                  onPress={() => router.push(`/court/${court.id}` as any)}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Header Overlay */}
      <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
        <View className="px-5 pt-2 pb-3">
          {/* Search Bar */}
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.push('/court/search' as any)}
              className="flex-1 flex-row items-center bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-neutral-100"
            >
              <MaterialIcons name="search" size={22} color="#737373" />
              <Text className="ml-3 text-neutral-400 flex-1 text-base">
                Buscar quadras...
              </Text>
            </Pressable>

            {/* View Toggle */}
            <Pressable
              onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-neutral-100"
            >
              <MaterialIcons
                name={viewMode === 'map' ? 'view-list' : 'map'}
                size={22}
                color="#000"
              />
            </Pressable>

            {/* Filter Button */}
            <Pressable
              onPress={() => setShowFiltersModal(true)}
              className={`w-12 h-12 rounded-2xl items-center justify-center shadow-sm border ${
                advancedFilters.sports.length > 0 || advancedFilters.priceMin > 0 || advancedFilters.priceMax < 200
                  ? 'bg-black border-black'
                  : 'bg-white border-neutral-100'
              }`}
            >
              <MaterialIcons
                name="tune"
                size={22}
                color={advancedFilters.sports.length > 0 || advancedFilters.priceMin > 0 || advancedFilters.priceMax < 200 ? '#fff' : '#000'}
              />
            </Pressable>
          </View>

          {/* Combined Filters - Single Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3 -mx-5 px-5"
          >
            <View className="flex-row gap-2 items-center">
              {/* Court Type Filters */}
              {COURT_TYPE_FILTERS.map((filter) => {
                const isSelected = selectedType === filter.id;
                return (
                  <Pressable
                    key={`type-${filter.id}`}
                    onPress={() => setSelectedType(filter.id)}
                    className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-full border"
                    style={{
                      backgroundColor: isSelected ? filter.color : '#FFFFFF',
                      borderColor: isSelected ? filter.color : '#E5E5E5',
                    }}
                  >
                    <MaterialIcons
                      name={filter.icon as any}
                      size={16}
                      color={isSelected ? '#FFFFFF' : filter.color}
                    />
                    <Text
                      className="text-sm font-medium"
                      style={{ color: isSelected ? '#FFFFFF' : '#525252' }}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}

              {/* Divider */}
              <View className="w-px h-8 bg-neutral-200 mx-1" />

              {/* Sport Filters */}
              {SPORT_FILTERS.filter(s => s.id !== 'all').map((filter) => {
                const isSelected = selectedSport === filter.id;
                return (
                  <Pressable
                    key={`sport-${filter.id}`}
                    onPress={() => setSelectedSport(isSelected ? 'all' : filter.id)}
                    className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-full ${
                      isSelected
                        ? 'bg-black'
                        : 'bg-white border border-neutral-200'
                    }`}
                  >
                    <MaterialIcons
                      name={filter.icon as any}
                      size={16}
                      color={isSelected ? '#fff' : '#525252'}
                    />
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? 'text-white' : 'text-neutral-700'
                      }`}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Price Filters - show when expanded */}
          {showFilters && (
            <View className="flex-row gap-2 mt-3">
              {PRICE_FILTERS.map((filter) => (
                <Pressable
                  key={filter.id}
                  onPress={() => setSelectedPrice(filter.id)}
                  className={`px-4 py-2 rounded-full ${
                    selectedPrice === filter.id
                      ? 'bg-black'
                      : 'bg-white border border-neutral-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedPrice === filter.id ? 'text-white' : 'text-neutral-700'
                    }`}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Results Count */}
          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-sm text-neutral-500">
              {filteredCourts.length} quadra{filteredCourts.length !== 1 ? 's' : ''} encontrada{filteredCourts.length !== 1 ? 's' : ''}
            </Text>
            {(selectedSport !== 'all' || selectedPrice !== 'all' || selectedType !== 'all') && (
              <Pressable
                onPress={() => {
                  setSelectedSport('all');
                  setSelectedPrice('all');
                  setSelectedType('all');
                }}
                className="flex-row items-center gap-1"
              >
                <MaterialIcons name="close" size={14} color="#EF4444" />
                <Text className="text-sm text-red-500">Limpar filtros</Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Map Controls */}
      {viewMode === 'map' && (
        <View className="absolute right-5 top-1/2 -translate-y-20 gap-3">
          {/* My Location */}
          <Pressable
            onPress={handleMyLocation}
            className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-md border border-neutral-100"
          >
            <MaterialIcons name="my-location" size={20} color="#000" />
          </Pressable>

          {/* Add Court */}
          <Pressable
            onPress={() => router.push('/court/add' as any)}
            className="w-11 h-11 bg-black rounded-full items-center justify-center shadow-md"
          >
            <MaterialIcons name="add" size={22} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Bottom Sheet - Map View */}
      {viewMode === 'map' && !selectedCourt && (
        <Animated.View
          style={{ height: sheetAnim }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
        >
          {/* Handle */}
          <View {...panResponder.panHandlers} className="items-center py-3">
            <View className="w-10 h-1.5 bg-neutral-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pb-3">
            <Text className="text-lg font-bold text-black">Quadras próximas</Text>
            <Text className="text-sm text-neutral-500">
              {courtsWithLocation.length} no mapa
            </Text>
          </View>

          {/* Court List */}
          <ScrollView
            className="px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            {courtsWithLocation.length === 0 ? (
              <View className="py-10 items-center">
                <MaterialIcons name="location-off" size={40} color="#D4D4D4" />
                <Text className="text-neutral-500 mt-3 text-center">
                  Nenhuma quadra encontrada{'\n'}nesta região
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {courtsWithLocation.map((court) => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    compact
                    onPress={() => handleCourtPress(court)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Selected Court Card */}
      {selectedCourt && viewMode === 'map' && (
        <Animated.View
          style={{
            transform: [{ translateY: cardAnim }],
            position: 'absolute',
            bottom: insets.bottom + 20,
            left: 20,
            right: 20,
          }}
        >
          <CourtCard
            court={selectedCourt}
            onPress={() => router.push(`/court/${selectedCourt.id}` as any)}
          />
        </Animated.View>
      )}

      {/* Loading Overlay */}
      {courtsLoading && (
        <View className="absolute top-1/2 left-0 right-0 items-center">
          <View className="bg-white px-5 py-3 rounded-2xl shadow-lg flex-row items-center gap-3">
            <ActivityIndicator size="small" color="#000" />
            <Text className="text-sm text-neutral-600 font-medium">
              Carregando quadras...
            </Text>
          </View>
        </View>
      )}

      {/* Location Error */}
      {locationError && (
        <View className="absolute top-44 left-5 right-5">
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-start gap-3">
            <MaterialIcons name="error" size={24} color="#EF4444" />
            <View className="flex-1">
              <Text className="font-semibold text-red-700">Erro de localização</Text>
              <Text className="text-red-600 text-sm mt-1">{locationError}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Filters Modal */}
      <MapFiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={advancedFilters}
        onApply={setAdvancedFilters}
      />
    </View>
  );
}
