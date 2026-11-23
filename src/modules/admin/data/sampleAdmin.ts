/**
 * Admin panel – demo data.
 *
 * The app is frontend-only and the backend has no admin endpoints yet, so the
 * admin screens read from this file (through AdminDataProvider). Replace with
 * RTK Query endpoints in src/modules/admin/api once the admin API exists.
 */

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

export type AdminUserType = 'JOB_SEEKER' | 'RECRUITER';
export type AdminUserStatus = 'ACTIVE' | 'BLOCKED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: AdminUserType;
  /** Job seekers: current role. Recruiters: their designation. */
  headline: string;
  /** Recruiters only. */
  company?: string;
  location: string;
  joinedAt: string;
  status: AdminUserStatus;
  verified: boolean;
  skills?: string[];
  experience?: string;
  /** Job seekers: applications sent. Recruiters: jobs posted. */
  activityCount: number;
  plan?: string;
}

export type AdminJobStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  recruiterName: string;
  location: string;
  salary: string;
  experience: string;
  jobType: string;
  openings: number;
  skills: string[];
  description: string;
  postedAt: string;
  applicants: number;
  status: AdminJobStatus;
}

export type CompanyVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AdminCompany {
  id: string;
  name: string;
  recruiterName: string;
  industry: string;
  size: string;
  location: string;
  gstin: string;
  website: string;
  submittedAt: string;
  status: CompanyVerificationStatus;
  activeJobs: number;
  totalHires: number;
  plan?: string;
}

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type ComplaintPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AdminComplaint {
  id: string;
  subject: string;
  description: string;
  raisedBy: string;
  raisedByType: AdminUserType;
  createdAt: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
}

export interface AdminPlan {
  id: string;
  name: string;
  price: number;
  jobLimit: string;
  applicationLimit: string;
  subscribers: number;
  popular?: boolean;
}

export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface AdminPayment {
  id: string;
  company: string;
  plan: string;
  amount: number;
  paidAt: string;
  method: string;
  status: PaymentStatus;
}

export type BroadcastAudience = 'ALL' | 'JOB_SEEKER' | 'RECRUITER';

export interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  audience: BroadcastAudience;
  sentAt: string;
}

export const SAMPLE_USERS: AdminUser[] = [
  {
    id: 'u1', name: 'Rohit Sharma', email: 'rohit.sharma@gmail.com', phone: '9876543210',
    type: 'JOB_SEEKER', headline: 'Frontend Developer', location: 'Bangalore', joinedAt: hoursAgo(3),
    status: 'ACTIVE', verified: true, skills: ['React', 'TypeScript', 'CSS'], experience: '3+ years',
    activityCount: 14,
  },
  {
    id: 'u2', name: 'Priya Singh', email: 'priya.singh@gmail.com', phone: '9812345670',
    type: 'JOB_SEEKER', headline: 'UI/UX Designer', location: 'Pune', joinedAt: hoursAgo(9),
    status: 'ACTIVE', verified: true, skills: ['Figma', 'Adobe XD', 'UI/UX'], experience: '2+ years',
    activityCount: 8,
  },
  {
    id: 'u3', name: 'Amit Verma', email: 'amit@xyztech.in', phone: '9900112233',
    type: 'RECRUITER', headline: 'HR Manager', company: 'XYZ Technologies', location: 'Bangalore',
    joinedAt: daysAgo(1), status: 'ACTIVE', verified: true, activityCount: 12, plan: 'Professional',
  },
  {
    id: 'u4', name: 'Neha Verma', email: 'neha.verma@outlook.com', phone: '9765432109',
    type: 'JOB_SEEKER', headline: 'Backend Developer', location: 'Hyderabad', joinedAt: daysAgo(2),
    status: 'BLOCKED', verified: false, skills: ['Node.js', 'MongoDB', 'AWS'], experience: '4+ years',
    activityCount: 21,
  },
  {
    id: 'u5', name: 'Karan Mehta', email: 'karan@brightsoft.com', phone: '9123456780',
    type: 'RECRUITER', headline: 'Talent Acquisition Lead', company: 'BrightSoft Solutions',
    location: 'Mumbai', joinedAt: daysAgo(3), status: 'ACTIVE', verified: false, activityCount: 4,
    plan: 'Basic',
  },
  {
    id: 'u6', name: 'Sakshi Mehar', email: 'sakshi.mehar@gmail.com', phone: '9988776655',
    type: 'JOB_SEEKER', headline: 'Data Analyst', location: 'Delhi', joinedAt: daysAgo(4),
    status: 'ACTIVE', verified: true, skills: ['SQL', 'Python', 'Power BI'], experience: '1+ years',
    activityCount: 6,
  },
  {
    id: 'u7', name: 'Vikram Rao', email: 'vikram@nexgen.io', phone: '9090909090',
    type: 'RECRUITER', headline: 'Founder', company: 'NexGen Labs', location: 'Chennai',
    joinedAt: daysAgo(6), status: 'BLOCKED', verified: false, activityCount: 2,
  },
  {
    id: 'u8', name: 'Rahul Kumar', email: 'rahul.kumar@yahoo.com', phone: '9811122233',
    type: 'JOB_SEEKER', headline: 'Full Stack Developer', location: 'Noida', joinedAt: daysAgo(9),
    status: 'ACTIVE', verified: true, skills: ['React', 'Node.js', 'PostgreSQL'], experience: '5+ years',
    activityCount: 17,
  },
];

