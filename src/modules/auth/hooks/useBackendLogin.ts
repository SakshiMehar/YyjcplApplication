import { ApiRole, USER_ROLES } from '../../../constants/roles';
import { signOutFirebase } from '../../../services/firebase/auth';
import { saveAuthSession } from '../../../services/secureStorage';
import { getFcmLoginFields } from '../../../services/firebase/messaging';
import { setCredentials } from '../../../store/slices/authSlice';
import { useAppDispatch } from '../../../store/hooks';
import { useFirebaseLoginMutation } from '../api/authApi';

/** Readable message from an RTK Query error returned by our backend. */
export function backendErrorMessage(error: unknown): string {
  const e = error as { status?: number | string; data?: { message?: string; error?: string } };
  if (e?.status === 'FETCH_ERROR' || e?.status === 'TIMEOUT_ERROR') {
    return "Can't reach the server. Check your internet connection and try again.";
  }
  return e?.data?.message ?? e?.data?.error ?? 'Login failed. Please try again.';
}

/**
 * Last step of every login / sign-up:
 * Firebase ID token → POST /api/auth/login → save backend token → user is logged in.
 * If the backend rejects the login, Firebase is signed out again so both stay in sync.
 */
export function useBackendLogin() {
  const dispatch = useAppDispatch();
  const [firebaseLogin, { isLoading }] = useFirebaseLoginMutation();

  const login = async (idToken: string, role: ApiRole, fullName?: string) => {
    try {
      const fcmFields = await getFcmLoginFields();
      const { token, user } = await firebaseLogin({
        idToken,
        role,
        ...(fullName ? { fullName: fullName.trim() } : {}),
        ...fcmFields,
      }).unwrap();
      if (!token) {
        throw { data: { message: 'Login failed: the server did not return a session token.' } };
      }
      if (__DEV__ && user.role === USER_ROLES.CANDIDATE) {
        console.log('[Auth] Job seeker token:', token);
      }
      await saveAuthSession(token, user);
      dispatch(setCredentials({ token, user }));
    } catch (error) {
      await signOutFirebase().catch(() => {});
      throw error;
    }
  };

  return { login, isLoading };
}
