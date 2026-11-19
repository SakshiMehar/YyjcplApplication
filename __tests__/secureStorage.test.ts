import * as Keychain from 'react-native-keychain';
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../src/services/secureStorage';

const user = {
  id: '12',
  role: 'RECRUITER' as const,
  name: 'Riya Sharma',
  phone: '9876543210',
  email: 'riya@example.com',
  isVerified: true,
};

describe('secure auth session storage', () => {
  const setGenericPassword = Keychain.setGenericPassword as jest.Mock;
  const getGenericPassword = Keychain.getGenericPassword as jest.Mock;
  const resetGenericPassword = Keychain.resetGenericPassword as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('stores the backend token and user together for session restoration', async () => {
    await saveAuthSession('backend-jwt', user);

    expect(setGenericPassword).toHaveBeenCalledWith(
      'auth',
      JSON.stringify({ token: 'backend-jwt', user }),
      { service: 'com.yyjcpl.app.auth' },
    );
  });

  test('restores a saved session after app restart', async () => {
    getGenericPassword.mockResolvedValue({
      username: 'auth',
      password: JSON.stringify({ token: 'backend-jwt', user }),
    });

    await expect(getAuthSession()).resolves.toEqual({ token: 'backend-jwt', user });
  });

  test('reads a previous token-only entry for profile lookup and migration', async () => {
    getGenericPassword.mockResolvedValue({
      username: 'auth',
      password: 'legacy-backend-jwt',
    });

    await expect(getAuthSession()).resolves.toEqual({ token: 'legacy-backend-jwt' });
  });

  test('clears the saved session on logout', async () => {
    await clearAuthSession();

    expect(resetGenericPassword).toHaveBeenCalledWith({
      service: 'com.yyjcpl.app.auth',
    });
  });
});
