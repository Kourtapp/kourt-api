import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { usePosts } from '@/hooks/usePosts';
import { useMatches, useJoinMatch } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { Match } from '@/types/database.types';

const tabs = ['Feed', 'Partidas', 'Torneios'];

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningMatchId, setJoiningMatchId] = useState<string | null>(null);
  const { profile } = useAuthStore();

  // Real data hooks
  const { posts, loading: postsLoading, likedPosts, toggleLike, refresh: refreshPosts } = usePosts();
  const { matches, loading: matchesLoading, refetch: refetchMatches } = useMatches({ status: 'open' });
  const { joinMatch } = useJoinMatch();

  // Handle join match
  const handleJoinMatch = async (matchId: string, e: any) => {
    e.stopPropagation(); // Prevent navigating to match detail

    if (!profile?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para entrar em uma partida');
      return;
    }

    setJoiningMatchId(matchId);
    try {
      await joinMatch(matchId);
      Alert.alert('Sucesso!', 'Você entrou na partida!', [
        { text: 'Ver partida', onPress: () => router.push(`/match/${matchId}` as any) },
        { text: 'OK' }
      ]);
      refetchMatches();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível entrar na partida');
    } finally {
      setJoiningMatchId(null);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshPosts();
    refetchMatches();
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  }, [refreshPosts, refetchMatches]);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  // Get result label in Portuguese
  const getResultLabel = (result: string | null) => {
    switch (result) {
      case 'victory': return 'Vitoria';
      case 'defeat': return 'Derrota';
      case 'draw': return 'Empate';
      default: return result || '';
    }
  };

  // Get result color
  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'victory': return { bg: 'bg-lime-500', text: 'text-lime-950' };
      case 'defeat': return { bg: 'bg-red-500', text: 'text-white' };
      case 'draw': return { bg: 'bg-neutral-500', text: 'text-white' };
      default: return { bg: 'bg-neutral-500', text: 'text-white' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-neutral-100">
        <Text className="text-xl font-bold text-black">Social</Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => router.push('/search' as any)}
            className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
          >
            <MaterialIcons name="search" size={20} color="#000" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/chat' as any)}
            className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
          >
            <MaterialIcons name="chat" size={20} color="#000" />
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-neutral-100">
        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(index)}
            className={`flex-1 py-3 items-center border-b-2 ${activeTab === index ? 'border-black' : 'border-transparent'}`}
          >
            <Text className={`text-sm font-medium ${activeTab === index ? 'text-black' : 'text-neutral-500'}`}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
        }
      >
        {/* Feed Tab */}
        {activeTab === 0 && (
          <View className="p-5 gap-4">
            {postsLoading ? (
              <View className="py-20 items-center">
                <ActivityIndicator size="large" color="#000" />
              </View>
            ) : posts.length === 0 ? (
              <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
                <MaterialIcons name="feed" size={48} color="#A3A3A3" />
                <Text className="text-lg font-semibold text-neutral-700 mt-4">Nenhum post ainda</Text>
                <Text className="text-sm text-neutral-500 text-center mt-2">
                  Seja o primeiro a compartilhar uma partida!
                </Text>
                <Pressable
                  onPress={() => router.push('/match/create' as any)}
                  className="mt-4 px-6 py-3 bg-black rounded-xl"
                >
                  <Text className="text-sm font-semibold text-white">Criar partida</Text>
                </Pressable>
              </View>
            ) : posts.map((post) => {
              const resultColors = getResultColor(post.result);
              const isLiked = likedPosts.has(post.id);
              return (
                <View
                  key={post.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
                >
                  {/* Photo if available */}
                  {post.photo_url && (
                    <View className="relative">
                      <Image
                        source={{ uri: post.photo_url }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                      {post.xp_earned > 0 && (
                        <View className="absolute top-2 right-2 bg-lime-500 px-2 py-1 rounded-full flex-row items-center">
                          <MaterialIcons name="bolt" size={12} color="#1A2E05" />
                          <Text className="text-[10px] font-bold text-lime-950 ml-0.5">+{post.xp_earned} XP</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View className="p-4">
                    {/* Header */}
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-neutral-300 rounded-full items-center justify-center">
                        {post.user?.avatar_url ? (
                          <Image source={{ uri: post.user.avatar_url }} className="w-10 h-10 rounded-full" />
                        ) : (
                          <Text className="font-bold text-neutral-600">
                            {post.user?.name?.charAt(0) || '?'}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="font-semibold text-black">{post.user?.name || 'Usuario'}</Text>
                        <Text className="text-xs text-neutral-500">
                          {post.user?.username ? `@${post.user.username} - ` : ''}{formatTimeAgo(post.created_at)}
                        </Text>
                      </View>
                    </View>

                    {/* Match Result Content */}
                    {post.type === 'match_result' && post.sport && (
                      <View className={`${post.result === 'victory' ? 'bg-lime-50' : post.result === 'defeat' ? 'bg-red-50' : 'bg-neutral-50'} rounded-xl p-4 mb-3`}>
                        <View className="flex-row items-center gap-2 mb-2">
                          <MaterialIcons name="sports-tennis" size={16} color={post.result === 'victory' ? '#84CC16' : '#6B7280'} />
                          <Text className="text-sm font-medium text-neutral-700">{post.sport}</Text>
                          {post.result && (
                            <View className={`px-2 py-0.5 ${resultColors.bg} rounded-full`}>
                              <Text className={`text-xs font-bold ${resultColors.text}`}>
                                {getResultLabel(post.result)}
                              </Text>
                            </View>
                          )}
                        </View>
                        {post.score && <Text className="text-2xl font-bold text-black">{post.score}</Text>}
                        {post.venue && <Text className="text-sm text-neutral-600 mt-1">{post.venue}</Text>}
                        {post.duration && (
                          <View className="flex-row items-center gap-1 mt-1">
                            <MaterialIcons name="timer" size={12} color="#737373" />
                            <Text className="text-xs text-neutral-500">{post.duration}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Text Content */}
                    {post.content && (
                      <Text className="text-sm text-neutral-700 mb-3">{post.content}</Text>
                    )}

                    {/* Actions */}
                    <View className="flex-row items-center gap-4">
                      <Pressable
                        onPress={() => toggleLike(post.id)}
                        className="flex-row items-center gap-1.5"
                      >
                        <MaterialIcons
                          name={isLiked ? "favorite" : "favorite-border"}
                          size={20}
                          color={isLiked ? "#EF4444" : "#525252"}
                        />
                        <Text className="text-sm text-neutral-600">{post.likes_count}</Text>
                      </Pressable>
                      <Pressable className="flex-row items-center gap-1.5">
                        <MaterialIcons name="chat-bubble-outline" size={20} color="#525252" />
                        <Text className="text-sm text-neutral-600">{post.comments_count}</Text>
                      </Pressable>
                      <Pressable className="flex-row items-center gap-1.5">
                        <MaterialIcons name="share" size={20} color="#525252" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Matches Tab */}
        {activeTab === 1 && (
          <View className="p-5 gap-3">
            {matchesLoading ? (
              <View className="py-20 items-center">
                <ActivityIndicator size="large" color="#000" />
              </View>
            ) : matches.length === 0 ? (
              <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
                <MaterialIcons name="sports-tennis" size={48} color="#A3A3A3" />
                <Text className="text-lg font-semibold text-neutral-700 mt-4">Nenhuma partida aberta</Text>
                <Text className="text-sm text-neutral-500 text-center mt-2">
                  Crie uma partida para encontrar jogadores!
                </Text>
                <Pressable
                  onPress={() => router.push('/match/create' as any)}
                  className="mt-4 px-6 py-3 bg-black rounded-xl"
                >
                  <Text className="text-sm font-semibold text-white">Criar partida</Text>
                </Pressable>
              </View>
            ) : matches.map((match: Match) => (
              <Pressable
                key={match.id}
                onPress={() => router.push(`/match/${match.id}` as any)}
                className="bg-white rounded-2xl border border-neutral-200 p-4"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View>
                    <Text className="font-semibold text-black">{match.title}</Text>
                    <Text className="text-xs text-neutral-500 mt-0.5">
                      {new Date(match.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {match.start_time && ` - ${match.start_time.slice(0, 5)}`}
                    </Text>
                  </View>
                  <View className="px-3 py-1 bg-lime-100 rounded-full">
                    <Text className="text-xs font-medium text-lime-800">
                      {match.current_players}/{match.max_players}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4 mb-3">
                  {match.location_name && (
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons name="location-on" size={14} color="#737373" />
                      <Text className="text-sm text-neutral-600" numberOfLines={1}>{match.location_name}</Text>
                    </View>
                  )}
                  {(match as any).skill_level && (
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons name="signal-cellular-alt" size={14} color="#737373" />
                      <Text className="text-sm text-neutral-600">{(match as any).skill_level}</Text>
                    </View>
                  )}
                </View>

                {match.current_players < match.max_players && (
                  <View className="flex-row justify-end">
                    <Pressable
                      onPress={(e) => handleJoinMatch(match.id, e)}
                      disabled={joiningMatchId === match.id}
                      className={`px-4 py-2 rounded-xl ${joiningMatchId === match.id ? 'bg-neutral-400' : 'bg-black'}`}
                    >
                      {joiningMatchId === match.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-sm font-semibold text-white">Entrar</Text>
                      )}
                    </Pressable>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Tournaments Tab */}
        {activeTab === 2 && (
          <View className="p-5">
            {/* Create Tournament Banner */}
            <Pressable
              onPress={() => router.push('/tournament/create' as any)}
              className="mb-4 rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={['#171717', '#262626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-4 flex-row items-center"
              >
                <View className="w-12 h-12 bg-amber-500/20 rounded-xl items-center justify-center">
                  <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
                </View>
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-bold text-white">Criar Torneio</Text>
                    <View className="px-2 py-0.5 bg-amber-500 rounded">
                      <Text className="text-[10px] font-bold text-black">PRO</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-neutral-400">Organize seu proprio campeonato</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#F59E0B" />
              </LinearGradient>
            </Pressable>

            {/* Empty state for tournaments */}
            <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
              <MaterialIcons name="emoji-events" size={48} color="#A3A3A3" />
              <Text className="text-lg font-semibold text-neutral-700 mt-4">Nenhum torneio disponivel</Text>
              <Text className="text-sm text-neutral-500 text-center mt-2">
                Em breve voce podera participar de torneios aqui!
              </Text>
            </View>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
