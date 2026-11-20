import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bookmark,
  BriefcaseBusiness,
  Clock3,
  Compass,
  FileText,
  IndianRupee,
  MapPin,
  Search,
  Star,
  UserRound,
  BadgeCheck,
  Bell,
} from 'lucide-react-native';
import { AppText, UserAvatar } from '../../../components/common';
import { CandidateStackParamList, CandidateTabParamList } from '../../../navigation/types';
import { useAppSelector } from '../../../store/hooks';
import { colors, font, MAX_FONT_MULTIPLIER, radius, scale, spacing, vs } from '../../../theme';
import {
  useApplyToJobMutation,
  JobSeekerJob,
  useGetRecommendedJobsQuery,
  useGetJobSeekerProfileQuery,
  useLazySearchJobSeekerJobsQuery,
  useSaveJobMutation,
} from '../api/candidateApi';
import { getProfilePictureHeaders, resolveBackendUrl } from '../utils/resume';
import { useGetNotificationsQuery } from '../../shared/api/sharedApi';
import { firstName } from '../../../utils/format';
import CandidateMoreMenu, { MoreMenuAction } from './components/CandidateMoreMenu';

type Nav = NativeStackNavigationProp<CandidateStackParamList>;

/* ─── Quick action ───────────────────────────────────────────────────────── */
type QuickAction = { key: string; icon: React.ReactNode; label: string; onPress: () => void };

function QuickActionItem({ icon, label, onPress }: QuickAction) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.qaItem, pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={styles.qaIcon}>{icon}</View>
      <AppText variant="caption" color="textSecondary" style={styles.qaLabel} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

