import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/services/notificationService';
import { useAuthStore } from '@/stores/authStore';

export function useNotifications() {
  const { user } = useAuthStore();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Register for push notifications
    const registerPushNotifications = async () => {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        setExpoPushToken(token);

        // Save token to user profile if logged in
        if (user?.id) {
          await notificationService.savePushToken(user.id, token);
        }
      }
    };

    registerPushNotifications();

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    // Listen for notification responses (when user taps)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        // Navigate based on notification type
        switch (data?.type) {
          case 'match_invite':
          case 'match_reminder':
            if (data.matchId) {
              router.push(`/match/${data.matchId}` as any);
            }
            break;
          case 'follow':
            if (data.followerId) {
              router.push(`/profile/${data.followerId}` as any);
            }
            break;
          case 'message':
            if (data.chatId) {
              router.push(`/chat/${data.chatId}` as any);
            }
            break;
          case 'achievement':
            router.push('/achievements' as any);
            break;
          default:
            router.push('/notifications' as any);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user?.id]);

  return {
    expoPushToken,
    notification,
    // Convenience methods
    sendInviteNotification: notificationService.sendInviteNotification.bind(notificationService),
    sendAchievementNotification: notificationService.sendAchievementNotification.bind(notificationService),
    sendFollowNotification: notificationService.sendFollowNotification.bind(notificationService),
    sendRankingNotification: notificationService.sendRankingNotification.bind(notificationService),
    scheduleMatchReminder: notificationService.scheduleMatchReminder.bind(notificationService),
    scheduleCheckInReminder: notificationService.scheduleCheckInReminder.bind(notificationService),
    sendMessageNotification: notificationService.sendMessageNotification.bind(notificationService),
    sendMatchJoinedNotification: notificationService.sendMatchJoinedNotification.bind(notificationService),
    cancelNotification: notificationService.cancelNotification.bind(notificationService),
    cancelAllNotifications: notificationService.cancelAllNotifications.bind(notificationService),
    setBadgeCount: notificationService.setBadgeCount.bind(notificationService),
    getBadgeCount: notificationService.getBadgeCount.bind(notificationService),
    incrementBadgeCount: notificationService.incrementBadgeCount.bind(notificationService),
  };
}
