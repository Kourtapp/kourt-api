import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const { resetPassword, isLoading } = useAuthStore();

  const handleResetPassword = async () => {
    const { error } = await resetPassword(email);

    if (error) {
      Alert.alert('Erro', error);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-16 h-16 bg-success/10 rounded-full items-center justify-center mb-6">
            <CheckCircle size={32} color="#22C55E" />
          </View>
          <Text className="text-2xl font-bold text-primary text-center mb-2">
            E-mail enviado!
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            Enviamos um link de recuperação para{'\n'}
            <Text className="font-medium">{email}</Text>
          </Text>
          <Button
            title="Voltar para login"
            onPress={() => router.replace('/(auth)/login')}
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

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
              Esqueceu a senha?
            </Text>
            <Text className="text-gray-500 mt-2">
              Digite seu e-mail e enviaremos um link para redefinir sua senha
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
              icon={<Mail size={20} color="#9CA3AF" />}
            />
          </View>

          <View className="mt-8">
            <Button
              title="Enviar link"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={!email}
              size="lg"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
