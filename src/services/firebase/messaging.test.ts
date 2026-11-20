import { PermissionsAndroid } from 'react-native';
import {
  getToken,
  requestPermission,
} from '@react-native-firebase/messaging';
import { getFcmLoginFields } from './messaging';

jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 33 },
  PermissionsAndroid: {
    PERMISSIONS: { POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS' },
    RESULTS: { GRANTED: 'granted', DENIED: 'denied' },
    request: jest.fn(),
  },
}));

jest.mock('@react-native-firebase/messaging', () => ({
  AuthorizationStatus: {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    EPHEMERAL: 3,
  },
  getMessaging: jest.fn(),
  getToken: jest.fn(),
  requestPermission: jest.fn(),
}));

describe('getFcmLoginFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(PermissionsAndroid.request)
      .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
    jest.mocked(getToken).mockResolvedValue('test-fcm-device-token');
    jest.mocked(requestPermission).mockResolvedValue(1);
  });

  it('includes the device token after notification permission is granted', async () => {
    await expect(getFcmLoginFields()).resolves.toEqual({
      fcmToken: 'test-fcm-device-token',
      platform: 'ANDROID',
    });
    expect(PermissionsAndroid.request).toHaveBeenCalledWith(
      'android.permission.POST_NOTIFICATIONS',
    );
    expect(getToken).toHaveBeenCalled();
  });

  it('does not request a device token when notification permission is denied', async () => {
    jest
      .mocked(PermissionsAndroid.request)
      .mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

    await expect(getFcmLoginFields()).resolves.toEqual({});
    expect(getToken).not.toHaveBeenCalled();
  });
});
