import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';

import { useAuthStore } from '@/stores/authStore';
import { sendOTP, verifyOTP, updateVerifiedPhone } from '@/services/otp';

export default function VerifyPhoneScreen() {
  const { user, fetchProfile } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (phone.length < 11) {
      Alert.alert('Atenção', 'Digite um número válido');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(phone);
      if (result.success) {
        setCodeSent(true);
        setCountdown(60);
      } else {
        Alert.alert('Erro', result.error || 'Falha ao enviar código SMS');
      }
    } catch {
      Alert.alert('Erro', 'Falha ao enviar código SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (index === 5 && value) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otp?: string) => {
    const finalCode = otp || code.join('');
    if (finalCode.length !== 6) {
      Alert.alert('Atenção', 'Digite o código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(phone, finalCode);

      if (result.success && result.verified) {
        // Atualizar perfil com telefone verificado
        if (user?.id) {
          await updateVerifiedPhone(user.id, phone);
          await fetchProfile();
        }

        Alert.alert('Sucesso!', 'Telefone verificado com sucesso.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          'Erro',
          result.error || 'Código inválido. Tente novamente.',
        );
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } catch {
      Alert.alert('Erro', 'Código inválido. Tente novamente.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      const result = await sendOTP(phone);
      if (result.success) {
        setCountdown(60);
        setCode(['', '', '', '', '', '']);
        Alert.alert('Código enviado!', 'Verifique suas mensagens.');
      } else {
        Alert.alert(
          'Erro',
          result.error || 'Não foi possível reenviar o código.',
        );
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível reenviar o código.');
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone =
    phone.length >= 11
      ? `+55 ${phone.slice(0, 2)} ${phone.slice(2, 7)}-${phone.slice(7)}`
      : '';

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Verificar Telefone</Text>
      </View>

      <View className="flex-1 px-5 pt-10">
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-lime-500 rounded-2xl items-center justify-center mb-6">
            <MaterialIcons name="phone-android" size={32} color="#1a2e05" />
          </View>

          {!codeSent ? (
            <>
              <Text className="text-2xl font-bold text-black text-center mb-2">
                Digite seu número
              </Text>
              <Text className="text-sm text-neutral-500 text-center">
                Enviaremos um código de verificação por SMS
              </Text>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold text-black text-center mb-2">
                Confirme seu número
              </Text>
              <Text className="text-sm text-neutral-500 text-center">
                Enviamos um código de 6 dígitos para{'\n'}
                <Text className="font-medium text-black">{maskedPhone}</Text>
              </Text>
            </>
          )}
        </View>

        {!codeSent ? (
          <>
            {/* Phone Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-black mb-2">
                Telefone
              </Text>
              <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3.5">
                <Text className="text-sm text-neutral-500 mr-2">+55</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="11 99999-9999"
                  keyboardType="phone-pad"
                  maxLength={11}
                  className="flex-1 text-sm text-black"
                  placeholderTextColor="#A3A3A3"
                />
              </View>
            </View>

            {/* Send Button */}
            <Pressable
              onPress={handleSendCode}
              disabled={loading || phone.length < 11}
              className={`w-full py-4 rounded-2xl items-center ${
                phone.length >= 11 && !loading ? 'bg-black' : 'bg-neutral-300'
              }`}
            >
              <Text className="text-white font-semibold">
                {loading ? 'Enviando...' : 'Enviar código'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* OTP Inputs */}
            <View className="flex-row justify-center gap-3 mb-6">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(index, nativeEvent.key)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  className={`w-12 h-14 bg-neutral-100 rounded-xl text-center text-2xl font-bold text-black ${
                    digit ? 'border-2 border-black' : ''
                  }`}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* Resend */}
            <Pressable
              onPress={handleResend}
              disabled={countdown > 0}
              className="items-center mb-8"
            >
              <Text
                className={`text-sm ${countdown > 0 ? 'text-neutral-400' : 'text-black font-medium'}`}
              >
                Não recebeu?{' '}
                {countdown > 0
                  ? `Reenviar em 0:${countdown.toString().padStart(2, '0')}`
                  : 'Reenviar código'}
              </Text>
            </Pressable>

            {/* Verify Button */}
            <Pressable
              onPress={() => handleVerify()}
              disabled={loading || code.join('').length !== 6}
              className={`w-full py-4 rounded-2xl items-center ${
                code.join('').length === 6 && !loading
                  ? 'bg-black'
                  : 'bg-neutral-300'
              }`}
            >
              <Text className="text-white font-semibold">
                {loading ? 'Verificando...' : 'Verificar'}
              </Text>
            </Pressable>
          </>
        )}

        {/* Info */}
        <Text className="text-xs text-neutral-500 text-center mt-6">
          Isso ajuda a proteger sua conta e evitar contas falsas.
        </Text>
      </View>
    </SafeAreaView>
  );
}
