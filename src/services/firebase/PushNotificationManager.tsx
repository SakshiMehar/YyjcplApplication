import { useEffect } from 'react';
import {
  getFcmPlatform,
  subscribeToFcmTokenRefresh,
  subscribeToForegroundNotifications,
} from './messaging';
import { useRegisterFcmTokenMutation } from '../../modules/auth/api/authApi';
import { useAppSelector } from '../../store/hooks';

/** Starts push listeners only for an authenticated app session. */
export default function PushNotificationManager() {
  const isAuthenticated = useAppSelector(state => Boolean(state.auth.token));
  const [registerFcmToken] = useRegisterFcmTokenMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    return subscribeToForegroundNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    return subscribeToFcmTokenRefresh(({ token, platform }) => {
      void registerFcmToken({ token, platform }).unwrap().catch(error => {
        console.warn('[FCM] Could not register a refreshed device token.', error);
      });
    });
  }, [isAuthenticated, registerFcmToken]);

  return null;
}
