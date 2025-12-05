import { Image, ImageProps, ImageContentFit } from 'expo-image';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useMemo } from 'react';

// Blurhash placeholders pré-definidos para diferentes contextos
const BLURHASH_PLACEHOLDERS = {
  court: 'L6PZfSi_.AyE_3t7t7R**0teleW',      // Verde/quadra
  avatar: 'L5H2EC=PM+yV0g-mq.wG9c010J}@',    // Neutro/rosto
  sport: 'L8SP6F~qfQof00ofj[fQx^j[M{a{',     // Vibrante
  default: 'L6PZfSi_.AyE_3t7t7R**0teleW',    // Default verde
};

// Tamanhos de imagem padronizados (para Supabase Transform)
const IMAGE_SIZES = {
  thumb: { width: 100, height: 100 },
  small: { width: 200, height: 200 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 },
  full: { width: 1200, height: 1200 },
} as const;

type ImageSize = keyof typeof IMAGE_SIZES;
type PlaceholderType = keyof typeof BLURHASH_PLACEHOLDERS;

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null;
  size?: ImageSize;
  placeholder?: PlaceholderType;
  blurhash?: string;
  aspectRatio?: number;
  className?: string;
  containerStyle?: ViewStyle;
  fallback?: React.ReactNode;
}

// Gera URL otimizada com Supabase Transform
function getOptimizedUrl(uri: string, size: ImageSize): string {
  if (!uri) return '';

  // Se já for uma URL do Supabase Storage, adiciona transforms
  if (uri.includes('supabase') && uri.includes('/storage/')) {
    const { width, height } = IMAGE_SIZES[size];
    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}width=${width}&height=${height}&resize=cover&quality=80`;
  }

  // Para outras URLs (Google, etc), retorna sem modificação
  return uri;
}

export function OptimizedImage({
  uri,
  size = 'medium',
  placeholder = 'default',
  blurhash,
  aspectRatio,
  className,
  containerStyle,
  fallback,
  contentFit = 'cover',
  transition = 300,
  ...props
}: OptimizedImageProps) {
  // Memoiza a URL otimizada
  const optimizedUri = useMemo(() => {
    if (!uri) return null;
    return getOptimizedUrl(uri, size);
  }, [uri, size]);

  // Se não houver URI, mostra fallback ou placeholder
  if (!optimizedUri) {
    if (fallback) return <>{fallback}</>;
    return (
      <View
        style={[
          styles.placeholder,
          containerStyle,
          aspectRatio ? { aspectRatio } : undefined,
        ]}
        className={className}
      />
    );
  }

  // Determina o blurhash a usar
  const placeholderHash = blurhash || BLURHASH_PLACEHOLDERS[placeholder];

  return (
    <View style={[containerStyle, aspectRatio ? { aspectRatio } : undefined]}>
      <Image
        source={{ uri: optimizedUri }}
        placeholder={{ blurhash: placeholderHash }}
        contentFit={contentFit as ImageContentFit}
        transition={transition}
        cachePolicy="memory-disk"
        recyclingKey={optimizedUri}
        className={className}
        style={[
          styles.image,
          aspectRatio ? { aspectRatio } : undefined,
        ]}
        {...props}
      />
    </View>
  );
}

// Componente especializado para avatares
interface AvatarImageProps extends Omit<OptimizedImageProps, 'placeholder' | 'size'> {
  initials?: string;
  sizeClass?: 'sm' | 'md' | 'lg' | 'xl';
}

const AVATAR_SIZES = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

const AVATAR_IMAGE_SIZES: Record<string, ImageSize> = {
  sm: 'thumb',
  md: 'thumb',
  lg: 'small',
  xl: 'small',
};

export function AvatarImage({
  uri,
  initials,
  sizeClass = 'md',
  className,
  ...props
}: AvatarImageProps) {
  const sizeClassName = AVATAR_SIZES[sizeClass];
  const imageSize = AVATAR_IMAGE_SIZES[sizeClass];

  if (!uri) {
    return (
      <View
        className={`${sizeClassName} rounded-full bg-neutral-200 items-center justify-center ${className || ''}`}
      >
        {initials && (
          <View className="items-center justify-center">
            <View>
              {/* Text styled via NativeWind in parent */}
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <OptimizedImage
      uri={uri}
      size={imageSize}
      placeholder="avatar"
      className={`${sizeClassName} rounded-full ${className || ''}`}
      {...props}
    />
  );
}

// Componente especializado para quadras
interface CourtImageProps extends Omit<OptimizedImageProps, 'placeholder'> {
  variant?: 'card' | 'banner' | 'thumbnail';
}

const COURT_VARIANTS = {
  card: { size: 'medium' as ImageSize, aspectRatio: 16 / 9 },
  banner: { size: 'large' as ImageSize, aspectRatio: 21 / 9 },
  thumbnail: { size: 'small' as ImageSize, aspectRatio: 1 },
};

export function CourtImage({
  variant = 'card',
  className,
  ...props
}: CourtImageProps) {
  const { size, aspectRatio } = COURT_VARIANTS[variant];

  return (
    <OptimizedImage
      size={size}
      aspectRatio={aspectRatio}
      placeholder="court"
      className={`rounded-xl ${className || ''}`}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#E5E5E5',
  },
});

export default OptimizedImage;
