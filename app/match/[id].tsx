import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useMatchDetail, useJoinMatch, useLeaveMatch } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { match, loading, error, refetch } = useMatchDetail(id);
  const { joinMatch, loading: joining } = useJoinMatch();
  const { leaveMatch, loading: leaving } = useLeaveMatch();
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error || !match) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-5">
        <MaterialIcons name="error-outline" size={48} color="#A3A3A3" />
        <Text className="text-lg font-semibold text-black mt-4">
          Partida não encontrada
        </Text>
        <Text className="text-sm text-neutral-500 mt-1 text-center">
          {error || 'Tente novamente mais tarde'}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-black rounded-xl"
        >
          <Text className="text-white font-medium">Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const spotsLeft = match.max_players - match.current_players;
  const players = (match as any).players || [];
  const organizer = (match as any).organizer;
  const court = (match as any).court;

  // Check if current user is in the match
  const isUserInMatch = players.some((p: any) => p.user?.id === user?.id);
  const isOrganizer = match.organizer_id === user?.id;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    }
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
      any: 'Todos os níveis',
    };
    return labels[level] || level;
  };

  const handleJoin = async () => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para entrar na partida', [
        { text: 'Cancelar' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    setActionLoading(true);
    try {
      await joinMatch(match.id, user.id);
      Alert.alert('Sucesso', 'Você entrou na partida!');
      refetch();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao entrar na partida');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!user) return;

    Alert.alert(
      'Sair da partida',
      'Tem certeza que deseja sair desta partida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await leaveMatch(match.id, user.id);
              Alert.alert('Sucesso', 'Você saiu da partida');
              refetch();
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Falha ao sair da partida');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const isLoading = actionLoading || joining || leaving;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold text-black">Detalhes</Text>
        <Pressable>
          <MaterialIcons name="more-vert" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5">
          {/* Header Card */}
          <View className="bg-black rounded-2xl p-5 mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="px-2 py-1 bg-lime-500 rounded-full">
                <Text className="text-xs font-bold text-lime-950">
                  {match.sport}
                </Text>
              </View>
              {match.is_public && (
                <View className="px-2 py-1 bg-white/20 rounded-full">
                  <Text className="text-xs text-white">Pública</Text>
                </View>
              )}
              {match.status === 'full' && (
                <View className="px-2 py-1 bg-red-500/20 rounded-full">
                  <Text className="text-xs text-red-300">Lotada</Text>
                </View>
              )}
            </View>
            <Text className="text-2xl font-bold text-white mb-2">
              {match.title}
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="event" size={16} color="#A3A3A3" />
                <Text className="text-sm text-white/70">
                  {formatDate(match.date)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="schedule" size={16} color="#A3A3A3" />
                <Text className="text-sm text-white/70">
                  {match.start_time?.slice(0, 5)}
                </Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <Pressable
            onPress={() =>
              court?.id && router.push(`/court/${court.id}` as any)
            }
            className="flex-row items-center p-4 bg-neutral-50 rounded-2xl mb-6"
          >
            <View className="w-12 h-12 bg-neutral-200 rounded-xl items-center justify-center">
              <MaterialIcons name="location-on" size={24} color="#525252" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-black">
                {court?.name || 'Local não definido'}
              </Text>
              <Text className="text-sm text-neutral-500">
                {court?.address || ''}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3A3A3" />
          </Pressable>

          {/* Players */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-black">
                Jogadores ({match.current_players}/{match.max_players})
              </Text>
              {spotsLeft > 0 && (
                <View className="px-2 py-1 bg-lime-100 rounded-full">
                  <Text className="text-xs font-medium text-lime-800">
                    {spotsLeft} vaga{spotsLeft > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
            <View className="gap-2">
              {players.map((player: any) => (
                <View
                  key={player.id}
                  className="flex-row items-center p-3 bg-neutral-50 rounded-xl"
                >
                  <View className="w-10 h-10 bg-neutral-300 rounded-full items-center justify-center">
                    <Text className="font-bold text-neutral-600">
                      {player.user?.name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-medium text-black">
                        {player.user?.name || 'Usuário'}
                      </Text>
                      {player.user?.id === match.organizer_id && (
                        <View className="px-1.5 py-0.5 bg-amber-100 rounded">
                          <Text className="text-xs text-amber-800">Org.</Text>
                        </View>
                      )}
                      {player.status === 'pending' && (
                        <View className="px-1.5 py-0.5 bg-yellow-100 rounded">
                          <Text className="text-xs text-yellow-800">
                            Pendente
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-neutral-500">
                      Nível {player.user?.level || 1}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chat-bubble-outline"
                    size={20}
                    color="#A3A3A3"
                  />
                </View>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: spotsLeft }).map((_, index) => (
                <View
                  key={`empty-${index}`}
                  className="flex-row items-center p-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-200"
                >
                  <View className="w-10 h-10 bg-neutral-200 rounded-full items-center justify-center">
                    <MaterialIcons
                      name="person-add"
                      size={20}
                      color="#A3A3A3"
                    />
                  </View>
                  <Text className="flex-1 ml-3 text-neutral-400">
                    Vaga disponível
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Info */}
          <View className="mb-6">
            <Text className="text-base font-bold text-black mb-3">
              Informações
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
                  <MaterialIcons
                    name="signal-cellular-alt"
                    size={20}
                    color="#525252"
                  />
                </View>
                <View>
                  <Text className="text-xs text-neutral-500">Nível</Text>
                  <Text className="font-medium text-black">
                    {getLevelLabel(match.level)}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
                  <MaterialIcons name="group" size={20} color="#525252" />
                </View>
                <View>
                  <Text className="text-xs text-neutral-500">
                    Máx. jogadores
                  </Text>
                  <Text className="font-medium text-black">
                    {match.max_players}
                  </Text>
                </View>
              </View>
              {match.price_per_person && match.price_per_person > 0 && (
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-neutral-100 rounded-xl items-center justify-center">
                    <MaterialIcons name="payments" size={20} color="#525252" />
                  </View>
                  <View>
                    <Text className="text-xs text-neutral-500">
                      Valor por pessoa
                    </Text>
                    <Text className="font-medium text-black">
                      R$ {match.price_per_person}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {match.description && (
            <View className="mb-6">
              <Text className="text-base font-bold text-black mb-2">Sobre</Text>
              <Text className="text-sm text-neutral-600 leading-5">
                {match.description}
              </Text>
            </View>
          )}

          {/* Organizer */}
          {organizer && (
            <View className="mb-6">
              <Text className="text-base font-bold text-black mb-3">
                Organizador
              </Text>
              <View className="flex-row items-center p-4 bg-neutral-50 rounded-2xl">
                <View className="w-12 h-12 bg-black rounded-full items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    {organizer.name?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="font-semibold text-black">
                    {organizer.name || 'Usuário'}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-0.5">
                    {organizer.rating && (
                      <>
                        <View className="flex-row items-center gap-0.5">
                          <MaterialIcons
                            name="star"
                            size={12}
                            color="#F59E0B"
                          />
                          <Text className="text-xs text-neutral-600">
                            {organizer.rating}
                          </Text>
                        </View>
                        <Text className="text-xs text-neutral-400">•</Text>
                      </>
                    )}
                    <Text className="text-xs text-neutral-600">
                      Nível {organizer.level || 1}
                    </Text>
                  </View>
                </View>
                <Pressable className="px-4 py-2 bg-neutral-200 rounded-xl">
                  <Text className="text-sm font-medium text-black">
                    Mensagem
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      {!isOrganizer && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5 py-4 pb-8">
          {isUserInMatch ? (
            <Pressable
              onPress={handleLeave}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${
                isLoading ? 'bg-neutral-300' : 'bg-red-500'
              }`}
            >
              <MaterialIcons name="logout" size={20} color="#FFF" />
              <Text className="text-white font-semibold text-[15px] ml-2">
                {isLoading ? 'Saindo...' : 'Sair da Partida'}
              </Text>
            </Pressable>
          ) : spotsLeft > 0 ? (
            <Pressable
              onPress={handleJoin}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${
                isLoading ? 'bg-neutral-300' : 'bg-lime-500'
              }`}
            >
              <MaterialIcons name="group-add" size={20} color="#1A2E05" />
              <Text className="text-lime-950 font-semibold text-[15px] ml-2">
                {isLoading ? 'Entrando...' : 'Entrar na Partida'}
              </Text>
            </Pressable>
          ) : (
            <View className="w-full py-4 rounded-2xl flex-row items-center justify-center bg-neutral-200">
              <MaterialIcons name="block" size={20} color="#737373" />
              <Text className="text-neutral-600 font-semibold text-[15px] ml-2">
                Partida Lotada
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
