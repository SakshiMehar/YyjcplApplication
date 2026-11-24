import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';

type FcmTokenRegistration = {
  token: string;
  platform: 'ANDROID' | 'IOS';
};

export async function getDeviceFcmToken(): Promise<string> {
  const token = await getToken(getMessaging());
  if (!token.trim()) {
    throw new Error('Firebase Messaging returned an empty device token.');
  }
  return token;
}

export function getFcmPlatform(): FcmTokenRegistration['platform'] {
  return Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Number(Platform.Version) < 33) {
      return true;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  if (Platform.OS === 'ios') {
    const status = await requestPermission(getMessaging());
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL ||
      status === AuthorizationStatus.EPHEMERAL
    );
  }

  return false;
}

export async function getFcmLoginFields(): Promise<{
  fcmToken?: string;
  platform?: string;
}> {
  try {
    if (!(await requestNotificationPermission())) {
      return {};
    }

    return {
      fcmToken: await getDeviceFcmToken(),
      platform: getFcmPlatform(),
    };
  } catch (error) {
    console.warn('[FCM] Could not get a device token for the login request.', error);
    return {};
  }
}

/**
 * Displays incoming FCM notifications while the app is open. Android does not
 * show an FCM notification payload automatically in the foreground.
 */
export function subscribeToForegroundNotifications(): () => void {
  return onMessage(getMessaging(), remoteMessage => {
    void (async () => {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Notifications',
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title: remoteMessage.notification?.title ?? remoteMessage.data?.title ?? 'YYJCPL',
        body: remoteMessage.notification?.body ?? remoteMessage.data?.body ?? '',
        data: remoteMessage.data,
        android: {
          channelId,
          pressAction: { id: 'default' },
        },
      });
    })().catch(error => {
      console.warn('[FCM] Could not display a foreground notification.', error);
    });
  });
}

/** Subscribes the signed-in user's device when Firebase rotates its FCM token. */
export function subscribeToFcmTokenRefresh(
  onRefresh: (registration: FcmTokenRegistration) => void,
): () => void {
  return onTokenRefresh(getMessaging(), token => {
    onRefresh({ token, platform: getFcmPlatform() });
  });
}
