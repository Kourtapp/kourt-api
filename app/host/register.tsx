import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function HostRegisterScreen() {
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    numberOfCourts: '1',
    ownerName: profile?.name || '',
    ownerCpf: '',
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Erro', 'Você precisa aceitar os termos de uso');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('host_applications').insert({
        user_id: user.id,
        business_name: formData.businessName,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode.replace(/\D/g, ''),
        description: formData.description,
        number_of_courts: parseInt(formData.numberOfCourts) || 1,
        owner_name: formData.ownerName,
        owner_cpf: formData.ownerCpf.replace(/\D/g, ''),
        status: 'pending',
      });

      if (error) throw error;

      Alert.alert(
        'Solicitação Enviada!',
        'Sua solicitação foi enviada com sucesso. Entraremos em contato em até 48 horas para dar continuidade ao processo.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível enviar a solicitação');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.businessName && formData.cnpj.length >= 18;
      case 2:
        return formData.address && formData.city && formData.state;
      case 3:
        return formData.ownerName && formData.email && formData.phone;
      case 4:
        return acceptedTerms;
      default:
        return true;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-neutral-100">
        <Pressable onPress={() => (step > 1 ? setStep(step - 1) : router.back())} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-lg font-bold text-black">Cadastrar Arena</Text>
          <Text className="text-sm text-neutral-500">Etapa {step} de 4</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="flex-row px-4 py-3 gap-2">
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            className={`flex-1 h-1 rounded-full ${
              s <= step ? 'bg-pink-500' : 'bg-neutral-200'
            }`}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Step 1: Business Info */}
          {step === 1 && (
            <View className="px-5 py-4">
              <Text className="text-xl font-bold text-black mb-2">Dados do Negócio</Text>
              <Text className="text-neutral-500 mb-6">
                Informações sobre sua arena ou centro esportivo
              </Text>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">
                    Nome da Arena / Empresa *
                  </Text>
                  <TextInput
                    value={formData.businessName}
                    onChangeText={(text) => setFormData({ ...formData, businessName: text })}
                    placeholder="Ex: Arena Beach Sports"
                    placeholderTextColor="#A3A3A3"
                    className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">CNPJ *</Text>
                  <TextInput
                    value={formData.cnpj}
                    onChangeText={(text) =>
                      setFormData({ ...formData, cnpj: formatCNPJ(text) })
                    }
                    placeholder="00.000.000/0000-00"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="numeric"
                    className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">
                    Quantidade de Quadras
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <Pressable
                      onPress={() =>
                        setFormData({
                          ...formData,
                          numberOfCourts: Math.max(1, parseInt(formData.numberOfCourts) - 1).toString(),
                        })
                      }
                      className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center"
                    >
                      <MaterialIcons name="remove" size={24} color="#525252" />
                    </Pressable>
                    <Text className="text-3xl font-bold text-black w-16 text-center">
                      {formData.numberOfCourts}
                    </Text>
                    <Pressable
                      onPress={() =>
                        setFormData({
                          ...formData,
                          numberOfCourts: (parseInt(formData.numberOfCourts) + 1).toString(),
                        })
                      }
                      className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center"
                    >
                      <MaterialIcons name="add" size={24} color="#525252" />
                    </Pressable>
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">
                    Descrição (opcional)
                  </Text>
                  <TextInput
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Conte sobre sua arena, estrutura, diferenciais..."
                    placeholderTextColor="#A3A3A3"
                    multiline
                    numberOfLines={3}
                    className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black min-h-[100px]"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <View className="px-5 py-4">
              <Text className="text-xl font-bold text-black mb-2">Endereço</Text>
              <Text className="text-neutral-500 mb-6">
                Localização da sua arena
              </Text>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">CEP</Text>
                  <TextInput
                    value={formData.zipCode}
                    onChangeText={(text) =>
                      setFormData({ ...formData, zipCode: formatZipCode(text) })
                    }
                    placeholder="00000-000"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="numeric"
                    className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">
                    Endereço Completo *
                  </Text>
                  <TextInput
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    placeholder="Rua, número, complemento"
                    placeholderTextColor="#A3A3A3"
                    className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-[2]">
                    <Text className="text-sm font-medium text-neutral-700 mb-2">Cidade *</Text>
                    <TextInput
                      value={formData.city}
                      onChangeText={(text) => setFormData({ ...formData, city: text })}
                      placeholder="São Paulo"
                      placeholderTextColor="#A3A3A3"
                      className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-neutral-700 mb-2">Estado *</Text>
                    <TextInput
                      value={formData.state}
                      onChangeText={(text) =>
                        setFormData({ ...formData, state: text.toUpperCase().substring(0, 2) })
                      }
                      placeholder="SP"
                      placeholderTextColor="#A3A3A3"
                      maxLength={2}
                      autoCapitalize="characters"
                      className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black text-center"
                    />
                  </View>
                </View>
              </View>

              {/* Map Preview Placeholder */}
              <View className="mt-6 h-40 bg-neutral-100 rounded-2xl items-center justify-center">
                <MaterialIcons name="map" size={48} color="#A3A3A3" />
                <Text className="text-sm text-neutral-400 mt-2">Localização no mapa</Text>
              </View>
            </View>
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <View className="px-5 py-4">
              <Text className="text-xl font-bold text-black mb-2">Contato</Text>
              <Text className="text-neutral-500 mb-6">
                Dados do responsável pela arena
              </Text>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">
                    Nome Completo do Responsável *
                  </Text>
                  <TextInput
                    value={formData.ownerName}
                    onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
                    placeholder="João da Silva"
                    placeholderTextColor="#A3A3A3"
                    className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">CPF</Text>
                  <TextInput
                    value={formData.ownerCpf}
                    onChangeText={(text) =>
                      setFormData({ ...formData, ownerCpf: formatCPF(text) })
                    }
                    placeholder="000.000.000-00"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="numeric"
                    className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">
                    E-mail Comercial *
                  </Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="contato@arena.com.br"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-neutral-700 mb-2">
                    Telefone / WhatsApp *
                  </Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phone: formatPhone(text) })
                    }
                    placeholder="(11) 99999-9999"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="phone-pad"
                    className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-base text-black"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <View className="px-5 py-4">
              <Text className="text-xl font-bold text-black mb-2">Revisão</Text>
              <Text className="text-neutral-500 mb-6">
                Confira os dados antes de enviar
              </Text>

              {/* Summary Card */}
              <View className="bg-neutral-50 rounded-2xl p-4 gap-4">
                <View>
                  <Text className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                    Negócio
                  </Text>
                  <Text className="text-base font-semibold text-black">{formData.businessName}</Text>
                  <Text className="text-sm text-neutral-500">CNPJ: {formData.cnpj}</Text>
                  <Text className="text-sm text-neutral-500">
                    {formData.numberOfCourts} quadra(s)
                  </Text>
                </View>

                <View className="h-px bg-neutral-200" />

                <View>
                  <Text className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                    Endereço
                  </Text>
                  <Text className="text-sm text-neutral-700">{formData.address}</Text>
                  <Text className="text-sm text-neutral-500">
                    {formData.city} - {formData.state}
                  </Text>
                </View>

                <View className="h-px bg-neutral-200" />

                <View>
                  <Text className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                    Contato
                  </Text>
                  <Text className="text-sm text-neutral-700">{formData.ownerName}</Text>
                  <Text className="text-sm text-neutral-500">{formData.email}</Text>
                  <Text className="text-sm text-neutral-500">{formData.phone}</Text>
                </View>
              </View>

              {/* Benefits */}
              <View className="mt-6">
                <Text className="text-sm font-semibold text-neutral-700 mb-3">
                  Benefícios de ser um Host PRO
                </Text>
                <View className="gap-2">
                  {[
                    'Receba reservas diretamente pelo app',
                    'Sistema de gestão de quadras',
                    'Relatórios de ocupação e faturamento',
                    'Destaque nos resultados de busca',
                    'Suporte prioritário',
                  ].map((benefit, index) => (
                    <View key={index} className="flex-row items-center gap-2">
                      <MaterialIcons name="check-circle" size={18} color="#22C55E" />
                      <Text className="text-sm text-neutral-600">{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Terms */}
              <Pressable
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                className="flex-row items-start gap-3 mt-6 p-4 bg-white rounded-xl border border-neutral-200"
              >
                <View
                  className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                    acceptedTerms ? 'bg-pink-500 border-pink-500' : 'border-neutral-300'
                  }`}
                >
                  {acceptedTerms && <MaterialIcons name="check" size={16} color="#fff" />}
                </View>
                <Text className="flex-1 text-sm text-neutral-600">
                  Li e aceito os{' '}
                  <Text className="text-pink-500 font-medium">Termos de Uso</Text> e a{' '}
                  <Text className="text-pink-500 font-medium">Política de Privacidade</Text> para
                  hosts do Kourt.
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      <View className="px-5 py-4 pb-8 border-t border-neutral-100">
        <Pressable
          onPress={() => {
            if (loading) return;
            if (!canProceed()) return;
            if (step < 4) {
              setStep(step + 1);
            } else {
              handleSubmit();
            }
          }}
          disabled={!canProceed() || loading}
          className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 ${
            canProceed() && !loading ? 'bg-[#EC4899]' : 'bg-neutral-300'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-base font-semibold text-white">
                {step < 4 ? 'Continuar' : 'Enviar Solicitação'}
              </Text>
              {step < 4 && canProceed() && (
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              )}
            </>
          )}
        </Pressable>

        {/* Step indicator text */}
        {step < 4 && (
          <Text className="text-center text-sm text-neutral-400 mt-3">
            {!canProceed() ? 'Preencha os campos obrigatórios para continuar' : `Etapa ${step} de 4 concluída`}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
