import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert('Sucesso!', 'Sua senha foi alterada com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível alterar a senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-black">Alterar Senha</Text>
      </View>

      <View className="flex-1 p-5">
        <View className="bg-white rounded-2xl border border-neutral-200 p-5">
          <View className="mb-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Senha atual</Text>
            <View className="flex-row items-center bg-neutral-100 rounded-xl px-4">
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                placeholder="Digite sua senha atual"
                className="flex-1 py-3"
              />
              <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <MaterialIcons
                  name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#737373"
                />
              </Pressable>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Nova senha</Text>
            <View className="flex-row items-center bg-neutral-100 rounded-xl px-4">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Digite sua nova senha"
                className="flex-1 py-3"
              />
              <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                <MaterialIcons
                  name={showNewPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#737373"
                />
              </Pressable>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Confirmar nova senha</Text>
            <View className="flex-row items-center bg-neutral-100 rounded-xl px-4">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Confirme sua nova senha"
                className="flex-1 py-3"
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#737373"
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleChangePassword}
            disabled={loading}
            className="bg-black rounded-xl py-4 items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Alterar senha</Text>
            )}
          </Pressable>
        </View>

        <View className="mt-6 bg-neutral-100 rounded-2xl p-4">
          <Text className="text-sm font-semibold text-neutral-700 mb-2">Dicas de senha segura:</Text>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="check" size={16} color="#737373" />
              <Text className="text-sm text-neutral-500">Mínimo de 6 caracteres</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="check" size={16} color="#737373" />
              <Text className="text-sm text-neutral-500">Misture letras e números</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="check" size={16} color="#737373" />
              <Text className="text-sm text-neutral-500">Não use informações pessoais</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
