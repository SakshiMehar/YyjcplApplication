import { USER_ROLES, UserRole } from '../constants/roles';
import { User } from '../types/models';

/**
 * DEV ONLY – lets you click through every auth screen before the backend exists.
 * When an auth API call fails in a debug build, screens continue with fake data,
 * and the OTP `DEV_OTP` is accepted. Set to `false` once the real API is live.
 */
export const DEV_NO_BACKEND = __DEV__;
export const DEV_OTP = '123456';
export const DEV_REQUEST_ID = 'dev-request';
export const DEV_TOKEN = 'dev-token';

export const devUser = (role: UserRole = USER_ROLES.CANDIDATE, phone = '9999999999'): User => ({
  id: 'dev',
  role,
  name: 'Dev User',
  phone,
  isVerified: true,
});

/**
 * DEV ONLY – demo admin login so the admin panel can be opened before the
 * backend has an admin account. Ignored in release builds.
 */
export const DEV_ADMIN_ID = 'admin';
export const DEV_ADMIN_PASSWORD = 'Admin@123';
