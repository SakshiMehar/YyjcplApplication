import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Bookmark,
  Clock3,
  Code2,
  GraduationCap,
  IndianRupee,
  MapPin,
  Monitor,
  Search,
  SlidersHorizontal,
  Star,
  Users2,
  Wifi,
  Zap,
} from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { CandidateStackParamList } from '../../../navigation/types';
import {
  colors,
  font,
  MAX_FONT_MULTIPLIER,
  radius,
  scale,
  spacing,
  vs,
} from '../../../theme';
import {
  JobSeekerJob,
  useApplyToJobMutation,
  useGetJobSeekerJobsQuery,
  useSaveJobMutation,
} from '../api/candidateApi';
import { useGetNotificationsQuery } from '../../shared/api/sharedApi';

type Nav = NativeStackNavigationProp<CandidateStackParamList>;

/* ─── Filter chip ────────────────────────────────────────────────────────── */
const FILTER_CHIPS = [
  { label: 'Remote',      icon: <Wifi      size={scale(12)} color={colors.primary} /> },
  { label: 'Full Time',   icon: <Monitor   size={scale(12)} color={colors.textSecondary} /> },
  { label: 'Fresher',     icon: <GraduationCap size={scale(12)} color={colors.textSecondary} /> },
  { label: 'React Native',icon: <Code2     size={scale(12)} color={colors.textSecondary} /> },
];

function FilterChip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
      accessibilityRole="button">
      {icon}
      <AppText
        variant="caption"
        style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

/* ─── Stats card ─────────────────────────────────────────────────────────── */
function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <AppText variant="bodyBold" style={styles.statValue}>{value}</AppText>
      <AppText variant="caption" color="textMuted" style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

/* ─── Featured job card ──────────────────────────────────────────────────── */
function FeaturedJobCard({ job, onApply, isApplying, isApplied, onPress }: {
  job: JobSeekerJob;
  onApply: () => void;
  isApplying: boolean;
  isApplied: boolean;
  onPress: () => void;
}) {
  const initials = (job.companyName ?? '')
    .split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();

  return (
    <Pressable onPress={onPress} style={styles.featuredCard} accessibilityRole="button">
      {/* Labels */}
      <View style={styles.featuredTopRow}>
        <View style={styles.featuredJobBadge}>
          <AppText style={styles.featuredBadgeEmoji}>🔥</AppText>
          <AppText variant="caption" style={styles.featuredBadgeText}>Featured Job</AppText>
        </View>
        <View style={styles.urgentBadge}>
          <AppText style={styles.urgentEmoji}>⚡</AppText>
          <AppText variant="caption" style={styles.urgentText}>Urgent</AppText>
        </View>
      </View>

      {/* Company + role */}
      <View style={styles.featuredMain}>
        <View style={styles.featuredAvatar}>
          <AppText style={styles.featuredAvatarText}>{initials || '?'}</AppText>
        </View>
        <View style={styles.featuredTitles}>
          <AppText variant="h3" style={styles.featuredRole} numberOfLines={1}>{job.role}</AppText>
          <View style={styles.featuredCompanyRow}>
            <AppText variant="caption" style={styles.featuredCompany}>{job.companyName}</AppText>
            <Star size={scale(11)} color="#F59E0B" fill="#F59E0B" />
            <AppText variant="caption" style={styles.featuredRating}>4.6</AppText>
          </View>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.featuredMeta}>
        <View style={styles.featuredMetaItem}>
          <MapPin size={scale(11)} color="rgba(255,255,255,0.8)" />
          <AppText variant="caption" style={styles.featuredMetaText}>{job.location}</AppText>
        </View>
        {job.salary ? (
          <View style={styles.featuredMetaItem}>
            <IndianRupee size={scale(11)} color="rgba(255,255,255,0.8)" />
            <AppText variant="caption" style={styles.featuredMetaText}>{job.salary}</AppText>
          </View>
        ) : null}
        <View style={styles.featuredMetaItem}>
          <BriefcaseBusiness size={scale(11)} color="rgba(255,255,255,0.8)" />
          <AppText variant="caption" style={styles.featuredMetaText}>Full Time</AppText>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.featuredFooter}>
        <View style={styles.easyApplyBtn}>
          <Zap size={scale(13)} color={colors.primary} fill={colors.primary} />
          <AppText variant="caption" style={styles.easyApplyText}>Easy Apply</AppText>
        </View>
        <Pressable
          onPress={event => {
            event.stopPropagation();
            onApply();
          }}
          disabled={isApplying || isApplied}
          style={[
            styles.applyNowBtn,
            isApplying && styles.applyNowBtnDisabled,
            isApplied && styles.applyNowBtnApplied,
          ]}>
          <AppText variant="caption" style={styles.applyNowText}>
            {isApplying ? 'Applying…' : isApplied ? 'Applied' : 'Apply Now →'}
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

