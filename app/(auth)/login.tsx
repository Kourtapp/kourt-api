import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAppleAuth } from '@/hooks/useAppleAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, isLoading } = useAuthStore();
  const { signInWithGoogle } = useGoogleAuth();
  const { signInWithApple, isAppleAvailable } = useAppleAuth();

  const handleLogin = async () => {
    const { error } = await signIn(email, password);

    if (error) {
      Alert.alert('Erro', error);
      return;
    }

    // Buscar perfil atualizado e verificar onboarding
    await useAuthStore.getState().refreshProfile();
    const { profile } = useAuthStore.getState();

    if (profile?.onboarding_completed) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(onboarding)/welcome');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2 mt-2"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>

          <View className="mt-8 mb-8">
            <Text className="text-3xl font-bold text-primary">
              Bem-vindo de volta
            </Text>
            <Text className="text-gray-500 mt-2">
              Entre com sua conta para continuar
            </Text>
          </View>

          <View className="gap-4">
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="username"
              autoComplete="username"
              icon={<Mail size={20} color="#9CA3AF" />}
            />

            <View>
              <Input
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="current-password"
                icon={<Lock size={20} color="#9CA3AF" />}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9"
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-medium text-right">
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View className="mt-8">
            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={isLoading}
              disabled={!email || !password}
              size="lg"
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400">ou continue com</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Login Buttons */}
          <View className="gap-3">
            {/* Google Sign In */}
            <Pressable
              onPress={signInWithGoogle}
              className="w-full py-4 bg-white border-2 border-neutral-200 rounded-2xl flex-row items-center justify-center gap-3 active:bg-neutral-50"
            >
              <Image
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                className="w-5 h-5"
              />
              <Text className="text-black font-semibold">
                Continuar com Google
              </Text>
            </Pressable>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Não tem uma conta? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-semibold">Cadastre-se</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
