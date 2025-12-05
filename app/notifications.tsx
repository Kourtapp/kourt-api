// app/notifications.tsx
import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/database.types';

const NOTIFICATION_ICONS: Record<string, string> = {
  match_invite: 'sports-tennis',
  booking_reminder: 'event',
  achievement: 'emoji-events',
  level_up: 'trending-up',
  follow: 'person-add',
  message: 'chat',
};

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, read: true, read_at: new Date().toISOString() }
          : n,
      ),
    );

    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
        read_at: new Date().toISOString(),
      })),
    );

    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('read', false);
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);

    // Navigate based on type
    switch (notification.type) {
      case 'match_invite':
        if (notification.data?.matchId) {
          router.push(`/match/${notification.data.matchId}` as any);
        }
        break;
      case 'booking_reminder':
        if (notification.data?.bookingId) {
          router.push(`/booking/${notification.data.bookingId}` as any);
        }
        break;
      case 'achievement':
        router.push('/achievements' as any);
        break;
      default:
        break;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text className="text-lg font-bold text-black">Notificações</Text>
        </View>
        {notifications.some((n) => !n.read) && (
          <Pressable onPress={markAllAsRead}>
            <Text className="text-sm font-medium text-lime-600">
              Marcar todas
            </Text>
          </Pressable>
        )}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleNotificationPress(item)}
            className={`flex-row items-start gap-4 px-5 py-4 border-b border-neutral-100 ${!item.read ? 'bg-lime-50' : 'bg-white'
              }`}
          >
            {/* Icon */}
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${!item.read ? 'bg-lime-500' : 'bg-neutral-100'
                }`}
            >
              <MaterialIcons
                name={(NOTIFICATION_ICONS[item.type] || 'notifications') as any}
                size={20}
                color={!item.read ? '#1a2e05' : '#525252'}
              />
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text
                className={`text-sm mb-0.5 ${!item.read ? 'font-semibold text-black' : 'text-black'
                  }`}
              >
                {item.title}
              </Text>
              <Text className="text-sm text-neutral-600 mb-1">{item.body}</Text>
              <Text className="text-xs text-neutral-400">
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </Text>
            </View>

            {/* Unread dot */}
            {!item.read && (
              <View className="w-2 h-2 bg-lime-500 rounded-full mt-2" />
            )}
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="notifications-off" size={48} color="#A3A3A3" />
            <Text className="text-neutral-500 mt-4">Nenhuma notificacao</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
