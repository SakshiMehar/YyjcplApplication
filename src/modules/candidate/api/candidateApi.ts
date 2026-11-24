import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import { baseApi } from '../../../store/api/baseApi';
import { ID } from '../../../types/models';
import { logApi } from '../../../utils/apiLogger';
import { resolveProfilePictureUrl } from '../utils/resume';

const httpStatus = (meta: unknown) =>
  (meta as FetchBaseQueryMeta | undefined)?.response?.status;

const asProfileRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

function findProfilePictureUrl(value: unknown, depth = 0): string | undefined {
  if (depth > 4) return undefined;
  if (typeof value === 'string' && value.trim()) return value.trim();
  const record = asProfileRecord(value);
  if (!record) return undefined;

  for (const key of ['profilePictureUrl', 'profileImageUrl', 'avatarUrl', 'imageUrl', 'url']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }

  const profilePictureFileName = asProfileRecord(record.profilePicture)?.fileName;
  if (typeof profilePictureFileName === 'string' && profilePictureFileName.trim()) {
    return profilePictureFileName.trim();
  }

  for (const key of ['data', 'profile', 'jobSeekerProfile', 'user', 'profilePicture']) {
    const candidate = findProfilePictureUrl(record[key], depth + 1);
    if (candidate) return candidate;
  }
  return undefined;
}

export function extractProfilePictureUrl(response: unknown): string | undefined {
  const url = findProfilePictureUrl(response);
  return url ? resolveProfilePictureUrl(url) : undefined;
}

function normalizeJobSeekerProfile(response: unknown): JobSeekerProfile {
  const outer = asProfileRecord(response);
  let profile = outer;
  for (let depth = 0; depth < 4 && profile; depth += 1) {
    const nested =
      asProfileRecord(profile.data) ??
      asProfileRecord(profile.profile) ??
      asProfileRecord(profile.jobSeekerProfile);
    if (!nested) break;
    profile = nested;
  }
  if (!profile) {
    throw new Error('Unexpected job-seeker profile response.');
  }
  return {
    ...(profile as JobSeekerProfile),
    profilePictureUrl: extractProfilePictureUrl(response),
  };
}

/* ─── Types ──────────────────────────────────────────────────────────────── */

/** Flat job shape returned by GET /api/job-seeker/jobs */
export type JobSeekerJob = {
  id: ID;
  recruiterId?: ID;
  companyName: string;
  role: string;
  salary?: string;
  experience?: string;
  location: string;
  candidateVacancies?: number;
  /** Current job lifecycle state returned by the job-seeker API, e.g. ACTIVE. */
  status?: string;
  isSaved?: boolean;
  createdAt?: string;
  approvalStatus?: string;
  postedAt?: string;
};

export type JobSeekerJobsParams = {
  /** Keyword also covers the job department / role. */
  keyword?: string;
  /** @deprecated Use keyword. Retained for existing callers. */
  q?: string;
  location?: string;
  /** Legacy range filters supported by /jobs/filter. */
  minExperience?: number;
  maxExperience?: number;
  minSalary?: number;
  maxSalary?: number;
  /** Advanced filter endpoint accepts comma-separated values for these fields. */
  jobTypes?: string;
  workModes?: string;
  industry?: string;
  postedWithinDays?: number;
  companyTypes?: string;
  experienceLevel?: string;
  minSalaryLpa?: number;
  maxSalaryLpa?: number;
};

export type CareerPreferences = {
  lookingFor: 'JOB' | 'INTERNSHIP';
  preferredJobRoles: string[];
  expectedSalaryPerYear: number;
  preferredLocations: string[];
};

/** Shape returned by GET /api/job-seeker/profile */
export type JobSeekerProfile = {
  profilePictureUrl?: string;
  headline?: string;
  professionalSummary?: string;
  experience?: string;
  skills?: string;
  resumeUrl?: string;
  preferredLocation?: string;
  education?: string;
  projects?: string;
  socialMediaLinks?: string;
  certifications?: string;
  languages?: string;
  joiningDate?: string;
  currentSalary?: string;
  expectedSalary?: string;
  preferredRole?: string;
};

