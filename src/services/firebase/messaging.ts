import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export async function getDeviceFcmToken(): Promise<string> {
  const token = await getToken(getMessaging());
  if (!token.trim()) {
    throw new Error('Firebase Messaging returned an empty device token.');
  }
  return token;
}

export async function getFcmLoginFields(): Promise<{
  fcmToken?: string;
  platform?: string;
}> {
  try {
    return {
      fcmToken: await getDeviceFcmToken(),
      platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    };
  } catch (error) {
    console.warn('[FCM] Could not get a device token for the login request.', error);
    return {};
  }
}
