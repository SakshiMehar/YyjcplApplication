import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../src/modules/auth/api/authApi';
import { baseApi } from '../src/store/api/baseApi';
import authReducer from '../src/store/slices/authSlice';

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

  test('sends idToken, role and fullName', async () => {
    const fetchSpy = mockFetch({ token: 't', user: { id: 1, role: 'JOB_SEEKER' } });
    globalThis.fetch = fetchSpy;

    await makeStore()
      .dispatch(
        authApi.endpoints.firebaseLogin.initiate({
          idToken: 'firebase-id-token',
          role: 'JOB_SEEKER',
          fullName: 'Asha Kumar',
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
});
