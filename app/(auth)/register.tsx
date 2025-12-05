import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, CreditCard, Calendar } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

// Formatar CPF: 000.000.000-00
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

// Formatar data: DD/MM/AAAA
const formatDate = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
};

// Converter DD/MM/AAAA para AAAA-MM-DD (formato ISO)
const toISODate = (brDate: string): string => {
  const parts = brDate.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Validar CPF
const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11) return false;
  if (/^(\d)\1+$/.test(numbers)) return false; // Todos dígitos iguais

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;

  return true;
};

// Validar idade (deve ter pelo menos 13 anos)
const isValidAge = (birthDate: string): boolean => {
  const parts = birthDate.split('/');
  if (parts.length !== 3) return false;
  const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age >= 13 && age <= 120;
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signUp, isLoading } = useAuthStore();
  const { signInWithGoogle } = useGoogleAuth();

  const handleRegister = async () => {
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (cpf && !isValidCPF(cpf)) {
      Alert.alert('Erro', 'CPF inválido');
      return;
    }

    if (birthDate && !isValidAge(birthDate)) {
      Alert.alert('Erro', 'Data de nascimento inválida ou idade menor que 13 anos');
      return;
    }

    const cleanCpf = cpf ? cpf.replace(/\D/g, '') : undefined;
    const isoDate = birthDate ? toISODate(birthDate) : undefined;

    const { error } = await signUp(email, password, name, cleanCpf, isoDate);

    if (error) {
      Alert.alert('Erro', error);
      return;
    }

    Alert.alert(
      'Conta criada!',
      'Verifique seu e-mail para confirmar sua conta.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2 mt-2"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>

          <View className="mt-8 mb-8">
            <Text className="text-3xl font-bold text-primary">Criar conta</Text>
            <Text className="text-gray-500 mt-2">
              Preencha os dados para começar
            </Text>
          </View>

          <View className="gap-4">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              icon={<User size={20} color="#9CA3AF" />}
            />

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              autoComplete="email"
              icon={<Mail size={20} color="#9CA3AF" />}
            />

            <Input
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              keyboardType="numeric"
              maxLength={14}
              icon={<CreditCard size={20} color="#9CA3AF" />}
            />

            <Input
              label="Data de nascimento"
              placeholder="DD/MM/AAAA"
              value={birthDate}
              onChangeText={(text) => setBirthDate(formatDate(text))}
              keyboardType="numeric"
              maxLength={10}
              icon={<Calendar size={20} color="#9CA3AF" />}
            />

            <View>
              <Input
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                autoComplete="new-password"
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
          </View>

          <View className="mt-8">
            <Button
              title="Criar conta"
              onPress={handleRegister}
              loading={isLoading}
              disabled={!name || !email || !password}
              size="lg"
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400">ou</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Google Button - Temporariamente desabilitado */}
          {/* Configure EXPO_PUBLIC_GOOGLE_CLIENT_ID_* no .env para habilitar */}
          {false && (
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
          )}

          <View className="flex-row justify-center mt-6 mb-8">
            <Text className="text-gray-500">Já tem uma conta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-semibold">Entrar</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
