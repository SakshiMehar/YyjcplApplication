import { baseApi } from '../../../store/api/baseApi';
import { ApiRole, fromApiRole } from '../../../constants/roles';
import { User } from '../../../types/models';
import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import { logApi } from '../../../utils/apiLogger';

const httpStatus = (meta: unknown) => (meta as FetchBaseQueryMeta | undefined)?.response?.status;

export type OtpPurpose = 'login' | 'register' | 'reset';

type AuthSuccess = { token: string; user: User; accountDeactivated?: boolean };

/** FCM details included with POST /api/auth/login when available. */
type FcmLoginFields = { fcmToken?: string; platform?: string };

/** Body of POST /api/auth/login. */
export type FirebaseLoginBody = {
  idToken: string;
  role: ApiRole;
  fullName?: string;
} & FcmLoginFields;

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
  | ({ email: string; password: string } & FcmLoginFields)
  | ({ mobile: string; password: string } & FcmLoginFields);

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
  isActive?: boolean;
  active?: boolean;
  isAccountActive?: boolean;
  accountActive?: boolean;
  deactivated?: boolean;
  isDeactivated?: boolean;
  accountDeactivated?: boolean;
  accountStatus?: string;
  status?: string;
};
type RawTokens = { token?: string; accessToken?: string; user?: RawUser };
type RawAuthResponse = RawTokens & RawUser & { data?: RawTokens & RawUser };

function normalizeUser(raw: RawAuthResponse): User {
  const body = raw.data ?? raw;
  const user = body.user ?? body;
  return {
    id: String(user.id ?? user._id ?? user.userId ?? ''),
    role: fromApiRole(user.role),
    name: user.fullName ?? user.name ?? '',
    phone: (user.mobile ?? user.phone ?? user.phoneNumber ?? '').replace(/^\+91/, ''),
    email: user.email,
    isVerified: user.isVerified ?? true,
  };
}

/**
 * Accepts the common response shapes and maps API roles to app roles.
 * The user can be nested (`{ token, user: {...} }`) or flat like the
 * /register response (`{ token, userId, fullName, mobile, ... }`).
 */
function normalizeAuthResponse(raw: RawAuthResponse): AuthSuccess {
  const body = raw.data ?? raw;
  const user = body.user ?? body;
  const accountStatus = String(user.accountStatus ?? user.status ?? '').toLowerCase();
  return {
    token: body.token ?? body.accessToken ?? '',
    user: normalizeUser(raw),
    accountDeactivated:
      user.isActive === false ||
      user.active === false ||
      user.isAccountActive === false ||
      user.accountActive === false ||
      user.deactivated === true ||
      user.isDeactivated === true ||
      user.accountDeactivated === true ||
      accountStatus === 'deactivated' ||
      accountStatus === 'inactive',
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
    /** Emails password-reset instructions to the registered email address. */
    forgotPassword: build.mutation<void, { email: string }>({
      query: body => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
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
    resetPassword: build.mutation<void, { email: string; otp: string; newPassword: string }>({
      query: body => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    getMe: build.query<User, void>({
      query: () => '/auth/me',
      transformResponse: normalizeUser,
      providesTags: ['Me'],
    }),
    changePassword: build.mutation<void, { oldPassword: string; newPassword: string }>({
      query: body => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    updateContactDetails: build.mutation<
      void,
      { currentPassword: string; newEmail: string; newMobile: string }
    >({
      query: body => ({
        url: '/auth/contact-details',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    /** Permanently deletes the signed-in account after an explicit confirmation. */
    deleteAccount: build.mutation<void, { confirmation: 'DELETE' }>({
      query: body => ({
        url: '/account',
        method: 'DELETE',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    /** Deactivates the signed-in account. */
    deactivateAccount: build.mutation<void, void>({
      query: () => ({
        url: '/account/deactivate',
        method: 'PUT',
      }),
    }),
    /** Reactivates an account after the user confirms during login. */
    reactivateAccount: build.mutation<void, { token?: string } | void>({
      query: args => ({
        url: '/account/reactivate',
        method: 'PUT',
        headers: args?.token ? { Authorization: `Bearer ${args.token}` } : undefined,
      }),
    }),
    deleteFcmToken: build.mutation<void, string>({
      query: tokenId => ({
        url: `/notifications/fcm-tokens/${encodeURIComponent(tokenId)}`,
        method: 'DELETE',
      }),
    }),
    /** Associates a refreshed Firebase Cloud Messaging token with this user. */
    registerFcmToken: build.mutation<void, { token: string; platform: 'ANDROID' | 'IOS' }>({
      query: body => ({
        url: '/notifications/fcm-tokens',
        method: 'PUT',
        body,
      }),
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
  useChangePasswordMutation,
  useUpdateContactDetailsMutation,
  useDeleteAccountMutation,
  useDeactivateAccountMutation,
  useReactivateAccountMutation,
  useDeleteFcmTokenMutation,
  useRegisterFcmTokenMutation,
} = authApi;
