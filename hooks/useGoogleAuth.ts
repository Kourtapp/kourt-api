import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// IDs do Google Cloud Console
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';

// Verificar se o Google Auth está configurado para a plataforma atual
const checkGoogleConfigured = () => {
  if (Platform.OS === 'ios') return !!GOOGLE_CLIENT_ID_IOS;
  if (Platform.OS === 'android') return !!GOOGLE_CLIENT_ID_ANDROID;
  return !!GOOGLE_CLIENT_ID_WEB;
};

const IS_GOOGLE_CONFIGURED = checkGoogleConfigured();

// Import Google auth conditionally to avoid crash when not configured
let useGoogleAuthRequest: any = null;
if (IS_GOOGLE_CONFIGURED) {
  try {
    const Google = require('expo-auth-session/providers/google');
    useGoogleAuthRequest = Google.useAuthRequest;
  } catch (e) {
    console.log('[GoogleAuth] Failed to load expo-auth-session:', e);
  }
}

export function useGoogleAuth() {
  const { refreshProfile } = useAuthStore();
  const authSessionCompleted = useRef(false);

  // Mover para dentro do hook para evitar execução no escopo do módulo
  useEffect(() => {
    if (!authSessionCompleted.current && IS_GOOGLE_CONFIGURED) {
      WebBrowser.maybeCompleteAuthSession();
      authSessionCompleted.current = true;
    }
  }, []);

  // Se não configurado, retornar valores padrão sem chamar o hook do Google
  if (!IS_GOOGLE_CONFIGURED || !useGoogleAuthRequest) {
    return {
      signInWithGoogle: async () => {
        Alert.alert(
          'Google Auth não disponível',
          'Login com Google não está configurado para esta plataforma.'
        );
      },
      isGoogleReady: false,
      isGoogleConfigured: false,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [request, response, promptAsync] = useGoogleAuthRequest({
    webClientId: GOOGLE_CLIENT_ID_WEB || undefined,
    iosClientId: GOOGLE_CLIENT_ID_IOS || undefined,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID || undefined,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error') {
      Alert.alert('Erro', 'Falha ao fazer login com Google');
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        console.error('Google sign-in error:', error);
        Alert.alert('Erro', 'Falha ao autenticar com Google');
        return;
      }

      if (data.user) {
        // Verificar se o perfil já existe
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, onboarding_completed')
          .eq('id', data.user.id)
          .single();

        let isNewUser = false;

        // Se não existir, criar o perfil
        if (!existingProfile) {
          isNewUser = true;
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            auth_provider: 'google',
            onboarding_completed: false,
          });

          if (profileError) {
            console.log('Profile creation note:', profileError.message);
          }
        }

        // Atualizar o perfil no store
        await refreshProfile();

        // Navegar baseado no status do onboarding
        if (isNewUser || !existingProfile?.onboarding_completed) {
          router.replace('/(onboarding)/welcome');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (err) {
      console.error('Google auth error:', err);
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  const signInWithGoogle = async () => {
    if (!request) {
      Alert.alert(
        'Aguarde',
        'Carregando autenticação do Google...'
      );
      return;
    }

    await promptAsync();
  };

  return {
    signInWithGoogle,
    isGoogleReady: !!request,
    isGoogleConfigured: true,
  };
}
