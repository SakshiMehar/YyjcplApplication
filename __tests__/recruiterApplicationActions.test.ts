import { configureStore } from '@reduxjs/toolkit';
import { recruiterApi } from '../src/modules/recruiter/api/recruiterApi';
import { baseApi } from '../src/store/api/baseApi';
import authReducer from '../src/store/slices/authSlice';

const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: gDM => gDM().concat(baseApi.middleware),
  });

describe('recruiter application actions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('sends each application action to its PUT endpoint', async () => {
    const fetchSpy = jest.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })),
    );
    globalThis.fetch = fetchSpy;

    const store = makeStore();
    const actions = [
      {
        path: '/api/recruiter/applications/17/shortlist',
        run: () => store.dispatch(recruiterApi.endpoints.shortlistApplication.initiate('17')).unwrap(),
      },
      {
        path: '/api/recruiter/applications/17/interview',
        run: () => store.dispatch(recruiterApi.endpoints.scheduleApplicationInterview.initiate({
          applicationId: '17',
          scheduledAt: '2026-11-02T09:00:00.000Z',
          mode: 'VIDEO',
          locationOrLink: 'https://meet.example.com/room',
          notes: 'Portfolio review',
        })).unwrap(),
      },
      {
        path: '/api/recruiter/applications/17/next-round',
        run: () => store.dispatch(recruiterApi.endpoints.scheduleApplicationNextRound.initiate({
          applicationId: '17',
          scheduledAt: '2026-11-05T09:00:00.000Z',
          mode: 'PHONE',
        })).unwrap(),
      },
      {
        path: '/api/recruiter/applications/17/result',
        run: () => store.dispatch(recruiterApi.endpoints.updateApplicationResult.initiate({
          applicationId: '17',
          result: 'SELECTED',
        })).unwrap(),
      },
      {
        path: '/api/recruiter/applications/17/reject',
        run: () => store.dispatch(recruiterApi.endpoints.rejectApplication.initiate({
          applicationId: '17',
          reason: 'Role requirements changed',
        })).unwrap(),
      },
    ];

    for (const action of actions) {
      await action.run();
    }

    const requests = fetchSpy.mock.calls.map(call => call[0] as Request);
    expect(requests.map(request => new URL(request.url).pathname)).toEqual(
      actions.map(action => action.path),
    );
    expect(requests.map(request => request.method)).toEqual(Array(5).fill('PUT'));
    expect(await requests[3].clone().json()).toEqual({ result: 'SELECTED' });
    expect(await requests[4].clone().json()).toEqual({ reason: 'Role requirements changed' });

    store.dispatch(baseApi.util.resetApiState());
  });
});
