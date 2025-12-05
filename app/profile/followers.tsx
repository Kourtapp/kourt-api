import React, { useState } from 'react';
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
import { useFollowers, useFollowing } from '@/hooks/useFollow';
import { useAuthStore } from '@/stores/authStore';
import { followService } from '@/services/followService';

type Tab = 'followers' | 'following';

export default function FollowersScreen() {
  const { userId, tab: initialTab } = useLocalSearchParams<{ userId: string; tab?: string }>();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>((initialTab as Tab) || 'followers');

  const { followers, loading: loadingFollowers } = useFollowers(userId || '');
  const { following, loading: loadingFollowing } = useFollowing(userId || '');

  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    const loadMyFollowing = async () => {
      if (!user) return;
      const myFollowing = await followService.getFollowing(user.id);
      setFollowingIds(new Set(myFollowing.map(f => f.profile.id)));
    };
    loadMyFollowing();
  }, [user]);

  const handleFollow = async (targetId: string) => {
    if (!user) return;

    const isFollowing = followingIds.has(targetId);
    const newFollowingIds = new Set(followingIds);

    if (isFollowing) {
      newFollowingIds.delete(targetId);
      await followService.unfollow(user.id, targetId);
    } else {
      newFollowingIds.add(targetId);
      await followService.follow(user.id, targetId);
    }

    setFollowingIds(newFollowingIds);
  };

  const data = activeTab === 'followers' ? followers : following;
  const loading = activeTab === 'followers' ? loadingFollowers : loadingFollowing;

  const PlayerAvatar = ({ name }: { name: string }) => (
    <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
      <Text className="text-gray-600 font-semibold text-lg">
        {name?.charAt(0).toUpperCase() || 'U'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900 ml-2">
          {activeTab === 'followers' ? 'Seguidores' : 'Seguindo'}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setActiveTab('followers')}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === 'followers' ? 'border-[#22C55E]' : 'border-transparent'
          }`}
        >
          <Text
            className={`font-medium ${
              activeTab === 'followers' ? 'text-[#22C55E]' : 'text-gray-500'
            }`}
          >
            Seguidores ({followers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('following')}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === 'following' ? 'border-[#22C55E]' : 'border-transparent'
          }`}
        >
          <Text
            className={`font-medium ${
              activeTab === 'following' ? 'text-[#22C55E]' : 'text-gray-500'
            }`}
          >
            Seguindo ({following.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="people-outline" size={48} color="#D1D5DB" />
          <Text className="mt-4 text-gray-500 text-center">
            {activeTab === 'followers'
              ? 'Nenhum seguidor ainda'
              : 'Não está seguindo ninguém'}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-2">
            {data.map((item) => {
              const profile = item.profile;
              const isMe = user?.id === profile.id;
              const amFollowing = followingIds.has(profile.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row items-center py-3 border-b border-gray-100"
                  onPress={() => router.push(`/profile/${profile.id}` as any)}
                >
                  <PlayerAvatar name={profile.name || ''} />

                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-gray-900">
                      {profile.name}
                    </Text>
                    <Text className="text-sm text-gray-500">@{profile.username}</Text>
                    <Text className="text-xs text-gray-400">Nível {profile.level}</Text>
                  </View>

                  {!isMe && (
                    <TouchableOpacity
                      onPress={() => handleFollow(profile.id)}
                      className={`px-4 py-2 rounded-full ${
                        amFollowing ? 'bg-gray-200' : 'bg-[#22C55E]'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          amFollowing ? 'text-gray-700' : 'text-white'
                        }`}
                      >
                        {amFollowing ? 'Seguindo' : 'Seguir'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
