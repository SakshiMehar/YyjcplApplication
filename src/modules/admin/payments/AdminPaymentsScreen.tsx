import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { CreditCard, IndianRupee, Undo2, XCircle } from 'lucide-react-native';
import { AppText, EmptyState, SearchBar } from '../../../components/common';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { formatDateTime } from '../../../utils/format';
import { ActionButton, AdminScreen, formatINR, Panel, PillTabs, StatusPill, Tone } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { AdminPayment, PaymentStatus } from '../data/sampleAdmin';

type Filter = 'ALL' | PaymentStatus;
const TONE: Record<PaymentStatus, Tone> = { SUCCESS: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'neutral' };

/** Payments – every subscription transaction, with refunds. */
export default function AdminPaymentsScreen() {
  const { payments, refundPayment } = useAdminData();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const collected = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  const failed = payments.filter(p => p.status === 'FAILED').length;
  const count = (f: Filter) => payments.filter(p => f === 'ALL' || p.status === f).length;
  const q = query.trim().toLowerCase();
  const list = payments.filter(
    p => (filter === 'ALL' || p.status === filter) && (!q || [p.id, p.company, p.plan].some(v => v.toLowerCase().includes(q))),
  );

  const refund = (p: AdminPayment) =>
    Alert.alert('Refund payment?', `${formatINR(p.amount)} to ${p.company} (${p.id})`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Refund', style: 'destructive', onPress: () => refundPayment(p.id) },
    ]);

  return (
    <AdminScreen
      title="Payments"
      subtitle="Subscription transactions"
      toolbar={
        <>
          <SearchBar placeholder="Search transaction ID or company…" value={query} onChangeText={setQuery} autoCapitalize="characters" />
          <PillTabs<Filter>
            value={filter}
            onChange={setFilter}
            tabs={[
              { key: 'ALL', label: 'All', count: count('ALL') },
              { key: 'SUCCESS', label: 'Success', count: count('SUCCESS') },
              { key: 'PENDING', label: 'Pending', count: count('PENDING') },
              { key: 'FAILED', label: 'Failed', count: failed },
            ]}
          />
        </>
      }>
      <View style={styles.summary}>
        <View style={[styles.card, styles.green]}>
          <IndianRupee size={scale(18)} color={colors.success} />
          <AppText style={styles.value}>{formatINR(collected)}</AppText>
          <AppText variant="caption" color="textSecondary">Collected</AppText>
        </View>
        <View style={[styles.card, styles.red]}>
          <XCircle size={scale(18)} color={colors.danger} />
          <AppText style={styles.value}>{failed}</AppText>
          <AppText variant="caption" color="textSecondary">Failed payments</AppText>
        </View>
      </View>

      {list.length === 0 ? (
        <EmptyState title="No transactions" message="Nothing matches this filter." />
      ) : (
        list.map(p => (
          <Panel key={p.id}>
            <View style={styles.row}>
              <View style={styles.icon}>
                <CreditCard size={scale(18)} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyBold" numberOfLines={1}>{p.company}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {p.plan} plan • {p.method}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {p.id} • {formatDateTime(p.paidAt)}
                </AppText>
              </View>
              <View style={styles.right}>
                <AppText variant="bodyBold">{formatINR(p.amount)}</AppText>
                <StatusPill label={p.status} tone={TONE[p.status]} />
              </View>
            </View>
            {p.status === 'SUCCESS' ? (
              <ActionButton title="Refund" icon={Undo2} tone="neutral" style={styles.refund} onPress={() => refund(p)} />
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
  card: { flex: 1, borderRadius: radius.lg, padding: spacing.lg, gap: vs(4) },
  green: { backgroundColor: '#F0FFF4' },
  red: { backgroundColor: '#FEF2F2' },
  value: { fontSize: font(22), fontWeight: '800', color: colors.text, marginTop: vs(4) },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: scale(40),
    height: scale(40),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: { alignItems: 'flex-end', gap: vs(4) },
  refund: { marginTop: vs(12), alignSelf: 'flex-end' },
});