/* ─── Job card ───────────────────────────────────────────────────────────── */
function HomeJobCard({
  job,
  onPress,
  onApply,
  onSave,
  isApplying,
  isApplied,
  isSaving,
  saved,
}: {
  job: JobSeekerJob;
  onPress: () => void;
  onApply: () => void;
  onSave: () => void;
  isApplying: boolean;
  isApplied: boolean;
  isSaving: boolean;
  saved: boolean;
}) {
  const initials = (job.companyName ?? '')
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Generate deterministic match % from job id for UI
  const matchPct = 70 + (Number(job.id) % 30);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.jobCard, pressed && styles.jobCardPressed]}
      accessibilityRole="button">

      {/* Top row */}
      <View style={styles.jobTop}>
        {/* Avatar */}
        <View style={styles.jobAvatar}>
          <AppText style={styles.jobAvatarText}>{initials || '?'}</AppText>
        </View>

        {/* Title + company */}
        <View style={styles.jobTitleWrap}>
          <AppText variant="bodyBold" numberOfLines={1}>{job.role}</AppText>
          <View style={styles.jobCompanyRow}>
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {job.companyName}
            </AppText>
            {job.approvalStatus === 'APPROVED' && (
              <BadgeCheck size={scale(13)} color={colors.primary} />
            )}
          </View>
        </View>

        {/* Match badge */}
        <View style={styles.matchBadge}>
          <BadgeCheck size={scale(12)} color={colors.success} />
          <AppText variant="caption" style={styles.matchText}>{matchPct}% Match</AppText>
        </View>
      </View>

      {/* Rating row */}
      <View style={styles.jobRatingRow}>
        <Star size={scale(12)} color="#F59E0B" fill="#F59E0B" />
        <AppText variant="caption" color="textSecondary" style={{ marginLeft: scale(3) }}>
          4.{(Number(job.id) % 10)} (1.2k reviews)
        </AppText>
      </View>

      {/* Meta chips */}
      <View style={styles.jobMeta}>
        {job.location ? (
          <View style={styles.metaItem}>
            <MapPin size={scale(11)} color={colors.textMuted} />
            <AppText variant="caption" color="textMuted">{job.location}</AppText>
          </View>
        ) : null}
        {job.salary ? (
          <View style={styles.metaItem}>
            <IndianRupee size={scale(11)} color={colors.textMuted} />
            <AppText variant="caption" color="textMuted">{job.salary}</AppText>
          </View>
        ) : null}
        {job.experience ? (
          <View style={styles.metaItem}>
            <BriefcaseBusiness size={scale(11)} color={colors.textMuted} />
            <AppText variant="caption" color="textMuted">{job.experience}</AppText>
          </View>
        ) : null}
      </View>

      {/* Skills */}
      {job.role ? (
        <View style={styles.skillRow}>
          {job.role.split(' ').slice(0, 3).map((s, i) => (
            <View key={i} style={styles.skillChip}>
              <AppText variant="caption" style={styles.skillChipText}>{s}</AppText>
            </View>
          ))}
        </View>
      ) : null}

      {/* Footer: posted + applicants + bookmark + apply */}
      <View style={styles.jobFooter}>
        <View style={styles.jobFooterLeft}>
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
              <UserRound size={scale(11)} color={colors.textMuted} />
              <AppText variant="caption" color="textMuted">{job.candidateVacancies} Openings</AppText>
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
          style={[styles.applyBtn, isApplying && styles.applyBtnDisabled, isApplied && styles.applyBtnApplied]}
          accessibilityLabel={`Apply to ${job.role}`}>
          <AppText variant="caption" style={styles.applyBtnText}>
            {isApplying ? 'Applying…' : isApplied ? 'Applied' : 'Apply Now →'}
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function CandidateHomeScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAppSelector(s => s.auth.user);
  const token = useAppSelector(s => s.auth.token);
  const insets = useSafeAreaInsets();
  const [isMoreMenuVisible, setMoreMenuVisible] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => new Set());
  const [searchText, setSearchText] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');

  const jobsQuery = useGetRecommendedJobsQuery();
  const [searchJobs, searchQuery] = useLazySearchJobSeekerJobsQuery();
  const { data: profile } = useGetJobSeekerProfileQuery();
  const [applyToJob] = useApplyToJobMutation();
  const [saveJob] = useSaveJobMutation();
  const { data: notifications } = useGetNotificationsQuery({ page: 1 });
  const hasUnread = !!notifications?.items?.some(n => n.read !== true);

  const openTab = (screen: keyof CandidateTabParamList) =>
    navigation.navigate('CandidateTabs', { screen });

  const first = firstName(user?.name);
  const profilePictureUrl = profile?.profilePictureUrl
    ? resolveBackendUrl(profile.profilePictureUrl)
    : undefined;
  const profilePictureHeaders = getProfilePictureHeaders(profile?.profilePictureUrl, token);
  const avatarUrl = profilePictureUrl ?? user?.avatarUrl;

  const jobs = jobsQuery.data ?? [];
  const displayedJobs = submittedKeyword ? (searchQuery.data ?? []) : jobs;

  const handleJobSearch = async () => {
    const keyword = searchText.trim();
    if (!keyword) {
      setSubmittedKeyword('');
      return;
    }

    setSubmittedKeyword(keyword);
    try {
      await searchJobs({ keyword }).unwrap();
    } catch (error) {
      const apiError = error as { data?: { message?: string } };
      Alert.alert('Could not search jobs', apiError.data?.message ?? 'Please try again.');
    }
  };

  const handleApply = async (job: JobSeekerJob) => {
    if (appliedJobIds.has(job.id)) return;
    setApplyingId(job.id);
    try {
      await applyToJob({ jobId: job.id }).unwrap();
      setAppliedJobIds(current => new Set(current).add(job.id));
      Alert.alert('Applied! 🎉', `Successfully applied for ${job.role} at ${job.companyName}.`);
    } catch (e) {
      const err = e as { status?: number; data?: { message?: string } };
      if (err?.status === 409) {
        setAppliedJobIds(current => new Set(current).add(job.id));
        Alert.alert('Already Applied', 'You have already applied for this job.');
      } else {
        Alert.alert('Could not apply', err?.data?.message ?? 'Please try again.');
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

  const handleMoreMenu = (action: MoreMenuAction) => {
    switch (action) {
      case 'profile': case 'performance': openTab('CandidateProfile'); break;
      case 'search': case 'recommended': openTab('JobSearch'); break;
      case 'applied': openTab('MyApplications'); break;
      case 'settings': navigation.navigate('Settings'); break;
      case 'writeToUs': navigation.navigate('RaiseComplaint'); break;
      case 'about':
        Alert.alert('About YYJCPL', 'YYJCPL connects job seekers with opportunities that fit their skills and goals.');
        break;
    }
  };

  const quickActions: QuickAction[] = [
    { key: 'saved',   icon: <Bookmark size={scale(22)} color={colors.primary} />,  label: 'Saved Jobs',      onPress: () => navigation.navigate('SavedJobs') },
    { key: 'apps',    icon: <FileText  size={scale(22)} color={colors.primary} />,  label: 'Applications',    onPress: () => openTab('MyApplications') },
    { key: 'profile', icon: <UserRound size={scale(22)} color={colors.primary} />,  label: 'Profile',         onPress: () => openTab('CandidateProfile') },
    { key: 'career',  icon: <Compass   size={scale(22)} color={colors.primary} />,  label: 'Career Services', onPress: () => Alert.alert('Coming Soon') },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + vs(24) }]}
        keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={styles.header}>
          {/* Avatar + greeting */}
          <Pressable
            onPress={() => openTab('CandidateProfile')}
            style={styles.headerLeft}
            accessibilityLabel="My profile">
            <View style={styles.avatarWrap}>
              <UserAvatar
                name={user?.name}
                uri={avatarUrl}
                headers={profilePictureHeaders}
                size={scale(46)}
              />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.greetingWrap}>
              <View style={styles.greetingRow}>
                <AppText variant="h3" style={styles.greetingHello}>
                  Hello, {first || 'there'} 👋
                </AppText>
              </View>
              <AppText variant="caption" color="textSecondary">
                Your dream job is closer than you think!
              </AppText>
            </View>
          </Pressable>

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
              placeholder="Search jobs, skills, location..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
              selectionColor={colors.primary}
              returnKeyType="search"
              onSubmitEditing={handleJobSearch}
            />
          </View>
          <Pressable
            onPress={() => openTab('JobSearch')}
            style={styles.filterBtn}
            accessibilityLabel="Filter jobs">
            <View style={styles.filterIcon}>
              {/* Filter icon using lines */}
              {[3, 6, 3].map((w, i) => (
                <View key={i} style={[styles.filterLine, { width: scale(w + 6 + i * 2) }]} />
              ))}
            </View>
          </Pressable>
        </View>

        {/* ── Hero banner ── */}
        <Pressable
          onPress={() => openTab('JobSearch')}
          style={styles.heroBanner}
          accessibilityLabel="Find your dream job">
          {/* Background gradient-style */}
          <View style={styles.heroBannerBg} />

          {/* Left content */}
          <View style={styles.heroContent}>
            <View style={styles.heroTagRow}>
              <AppText style={styles.heroTagEmoji}>🔥</AppText>
              <AppText variant="caption" style={styles.heroTagText}>Find Your</AppText>
            </View>
            <AppText style={styles.heroTitle}>Dream Job{'\n'}with YYJCPL</AppText>
            <AppText variant="caption" style={styles.heroSub}>
              Grow Your Career • Build Your Future
            </AppText>
            <View style={styles.heroBtn}>
              <AppText variant="caption" style={styles.heroBtnText}>Explore Jobs →</AppText>
            </View>
          </View>

          {/* Illustration — right side clipped */}
          <Image
            source={require('../../../assets/illustrations/dashboard.png')}
            style={styles.heroIllustration}
            resizeMode="contain"
          />
        </Pressable>

        {/* ── Quick actions ── */}
        <View style={styles.qaRow}>
          {quickActions.map(({ key, ...qa }) => (
            <QuickActionItem key={key} {...qa} />
          ))}
        </View>

        {/* ── Recommended Jobs ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <AppText variant="h3">
              {submittedKeyword ? `Search results for “${submittedKeyword}”` : 'Recommended Jobs'}
            </AppText>
          </View>
          <Pressable onPress={() => openTab('JobSearch')} accessibilityLabel="See all jobs">
            <AppText variant="caption" style={styles.seeAll}>See all →</AppText>
          </Pressable>
        </View>

        {jobsQuery.isLoading || searchQuery.isFetching ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : displayedJobs.length === 0 ? (
          <View style={styles.emptyWrap}>
            <AppText variant="body" color="textMuted" style={styles.emptyText}>
              {submittedKeyword
                ? searchQuery.isError
                  ? 'Could not search jobs. Please try again.'
                  : 'No jobs found for this search.'
                : jobsQuery.isError
                  ? 'Could not load jobs. Pull to retry.'
                  : 'Complete your profile to get job recommendations.'}
            </AppText>
          </View>
        ) : (
          displayedJobs.slice(0, 5).map(job => (
            <HomeJobCard
              key={job.id}
              job={job}
              onPress={() => navigation.navigate('JobDetails', { job })}
              onApply={() => handleApply(job)}
              onSave={() => handleSave(job)}
              isApplying={applyingId === job.id}
              isApplied={appliedJobIds.has(job.id)}
              isSaving={savingId === job.id}
              saved={savedJobIds.has(job.id) || Boolean(job.isSaved)}
            />
          ))
        )}
      </ScrollView>

      <CandidateMoreMenu
        visible={isMoreMenuVisible}
        name={user?.name}
        avatarUrl={avatarUrl}
        avatarHeaders={profilePictureHeaders}
        onClose={() => setMoreMenuVisible(false)}
        onSelect={handleMoreMenu}
      />
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingHorizontal: spacing.lg },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: vs(14),
    paddingBottom: vs(14),
    gap: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  greetingWrap: { flex: 1 },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  greetingHello: { color: colors.text },
  bellBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: scale(7),
    right: scale(7),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.background,
  },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: vs(16),
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: vs(46),
  },
  searchInput: {
    flex: 1,
    fontSize: font(14),
    color: colors.text,
    padding: 0,
  },
  filterBtn: {
    width: vs(46),
    height: vs(46),
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: { gap: vs(3) },
  filterLine: {
    height: vs(2),
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  /* Hero banner */
  heroBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    height: vs(160),
    marginBottom: vs(20),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  heroBannerBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primary,
  },
  heroContent: {
    flex: 1,
    paddingLeft: spacing.lg,
    paddingVertical: vs(18),
    zIndex: 1,
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(3),
    borderRadius: radius.pill,
    marginBottom: vs(8),
  },
  heroTagEmoji: { fontSize: font(12) },
  heroTagText: { color: colors.textOnPrimary, fontWeight: '600' },
  heroTitle: {
    fontSize: font(22),
    fontWeight: '800',
    color: colors.textOnPrimary,
    lineHeight: vs(28),
    marginBottom: vs(4),
  },
  heroSub: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: vs(10),
  },
  heroBtn: {
    backgroundColor: colors.textOnPrimary,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: vs(6),
    borderRadius: radius.pill,
  },
  heroBtnText: {
    color: colors.primary,
    fontWeight: '700',
  },
  heroIllustration: {
    width: scale(110),
    height: vs(150),
    opacity: 0.9,
  },

  /* Quick actions */
  qaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(24),
  },
  qaItem: {
    alignItems: 'center',
    gap: vs(6),
    flex: 1,
  },
  qaIcon: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: {
    textAlign: 'center',
    fontSize: font(11),
  },

  /* Section header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(14),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionAccent: {
    width: scale(4),
    height: vs(20),
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  seeAll: {
    color: colors.primary,
    fontWeight: '600',
  },

  /* Job card */
  jobCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: vs(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.05,
    shadowRadius: scale(4),
    elevation: 2,
  },
  jobCardPressed: { opacity: 0.88 },
  jobTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: vs(4),
  },
  jobAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  jobAvatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: font(13),
  },
  jobTitleWrap: { flex: 1 },
  jobCompanyRow: { flexDirection: 'row', alignItems: 'center', gap: scale(3) },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    backgroundColor: '#DCFCE7',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(3),
    flexShrink: 0,
  },
  matchText: { color: colors.success, fontWeight: '700', fontSize: font(11) },
  jobRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: vs(8),
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: scale(3) },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: vs(10),
  },
  skillChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(3),
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  skillChipText: { color: colors.primary, fontWeight: '600', fontSize: font(11) },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  jobFooterLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bookmarkBtn: {
    padding: spacing.xs,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(7),
  },
  applyBtnDisabled: { opacity: 0.6 },
  applyBtnApplied: { backgroundColor: '#7C3AED', opacity: 1 },
  applyBtnText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: font(12),
  },

  /* Misc */
  loader: { marginVertical: vs(32) },
  emptyWrap: { alignItems: 'center', paddingVertical: vs(32) },
  emptyText: { textAlign: 'center' },
});
