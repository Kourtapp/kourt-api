// services/socialAuth.ts
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import { supabase } from '@/lib/supabase';

// REMOVIDO: WebBrowser.maybeCompleteAuthSession() - movido para useGoogleAuth hook

// Configurações
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

interface SocialAuthResult {
  success: boolean;
  isNewUser?: boolean;
  error?: string;
}

// ==================== APPLE SIGN IN ====================

export async function signInWithApple(): Promise<SocialAuthResult> {
  try {
    // Verificar disponibilidade
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Apple Sign In não disponível neste dispositivo',
      };
    }

    // Solicitar credenciais
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { success: false, error: 'Token não recebido' };
    }

    // Autenticar no Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) {
      console.error('Supabase Apple auth error:', error);
      return { success: false, error: error.message };
    }

    // Verificar se é novo usuário
    const isNewUser = data.user?.created_at === data.user?.last_sign_in_at;

    // Se é novo usuário e temos nome, atualizar perfil
    if (isNewUser && credential.fullName) {
      const fullName = [
        credential.fullName.givenName,
        credential.fullName.familyName,
      ]
        .filter(Boolean)
        .join(' ');

      if (fullName) {
        await supabase
          .from('profiles')
          .update({
            name: fullName,
            auth_provider: 'apple',
          })
          .eq('id', data.user!.id);
      }
    }

    return { success: true, isNewUser };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      return { success: false, error: 'Cancelado pelo usuário' };
    }
    console.error('Apple Sign In error:', error);
    return { success: false, error: error.message };
  }
}

// ==================== GOOGLE SIGN IN ====================

// Hook para Google Auth
export function useGoogleAuth() {
  const redirectUri = makeRedirectUri({
    scheme: 'kourtapp',
    path: 'auth/callback',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  return { request, response, promptAsync };
}

export async function signInWithGoogle(
  idToken: string,
  accessToken?: string,
): Promise<SocialAuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      access_token: accessToken,
    });

    if (error) {
      console.error('Supabase Google auth error:', error);
      return { success: false, error: error.message };
    }

    // Verificar se é novo usuário
    const isNewUser = data.user?.created_at === data.user?.last_sign_in_at;

    // Atualizar provider no perfil
    if (isNewUser) {
      await supabase
        .from('profiles')
        .update({ auth_provider: 'google' })
        .eq('id', data.user!.id);
    }

    return { success: true, isNewUser };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    return { success: false, error: error.message };
  }
}

// ==================== UTILS ====================

// Verificar se Apple Sign In está disponível
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return await AppleAuthentication.isAvailableAsync();
}

// Desvincular provider (para configurações)
export async function unlinkProvider(
  provider: 'apple' | 'google',
): Promise<boolean> {
  try {
    // Nota: Supabase não tem API direta para desvincular
    // Isso geralmente requer uma Edge Function customizada
    console.log(`Unlink ${provider} - não implementado`);
    return false;
  } catch (error) {
    console.error('Unlink error:', error);
    return false;
  }
}
