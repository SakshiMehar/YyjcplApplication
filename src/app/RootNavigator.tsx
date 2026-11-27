import React, { useEffect } from 'react';
import { Loader } from '../components/common';
import { USER_ROLES } from '../constants/roles';
import AuthNavigator from '../navigation/AuthNavigator';
import CandidateNavigator from '../navigation/CandidateNavigator';
import RecruiterNavigator from '../navigation/RecruiterNavigator';
import { authApi } from '../modules/auth/api/authApi';
import { getAuthSession, saveAuthSession } from '../services/secureStorage';
import { setBootstrapped, setCredentials, setToken } from '../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

/**
 * Decides which app to show:
 *   not logged in  -> Auth (role select, login, OTP)
 *   CANDIDATE      -> Candidate app
 *   RECRUITER      -> Recruiter app
 *   ADMIN          -> Auth (admin panel is disabled in this application build)
 */
export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { user, isBootstrapped } = useAppSelector(s => s.auth);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await getAuthSession();
        if (active && session?.user) {
          dispatch(setCredentials({ token: session.token, user: session.user }));
        } else if (active && session) {
          dispatch(setToken(session.token));
          const restoredUser = await dispatch(
            authApi.endpoints.getMe.initiate(undefined, { subscribe: false }),
          ).unwrap();
          if (active) {
            await saveAuthSession(session.token, restoredUser);
            dispatch(setCredentials({ token: session.token, user: restoredUser }));
          }
        }
      } catch (error) {
        console.warn('[Auth] Could not restore the saved session.', error);
      } finally {
        if (active) {
          dispatch(setBootstrapped());
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [dispatch]);

  if (!isBootstrapped) {
    return <Loader />;
  }
  if (!user) {
    return <AuthNavigator />;
  }
  if (user.role === USER_ROLES.ADMIN) {
    return <AuthNavigator />;
  }
  return user.role === USER_ROLES.RECRUITER ? <RecruiterNavigator /> : <CandidateNavigator />;
}
