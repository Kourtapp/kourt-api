import { create } from 'zustand';
import { notificationService } from '@/services/notificationService';

interface Notification {
  id: string;
  type: 'match_joined' | 'match_invite' | 'achievement' | 'follow' | 'message';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  incrementUnread: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date(),
    };

    // Update state immediately
    set((state) => {
      const newCount = state.unreadCount + 1;
      console.log('[NotificationStore] Added notification, new count:', newCount);
      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: newCount,
      };
    });

    // Also update device badge (async, no await needed)
    notificationService.incrementBadgeCount().catch(console.error);
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return state;
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    notificationService.setBadgeCount(0);
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
    notificationService.setBadgeCount(0);
  },

  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },

  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },
}));
