import { configureStore } from '@reduxjs/toolkit';
import { candidateApi } from '../src/modules/candidate/api/candidateApi';
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
