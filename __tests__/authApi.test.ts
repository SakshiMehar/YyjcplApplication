import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../src/modules/auth/api/authApi';
import { baseApi } from '../src/store/api/baseApi';
import authReducer, { setCredentials } from '../src/store/slices/authSlice';

const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: gDM => gDM().concat(baseApi.middleware),
  });

const mockFetch = (body: unknown) =>
  jest.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

describe('POST /api/auth/login (Firebase ID token)', () => {
  afterEach(() => jest.restoreAllMocks());

  test('sends Firebase credentials, role, name and FCM device details', async () => {
    const fetchSpy = mockFetch({ token: 't', user: { id: 1, role: 'JOB_SEEKER' } });
    globalThis.fetch = fetchSpy;

    await makeStore()
      .dispatch(
        authApi.endpoints.firebaseLogin.initiate({
          idToken: 'firebase-id-token',
          role: 'JOB_SEEKER',
          fullName: 'Asha Kumar',
          fcmToken: 'device-fcm-token',
          platform: 'ANDROID',
        }),
      )
      .unwrap();

    const request: Request = fetchSpy.mock.calls[0][0];
    expect(request.method).toBe('POST');
    expect(request.url).toMatch(/\/api\/auth\/login$/);
    expect(await request.json()).toEqual({
      idToken: 'firebase-id-token',
      role: 'JOB_SEEKER',
      fullName: 'Asha Kumar',
      fcmToken: 'device-fcm-token',
      platform: 'ANDROID',
    });
  });

  describe('DELETE /api/notifications/fcm-tokens/{tokenId}', () => {
    afterEach(() => jest.restoreAllMocks());

    test('uses the encoded FCM token as tokenId and sends the backend JWT', async () => {
      const fetchSpy = mockFetch({});
      globalThis.fetch = fetchSpy;
      const store = makeStore();
      store.dispatch(setCredentials({
        token: 'backend-jwt',
        user: {
          id: '7',
          role: 'CANDIDATE',
          name: 'Asha Kumar',
          phone: '',
          isVerified: true,
        },
      }));

      await store
        .dispatch(
          authApi.endpoints.deleteFcmToken.initiate('fcm:segment/with+chars'),
        )
        .unwrap();

      const request: Request = fetchSpy.mock.calls[0][0];
      expect(request.method).toBe('DELETE');
      expect(new URL(request.url).pathname).toBe(
        '/api/notifications/fcm-tokens/fcm%3Asegment%2Fwith%2Bchars',
      );
      expect(request.headers.get('Authorization')).toBe('Bearer backend-jwt');
      expect(await request.text()).toBe('');
      store.dispatch(baseApi.util.resetApiState());
    });
  });

  test('sends email, password and FCM details for password login', async () => {
    const fetchSpy = mockFetch({
      token: 'backend-jwt',
      user: { id: 7, role: 'JOB_SEEKER', fullName: 'Asha Kumar' },
    });
    globalThis.fetch = fetchSpy;

    await makeStore()
      .dispatch(
        authApi.endpoints.passwordLogin.initiate({
          email: 'asha@example.com',
          password: 'Asha@123',
          fcmToken: 'device-fcm-token',
          platform: 'ANDROID',
        }),
      )
      .unwrap();

    const request: Request = fetchSpy.mock.calls[0][0];
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toBe('/api/auth/login');
    expect(await request.json()).toEqual({
      email: 'asha@example.com',
      password: 'Asha@123',
      fcmToken: 'device-fcm-token',
      platform: 'ANDROID',
    });
  });

  test('maps the response to the app user (API role → app role)', async () => {
    globalThis.fetch = mockFetch({
      data: {
        accessToken: 'backend-jwt',
        user: { id: 7, role: 'RECRUITER', fullName: 'Asha Kumar', phone: '+919876543210' },
      },
    });

    const res = await makeStore()
      .dispatch(authApi.endpoints.firebaseLogin.initiate({ idToken: 'x', role: 'RECRUITER' }))
      .unwrap();

    expect(res.token).toBe('backend-jwt');
    expect(res.user).toMatchObject({
      id: '7',
      role: 'RECRUITER',
      name: 'Asha Kumar',
      phone: '9876543210',
    });
  });

  test('changes the authenticated user password with the expected request body', async () => {
    const fetchSpy = mockFetch({});
    globalThis.fetch = fetchSpy;
    const store = makeStore();
    store.dispatch(setCredentials({
      token: 'backend-jwt',
      user: {
        id: '7',
        role: 'CANDIDATE',
        name: 'Asha Kumar',
        phone: '',
        isVerified: true,
      },
    }));

    await store
      .dispatch(
        authApi.endpoints.changePassword.initiate({
          oldPassword: 'OldPass@123',
          newPassword: 'NewPass@456',
        }),
      )
      .unwrap();

    const request: Request = fetchSpy.mock.calls[0][0];
    expect(request.method).toBe('POST');
    expect(new URL(request.url).pathname).toBe('/api/auth/change-password');
    expect(request.headers.get('Authorization')).toBe('Bearer backend-jwt');
    expect(request.headers.get('Content-Type')).toMatch(/application\/json/);
    expect(await request.json()).toEqual({
      oldPassword: 'OldPass@123',
      newPassword: 'NewPass@456',
    });
    store.dispatch(baseApi.util.resetApiState());
  });
});
