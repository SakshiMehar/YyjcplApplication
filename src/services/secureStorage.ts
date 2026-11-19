import * as Keychain from 'react-native-keychain';
import type { User } from '../types/models';

const TOKEN_SERVICE = 'com.yyjcpl.app.auth';
const DEACTIVATED_ACCOUNT_SERVICE = 'com.yyjcpl.app.deactivatedAccount';

export type AuthSession = {
  token: string;
  user?: User;
};

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const session = value as Partial<AuthSession>;
  const user = session.user;
  return (
    typeof session.token === 'string' &&
    session.token.length > 0 &&
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    (user.role === 'CANDIDATE' || user.role === 'RECRUITER') &&
    typeof user.name === 'string' &&
    typeof user.phone === 'string' &&
    typeof user.isVerified === 'boolean'
  );
}

export async function saveAuthSession(token: string, user: User): Promise<void> {
  await Keychain.setGenericPassword(
    'auth',
    JSON.stringify({ token, user }),
    { service: TOKEN_SERVICE },
  );
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const creds = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });
  if (!creds) {
    return null;
  }

  let session: unknown;
  try {
    session = JSON.parse(creds.password);
  } catch {
    if (creds.password.trimStart().startsWith('{')) {
      throw new Error('Stored authentication session is not valid JSON.');
    }
    return { token: creds.password };
  }
  if (!isAuthSession(session)) {
    throw new Error('Stored authentication session is incomplete or invalid.');
  }

  return session;
}

export async function clearAuthSession(): Promise<void> {
  await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
}

/** Keeps track of an account deactivated on this device until it is reactivated. */
export async function markAccountDeactivated(userId: string): Promise<void> {
  await Keychain.setGenericPassword('deactivated', userId, { service: DEACTIVATED_ACCOUNT_SERVICE });
}

export async function getDeactivatedAccountId(): Promise<string | null> {
  const creds = await Keychain.getGenericPassword({ service: DEACTIVATED_ACCOUNT_SERVICE });
  return creds ? creds.password : null;
}

export async function clearDeactivatedAccountMarker(): Promise<void> {
  await Keychain.resetGenericPassword({ service: DEACTIVATED_ACCOUNT_SERVICE });
}

/*
 * Company name typed on the recruiter sign-up form. Registration returns no session
 * token, so it is kept here and sent to PUT /api/recruiter/profile after the first login.
 */
const PENDING_COMPANY_SERVICE = 'com.yyjcpl.app.pendingCompany';

export async function savePendingCompany(mobile: string, companyName: string): Promise<void> {
  await Keychain.setGenericPassword(mobile, companyName, { service: PENDING_COMPANY_SERVICE });
}

export async function getPendingCompany(): Promise<{ mobile: string; companyName: string } | null> {
  const creds = await Keychain.getGenericPassword({ service: PENDING_COMPANY_SERVICE });
  return creds ? { mobile: creds.username, companyName: creds.password } : null;
}

export async function clearPendingCompany(): Promise<void> {
  await Keychain.resetGenericPassword({ service: PENDING_COMPANY_SERVICE });
}