export const SAMPLE_JOBS: AdminJob[] = [
  {
    id: 'j1', title: 'Frontend Developer', company: 'XYZ Technologies', recruiterName: 'Amit Verma',
    location: 'Bangalore', salary: '₹5L – ₹10L', experience: '2–4 years', jobType: 'Full Time',
    openings: 3, skills: ['React', 'TypeScript', 'Redux'], postedAt: hoursAgo(2), applicants: 0,
    status: 'PENDING',
    description: 'Build responsive, high-quality web interfaces with React and TypeScript.',
  },
  {
    id: 'j2', title: 'UI/UX Designer', company: 'BrightSoft Solutions', recruiterName: 'Karan Mehta',
    location: 'Mumbai', salary: '₹4L – ₹8L', experience: '1–3 years', jobType: 'Full Time',
    openings: 1, skills: ['Figma', 'Prototyping'], postedAt: hoursAgo(6), applicants: 0,
    status: 'PENDING',
    description: 'Design intuitive mobile and web experiences for our SaaS products.',
  },
  {
    id: 'j3', title: 'Sales Executive', company: 'NexGen Labs', recruiterName: 'Vikram Rao',
    location: 'Chennai', salary: '₹2.5L – ₹4L', experience: '0–2 years', jobType: 'Full Time',
    openings: 5, skills: ['Communication', 'CRM'], postedAt: daysAgo(1), applicants: 0,
    status: 'PENDING',
    description: 'Drive B2B sales and manage client relationships across South India.',
  },
  {
    id: 'j4', title: 'Backend Developer', company: 'XYZ Technologies', recruiterName: 'Amit Verma',
    location: 'Bangalore', salary: '₹8L – ₹14L', experience: '3–5 years', jobType: 'Full Time',
    openings: 2, skills: ['Node.js', 'PostgreSQL', 'AWS'], postedAt: daysAgo(4), applicants: 15,
    status: 'APPROVED',
    description: 'Design and maintain scalable APIs and services.',
  },
  {
    id: 'j5', title: 'Full Stack Developer', company: 'XYZ Technologies', recruiterName: 'Amit Verma',
    location: 'Remote', salary: '₹10L – ₹18L', experience: '4–6 years', jobType: 'Full Time',
    openings: 2, skills: ['React', 'Node.js'], postedAt: daysAgo(6), applicants: 20,
    status: 'APPROVED',
    description: 'Own features end to end across our web platform.',
  },
  {
    id: 'j6', title: 'Data Entry Operator', company: 'Quick Hire Pvt Ltd', recruiterName: 'Unknown',
    location: 'Delhi', salary: '₹50K / week', experience: 'Fresher', jobType: 'Part Time',
    openings: 50, skills: ['Typing'], postedAt: daysAgo(8), applicants: 0, status: 'REJECTED',
    description: 'Earn ₹50K per week from home. Registration fee required.',
  },
];

