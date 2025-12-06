import { Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useAppleAuth() {
    const { refreshProfile } = useAuthStore();

    const signInWithApple = async () => {
        if (Platform.OS !== 'ios') {
            Alert.alert('Erro', 'Login com Apple só está disponível no iOS');
            return;
        }

        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (!credential.identityToken) {
                Alert.alert('Erro', 'Não foi possível obter o token de autenticação');
                return;
            }

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken,
            });

            if (error) {
                console.error('Apple sign-in error:', error);
                Alert.alert('Erro', 'Falha ao autenticar com Apple');
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
                    const fullName = credential.fullName
                        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
                        : '';

                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: data.user.id,
                        email: credential.email || data.user.email || '',
                        name: fullName || data.user.user_metadata?.name || '',
                        auth_provider: 'apple',
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
        } catch (err: any) {
            if (err.code === 'ERR_REQUEST_CANCELED') {
                // Usuário cancelou o login
                return;
            }
            console.error('Apple auth error:', err);
            Alert.alert('Erro', 'Ocorreu um erro inesperado');
        }
    };

    return {
        signInWithApple,
        isAppleAvailable: Platform.OS === 'ios',
    };
}
