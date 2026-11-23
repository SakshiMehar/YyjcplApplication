import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { CalendarClock, Pencil, RotateCcw, Users, X } from 'lucide-react-native';
import { AppText, EmptyState } from '../../../components/common';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { formatDate } from '../../../utils/format';
import {
  ActionButton,
  AdminScreen,
  formatINR,
  Panel,
  PillTabs,
  SectionTitle,
  StatusPill,
  Tone,
} from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { AdminPlan, AdminSubscription, SubscriptionStatus } from '../data/sampleAdmin';

type Filter = 'ALL' | SubscriptionStatus;
const TONE: Record<SubscriptionStatus, Tone> = {
  ACTIVE: 'success',
  EXPIRING: 'warning',
  EXPIRED: 'neutral',
  CANCELLED: 'danger',
};

function PlanCard({ plan }: { plan: AdminPlan }) {
  return (
    <View style={[styles.plan, plan.popular && styles.planPopular]}>
      <View style={styles.planHead}>
        <AppText variant="bodyBold">{plan.name}</AppText>
        {plan.popular ? (
          <View style={styles.popularTag}>
            <AppText style={styles.popularText}>Most Popular</AppText>
          </View>
        ) : null}
      </View>
      <AppText style={[styles.price, plan.popular && styles.pricePopular]}>
        {formatINR(plan.price)}
        <AppText variant="caption" color="textSecondary">/month</AppText>
      </AppText>
      <AppText variant="caption" color="textSecondary">
        {plan.jobLimit} + {plan.applicationLimit}
      </AppText>
      <View style={styles.planFoot}>
        <View style={styles.meta}>
          <Users size={scale(13)} color={colors.textSecondary} />
          <AppText variant="caption" color="textSecondary">{plan.subscribers} subscribers</AppText>
        </View>
        <AppText variant="caption" style={styles.planRevenue}>
          {formatINR(plan.price * plan.subscribers)}/mo
        </AppText>
      </View>
    </View>
  );
}

function SubscriptionRow({ sub, onToggle }: { sub: AdminSubscription; onToggle: () => void }) {
  const usage = sub.jobsLimit ? Math.min(1, sub.jobsUsed / sub.jobsLimit) : 0.35;
  const cancellable = sub.status === 'ACTIVE' || sub.status === 'EXPIRING';
  return (
    <Panel>
      <View style={styles.subHead}>
        <View style={styles.flex}>
          <AppText variant="bodyBold" numberOfLines={1}>{sub.company}</AppText>
          <AppText variant="caption" color="textSecondary">
            {sub.plan} • {formatINR(sub.amount)}/month
          </AppText>
        </View>
        <StatusPill label={sub.status} tone={TONE[sub.status]} />
      </View>
      <View style={styles.usageRow}>
        <AppText variant="caption" color="textSecondary">Jobs used</AppText>
        <AppText variant="caption" style={styles.usageText}>
          {sub.jobsUsed} / {sub.jobsLimit ?? '∞'}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${usage * 100}%` }, usage >= 1 && styles.fillFull]} />
      </View>
      <View style={styles.subFoot}>
        <View style={styles.meta}>
          <CalendarClock size={scale(13)} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted">
            {sub.status === 'EXPIRED' ? 'Expired' : 'Renews'} {formatDate(sub.expiresAt)}
          </AppText>
        </View>
        {sub.status !== 'EXPIRED' ? (
          <ActionButton
            title={cancellable ? 'Cancel' : 'Re-activate'}
            icon={cancellable ? X : RotateCcw}
            tone={cancellable ? 'danger' : 'success'}
            onPress={onToggle}
          />
        ) : null}
      </View>
    </Panel>
  );
}

/** Subscriptions – plan catalogue and every recruiter's subscription. */
export default function AdminSubscriptionsScreen() {
  const { plans, subscriptions, setSubscriptionStatus } = useAdminData();
  const [filter, setFilter] = useState<Filter>('ALL');

  const mrr = subscriptions
    .filter(s => s.status === 'ACTIVE' || s.status === 'EXPIRING')
    .reduce((sum, s) => sum + s.amount, 0);
  const count = (f: Filter) => subscriptions.filter(s => f === 'ALL' || s.status === f).length;
  const list = subscriptions.filter(s => filter === 'ALL' || s.status === filter);

  const toggle = (s: AdminSubscription) => {
    const cancel = s.status === 'ACTIVE' || s.status === 'EXPIRING';
    Alert.alert(cancel ? 'Cancel subscription?' : 'Re-activate subscription?', `${s.company} – ${s.plan}`, [
      { text: 'No', style: 'cancel' },
      {
        text: cancel ? 'Cancel subscription' : 'Re-activate',
        style: cancel ? 'destructive' : 'default',
        onPress: () => setSubscriptionStatus(s.id, cancel ? 'CANCELLED' : 'ACTIVE'),
      },
    ]);
  };
  const notReady = () => Alert.alert('Coming soon', 'Plan editing will be available once the admin API is connected.');

  return (
    <AdminScreen title="Subscriptions" subtitle={`${formatINR(mrr)} monthly recurring revenue`}>
      <SectionTitle title="Plans" actionLabel="Edit plans" onAction={notReady} />
      <Panel>
        {plans.map(p => (
          <PlanCard key={p.id} plan={p} />
        ))}
        <ActionButton title="Create New Plan" icon={Pencil} variant="filled" onPress={notReady} />
      </Panel>

      <SectionTitle title="Recruiter Subscriptions" />
      <PillTabs<Filter>
        value={filter}
        onChange={setFilter}
        tabs={[
          { key: 'ALL', label: 'All', count: count('ALL') },
          { key: 'ACTIVE', label: 'Active', count: count('ACTIVE') },
          { key: 'EXPIRING', label: 'Expiring', count: count('EXPIRING') },
          { key: 'EXPIRED', label: 'Expired', count: count('EXPIRED') },
        ]}
      />
      <View style={styles.gap} />
      {list.length === 0 ? (
        <EmptyState title="No subscriptions" />
      ) : (
        list.map(s => <SubscriptionRow key={s.id} sub={s} onToggle={() => toggle(s)} />)
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { height: vs(10) },
  plan: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: vs(10),
    gap: vs(2),
  },
  planPopular: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.primaryLight },
  planHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  popularTag: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: vs(3) },
  popularText: { color: colors.textOnPrimary, fontSize: font(10), fontWeight: '700' },
  price: { fontSize: font(22), fontWeight: '800', color: colors.text },
  pricePopular: { color: colors.primary },
  planFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: vs(8) },
  meta: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  planRevenue: { color: colors.success, fontWeight: '700' },
  subHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: vs(12), marginBottom: vs(6) },
  usageText: { fontWeight: '700', color: colors.text },
  track: { height: vs(7), borderRadius: radius.pill, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  fillFull: { backgroundColor: colors.danger },
  subFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: vs(12) },
});