export const SAMPLE_COMPANIES: AdminCompany[] = [
  {
    id: 'c1', name: 'BrightSoft Solutions', recruiterName: 'Karan Mehta', industry: 'IT Services',
    size: '50 – 200', location: 'Mumbai', gstin: '27AABCB1234C1Z5', website: 'brightsoft.com',
    submittedAt: hoursAgo(5), status: 'PENDING', activeJobs: 1, totalHires: 0, plan: 'Basic',
  },
  {
    id: 'c2', name: 'NexGen Labs', recruiterName: 'Vikram Rao', industry: 'Software Products',
    size: '10 – 50', location: 'Chennai', gstin: '33AAFCN5678D1Z2', website: 'nexgen.io',
    submittedAt: daysAgo(1), status: 'PENDING', activeJobs: 0, totalHires: 0,
  },
  {
    id: 'c3', name: 'XYZ Technologies', recruiterName: 'Amit Verma', industry: 'IT Services',
    size: '100 – 500', location: 'Bangalore', gstin: '29AABCX9012E1Z8', website: 'xyztech.in',
    submittedAt: daysAgo(12), status: 'VERIFIED', activeJobs: 8, totalHires: 42,
    plan: 'Professional',
  },
  {
    id: 'c4', name: 'Quick Hire Pvt Ltd', recruiterName: 'Unknown', industry: 'Staffing',
    size: '1 – 10', location: 'Delhi', gstin: '—', website: '—', submittedAt: daysAgo(9),
    status: 'REJECTED', activeJobs: 0, totalHires: 0,
  },
  {
    id: 'c5', name: 'Infosoft Pvt Ltd', recruiterName: 'Meera Iyer', industry: 'Consulting',
    size: '500 – 1000', location: 'Pune', gstin: '27AACCI3456F1Z1', website: 'infosoft.co.in',
    submittedAt: daysAgo(30), status: 'VERIFIED', activeJobs: 14, totalHires: 96, plan: 'Enterprise',
  },
];

export const SAMPLE_COMPLAINTS: AdminComplaint[] = [
  {
    id: 'cp1', subject: 'Recruiter asked for money', raisedBy: 'Sakshi Mehar', raisedByType: 'JOB_SEEKER',
    description: 'A recruiter from Quick Hire asked me to pay a registration fee before the interview.',
    createdAt: hoursAgo(4), status: 'OPEN', priority: 'HIGH',
  },
  {
    id: 'cp2', subject: 'Unable to upload resume', raisedBy: 'Rahul Kumar', raisedByType: 'JOB_SEEKER',
    description: 'PDF upload keeps failing at 90% on my phone.',
    createdAt: daysAgo(1), status: 'IN_PROGRESS', priority: 'MEDIUM',
  },
  {
    id: 'cp3', subject: 'Payment deducted twice', raisedBy: 'Karan Mehta', raisedByType: 'RECRUITER',
    description: 'I was charged twice for the Basic plan this month.',
    createdAt: daysAgo(2), status: 'OPEN', priority: 'HIGH',
  },
  {
    id: 'cp4', subject: 'Fake candidate profiles', raisedBy: 'Amit Verma', raisedByType: 'RECRUITER',
    description: 'Several applicants have identical resumes with different names.',
    createdAt: daysAgo(5), status: 'RESOLVED', priority: 'LOW',
  },
];

