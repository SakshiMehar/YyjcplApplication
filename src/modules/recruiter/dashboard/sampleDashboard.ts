import { JobApplication } from '../../../types/models';

/**
 * DEV ONLY – shown on the dashboard when the recruiter API can't be reached in a
 * debug build, so the screen can be designed and tested before the backend exists.
 */
export const SAMPLE_STATS = { totalJobs: 12, activeJobs: 8, applications: 248, shortlisted: 42 };

const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();
const company = { id: 'c1', name: 'XYZ Technologies', isVerified: true };

export const SAMPLE_APPLICATIONS: JobApplication[] = [
  {
    id: 'sample-a1',
    job: { id: 'j1', title: 'Frontend Developer', company, location: 'Bangalore' },
    candidate: { id: 'u1', name: 'Rohit Sharma' },
    status: 'APPLIED',
    appliedAt: ago(120),
    history: [],
  },
  {
    id: 'sample-a2',
    job: { id: 'j2', title: 'UI/UX Designer', company, location: 'Pune' },
    candidate: { id: 'u2', name: 'Priya Singh' },
    status: 'SHORTLISTED',
    appliedAt: ago(300),
    history: [],
  },
  {
    id: 'sample-a3',
    job: { id: 'j3', title: 'Backend Developer', company, location: 'Hyderabad' },
    candidate: { id: 'u3', name: 'Amit Verma' },
    status: 'INTERVIEW_SCHEDULED',
    appliedAt: ago(60 * 26),
    history: [],
  },
];
