import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// Necessário para o redirect funcionar corretamente
WebBrowser.maybeCompleteAuthSession();

// IDs do Google Cloud Console - Substituir pelos seus
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';

export function useGoogleAuth() {
  const { refreshProfile } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID_WEB,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
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
          .select('id')
          .eq('id', data.user.id)
          .single();

        // Se não existir, criar o perfil
        if (!existingProfile) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            auth_provider: 'google',
          });

          if (profileError) {
            console.log('Profile creation note:', profileError.message);
          }
        }

        // Atualizar o perfil no store
        await refreshProfile();
      }
    } catch (err) {
      console.error('Google auth error:', err);
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  const signInWithGoogle = async () => {
    if (!request) {
      Alert.alert(
        'Configuração necessária',
        'Configure os IDs do Google OAuth nas variáveis de ambiente:\n\n' +
        '• EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB\n' +
        '• EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS\n' +
        '• EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID'
      );
      return;
    }

    await promptAsync();
  };

  return {
    signInWithGoogle,
    isGoogleReady: !!request,
  };
}
