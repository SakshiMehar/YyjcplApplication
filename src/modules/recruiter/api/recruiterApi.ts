import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import { baseApi } from '../../../store/api/baseApi';
import { logApi } from '../../../utils/apiLogger';
import { ApplicationStatus } from '../../../constants/applicationStatus';
import {
  CandidateProfile,
  Company,
  ID,
  Interview,
  InterviewMode,
  Job,
  JobApplication,
  Paginated,
  SubscriptionPlan,
  User,
} from '../../../types/models';

export type CandidateSearchParams = {
  q?: string;
  skills?: string;
  location?: string;
  minExperience?: number;
  page?: number;
};

export type CandidateSearchResult = Pick<User, 'id' | 'name' | 'avatarUrl'> &
  Pick<CandidateProfile, 'headline' | 'location' | 'skills'>;

/** Body of PUT /api/recruiter/profile – the signed-in recruiter's company profile. */
export type RecruiterProfileBody = {
  companyName: string;
  companyWebsite?: string;
  companyIndustry?: string;
  companyDescription?: string;
  companyLocation?: string;
  profilePictureUrl?: string;
};

/** Response of GET /api/recruiter/profile */
export type RecruiterProfile = {
  companyName?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  companyDescription?: string;
  companyLocation?: string;
  profilePictureUrl?: string;
};

export type RecruiterJob = {
  id: ID;
  companyName: string;
  role: string;
  salary: string;
  experience: string;
  candidateVacancies: number;
  location: string;
  approvalStatus?: Job['approvalStatus'];
  postedAt?: string;
};

export type RecruiterJobBody = {
  companyName: string;
  role: string;
  salary: string;
  experience: string;
  candidateVacancies: number;
  location: string;
};

export type InterviewModeBackend = 'ONLINE' | 'OFFLINE' | 'PHONE';
export type InterviewModeApi = 'Online' | 'In Person' | 'Phone';

export type ApplicationInterviewBody = {
  interviewAt: string;           // DD-MM-YYYY hh:mm AM/PM
  mode: InterviewModeApi;
  details: string;
};

export type ApplicationInterviewResponse = {
  interviewAt: string;
  mode: InterviewModeApi;
  details: string;
};

export type ApplicationResultBody = {
  result: 'SELECTED' | 'NOT_SELECTED';
  note?: string;
};

const httpStatus = (meta: unknown) => (meta as FetchBaseQueryMeta | undefined)?.response?.status;

/** Application shape returned by GET /api/recruiter/applications */
export type RecruiterApplication = {
  applicationId: number;
  jobId: number;
  jobSeekerId: number;
  applicantName?: string;   // name of the job seeker — ask backend to include this
  jobSeekerName?: string;   // alternate field name the backend might use
  status: string;
  appliedAt: string;
  interviewAt?: string;
  interview?: ApplicationInterviewResponse;
  interviewDetails?: ApplicationInterviewResponse;
  jobSeekerProfile: {
    name?: string;          // some backends include name here
    headline?: string;
    experience?: string;
    skills?: string;
    resumeUrl?: string;
    preferredLocation?: string;
    education?: string;
    certifications?: string;
    languages?: string;
    currentSalary?: string;
    expectedSalary?: string;
    preferredRole?: string;
    phone?: string;
    email?: string;
  };
  job?: {
    role?: string;
    companyName?: string;
    location?: string;
  };
};

function normalizeRecruiterJobs(raw: unknown): RecruiterJob[] {
  if (Array.isArray(raw)) {
    return raw as RecruiterJob[];
  }
  const body = raw as { items?: unknown; data?: unknown; jobs?: unknown };
  const list = body.items ?? body.data ?? body.jobs;
  return Array.isArray(list) ? (list as RecruiterJob[]) : [];
}

