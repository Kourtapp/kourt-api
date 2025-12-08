import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { Profile, Match } from '@/types/database.types';
import { useAuthStore } from '@/stores/authStore';

type RecentMatch = {
  id: string;
  sport: string;
  result: 'victory' | 'defeat' | 'draw';
  opponent: string;
  score: string;
  date: string;
};


export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchRecentMatches();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentMatches = async () => {
    try {
      // Fetch matches where this user participated
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`created_by.eq.${id}`)
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Transform to RecentMatch format
      const matches: RecentMatch[] = (data || []).map((m: any) => ({
        id: m.id,
        sport: m.sport || 'Beach Tennis',
        result: m.winner_id === id ? 'victory' : (m.winner_id ? 'defeat' : 'draw'),
        opponent: 'Adversário',
        score: m.final_score || '-',
        date: new Date(m.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
      }));

      setRecentMatches(matches);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow/unfollow API
  };

  const handleMessage = () => {
    router.push(`/chat/${id}` as any);
  };

  const handleInvite = () => {
    router.push('/match/create' as any);
  };

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'beach-tennis':
      case 'padel':
      case 'tênis':
        return 'sports-tennis';
      case 'futebol':
        return 'sports-soccer';
      case 'vôlei':
        return 'sports-volleyball';
      case 'basquete':
        return 'sports-basketball';
      default:
        return 'sports';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      case 'pro':
        return 'Profissional';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <MaterialIcons name="person-off" size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-500">Perfil não encontrado</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-gray-100 rounded-xl"
        >
          <Text className="text-gray-700 font-medium">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      {/* Header with gradient */}
      <LinearGradient
        colors={['#1F2937', '#111827']}
        className="pt-2 pb-6"
      >
        {/* Navigation */}
        <View className="flex-row items-center justify-between px-4 mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <MaterialIcons name="more-vert" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="items-center px-4">
          {/* Avatar */}
          <View className="w-24 h-24 rounded-full bg-gray-600 items-center justify-center mb-3 border-4 border-white/20">
            {profile.avatar_url ? (
              <View className="w-full h-full rounded-full bg-gray-400" />
            ) : (
              <Text className="text-white text-3xl font-bold">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>

          {/* Name & Username */}
          <View className="flex-row items-center mb-1">
            <Text className="text-xl font-bold text-white">{profile.name}</Text>
            {profile.is_pro && (
              <View className="ml-2 px-2 py-0.5 bg-[#22C55E] rounded">
                <Text className="text-white text-xs font-bold">PRO</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-400 mb-2">@{profile.username}</Text>

          {/* Location */}
          {profile.city && (
            <View className="flex-row items-center mb-4">
              <MaterialIcons name="location-on" size={14} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm ml-1">
                {profile.neighborhood ? `${profile.neighborhood}, ` : ''}{profile.city}
              </Text>
            </View>
          )}

          {/* Stats Row */}
          <View className="flex-row items-center justify-center space-x-8 mb-4">
            <TouchableOpacity className="items-center">
              <Text className="text-xl font-bold text-white">
                {profile.following_count || 0}
              </Text>
              <Text className="text-xs text-gray-400">Seguindo</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Text className="text-xl font-bold text-white">
                {profile.followers_count || 0}
              </Text>
              <Text className="text-xs text-gray-400">Seguidores</Text>
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-xl font-bold text-white">
                {profile.total_matches || 0}
              </Text>
              <Text className="text-xs text-gray-400">Partidas</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity
                onPress={handleFollow}
                className={`flex-1 py-3 rounded-xl items-center ${
                  isFollowing ? 'bg-white/10' : 'bg-[#22C55E]'
                }`}
              >
                <Text className={`font-semibold ${
                  isFollowing ? 'text-white' : 'text-white'
                }`}>
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMessage}
                className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center"
              >
                <MaterialIcons name="chat" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleInvite}
                className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center"
              >
                <MaterialIcons name="person-add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Bio */}
        {profile.bio && (
          <View className="px-4 py-4 border-b border-gray-100">
            <Text className="text-gray-700">{profile.bio}</Text>
          </View>
        )}

        {/* Level & XP */}
        <View className="px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-500">Nível {profile.level}</Text>
            <Text className="text-sm text-gray-400">
              {profile.xp}/{profile.xp_to_next_level} XP
            </Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-[#22C55E] rounded-full"
              style={{ width: `${(profile.xp / profile.xp_to_next_level) * 100}%` }}
            />
          </View>
        </View>

        {/* Sports */}
        <View className="px-4 py-4 border-b border-gray-100">
          <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Esportes
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {profile.sports?.map((sport) => (
              <View
                key={sport}
                className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full"
              >
                <MaterialIcons
                  name={getSportIcon(sport) as any}
                  size={16}
                  color="#22C55E"
                />
                <Text className="ml-2 text-sm text-gray-700 capitalize">
                  {sport.replace('-', ' ')}
                </Text>
                {profile.sport_levels?.[sport] && (
                  <Text className="ml-1 text-xs text-gray-400">
                    • {getLevelLabel(profile.sport_levels[sport])}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View className="px-4 py-4 border-b border-gray-100">
          <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Estatísticas
          </Text>
          <View className="flex-row">
            <View className="flex-1 items-center py-3 bg-gray-50 rounded-xl mr-2">
              <Text className="text-2xl font-bold text-gray-900">{profile.wins}</Text>
              <Text className="text-xs text-gray-500">Vitórias</Text>
            </View>
            <View className="flex-1 items-center py-3 bg-gray-50 rounded-xl mr-2">
              <Text className="text-2xl font-bold text-gray-900">{profile.win_rate}%</Text>
              <Text className="text-xs text-gray-500">Taxa Vitória</Text>
            </View>
            <View className="flex-1 items-center py-3 bg-gray-50 rounded-xl">
              <View className="flex-row items-center">
                <MaterialIcons name="local-fire-department" size={20} color="#F59E0B" />
                <Text className="text-2xl font-bold text-gray-900 ml-1">{profile.streak}</Text>
              </View>
              <Text className="text-xs text-gray-500">Sequência</Text>
            </View>
          </View>
        </View>

        {/* Recent Matches */}
        <View className="px-4 py-4">
          <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Partidas Recentes
          </Text>
          {recentMatches.length === 0 ? (
            <View className="py-8 items-center">
              <MaterialIcons name="sports-tennis" size={32} color="#D1D5DB" />
              <Text className="text-sm text-gray-400 mt-2">Nenhuma partida registrada</Text>
            </View>
          ) : (
            recentMatches.map((match) => {
              const isVictory = match.result === 'victory';
              const isDefeat = match.result === 'defeat';
              const resultLabel = isVictory ? 'Vitória' : isDefeat ? 'Derrota' : 'Empate';
              return (
                <View
                  key={match.id}
                  className="flex-row items-center py-3 border-b border-gray-100"
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${
                    isVictory ? 'bg-green-100' : isDefeat ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <MaterialIcons
                      name={isVictory ? 'emoji-events' : isDefeat ? 'close' : 'remove'}
                      size={20}
                      color={isVictory ? '#22C55E' : isDefeat ? '#EF4444' : '#6B7280'}
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                      <Text className="font-medium text-gray-900">{match.sport}</Text>
                      <View className={`ml-2 px-2 py-0.5 rounded ${
                        isVictory ? 'bg-green-100' : isDefeat ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          isVictory ? 'text-green-700' : isDefeat ? 'text-red-700' : 'text-gray-700'
                        }`}>
                          {resultLabel}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-500">
                      {match.score !== '-' && `${match.score}`}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-400">{match.date}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
