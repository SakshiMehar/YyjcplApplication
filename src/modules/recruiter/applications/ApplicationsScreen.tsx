import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SkeletonList } from '../../../components/animated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  Users2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, UserAvatar } from '../../../components/common';
import { RecruiterStackParamList } from '../../../navigation/types';
import { colors, font, MAX_FONT_MULTIPLIER, radius, scale, spacing, vs } from '../../../theme';
import { RecruiterApplication, useGetJobApplicationsQuery } from '../api/recruiterApi';

type Nav = NativeStackNavigationProp<RecruiterStackParamList>;

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  APPLIED:              { label: 'Applied',      bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  SHORTLISTED:          { label: 'Shortlisted',  bg: '#FFF1E6', text: colors.primary, dot: colors.primary },
  INTERVIEW_SCHEDULED:  { label: 'Interview',    bg: '#FEF9C3', text: '#92400E', dot: '#F59E0B' },
  NEXT_ROUND:           { label: 'Next Round',   bg: '#CCFBF1', text: '#0F766E', dot: '#14B8A6' },
  SELECTED:             { label: 'Selected',     bg: '#DCFCE7', text: colors.success, dot: colors.success },
  PLACED:               { label: 'Placed',       bg: '#DCFCE7', text: colors.success, dot: colors.success },
  REJECTED:             { label: 'Rejected',     bg: '#FEE2E2', text: colors.danger, dot: colors.danger },
  NOT_SELECTED:         { label: 'Not Selected', bg: '#F3F4F6', text: colors.textMuted, dot: colors.textMuted },
  WITHDRAWN:            { label: 'Withdrawn',    bg: '#F3F4F6', text: colors.textMuted, dot: colors.textMuted },
};
const getStatus = (s: string) =>
  STATUS_MAP[s?.toUpperCase()] ?? { label: s ?? 'Applied', bg: '#FFF1E6', text: colors.primary, dot: colors.primary };

/* ─── Stat chip for header ───────────────────────────────────────────────── */
function HeaderStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.headerStat}>
      <View style={[styles.headerStatDot, { backgroundColor: color }]} />
      <AppText style={[styles.headerStatValue, { color }]}>{value}</AppText>
      <AppText variant="caption" color="textSecondary" style={styles.headerStatLabel}>{label}</AppText>
    </View>
  );
}

/* ─── Filter tab ─────────────────────────────────────────────────────────── */
const FILTERS = ['All', 'Applied', 'Shortlisted', 'Interview', 'Selected'];

function FilterTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterTab, active && styles.filterTabActive]}
      accessibilityRole="button">
      <AppText variant="caption" style={[styles.filterTabText, active && styles.filterTabTextActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

/* ─── Application card ───────────────────────────────────────────────────── */
function AppCard({ item, onPress }: { item: RecruiterApplication; onPress: () => void }) {
  const profile = item.jobSeekerProfile;
  const name = profile?.name ?? item.applicantName ?? item.jobSeekerName ?? `Applicant #${item.jobSeekerId}`;
  const si = getStatus(item.status);

  const appliedDate = item.appliedAt
    ? new Date(item.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  const skillList = profile?.skills
    ? profile.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button">

      {/* Top: avatar + info + status */}
      <View style={styles.cardTop}>
        <UserAvatar name={name} size={scale(48)} />
        <View style={styles.cardInfo}>
          <AppText variant="bodyBold" numberOfLines={1}>{name}</AppText>
          {profile?.headline ? (
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {profile.headline}
            </AppText>
          ) : null}
          {item.job?.role ? (
            <View style={styles.roleRow}>
              <View style={[styles.miniIconSurface, styles.roleIconSurface]}>
                <BriefcaseBusiness size={scale(11)} color={colors.primary} />
              </View>
              <AppText variant="caption" style={styles.roleText} numberOfLines={1}>
                {item.job.role}
              </AppText>
            </View>
          ) : null}
        </View>
        {/* Status badge + arrow stacked */}
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: si.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: si.dot }]} />
            <AppText style={[styles.statusText, { color: si.text }]}>{si.label}</AppText>
          </View>
          <View style={styles.arrowBtn}>
            <ArrowRight size={scale(13)} color={colors.primary} />
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Meta chips */}
      <View style={styles.cardMeta}>
        {profile?.experience ? (
          <View style={styles.metaChip}>
            <View style={styles.miniIconSurface}><Clock3 size={scale(11)} color={colors.primary} /></View>
            <AppText variant="caption" color="textSecondary">{profile.experience}</AppText>
          </View>
        ) : null}
        {profile?.preferredLocation ? (
          <View style={styles.metaChip}>
            <View style={styles.miniIconSurface}><MapPin size={scale(11)} color={colors.primary} /></View>
            <AppText variant="caption" color="textSecondary">{profile.preferredLocation}</AppText>
          </View>
        ) : null}
        {appliedDate ? (
          <View style={styles.metaChip}>
            <View style={styles.miniIconSurface}><CalendarDays size={scale(11)} color={colors.primary} /></View>
            <AppText variant="caption" color="textSecondary">{appliedDate}</AppText>
          </View>
        ) : null}
      </View>

      {/* Skill chips */}
      {skillList.length > 0 ? (
        <View style={styles.skillRow}>
          {skillList.map((sk, i) => (
            <View key={i} style={styles.skillChip}>
              <AppText variant="caption" style={styles.skillChipText}>{sk}</AppText>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function ApplicationsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { data: applications = [], isLoading, isError, isFetching, refetch } =
    useGetJobApplicationsQuery();

  // Compute stats
  const stats = useMemo(() => ({
    total:       applications.length,
    shortlisted: applications.filter(a => a.status?.toUpperCase() === 'SHORTLISTED').length,
    interview:   applications.filter(a => a.status?.toUpperCase().includes('INTERVIEW')).length,
    selected:    applications.filter(a => ['SELECTED', 'PLACED'].includes(a.status?.toUpperCase())).length,
  }), [applications]);

  // Filter
  const filtered = useMemo(() => {
    let list = applications;
    if (activeFilter !== 'All') {
      list = list.filter(a => {
        const s = a.status?.toUpperCase() ?? '';
        if (activeFilter === 'Interview') return s.includes('INTERVIEW') || s.includes('NEXT_ROUND');
        if (activeFilter === 'Selected')  return s === 'SELECTED' || s === 'PLACED';
        return s === activeFilter.toUpperCase();
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => {
        const p = a.jobSeekerProfile;
        const name = (p?.name ?? a.applicantName ?? '').toLowerCase();
        const role = (a.job?.role ?? '').toLowerCase();
        return name.includes(q) || role.includes(q);
      });
    }
    return list;
  }, [applications, activeFilter, search]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.applicationId)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + vs(24) }}
        ItemSeparatorComponent={() => <View style={{ height: vs(14) }} />}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => { refetch(); }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* ── Hero header ── */}
            <View style={styles.heroShadow}>
            <View style={styles.hero}>
              {/* Decorative bubble */}
              <View style={styles.heroBubble} />

              <View style={styles.heroTextRow}>
                <View style={styles.heroHeading}>
                  <View style={styles.heroEyebrow}>
                    <View style={styles.heroEyebrowDot} />
                    <AppText variant="caption" style={styles.heroCaption}>RECRUITER WORKSPACE</AppText>
                  </View>
                  <AppText style={styles.heroTitle}>Applicants</AppText>
                  <AppText variant="caption" style={styles.heroSubtitle}>Review and manage your candidates</AppText>
                </View>
                <View style={styles.heroIconWrap}>
                  <Users2 size={scale(28)} color={colors.textOnPrimary} />
                </View>
              </View>

              {/* Stats row inside hero */}
              <View style={styles.heroStats}>
                <HeaderStat value={stats.total}       label="Total"       color={colors.textOnPrimary} />
                <View style={styles.heroStatDivider} />
                <HeaderStat value={stats.shortlisted} label="Shortlisted" color="#FFD580" />
                <View style={styles.heroStatDivider} />
                <HeaderStat value={stats.interview}   label="Interview"   color="#86EFAC" />
                <View style={styles.heroStatDivider} />
                <HeaderStat value={stats.selected}    label="Selected"    color="#FCA5A5" />
              </View>
            </View>
            </View>

            {/* ── Search bar ── */}
            <View style={styles.searchWrap}>
              <View style={styles.searchBox}>
                <View style={styles.searchIconSurface}><Search size={scale(15)} color={colors.primary} /></View>
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search applicant or role…"
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                />
              </View>
            </View>

            {/* ── Filter tabs ── */}
            <View style={styles.filterRow}>
              {FILTERS.map(f => (
                <FilterTab
                  key={f}
                  label={f}
                  active={activeFilter === f}
                  onPress={() => setActiveFilter(f)}
                />
              ))}
            </View>

            {/* Count */}
            <View style={styles.countRow}>
              <AppText variant="caption" color="textSecondary">
                {isLoading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
              </AppText>
            </View>

            {isLoading ? <SkeletonList count={4} /> : null}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <View style={styles.emptyIconInner}>
                  <Users2 size={scale(36)} color={colors.primary} strokeWidth={2.5} />
                </View>
              </View>
              <AppText variant="bodyBold" style={styles.emptyTitle}>
                {isError ? 'Could not load' : 'No applicants found'}
              </AppText>
              <AppText variant="caption" color="textMuted" style={styles.emptySub}>
                {isError ? 'Pull down to retry.' : 'Try a different filter or post a new job.'}
              </AppText>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <AppCard
              item={item}
              onPress={() => navigation.navigate('ApplicantDetails', { application: item })}
            />
          </View>
        )}
      />
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },

  /* Hero */
  heroShadow: {
    marginHorizontal: spacing.md,
    marginBottom: vs(16),
    borderRadius: 28,
    backgroundColor: colors.primary,
    shadowColor: '#9A3412',
    shadowOffset: { width: 0, height: vs(5) },
    shadowOpacity: 0.22,
    shadowRadius: scale(12),
    elevation: 8,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(16),
    paddingBottom: vs(18),
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroBubble: {
    position: 'absolute',
    width: scale(160), height: scale(160), borderRadius: scale(80),
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -scale(40), right: -scale(30),
  },
  heroTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(14),
  },
  heroHeading: { flex: 1, minWidth: 0, paddingRight: spacing.md },
  heroEyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
    marginBottom: vs(5),
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroEyebrowDot: { width: scale(6), height: scale(6), borderRadius: scale(3), backgroundColor: '#FFE0A3' },
  heroCaption: { color: 'rgba(255,255,255,0.9)', fontSize: font(9), fontWeight: '700', letterSpacing: 1 },
  heroTitle: {
    color: colors.textOnPrimary, fontSize: font(28), fontWeight: '800', lineHeight: vs(33),
  },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: font(12), marginTop: vs(3) },
  heroIconWrap: {
    width: scale(56), height: scale(56), borderRadius: scale(28),
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#9A3412', shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.18, shadowRadius: scale(8), elevation: 4,
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: vs(10),
    alignItems: 'center',
  },
  headerStat: { flex: 1, alignItems: 'center', gap: vs(3) },
  headerStatDot: { width: scale(8), height: scale(8), borderRadius: scale(4) },
  headerStatValue: { fontSize: font(20), fontWeight: '800' },
  headerStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: font(10) },
  heroStatDivider: { width: 1, height: vs(32), backgroundColor: 'rgba(255,255,255,0.25)' },

  /* Search */
  searchWrap: { paddingHorizontal: spacing.lg, marginBottom: vs(12) },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.background, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: vs(46),
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  searchIconSurface: {
    width: scale(30), height: scale(30), borderRadius: scale(15),
    backgroundColor: '#FFF1E6', borderWidth: 1, borderColor: '#FFE0C2',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#9A3412', shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.14, shadowRadius: scale(3), elevation: 2,
  },
  searchInput: { flex: 1, fontSize: font(14), color: colors.text, padding: 0 },

  /* Filter */
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: vs(12),
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingHorizontal: spacing.md, paddingVertical: vs(6),
    borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { color: colors.textSecondary, fontWeight: '600' },
  filterTabTextActive: { color: colors.textOnPrimary },

  /* Count */
  countRow: { paddingHorizontal: spacing.lg, marginBottom: vs(6) },

  /* List */
  listItem: { paddingHorizontal: spacing.lg },
  loader: { marginVertical: vs(32) },

  /* Card */
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.05, shadowRadius: scale(8),
    elevation: 2,
  },
  cardPressed: { opacity: 0.88 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardInfo: { flex: 1, gap: vs(2) },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: scale(4), marginTop: vs(2) },
  roleText: { color: colors.primary, fontWeight: '600', flex: 1 },
  cardRight: { alignItems: 'flex-end', gap: vs(8) },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: scale(4),
    paddingHorizontal: spacing.sm, paddingVertical: vs(4),
    borderRadius: radius.pill,
  },
  statusDot: { width: scale(6), height: scale(6), borderRadius: scale(3) },
  statusText: { fontWeight: '700', fontSize: font(11) },
  arrowBtn: {
    width: scale(26), height: scale(26), borderRadius: scale(13),
    backgroundColor: colors.primaryLight,
    borderWidth: 1, borderColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#C2410C', shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.18, shadowRadius: scale(3), elevation: 3,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: vs(12),
  },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: scale(6) },
  miniIconSurface: {
    width: scale(22), height: scale(22), borderRadius: scale(11),
    backgroundColor: '#FFF5EB', borderWidth: 1, borderColor: '#FFE6D1',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#9A3412', shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.14, shadowRadius: scale(2), elevation: 2,
  },
  roleIconSurface: { width: scale(20), height: scale(20), borderRadius: scale(10) },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: vs(10) },
  skillChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: vs(3),
    borderWidth: 1, borderColor: colors.primarySoft,
  },
  skillChipText: { color: colors.primary, fontWeight: '600', fontSize: font(11) },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: vs(48), paddingHorizontal: spacing.xl, gap: vs(8) },
  emptyIconWrap: {
    width: scale(72), height: scale(72), borderRadius: scale(36),
    backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: vs(8),
    shadowColor: '#C2410C', shadowOffset: { width: 0, height: vs(5) },
    shadowOpacity: 0.2, shadowRadius: scale(8), elevation: 6,
  },
  emptyIconInner: {
    width: '82%', height: '82%', borderRadius: scale(30),
    backgroundColor: '#FFF8F0', borderWidth: 1, borderColor: '#FFE1C4',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { marginTop: vs(4) },
  emptySub: { textAlign: 'center' },
});