export const SAMPLE_PLANS: AdminPlan[] = [
  { id: 'p1', name: 'Basic', price: 999, jobLimit: '5 jobs', applicationLimit: '50 applications', subscribers: 64 },
  {
    id: 'p2', name: 'Professional', price: 1999, jobLimit: '20 jobs', applicationLimit: '200 applications',
    subscribers: 112, popular: true,
  },
  {
    id: 'p3', name: 'Enterprise', price: 4999, jobLimit: 'Unlimited jobs',
    applicationLimit: 'Priority support', subscribers: 23,
  },
];

export const SAMPLE_PAYMENTS: AdminPayment[] = [
  { id: 'TXN10231', company: 'XYZ Technologies', plan: 'Professional', amount: 1999, paidAt: hoursAgo(7), method: 'UPI', status: 'SUCCESS' },
  { id: 'TXN10230', company: 'BrightSoft Solutions', plan: 'Basic', amount: 999, paidAt: daysAgo(1), method: 'Card', status: 'SUCCESS' },
  { id: 'TXN10229', company: 'BrightSoft Solutions', plan: 'Basic', amount: 999, paidAt: daysAgo(1), method: 'Card', status: 'PENDING' },
  { id: 'TXN10228', company: 'NexGen Labs', plan: 'Enterprise', amount: 4999, paidAt: daysAgo(3), method: 'Net Banking', status: 'FAILED' },
  { id: 'TXN10227', company: 'Infosoft Pvt Ltd', plan: 'Enterprise', amount: 4999, paidAt: daysAgo(5), method: 'UPI', status: 'SUCCESS' },
];

export const SAMPLE_BROADCASTS: AdminBroadcast[] = [
  {
    id: 'b1', title: 'New feature: Resume builder', audience: 'JOB_SEEKER', sentAt: daysAgo(2),
    message: 'Create a professional resume in minutes with our new templates.',
  },
  {
    id: 'b2', title: 'Diwali offer – 20% off', audience: 'RECRUITER', sentAt: daysAgo(6),
    message: 'Upgrade to Professional or Enterprise and save 20% this festive season.',
  },
];

/** Platform-wide totals the sample lists don't cover (shown on Dashboard & Reports). */
export const PLATFORM_TOTALS = {
  jobSeekers: 12480,
  recruiters: 1846,
  liveJobs: 3215,
  applications: 48920,
  placements: 1264,
  revenueThisMonth: 486500,
  /** New sign-ups, Mon → Sun. */
  weeklySignups: [182, 240, 198, 305, 276, 342, 290],
  /** Applications per month, Jun → Nov. */
  monthlyApplications: [5200, 6100, 7400, 8050, 9120, 10480],
  topLocations: [
    { name: 'Bangalore', share: 0.32 },
    { name: 'Pune', share: 0.21 },
    { name: 'Hyderabad', share: 0.18 },
    { name: 'Delhi NCR', share: 0.16 },
    { name: 'Mumbai', share: 0.13 },
  ],
};

/* ───────────────── Applications ───────────────── */
export type AdminApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

export interface AdminApplication {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: AdminApplicationStatus;
  /** Flagged by an admin for review (spam, fake profile…). */
  flagged?: boolean;
}

