import { configureStore } from '@reduxjs/toolkit';
import {
  candidateApi,
  extractProfilePictureUrl,
} from '../src/modules/candidate/api/candidateApi';
import { getProfilePictureHeaders } from '../src/modules/candidate/utils/resume';
import { ENV } from '../src/config/env';
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

describe('profile picture URL resolution', () => {
  test('uses the profile-pictures GET route with the returned file name', () => {
    const url = extractProfilePictureUrl({ profilePictureUrl: '/uploads/my profile.jpg' });

    expect(new URL(url!).pathname).toMatch(/\/api\/profile-pictures\/my%20profile\.jpg$/);
  });

  test('resolves a profile picture object that returns only its file name', () => {
    const url = extractProfilePictureUrl({
      profilePicture: { fileName: 'profile.jpg' },
    });

    expect(new URL(url!).pathname).toMatch(/\/api\/profile-pictures\/profile\.jpg$/);
  });

  test('keeps externally hosted profile picture URLs unchanged', () => {
    const url = 'https://cdn.example.com/profile.jpg';

    expect(extractProfilePictureUrl({ profilePictureUrl: url })).toBe(url);
  });

  test('rewrites a localhost profile picture URL to the configured backend', () => {
    const url = extractProfilePictureUrl({
      profilePictureUrl:
        'http://localhost:8085/api/profile-pictures/5857207b-0f0f-4a8e-b08a-151ccca441cb.jpg',
    });

    expect(new URL(url!).origin).toBe(new URL(ENV.API_BASE_URL).origin);
    expect(new URL(url!).pathname).toBe(
      '/api/profile-pictures/5857207b-0f0f-4a8e-b08a-151ccca441cb.jpg',
    );
    expect(
      getProfilePictureHeaders(
        'http://localhost:8085/api/profile-pictures/5857207b-0f0f-4a8e-b08a-151ccca441cb.jpg',
        'test-token',
      ),
    ).toEqual(expect.objectContaining({ Authorization: 'Bearer test-token' }));
  });
});

describe('GET job-seeker profile', () => {
  afterEach(() => jest.restoreAllMocks());

  test('fetches and normalizes profilePictureUrl from the profile response', async () => {
    const profilePictureUrl =
      'http://localhost:8085/api/profile-pictures/5857207b-0f0f-4a8e-b08a-151ccca441cb.jpg';
    const fetchSpy = mockFetch({ profilePictureUrl });
    globalThis.fetch = fetchSpy;
    const store = makeStore();

    const profile = await store
      .dispatch(candidateApi.endpoints.getJobSeekerProfile.initiate())
      .unwrap();

    expect(new URL(fetchSpy.mock.calls[0][0].url).pathname).toBe('/api/job-seeker/profile');
    expect(new URL(profile.profilePictureUrl!).origin).toBe(
      new URL(ENV.API_BASE_URL).origin,
    );
    expect(new URL(profile.profilePictureUrl!).pathname).toBe(
      '/api/profile-pictures/5857207b-0f0f-4a8e-b08a-151ccca441cb.jpg',
    );
    store.dispatch(baseApi.util.resetApiState());
  });
});