export const recruiterApi = baseApi.injectEndpoints({
  endpoints: build => ({
    /* Company */
    updateCompany: build.mutation<Company, Partial<Company>>({
      query: body => ({ url: '/recruiter/company', method: 'PUT', body }),
      invalidatesTags: ['Company'],
    }),
    /** GET /api/recruiter/profile */
    getRecruiterProfile: build.query<RecruiterProfile, void>({
      query: () => '/recruiter/profile',
      providesTags: ['Company'],
    }),

    /** Create or update the signed-in recruiter's company profile – PUT /api/recruiter/profile. */
    upsertRecruiterProfile: build.mutation<unknown, RecruiterProfileBody>({
      query: body => ({
        url: '/recruiter/profile',
        method: 'PUT',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: (res: unknown, meta) => {
        logApi('PUT /api/recruiter/profile', httpStatus(meta), res);
        return res;
      },
      transformErrorResponse: (err, meta) => {
        logApi('PUT /api/recruiter/profile (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
      invalidatesTags: ['Company'],
    }),

    /* Jobs */
    getMyJobs: build.query<RecruiterJob[], { status?: string; page?: number } | void>({
      query: params => (params ? { url: '/recruiter/jobs', params } : { url: '/recruiter/jobs' }),
      transformResponse: (res: unknown, meta) => {
        logApi('GET /api/recruiter/jobs', httpStatus(meta), res);
        return normalizeRecruiterJobs(res);
      },
      transformErrorResponse: (err, meta) => {
        logApi('GET /api/recruiter/jobs (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
      providesTags: ['MyJobs'],
    }),
    createJob: build.mutation<RecruiterJob, RecruiterJobBody>({
      query: body => ({ url: '/recruiter/jobs', method: 'POST', body }),
      transformResponse: (res: RecruiterJob, meta) => {
        logApi('POST /api/recruiter/jobs', httpStatus(meta), res);
        return res;
      },
      transformErrorResponse: (err, meta) => {
        logApi('POST /api/recruiter/jobs (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
      invalidatesTags: ['MyJobs'],
    }),
    updateJob: build.mutation<Job, { id: ID } & Partial<Job>>({
      query: ({ id, ...body }) => ({ url: `/recruiter/jobs/${id}`, method: 'PUT', body }),
      invalidatesTags: ['MyJobs'],
    }),

    /* Dashboard counts */
    getJobsCount: build.query<number, void>({
      query: () => '/recruiter/jobs/count',
      transformResponse: (res: unknown, meta) => {
        logApi('GET /api/recruiter/jobs/count', httpStatus(meta), res);
        const r = res as { count?: number; total?: number } | number;
        return typeof r === 'number' ? r : (r?.count ?? r?.total ?? 0);
      },
      transformErrorResponse: (err, meta) => {
        logApi('GET /api/recruiter/jobs/count (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
      providesTags: ['MyJobs'],
    }),
    getActiveJobsCount: build.query<number, void>({
      query: () => '/recruiter/jobs/active/count',
      transformResponse: (res: unknown, meta) => {
        logApi('GET /api/recruiter/jobs/active/count', httpStatus(meta), res);
        const r = res as { count?: number; total?: number } | number;
        return typeof r === 'number' ? r : (r?.count ?? r?.total ?? 0);
      },
      transformErrorResponse: (err, meta) => {
        logApi('GET /api/recruiter/jobs/active/count (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
      providesTags: ['MyJobs'],
    }),
    getApplicationsCount: build.query<number, void>({
      query: () => '/recruiter/applications/count',
      transformResponse: (res: unknown, meta) => {
        logApi('GET /api/recruiter/applications/count', httpStatus(meta), res);
        const r = res as { count?: number; total?: number; metric?: string } | number;
        return typeof r === 'number' ? r : (r?.count ?? r?.total ?? 0);
      },
      transformErrorResponse: (err, meta) => {
        logApi('GET /api/recruiter/applications/count (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
      providesTags: ['Application'],
    }),
    getShortlistedCount: build.query<number, void>({
      query: () => '/recruiter/applications/shortlisted/count',
      transformResponse: (res: unknown, meta) => {
        logApi('GET /api/recruiter/applications/shortlisted/count', httpStatus(meta), res);
        const r = res as { count?: number; total?: number; metric?: string } | number;
        return typeof r === 'number' ? r : (r?.count ?? r?.total ?? 0);
      },
      transformErrorResponse: (err, meta) => {
        logApi('GET /api/recruiter/applications/shortlisted/count (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
      providesTags: ['Application', 'Shortlist'],
    }),

    /* Applications pipeline */
    getJobApplications: build.query<RecruiterApplication[], void>({
      query: () => '/recruiter/applications',
      transformResponse: (res: unknown) => {
        if (Array.isArray(res)) return res as RecruiterApplication[];
        const r = res as { items?: unknown; data?: unknown; applications?: unknown };
        const list = r.items ?? r.data ?? r.applications;
        return Array.isArray(list) ? (list as RecruiterApplication[]) : [];
      },
      providesTags: ['Application'],
    }),
    updateApplicationStatus: build.mutation<
      JobApplication,
      { id: ID; status: ApplicationStatus; note?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/recruiter/applications/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Application', 'Shortlist'],
    }),
    shortlistApplication: build.mutation<unknown, ID>({
      query: applicationId => ({
        url: `/recruiter/applications/${applicationId}/shortlist`,
        method: 'PUT',
      }),
      invalidatesTags: ['Application', 'Shortlist'],
    }),
    scheduleApplicationInterview: build.mutation<
      ApplicationInterviewResponse,
      { applicationId: ID } & ApplicationInterviewBody
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/recruiter/applications/${applicationId}/interview`,
        method: 'PUT',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['Application', 'Interview'],
    }),
    updateApplicationResult: build.mutation<
      unknown,
      { applicationId: ID } & ApplicationResultBody
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/recruiter/applications/${applicationId}/result`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Application', 'Shortlist', 'Interview'],
    }),
    rejectApplication: build.mutation<
      unknown,
      { applicationId: ID; reason?: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/recruiter/applications/${applicationId}/reject`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Application', 'Shortlist', 'Interview'],
    }),

    /* Candidate search & shortlist */
    searchCandidates: build.query<Paginated<CandidateSearchResult>, CandidateSearchParams>({
      query: params => ({ url: '/recruiter/candidates', params }),
      providesTags: ['Candidate'],
    }),
    getCandidate: build.query<CandidateProfile & { user: User }, ID>({
      query: id => `/recruiter/candidates/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Candidate', id }],
    }),
    getShortlist: build.query<JobApplication[], { jobId?: ID }>({
      query: params => ({ url: '/recruiter/shortlist', params }),
      providesTags: ['Shortlist'],
    }),

    /* Interviews */
    getRecruiterInterviews: build.query<Interview[], void>({
      query: () => '/recruiter/interviews',
      providesTags: ['Interview'],
    }),
    scheduleInterview: build.mutation<
      Interview,
      { applicationId: ID; scheduledAt: string; mode: InterviewMode; locationOrLink?: string; notes?: string }
    >({
      query: body => ({ url: '/recruiter/interviews', method: 'POST', body }),
      invalidatesTags: ['Interview', 'Application'],
    }),

    /* Subscription & payments */
    getPlans: build.query<SubscriptionPlan[], void>({
      query: () => '/subscriptions/plans',
      providesTags: ['Subscription'],
    }),
    createPaymentOrder: build.mutation<
      { orderId: string; amount: number; currency: string; gatewayKey: string },
      { planId: ID }
    >({
      query: body => ({ url: '/payments/orders', method: 'POST', body }),
    }),
    verifyPayment: build.mutation<{ success: boolean }, Record<string, string>>({
      query: body => ({ url: '/payments/verify', method: 'POST', body }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

export const {
  useUpdateCompanyMutation,
  useGetRecruiterProfileQuery,
  useUpsertRecruiterProfileMutation,
  useGetMyJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useGetJobsCountQuery,
  useGetActiveJobsCountQuery,
  useGetApplicationsCountQuery,
  useGetShortlistedCountQuery,
  useGetJobApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useShortlistApplicationMutation,
  useScheduleApplicationInterviewMutation,
  useUpdateApplicationResultMutation,
  useRejectApplicationMutation,
  useSearchCandidatesQuery,
  useGetCandidateQuery,
  useGetShortlistQuery,
  useGetRecruiterInterviewsQuery,
  useScheduleInterviewMutation,
  useGetPlansQuery,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
} = recruiterApi;
