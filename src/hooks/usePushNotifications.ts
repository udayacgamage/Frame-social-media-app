import { useState, useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  registerForPushNotificationsAsync,
  scheduleLocalNotification,
} from '@/services/notificationService';

export function usePushNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const register = useCallback(async () => {
    const token = await registerForPushNotificationsAsync(user?.id);
    setExpoPushToken(token);
    return token;
  }, [user?.id]);

  useEffect(() => {
    register();

    // Listen for incoming notifications when app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((incoming) => {
      setNotification(incoming);
    });

    // Listen for user tapping / responding to a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, any> | undefined;
      if (!data) return;

      // Deep link navigation based on notification payload
      if (data.chatId || data.threadId) {
        const id = String(data.chatId || data.threadId);
        router.push({
          pathname: '/chat/[id]' as any,
          params: { id },
        });
      } else if (data.postId) {
        const postId = String(data.postId);
        router.push({
          pathname: '/process/[postId]' as any,
          params: { postId },
        });
      } else if (data.storyId) {
        const id = String(data.storyId);
        router.push({
          pathname: '/story/[id]' as any,
          params: { id },
        });
      } else {
        router.push('/activity');
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [register, router]);

  return {
    expoPushToken,
    notification,
    register,
    sendLocalTestNotification: async (title: string, body: string, data?: Record<string, any>) => {
      return await scheduleLocalNotification({ title, body, data });
    },
  };
}
