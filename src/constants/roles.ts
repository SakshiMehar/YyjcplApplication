export const USER_ROLES = {
  CANDIDATE: 'CANDIDATE',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Role names used by the backend API (app ⇄ API mapping lives only here). */
export type ApiRole = 'JOB_SEEKER' | 'RECRUITER';

export const toApiRole = (role: UserRole): ApiRole =>
  role === USER_ROLES.RECRUITER ? 'RECRUITER' : 'JOB_SEEKER';

export const fromApiRole = (role: string | undefined): UserRole => {
  const value = role?.toUpperCase();
  if (value === 'ADMIN' || value === 'SUPER_ADMIN') {
    return USER_ROLES.ADMIN;
  }
  return value === 'RECRUITER' ? USER_ROLES.RECRUITER : USER_ROLES.CANDIDATE;
};
