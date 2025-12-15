import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// IDs do Google Cloud Console
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';

// Verificar se o Google Auth está configurado para a plataforma atual
const isGoogleConfigured = () => {
  if (Platform.OS === 'ios') return !!GOOGLE_CLIENT_ID_IOS;
  if (Platform.OS === 'android') return !!GOOGLE_CLIENT_ID_ANDROID;
  return !!GOOGLE_CLIENT_ID_WEB;
};

export function useGoogleAuth() {
  const { refreshProfile } = useAuthStore();
  const authSessionCompleted = useRef(false);
  const [isConfigured] = useState(isGoogleConfigured());

  // Mover para dentro do hook para evitar execução no escopo do módulo
  useEffect(() => {
    if (!authSessionCompleted.current && isConfigured) {
      WebBrowser.maybeCompleteAuthSession();
      authSessionCompleted.current = true;
    }
  }, [isConfigured]);

  // Configurar o request - o hook precisa ser chamado sempre (regra dos hooks)
  // Quando não configurado, usar placeholders para evitar crash
  const authConfig = isConfigured ? {
    webClientId: GOOGLE_CLIENT_ID_WEB || undefined,
    iosClientId: GOOGLE_CLIENT_ID_IOS || undefined,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID || undefined,
  } : {
    // Placeholders para evitar crash - o hook não será usado de fato
    webClientId: 'not-configured',
    iosClientId: Platform.OS === 'ios' ? 'not-configured' : undefined,
    androidClientId: Platform.OS === 'android' ? 'not-configured' : undefined,
  };

  const [request, response, promptAsync] = Google.useAuthRequest(authConfig);

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
    if (!isConfigured) {
      Alert.alert(
        'Google Auth não disponível',
        'Login com Google não está configurado para esta plataforma.'
      );
      return;
    }

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
    isGoogleReady: isConfigured && !!request,
    isGoogleConfigured: isConfigured,
  };
}
