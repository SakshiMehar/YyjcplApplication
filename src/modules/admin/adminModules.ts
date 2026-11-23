import {
  Award,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Receipt,
  UserCog,
  UserSearch,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../../theme';
import { AdminStackParamList, AdminTabParamList } from '../../navigation/types';

export type AdminModuleKey =
  | 'dashboard'
  | 'candidates'
  | 'recruiters'
  | 'companies'
  | 'jobs'
  | 'applications'
  | 'verification'
  | 'placements'
  | 'complaints'
  | 'notifications'
  | 'reports'
  | 'subscriptions'
  | 'payments'
  | 'users'
  | 'auditLogs';

export type AdminModule = {
  key: AdminModuleKey;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  /** Bottom-tab screen, or a stack screen. */
  route:
    | { tab: keyof AdminTabParamList }
    | { screen: Exclude<keyof AdminStackParamList, 'AdminTabs' | 'AdminUserDetails'> };
};

/** Every section of the admin panel, in menu order. */
export const ADMIN_MODULES: AdminModule[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'Overview of the whole platform', icon: LayoutDashboard, color: colors.primary, route: { tab: 'AdminDashboard' } },
  { key: 'candidates', label: 'Candidates', description: 'Job seekers, profiles, block / unblock', icon: GraduationCap, color: '#4F6EF7', route: { tab: 'AdminCandidates' } },
  { key: 'recruiters', label: 'Recruiters', description: 'Employer accounts and their activity', icon: UserSearch, color: '#7C3AED', route: { tab: 'AdminRecruiters' } },
  { key: 'companies', label: 'Companies', description: 'All registered companies', icon: Building2, color: '#0EA5E9', route: { screen: 'AdminCompanies' } },
  { key: 'jobs', label: 'Jobs', description: 'Approve, reject or take down job posts', icon: BriefcaseBusiness, color: '#A855F7', route: { tab: 'AdminJobs' } },
  { key: 'applications', label: 'Applications', description: 'Every application across all jobs', icon: FileText, color: colors.info, route: { screen: 'AdminApplications' } },
  { key: 'verification', label: 'Verification', description: 'Company documents & candidate KYC', icon: BadgeCheck, color: colors.success, route: { screen: 'AdminVerification' } },
  { key: 'placements', label: 'Placements', description: 'Offers, joinings and drop-outs', icon: Award, color: '#059669', route: { screen: 'AdminPlacements' } },
  { key: 'complaints', label: 'Complaints', description: 'Issues raised by users', icon: MessageSquareWarning, color: colors.danger, route: { screen: 'AdminComplaints' } },
  { key: 'notifications', label: 'Notifications', description: 'Broadcast messages to users', icon: Megaphone, color: '#DB2777', route: { screen: 'AdminNotifications' } },
  { key: 'reports', label: 'Reports', description: 'Sign-ups, applications, top cities', icon: BarChart3, color: '#2563EB', route: { screen: 'AdminReports' } },
  { key: 'subscriptions', label: 'Subscriptions', description: 'Plans and recruiter subscriptions', icon: CreditCard, color: '#F59E0B', route: { screen: 'AdminSubscriptions' } },
  { key: 'payments', label: 'Payments', description: 'Transactions and refunds', icon: Receipt, color: '#CA8A04', route: { screen: 'AdminPayments' } },
  { key: 'users', label: 'Users', description: 'Admin staff accounts and roles', icon: UserCog, color: '#475569', route: { screen: 'AdminStaffUsers' } },
  { key: 'auditLogs', label: 'Audit Logs', description: 'Every action taken by admins', icon: History, color: '#64748B', route: { screen: 'AdminAuditLogs' } },
];

/** Groups for the More menu. */
export const ADMIN_MODULE_GROUPS: { title: string; keys: AdminModuleKey[] }[] = [
  { title: 'PEOPLE', keys: ['candidates', 'recruiters', 'companies', 'users'] },
  { title: 'HIRING', keys: ['jobs', 'applications', 'verification', 'placements'] },
  { title: 'BILLING', keys: ['subscriptions', 'payments'] },
  { title: 'SUPPORT', keys: ['complaints', 'notifications'] },
  { title: 'INSIGHTS', keys: ['dashboard', 'reports', 'auditLogs'] },
];

export const moduleByKey = (key: AdminModuleKey) => ADMIN_MODULES.find(m => m.key === key)!;
