import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  BriefcaseBusiness,
  Check,
  Clock,
  IndianRupee,
  MapPin,
  RotateCcw,
  Users,
  X,
} from 'lucide-react-native';
import { AppText, EmptyState, SearchBar } from '../../../components/common';
import { AdminTabParamList } from '../../../navigation/types';
import { colors, radius, scale, spacing, vs } from '../../../theme';
import { timeAgo } from '../../../utils/format';
import { ActionButton, AdminScreen, Panel, PillTabs, StatusPill, Tag, Tone } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { AdminJob, AdminJobStatus } from '../data/sampleAdmin';

const STATUS_TONE: Record<AdminJobStatus, Tone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

function Meta({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <View style={styles.meta}>
      <Icon size={scale(12)} color={colors.textMuted} />
      <AppText variant="caption" color="textSecondary">
        {text}
      </AppText>
    </View>
  );
}

function JobCard({
  job,
  onStatus,
}: {
  job: AdminJob;
  onStatus: (status: AdminJobStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Panel onPress={() => setExpanded(e => !e)}>
      <View style={styles.head}>
        <View style={styles.jobIcon}>
          <BriefcaseBusiness size={scale(20)} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyBold" numberOfLines={1}>
            {job.title}
          </AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {job.company} • by {job.recruiterName}
          </AppText>
        </View>
        <StatusPill label={job.status} tone={STATUS_TONE[job.status]} />
      </View>

      <View style={styles.metaWrap}>
        <Meta icon={MapPin} text={job.location} />
        <Meta icon={IndianRupee} text={job.salary.replace('₹', '')} />
        <Meta icon={Clock} text={job.experience} />
        <Meta icon={Users} text={`${job.openings} openings`} />
      </View>

      {expanded ? (
        <View style={styles.details}>
          <AppText variant="caption" color="textSecondary" style={styles.desc}>
            {job.description}
          </AppText>
          <View style={styles.tags}>
            {job.skills.map(s => (
              <Tag key={s} label={s} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.footer}>
        <AppText variant="caption" color="textMuted">
          {job.jobType} • Posted {timeAgo(job.postedAt)}
          {job.status === 'APPROVED' ? ` • ${job.applicants} applicants` : ''}
        </AppText>
      </View>

      {job.status === 'PENDING' ? (
        <View style={styles.actions}>
          <ActionButton title="Reject" icon={X} tone="danger" style={styles.flex} onPress={() => onStatus('REJECTED')} />
          <ActionButton
            title="Approve"
            icon={Check}
            tone="success"
            variant="filled"
            style={styles.flex}
            onPress={() => onStatus('APPROVED')}
          />
        </View>
      ) : (
        <View style={styles.actions}>
          <ActionButton
            title={job.status === 'APPROVED' ? 'Take Down' : 'Move to Pending'}
            icon={job.status === 'APPROVED' ? X : RotateCcw}
            tone={job.status === 'APPROVED' ? 'danger' : 'primary'}
            style={styles.flex}
            onPress={() => onStatus(job.status === 'APPROVED' ? 'REJECTED' : 'PENDING')}
          />
        </View>
      )}
    </Panel>
  );
}

/** Job Approvals – recruiters' job posts wait here until an admin approves them. */
export default function AdminJobsScreen() {
  const route = useRoute<RouteProp<AdminTabParamList, 'AdminJobs'>>();
  const { jobs, setJobStatus } = useAdminData();
  const [tab, setTab] = useState<AdminJobStatus>(route.params?.status ?? 'PENDING');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (route.params?.status) setTab(route.params.status);
  }, [route.params?.status]);

  const count = (s: AdminJobStatus) => jobs.filter(j => j.status === s).length;
  const q = query.trim().toLowerCase();
  const list = jobs.filter(
    j =>
      j.status === tab &&
      (!q || [j.title, j.company, j.location, ...j.skills].some(v => v.toLowerCase().includes(q))),
  );

  const changeStatus = (job: AdminJob, status: AdminJobStatus) => {
    const verb =
      status === 'APPROVED' ? 'Approve' : status === 'REJECTED' ? (job.status === 'APPROVED' ? 'Take down' : 'Reject') : 'Move';
    Alert.alert(`${verb} job?`, `"${job.title}" at ${job.company}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: verb,
        style: status === 'REJECTED' ? 'destructive' : 'default',
        onPress: () => setJobStatus(job.id, status),
      },
    ]);
  };

  return (
    <AdminScreen
      title="Job Approvals"
      subtitle="Review job posts before they go live"
      showBack={false}
      inTabs
      onRefresh={() => {}}
      toolbar={
        <>
          <SearchBar
            placeholder="Search jobs, companies, skills…"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          <PillTabs<AdminJobStatus>
            value={tab}
            onChange={setTab}
            tabs={[
              { key: 'PENDING', label: 'Pending', count: count('PENDING') },
              { key: 'APPROVED', label: 'Approved', count: count('APPROVED') },
              { key: 'REJECTED', label: 'Rejected', count: count('REJECTED') },
            ]}
          />
        </>
      }>
      {list.length === 0 ? (
        <EmptyState
          title={tab === 'PENDING' ? 'No jobs waiting' : 'Nothing here'}
          message={tab === 'PENDING' ? 'All job posts have been reviewed. 🎉' : 'Try another tab or search.'}
        />
      ) : (
        list.map(job => <JobCard key={job.id} job={job} onStatus={s => changeStatus(job, s)} />)
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  jobIcon: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: vs(12) },
  meta: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  details: { marginTop: vs(12), gap: vs(10) },
  desc: { lineHeight: vs(18) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  footer: { marginTop: vs(10) },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: vs(12) },
});