export const SAMPLE_APPLICATIONS: AdminApplication[] = [
  { id: 'a1', candidateId: 'u1', candidateName: 'Rohit Sharma', jobTitle: 'Backend Developer', company: 'XYZ Technologies', appliedAt: hoursAgo(1), status: 'APPLIED' },
  { id: 'a2', candidateId: 'u2', candidateName: 'Priya Singh', jobTitle: 'Full Stack Developer', company: 'XYZ Technologies', appliedAt: hoursAgo(5), status: 'SHORTLISTED' },
  { id: 'a3', candidateId: 'u8', candidateName: 'Rahul Kumar', jobTitle: 'Full Stack Developer', company: 'XYZ Technologies', appliedAt: daysAgo(1), status: 'INTERVIEW' },
  { id: 'a4', candidateId: 'u6', candidateName: 'Sakshi Mehar', jobTitle: 'Data Analyst', company: 'Infosoft Pvt Ltd', appliedAt: daysAgo(2), status: 'SELECTED' },
  { id: 'a5', candidateId: 'u4', candidateName: 'Neha Verma', jobTitle: 'Backend Developer', company: 'XYZ Technologies', appliedAt: daysAgo(3), status: 'REJECTED', flagged: true },
  { id: 'a6', candidateId: 'u1', candidateName: 'Rohit Sharma', jobTitle: 'React Native Developer', company: 'Infosoft Pvt Ltd', appliedAt: daysAgo(4), status: 'INTERVIEW' },
  { id: 'a7', candidateId: 'u2', candidateName: 'Priya Singh', jobTitle: 'Product Designer', company: 'Infosoft Pvt Ltd', appliedAt: daysAgo(6), status: 'APPLIED' },
];

/* ───────────────── Candidate verification (KYC) ───────────────── */
export interface AdminCandidateKyc {
  id: string;
  userId: string;
  name: string;
  documents: string[];
  submittedAt: string;
  status: CompanyVerificationStatus;
}

export const SAMPLE_CANDIDATE_KYC: AdminCandidateKyc[] = [
  { id: 'k1', userId: 'u4', name: 'Neha Verma', documents: ['Aadhaar Card', 'Resume'], submittedAt: hoursAgo(3), status: 'PENDING' },
  { id: 'k2', userId: 'u6', name: 'Sakshi Mehar', documents: ['PAN Card', 'Degree Certificate'], submittedAt: daysAgo(1), status: 'PENDING' },
  { id: 'k3', userId: 'u1', name: 'Rohit Sharma', documents: ['Aadhaar Card', 'Experience Letter'], submittedAt: daysAgo(10), status: 'VERIFIED' },
];

/* ───────────────── Placements ───────────────── */
export type PlacementStatus = 'OFFERED' | 'JOINED' | 'DROPPED';

export interface AdminPlacement {
  id: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  ctc: string;
  offeredAt: string;
  joiningDate: string;
  status: PlacementStatus;
}

export const SAMPLE_PLACEMENTS: AdminPlacement[] = [
  { id: 'pl1', candidateName: 'Sakshi Mehar', jobTitle: 'Data Analyst', company: 'Infosoft Pvt Ltd', ctc: '₹6.5 LPA', offeredAt: daysAgo(1), joiningDate: daysAgo(-14), status: 'OFFERED' },
  { id: 'pl2', candidateName: 'Arjun Nair', jobTitle: 'Backend Developer', company: 'XYZ Technologies', ctc: '₹12 LPA', offeredAt: daysAgo(18), joiningDate: daysAgo(3), status: 'JOINED' },
  { id: 'pl3', candidateName: 'Pooja Desai', jobTitle: 'UI/UX Designer', company: 'Infosoft Pvt Ltd', ctc: '₹8 LPA', offeredAt: daysAgo(25), joiningDate: daysAgo(10), status: 'JOINED' },
  { id: 'pl4', candidateName: 'Manish Gupta', jobTitle: 'Sales Executive', company: 'BrightSoft Solutions', ctc: '₹3.6 LPA', offeredAt: daysAgo(20), joiningDate: daysAgo(5), status: 'DROPPED' },
];

/* ───────────────── Subscriptions ───────────────── */
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'CANCELLED';

export interface AdminSubscription {
  id: string;
  company: string;
  plan: string;
  amount: number;
  startedAt: string;
  expiresAt: string;
  jobsUsed: number;
  /** null = unlimited */
  jobsLimit: number | null;
  status: SubscriptionStatus;
}

