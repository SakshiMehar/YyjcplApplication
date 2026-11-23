import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckCircle2, Clock, PlayCircle, RotateCcw } from 'lucide-react-native';
import { AppText, EmptyState, UserAvatar } from '../../../components/common';
import { scale, spacing, vs } from '../../../theme';
import { timeAgo } from '../../../utils/format';
import { ActionButton, AdminScreen, Panel, PillTabs, StatusPill, Tone } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { AdminComplaint, ComplaintPriority, ComplaintStatus } from '../data/sampleAdmin';

const STATUS_TONE: Record<ComplaintStatus, Tone> = {
  OPEN: 'danger',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
};
const PRIORITY_TONE: Record<ComplaintPriority, Tone> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'neutral',
};

function ComplaintCard({
  complaint: c,
  onStatus,
}: {
  complaint: AdminComplaint;
  onStatus: (s: ComplaintStatus) => void;
}) {
  return (
    <Panel>
      <View style={styles.head}>
        <UserAvatar name={c.raisedBy} size={scale(40)} />
        <View style={styles.flex}>
          <AppText variant="bodyBold" numberOfLines={1}>
            {c.raisedBy}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {c.raisedByType === 'RECRUITER' ? 'Recruiter' : 'Job Seeker'} • #{c.id.toUpperCase()}
          </AppText>
        </View>
        <StatusPill label={`${c.priority} PRIORITY`} tone={PRIORITY_TONE[c.priority]} />
      </View>

      <AppText variant="bodyBold" style={styles.subject}>
        {c.subject}
      </AppText>
      <AppText variant="caption" color="textSecondary" style={styles.desc}>
        {c.description}
      </AppText>

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <Clock size={scale(12)} color="#A8A29E" />
          <AppText variant="caption" color="textMuted">
            {timeAgo(c.createdAt)}
          </AppText>
        </View>
        <StatusPill label={c.status.replace('_', ' ')} tone={STATUS_TONE[c.status]} />
      </View>

      <View style={styles.actions}>
        {c.status === 'OPEN' ? (
          <ActionButton title="Start Working" icon={PlayCircle} tone="warning" style={styles.flex}
            onPress={() => onStatus('IN_PROGRESS')} />
        ) : null}
        {c.status !== 'RESOLVED' ? (
          <ActionButton title="Mark Resolved" icon={CheckCircle2} tone="success" variant="filled" style={styles.flex}
            onPress={() => onStatus('RESOLVED')} />
        ) : (
          <ActionButton title="Reopen" icon={RotateCcw} style={styles.flex} onPress={() => onStatus('OPEN')} />
        )}
      </View>
    </Panel>
  );
}

/** Complaints raised from "Raise a Complaint" in the job-seeker & recruiter apps. */
export default function AdminComplaintsScreen() {
  const { complaints, setComplaintStatus } = useAdminData();
  const [tab, setTab] = useState<ComplaintStatus>('OPEN');
  const count = (s: ComplaintStatus) => complaints.filter(c => c.status === s).length;
  const list = complaints.filter(c => c.status === tab);

  return (
    <AdminScreen
      title="Complaints"
      subtitle={`${count('OPEN') + count('IN_PROGRESS')} unresolved`}
      toolbar={
        <PillTabs<ComplaintStatus>
          value={tab}
          onChange={setTab}
          tabs={[
            { key: 'OPEN', label: 'Open', count: count('OPEN') },
            { key: 'IN_PROGRESS', label: 'In Progress', count: count('IN_PROGRESS') },
            { key: 'RESOLVED', label: 'Resolved', count: count('RESOLVED') },
          ]}
        />
      }>
      {list.length === 0 ? (
        <EmptyState title="No complaints" message="Nothing in this list right now." />
      ) : (
        list.map(c => (
          <ComplaintCard key={c.id} complaint={c} onStatus={s => setComplaintStatus(c.id, s)} />
        ))
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  subject: { marginTop: vs(12) },
  desc: { marginTop: vs(4), lineHeight: vs(18) },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: vs(12) },
  meta: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: vs(12) },
});
