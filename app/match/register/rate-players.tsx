import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRegisterMatch } from '@/contexts/RegisterMatchContext';

const TAGS = [
  { id: 'pontual', label: 'Pontual', icon: 'schedule' },
  { id: 'fairplay', label: 'Fair Play', icon: 'sports' },
  { id: 'animado', label: 'Animado', icon: 'mood' },
  { id: 'tecnico', label: 'Técnico', icon: 'star' },
  { id: 'competitivo', label: 'Competitivo', icon: 'emoji-events' },
  { id: 'comunicativo', label: 'Comunicativo', icon: 'chat' },
];

interface PlayerRating {
  playerId: string;
  rating: number;
  tags: string[];
  comment: string;
}

export default function RatePlayersScreen() {
  const { data, updateData } = useRegisterMatch();
  const [ratings, setRatings] = useState<Record<string, PlayerRating>>({});
  const [mvpId, setMvpId] = useState<string | null>(null);

  // Filter out current user - only rate other players
  const playersToRate = data.players.filter(p => p.id !== 'current-user');

  const updatePlayerRating = (playerId: string, field: keyof PlayerRating, value: any) => {
    setRatings(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        playerId,
        rating: prev[playerId]?.rating || 0,
        tags: prev[playerId]?.tags || [],
        comment: prev[playerId]?.comment || '',
        [field]: value,
      },
    }));
  };

  const toggleTag = (playerId: string, tagId: string) => {
    const currentTags = ratings[playerId]?.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(t => t !== tagId)
      : [...currentTags, tagId];
    updatePlayerRating(playerId, 'tags', newTags);
  };

  const handleSkip = () => {
    router.push('/match/register/share');
  };

  const handleContinue = () => {
    // Save ratings to context
    updateData({ playerRatings: Object.values(ratings), mvpId } as any);
    router.push('/match/register/share');
  };

  const renderStars = (playerId: string, currentRating: number) => (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => updatePlayerRating(playerId, 'rating', star)}
        >
          <MaterialIcons
            name={star <= currentRating ? 'star' : 'star-outline'}
            size={32}
            color={star <= currentRating ? '#F59E0B' : '#D4D4D4'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Avaliar Jogadores</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-neutral-500 font-medium">Pular</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        <Text className="text-neutral-500 mb-6">Como foi jogar com eles?</Text>

        {playersToRate.length === 0 ? (
          <View className="py-12 items-center">
            <MaterialIcons name="group" size={48} color="#D4D4D4" />
            <Text className="text-neutral-400 mt-4 text-center">
              Nenhum jogador para avaliar.{'\n'}Adicione jogadores na etapa anterior.
            </Text>
          </View>
        ) : (
          <>
            {/* Player Rating Cards */}
            {playersToRate.map((player) => {
              const playerRating = ratings[player.id] || { rating: 0, tags: [], comment: '' };
              return (
                <View
                  key={player.id}
                  className="bg-neutral-50 rounded-2xl p-4 mb-4"
                >
                  {/* Player Header */}
                  <View className="flex-row items-center mb-4">
                    {player.avatar_url ? (
                      <Image
                        source={{ uri: player.avatar_url }}
                        className="w-14 h-14 rounded-full"
                      />
                    ) : (
                      <View className="w-14 h-14 bg-neutral-200 rounded-full items-center justify-center">
                        <Text className="text-neutral-600 text-xl font-bold">
                          {player.name?.charAt(0) || 'U'}
                        </Text>
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <Text className="font-semibold text-black text-lg">{player.name}</Text>
                      {player.username && (
                        <Text className="text-neutral-500 text-sm">@{player.username}</Text>
                      )}
                    </View>
                    {/* MVP Badge */}
                    <TouchableOpacity
                      onPress={() => setMvpId(mvpId === player.id ? null : player.id)}
                      className={`px-3 py-2 rounded-full flex-row items-center gap-1 ${
                        mvpId === player.id ? 'bg-amber-100' : 'bg-neutral-100'
                      }`}
                    >
                      <MaterialIcons
                        name="emoji-events"
                        size={16}
                        color={mvpId === player.id ? '#D97706' : '#A3A3A3'}
                      />
                      <Text
                        className={`text-xs font-medium ${
                          mvpId === player.id ? 'text-amber-700' : 'text-neutral-400'
                        }`}
                      >
                        MVP
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Star Rating */}
                  <View className="items-center mb-4">
                    {renderStars(player.id, playerRating.rating)}
                  </View>

                  {/* Tags */}
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {TAGS.map((tag) => {
                      const isSelected = playerRating.tags.includes(tag.id);
                      return (
                        <TouchableOpacity
                          key={tag.id}
                          onPress={() => toggleTag(player.id, tag.id)}
                          className={`px-3 py-2 rounded-full flex-row items-center gap-1 ${
                            isSelected ? 'bg-lime-100 border border-lime-300' : 'bg-white border border-neutral-200'
                          }`}
                        >
                          <MaterialIcons
                            name={tag.icon as any}
                            size={14}
                            color={isSelected ? '#65A30D' : '#737373'}
                          />
                          <Text
                            className={`text-xs font-medium ${
                              isSelected ? 'text-lime-700' : 'text-neutral-600'
                            }`}
                          >
                            {tag.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Comment (Optional) */}
                  <TextInput
                    value={playerRating.comment}
                    onChangeText={(text) => updatePlayerRating(player.id, 'comment', text)}
                    placeholder="Comentário (opcional)..."
                    placeholderTextColor="#A3A3A3"
                    className="bg-white border border-neutral-200 rounded-xl p-3 text-black"
                    multiline
                    numberOfLines={2}
                  />
                </View>
              );
            })}

            {/* MVP Selection */}
            {playersToRate.length > 0 && (
              <View className="mt-4 mb-6">
                <Text className="text-base font-bold text-black mb-3">MVP da Partida</Text>
                <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                      <MaterialIcons name="emoji-events" size={20} color="#D97706" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-amber-900">
                        {mvpId
                          ? playersToRate.find(p => p.id === mvpId)?.name || 'Selecione'
                          : 'Selecione o MVP'}
                      </Text>
                      <Text className="text-xs text-amber-700">
                        O jogador que mais se destacou na partida
                      </Text>
                    </View>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {playersToRate.map((player) => (
                        <TouchableOpacity
                          key={player.id}
                          onPress={() => setMvpId(player.id)}
                          className={`px-4 py-2 rounded-full ${
                            mvpId === player.id
                              ? 'bg-amber-500'
                              : 'bg-white border border-amber-200'
                          }`}
                        >
                          <Text
                            className={`font-medium ${
                              mvpId === player.id ? 'text-white' : 'text-amber-800'
                            }`}
                          >
                            {player.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}
          </>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-black py-4 rounded-full items-center"
        >
          <Text className="text-white font-semibold text-base">Continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
