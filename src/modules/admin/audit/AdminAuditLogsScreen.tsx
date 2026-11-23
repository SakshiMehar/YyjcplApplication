import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, EmptyState, SearchBar, UserAvatar } from '../../../components/common';
import { colors, scale, spacing, vs } from '../../../theme';
import { formatDateTime, timeAgo } from '../../../utils/format';
import { AdminScreen, Panel, PillTabs, StatusPill } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { AuditModule } from '../data/sampleAdmin';

type Filter = 'ALL' | 'PEOPLE' | 'HIRING' | 'BILLING' | 'SUPPORT';
const GROUPS: Record<Exclude<Filter, 'ALL'>, AuditModule[]> = {
  PEOPLE: ['Candidates', 'Recruiters', 'Companies', 'Users'],
  HIRING: ['Jobs', 'Applications', 'Verification', 'Placements'],
  BILLING: ['Subscriptions', 'Payments'],
  SUPPORT: ['Complaints', 'Notifications'],
};

/** Audit Logs – a read-only trail of every action taken in the admin panel. */
export default function AdminAuditLogsScreen() {
  const { auditLogs } = useAdminData();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const list = auditLogs.filter(
    l =>
      (filter === 'ALL' || GROUPS[filter].includes(l.module)) &&
      (!q || [l.actor, l.action, l.target, l.module].some(v => v.toLowerCase().includes(q))),
  );

  return (
    <AdminScreen
      title="Audit Logs"
      subtitle={`${auditLogs.length} recorded actions`}
      toolbar={
        <>
          <SearchBar placeholder="Search admin, action, target…" value={query} onChangeText={setQuery} />
          <PillTabs<Filter>
            value={filter}
            onChange={setFilter}
            tabs={[
              { key: 'ALL', label: 'All' },
              { key: 'PEOPLE', label: 'People' },
              { key: 'HIRING', label: 'Hiring' },
              { key: 'BILLING', label: 'Billing' },
              { key: 'SUPPORT', label: 'Support' },
            ]}
          />
        </>
      }>
      {list.length === 0 ? (
        <EmptyState title="No activity" message="Admin actions will be recorded here." />
      ) : (
        <Panel>
          {list.map((l, i) => (
            <View key={l.id} style={styles.item}>
              {/* timeline rail */}
              <View style={styles.rail}>
                <View style={styles.dot} />
                {i < list.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.body}>
                <View style={styles.head}>
                  <UserAvatar name={l.actor} size={scale(26)} />
                  <AppText variant="bodyBold" numberOfLines={1} style={styles.flex}>{l.actor}</AppText>
                  <StatusPill label={l.module.toUpperCase()} tone="neutral" />
                </View>
                <AppText style={styles.action}>
                  {l.action} <AppText style={styles.target}>{l.target}</AppText>
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {timeAgo(l.at)} • {formatDateTime(l.at)}
                </AppText>
              </View>
            </View>
          ))}
        </Panel>
      )}
    </AdminScreen>
  );
}

const DOT = scale(10);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  item: { flexDirection: 'row', gap: spacing.md },
  rail: { width: DOT, alignItems: 'center' },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    marginTop: vs(8),
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: vs(2) },
  body: { flex: 1, paddingBottom: vs(16), gap: vs(4) },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  action: { color: colors.textSecondary, fontSize: scale(13.5) },
  target: { color: colors.text, fontWeight: '700', fontSize: scale(13.5) },
});
