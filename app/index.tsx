import { View, Text, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function WelcomeScreen() {
  const { signInWithGoogle } = useGoogleAuth();

  return (
    <View className="flex-1 bg-background px-6 justify-center items-center">
      <View className="items-center mb-12">
        <Text className="text-5xl font-bold text-primary mb-2">Kourt</Text>
        <Text className="text-lg text-gray-500 text-center">
          Encontre quadras, organize partidas{'\n'}e jogue com amigos
        </Text>
      </View>

      <View className="w-full gap-3">
        {/* Google Sign In */}
        <Pressable
          onPress={signInWithGoogle}
          className="w-full py-4 bg-white border-2 border-neutral-200 rounded-2xl flex-row items-center justify-center gap-3 active:bg-neutral-50"
        >
          <Image
            source={{ uri: 'https://www.google.com/favicon.ico' }}
            className="w-5 h-5"
          />
          <Text className="text-black font-semibold text-base">
            Continuar com Google
          </Text>
        </Pressable>

        {/* Divider */}
        <View className="flex-row items-center my-2">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-4 text-gray-400 text-sm">ou</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        <Link href="/(auth)/login" asChild>
          <Button title="Entrar com e-mail" variant="primary" size="lg" />
        </Link>

        <Link href="/(auth)/register" asChild>
          <Button title="Criar conta" variant="outline" size="lg" />
        </Link>
      </View>

      <Text className="text-sm text-gray-400 mt-8 text-center">
        Ao continuar, você concorda com nossos{'\n'}
        <Text className="text-primary underline">Termos de Uso</Text> e{' '}
        <Text className="text-primary underline">Política de Privacidade</Text>
      </Text>
    </View>
  );
}