export const SAMPLE_SUBSCRIPTIONS: AdminSubscription[] = [
  { id: 's1', company: 'XYZ Technologies', plan: 'Professional', amount: 1999, startedAt: daysAgo(12), expiresAt: daysAgo(-18), jobsUsed: 12, jobsLimit: 20, status: 'ACTIVE' },
  { id: 's2', company: 'Infosoft Pvt Ltd', plan: 'Enterprise', amount: 4999, startedAt: daysAgo(26), expiresAt: daysAgo(-4), jobsUsed: 31, jobsLimit: null, status: 'EXPIRING' },
  { id: 's3', company: 'BrightSoft Solutions', plan: 'Basic', amount: 999, startedAt: daysAgo(1), expiresAt: daysAgo(-29), jobsUsed: 1, jobsLimit: 5, status: 'ACTIVE' },
  { id: 's4', company: 'NexGen Labs', plan: 'Basic', amount: 999, startedAt: daysAgo(45), expiresAt: daysAgo(15), jobsUsed: 5, jobsLimit: 5, status: 'EXPIRED' },
];

/* ───────────────── Admin staff users ───────────────── */
export type StaffRole = 'SUPER_ADMIN' | 'MODERATOR' | 'SUPPORT' | 'FINANCE';
export type StaffStatus = 'ACTIVE' | 'DISABLED';

export interface AdminStaff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  lastActiveAt: string;
}

export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  MODERATOR: 'Moderator',
  SUPPORT: 'Support',
  FINANCE: 'Finance',
};

export const SAMPLE_STAFF: AdminStaff[] = [
  { id: 'st1', name: 'Super Admin', email: 'admin@yyjcpl.com', role: 'SUPER_ADMIN', status: 'ACTIVE', lastActiveAt: hoursAgo(0) },
  { id: 'st2', name: 'Anjali Kapoor', email: 'anjali@yyjcpl.com', role: 'MODERATOR', status: 'ACTIVE', lastActiveAt: hoursAgo(2) },
  { id: 'st3', name: 'Suresh Patil', email: 'suresh@yyjcpl.com', role: 'SUPPORT', status: 'ACTIVE', lastActiveAt: daysAgo(1) },
  { id: 'st4', name: 'Deepak Jain', email: 'deepak@yyjcpl.com', role: 'FINANCE', status: 'DISABLED', lastActiveAt: daysAgo(20) },
];

/* ───────────────── Audit logs ───────────────── */
export type AuditModule =
  | 'Candidates'
  | 'Recruiters'
  | 'Companies'
  | 'Jobs'
  | 'Applications'
  | 'Verification'
  | 'Placements'
  | 'Complaints'
  | 'Notifications'
  | 'Subscriptions'
  | 'Payments'
  | 'Users';

export interface AdminAuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  module: AuditModule;
  at: string;
}

export const SAMPLE_AUDIT_LOGS: AdminAuditLog[] = [
  { id: 'l1', actor: 'Anjali Kapoor', action: 'Approved job', target: 'Backend Developer – XYZ Technologies', module: 'Jobs', at: hoursAgo(2) },
  { id: 'l2', actor: 'Anjali Kapoor', action: 'Blocked candidate', target: 'Neha Verma', module: 'Candidates', at: hoursAgo(6) },
  { id: 'l3', actor: 'Suresh Patil', action: 'Resolved complaint', target: '#CP4 Fake candidate profiles', module: 'Complaints', at: daysAgo(1) },
  { id: 'l4', actor: 'Super Admin', action: 'Rejected company', target: 'Quick Hire Pvt Ltd', module: 'Verification', at: daysAgo(2) },
  { id: 'l5', actor: 'Deepak Jain', action: 'Refunded payment', target: 'TXN10198 – ₹999', module: 'Payments', at: daysAgo(4) },
  { id: 'l6', actor: 'Super Admin', action: 'Disabled admin user', target: 'Deepak Jain', module: 'Users', at: daysAgo(5) },
];
