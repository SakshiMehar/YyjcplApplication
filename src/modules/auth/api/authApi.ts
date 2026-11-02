import { baseApi } from '../../../store/api/baseApi';
import { ApiRole, fromApiRole } from '../../../constants/roles';
import { User } from '../../../types/models';
import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import { logApi } from '../../../utils/apiLogger';

const httpStatus = (meta: unknown) => (meta as FetchBaseQueryMeta | undefined)?.response?.status;

export type OtpPurpose = 'login' | 'register' | 'reset';

type AuthSuccess = { token: string; user: User };

/** Body of POST /api/auth/login. */
export type FirebaseLoginBody = { idToken: string; role: ApiRole; fullName?: string };

/** Body of POST /api/auth/register. */
export type RegisterBody = {
  fullName: string;
  email: string;
  /** With country code, e.g. "+919876543210". */
  mobile: string;
  password: string;
  role: ApiRole;
  companyName?: string;
};

/** 201 Created response of POST /api/auth/register. */
export type RegisterResponse = {
  userId: number;
  firebaseUid: string;
  fullName: string;
  mobile: string;
  email: string;
  role: ApiRole;
  companyName?: string;
  newUser: boolean;
  profileComplete: boolean;
};

/**
 * Body of POST /api/auth/login – what the user typed in "Mobile Number or Email"
 * plus their password. Mobile is sent with country code, like in /register.
 */
export type PasswordLoginBody =
  | { email: string; password: string }
  | { mobile: string; password: string };

type RawUser = {
  id?: string | number;
  _id?: string;
  userId?: string | number;
  role?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  mobile?: string;
  email?: string;
  isVerified?: boolean;
};
type RawTokens = { token?: string; accessToken?: string; user?: RawUser };
type RawAuthResponse = RawTokens & RawUser & { data?: RawTokens & RawUser };

/**
 * Accepts the common response shapes and maps API roles to app roles.
 * The user can be nested (`{ token, user: {...} }`) or flat like the
 * /register response (`{ token, userId, fullName, mobile, ... }`).
 */
function normalizeAuthResponse(raw: RawAuthResponse): AuthSuccess {
  const body = raw.data ?? raw;
  const u: RawUser = body.user ?? body;
  return {
    token: body.token ?? body.accessToken ?? '',
    user: {
      id: String(u.id ?? u._id ?? u.userId ?? ''),
      role: fromApiRole(u.role),
      name: u.fullName ?? u.name ?? '',
      phone: (u.mobile ?? u.phone ?? u.phoneNumber ?? '').replace(/^\+91/, ''),
      email: u.email,
      isVerified: u.isVerified ?? true,
    },
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: build => ({
    /** Login – POST /api/auth/login with (email or mobile) + password. */
    passwordLogin: build.mutation<AuthSuccess, PasswordLoginBody>({
      query: body => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (raw: RawAuthResponse, meta) => {
        logApi('POST /api/auth/login', httpStatus(meta), raw);
        return normalizeAuthResponse(raw);
      },
      transformErrorResponse: (err, meta) => {
        logApi('POST /api/auth/login (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
    }),
    /**
     * Login AND sign-up. Send the Firebase ID token; the backend verifies it and
     * logs the user in with their saved role. `fullName` only for new accounts.
     */
    firebaseLogin: build.mutation<AuthSuccess, FirebaseLoginBody>({
      query: body => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: normalizeAuthResponse,
    }),
    /** Create account – POST /api/auth/register → 201 with the new user (no token). */
    register: build.mutation<RegisterResponse, RegisterBody>({
      query: body => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (res: RegisterResponse, meta) => {
        logApi('POST /api/auth/register', httpStatus(meta), res);
        return res;
      },
      transformErrorResponse: (err, meta) => {
        logApi('POST /api/auth/register (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
    }),
    /** Sends an OTP to reset the password. */
    forgotPassword: build.mutation<{ requestId: string }, { phone: string }>({
      query: body => ({ url: '/auth/password/forgot', method: 'POST', body }),
    }),
    /** login / register → token + user; reset → resetToken. */
    verifyOtp: build.mutation<
      Partial<AuthSuccess> & { resetToken?: string },
      { requestId: string; otp: string; purpose: OtpPurpose }
    >({
      query: body => ({ url: '/auth/otp/verify', method: 'POST', body }),
    }),
    resendOtp: build.mutation<{ requestId: string }, { requestId: string }>({
      query: body => ({ url: '/auth/otp/resend', method: 'POST', body }),
    }),
    resetPassword: build.mutation<void, { resetToken: string; password: string }>({
      query: body => ({ url: '/auth/password/reset', method: 'POST', body }),
    }),
    getMe: build.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    registerFcmToken: build.mutation<void, { fcmToken: string; platform: string }>({
      query: body => ({ url: '/devices', method: 'POST', body }),
    }),
  }),
});

export const {
  usePasswordLoginMutation,
  useFirebaseLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useRegisterFcmTokenMutation,
} = authApi;
