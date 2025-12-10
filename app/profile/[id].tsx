import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database.types';
import { useAuthStore } from '@/stores/authStore';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('Beach Tennis');

  // Mock weekly stats
  const weeklyStats = {
    partidas: 5,
    tempo: '4h 20m',
    winRate: '72%',
  };

  const chartData = [
    { month: 'OCT', value: 65 },
    { month: 'NOV', value: 85 },
    { month: 'DEC', value: 70 },
  ];

  useEffect(() => {
    fetchProfile();
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

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    router.push(`/chat/${id}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <MaterialIcons name="person-off" size={48} color="#9CA3AF" />
        <Text className="mt-4 text-neutral-500">Perfil não encontrado</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-neutral-100 rounded-full"
        >
          <Text className="text-black font-medium">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isOwnProfile = user?.id === profile.id;
  const sports = profile.sports || ['Beach Tennis', 'Padel'];
  const location = profile.city
    ? `${profile.city}${profile.neighborhood ? `, ${profile.neighborhood}` : ''} · Brasil`
    : 'São Paulo, SP · Brasil';

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity>
            <MaterialIcons name="ios-share" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="more-horiz" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-neutral-100 px-5 pb-6">
          <View className="flex-row items-start">
            {/* Avatar */}
            <View className="relative">
              <View className="w-28 h-28 rounded-3xl bg-neutral-200 items-center justify-center overflow-hidden border border-neutral-300">
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                ) : (
                  <MaterialIcons name="person" size={48} color="#A3A3A3" />
                )}
              </View>
              {/* Settings icon */}
              <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-black rounded-full items-center justify-center">
                <MaterialIcons name="settings" size={16} color="#fff" />
              </View>
            </View>

            {/* Name and Location */}
            <View className="flex-1 ml-4 pt-2">
              {profile.is_pro && (
                <Text className="text-xs font-bold text-neutral-500 mb-1">PRO</Text>
              )}
              <Text className="text-2xl font-bold text-black">
                {profile.name || 'Usuário'}
              </Text>
              <Text className="text-neutral-500">{location}</Text>
            </View>
          </View>

          {/* Username */}
          <Text className="text-neutral-500 mt-4">@{profile.username || 'usuario'}</Text>

          {/* Stats */}
          <View className="flex-row mt-4 gap-8">
            <TouchableOpacity onPress={() => router.push(`/profile/followers?id=${id}&tab=following` as any)}>
              <Text className="text-xs text-neutral-500">Seguindo</Text>
              <Text className="text-2xl font-bold text-black">
                {profile.following_count || 234}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/profile/followers?id=${id}&tab=followers` as any)}>
              <Text className="text-xs text-neutral-500">Seguidores</Text>
              <Text className="text-2xl font-bold text-black">
                {(profile.followers_count || 1892).toLocaleString('pt-BR')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={handleFollow}
                className={`flex-1 py-4 rounded-full items-center ${
                  isFollowing ? 'bg-neutral-200' : 'bg-black'
                }`}
              >
                <Text className={`font-bold ${isFollowing ? 'text-black' : 'text-white'}`}>
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMessage}
                className="w-14 h-14 bg-neutral-200 rounded-full items-center justify-center"
              >
                <MaterialIcons name="chat-bubble-outline" size={24} color="#525252" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* White background content */}
        <View className="bg-white">
          {/* Media Gallery Placeholder */}
          <View className="px-5 py-6">
            <View className="flex-row gap-2">
              {[1, 2, 3].map((item) => (
                <View
                  key={item}
                  className="flex-1 aspect-square bg-neutral-100 rounded-2xl items-center justify-center"
                >
                  <MaterialIcons
                    name={item === 2 ? 'play-circle-outline' : 'image'}
                    size={32}
                    color="#A3A3A3"
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Sports Tags */}
          <View className="px-5 mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {sports.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    onPress={() => setSelectedSport(sport)}
                    className={`flex-row items-center px-4 py-3 rounded-full ${
                      selectedSport === sport ? 'bg-black' : 'bg-white border border-neutral-200'
                    }`}
                  >
                    <MaterialIcons
                      name="sports-tennis"
                      size={18}
                      color={selectedSport === sport ? '#fff' : '#525252'}
                    />
                    <Text
                      className={`ml-2 font-medium ${
                        selectedSport === sport ? 'text-white' : 'text-black'
                      }`}
                    >
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* This Week Stats */}
          <View className="mx-5 mb-6 p-4 bg-white rounded-2xl border border-neutral-200">
            <Text className="text-lg font-bold text-black mb-4">This week</Text>

            <View className="flex-row mb-6">
              <View className="flex-1">
                <Text className="text-xs text-neutral-500">Partidas</Text>
                <Text className="text-2xl font-bold text-black">{weeklyStats.partidas}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-neutral-500">Tempo</Text>
                <Text className="text-2xl font-bold text-black">{weeklyStats.tempo}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-neutral-500">Win Rate</Text>
                <Text className="text-2xl font-bold text-black">{weeklyStats.winRate}</Text>
              </View>
            </View>

            {/* Simple Chart */}
            <View className="h-24 flex-row items-end justify-around">
              {chartData.map((point, index) => (
                <View key={index} className="items-center flex-1">
                  <View
                    className="w-1 bg-orange-400 rounded-full"
                    style={{ height: point.value }}
                  />
                </View>
              ))}
            </View>
            <View className="flex-row justify-around mt-2">
              {chartData.map((point, index) => (
                <Text key={index} className="text-xs text-neutral-400 flex-1 text-center">
                  {point.month}
                </Text>
              ))}
            </View>
          </View>

          <View className="h-8" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
