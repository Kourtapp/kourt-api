import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface PaymentMethod {
  id: string;
  type: 'card' | 'pix' | 'apple_pay' | 'google_pay';
  brand?: string;
  last4?: string;
  expiry?: string;
  label: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
}

const SAVED_CARDS: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    brand: 'VISA',
    last4: '4532',
    expiry: '12/26',
    label: '•••• •••• •••• 4532',
    subtitle: 'Vencimento 12/26',
  },
  {
    id: '2',
    type: 'card',
    brand: 'MASTER',
    last4: '8891',
    expiry: '08/25',
    label: '•••• •••• •••• 8891',
    subtitle: 'Vencimento 08/25',
  },
];

const OTHER_METHODS: PaymentMethod[] = [
  {
    id: 'pix',
    type: 'pix',
    label: 'Pix',
    subtitle: '5% de desconto',
    badge: '5% de desconto',
    badgeColor: '#22C55E',
  },
  {
    id: 'apple_pay',
    type: 'apple_pay',
    label: 'Apple Pay',
    subtitle: 'Pagamento rápido',
  },
  {
    id: 'google_pay',
    type: 'google_pay',
    label: 'Google Pay',
    subtitle: 'Pagamento rápido',
  },
];

export default function PaymentMethodsScreen() {
  const [selectedMethod, setSelectedMethod] = useState<string>('1');

  const handleConfirm = () => {
    // Save selected method and go back
    router.back();
  };

  const getBrandColor = (brand?: string) => {
    switch (brand) {
      case 'VISA':
        return '#1A1F71';
      case 'MASTER':
        return '#EB001B';
      default:
        return '#000';
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'pix':
        return { bg: '#00D4AA', text: 'PIX' };
      case 'apple_pay':
        return { bg: '#000', icon: 'apple' };
      case 'google_pay':
        return { bg: '#fff', text: 'G Pay', textColor: '#000' };
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black ml-4">Forma de Pagamento</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Saved Cards */}
        <View className="px-5 pt-5">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">
            Cartões Salvos
          </Text>

          {SAVED_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              onPress={() => setSelectedMethod(card.id)}
              className={`flex-row items-center p-4 rounded-2xl border-2 mb-3 ${
                selectedMethod === card.id ? 'border-black' : 'border-neutral-200'
              }`}
            >
              <View
                className="w-14 h-10 rounded-lg items-center justify-center mr-4"
                style={{ backgroundColor: getBrandColor(card.brand) }}
              >
                <Text className="text-white font-bold text-xs">{card.brand}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-black font-medium">{card.label}</Text>
                <Text className="text-neutral-500 text-sm">{card.subtitle}</Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedMethod === card.id ? 'bg-black border-black' : 'border-neutral-300'
                }`}
              >
                {selectedMethod === card.id && (
                  <MaterialIcons name="check" size={14} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Add New Card */}
          <TouchableOpacity
            onPress={() => router.push('/booking/add-card' as any)}
            className="flex-row items-center p-4 rounded-2xl border border-neutral-200 mb-6"
          >
            <View className="w-14 h-10 bg-neutral-100 rounded-lg items-center justify-center mr-4">
              <MaterialIcons name="add" size={24} color="#737373" />
            </View>
            <Text className="flex-1 text-black font-medium">Adicionar novo cartão</Text>
          </TouchableOpacity>
        </View>

        {/* Other Methods */}
        <View className="px-5">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">
            Outros Métodos
          </Text>

          {OTHER_METHODS.map((method) => {
            const iconData = getMethodIcon(method.type);
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                className={`flex-row items-center p-4 rounded-2xl border-2 mb-3 ${
                  selectedMethod === method.id ? 'border-black' : 'border-neutral-200'
                }`}
              >
                <View
                  className="w-14 h-10 rounded-lg items-center justify-center mr-4"
                  style={{ backgroundColor: iconData?.bg || '#000' }}
                >
                  {iconData?.text ? (
                    <Text
                      className="font-bold text-xs"
                      style={{ color: iconData.textColor || '#fff' }}
                    >
                      {iconData.text}
                    </Text>
                  ) : iconData?.icon === 'apple' ? (
                    <MaterialIcons name="apple" size={20} color="#fff" />
                  ) : null}
                </View>
                <View className="flex-1">
                  <Text className="text-black font-medium">{method.label}</Text>
                  {method.badge ? (
                    <Text style={{ color: method.badgeColor }} className="text-sm font-medium">
                      {method.badge}
                    </Text>
                  ) : (
                    <Text className="text-neutral-500 text-sm">{method.subtitle}</Text>
                  )}
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    selectedMethod === method.id ? 'bg-black border-black' : 'border-neutral-300'
                  }`}
                >
                  {selectedMethod === method.id && (
                    <MaterialIcons name="check" size={14} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <TouchableOpacity
          onPress={handleConfirm}
          className="w-full py-4 bg-black rounded-full items-center"
        >
          <Text className="text-white font-bold text-lg">Confirmar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
