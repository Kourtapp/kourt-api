import { View, Text, ScrollView, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSocialPostsStore, SocialPost } from '@/stores/socialPostsStore';

const tabs = ['Feed', 'Partidas', 'Torneios'];

const mockFeed = [
  {
    id: '1',
    user: { name: 'Pedro Ferreira', avatar: null, username: '@pedrotennis' },
    type: 'match_result',
    content: {
      sport: 'Beach Tennis',
      result: 'Vitória',
      score: '6-4, 6-3',
      opponent: 'João Silva',
      court: 'Arena Beach Tennis',
    },
    likes: 12,
    comments: 3,
    time: '2h',
  },
  {
    id: '2',
    user: { name: 'Marina Santos', avatar: null, username: '@marinapadel' },
    type: 'achievement',
    content: {
      title: 'Primeira Vitória',
      description: 'Conquistou sua primeira vitória no Padel!',
      icon: 'emoji-events',
    },
    likes: 24,
    comments: 8,
    time: '5h',
  },
];

const mockMatches = [
  {
    id: '1',
    title: 'Beach Tennis Casual',
    sport: 'Beach Tennis',
    time: 'Hoje, 18:00',
    location: 'Arena Beach Tennis',
    spots: '3/4',
    level: 'Intermediário',
    organizer: 'Pedro F.',
  },
  {
    id: '2',
    title: 'Padel Duplas',
    sport: 'Padel',
    time: 'Amanhã, 10:00',
    location: 'Padel Club SP',
    spots: '2/4',
    level: 'Iniciante',
    organizer: 'Marina S.',
  },
];

