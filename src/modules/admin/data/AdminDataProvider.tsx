import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAppSelector } from '../../../store/hooks';
import {
  AdminApplication,
  AdminApplicationStatus,
  AdminAuditLog,
  AdminBroadcast,
  AdminCandidateKyc,
  AdminComplaint,
  AdminCompany,
  AdminJob,
  AdminJobStatus,
  AdminPayment,
  AdminPlacement,
  AdminStaff,
  AdminSubscription,
  AdminUser,
  AdminUserStatus,
  AuditModule,
  BroadcastAudience,
  CompanyVerificationStatus,
  ComplaintStatus,
  PlacementStatus,
  SAMPLE_APPLICATIONS,
  SAMPLE_AUDIT_LOGS,
  SAMPLE_BROADCASTS,
  SAMPLE_CANDIDATE_KYC,
  SAMPLE_COMPANIES,
  SAMPLE_COMPLAINTS,
  SAMPLE_JOBS,
  SAMPLE_PAYMENTS,
  SAMPLE_PLACEMENTS,
  SAMPLE_PLANS,
  SAMPLE_STAFF,
  SAMPLE_SUBSCRIPTIONS,
  SAMPLE_USERS,
  StaffRole,
  StaffStatus,
  SubscriptionStatus,
} from './sampleAdmin';

type AdminData = {
  users: AdminUser[];
  jobs: AdminJob[];
  companies: AdminCompany[];
  applications: AdminApplication[];
  candidateKyc: AdminCandidateKyc[];
  placements: AdminPlacement[];
  complaints: AdminComplaint[];
  plans: typeof SAMPLE_PLANS;
  subscriptions: AdminSubscription[];
  payments: AdminPayment[];
  broadcasts: AdminBroadcast[];
  staff: AdminStaff[];
  auditLogs: AdminAuditLog[];
  setUserStatus: (id: string, status: AdminUserStatus) => void;
  setJobStatus: (id: string, status: AdminJobStatus) => void;
  setCompanyStatus: (id: string, status: CompanyVerificationStatus) => void;
  setKycStatus: (id: string, status: CompanyVerificationStatus) => void;
  setApplicationStatus: (id: string, status: AdminApplicationStatus) => void;
  toggleApplicationFlag: (id: string) => void;
  setPlacementStatus: (id: string, status: PlacementStatus) => void;
  setComplaintStatus: (id: string, status: ComplaintStatus) => void;
  setSubscriptionStatus: (id: string, status: SubscriptionStatus) => void;
  refundPayment: (id: string) => void;
  sendBroadcast: (title: string, message: string, audience: BroadcastAudience) => void;
  setStaffStatus: (id: string, status: StaffStatus) => void;
  addStaff: (name: string, email: string, role: StaffRole) => void;
};

const AdminDataContext = createContext<AdminData | null>(null);

const patch = <T extends { id: string }>(list: T[], id: string, change: Partial<T>) =>
  list.map(item => (item.id === id ? { ...item, ...change } : item));

const pretty = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ');

/**
 * Holds the admin panel's data for the session so an action on one screen
 * (e.g. approving a job) is reflected everywhere (dashboard counts, lists),
 * and records every action in the audit log.
 * Backed by demo data until the admin API exists – see sampleAdmin.ts.
 */
