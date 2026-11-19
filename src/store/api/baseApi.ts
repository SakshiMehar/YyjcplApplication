import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { ENV } from '../../config/env';
import { clearAuthSession } from '../../services/secureStorage';
import { logout } from '../slices/authSlice';
import type { RootState } from '../index';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: ENV.API_BASE_URL,
  timeout: ENV.REQUEST_TIMEOUT_MS,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    // ngrok's free plan shows a warning page instead of the API unless this header is sent
    if (ENV.API_BASE_URL.includes('ngrok')) {
      headers.set('ngrok-skip-browser-warning', 'true');
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    try {
      await clearAuthSession();
    } catch (error) {
      console.warn('[Auth] Could not clear the expired session.', error);
    }
    api.dispatch(logout());
  }
  return result;
};

/**
 * Single RTK Query API. Feature modules add endpoints with
 * `baseApi.injectEndpoints(...)` (see src/modules/<feature>/api).
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'Me',
    'CandidateProfile',
    'Resume',
    'Certification',
    'Project',
    'BlockedCompany',
    'BlockedCandidate',
    'Company',
    'Job',
    'SavedJob',
    'MyJobs',
    'Application',
    'Candidate',
    'Shortlist',
    'Interview',
    'Notification',
    'Complaint',
    'Subscription',
  ],
  endpoints: () => ({}),
});
