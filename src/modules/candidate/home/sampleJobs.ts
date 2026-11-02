import { Job } from '../../../types/models';

/**
 * DEV ONLY – shown on Home when the jobs API can't be reached in a debug build,
 * so the screen can be designed and tested before the backend endpoint exists.
 */
const base = { description: '', openings: 1, approvalStatus: 'APPROVED' as const };

export const SAMPLE_JOBS: Job[] = [
  {
    ...base,
    id: 'sample-1',
    title: 'Frontend Developer',
    company: { id: 'c1', name: 'Google', isVerified: true },
    location: 'Bangalore',
    jobType: 'FULL_TIME',
    minSalary: 800000,
    maxSalary: 1200000,
    skills: ['React', 'JavaScript', 'HTML', 'CSS'],
    postedAt: new Date().toISOString(),
  },
  {
    ...base,
    id: 'sample-2',
    title: 'UI/UX Designer',
    company: { id: 'c2', name: 'Adobe', isVerified: true },
    location: 'Remote',
    jobType: 'FULL_TIME',
    minSalary: 600000,
    maxSalary: 1000000,
    skills: ['Figma', 'Prototyping'],
    postedAt: new Date().toISOString(),
  },
  {
    ...base,
    id: 'sample-3',
    title: 'Web Developer',
    company: { id: 'c3', name: 'TCS', isVerified: false },
    location: 'Pune',
    jobType: 'FULL_TIME',
    minSalary: 400000,
    maxSalary: 700000,
    skills: ['PHP', 'MySQL'],
    postedAt: new Date().toISOString(),
  },
];
