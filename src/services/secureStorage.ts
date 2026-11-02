import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'com.yyjcpl.app.auth';

export async function saveToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('auth', token, { service: TOKEN_SERVICE });
}

export async function getToken(): Promise<string | null> {
  const creds = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });
  return creds ? creds.password : null;
}

export async function clearToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
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
