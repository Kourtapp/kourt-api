import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationData {
  type: 'match_invite' | 'match_reminder' | 'follow' | 'message' | 'achievement';
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private expoPushToken: string | null = null;

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
      }

      // Check existing permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        return null;
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = token.data;

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#22C55E',
        });

        await Notifications.setNotificationChannelAsync('matches', {
          name: 'Partidas',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#22C55E',
        });

        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Mensagens',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250],
          lightColor: '#3B82F6',
        });
      }

      return this.expoPushToken;
    } catch (err) {
      console.error('Error registering for push notifications:', err);
      return null;
    }
  }

  // Save push token to user profile
  async savePushToken(userId: string, token: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);
    } catch (err) {
      console.error('Error saving push token:', err);
    }
  }

  // Schedule a local notification
  async scheduleLocalNotification(
    notification: PushNotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { type: notification.type, ...notification.data },
          sound: true,
        },
        trigger: trigger || null, // null = immediate
      });

      return identifier;
    } catch (err) {
      console.error('Error scheduling notification:', err);
      return null;
    }
  }

  // Schedule match reminder
  async scheduleMatchReminder(
    matchId: string,
    matchTitle: string,
    matchDate: Date,
    minutesBefore: number = 60
  ): Promise<string | null> {
    const reminderDate = new Date(matchDate.getTime() - minutesBefore * 60 * 1000);

    if (reminderDate <= new Date()) {
      return null; // Don't schedule if reminder time has passed
    }

    return this.scheduleLocalNotification(
      {
        type: 'match_reminder',
        title: 'Partida em breve!',
        body: `${matchTitle} começa em ${minutesBefore} minutos`,
        data: { matchId },
      },
      { date: reminderDate } as Notifications.NotificationTriggerInput
    );
  }

  // Cancel a scheduled notification
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get badge count
  async getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  }

  // Set badge count
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  // Add notification listener
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Add response listener (when user taps notification)
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Get push token
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Send invite notification
  async sendInviteNotification(
    senderName: string,
    matchTitle: string,
    matchId: string
  ): Promise<string | null> {
    return this.scheduleLocalNotification({
      type: 'match_invite',
      title: 'Novo convite para jogar!',
      body: `${senderName} te convidou para: ${matchTitle}`,
      data: { matchId },
    });
  }

  // Send achievement notification
  async sendAchievementNotification(
    achievementTitle: string,
    xpEarned: number
  ): Promise<string | null> {
    return this.scheduleLocalNotification({
      type: 'achievement',
      title: 'Nova conquista desbloqueada! 🏆',
      body: `${achievementTitle} - Você ganhou +${xpEarned} XP`,
      data: { achievementTitle, xpEarned },
    });
  }

  // Send follow notification
  async sendFollowNotification(
    followerName: string,
    followerId: string
  ): Promise<string | null> {
    return this.scheduleLocalNotification({
      type: 'follow',
      title: 'Novo seguidor!',
      body: `${followerName} começou a seguir você`,
      data: { followerId },
    });
  }

  // Send ranking update notification
  async sendRankingNotification(
    newPosition: number,
    sport: string
  ): Promise<string | null> {
    return this.scheduleLocalNotification({
      type: 'achievement',
      title: 'Ranking atualizado! 📈',
      body: `Você está em #${newPosition} no ranking de ${sport}`,
      data: { newPosition, sport },
    });
  }

  // Send check-in reminder (30 min before)
  async scheduleCheckInReminder(
    matchId: string,
    matchTitle: string,
    matchDate: Date
  ): Promise<string | null> {
    return this.scheduleMatchReminder(matchId, matchTitle, matchDate, 30);
  }

  // Send message notification
  async sendMessageNotification(
    senderName: string,
    messagePreview: string,
    chatId: string
  ): Promise<string | null> {
    return this.scheduleLocalNotification({
      type: 'message',
      title: senderName,
      body: messagePreview,
      data: { chatId },
    });
  }
}

export const notificationService = new NotificationService();
