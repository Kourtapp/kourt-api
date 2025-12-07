import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, CreditCard, Calendar, ChevronDown } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

// Gerar lista de dias
const days = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1) }));

// Gerar lista de meses
const months = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

// Gerar lista de anos (últimos 100 anos)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => {
  const year = currentYear - 13 - i;
  return { value: String(year), label: String(year) };
});

// Formatar CPF: 000.000.000-00
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
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

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const { signUp, isLoading } = useAuthStore();
  const { signInWithGoogle } = useGoogleAuth();

  // Handle date selection
  const handleDateConfirm = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      setBirthDate(`${selectedDay}/${selectedMonth}/${selectedYear}`);
    }
    setShowDatePicker(false);
  };

  // Get formatted date for display
  const getFormattedDate = () => {
    if (!birthDate) return '';
    const parts = birthDate.split('/');
    if (parts.length !== 3) return birthDate;
    const monthLabel = months.find(m => m.value === parts[1])?.label || parts[1];
    return `${parts[0]} de ${monthLabel} de ${parts[2]}`;
  };

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

    // Novo usuário sempre vai para o onboarding
    Alert.alert(
      'Conta criada!',
      'Vamos personalizar sua experiência.',
      [{ text: 'Começar', onPress: () => router.replace('/(onboarding)/welcome') }],
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
              label="CPF (opcional)"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              keyboardType="number-pad"
              maxLength={14}
              textContentType="none"
              autoCorrect={false}
              icon={<CreditCard size={20} color="#9CA3AF" />}
            />

            {/* Data de nascimento - Date Picker Button */}
            <View className="w-full">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Data de nascimento
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center bg-white border border-border rounded-xl px-4 py-3.5"
              >
                <Calendar size={20} color="#9CA3AF" />
                <Text className={`flex-1 ml-3 text-base ${birthDate ? 'text-primary' : 'text-gray-400'}`}>
                  {birthDate ? getFormattedDate() : 'Selecione sua data de nascimento'}
                </Text>
                <ChevronDown size={20} color="#9CA3AF" />
              </Pressable>
            </View>

            <View>
              <Input
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="oneTimeCode"
                autoComplete="off"
                autoCorrect={false}
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

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
            <Pressable onPress={() => setShowDatePicker(false)}>
              <Text className="text-base text-neutral-500">Cancelar</Text>
            </Pressable>
            <Text className="text-lg font-bold text-black">Data de Nascimento</Text>
            <Pressable onPress={handleDateConfirm}>
              <Text className="text-base font-semibold text-lime-600">Confirmar</Text>
            </Pressable>
          </View>

          {/* Date Selectors */}
          <View className="flex-1 flex-row px-4 py-6">
            {/* Day */}
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium text-neutral-500 mb-2 text-center">Dia</Text>
              <View className="flex-1 bg-neutral-50 rounded-xl overflow-hidden">
                <FlatList
                  data={days}
                  keyExtractor={(item) => item.value}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 100 }}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => setSelectedDay(item.value)}
                      className={`py-3 px-4 items-center ${selectedDay === item.value ? 'bg-black' : ''}`}
                    >
                      <Text className={`text-lg ${selectedDay === item.value ? 'text-white font-bold' : 'text-neutral-700'}`}>
                        {item.label}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            </View>

            {/* Month */}
            <View className="flex-1 mx-2">
              <Text className="text-sm font-medium text-neutral-500 mb-2 text-center">Mês</Text>
              <View className="flex-1 bg-neutral-50 rounded-xl overflow-hidden">
                <FlatList
                  data={months}
                  keyExtractor={(item) => item.value}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 100 }}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => setSelectedMonth(item.value)}
                      className={`py-3 px-4 items-center ${selectedMonth === item.value ? 'bg-black' : ''}`}
                    >
                      <Text className={`text-base ${selectedMonth === item.value ? 'text-white font-bold' : 'text-neutral-700'}`}>
                        {item.label}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            </View>

            {/* Year */}
            <View className="flex-1 ml-2">
              <Text className="text-sm font-medium text-neutral-500 mb-2 text-center">Ano</Text>
              <View className="flex-1 bg-neutral-50 rounded-xl overflow-hidden">
                <FlatList
                  data={years}
                  keyExtractor={(item) => item.value}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 100 }}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => setSelectedYear(item.value)}
                      className={`py-3 px-4 items-center ${selectedYear === item.value ? 'bg-black' : ''}`}
                    >
                      <Text className={`text-lg ${selectedYear === item.value ? 'text-white font-bold' : 'text-neutral-700'}`}>
                        {item.label}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            </View>
          </View>

          {/* Selected Date Preview */}
          <View className="px-5 pb-8">
            <View className="bg-neutral-100 rounded-xl p-4 items-center">
              <Text className="text-sm text-neutral-500 mb-1">Data selecionada</Text>
              <Text className="text-xl font-bold text-black">
                {selectedDay && selectedMonth && selectedYear
                  ? `${selectedDay} de ${months.find(m => m.value === selectedMonth)?.label} de ${selectedYear}`
                  : 'Selecione dia, mês e ano'}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
