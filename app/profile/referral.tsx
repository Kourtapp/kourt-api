import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

export default function ReferralScreen() {
  const [copied, setCopied] = useState(false);

  const referralCode = 'BRUNO2024';
  const referralLink = `https://kourt.app/invite/${referralCode}`;

  const stats = {
    invited: 12,
    joined: 8,
    rewards: 'R$ 80',
  };

  const rewards = [
    {
      id: '1',
      milestone: 5,
      reward: 'R$ 50 em créditos',
      achieved: true,
    },
    {
      id: '2',
      milestone: 10,
      reward: '1 mês PRO grátis',
      achieved: false,
      progress: 8,
    },
    {
      id: '3',
      milestone: 25,
      reward: 'Kit exclusivo Kourt',
      achieved: false,
      progress: 8,
    },
  ];

  const recentInvites = [
    { id: '1', name: 'Pedro Fernandes', status: 'joined', date: 'Há 2 dias' },
    { id: '2', name: 'Ana Costa', status: 'joined', date: 'Há 1 semana' },
    { id: '3', name: 'Lucas Mendes', status: 'pending', date: 'Há 2 semanas' },
  ];

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Jogue comigo no Kourt! Use meu código ${referralCode} para ganhar benefícios. Baixe: ${referralLink}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black ml-4">Indique Amigos</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Referral Card */}
        <View className="px-5 mb-6">
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16, padding: 20 }}
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-3">
                <MaterialIcons name="card-giftcard" size={32} color="#fff" />
              </View>
              <Text className="text-white text-xl font-bold text-center">
                Ganhe R$ 10 por amigo
              </Text>
              <Text className="text-white/80 text-center mt-1">
                Seu amigo também ganha R$ 10 em créditos!
              </Text>
            </View>

            {/* Referral Code */}
            <View className="bg-white/20 rounded-xl p-4 mb-4">
              <Text className="text-white/60 text-xs text-center mb-2">SEU CÓDIGO</Text>
              <View className="flex-row items-center justify-center gap-3">
                <Text className="text-white text-2xl font-bold tracking-widest">
                  {referralCode}
                </Text>
                <TouchableOpacity
                  onPress={handleCopyCode}
                  className="bg-white/20 p-2 rounded-lg"
                >
                  <MaterialIcons
                    name={copied ? 'check' : 'content-copy'}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
              {copied && (
                <Text className="text-white/80 text-xs text-center mt-2">
                  Código copiado!
                </Text>
              )}
            </View>

            {/* Share Button */}
            <TouchableOpacity
              onPress={handleShare}
              className="bg-white rounded-full py-3 flex-row items-center justify-center gap-2"
            >
              <MaterialIcons name="share" size={20} color="#16A34A" />
              <Text className="text-green-600 font-bold">Compartilhar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View className="px-5 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-neutral-50 rounded-2xl p-4 items-center border border-neutral-200">
              <Text className="text-2xl font-bold text-black">{stats.invited}</Text>
              <Text className="text-neutral-500 text-sm">Convidados</Text>
            </View>
            <View className="flex-1 bg-neutral-50 rounded-2xl p-4 items-center border border-neutral-200">
              <Text className="text-2xl font-bold text-green-600">{stats.joined}</Text>
              <Text className="text-neutral-500 text-sm">Entraram</Text>
            </View>
            <View className="flex-1 bg-neutral-50 rounded-2xl p-4 items-center border border-neutral-200">
              <Text className="text-2xl font-bold text-amber-600">{stats.rewards}</Text>
              <Text className="text-neutral-500 text-sm">Ganhos</Text>
            </View>
          </View>
        </View>

        {/* Rewards Progress */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            RECOMPENSAS
          </Text>
          <View className="gap-3">
            {rewards.map((reward) => (
              <View
                key={reward.id}
                className={`p-4 rounded-2xl border ${
                  reward.achieved
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center ${
                      reward.achieved ? 'bg-green-100' : 'bg-neutral-100'
                    }`}
                  >
                    {reward.achieved ? (
                      <MaterialIcons name="check-circle" size={24} color="#22C55E" />
                    ) : (
                      <MaterialIcons name="emoji-events" size={24} color="#A3A3A3" />
                    )}
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-bold text-black">
                      {reward.milestone} amigos
                    </Text>
                    <Text className="text-neutral-500 text-sm">{reward.reward}</Text>
                  </View>
                  {reward.achieved ? (
                    <View className="bg-green-500 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">CONQUISTADO</Text>
                    </View>
                  ) : (
                    <Text className="text-neutral-500 font-bold">
                      {reward.progress}/{reward.milestone}
                    </Text>
                  )}
                </View>

                {!reward.achieved && reward.progress && (
                  <View className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-amber-400 rounded-full"
                      style={{
                        width: `${(reward.progress / reward.milestone) * 100}%`,
                      }}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Invites */}
        <View className="px-5 mb-8">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            CONVITES RECENTES
          </Text>
          <View className="gap-2">
            {recentInvites.map((invite) => (
              <View
                key={invite.id}
                className="flex-row items-center p-3 bg-white rounded-2xl border border-neutral-200"
              >
                <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
                  <MaterialIcons name="person" size={20} color="#737373" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="font-semibold text-black">{invite.name}</Text>
                  <Text className="text-neutral-400 text-sm">{invite.date}</Text>
                </View>
                {invite.status === 'joined' ? (
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="check-circle" size={16} color="#22C55E" />
                    <Text className="text-green-600 text-sm font-medium">Entrou</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="schedule" size={16} color="#A3A3A3" />
                    <Text className="text-neutral-400 text-sm">Pendente</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Share Options */}
        <View className="px-5 mb-8">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            COMPARTILHAR VIA
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleShare}
              className="flex-1 bg-green-500 rounded-2xl p-4 items-center"
            >
              <MaterialIcons name="chat" size={24} color="#fff" />
              <Text className="text-white font-medium mt-1">WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="flex-1 bg-blue-500 rounded-2xl p-4 items-center"
            >
              <MaterialIcons name="send" size={24} color="#fff" />
              <Text className="text-white font-medium mt-1">Telegram</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="flex-1 bg-neutral-800 rounded-2xl p-4 items-center"
            >
              <MaterialIcons name="more-horiz" size={24} color="#fff" />
              <Text className="text-white font-medium mt-1">Outros</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