/** Full payload sent to PUT /api/job-seeker/profile — all fields required as strings */
export type JobSeekerProfilePayload = {
  headline: string;
  professionalSummary: string;
  experience: string;
  skills: string;
  resumeUrl: string;
  preferredLocation: string;
  education: string;
  projects: string;
  socialMediaLinks: string;
  certifications: string;
  languages: string;
  joiningDate: string;
  currentSalary: string;
  expectedSalary: string;
  preferredRole: string;
};

/** Response from POST /api/job-seeker/resume */
export type ResumeUploadResponse = {
  resumeUrl: string;
  fileName: string;
  contentType: string;
  size: number;
};

/** Response from POST /api/job-seeker/jobs/{jobId}/applications */
export type ApplyJobResponse = {
  applicationId: number;
  jobId: number;
  jobSeekerId: number;
  status: string;
  appliedAt: string;
  jobSeekerProfile: {
    headline?: string;
    experience?: string;
    skills?: string;
    resumeUrl?: string;
  };
};

/** A job application returned by GET /api/job-seeker/applications. */
export type JobSeekerApplication = {
  applicationId: ID;
  jobId: ID;
  status: string;
  appliedAt?: string;
  timeline?: Array<{ status: string; changedAt?: string; note?: string }>;
  recruiter?: { name?: string; title?: string; email?: string; phone?: string };
  interview?: ApplicationSchedule;
  nextRound?: ApplicationSchedule;
  resultNote?: string;
  job?: {
    id?: ID;
    role?: string;
    title?: string;
    companyName?: string;
    companyLogoUrl?: string;
    location?: string;
    salary?: string;
    experience?: string;
    description?: string;
  };
};

/** Counts displayed in the job seeker's Jobs dashboard header. */
export type JobSeekerDashboardCounts = {
  savedJobsCount: number;
  appliedJobsCount: number;
  interviewCount: number;
};

export type ApplicationSchedule = {
  scheduledAt?: string;
  mode?: string;
  locationOrLink?: string;
  notes?: string;
};

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord | undefined =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as ApiRecord) : undefined;

const asText = (...values: unknown[]): string | undefined => {
  const value = values.find(item => typeof item === 'string' || typeof item === 'number');
  return value === undefined ? undefined : String(value);
};

function normalizeCareerPreferences(response: unknown): CareerPreferences {
  const outer = asRecord(response);
  const body = asRecord(outer?.data) ?? outer;
  const roles = Array.isArray(body?.preferredJobRoles)
    ? body.preferredJobRoles.filter((value): value is string => typeof value === 'string')
    : [];
  const locations = Array.isArray(body?.preferredLocations)
    ? body.preferredLocations.filter((value): value is string => typeof value === 'string')
    : [];
  const lookingFor = body?.lookingFor === 'INTERNSHIP' ? 'INTERNSHIP' : 'JOB';
  const salary = Number(body?.expectedSalaryPerYear);

  return {
    lookingFor,
    preferredJobRoles: roles,
    expectedSalaryPerYear: Number.isFinite(salary) ? salary : 0,
    preferredLocations: locations,
  };
}