describe('GET job-seeker jobs filters', () => {
  afterEach(() => jest.restoreAllMocks());

  test('uses the advanced filter endpoint with its documented query parameters', async () => {
    const fetchSpy = mockFetch([
      {
        id: 7,
        recruiterId: 3,
        companyName: 'Acme Ltd',
        role: 'Backend Developer',
        salary: '₹8–12 LPA',
        experience: '2 years',
        candidateVacancies: 2,
        location: 'Bengaluru',
        status: 'ACTIVE',
        createdAt: '2026-10-24T10:30:00Z',
      },
    ]);
    globalThis.fetch = fetchSpy;

    const store = makeStore();
    const querySubscription = store.dispatch(
      candidateApi.endpoints.getJobSeekerJobs.initiate({
        keyword: 'developer',
        location: 'Bhopal',
        jobTypes: 'Job,Internship',
        workModes: 'On-site,Hybrid',
        industry: 'IT Services,Education',
        postedWithinDays: 7,
        companyTypes: 'Startup,MNC',
        experienceLevel: 'Entry Level,Mid Level',
        minSalaryLpa: 5,
        maxSalaryLpa: 20,
      }),
    );
    const jobs = await querySubscription.unwrap();
    querySubscription.unsubscribe();
    store.dispatch(baseApi.util.resetApiState());

    const httpRequest: Request = fetchSpy.mock.calls[0][0];
    const url = new URL(httpRequest.url);
    expect(url.pathname).toMatch(/\/api\/job-seeker\/jobs\/advanced-filter$/);
    expect(url.searchParams.get('keyword')).toBe('developer');
    expect(url.searchParams.get('location')).toBe('Bhopal');
    expect(url.searchParams.get('jobTypes')).toBe('Job,Internship');
    expect(url.searchParams.get('workModes')).toBe('On-site,Hybrid');
    expect(url.searchParams.get('industry')).toBe('IT Services,Education');
    expect(url.searchParams.get('postedWithinDays')).toBe('7');
    expect(url.searchParams.get('companyTypes')).toBe('Startup,MNC');
    expect(url.searchParams.get('experienceLevel')).toBe('Entry Level,Mid Level');
    expect(url.searchParams.get('minSalaryLpa')).toBe('5');
    expect(url.searchParams.get('maxSalaryLpa')).toBe('20');
    expect(jobs[0]).toMatchObject({
      id: '7',
      companyName: 'Acme Ltd',
      role: 'Backend Developer',
      location: 'Bengaluru',
      status: 'ACTIVE',
      candidateVacancies: 2,
    });
  });

  describe('POST job-seeker jobs save', () => {
    afterEach(() => jest.restoreAllMocks());

    test('saves a job with no request body', async () => {
      const fetchSpy = jest.fn().mockResolvedValue(new Response(null, { status: 204 }));
      globalThis.fetch = fetchSpy;
      const store = makeStore();

      await store.dispatch(candidateApi.endpoints.saveJob.initiate({ jobId: '42' })).unwrap();

      const request: Request = fetchSpy.mock.calls[0][0];
      expect(request.method).toBe('POST');
      expect(request.url).toMatch(/\/api\/job-seeker\/jobs\/42\/save$/);
      expect(await request.clone().text()).toBe('');
      store.dispatch(baseApi.util.resetApiState());
    });
  });

  describe('POST job-seeker profile picture', () => {
    afterEach(() => jest.restoreAllMocks());

    test('uploads multipart form data to the authenticated profile-picture endpoint', async () => {
      const fetchSpy = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ profilePictureUrl: '/uploads/profile.jpg' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      globalThis.fetch = fetchSpy;
      const store = makeStore();
      store.dispatch(setCredentials({
        token: 'recruiter-jwt-token',
        user: {
          id: '1',
          role: 'CANDIDATE',
          name: 'Test Candidate',
          phone: '1234567890',
          isVerified: true,
        },
      }));

      const formData = new FormData();
      formData.append('file', 'profile-picture-content');
      await store.dispatch(
        candidateApi.endpoints.uploadJobSeekerProfilePicture.initiate(formData),
      ).unwrap();

      const request: Request = fetchSpy.mock.calls[0][0];
      expect(new URL(request.url).pathname).toMatch(/\/api\/job-seeker\/profile-picture$/);
      expect(request.method).toBe('POST');
      expect(request.headers.get('Authorization')).toBe('Bearer recruiter-jwt-token');
      expect(request.headers.get('Content-Type')).toMatch(/^multipart\/form-data; boundary=/);
      expect(await request.clone().text()).toContain('name="file"');
      store.dispatch(baseApi.util.resetApiState());
    });
  });

  describe('saved jobs', () => {
    afterEach(() => jest.restoreAllMocks());

    test('loads saved jobs from a paginated envelope with nested job records', async () => {
      const fetchSpy = mockFetch({
        data: {
          content: [{
            id: 900,
            job: {
              id: 42,
              companyName: 'Acme Ltd',
              role: 'Backend Developer',
              location: 'Bengaluru',
              salary: '₹8–12 LPA',
            },
          }],
        },
      });
      globalThis.fetch = fetchSpy;
      const store = makeStore();
      const subscription = store.dispatch(candidateApi.endpoints.getSavedJobs.initiate());

      const jobs = await subscription.unwrap();

      expect(fetchSpy.mock.calls[0][0].url).toMatch(/\/api\/job-seeker\/jobs\/saved$/);
      expect(jobs).toMatchObject([{
        id: '42',
        companyName: 'Acme Ltd',
        role: 'Backend Developer',
        location: 'Bengaluru',
      }]);
      subscription.unsubscribe();
      store.dispatch(baseApi.util.resetApiState());
    });

    test('discards a saved job with DELETE and no request body', async () => {
      const fetchSpy = jest.fn().mockResolvedValue(new Response(null, { status: 204 }));
      globalThis.fetch = fetchSpy;
      const store = makeStore();

      await store.dispatch(candidateApi.endpoints.removeSavedJob.initiate({ jobId: '42' })).unwrap();

      const request: Request = fetchSpy.mock.calls[0][0];
      expect(request.method).toBe('DELETE');
      expect(request.url).toMatch(/\/api\/job-seeker\/jobs\/42\/save$/);
      expect(await request.clone().text()).toBe('');
      store.dispatch(baseApi.util.resetApiState());
    });
  });

  describe('GET job-seeker applications', () => {
    afterEach(() => jest.restoreAllMocks());

    test('normalizes job, recruiter, timeline and interview details', async () => {
      const fetchSpy = mockFetch({
        applications: [{
          id: 21,
          jobId: 7,
          status: 'INTERVIEW_SCHEDULED',
          appliedAt: '2026-10-24T10:30:00Z',
          job: {
            id: 7,
            title: 'Product Designer',
            location: 'Bengaluru',
            company: { name: 'Acme Ltd', logoUrl: 'https://cdn.example.com/acme.png' },
          },
          recruiter: { fullName: 'Taylor Recruiter', email: 'taylor@example.com' },
          statusHistory: [{ status: 'APPLIED', changedAt: '2026-10-24T10:30:00Z' }],
          interviewDetails: {
            scheduledAt: '2026-11-02T09:00:00Z',
            mode: 'VIDEO',
            meetingLink: 'https://meet.example.com/room',
            notes: 'Bring your portfolio',
          },
        }],
      });
      globalThis.fetch = fetchSpy;

      const store = makeStore();
      const querySubscription = store.dispatch(candidateApi.endpoints.getMyApplications.initiate());
      const applications = await querySubscription.unwrap();
      querySubscription.unsubscribe();
      store.dispatch(baseApi.util.resetApiState());

      const httpRequest: Request = fetchSpy.mock.calls[0][0];
      expect(httpRequest.url).toMatch(/\/api\/job-seeker\/applications$/);
      expect(applications[0]).toMatchObject({
        applicationId: '21',
        jobId: '7',
        status: 'INTERVIEW_SCHEDULED',
        job: {
          role: 'Product Designer',
          companyName: 'Acme Ltd',
          companyLogoUrl: 'https://cdn.example.com/acme.png',
          location: 'Bengaluru',
        },
        recruiter: { name: 'Taylor Recruiter', email: 'taylor@example.com' },
        timeline: [{ status: 'APPLIED', changedAt: '2026-10-24T10:30:00Z' }],
        interview: {
          scheduledAt: '2026-11-02T09:00:00Z',
          mode: 'VIDEO',
          locationOrLink: 'https://meet.example.com/room',
          notes: 'Bring your portfolio',
        },
      });
    });

    test('normalizes the recruiter interviewAt and details response fields', async () => {
      globalThis.fetch = mockFetch([{
        id: 22,
        jobId: 8,
        status: 'INTERVIEW_SCHEDULED',
        job: { title: 'Developer', companyName: 'YYJCPL', location: 'Noida' },
        interviewDetails: {
          interviewAt: '05-11-2026 10:30 AM',
          mode: 'In Person',
          details: 'Interview at the office.',
        },
      }]);

      const store = makeStore();
      const subscription = store.dispatch(candidateApi.endpoints.getMyApplications.initiate());
      const applications = await subscription.unwrap();

      expect(applications[0]).toMatchObject({
        status: 'INTERVIEW_SCHEDULED',
        interview: {
          scheduledAt: '05-11-2026 10:30 AM',
          mode: 'In Person',
          notes: 'Interview at the office.',
        },
      });
      subscription.unsubscribe();
      store.dispatch(baseApi.util.resetApiState());
    });

    describe('POST job-seeker resume', () => {
      afterEach(() => jest.restoreAllMocks());

      test('uploads multipart form data to the job-seeker resume endpoint', async () => {
        const fetchSpy = jest.fn().mockImplementation(() =>
          Promise.resolve(new Response(JSON.stringify({
            resumeUrl: '/api/resumes/resume-id.pdf',
            fileName: 'my-resume.pdf',
            contentType: 'application/pdf',
            size: 245678,
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })),
        );
        globalThis.fetch = fetchSpy;

        const formData = new FormData();
        formData.append('file', 'resume-file-content');

        const store = makeStore();
        await store.dispatch(candidateApi.endpoints.uploadResume.initiate(formData)).unwrap();

        const request = fetchSpy.mock.calls[0][0] as Request;
        expect(new URL(request.url).pathname).toBe('/api/job-seeker/resume');
        expect(request.method).toBe('POST');
        expect(request.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/);

        store.dispatch(baseApi.util.resetApiState());
      });
    });
  });

  test('uses the standard jobs endpoint for keyword-only searches', async () => {
    const fetchSpy = mockFetch([]);
    globalThis.fetch = fetchSpy;

    const store = makeStore();
    const querySubscription = store.dispatch(
      candidateApi.endpoints.getJobSeekerJobs.initiate({ keyword: 'developer' }),
    );
    await querySubscription.unwrap();
    querySubscription.unsubscribe();
    store.dispatch(baseApi.util.resetApiState());

    const httpRequest: Request = fetchSpy.mock.calls[0][0];
    expect(httpRequest.url).toMatch(/\/api\/job-seeker\/jobs\?keyword=developer$/);
  });
});
