import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  requestPermission,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

export async function getDeviceFcmToken(): Promise<string> {
  const token = await getToken(getMessaging());
  if (!token.trim()) {
    throw new Error('Firebase Messaging returned an empty device token.');
  }
  return token;
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
      platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    };
  } catch (error) {
    console.warn('[FCM] Could not get a device token for the login request.', error);
    return {};
  }
}
