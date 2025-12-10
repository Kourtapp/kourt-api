import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AddCardScreen() {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').substring(0, 19) : '';
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const getCardBrand = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'MASTER';
    if (/^3[47]/.test(cleaned)) return 'AMEX';
    if (/^6(?:011|5)/.test(cleaned)) return 'DISCOVER';
    return null;
  };

  const getBrandColor = (brand: string | null) => {
    switch (brand) {
      case 'VISA':
        return '#1A1F71';
      case 'MASTER':
        return '#EB001B';
      case 'AMEX':
        return '#006FCF';
      default:
        return '#A3A3A3';
    }
  };

  const cardBrand = getCardBrand(cardNumber);
  const isValid =
    cardNumber.replace(/\s/g, '').length >= 15 &&
    cardName.length >= 3 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  const handleSave = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Cartão adicionado!', 'Seu cartão foi salvo com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black ml-4">Adicionar Cartão</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Card Preview */}
          <View className="mx-5 mt-5 mb-6">
            <View
              className="h-48 rounded-2xl p-5 justify-between"
              style={{
                backgroundColor: cardBrand ? getBrandColor(cardBrand) : '#1F2937',
              }}
            >
              {/* Card Brand */}
              <View className="flex-row items-center justify-between">
                <View className="w-12 h-8 bg-white/20 rounded items-center justify-center">
                  {cardBrand ? (
                    <Text className="text-white font-bold text-xs">{cardBrand}</Text>
                  ) : (
                    <MaterialIcons name="credit-card" size={20} color="#fff" />
                  )}
                </View>
                <MaterialIcons name="contactless" size={24} color="rgba(255,255,255,0.6)" />
              </View>

              {/* Chip */}
              <View className="w-10 h-8 bg-amber-300 rounded-md" />

              {/* Card Number */}
              <Text className="text-white text-xl tracking-widest font-medium">
                {cardNumber || '•••• •••• •••• ••••'}
              </Text>

              {/* Card Details */}
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-white/60 text-xs">TITULAR</Text>
                  <Text className="text-white font-medium">
                    {cardName.toUpperCase() || 'SEU NOME'}
                  </Text>
                </View>
                <View>
                  <Text className="text-white/60 text-xs">VALIDADE</Text>
                  <Text className="text-white font-medium">{expiry || 'MM/AA'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Form */}
          <View className="px-5">
            {/* Card Number */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-neutral-700 mb-2">
                Número do cartão
              </Text>
              <View className="flex-row items-center border border-neutral-200 rounded-xl px-4">
                <MaterialIcons name="credit-card" size={20} color="#A3A3A3" />
                <TextInput
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="numeric"
                  maxLength={19}
                  className="flex-1 py-4 px-3 text-black text-lg"
                />
                {cardBrand && (
                  <View
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: getBrandColor(cardBrand) }}
                  >
                    <Text className="text-white font-bold text-xs">{cardBrand}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Card Holder Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-neutral-700 mb-2">
                Nome no cartão
              </Text>
              <View className="flex-row items-center border border-neutral-200 rounded-xl px-4">
                <MaterialIcons name="person-outline" size={20} color="#A3A3A3" />
                <TextInput
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="Como está no cartão"
                  placeholderTextColor="#A3A3A3"
                  autoCapitalize="characters"
                  className="flex-1 py-4 px-3 text-black"
                />
              </View>
            </View>

            {/* Expiry and CVV */}
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Validade</Text>
                <View className="flex-row items-center border border-neutral-200 rounded-xl px-4">
                  <MaterialIcons name="event" size={20} color="#A3A3A3" />
                  <TextInput
                    value={expiry}
                    onChangeText={(text) => setExpiry(formatExpiry(text))}
                    placeholder="MM/AA"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="numeric"
                    maxLength={5}
                    className="flex-1 py-4 px-3 text-black"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-700 mb-2">CVV</Text>
                <View className="flex-row items-center border border-neutral-200 rounded-xl px-4">
                  <MaterialIcons name="lock-outline" size={20} color="#A3A3A3" />
                  <TextInput
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    className="flex-1 py-4 px-3 text-black"
                  />
                </View>
              </View>
            </View>

            {/* Save Card Toggle */}
            <TouchableOpacity
              onPress={() => setSaveCard(!saveCard)}
              className="flex-row items-center gap-3 py-4"
            >
              <View
                className={`w-6 h-6 rounded border-2 items-center justify-center ${
                  saveCard ? 'bg-black border-black' : 'border-neutral-300'
                }`}
              >
                {saveCard && <MaterialIcons name="check" size={16} color="#fff" />}
              </View>
              <Text className="text-neutral-700">Salvar cartão para compras futuras</Text>
            </TouchableOpacity>

            {/* Security Info */}
            <View className="flex-row items-center gap-3 py-4 px-4 bg-neutral-50 rounded-xl mt-4">
              <MaterialIcons name="security" size={24} color="#22C55E" />
              <View className="flex-1">
                <Text className="font-medium text-black">Pagamento seguro</Text>
                <Text className="text-neutral-500 text-sm">
                  Seus dados são protegidos com criptografia SSL de 256 bits
                </Text>
              </View>
            </View>

            {/* Accepted Cards */}
            <View className="mt-6 mb-4">
              <Text className="text-sm text-neutral-500 mb-3">Cartões aceitos</Text>
              <View className="flex-row gap-3">
                {['VISA', 'MASTER', 'AMEX', 'ELO'].map((brand) => (
                  <View
                    key={brand}
                    className="w-14 h-9 bg-neutral-100 rounded items-center justify-center"
                  >
                    <Text className="text-xs font-bold text-neutral-600">{brand}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="h-32" />
        </ScrollView>

        {/* Bottom CTA */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isValid || loading}
            className={`w-full py-4 rounded-full items-center ${
              isValid && !loading ? 'bg-black' : 'bg-neutral-200'
            }`}
          >
            <Text
              className={`font-bold text-lg ${
                isValid && !loading ? 'text-white' : 'text-neutral-400'
              }`}
            >
              {loading ? 'Salvando...' : 'Adicionar Cartão'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
