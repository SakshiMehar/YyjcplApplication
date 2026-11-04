import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
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
              <BriefcaseBusiness size={scale(11)} color={colors.primary} />
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
            <Clock3 size={scale(11)} color={colors.primary} />
            <AppText variant="caption" color="textSecondary">{profile.experience}</AppText>
          </View>
        ) : null}
        {profile?.preferredLocation ? (
          <View style={styles.metaChip}>
            <MapPin size={scale(11)} color={colors.primary} />
            <AppText variant="caption" color="textSecondary">{profile.preferredLocation}</AppText>
          </View>
        ) : null}
        {appliedDate ? (
          <View style={styles.metaChip}>
            <CalendarDays size={scale(11)} color={colors.primary} />
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
            <View style={styles.hero}>
              {/* Decorative bubble */}
              <View style={styles.heroBubble} />

              <View style={styles.heroTextRow}>
                <View>
                  <AppText variant="caption" style={styles.heroCaption}>Manage Your</AppText>
                  <AppText style={styles.heroTitle}>Applicants</AppText>
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

            {/* ── Search bar ── */}
            <View style={styles.searchWrap}>
              <View style={styles.searchBox}>
                <Search size={scale(16)} color={colors.textMuted} />
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

            {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Users2 size={scale(36)} color={colors.primary} />
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
  root: { flex: 1, backgroundColor: '#FDF6EF' },

  /* Hero */
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(20),
    paddingBottom: vs(24),
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: vs(16),
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
    marginBottom: vs(18),
  },
  heroCaption: { color: 'rgba(255,255,255,0.75)', fontSize: font(13), marginBottom: vs(2) },
  heroTitle: {
    color: colors.textOnPrimary, fontSize: font(26), fontWeight: '800',
  },
  heroIconWrap: {
    width: scale(52), height: scale(52), borderRadius: scale(26),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    paddingVertical: vs(12),
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
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: vs(12),
  },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
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
  },
  emptyTitle: { marginTop: vs(4) },
  emptySub: { textAlign: 'center' },
});