/* ─── Regular job card ───────────────────────────────────────────────────── */
function JobCard({ job, onPress, onApply, isApplying, isApplied, onSave, isSaving, saved }: {
  job: JobSeekerJob;
  onPress: () => void;
  onApply: () => void;
  isApplying: boolean;
  isApplied: boolean;
  onSave: () => void;
  isSaving: boolean;
  saved: boolean;
}) {
  const initials = (job.companyName ?? '')
    .split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
  const matchPct = 70 + (Number(job.id) % 30);
  const skillChips = job.role.split(' ').slice(0, 3);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.jobCard, pressed && styles.jobCardPressed]}
      accessibilityRole="button">

      {/* Top */}
      <View style={styles.jobTop}>
        <View style={styles.jobAvatar}>
          <AppText style={styles.jobAvatarText}>{initials || '?'}</AppText>
        </View>
        <View style={styles.jobTitles}>
          <AppText variant="bodyBold" numberOfLines={1}>{job.role}</AppText>
          <View style={styles.jobCompanyRow}>
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>{job.companyName}</AppText>
            {job.approvalStatus === 'APPROVED' && (
              <BadgeCheck size={scale(12)} color={colors.primary} />
            )}
          </View>
        </View>
        <View style={styles.matchBadge}>
          <BadgeCheck size={scale(11)} color={colors.success} />
          <AppText variant="caption" style={styles.matchText}>{matchPct}% Match</AppText>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <Star size={scale(11)} color="#F59E0B" fill="#F59E0B" />
        <AppText variant="caption" color="textSecondary" style={{ marginLeft: scale(3) }}>
          4.{(Number(job.id) % 9) + 1} ({100 + (Number(job.id) % 900)} reviews)
        </AppText>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={scale(11)} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted">{job.location}</AppText>
        </View>
        {job.salary ? (
          <AppText variant="caption" color="textMuted">·</AppText>
        ) : null}
        {job.salary ? (
          <View style={styles.metaItem}>
            <IndianRupee size={scale(11)} color={colors.textMuted} />
            <AppText variant="caption" color="textMuted">{job.salary}</AppText>
          </View>
        ) : null}
        <AppText variant="caption" color="textMuted">·</AppText>
        <AppText variant="caption" color="textMuted">Full Time</AppText>
      </View>

      {/* Skills */}
      <View style={styles.skillRow}>
        {skillChips.map((s, i) => (
          <View key={i} style={styles.skillChip}>
            <AppText variant="caption" style={styles.skillChipText}>{s}</AppText>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.jobFooter}>
        <View style={styles.jobFooterMeta}>
          {job.postedAt ? (
            <View style={styles.metaItem}>
              <Clock3 size={scale(11)} color={colors.textMuted} />
              <AppText variant="caption" color="textMuted">
                {new Date(job.postedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </AppText>
            </View>
          ) : null}
          {job.candidateVacancies ? (
            <View style={styles.metaItem}>
              <Users2 size={scale(11)} color={colors.textMuted} />
              <AppText variant="caption" color="textMuted">{job.candidateVacancies} Applicants</AppText>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={event => {
            event.stopPropagation();
            onSave();
          }}
          disabled={isSaving || saved}
          hitSlop={scale(8)}
          style={styles.bookmarkBtn}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Job saved' : 'Save job'}
          accessibilityState={{ disabled: isSaving || saved }}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Bookmark
              size={scale(16)}
              color={saved ? colors.primary : colors.textMuted}
              fill={saved ? colors.primary : 'transparent'}
            />
          )}
        </Pressable>
        <Pressable
          onPress={event => {
            event.stopPropagation();
            onApply();
          }}
          disabled={isApplying || isApplied}
          style={[
            styles.applyBtn,
            isApplying && styles.applyBtnDisabled,
            isApplied && styles.applyBtnApplied,
          ]}>
          <AppText variant="caption" style={styles.applyBtnText}>
            {isApplying ? 'Applying…' : isApplied ? 'Applied' : 'Apply Now →'}
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function JobSearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => new Set());

  const { data: jobs = [], isLoading, isError, isFetching, refetch } = useGetJobSeekerJobsQuery();
  const [applyToJob] = useApplyToJobMutation();
  const [saveJob] = useSaveJobMutation();
  const { data: notifications } = useGetNotificationsQuery({ page: 1 });
  const hasUnread = !!notifications?.items?.some(n => !n.read);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Client-side filter
  const filtered = useMemo(() => {
    let list = jobs;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(j =>
        j.role.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q),
      );
    }
    if (activeFilter) {
      list = list.filter(j =>
        j.location.toLowerCase().includes(activeFilter.toLowerCase()) ||
        j.role.toLowerCase().includes(activeFilter.toLowerCase()),
      );
    }
    return list;
  }, [jobs, searchText, activeFilter]);

  const featuredJob = filtered[0];
  const listJobs = filtered.slice(1);

  const handleApply = async (job: JobSeekerJob) => {
    if (appliedJobIds.has(job.id)) return;
    setApplyingId(job.id);
    try {
      await applyToJob({ jobId: job.id }).unwrap();
      setAppliedJobIds(current => new Set(current).add(job.id));
    } catch (e) {
      const err = e as { status?: number; data?: { message?: string } };
      if (err?.status === 409) {
        // The backend confirms this job has already been applied for.
        setAppliedJobIds(current => new Set(current).add(job.id));
      } else {
        Alert.alert('Unable to apply', err?.data?.message ?? 'Please try again.');
      }
    } finally {
      setApplyingId(null);
    }
  };

  const handleSave = async (job: JobSeekerJob) => {
    if (savedJobIds.has(job.id) || job.isSaved) return;
    setSavingId(job.id);
    try {
      await saveJob({ jobId: job.id }).unwrap();
      setSavedJobIds(current => new Set(current).add(job.id));
      Alert.alert('Job saved', `${job.role} at ${job.companyName} was added to your saved jobs.`);
    } catch (e) {
      const err = e as { status?: number; data?: { message?: string } };
      if (err?.status === 409) {
        setSavedJobIds(current => new Set(current).add(job.id));
        Alert.alert('Already saved', 'This job is already in your saved jobs.');
      } else {
        Alert.alert('Could not save job', err?.data?.message ?? 'Please try again.');
      }
    } finally {
      setSavingId(null);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <FlatList
        data={listJobs}
        keyExtractor={item => item.id}
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
            {/* ── Page header ── */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <AppText variant="caption" color="textSecondary" style={styles.greetingCaption}>
                  {greeting} 👋
                </AppText>
                <View style={styles.titleRow}>
                  <AppText style={styles.titleFind}>Find Your </AppText>
                  <AppText style={styles.titleDream}>Dream Job</AppText>
                </View>
                <AppText variant="caption" color="textSecondary">
                  {isLoading ? 'Loading…' : `${jobs.length} Jobs matching your profile`}
                </AppText>
              </View>
              {/* Bell */}
              <Pressable
                onPress={() => navigation.navigate('Notifications')}
                style={styles.bellBtn}
                accessibilityLabel="Notifications">
                <Bell size={scale(20)} color={colors.text} />
                {hasUnread ? <View style={styles.bellDot} /> : null}
              </Pressable>
            </View>

            {/* ── Search bar ── */}
            <View style={styles.searchWrap}>
              <View style={styles.searchBox}>
                <Search size={scale(18)} color={colors.textMuted} />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search job title, company..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                  returnKeyType="search"
                />
              </View>
              <Pressable style={styles.filterIconBtn} accessibilityLabel="Filter">
                <SlidersHorizontal size={scale(18)} color={colors.primary} />
                <AppText variant="caption" style={styles.filterIconText}>Filter</AppText>
              </Pressable>
            </View>

            {/* ── Filter chips ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsRow}>
              {FILTER_CHIPS.map(fc => (
                <FilterChip
                  key={fc.label}
                  label={fc.label}
                  icon={fc.icon}
                  active={activeFilter === fc.label}
                  onPress={() => setActiveFilter(prev => prev === fc.label ? null : fc.label)}
                />
              ))}
            </ScrollView>

            {/* ── Stats row ── */}
            <View style={styles.statsRow}>
              <StatCard value={jobs.length || 32} label="Recommended" icon={<Star size={scale(18)} color={colors.primary} />} />
              <StatCard value={15} label="Saved" icon={<Bookmark size={scale(18)} color={colors.primary} />} />
              <StatCard value={8} label="Applied" icon={<BriefcaseBusiness size={scale(18)} color={colors.primary} />} />
              <StatCard value={2} label="Interviews" icon={<Users2 size={scale(18)} color={colors.primary} />} />
            </View>

            {/* ── Featured job ── */}
            {featuredJob ? (
              <FeaturedJobCard
                job={featuredJob}
                onPress={() => navigation.navigate('JobDetails', { job: featuredJob })}
                onApply={() => handleApply(featuredJob)}
                isApplying={applyingId === featuredJob.id}
                isApplied={appliedJobIds.has(featuredJob.id)}
              />
            ) : null}

            {/* ── Section header ── */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccent} />
                <AppText variant="h3">Recommended Jobs</AppText>
              </View>
              <AppText variant="caption" style={styles.seeAll}>See all →</AppText>
            </View>

            {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <BriefcaseBusiness size={scale(48)} color={colors.border} />
              <AppText variant="bodyBold" style={{ marginTop: vs(8) }}>
                {isError ? 'Could not load jobs' : 'No jobs found'}
              </AppText>
              <AppText variant="caption" color="textMuted" style={styles.emptySub}>
                {isError ? 'Pull to retry.' : 'Try a different search.'}
              </AppText>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <JobCard
              job={item}
              onPress={() => navigation.navigate('JobDetails', { job: item })}
              onApply={() => handleApply(item)}
              isApplying={applyingId === item.id}
              isApplied={appliedJobIds.has(item.id)}
              onSave={() => handleSave(item)}
              isSaving={savingId === item.id}
              saved={savedJobIds.has(item.id) || Boolean(item.isSaved)}
            />
          </View>
        )}
      />
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: vs(16),
    paddingBottom: vs(12),
    backgroundColor: colors.background,
  },
  headerLeft: { flex: 1 },
  greetingCaption: { marginBottom: vs(2) },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(4) },
  titleFind: { fontSize: font(22), fontWeight: '800', color: colors.text },
  titleDream: { fontSize: font(22), fontWeight: '800', color: colors.primary },
  bellBtn: {
    width: scale(40), height: scale(40), borderRadius: scale(20),
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    marginLeft: spacing.md,
  },
  bellDot: {
    position: 'absolute', top: scale(7), right: scale(7),
    width: scale(8), height: scale(8), borderRadius: scale(4),
    backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.background,
  },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(10),
    backgroundColor: colors.background,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: vs(46),
  },
  searchInput: { flex: 1, fontSize: font(14), color: colors.text, padding: 0 },
  filterIconBtn: {
    flexDirection: 'row', alignItems: 'center', gap: scale(4),
    paddingHorizontal: spacing.md, height: vs(46),
    backgroundColor: colors.primaryLight, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.primarySoft,
  },
  filterIconText: { color: colors.primary, fontWeight: '700' },

  /* Filter chips */
  filterChipsRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(10),
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: scale(5),
    paddingHorizontal: spacing.md, paddingVertical: vs(7),
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  filterChipText: { color: colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: colors.primary },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(14),
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: vs(16),
  },
  statCard: {
    flex: 1, alignItems: 'center', gap: vs(3),
  },
  statIcon: {
    width: scale(36), height: scale(36), borderRadius: scale(18),
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: vs(2),
  },
  statValue: { fontSize: font(16) },
  statLabel: { fontSize: font(10), textAlign: 'center' },

  /* Featured */
  featuredCard: {
    marginHorizontal: spacing.lg,
    marginBottom: vs(20),
    borderRadius: 16,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  featuredJobBadge: {
    flexDirection: 'row', alignItems: 'center', gap: scale(4),
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm, paddingVertical: vs(4),
    borderRadius: radius.pill,
  },
  featuredBadgeEmoji: { fontSize: font(12) },
  featuredBadgeText: { color: colors.textOnPrimary, fontWeight: '700' },
  urgentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: scale(3),
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.sm, paddingVertical: vs(4),
    borderRadius: radius.pill,
  },
  urgentEmoji: { fontSize: font(12) },
  urgentText: { color: colors.textOnPrimary, fontWeight: '700' },
  featuredMain: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: vs(10),
  },
  featuredAvatar: {
    width: scale(48), height: scale(48), borderRadius: radius.md,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  featuredAvatarText: { color: colors.primary, fontWeight: '700', fontSize: font(14) },
  featuredTitles: { flex: 1 },
  featuredRole: { color: colors.textOnPrimary, marginBottom: vs(3) },
  featuredCompanyRow: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  featuredCompany: { color: 'rgba(255,255,255,0.85)' },
  featuredRating: { color: 'rgba(255,255,255,0.85)' },
  featuredMeta: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: vs(14),
  },
  featuredMetaItem: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  featuredMetaText: { color: 'rgba(255,255,255,0.85)' },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  easyApplyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: scale(5),
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md, paddingVertical: vs(8),
    borderRadius: radius.pill,
  },
  easyApplyText: { color: colors.primary, fontWeight: '700' },
  applyNowBtn: {
    flex: 1, backgroundColor: colors.primaryDark,
    paddingVertical: vs(8), borderRadius: radius.pill,
    alignItems: 'center',
  },
  applyNowBtnDisabled: { opacity: 0.6 },
  applyNowBtnApplied: { backgroundColor: '#7C3AED', opacity: 1 },
  applyNowText: { color: colors.textOnPrimary, fontWeight: '700' },

  /* Section header */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, marginBottom: vs(14),
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionAccent: {
    width: scale(4), height: vs(20), borderRadius: 2, backgroundColor: colors.primary,
  },
  seeAll: { color: colors.primary, fontWeight: '600' },

  /* Regular job card */
  listItem: { paddingHorizontal: spacing.lg },
  jobCard: {
    backgroundColor: colors.background, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  jobCardPressed: { opacity: 0.88 },
  jobTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: vs(4) },
  jobAvatar: {
    width: scale(46), height: scale(46), borderRadius: radius.md,
    backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  jobAvatarText: { color: colors.primary, fontWeight: '700', fontSize: font(13) },
  jobTitles: { flex: 1 },
  jobCompanyRow: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  matchBadge: {
    flexDirection: 'row', alignItems: 'center', gap: scale(3),
    backgroundColor: '#DCFCE7', borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: vs(3), flexShrink: 0,
  },
  matchText: { color: colors.success, fontWeight: '700', fontSize: font(11) },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(8) },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginBottom: vs(8) },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: scale(3) },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: vs(10) },
  skillChip: {
    backgroundColor: colors.primaryLight, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: vs(3),
    borderWidth: 1, borderColor: colors.primarySoft,
  },
  skillChipText: { color: colors.primary, fontWeight: '600', fontSize: font(11) },
  jobFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  jobFooterMeta: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  bookmarkBtn: { padding: spacing.xs },
  applyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: vs(7),
  },
  applyBtnDisabled: { opacity: 0.6 },
  applyBtnApplied: { backgroundColor: '#7C3AED', opacity: 1 },
  applyBtnText: { color: colors.textOnPrimary, fontWeight: '700', fontSize: font(12) },

  /* Misc */
  loader: { marginVertical: vs(32) },
  emptyWrap: { alignItems: 'center', paddingVertical: vs(40), paddingHorizontal: spacing.xl },
  emptySub: { textAlign: 'center', marginTop: vs(4) },
});
