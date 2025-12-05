// components/auth/AppleSignInButton.tsx
import { Platform, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

interface AppleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AppleSignInButton({
  onPress,
  loading = false,
  disabled = false,
}: AppleSignInButtonProps) {
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View pointerEvents={loading || disabled ? 'none' : 'auto'}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={16}
        style={{ height: 56, width: '100%' }}
        onPress={onPress}
      />
    </View>
  );
}
