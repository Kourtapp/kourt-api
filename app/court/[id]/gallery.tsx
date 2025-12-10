import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCourtDetail } from '@/hooks';

const { width, height } = Dimensions.get('window');

interface Photo {
  id: string;
  url: string | null;
  category: 'quadra' | 'estrutura' | 'ambiente';
  title: string;
  source: string;
  date: string;
}

const PHOTOS: Photo[] = [
  { id: '1', url: null, category: 'quadra', title: 'Quadra principal', source: 'Enviada pela arena', date: 'Nov 2024' },
  { id: '2', url: null, category: 'quadra', title: 'Vista lateral', source: 'Enviada pela arena', date: 'Nov 2024' },
  { id: '3', url: null, category: 'quadra', title: 'Rede e linhas', source: 'Usuário', date: 'Out 2024' },
  { id: '4', url: null, category: 'quadra', title: 'Areia', source: 'Usuário', date: 'Out 2024' },
  { id: '5', url: null, category: 'estrutura', title: 'Vestiário', source: 'Enviada pela arena', date: 'Nov 2024' },
  { id: '6', url: null, category: 'estrutura', title: 'Recepção', source: 'Enviada pela arena', date: 'Nov 2024' },
  { id: '7', url: null, category: 'ambiente', title: 'Área de descanso', source: 'Usuário', date: 'Set 2024' },
  { id: '8', url: null, category: 'ambiente', title: 'Estacionamento', source: 'Usuário', date: 'Set 2024' },
];

const FILTERS = [
  { id: 'all', label: 'Todas', count: 8 },
  { id: 'quadra', label: 'Quadra', count: 4 },
  { id: 'estrutura', label: 'Estrutura', count: 2 },
  { id: 'ambiente', label: 'Ambiente', count: 2 },
];

export default function GalleryScreen() {
  const { id, index } = useLocalSearchParams<{ id: string; index?: string }>();
  const { court } = useCourtDetail(id);

  const [currentIndex, setCurrentIndex] = useState(parseInt(index || '0'));
  const [selectedFilter, setSelectedFilter] = useState('all');
  const flatListRef = useRef<FlatList>(null);

  const filteredPhotos =
    selectedFilter === 'all'
      ? PHOTOS
      : PHOTOS.filter((p) => p.category === selectedFilter);

  const currentPhoto = filteredPhotos[currentIndex] || filteredPhotos[0];

  const scrollToIndex = (idx: number) => {
    if (idx >= 0 && idx < filteredPhotos.length) {
      flatListRef.current?.scrollToIndex({ index: idx, animated: true });
      setCurrentIndex(idx);
    }
  };

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setCurrentIndex(0);
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="absolute top-12 left-0 right-0 z-10 px-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-white font-bold text-lg">Fotos</Text>
            <Text className="text-neutral-400 text-sm">
              {court?.name || 'Arena BeachClub Ibirapuera'}
            </Text>
          </View>

          <Text className="text-white font-medium">
            {currentIndex + 1} / {filteredPhotos.length}
          </Text>
        </View>
      </View>

      {/* Main Image Gallery */}
      <View className="flex-1 justify-center">
        <FlatList
          ref={flatListRef}
          data={filteredPhotos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.min(currentIndex, filteredPhotos.length - 1)}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(idx);
          }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{ width, height: height * 0.5 }}
              className="items-center justify-center px-4"
            >
              <View className="w-full h-full bg-neutral-800 rounded-2xl items-center justify-center">
                {item.url ? (
                  <Image
                    source={{ uri: item.url }}
                    className="w-full h-full rounded-2xl"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <View className="w-24 h-24 bg-neutral-700 rounded-xl items-center justify-center mb-4">
                      <MaterialIcons name="image" size={48} color="#525252" />
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        />

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <TouchableOpacity
            onPress={() => scrollToIndex(currentIndex - 1)}
            className="absolute left-4 top-1/2 -mt-6 w-12 h-12 bg-neutral-800 rounded-full items-center justify-center"
          >
            <MaterialIcons name="chevron-left" size={32} color="#fff" />
          </TouchableOpacity>
        )}
        {currentIndex < filteredPhotos.length - 1 && (
          <TouchableOpacity
            onPress={() => scrollToIndex(currentIndex + 1)}
            className="absolute right-4 top-1/2 -mt-6 w-12 h-12 bg-neutral-800 rounded-full items-center justify-center"
          >
            <MaterialIcons name="chevron-right" size={32} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Section */}
      <View className="px-5 pb-10">
        {/* Photo Info */}
        <View className="mb-4">
          <Text className="text-white font-bold text-lg">{currentPhoto?.title}</Text>
          <Text className="text-neutral-400">
            {currentPhoto?.source} · {currentPhoto?.date}
          </Text>
        </View>

        {/* Thumbnail Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {filteredPhotos.map((photo, idx) => (
            <TouchableOpacity
              key={photo.id}
              onPress={() => scrollToIndex(idx)}
              className={`w-16 h-16 rounded-xl overflow-hidden ${
                idx === currentIndex ? 'border-2 border-white' : 'opacity-50'
              }`}
            >
              {photo.url ? (
                <Image
                  source={{ uri: photo.url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-neutral-700 items-center justify-center">
                  <MaterialIcons name="image" size={24} color="#525252" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => handleFilterChange(filter.id)}
              className={`px-4 py-2 rounded-full ${
                selectedFilter === filter.id ? 'bg-white' : 'bg-neutral-800'
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedFilter === filter.id ? 'text-black' : 'text-white'
                }`}
              >
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