const mockTournaments = [
  {
    id: '1',
    title: 'Copa Beach Tennis SP',
    sport: 'Beach Tennis',
    date: '15-17 Dez',
    location: 'Arena Beach Ibirapuera',
    prize: 'R$ 5.000',
    participants: 32,
    maxParticipants: 64,
    entryFee: 'R$ 150',
    level: 'Todos os níveis',
    isPro: true,
    status: 'inscricoes_abertas',
  },
  {
    id: '2',
    title: 'Torneio Padel Iniciantes',
    sport: 'Padel',
    date: '20 Dez',
    location: 'Padel Club Jardins',
    prize: null,
    participants: 12,
    maxParticipants: 16,
    entryFee: 'Grátis',
    level: 'Iniciante',
    isPro: false,
    status: 'inscricoes_abertas',
  },
  {
    id: '3',
    title: 'Circuito Verão Beach Tennis',
    sport: 'Beach Tennis',
    date: '5-7 Jan',
    location: 'Riviera Beach Club',
    prize: 'R$ 10.000',
    participants: 48,
    maxParticipants: 64,
    entryFee: 'R$ 200',
    level: 'Intermediário+',
    isPro: true,
    status: 'em_breve',
  },
  {
    id: '4',
    title: 'Torneio Social Tênis',
    sport: 'Tênis',
    date: '22 Dez',
    location: 'Clube Harmonia',
    prize: null,
    participants: 8,
    maxParticipants: 16,
    entryFee: 'R$ 50',
    level: 'Todos os níveis',
    isPro: false,
    status: 'inscricoes_abertas',
  },
];

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Todos']);
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const { posts: userPosts, likePost, unlikePost } = useSocialPostsStore();

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
  const getResultLabel = (result: string) => {
    switch (result) {
      case 'victory': return 'Vitória';
      case 'defeat': return 'Derrota';
      case 'draw': return 'Empate';
      default: return result;
    }
  };

  // Get result color
  const getResultColor = (result: string) => {
    switch (result) {
      case 'victory': return { bg: 'bg-lime-500', text: 'text-lime-950' };
      case 'defeat': return { bg: 'bg-red-500', text: 'text-white' };
      case 'draw': return { bg: 'bg-neutral-500', text: 'text-white' };
      default: return { bg: 'bg-neutral-500', text: 'text-white' };
    }
  };

  // Handle like toggle
  const handleLike = (postId: string, isUserPost: boolean) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(prev => prev.filter(id => id !== postId));
      if (isUserPost) unlikePost(postId);
    } else {
      setLikedPosts(prev => [...prev, postId]);
      if (isUserPost) likePost(postId);
    }
  };

  // Filter tournaments based on selected filters
  const filteredTournaments = useMemo(() => {
    if (selectedFilters.includes('Todos')) {
      return mockTournaments;
    }

    return mockTournaments.filter((tournament) => {
      // Check sport filters
      if (selectedFilters.includes(tournament.sport)) {
        return true;
      }
      // Check "Grátis" filter
      if (selectedFilters.includes('Grátis') && tournament.entryFee === 'Grátis') {
        return true;
      }
      return false;
    });
  }, [selectedFilters]);

  // Handle tournament registration
  const handleRegister = (tournament: typeof mockTournaments[0]) => {
    if (registeredTournaments.includes(tournament.id)) {
      Alert.alert(
        'Já inscrito',
        `Você já está inscrito no ${tournament.title}`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmar Inscrição',
      `Deseja se inscrever no ${tournament.title}?\n\nTaxa: ${tournament.entryFee}\nData: ${tournament.date}\nLocal: ${tournament.location}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setRegisteredTournaments((prev) => [...prev, tournament.id]);
            Alert.alert(
              'Inscrição Confirmada! ✅',
              `Você está inscrito no ${tournament.title}. Boa sorte!`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const toggleFilter = (filter: string) => {
    if (filter === 'Todos') {
      setSelectedFilters(['Todos']);
      return;
    }

    setSelectedFilters((prev) => {
      // If clicking other filter, remove 'Todos'
      const withoutTodos = prev.filter((f) => f !== 'Todos');

      if (prev.includes(filter)) {
        const newFilters = withoutTodos.filter((f) => f !== filter);
        return newFilters.length === 0 ? ['Todos'] : newFilters;
      } else {
        return [...withoutTodos, filter];
      }
    });
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
            className={`flex-1 py-3 items-center border-b-2 ${activeTab === index ? 'border-black' : 'border-transparent'
              }`}
          >
            <Text
              className={`text-sm font-medium ${activeTab === index ? 'text-black' : 'text-neutral-500'
                }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Feed Tab */}
        {activeTab === 0 && (
          <View className="p-5 gap-4">
            {/* User Posts from Store */}
            {userPosts.map((post) => {
              const resultColors = getResultColor(post.result);
              const isLiked = likedPosts.includes(post.id);
              return (
                <View
                  key={post.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
                >
                  {/* Photo if available */}
                  {post.photo && (
                    <View className="relative">
                      <Image
                        source={{ uri: post.photo }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                      {/* Kourt watermark */}
                      <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-lg flex-row items-center">
                        <View className="w-4 h-4 bg-lime-500 rounded items-center justify-center mr-1.5">
                          <Text className="text-[8px] font-black text-black">K</Text>
                        </View>
                        <Text className="text-white font-bold text-[10px]">KOURT</Text>
                      </View>
                      {/* XP earned badge */}
                      <View className="absolute top-2 right-2 bg-lime-500 px-2 py-1 rounded-full flex-row items-center">
                        <MaterialIcons name="bolt" size={12} color="#1A2E05" />
                        <Text className="text-[10px] font-bold text-lime-950 ml-0.5">+{post.xpEarned} XP</Text>
                      </View>
                    </View>
                  )}

                  <View className="p-4">
                    {/* Header */}
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-neutral-300 rounded-full items-center justify-center">
                        {post.user.avatar ? (
                          <Image source={{ uri: post.user.avatar }} className="w-10 h-10 rounded-full" />
                        ) : (
                          <Text className="font-bold text-neutral-600">
                            {post.user.name.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="font-semibold text-black">
                          {post.user.name}
                        </Text>
                        <Text className="text-xs text-neutral-500">
                          {post.user.username || ''} {post.user.username ? '• ' : ''}{formatTimeAgo(post.createdAt)}
                        </Text>
                      </View>
                      <Pressable>
                        <MaterialIcons name="more-horiz" size={20} color="#A3A3A3" />
                      </Pressable>
                    </View>

                    {/* Match Result Content */}
                    <View className={`${post.result === 'victory' ? 'bg-lime-50' : post.result === 'defeat' ? 'bg-red-50' : 'bg-neutral-50'} rounded-xl p-4 mb-3`}>
                      <View className="flex-row items-center gap-2 mb-2">
                        <MaterialIcons name="sports-tennis" size={16} color={post.result === 'victory' ? '#84CC16' : post.result === 'defeat' ? '#EF4444' : '#6B7280'} />
                        <Text className={`text-sm font-medium ${post.result === 'victory' ? 'text-lime-900' : post.result === 'defeat' ? 'text-red-900' : 'text-neutral-700'}`}>
                          {post.sport}
                        </Text>
                        <View className={`px-2 py-0.5 ${resultColors.bg} rounded-full`}>
                          <Text className={`text-xs font-bold ${resultColors.text}`}>
                            {getResultLabel(post.result)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-2xl font-bold text-black">{post.score}</Text>
                      <Text className="text-sm text-neutral-600 mt-1">{post.venue}</Text>
                      {post.duration && (
                        <View className="flex-row items-center gap-1 mt-1">
                          <MaterialIcons name="timer" size={12} color="#737373" />
                          <Text className="text-xs text-neutral-500">{post.duration}</Text>
                        </View>
                      )}
                      {/* Display metrics if available */}
                      {post.metrics && Object.keys(post.metrics).length > 0 && (
                        <View className="flex-row flex-wrap gap-2 mt-2 pt-2 border-t border-neutral-200">
                          {Object.entries(post.metrics)
                            .filter(([_, value]) => value && value !== '0')
                            .slice(0, 4)
                            .map(([key, value]) => (
                              <View key={key} className="bg-white/70 px-2 py-1 rounded">
                                <Text className="text-[10px] text-neutral-600">
                                  {key.replace(/_/g, ' ')}: <Text className="font-bold">{value}</Text>
                                </Text>
                              </View>
                            ))}
                        </View>
                      )}
                    </View>

                    {/* Description if available */}
                    {post.description && (
                      <Text className="text-sm text-neutral-700 mb-3">{post.description}</Text>
                    )}

                    {/* Actions */}
                    <View className="flex-row items-center gap-4">
                      <Pressable
                        onPress={() => handleLike(post.id, true)}
                        className="flex-row items-center gap-1.5"
                      >
                        <MaterialIcons
                          name={isLiked ? "favorite" : "favorite-border"}
                          size={20}
                          color={isLiked ? "#EF4444" : "#525252"}
                        />
                        <Text className="text-sm text-neutral-600">
                          {post.likes + (isLiked ? 1 : 0)}
                        </Text>
                      </Pressable>
                      <Pressable className="flex-row items-center gap-1.5">
                        <MaterialIcons name="chat-bubble-outline" size={20} color="#525252" />
                        <Text className="text-sm text-neutral-600">{post.comments}</Text>
                      </Pressable>
                      <Pressable className="flex-row items-center gap-1.5">
                        <MaterialIcons name="share" size={20} color="#525252" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Mock Feed Posts */}
            {mockFeed.map((post) => (
              <View
                key={post.id}
                className="bg-white rounded-2xl border border-neutral-200 p-4"
              >
                {/* Header */}
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-neutral-300 rounded-full items-center justify-center">
                    <MaterialIcons name="person" size={20} color="#525252" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-black">
                      {post.user.name}
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      {post.user.username} • {post.time}
                    </Text>
                  </View>
                  <Pressable>
                    <MaterialIcons
                      name="more-horiz"
                      size={20}
                      color="#A3A3A3"
                    />
                  </Pressable>
                </View>

                {/* Content */}
                {post.type === 'match_result' && (
                  <View className="bg-lime-50 rounded-xl p-4 mb-3">
                    <View className="flex-row items-center gap-2 mb-2">
                      <MaterialIcons
                        name="sports-tennis"
                        size={16}
                        color="#84CC16"
                      />
                      <Text className="text-sm font-medium text-lime-900">
                        {post.content.sport}
                      </Text>
                      <View className="px-2 py-0.5 bg-lime-500 rounded-full">
                        <Text className="text-xs font-bold text-lime-950">
                          {post.content.result}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-lg font-bold text-black">
                      {post.content.score}
                    </Text>
                    <Text className="text-sm text-neutral-600">
                      vs {post.content.opponent}
                    </Text>
                    <Text className="text-xs text-neutral-500 mt-1">
                      {post.content.court}
                    </Text>
                  </View>
                )}

                {post.type === 'achievement' && (
                  <View className="bg-amber-50 rounded-xl p-4 mb-3 flex-row items-center">
                    <View className="w-12 h-12 bg-amber-500 rounded-xl items-center justify-center">
                      <MaterialIcons
                        name={post.content.icon as any}
                        size={24}
                        color="#FFF"
                      />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="font-bold text-black">
                        {post.content.title}
                      </Text>
                      <Text className="text-sm text-neutral-600">
                        {post.content.description}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row items-center gap-4">
                  <Pressable
                    onPress={() => handleLike(post.id, false)}
                    className="flex-row items-center gap-1.5"
                  >
                    <MaterialIcons
                      name={likedPosts.includes(post.id) ? "favorite" : "favorite-border"}
                      size={20}
                      color={likedPosts.includes(post.id) ? "#EF4444" : "#525252"}
                    />
                    <Text className="text-sm text-neutral-600">
                      {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                    </Text>
                  </Pressable>
                  <Pressable className="flex-row items-center gap-1.5">
                    <MaterialIcons
                      name="chat-bubble-outline"
                      size={20}
                      color="#525252"
                    />
                    <Text className="text-sm text-neutral-600">
                      {post.comments}
                    </Text>
                  </Pressable>
                  <Pressable className="flex-row items-center gap-1.5">
                    <MaterialIcons name="share" size={20} color="#525252" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Matches Tab */}
        {activeTab === 1 && (
          <View className="p-5 gap-3">
            {mockMatches.map((match) => (
              <Pressable
                key={match.id}
                onPress={() => router.push(`/match/${match.id}` as any)}
                className="bg-white rounded-2xl border border-neutral-200 p-4"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View>
                    <Text className="font-semibold text-black">
                      {match.title}
                    </Text>
                    <Text className="text-xs text-neutral-500 mt-0.5">
                      {match.time}
                    </Text>
                  </View>
                  <View className="px-3 py-1 bg-lime-100 rounded-full">
                    <Text className="text-xs font-medium text-lime-800">
                      {match.spots}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4 mb-3">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcons
                      name="location-on"
                      size={14}
                      color="#737373"
                    />
                    <Text className="text-sm text-neutral-600">
                      {match.location}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcons
                      name="signal-cellular-alt"
                      size={14}
                      color="#737373"
                    />
                    <Text className="text-sm text-neutral-600">
                      {match.level}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="w-6 h-6 bg-neutral-200 rounded-full" />
                    <Text className="text-xs text-neutral-500">
                      Por {match.organizer}
                    </Text>
                  </View>
                  <Pressable className="px-4 py-2 bg-black rounded-xl">
                    <Text className="text-sm font-semibold text-white">
                      Entrar
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Tournaments Tab */}
        {activeTab === 2 && (
          <View className="p-5">
            {/* Create Tournament Banner (PRO) */}
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
                  <Text className="text-sm text-neutral-400">Organize seu próprio campeonato</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#F59E0B" />
              </LinearGradient>
            </Pressable>

            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {['Todos', 'Beach Tennis', 'Padel', 'Tênis', 'Grátis'].map((filter) => {
                  const isSelected = selectedFilters.includes(filter);
                  return (
                    <Pressable
                      key={filter}
                      onPress={() => toggleFilter(filter)}
                      className={`px-4 py-2 rounded-full ${isSelected ? 'bg-black' : 'bg-white border border-neutral-200'
                        }`}
                    >
                      <Text
                        className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-neutral-700'
                          }`}
                      >
                        {filter}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Tournaments list */}
            <View className="gap-4">
              {filteredTournaments.length === 0 ? (
                <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
                  <MaterialIcons name="search-off" size={40} color="#A3A3A3" />
                  <Text className="text-base font-semibold text-neutral-700 mt-3">Nenhum torneio encontrado</Text>
                  <Text className="text-sm text-neutral-500 text-center mt-1">Tente mudar os filtros para encontrar torneios</Text>
                </View>
              ) : filteredTournaments.map((tournament) => (
                <Pressable
                  key={tournament.id}
                  onPress={() => router.push(`/tournament/${tournament.id}` as any)}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
                >
                  {/* Tournament header image placeholder */}
                  <View className="h-32 bg-neutral-200 items-center justify-center relative">
                    <MaterialIcons name="emoji-events" size={40} color="#A3A3A3" />
                    {tournament.isPro && (
                      <View className="absolute top-3 right-3 px-2 py-1 bg-amber-500 rounded-full">
                        <Text className="text-[10px] font-bold text-black">PRO</Text>
                      </View>
                    )}
                    {tournament.status === 'inscricoes_abertas' && (
                      <View className="absolute top-3 left-3 px-2 py-1 bg-lime-500 rounded-full">
                        <Text className="text-[10px] font-bold text-white">Inscrições Abertas</Text>
                      </View>
                    )}
                    {tournament.status === 'em_breve' && (
                      <View className="absolute top-3 left-3 px-2 py-1 bg-blue-500 rounded-full">
                        <Text className="text-[10px] font-bold text-white">Em Breve</Text>
                      </View>
                    )}
                  </View>

                  <View className="p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-black">{tournament.title}</Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <MaterialIcons name="sports-tennis" size={14} color="#737373" />
                          <Text className="text-sm text-neutral-500">{tournament.sport}</Text>
                          <Text className="text-neutral-300">•</Text>
                          <Text className="text-sm text-neutral-500">{tournament.level}</Text>
                        </View>
                      </View>
                      {tournament.prize && (
                        <View className="px-3 py-1.5 bg-amber-100 rounded-lg">
                          <Text className="text-sm font-bold text-amber-700">{tournament.prize}</Text>
                        </View>
                      )}
                    </View>

                    {/* Info row */}
                    <View className="flex-row items-center gap-4 mb-3">
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="event" size={14} color="#737373" />
                        <Text className="text-sm text-neutral-600">{tournament.date}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="place" size={14} color="#737373" />
                        <Text className="text-sm text-neutral-600" numberOfLines={1}>{tournament.location}</Text>
                      </View>
                    </View>

                    {/* Participants bar */}
                    <View className="mb-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-xs text-neutral-500">Participantes</Text>
                        <Text className="text-xs font-medium text-neutral-700">
                          {tournament.participants}/{tournament.maxParticipants}
                        </Text>
                      </View>
                      <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-lime-500 rounded-full"
                          style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                        />
                      </View>
                    </View>

                    {/* Bottom row */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="confirmation-number" size={16} color="#84CC16" />
                        <Text className={`text-sm font-semibold ${tournament.entryFee === 'Grátis' ? 'text-lime-600' : 'text-neutral-700'}`}>
                          {tournament.entryFee}
                        </Text>
                      </View>
                      {registeredTournaments.includes(tournament.id) ? (
                        <View className="flex-row items-center gap-1 px-4 py-2 bg-lime-100 rounded-xl">
                          <MaterialIcons name="check-circle" size={16} color="#22C55E" />
                          <Text className="text-sm font-semibold text-lime-700">Inscrito</Text>
                        </View>
                      ) : (
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            if (tournament.status === 'inscricoes_abertas') {
                              handleRegister(tournament);
                            } else {
                              router.push(`/tournament/${tournament.id}` as any);
                            }
                          }}
                          className="px-4 py-2 bg-black rounded-xl"
                        >
                          <Text className="text-sm font-semibold text-white">
                            {tournament.status === 'inscricoes_abertas' ? 'Inscrever-se' : 'Ver detalhes'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