function normalizeApplications(res: unknown): JobSeekerApplication[] {
  const body = asRecord(res);
  const list = Array.isArray(res)
    ? res
    : body?.items ?? body?.data ?? body?.applications ?? body?.content;

  if (!Array.isArray(list)) return [];

  return list.flatMap(item => {
    const application = asRecord(item);
    if (!application) return [];

    const job = asRecord(application.job) ?? asRecord(application.jobDetails);
    const company = asRecord(job?.company);
    const interview =
      asRecord(application.interview) ??
      asRecord(application.interviewDetails) ??
      asRecord(application.scheduledInterview) ??
      asRecord(application.interviewSchedule) ??
      (application.interviewAt ? application : undefined);
    const nextRound =
      asRecord(application.nextRound) ??
      asRecord(application.nextRoundDetails) ??
      asRecord(application.nextRoundInterview) ??
      asRecord(application.nextRoundSchedule) ??
      (application.nextRoundAt
        ? {
            interviewAt: application.nextRoundAt,
            mode: application.nextRoundMode ?? application.mode,
            details: application.nextRoundDetails ?? application.details,
          }
        : undefined);
    const recruiter = asRecord(application.recruiter) ?? asRecord(application.recruiterDetails);
    const timeline = application.timeline ?? application.history ?? application.statusHistory;

    const normalizeSchedule = (schedule?: ApiRecord): ApplicationSchedule | undefined =>
      schedule
        ? {
          scheduledAt: asText(
            schedule.scheduledAt,
            schedule.interviewAt,
            schedule.dateTime,
            schedule.interviewDateTime,
          ),
          mode: asText(schedule.mode, schedule.interviewMode),
          locationOrLink: asText(
            schedule.locationOrLink,
            schedule.meetingLink,
            schedule.location,
            schedule.venue,
          ),
          notes: asText(schedule.notes, schedule.details, schedule.note),
        }
        : undefined;

    return [{
      applicationId: asText(application.applicationId, application.id, application._id) ?? '',
      jobId: asText(application.jobId, job?.id, job?.jobId) ?? '',
      status: asText(application.status) ?? 'APPLIED',
      appliedAt: asText(application.appliedAt, application.createdAt),
      timeline: Array.isArray(timeline)
        ? timeline.flatMap(entry => {
            const historyRecord = asRecord(entry);
            return historyRecord
              ? [{
                  status: asText(historyRecord.status) ?? 'APPLIED',
                  changedAt: asText(historyRecord.changedAt, historyRecord.createdAt, historyRecord.timestamp),
                  note: asText(historyRecord.note, historyRecord.message),
                }]
              : [];
          })
        : undefined,
      recruiter: recruiter || application.recruiterName || application.recruiterEmail
        ? {
            name: asText(recruiter?.name, recruiter?.fullName, application.recruiterName),
            title: asText(recruiter?.title, recruiter?.role),
            email: asText(recruiter?.email, application.recruiterEmail),
            phone: asText(recruiter?.phone, recruiter?.phoneNumber, application.recruiterPhone),
          }
        : undefined,
      interview: normalizeSchedule(interview),
      nextRound: normalizeSchedule(nextRound),
      resultNote: asText(
        application.resultNote,
        application.rejectionReason,
        application.recruiterNote,
      ),
      job: job
        ? {
            id: asText(job.id, job.jobId),
            role: asText(job.role, job.title, application.jobRole, application.role),
            title: asText(job.title, job.role),
            companyName: asText(job.companyName, company?.name, application.companyName),
            companyLogoUrl: asText(job.companyLogoUrl, job.logoUrl, company?.logoUrl),
            location: asText(job.location, application.location),
            salary: asText(job.salary, application.salary),
            experience: asText(job.experience, application.experience),
            description: asText(job.description),
          }
        : {
            role: asText(application.jobRole, application.role, application.jobTitle),
            companyName: asText(application.companyName),
            companyLogoUrl: asText(application.companyLogoUrl, application.companyLogo),
            location: asText(application.location),
          },
    }];
  });

}

function normalizeDashboardCounts(res: unknown): JobSeekerDashboardCounts {
  const body = asRecord(res);
  const data = asRecord(body?.data) ?? body;
  const count = (value: unknown) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    savedJobsCount: count(data?.savedJobsCount),
    appliedJobsCount: count(data?.appliedJobsCount),
    interviewCount: count(data?.interviewCount),
  };
}

