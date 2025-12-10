import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const REFERRALS = [
  { id: '1', name: 'Marina Santos', status: 'confirmed', reward: '+R$ 1' },
  { id: '2', name: 'Pedro Lima', status: 'confirmed', reward: '+R$ 1' },
  { id: '3', name: 'Lucas Oliveira', status: 'confirmed', reward: '+R$ 1' },
  { id: '4', name: 'Ana Costa', status: 'pending' },
  { id: '5', name: 'Carlos Mendes', status: 'pending' },
];

export default function IndicacoesScreen() {
  const referralCode = 'BRUNO20';

  const handleCopyCode = () => {
    // In a real app, use expo-clipboard
    Alert.alert('Copiado!', `Código ${referralCode} copiado para a área de transferência`);
  };

  const handleShare = async (platform: string) => {
    try {
      if (platform === 'whatsapp' || platform === 'email' || platform === 'more') {
        await Share.share({
          message: `Use meu código ${referralCode} no Kourt e ganhe R$ 1 de crédito! Baixe em: https://kourt.app`,
        });
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const confirmedCount = REFERRALS.filter(r => r.status === 'confirmed').length;
  const pendingCount = REFERRALS.filter(r => r.status === 'pending').length;
  const totalEarned = confirmedCount;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black ml-4">Indique Amigos</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Referral Card */}
        <View className="mx-5 mb-6">
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24 }}
            className="p-5"
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                <MaterialIcons name="payments" size={20} color="#fff" />
              </View>
              <Text className="text-white text-3xl font-bold">R$ 20</Text>
            </View>

            <Text className="text-white text-xl font-bold mb-2">
              Convide 20 amigos e ganhe!
            </Text>
            <Text className="text-white/80 mb-4">
              Convide 20 amigos e ganhe R$ 1 em créditos para cada um que fizer a primeira reserva!
            </Text>

            <View className="mb-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-white/80">Progresso</Text>
                <Text className="text-white font-semibold">{confirmedCount}/20 amigos</Text>
              </View>
              <View className="h-2 bg-white/20 rounded-full overflow-hidden">
                <View
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(confirmedCount / 20) * 100}%` }}
                />
              </View>
            </View>

            {/* Referral Code */}
            <View className="bg-white/20 rounded-2xl p-4 flex-row items-center justify-between mt-4">
              <Text className="text-white text-xl font-bold tracking-wider">{referralCode}</Text>
              <TouchableOpacity
                onPress={handleCopyCode}
                className="bg-white px-4 py-2 rounded-full"
              >
                <Text className="text-green-600 font-semibold">Copiar</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Share Buttons */}
        <View className="flex-row gap-3 mx-5 mb-6">
          <TouchableOpacity
            onPress={() => handleShare('whatsapp')}
            className="flex-1 bg-neutral-50 rounded-2xl py-4 items-center"
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: '#25D366' }}
            >
              <MaterialIcons name="share" size={24} color="#fff" />
            </View>
            <Text className="text-black font-medium text-sm">WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleShare('email')}
            className="flex-1 bg-neutral-50 rounded-2xl py-4 items-center"
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: '#3B82F6' }}
            >
              <MaterialIcons name="share" size={24} color="#fff" />
            </View>
            <Text className="text-black font-medium text-sm">E-mail</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-neutral-50 rounded-2xl py-4 items-center">
            <View className="w-12 h-12 bg-black rounded-full items-center justify-center mb-2">
              <MaterialIcons name="qr-code" size={24} color="#fff" />
            </View>
            <Text className="text-black font-medium text-sm">QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleShare('more')}
            className="flex-1 bg-neutral-50 rounded-2xl py-4 items-center"
          >
            <View className="w-12 h-12 bg-neutral-200 rounded-full items-center justify-center mb-2">
              <MaterialIcons name="more-horiz" size={24} color="#737373" />
            </View>
            <Text className="text-black font-medium text-sm">Mais</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Card */}
        <View className="mx-5 mb-6 bg-neutral-50 rounded-2xl p-4">
          <Text className="text-base font-bold text-black mb-4">Seus ganhos</Text>
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-green-600">R$ {totalEarned}</Text>
              <Text className="text-neutral-500 text-sm">Total ganho</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-black">{confirmedCount}</Text>
              <Text className="text-neutral-500 text-sm">Confirmados</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-amber-500">{pendingCount}</Text>
              <Text className="text-neutral-500 text-sm">Pendentes</Text>
            </View>
          </View>
        </View>

        {/* Referrals List */}
        <Text className="px-5 text-base font-bold text-black mb-3">Suas indicações</Text>
        {REFERRALS.map((referral) => (
          <View
            key={referral.id}
            className="mx-5 mb-2 flex-row items-center py-3 border-b border-neutral-100"
          >
            <View
              className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                referral.status === 'confirmed' ? 'bg-green-100' : 'bg-amber-100'
              }`}
            >
              <MaterialIcons
                name={referral.status === 'confirmed' ? 'check' : 'schedule'}
                size={20}
                color={referral.status === 'confirmed' ? '#22C55E' : '#F59E0B'}
              />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-black">{referral.name}</Text>
              <Text
                className={`text-sm ${
                  referral.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'
                }`}
              >
                {referral.status === 'confirmed' ? 'Primeira reserva feita ✓' : 'Aguardando reserva'}
              </Text>
            </View>
            <Text
              className={`font-semibold ${
                referral.status === 'confirmed' ? 'text-green-600' : 'text-amber-500'
              }`}
            >
              {referral.status === 'confirmed' ? referral.reward : 'Pendente'}
            </Text>
          </View>
        ))}

        {/* Goal Reminder */}
        <View className="mx-5 mt-4 mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
              <MaterialIcons name="emoji-events" size={20} color="#D97706" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-amber-900">Faltam {20 - confirmedCount} amigos!</Text>
              <Text className="text-amber-700 text-sm">
                Complete a meta e ganhe R$ 20 em créditos
              </Text>
            </View>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
