import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Building2, CalendarCheck, Check, IndianRupee, X } from 'lucide-react-native';
import { AppText, EmptyState, UserAvatar } from '../../../components/common';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { formatDate } from '../../../utils/format';
import { ActionButton, AdminScreen, Panel, PillTabs, StatusPill, Tone } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { PlacementStatus } from '../data/sampleAdmin';

type Filter = 'ALL' | PlacementStatus;
const TONE: Record<PlacementStatus, Tone> = { OFFERED: 'warning', JOINED: 'success', DROPPED: 'danger' };

/** Placements – candidates who got an offer through YYJCPL, and whether they joined. */
export default function AdminPlacementsScreen() {
  const { placements, setPlacementStatus } = useAdminData();
  const [filter, setFilter] = useState<Filter>('ALL');

  const count = (f: Filter) => placements.filter(p => f === 'ALL' || p.status === f).length;
  const joined = count('JOINED');
  const decided = joined + count('DROPPED');
  const joinRate = decided ? Math.round((joined / decided) * 100) : 0;
  const list = placements.filter(p => filter === 'ALL' || p.status === filter);

  return (
    <AdminScreen
      title="Placements"
      subtitle="Offers and joinings"
      toolbar={
        <PillTabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { key: 'ALL', label: 'All', count: count('ALL') },
            { key: 'OFFERED', label: 'Offered', count: count('OFFERED') },
            { key: 'JOINED', label: 'Joined', count: joined },
            { key: 'DROPPED', label: 'Dropped', count: count('DROPPED') },
          ]}
        />
      }>
      <View style={styles.summary}>
        <View style={[styles.summaryCard, styles.green]}>
          <AppText style={styles.summaryValue}>{joined}</AppText>
          <AppText variant="caption" color="textSecondary">Joined this month</AppText>
        </View>
        <View style={[styles.summaryCard, styles.amber]}>
          <AppText style={styles.summaryValue}>{joinRate}%</AppText>
          <AppText variant="caption" color="textSecondary">Joining rate</AppText>
        </View>
      </View>

      {list.length === 0 ? (
        <EmptyState title="No placements" message="Nothing matches this filter." />
      ) : (
        list.map(p => (
          <Panel key={p.id}>
            <View style={styles.head}>
              <UserAvatar name={p.candidateName} size={scale(44)} />
              <View style={styles.flex}>
                <AppText variant="bodyBold" numberOfLines={1}>{p.candidateName}</AppText>
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>{p.jobTitle}</AppText>
              </View>
              <StatusPill label={p.status} tone={TONE[p.status]} />
            </View>
            <View style={styles.metaRow}>
              <View style={styles.meta}>
                <Building2 size={scale(12)} color={colors.textMuted} />
                <AppText variant="caption" color="textSecondary">{p.company}</AppText>
              </View>
              <View style={styles.meta}>
                <IndianRupee size={scale(12)} color={colors.textMuted} />
                <AppText variant="caption" color="textSecondary">{p.ctc.replace('₹', '')}</AppText>
              </View>
              <View style={styles.meta}>
                <CalendarCheck size={scale(12)} color={colors.textMuted} />
                <AppText variant="caption" color="textSecondary">Joining {formatDate(p.joiningDate)}</AppText>
              </View>
            </View>
            {p.status === 'OFFERED' ? (
              <View style={styles.actions}>
                <ActionButton title="Dropped" icon={X} tone="danger" style={styles.flex} onPress={() => setPlacementStatus(p.id, 'DROPPED')} />
                <ActionButton title="Joined" icon={Check} tone="success" variant="filled" style={styles.flex} onPress={() => setPlacementStatus(p.id, 'JOINED')} />
              </View>
            ) : null}
          </Panel>
        ))
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: { flexDirection: 'row', gap: spacing.md, marginBottom: vs(12) },
  summaryCard: { flex: 1, borderRadius: radius.lg, padding: spacing.lg },
  green: { backgroundColor: '#F0FFF4' },
  amber: { backgroundColor: '#FFFBEB' },
  summaryValue: { fontSize: font(22), fontWeight: '800', color: colors.text },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: vs(10) },
  meta: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: vs(12) },
});
