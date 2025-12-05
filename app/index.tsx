import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui';

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-background px-6 justify-center items-center">
      <View className="items-center mb-12">
        <Text className="text-5xl font-bold text-primary mb-2">Kourt</Text>
        <Text className="text-lg text-gray-500 text-center">
          Encontre quadras, organize partidas{'\n'}e jogue com amigos
        </Text>
      </View>

      <View className="w-full gap-3">
        <Link href="/(auth)/login" asChild>
          <Button title="Entrar" variant="primary" size="lg" />
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
