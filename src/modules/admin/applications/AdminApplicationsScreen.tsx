import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Building2, Clock, Flag, UserRound } from 'lucide-react-native';
import { AppText, EmptyState, SearchBar, UserAvatar } from '../../../components/common';
import { AdminStackParamList } from '../../../navigation/types';
import { colors, scale, spacing, vs } from '../../../theme';
import { timeAgo } from '../../../utils/format';
import { ActionButton, AdminScreen, Panel, PillTabs, StatusPill, Tone } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { AdminApplication, AdminApplicationStatus } from '../data/sampleAdmin';

type Filter = 'ALL' | 'FLAGGED' | AdminApplicationStatus;

const STATUS: Record<AdminApplicationStatus, { label: string; tone: Tone }> = {
  APPLIED: { label: 'APPLIED', tone: 'info' },
  SHORTLISTED: { label: 'SHORTLISTED', tone: 'primary' },
  INTERVIEW: { label: 'INTERVIEW', tone: 'warning' },
  SELECTED: { label: 'SELECTED', tone: 'success' },
  REJECTED: { label: 'REJECTED', tone: 'danger' },
};
const ORDER: AdminApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

function ApplicationCard({
  app,
  onFlag,
  onStatus,
  onCandidate,
}: {
  app: AdminApplication;
  onFlag: () => void;
  onStatus: () => void;
  onCandidate: () => void;
}) {
  const s = STATUS[app.status];
  return (
    <Panel style={app.flagged ? styles.flaggedCard : undefined}>
      <View style={styles.head}>
        <UserAvatar name={app.candidateName} size={scale(42)} />
        <View style={styles.flex}>
          <AppText variant="bodyBold" numberOfLines={1}>
            {app.candidateName}
          </AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {app.jobTitle}
          </AppText>
        </View>
        <StatusPill label={s.label} tone={s.tone} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <Building2 size={scale(12)} color={colors.textMuted} />
          <AppText variant="caption" color="textSecondary">{app.company}</AppText>
        </View>
        <View style={styles.meta}>
          <Clock size={scale(12)} color={colors.textMuted} />
          <AppText variant="caption" color="textSecondary">{timeAgo(app.appliedAt)}</AppText>
        </View>
        {app.flagged ? (
          <View style={styles.meta}>
            <Flag size={scale(12)} color={colors.danger} fill={colors.danger} />
            <AppText variant="caption" color="danger">Flagged</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <ActionButton title="Profile" icon={UserRound} variant="outline" style={styles.flex} onPress={onCandidate} />
        <ActionButton title="Status" style={styles.flex} onPress={onStatus} />
        <ActionButton
          title={app.flagged ? 'Unflag' : 'Flag'}
          icon={Flag}
          tone={app.flagged ? 'neutral' : 'danger'}
          style={styles.flex}
          onPress={onFlag}
        />
      </View>
    </Panel>
  );
}

/** Applications – every application on the platform, with status override and spam flagging. */
export default function AdminApplicationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const { applications, setApplicationStatus, toggleApplicationFlag } = useAdminData();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const count = (f: Filter) =>
    applications.filter(a => (f === 'ALL' ? true : f === 'FLAGGED' ? a.flagged : a.status === f)).length;
  const q = query.trim().toLowerCase();
  const list = applications.filter(
    a =>
      (filter === 'ALL' || (filter === 'FLAGGED' ? a.flagged : a.status === filter)) &&
      (!q || [a.candidateName, a.jobTitle, a.company].some(v => v.toLowerCase().includes(q))),
  );

  const changeStatus = (a: AdminApplication) =>
    Alert.alert('Change status', `${a.candidateName} → ${a.jobTitle}`, [
      ...ORDER.filter(s => s !== a.status).map(s => ({
        text: STATUS[s].label.charAt(0) + STATUS[s].label.slice(1).toLowerCase(),
        onPress: () => setApplicationStatus(a.id, s),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);

  return (
    <AdminScreen
      title="Applications"
      subtitle={`${applications.length} applications • ${count('FLAGGED')} flagged`}
      toolbar={
        <>
          <SearchBar placeholder="Search candidate, job, company…" value={query} onChangeText={setQuery} />
          <PillTabs<Filter>
            value={filter}
            onChange={setFilter}
            tabs={[
              { key: 'ALL', label: 'All', count: count('ALL') },
              { key: 'INTERVIEW', label: 'Interview', count: count('INTERVIEW') },
              { key: 'SELECTED', label: 'Selected', count: count('SELECTED') },
              { key: 'FLAGGED', label: 'Flagged', count: count('FLAGGED') },
            ]}
          />
        </>
      }>
      {list.length === 0 ? (
        <EmptyState title="No applications" message="Nothing matches this filter." />
      ) : (
        list.map(a => (
          <ApplicationCard
            key={a.id}
            app={a}
            onFlag={() => toggleApplicationFlag(a.id)}
            onStatus={() => changeStatus(a)}
            onCandidate={() => navigation.navigate('AdminUserDetails', { userId: a.candidateId })}
          />
        ))
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flaggedCard: { borderColor: '#FECACA', backgroundColor: '#FFFBFB' },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: vs(10) },
  meta: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: vs(12) },
});
