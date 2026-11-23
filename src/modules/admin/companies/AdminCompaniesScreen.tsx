import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BadgeCheck, ChevronDown, ChevronUp, FileText, Globe, MapPin, UserRound, Users } from 'lucide-react-native';
import { AppText, EmptyState, SearchBar } from '../../../components/common';
import { AdminStackParamList } from '../../../navigation/types';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { ActionButton, AdminScreen, InfoRow, Panel, PillTabs, StatusPill, Tone } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { AdminCompany, CompanyVerificationStatus } from '../data/sampleAdmin';

type Filter = 'ALL' | CompanyVerificationStatus;
const TONE: Record<CompanyVerificationStatus, Tone> = { PENDING: 'warning', VERIFIED: 'success', REJECTED: 'danger' };

function CompanyCard({ company: c, onVerify }: { company: AdminCompany; onVerify: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Panel onPress={() => setOpen(o => !o)}>
      <View style={styles.head}>
        <View style={styles.logo}>
          <AppText style={styles.logoText}>{c.name.slice(0, 2).toUpperCase()}</AppText>
        </View>
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <AppText variant="bodyBold" numberOfLines={1} style={styles.name}>
              {c.name}
            </AppText>
            {c.status === 'VERIFIED' ? <BadgeCheck size={scale(15)} color={colors.success} /> : null}
          </View>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {c.industry} • {c.location}
          </AppText>
        </View>
        <StatusPill label={c.status} tone={TONE[c.status]} />
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <AppText style={styles.statValue}>{c.activeJobs}</AppText>
          <AppText variant="caption" color="textSecondary">Active jobs</AppText>
        </View>
        <View style={styles.stat}>
          <AppText style={styles.statValue}>{c.totalHires}</AppText>
          <AppText variant="caption" color="textSecondary">Hires</AppText>
        </View>
        <View style={styles.stat}>
          <AppText style={styles.statValue} numberOfLines={1}>{c.plan ?? '—'}</AppText>
          <AppText variant="caption" color="textSecondary">Plan</AppText>
        </View>
      </View>

      {open ? (
        <View style={styles.details}>
          <InfoRow icon={UserRound} label="Recruiter" value={c.recruiterName} />
          <InfoRow icon={Users} label="Company Size" value={c.size} />
          <InfoRow icon={MapPin} label="Location" value={c.location} />
          <InfoRow icon={FileText} label="GSTIN" value={c.gstin} />
          <InfoRow icon={Globe} label="Website" value={c.website} />
          {c.status === 'PENDING' ? (
            <ActionButton title="Review in Verification" icon={BadgeCheck} tone="success" onPress={onVerify} style={styles.verify} />
          ) : null}
        </View>
      ) : null}

      <View style={styles.toggle}>
        {open ? <ChevronUp size={scale(16)} color={colors.textMuted} /> : <ChevronDown size={scale(16)} color={colors.textMuted} />}
      </View>
    </Panel>
  );
}

/** Companies – directory of every company registered by recruiters. */
export default function AdminCompaniesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const { companies } = useAdminData();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const count = (f: Filter) => companies.filter(c => f === 'ALL' || c.status === f).length;
  const q = query.trim().toLowerCase();
  const list = companies.filter(
    c =>
      (filter === 'ALL' || c.status === filter) &&
      (!q || [c.name, c.industry, c.location, c.recruiterName].some(v => v.toLowerCase().includes(q))),
  );

  return (
    <AdminScreen
      title="Companies"
      subtitle={`${companies.length} registered companies`}
      toolbar={
        <>
          <SearchBar placeholder="Search company, industry, city…" value={query} onChangeText={setQuery} />
          <PillTabs<Filter>
            value={filter}
            onChange={setFilter}
            tabs={[
              { key: 'ALL', label: 'All', count: count('ALL') },
              { key: 'VERIFIED', label: 'Verified', count: count('VERIFIED') },
              { key: 'PENDING', label: 'Pending', count: count('PENDING') },
              { key: 'REJECTED', label: 'Rejected', count: count('REJECTED') },
            ]}
          />
        </>
      }>
      {list.length === 0 ? (
        <EmptyState title="No companies found" message="Try a different search or filter." />
      ) : (
        list.map(c => (
          <CompanyCard
            key={c.id}
            company={c}
            onVerify={() => navigation.navigate('AdminVerification', { tab: 'COMPANIES' })}
          />
        ))
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: {
    width: scale(46),
    height: scale(46),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.primary, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  name: { flexShrink: 1 },
  stats: {
    flexDirection: 'row',
    marginTop: vs(12),
    paddingTop: vs(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: font(16), fontWeight: '800', color: colors.text },
  details: { marginTop: vs(8) },
  verify: { marginTop: vs(8) },
  toggle: { alignItems: 'center', marginTop: vs(6), marginBottom: -vs(6) },
});
