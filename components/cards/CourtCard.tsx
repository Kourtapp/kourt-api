import { View, Text, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

type CourtType = 'publica' | 'privada' | 'particular';

interface CourtCardProps {
  id: string;
  name: string;
  sport: string;
  location?: string;
  address?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  pricePerHour?: number;
  isFree?: boolean;
  courtType?: CourtType;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

const COURT_TYPE_CONFIG: Record<CourtType, { label: string; bgColor: string; textColor: string }> = {
  publica: { label: 'Pública', bgColor: '#22C55E', textColor: '#fff' },
  privada: { label: 'Privada', bgColor: '#3B82F6', textColor: '#fff' },
  particular: { label: 'Particular', bgColor: '#FACC15', textColor: '#000' },
};

export function CourtCard({
  id,
  name,
  sport,
  location,
  address,
  imageUrl,
  rating,
  reviewCount,
  pricePerHour,
  isFree,
  courtType = 'publica',
  onPress,
  size = 'medium',
}: CourtCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const cardWidth = size === 'small' ? 'w-44' : size === 'large' ? 'w-72' : 'w-64';
  const imageHeight = size === 'small' ? 'h-32' : size === 'large' ? 'h-44' : 'h-40';

  const typeConfig = COURT_TYPE_CONFIG[courtType];

  return (
    <Pressable
      onPress={onPress}
      className={`${cardWidth} rounded-2xl overflow-hidden bg-white`}
    >
      {/* Image Container */}
      <View className={`${imageHeight} relative`}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-neutral-200 items-center justify-center">
            <MaterialIcons name="sports-tennis" size={40} color="#A3A3A3" />
          </View>
        )}

        {/* Gradient overlay for better text visibility */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'transparent']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Top badges */}
        <View className="absolute top-3 left-3 right-3 flex-row justify-between items-start">
          {/* Court type badge - top left */}
          <View
            className="px-2.5 py-1.5 rounded-full"
            style={{ backgroundColor: typeConfig.bgColor }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: typeConfig.textColor }}
            >
              {typeConfig.label}
            </Text>
          </View>

          {/* Favorite heart */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="w-8 h-8 items-center justify-center"
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? '#EF4444' : '#fff'}
              style={{
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            />
          </Pressable>
        </View>

        {/* Sport badge bottom right */}
        <View className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-black/70 rounded-full">
          <Text className="text-xs font-medium text-white">{sport}</Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Name and rating row */}
        <View className="flex-row items-start justify-between mb-1">
          <Text className="font-semibold text-black flex-1 mr-2" numberOfLines={1}>
            {name}
          </Text>
          {rating && (
            <View className="flex-row items-center">
              <MaterialIcons name="star" size={14} color="#000" />
              <Text className="text-sm font-semibold text-black ml-0.5">{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Location */}
        <Text className="text-sm text-neutral-500" numberOfLines={1}>
          {location || address || 'Local não informado'}
        </Text>

        {/* Price and reviews */}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-sm">
            <Text className="font-bold text-black">
              {isFree ? 'Gratuita' : `R$ ${pricePerHour}`}
            </Text>
            {!isFree && <Text className="text-neutral-500">/hora</Text>}
          </Text>
          {reviewCount && reviewCount > 0 && (
            <Text className="text-xs text-neutral-400">{reviewCount} avaliações</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
