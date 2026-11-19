import { configureStore } from '@reduxjs/toolkit';
import { recruiterApi } from '../src/modules/recruiter/api/recruiterApi';
import { baseApi } from '../src/store/api/baseApi';
import authReducer from '../src/store/slices/authSlice';

describe('GET /api/recruiter/profile', () => {
  afterEach(() => jest.restoreAllMocks());

  test('reads company fields and profilePictureUrl from the recruiter response', async () => {
    const fetchSpy = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            userId: 12,
            name: 'Riya Sharma',
            mobile: '9876543210',
            email: 'riya@acme.example',
            role: 'RECRUITER',
          },
          companyName: 'Acme Ltd',
          companyWebsite: 'https://acme.example',
          companyIndustry: 'IT Services',
          companyDescription: 'Technology company',
          companyLocation: 'Bengaluru',
          profilePictureUrl: 'https://api.example.com/api/profile-pictures/example.jpg',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    globalThis.fetch = fetchSpy;
    const store = configureStore({
      reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware),
    });

    const profile = await store
      .dispatch(recruiterApi.endpoints.getRecruiterProfile.initiate())
      .unwrap();

    expect(profile).toEqual({
      companyName: 'Acme Ltd',
      companyWebsite: 'https://acme.example',
      companyIndustry: 'IT Services',
      companyDescription: 'Technology company',
      companyLocation: 'Bengaluru',
      profilePictureUrl: 'https://api.example.com/api/profile-pictures/example.jpg',
    });
    expect(new URL(fetchSpy.mock.calls[0][0].url).pathname).toBe('/api/recruiter/profile');
    store.dispatch(baseApi.util.resetApiState());
  });
});
