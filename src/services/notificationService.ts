import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Configure foreground notification behavior for Expo SDK 57
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPayload {
  to?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string | boolean;
  priority?: 'default' | 'normal' | 'high';
  badge?: number;
}

/**
 * Register current device for Expo push notifications and optionally sync token with Supabase profile
 */
export async function registerForPushNotificationsAsync(userId?: string): Promise<string | null> {
  let token: string | null = null;

  // Set up Android notification channels
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Atelier Activity',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E64B38',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('quiet', {
      name: 'Quiet Creative Alerts',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0, 0, 0, 0],
      lightColor: '#111111',
      sound: undefined,
    });
  }

  // Device check
  if (!Device.isDevice) {
    // Simulator or browser fallback
    token = 'ExponentPushToken[SIMULATOR_DEV_TOKEN]';
    if (userId) {
      await savePushTokenToProfile(userId, token);
    }
    return token;
  }

  // Check and request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      Constants?.expoConfig?.slug;

    const pushTokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    token = pushTokenData.data;

    if (userId && token) {
      await savePushTokenToProfile(userId, token);
    }
  } catch (error) {
    console.warn('Failed to retrieve Expo push token:', error);
  }

  return token;
}

/**
 * Sync push token with user's profile row in Supabase
 */
export async function savePushTokenToProfile(userId: string, token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Send push notification via Expo Push API with Quiet Mode respect
 */
export async function sendPushNotification(
  recipientToken: string,
  payload: NotificationPayload,
  isQuietMode = false
): Promise<boolean> {
  if (!recipientToken || recipientToken.startsWith('ExponentPushToken[SIMULATOR')) {
    // Also trigger local notification for developer experience on simulators
    await scheduleLocalNotification({
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: isQuietMode ? false : true,
    });
    return true;
  }

  // If recipient is in quiet mode, suppress loud sounds and banners for likes/social metrics
  const message = {
    to: recipientToken,
    sound: isQuietMode ? null : 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
    channelId: isQuietMode ? 'quiet' : 'default',
    badge: isQuietMode ? undefined : payload.badge,
    priority: isQuietMode ? 'normal' : 'high',
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    return result.data?.status === 'ok';
  } catch (err) {
    console.warn('Push notification delivery failed:', err);
    return false;
  }
}

/**
 * Schedule immediate local notification
 */
export async function scheduleLocalNotification(options: {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
}): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: options.title,
      body: options.body,
      data: options.data || {},
      sound: options.sound !== false ? 'default' : undefined,
    },
    trigger: null, // immediate
  });
}
