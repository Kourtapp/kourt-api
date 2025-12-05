// components/auth/GoogleSignInButton.tsx
import { View, Text, Pressable, ActivityIndicator } from 'react-native';

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
}: GoogleSignInButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      className={`flex-row items-center justify-center gap-3 py-4 bg-white border border-neutral-200 rounded-2xl ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <>
          <GoogleIcon />
          <Text className="text-black font-semibold">Continuar com Google</Text>
        </>
      )}
    </Pressable>
  );
}

// Google Icon Component (SVG simplificado)
function GoogleIcon() {
  return (
    <View className="w-5 h-5 items-center justify-center">
      <View className="w-full h-full rounded-sm bg-white border border-neutral-200 items-center justify-center">
        <Text className="text-[12px] font-bold" style={{ color: '#4285F4' }}>
          G
        </Text>
      </View>
    </View>
  );
}
