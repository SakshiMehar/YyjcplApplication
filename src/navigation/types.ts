import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OtpPurpose } from '../modules/auth/api/authApi';
import type { JobSeekerJob } from '../modules/candidate/api/candidateApi';
import type { RecruiterApplication } from '../modules/recruiter/api/recruiterApi';
import { ID } from '../types/models';

/* ---------------- Auth ---------------- */
export type AuthStackParamList = {
  Splash: undefined;
  OnboardingJobSeeker: undefined;
  OnboardingEmployer: undefined;
  Login: undefined;
  RoleSelect: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  /**
   * login / register: Firebase phone OTP (`verificationId`; register also sends `fullName`).
   * reset: backend OTP (`requestId`).
   */
  Otp: {
    phone: string;
    purpose: OtpPurpose;
    verificationId?: string;
    autoCode?: string;
    fullName?: string;
    requestId?: string;
  };
  ResetPassword: { resetToken: string };
};

/* ---------------- Shared (used by both role stacks) ---------------- */
export type SharedRoutes = {
  Notifications: undefined;
  Settings: undefined;
  RaiseComplaint: undefined;
  Account: undefined;
  ChangePassword: undefined;
  CareerPreferences: undefined;
  CommunicationPrivacy: undefined;
  BlockedCompanies: undefined;
};

/* ---------------- Candidate ---------------- */
export type CandidateTabParamList = {
  CandidateHome: undefined;
  JobSearch: { q?: string } | undefined;
  MyApplications: undefined;
  CandidateInterviews: undefined;
  CandidateProfile: undefined;
};

export type CandidateStackParamList = SharedRoutes & {
  CandidateTabs: NavigatorScreenParams<CandidateTabParamList>;
  JobDetails: { job: JobSeekerJob };
  ApplyJob: { job: JobSeekerJob };
  ApplicationTracker: { applicationId: ID };
  EditCandidateProfile: undefined;
  Resume: undefined;
  UploadedResume: undefined;
  ResumeTemplates: { resumeId?: string } | undefined;
  PersonalDetails: { resumeId: string };
  Education: { resumeId: string };
  Experience: { resumeId: string };
  Skills: { resumeId: string };
  Projects: { resumeId: string };
  Certifications: { resumeId: string };
  ResumePreview: { resumeId: string };
  SavedJobs: undefined;
};

/* ---------------- Recruiter ---------------- */
export type RecruiterTabParamList = {
  RecruiterDashboard: undefined;
  MyJobs: undefined;
  Applications: { jobId?: ID } | undefined;
  CompanyProfile: undefined;
};

export type RecruiterStackParamList = SharedRoutes & {
  RecruiterTabs: NavigatorScreenParams<RecruiterTabParamList>;
  CandidateSearch: undefined;
  PostJob: { jobId?: ID } | undefined;
  ApplicantDetails: { application: RecruiterApplication };
  CandidateDetails: { candidateId: ID };
  Shortlist: { jobId?: ID } | undefined;
  ScheduleInterview: { applicationId: ID };
  RecruiterInterviews: undefined;
  EditCompany: undefined;
  Subscription: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;
export type CandidateScreenProps<T extends keyof CandidateStackParamList> =
  NativeStackScreenProps<CandidateStackParamList, T>;
export type RecruiterScreenProps<T extends keyof RecruiterStackParamList> =
  NativeStackScreenProps<RecruiterStackParamList, T>;