function normalizeJobs(res: unknown): JobSeekerJob[] {
  const unwrapJobs = (value: unknown, depth = 0): unknown[] | undefined => {
    if (Array.isArray(value)) return value;
    if (depth >= 5) return undefined;

    const body = asRecord(value);
    if (!body) return undefined;

    for (const key of ['items', 'data', 'jobs', 'savedJobs', 'content', 'results']) {
      if (body[key] !== undefined) {
        const unwrapped = unwrapJobs(body[key], depth + 1);
        if (unwrapped) return unwrapped;
      }
    }

    return undefined;
  };
  const list = unwrapJobs(res);
  if (!list) {
    throw new Error('Unexpected saved jobs response: expected a jobs array.');
  }

  const jobs = list.flatMap(item => {
    const savedItem = asRecord(item);
    if (!savedItem) return [];
    const job =
      asRecord(savedItem.job) ??
      asRecord(savedItem.jobDetails) ??
      asRecord(savedItem.jobPost) ??
      savedItem;

    const id = asText(job.id, job.jobId);
    if (!id) return [];

    return [{
      id,
      recruiterId: asText(job.recruiterId),
      companyName: asText(job.companyName) ?? 'Company details unavailable',
      role: asText(job.role, job.title) ?? 'Untitled role',
      salary: asText(job.salary),
      experience: asText(job.experience),
      location: asText(job.location) ?? 'Location not specified',
      candidateVacancies: typeof job.candidateVacancies === 'number' ? job.candidateVacancies : undefined,
      status: asText(job.status),
      isSaved: typeof job.isSaved === 'boolean' ? job.isSaved : undefined,
      createdAt: asText(job.createdAt),
      approvalStatus: asText(job.approvalStatus, job.status),
      postedAt: asText(job.postedAt, job.createdAt),
    }];
  });

  // A job can appear more than once in some backend responses (for example,
  // when it matches more than one recommendation rule). Keep the first copy so
  // every rendered item has one stable, unique job ID.
  return [...new Map(jobs.map(job => [job.id, job])).values()];
}

/** Single project from GET /api/job-seeker/projects */
export type Project = {
  id: number;
  projectTitle: string;
  client?: string;
  projectStatus: 'IN_PROGRESS' | 'FINISHED';
  workedFrom: string;
  workTill?: string;
  projectDetails: string;
  projectLocation?: string;
  projectSite?: 'OFF_SITE' | 'ON_SITE';
  natureOfEmployment?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTUAL';
  teamSize?: number;
  roleInProject?: string;
  roleDescription?: string;
  skillsUsed?: string;
};

export type AddProjectPayload = {
  projectTitle: string;
  client?: string;
  projectStatus: 'IN_PROGRESS' | 'FINISHED';
  workedFrom: string;
  workTill?: string;
  projectDetails: string;
  projectLocation?: string;
  projectSite?: 'OFF_SITE' | 'ON_SITE';
  natureOfEmployment?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTUAL';
  teamSize?: number;
  roleInProject?: string;
  roleDescription?: string;
  skillsUsed?: string;
};

/** Single certification from GET /api/job-seeker/certifications */
export type Certification = {
  id: number;
  certificationName: string;
  certificationCompletionId?: string;
  certificationUrl?: string;
  validFrom?: string;
  validTill?: string;
  certificationExpired: boolean;
};

/** A blocked company entry from GET /api/recruiter/blocked-job-seekers */
export type BlockedCompanyEntry = {
  // Backend may use any of these field names — handle all variants
  targetUserId?: number;
  recruiterId?: number;
  userId?: number;
  id?: number;
  targetRole?: string;
  blocked?: boolean;
  blockedAt?: string;
  companyName?: string;
  recruiterName?: string;
};

/* ─── Endpoints ──────────────────────────────────────────────────────────── */

