import { ApplicationStatus } from '../constants/applicationStatus';
import { UserRole } from '../constants/roles';

export type ID = string;

export interface User {
  id: ID;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  isVerified: boolean;
}

/* ---------------- Candidate ---------------- */

export interface Education {
  id: ID;
  degree: string;
  institution: string;
  startYear: number;
  endYear?: number;
}

export interface Experience {
  id: ID;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface CandidateProfile {
  id: ID;
  userId: ID;
  headline?: string;
  summary?: string;
  location?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  expectedSalary?: number;
  resume?: Resume;
}

export interface Resume {
  id: ID;
  fileName: string;
  url: string;
  uploadedAt: string;
}

/* ---------------- Recruiter ---------------- */

export interface Company {
  id: ID;
  name: string;
  logoUrl?: string;
  industry?: string;
  size?: string;
  website?: string;
  about?: string;
  location?: string;
  isVerified: boolean;
}

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type JobApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';

export interface Job {
  id: ID;
  company: Pick<Company, 'id' | 'name' | 'logoUrl' | 'isVerified'>;
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  minSalary?: number;
  maxSalary?: number;
  minExperience?: number;
  skills: string[];
  openings: number;
  approvalStatus: JobApprovalStatus;
  postedAt: string;
}

/* ---------------- Recruitment pipeline ---------------- */

export interface StatusHistoryItem {
  status: ApplicationStatus;
  changedAt: string;
  note?: string;
}

export interface JobApplication {
  id: ID;
  job: Pick<Job, 'id' | 'title' | 'company' | 'location'>;
  candidate: Pick<User, 'id' | 'name' | 'avatarUrl'> & { headline?: string };
  status: ApplicationStatus;
  coverLetter?: string;
  appliedAt: string;
  history: StatusHistoryItem[];
}

export type InterviewMode = 'IN_PERSON' | 'VIDEO' | 'PHONE';

export interface Interview {
  id: ID;
  applicationId: ID;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  scheduledAt: string;
  mode: InterviewMode;
  locationOrLink?: string;
  notes?: string;
}

/* ---------------- Shared ---------------- */

export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  type: string;
  read?: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

export interface Complaint {
  id: ID;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface SubscriptionPlan {
  id: ID;
  name: string;
  price: number;
  durationDays: number;
  jobPostLimit: number;
  candidateSearchLimit: number;
  features: string[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
