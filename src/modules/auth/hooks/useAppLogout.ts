import { useCallback } from 'react';
import { clearAuthSession } from '../../../services/secureStorage';
import { signOutFirebase } from '../../../services/firebase/auth';
import { getDeviceFcmToken } from '../../../services/firebase/messaging';
import { useAppDispatch } from '../../../store/hooks';
import { baseApi } from '../../../store/api/baseApi';
import { logout } from '../../../store/slices/authSlice';
import { useDeleteFcmTokenMutation } from '../api/authApi';

export function useAppLogout(): () => Promise<void> {
  const dispatch = useAppDispatch();
  const [deleteFcmToken] = useDeleteFcmTokenMutation();

  return useCallback(async () => {
    try {
      const tokenId = await getDeviceFcmToken();
      await deleteFcmToken(tokenId).unwrap();
    } catch (error) {
      console.warn('[FCM] Could not delete the device token during logout.', error);
    }

    await clearAuthSession();
    try {
      await signOutFirebase();
    } catch (error) {
      console.warn('[Auth] Could not sign out of Firebase during logout.', error);
    }
    dispatch(baseApi.util.resetApiState());
    dispatch(logout());
  }, [deleteFcmToken, dispatch]);
}
