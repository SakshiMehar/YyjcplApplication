import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  IndianRupee,
  MapPin,
  SlidersHorizontal,
  Users2,
  X,
} from 'lucide-react-native';
import { AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { CandidateStackParamList } from '../../../navigation/types';
import {
  colors,
  font,
  MAX_FONT_MULTIPLIER,
  radius,
  scale,
  sizes,
  spacing,
  vs,
} from '../../../theme';
import {
  JobSeekerJob,
  JobSeekerJobsParams,
  useGetJobSeekerJobsQuery,
} from '../api/candidateApi';
import JobFiltersPanel, {
  EMPTY_JOB_FILTERS,
  JobFilterValues,
} from './JobFiltersPanel';

type Nav = NativeStackNavigationProp<CandidateStackParamList>;

const postedDate = (date?: string) => {
  if (!date) return undefined;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? undefined
    : `Posted ${parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
};

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.metaChip}>
      {icon}
      <AppText variant="caption" color="textSecondary" style={styles.metaChipText} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function JobCard({ job, onPress }: { job: JobSeekerJob; onPress: () => void }) {
  const initials = job.companyName
    .split(' ')
    .map(word => word[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const status = job.status ?? job.approvalStatus;
  const createdAt = postedDate(job.createdAt ?? job.postedAt);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${job.role} at ${job.companyName}`}>
      <View style={styles.cardTop}>
        <View style={styles.cardAvatar}>
          <AppText style={styles.cardAvatarText}>{initials || '?'}</AppText>
        </View>
        <View style={styles.cardTitles}>
          <AppText variant="bodyBold" numberOfLines={1}>{job.role}</AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>{job.companyName}</AppText>
        </View>
        {status ? (
          <View style={styles.statusBadge}>
            <AppText variant="caption" style={styles.statusText}>{status}</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.metaRow}>
        <MetaChip icon={<MapPin size={scale(11)} color={colors.primary} />} label={job.location} />
        {job.salary ? <MetaChip icon={<IndianRupee size={scale(11)} color={colors.primary} />} label={job.salary} /> : null}
        {job.experience ? <MetaChip icon={<Clock3 size={scale(11)} color={colors.primary} />} label={job.experience} /> : null}
        {typeof job.candidateVacancies === 'number' ? (
          <MetaChip
            icon={<Users2 size={scale(11)} color={colors.primary} />}
            label={`${job.candidateVacancies} opening${job.candidateVacancies === 1 ? '' : 's'}`}
          />
        ) : null}
      </View>

      <View style={styles.detailsRow}>
        <AppText variant="caption" color="textMuted">Job #{job.id}</AppText>
        {createdAt ? (
          <View style={styles.detailItem}>
            <CalendarDays size={scale(12)} color={colors.textMuted} />
            <AppText variant="caption" color="textMuted">{createdAt}</AppText>
          </View>
        ) : null}
        {job.recruiterId ? <AppText variant="caption" color="textMuted">Recruiter #{job.recruiterId}</AppText> : null}
      </View>

      <AppText variant="caption" color="primary" style={styles.tapHint}>Tap to view &amp; apply →</AppText>
    </Pressable>
  );
}

function ListEmpty({ isError }: { isError: boolean }) {
  return (
    <View style={styles.empty}>
      <BriefcaseBusiness size={scale(52)} color={colors.border} />
      <AppText variant="bodyBold" style={styles.emptyTitle}>
        {isError ? 'Could not load jobs' : 'No matching jobs'}
      </AppText>
      <AppText variant="caption" color="textMuted" style={styles.emptySub}>
        {isError ? 'Check your connection and pull down to retry.' : 'Try changing the department, location, or range filters.'}
      </AppText>
    </View>
  );
}

function JobSeparator() {
  return <View style={styles.separator} />;
}

export default function JobSearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [draftFilters, setDraftFilters] = useState<JobFilterValues>({ ...EMPTY_JOB_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState<JobSeekerJobsParams>({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasFilters = Boolean(
    appliedFilters.keyword ||
    appliedFilters.location ||
    appliedFilters.jobTypes ||
    appliedFilters.experienceLevel ||
    appliedFilters.workModes ||
    appliedFilters.industry ||
    typeof appliedFilters.postedWithinDays === 'number' ||
    appliedFilters.companyTypes ||
    typeof appliedFilters.minExperience === 'number' ||
    typeof appliedFilters.maxExperience === 'number' ||
    typeof appliedFilters.minSalary === 'number' ||
    typeof appliedFilters.maxSalary === 'number' ||
    typeof appliedFilters.minSalaryLpa === 'number' ||
    typeof appliedFilters.maxSalaryLpa === 'number',
  );
  const { data: jobs = [], isLoading, isError, isFetching, refetch } =
    useGetJobSeekerJobsQuery(appliedFilters);

  const clearFilters = () => {
    setDraftFilters({ ...EMPTY_JOB_FILTERS });
    setAppliedFilters({});
  };

  if (filtersOpen) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <JobFiltersPanel
          initialFilters={draftFilters}
          bottomInset={insets.bottom}
          onClose={() => setFiltersOpen(false)}
          onApply={(params, filters) => {
            setDraftFilters(filters);
            setAppliedFilters(params);
            setFiltersOpen(false);
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.pageHeader}>
        <View>
          <AppText variant="h2">Find Jobs</AppText>
          <AppText variant="caption" color="textSecondary" style={styles.countText}>
            {isLoading ? 'Loading jobs…' : `${jobs.length} job${jobs.length === 1 ? '' : 's'} available`}
          </AppText>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <BriefcaseBusiness size={sizes.iconSm} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Department, role, company or location"
            placeholderTextColor={colors.textMuted}
            value={draftFilters.keyword}
            onChangeText={value => {
              setDraftFilters(current => ({ ...current, keyword: value }));
              setAppliedFilters(current => ({ ...current, keyword: value.trim() || undefined }));
            }}
            returnKeyType="search"
            maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
          />
          {draftFilters.keyword ? (
            <Pressable
              onPress={() => {
                setDraftFilters(current => ({ ...current, keyword: '' }));
                setAppliedFilters(current => ({ ...current, keyword: undefined }));
              }}
              hitSlop={scale(10)}
              accessibilityLabel="Clear search">
              <X size={scale(16)} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterActions}>
          <Pressable
            onPress={() => setFiltersOpen(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.filterButton, pressed && styles.filterButtonPressed]}>
            <SlidersHorizontal size={scale(16)} color={colors.primary} />
            <AppText variant="caption" style={styles.filterButtonText}>Filters</AppText>
          </Pressable>
          {hasFilters ? (
            <Pressable onPress={clearFilters} hitSlop={scale(8)} accessibilityRole="button">
              <AppText variant="caption" color="primary" style={styles.clearText}>Clear all</AppText>
            </Pressable>
          ) : null}
        </View>

      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + vs(24) }]}
          ItemSeparatorComponent={JobSeparator}
          ListEmptyComponent={<ListEmpty isError={isError} />}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => { refetch(); }} colors={[colors.primary]} tintColor={colors.primary} />}
          renderItem={({ item }) => <JobCard job={item} onPress={() => navigation.navigate('JobDetails', { job: item })} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  pageHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(16),
    paddingBottom: vs(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  countText: { marginTop: vs(2) },
  searchWrap: { backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingVertical: vs(10) },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: vs(46),
  },
  searchInput: { flex: 1, fontSize: font(14), color: colors.text, padding: 0 },
  filterActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: vs(10) },
  filterButton: {
    flexDirection: 'row', alignItems: 'center', gap: scale(6), borderRadius: radius.pill,
    backgroundColor: colors.primaryLight, paddingHorizontal: spacing.md, paddingVertical: vs(7),
  },
  filterButtonPressed: { backgroundColor: colors.primarySoft },
  filterButtonText: { color: colors.primary, fontWeight: '700' },
  clearText: { fontWeight: '700' },
  loader: { marginTop: vs(60) },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: vs(16) },
  separator: { height: vs(12) },
  card: {
    backgroundColor: colors.background, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.05, shadowRadius: scale(6), elevation: 2,
  },
  cardPressed: { backgroundColor: colors.surface },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardAvatar: {
    width: scale(46), height: scale(46), borderRadius: radius.md, backgroundColor: colors.primaryLight,
    borderWidth: 1, borderColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardAvatarText: { color: colors.primary, fontWeight: '700', fontSize: font(14) },
  cardTitles: { flex: 1, gap: vs(2) },
  statusBadge: { backgroundColor: '#DCFCE7', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: vs(3), flexShrink: 0 },
  statusText: { color: colors.success, fontWeight: '700', fontSize: font(11) },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: vs(12) },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: scale(4), backgroundColor: colors.surface,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: vs(3),
  },
  metaChipText: { maxWidth: scale(110) },
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm, marginTop: vs(12) },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  tapHint: { marginTop: vs(10), textAlign: 'right' },
  empty: { alignItems: 'center', paddingTop: vs(64), gap: vs(8) },
  emptyTitle: { marginTop: vs(8) },
  emptySub: { textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: vs(18) },
});