export const candidateApi = baseApi.injectEndpoints({
  endpoints: build => ({
    /* GET /api/job-seeker/profile */
    getJobSeekerProfile: build.query<JobSeekerProfile, void>({
      query: () => '/job-seeker/profile',
      transformResponse: normalizeJobSeekerProfile,
      providesTags: ['CandidateProfile'],
    }),

    /* PUT /api/job-seeker/profile */
    updateJobSeekerProfile: build.mutation<JobSeekerProfile, JobSeekerProfilePayload>({
      query: body => ({
        url: '/job-seeker/profile',
        method: 'PUT',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['CandidateProfile'],
    }),

    /* GET /api/job-seeker/career-preferences */
    getCareerPreferences: build.query<CareerPreferences, void>({
      query: () => '/job-seeker/career-preferences',
      transformResponse: normalizeCareerPreferences,
      providesTags: ['CandidateProfile'],
    }),

    /* PUT /api/job-seeker/career-preferences */
    updateCareerPreferences: build.mutation<CareerPreferences, CareerPreferences>({
      query: body => ({
        url: '/job-seeker/career-preferences',
        method: 'PUT',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: normalizeCareerPreferences,
      invalidatesTags: ['CandidateProfile'],
    }),

    /* POST /api/job-seeker/profile-picture — JWT-authenticated multipart/form-data */
    uploadJobSeekerProfilePicture: build.mutation<unknown, FormData>({
      query: formData => ({
        url: '/job-seeker/profile-picture',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['CandidateProfile'],
    }),

    /* POST /api/job-seeker/resume — multipart/form-data, field name: 'file', PDF only */
    uploadResume: build.mutation<ResumeUploadResponse, FormData>({
      query: formData => ({
        url: '/job-seeker/resume',
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser/RN sets it with the correct boundary automatically
      }),
      invalidatesTags: ['CandidateProfile'],
    }),

    /* POST /api/job-seeker/jobs/{jobId}/applications — no body, JWT required */
    applyToJob: build.mutation<ApplyJobResponse, { jobId: ID }>({
      query: ({ jobId }) => ({
        url: `/job-seeker/jobs/${jobId}/applications`,
        method: 'POST',
      }),
      invalidatesTags: ['Application'],
    }),

    /* POST /api/job-seeker/jobs/{jobId}/save — no request body */
    saveJob: build.mutation<void, { jobId: ID }>({
      query: ({ jobId }) => ({
        url: `/job-seeker/jobs/${jobId}/save`,
        method: 'POST',
      }),
      invalidatesTags: ['Job', 'SavedJob'],
    }),

    /* GET /api/job-seeker/jobs/saved */
    getSavedJobs: build.query<JobSeekerJob[], void>({
      query: () => '/job-seeker/jobs/saved',
      transformResponse: normalizeJobs,
      providesTags: ['SavedJob'],
    }),

    /* DELETE /api/job-seeker/jobs/{jobId}/save */
    removeSavedJob: build.mutation<void, { jobId: ID }>({
      query: ({ jobId }) => ({
        url: `/job-seeker/jobs/${jobId}/save`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SavedJob', 'Job'],
    }),

    /* GET /api/job-seeker/applications */
    getMyApplications: build.query<JobSeekerApplication[], void>({
      query: () => '/job-seeker/applications',
      transformResponse: normalizeApplications,
      providesTags: ['Application'],
    }),

    /* GET /api/job-seeker/dashboard/counts */
    getDashboardCounts: build.query<JobSeekerDashboardCounts, void>({
      query: () => '/job-seeker/dashboard/counts',
      transformResponse: (res: unknown, meta) => {
        logApi('GET /api/job-seeker/dashboard/counts', httpStatus(meta), res);
        return normalizeDashboardCounts(res);
      },
      transformErrorResponse: (err, meta) => {
        logApi('GET /api/job-seeker/dashboard/counts (error)', httpStatus(meta) ?? err.status, err.data ?? err);
        return err;
      },
      providesTags: ['SavedJob', 'Application', 'Interview'],
    }),

    /* GET /api/job-seeker/projects */
    getProjects: build.query<Project[], void>({
      query: () => '/job-seeker/projects',
      transformResponse: (res: unknown) => {
        if (Array.isArray(res)) return res as Project[];
        const r = res as { items?: unknown; data?: unknown };
        const list = r.items ?? r.data;
        return Array.isArray(list) ? (list as Project[]) : [];
      },
      providesTags: ['Project'],
    }),

    /* POST /api/job-seeker/projects */
    addProject: build.mutation<Project, AddProjectPayload>({
      query: body => ({
        url: '/job-seeker/projects',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: (res: Project, meta) => {
        logApi('POST /api/job-seeker/projects', httpStatus(meta), res);
        return res;
      },
      transformErrorResponse: (err, meta) => {
        logApi(
          'POST /api/job-seeker/projects (error)',
          httpStatus(meta) ?? err.status,
          err.data ?? err,
        );
        return err;
      },
      invalidatesTags: ['Project'],
    }),

    /* GET /api/job-seeker/certifications */
    getCertifications: build.query<Certification[], void>({
      query: () => '/job-seeker/certifications',
      transformResponse: (res: unknown) => {
        if (Array.isArray(res)) return res as Certification[];
        const r = res as { items?: unknown; data?: unknown };
        const list = r.items ?? r.data;
        return Array.isArray(list) ? (list as Certification[]) : [];
      },
      providesTags: ['Certification'],
    }),

    /* POST /api/job-seeker/certifications */
    addCertification: build.mutation<Certification, {
      certificationName: string;
      certificationCompletionId?: string;
      certificationUrl?: string;
      validFrom?: string;
      validTill?: string;
      certificationExpired?: boolean;
    }>({
      query: body => ({
        url: '/job-seeker/certifications',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['Certification'],
    }),

    /* GET /api/job-seeker/blocked-companies — job seeker's blocked companies list */
    getBlockedCompanies: build.query<BlockedCompanyEntry[], void>({
      query: () => '/job-seeker/blocked-companies',
      transformResponse: (res: unknown) => {
        console.log('[BlockedCompanies] GET response:', JSON.stringify(res, null, 2));
        if (Array.isArray(res)) return res as BlockedCompanyEntry[];
        const r = res as { items?: unknown; data?: unknown };
        const list = r.items ?? r.data;
        return Array.isArray(list) ? (list as BlockedCompanyEntry[]) : [];
      },
      providesTags: ['BlockedCompany'],
    }),

    /* PUT /api/job-seeker/companies/{recruiterId}/block — block a company */
    blockCompany: build.mutation<BlockedCompanyEntry, { recruiterId: number }>({
      query: ({ recruiterId }) => {
        console.log('[BlockedCompanies] PUT block recruiterId:', recruiterId);
        return {
          url: `/job-seeker/companies/${recruiterId}/block`,
          method: 'PUT',
        };
      },
      invalidatesTags: ['BlockedCompany'],
    }),

    /* DELETE /api/job-seeker/companies/{recruiterId}/block — unblock a company */
    unblockCompany: build.mutation<void, { recruiterId: number }>({
      query: ({ recruiterId }) => {
        console.log('[BlockedCompanies] DELETE unblock recruiterId:', recruiterId);
        return {
          url: `/job-seeker/companies/${recruiterId}/block`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['BlockedCompany'],
    }),

    /* GET /api/job-seeker/jobs */
    getJobSeekerJobs: build.query<JobSeekerJob[], JobSeekerJobsParams | void>({
      query: params => {
        const keyword = params?.keyword ?? params?.q;
        const hasAdvancedFilters = Boolean(
          params?.jobTypes ||
          params?.workModes ||
          params?.industry ||
          typeof params?.postedWithinDays === 'number' ||
          params?.companyTypes ||
          params?.experienceLevel ||
          typeof params?.minSalaryLpa === 'number' ||
          typeof params?.maxSalaryLpa === 'number',
        );
        if (hasAdvancedFilters) {
          return {
            url: '/job-seeker/jobs/advanced-filter',
            params: {
              ...(keyword ? { keyword } : {}),
              ...(params?.location ? { location: params.location } : {}),
              ...(params?.jobTypes ? { jobTypes: params.jobTypes } : {}),
              ...(params?.workModes ? { workModes: params.workModes } : {}),
              ...(params?.industry ? { industry: params.industry } : {}),
              ...(typeof params?.postedWithinDays === 'number'
                ? { postedWithinDays: params.postedWithinDays }
                : {}),
              ...(params?.companyTypes ? { companyTypes: params.companyTypes } : {}),
              ...(params?.experienceLevel ? { experienceLevel: params.experienceLevel } : {}),
              ...(typeof params?.minSalaryLpa === 'number'
                ? { minSalaryLpa: params.minSalaryLpa }
                : {}),
              ...(typeof params?.maxSalaryLpa === 'number'
                ? { maxSalaryLpa: params.maxSalaryLpa }
                : {}),
            },
          };
        }

        const hasLegacyFilters = Boolean(
          params?.location ||
            typeof params?.minExperience === 'number' ||
            typeof params?.maxExperience === 'number' ||
            typeof params?.minSalary === 'number' ||
            typeof params?.maxSalary === 'number',
        );
        const queryParams = {
          ...(keyword ? { keyword } : {}),
          ...(params?.location ? { location: params.location } : {}),
          ...(typeof params?.minExperience === 'number' ? { minExperience: params.minExperience } : {}),
          ...(typeof params?.maxExperience === 'number' ? { maxExperience: params.maxExperience } : {}),
          ...(typeof params?.minSalary === 'number' ? { minSalary: params.minSalary } : {}),
          ...(typeof params?.maxSalary === 'number' ? { maxSalary: params.maxSalary } : {}),
        };
        return hasLegacyFilters
          ? { url: '/job-seeker/jobs/filter', params: queryParams }
          : { url: '/job-seeker/jobs', params: queryParams };
      },
      transformResponse: normalizeJobs,
      providesTags: ['Job'],
    }),
    /* GET /api/job-seeker/jobs/recommended */
    getRecommendedJobs: build.query<JobSeekerJob[], void>({
      query: () => '/job-seeker/jobs/recommended',
      transformResponse: normalizeJobs,
      providesTags: ['Job'],
    }),
    /* GET /api/job-seeker/jobs/search?keyword=... */
    searchJobSeekerJobs: build.query<JobSeekerJob[], { keyword: string }>({
      query: ({ keyword }) => ({
        url: '/job-seeker/jobs/search',
        params: { keyword },
      }),
      transformResponse: normalizeJobs,
      providesTags: ['Job'],
    }),
  }),
});

export const {
  useGetJobSeekerProfileQuery,
  useUpdateJobSeekerProfileMutation,
  useGetCareerPreferencesQuery,
  useUpdateCareerPreferencesMutation,
  useUploadJobSeekerProfilePictureMutation,
  useUploadResumeMutation,
  useApplyToJobMutation,
  useSaveJobMutation,
  useGetSavedJobsQuery,
  useRemoveSavedJobMutation,
  useGetMyApplicationsQuery,
  useGetDashboardCountsQuery,
  useGetProjectsQuery,
  useAddProjectMutation,
  useGetCertificationsQuery,
  useAddCertificationMutation,
  useGetBlockedCompaniesQuery,
  useBlockCompanyMutation,
  useUnblockCompanyMutation,
  useGetJobSeekerJobsQuery,
  useGetRecommendedJobsQuery,
  useLazySearchJobSeekerJobsQuery,
} = candidateApi;
