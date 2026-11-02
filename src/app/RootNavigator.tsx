import React, { useEffect } from 'react';
import { Loader } from '../components/common';
import { USER_ROLES } from '../constants/roles';
import AuthNavigator from '../navigation/AuthNavigator';
import CandidateNavigator from '../navigation/CandidateNavigator';
import RecruiterNavigator from '../navigation/RecruiterNavigator';
import { getToken } from '../services/secureStorage';
import { setBootstrapped } from '../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

/**
 * Decides which app to show:
 *   not logged in  -> Auth (role select, login, OTP)
 *   CANDIDATE      -> Candidate app
 *   RECRUITER      -> Recruiter app
 * (Admin uses the separate web panel.)
 */
export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { user, isBootstrapped } = useAppSelector(s => s.auth);

  useEffect(() => {
    (async () => {
      // TODO: if a token exists, fetch /auth/me and dispatch setCredentials to restore the session.
      await getToken().catch(() => null);
      dispatch(setBootstrapped());
    })();
  }, [dispatch]);

  if (!isBootstrapped) {
    return <Loader />;
  }
  if (!user) {
    return <AuthNavigator />;
  }
  return user.role === USER_ROLES.RECRUITER ? <RecruiterNavigator /> : <CandidateNavigator />;
}