export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const actor = useAppSelector(s => s.auth.user?.name) || 'Admin';

  const [users, setUsers] = useState(SAMPLE_USERS);
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [companies, setCompanies] = useState(SAMPLE_COMPANIES);
  const [applications, setApplications] = useState(SAMPLE_APPLICATIONS);
  const [candidateKyc, setCandidateKyc] = useState(SAMPLE_CANDIDATE_KYC);
  const [placements, setPlacements] = useState(SAMPLE_PLACEMENTS);
  const [complaints, setComplaints] = useState(SAMPLE_COMPLAINTS);
  const [subscriptions, setSubscriptions] = useState(SAMPLE_SUBSCRIPTIONS);
  const [payments, setPayments] = useState(SAMPLE_PAYMENTS);
  const [broadcasts, setBroadcasts] = useState(SAMPLE_BROADCASTS);
  const [staff, setStaff] = useState(SAMPLE_STAFF);
  const [auditLogs, setAuditLogs] = useState(SAMPLE_AUDIT_LOGS);

  const log = useCallback(
    (module: AuditModule, action: string, target: string) =>
      setAuditLogs(l => [
        { id: `l${Date.now()}${Math.random()}`, actor, action, target, module, at: new Date().toISOString() },
        ...l,
      ]),
    [actor],
  );

  const value = useMemo<AdminData>(() => {
    const find = <T extends { id: string }>(list: T[], id: string) => list.find(i => i.id === id);
    return {
      users,
      jobs,
      companies,
      applications,
      candidateKyc,
      placements,
      complaints,
      plans: SAMPLE_PLANS,
      subscriptions,
      payments,
      broadcasts,
      staff,
      auditLogs,

      setUserStatus: (id, status) => {
        const u = find(users, id);
        setUsers(l => patch(l, id, { status }));
        if (u) {
          log(
            u.type === 'RECRUITER' ? 'Recruiters' : 'Candidates',
            `${status === 'BLOCKED' ? 'Blocked' : 'Unblocked'} ${u.type === 'RECRUITER' ? 'recruiter' : 'candidate'}`,
            u.name,
          );
        }
      },
      setJobStatus: (id, status) => {
        const j = find(jobs, id);
        setJobs(l => patch(l, id, { status }));
        if (j) log('Jobs', `${pretty(status)} job`, `${j.title} – ${j.company}`);
      },
      setCompanyStatus: (id, status) => {
        const c = find(companies, id);
        setCompanies(l => patch(l, id, { status }));
        if (c) log('Verification', `Marked company ${pretty(status).toLowerCase()}`, c.name);
      },
      setKycStatus: (id, status) => {
        const k = find(candidateKyc, id);
        setCandidateKyc(l => patch(l, id, { status }));
        if (k) {
          setUsers(l => patch(l, k.userId, { verified: status === 'VERIFIED' }));
          log('Verification', `Marked candidate KYC ${pretty(status).toLowerCase()}`, k.name);
        }
      },
      setApplicationStatus: (id, status) => {
        const a = find(applications, id);
        setApplications(l => patch(l, id, { status }));
        if (a) log('Applications', `Moved application to ${pretty(status).toLowerCase()}`, `${a.candidateName} → ${a.jobTitle}`);
      },
      toggleApplicationFlag: id => {
        const a = find(applications, id);
        setApplications(l => patch(l, id, { flagged: !a?.flagged }));
        if (a) log('Applications', a.flagged ? 'Removed flag' : 'Flagged application', `${a.candidateName} → ${a.jobTitle}`);
      },
      setPlacementStatus: (id, status) => {
        const p = find(placements, id);
        setPlacements(l => patch(l, id, { status }));
        if (p) log('Placements', `Marked placement ${pretty(status).toLowerCase()}`, `${p.candidateName} – ${p.company}`);
      },
      setComplaintStatus: (id, status) => {
        const c = find(complaints, id);
        setComplaints(l => patch(l, id, { status }));
        if (c) log('Complaints', `Marked complaint ${pretty(status).toLowerCase()}`, `#${c.id.toUpperCase()} ${c.subject}`);
      },
      setSubscriptionStatus: (id, status) => {
        const s = find(subscriptions, id);
        setSubscriptions(l => patch(l, id, { status }));
        if (s) log('Subscriptions', `${status === 'CANCELLED' ? 'Cancelled' : 'Re-activated'} subscription`, `${s.company} – ${s.plan}`);
      },
      refundPayment: id => {
        const p = find(payments, id);
        setPayments(l => patch(l, id, { status: 'REFUNDED' }));
        if (p) log('Payments', 'Refunded payment', `${p.id} – ₹${p.amount.toLocaleString('en-IN')}`);
      },
      sendBroadcast: (title, message, audience) => {
        setBroadcasts(l => [
          { id: `b${Date.now()}`, title, message, audience, sentAt: new Date().toISOString() },
          ...l,
        ]);
        log('Notifications', 'Sent notification', title);
      },
      setStaffStatus: (id, status) => {
        const s = find(staff, id);
        setStaff(l => patch(l, id, { status }));
        if (s) log('Users', `${status === 'DISABLED' ? 'Disabled' : 'Enabled'} admin user`, s.name);
      },
      addStaff: (name, email, role) => {
        setStaff(l => [
          ...l,
          { id: `st${Date.now()}`, name, email, role, status: 'ACTIVE', lastActiveAt: new Date().toISOString() },
        ]);
        log('Users', 'Added admin user', `${name} (${email})`);
      },
    };
  }, [
    users,
    jobs,
    companies,
    applications,
    candidateKyc,
    placements,
    complaints,
    subscriptions,
    payments,
    broadcasts,
    staff,
    auditLogs,
    log,
  ]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminData {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error('useAdminData must be used inside <AdminDataProvider>.');
  }
  return ctx;
}
