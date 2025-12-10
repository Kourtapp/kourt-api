// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

// Flag para garantir que o handler só seja configurado uma vez
let notificationHandlerConfigured = false;

// Função para inicializar o notification handler (chamar quando o app estiver pronto)
export function initializeNotificationHandler() {
  if (notificationHandlerConfigured) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerConfigured = true;
  } catch (error) {
    console.error('Error setting notification handler:', error);
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  // Inicializar handler se ainda não foi feito
  initializeNotificationHandler();

  if (!Device.isDevice) {
    console.log('Push notifications so funcionam em dispositivos fisicos');
    return null;
  }

  try {
    // Verificar permissoes
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissao para notificacoes negada');
      return null;
    }

    // Verificar se temos PROJECT_ID
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    if (!projectId) {
      console.warn('EXPO_PUBLIC_PROJECT_ID not set, skipping push token registration');
      return null;
    }

    // Obter token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Configurar canal no Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#84CC16',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

export async function savePushToken(userId: string, token: string) {
  await supabase.from('push_tokens').upsert({
    user_id: userId,
    token,
    platform: Platform.OS,
    updated_at: new Date().toISOString(),
  });
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Imediato
  });
}

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date,
  data?: Record<string, any>,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
