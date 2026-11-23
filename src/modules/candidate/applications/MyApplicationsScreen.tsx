import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SkeletonList } from '../../../components/animated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Star,
} from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { CandidateStackParamList } from '../../../navigation/types';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { JobSeekerApplication, useGetMyApplicationsQuery } from '../api/candidateApi';

type Nav = NativeStackNavigationProp<CandidateStackParamList>;

/* ─── Status config ──────────────────────────────────────────────────────── */
type StatusInfo = {
  label: string;
  bg: string;
  text: string;
  icon: React.ReactNode;
  message: string;
  messageBg: string;
  messageIcon: React.ReactNode;
};

function getStatusInfo(status: string): StatusInfo {
  const s = (status ?? '').toUpperCase();
  if (s.includes('SHORTLIST')) return {
    label: 'Shortlisted', bg: '#DCFCE7', text: colors.success,
    icon: <CheckCircle size={scale(12)} color={colors.success} />,
    message: 'You have been shortlisted for this position!',
    messageBg: '#FFF9F0',
    messageIcon: <Star size={scale(13)} color={colors.primary} fill={colors.primary} />,
  };
  if (s.includes('VIEW')) return {
    label: 'Viewed', bg: '#F3F0FF', text: '#7C3AED',
    icon: <Eye size={scale(12)} color="#7C3AED" />,
    message: 'Your application was viewed by the recruiter.',
    messageBg: '#FFF9F0',
    messageIcon: <Eye size={scale(13)} color={colors.primary} />,
  };
  if (s.includes('INTERVIEW')) return {
    label: 'Interview', bg: '#FEF9C3', text: '#92400E',
    icon: <CalendarDays size={scale(12)} color="#92400E" />,
    message: 'You have been invited for an interview!',
    messageBg: '#FFF9F0',
    messageIcon: <CalendarDays size={scale(13)} color={colors.primary} />,
  };
  if (s.includes('REJECT')) return {
    label: 'Rejected', bg: '#FEE2E2', text: colors.danger,
    icon: <BriefcaseBusiness size={scale(12)} color={colors.danger} />,
    message: 'Your application was not selected this time.',
    messageBg: '#FFF5F5',
    messageIcon: <BriefcaseBusiness size={scale(13)} color={colors.danger} />,
  };
  if (s.includes('SELECT') || s.includes('PLACED')) return {
    label: 'Selected', bg: '#DCFCE7', text: colors.success,
    icon: <CheckCircle size={scale(12)} color={colors.success} />,
    message: 'Congratulations! You have been selected.',
    messageBg: '#F0FFF4',
    messageIcon: <CheckCircle size={scale(13)} color={colors.success} />,
  };
  // Default — Applied / In Progress
  return {
    label: 'In Progress', bg: '#FFF1E6', text: colors.primary,
    icon: <Clock size={scale(12)} color={colors.primary} />,
    message: 'Your application is under review by the recruiter.',
    messageBg: '#FFF9F0',
    messageIcon: <BriefcaseBusiness size={scale(13)} color={colors.primary} />,
  };
}

/* ─── Format date ────────────────────────────────────────────────────────── */
function fmtApplied(date?: string) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return `Applied ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

/* ─── Application card ───────────────────────────────────────────────────── */
function ApplicationCard({
  application,
  onPress,
}: {
  application: JobSeekerApplication;
  onPress: () => void;
}) {
  const job = application.job;
  const role = job?.role ?? job?.title ?? `Job #${application.jobId}`;
  const company = job?.companyName ?? '—';
  const location = job?.location;
  const appliedAt = fmtApplied(application.appliedAt);

  const initials = company
    .split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();

  const si = getStatusInfo(application.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button">

      {/* Top row */}
      <View style={styles.cardTop}>
        {/* Avatar */}
        <View style={styles.cardAvatar}>
          <BriefcaseBusiness size={scale(20)} color={colors.primary} />
        </View>

        {/* Title + company */}
        <View style={styles.cardTitles}>
          <AppText variant="bodyBold" numberOfLines={1}>{role}</AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>{company}</AppText>

          {/* Location + date */}
          <View style={styles.cardMeta}>
            {location ? (
              <View style={styles.metaItem}>
                <MapPin size={scale(11)} color={colors.textMuted} />
                <AppText variant="caption" color="textSecondary">{location}</AppText>
              </View>
            ) : null}
            {appliedAt ? (
              <View style={styles.metaItem}>
                <CalendarDays size={scale(11)} color={colors.textMuted} />
                <AppText variant="caption" color="textSecondary">{appliedAt}</AppText>
              </View>
            ) : null}
          </View>
        </View>

        {/* Status badge + arrow */}
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: si.bg }]}>
            {si.icon}
            <AppText variant="caption" style={[styles.statusText, { color: si.text }]}>
              {si.label}
            </AppText>
          </View>
          <View style={styles.arrowCircle}>
            <ArrowRight size={scale(14)} color={colors.primary} />
          </View>
        </View>
      </View>

      {/* Status message */}
      <View style={[styles.statusMsg, { backgroundColor: si.messageBg }]}>
        {si.messageIcon}
        <AppText variant="caption" color="textSecondary" style={styles.statusMsgText}>
          {si.message}
        </AppText>
      </View>
    </Pressable>
  );
}

/* ─── Stats card ─────────────────────────────────────────────────────────── */
function StatsRow({ applications }: { applications: JobSeekerApplication[] }) {
  const total = applications.length;
  const inProgress = applications.filter(a => {
    const s = (a.status ?? '').toUpperCase();
    return !s.includes('SHORTLIST') && !s.includes('VIEW') && !s.includes('REJECT') && !s.includes('SELECT');
  }).length;
  const shortlisted = applications.filter(a => (a.status ?? '').toUpperCase().includes('SHORTLIST')).length;
  const viewed = applications.filter(a => (a.status ?? '').toUpperCase().includes('VIEW')).length;

  return (
    <View style={styles.statsCard}>
      <StatItem value={total}       label="Total Applied" icon={<BriefcaseBusiness size={scale(20)} color={colors.primary} />} />
      <View style={styles.statDivider} />
      <StatItem value={inProgress}  label="In Progress"   icon={<Clock     size={scale(20)} color={colors.primary} />} />
      <View style={styles.statDivider} />
      <StatItem value={shortlisted} label="Shortlisted"   icon={<CheckCircle size={scale(20)} color={colors.success} />} />
      <View style={styles.statDivider} />
      <StatItem value={viewed}      label="Viewed"        icon={<Star      size={scale(20)} color="#F59E0B" fill="#F59E0B" />} />
    </View>
  );
}

function StatItem({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIconWrap}>{icon}</View>
      <AppText variant="h3" style={styles.statValue}>{value}</AppText>
      <AppText variant="caption" color="textMuted" style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function MyApplicationsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const { data: applications = [], isLoading, isError, isFetching, refetch } =
    useGetMyApplicationsQuery();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <FlatList
        data={applications}
        keyExtractor={(item, i) => String(item.applicationId ?? `${item.jobId}-${i}`)}
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
            <View style={styles.pageHeader}>
              {/* Decorative circles */}
              <View style={styles.heroBubble1} />
              <View style={styles.heroBubble2} />

              {/* Text */}
              <View style={styles.pageHeaderLeft}>
                <View style={styles.titleRow}>
                  <AppText style={styles.titleApplied}>Applied </AppText>
                  <AppText style={styles.titleJobs}>Jobs</AppText>
                </View>
                <AppText variant="caption" style={styles.heroSubtitle}>
                  Track your job applications
                </AppText>
              </View>

              {/* Illustration — bottom-aligned, bleeds to right edge */}
              <Image
                source={require('../../../assets/illustrations/jobapplyimg.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            {/* ── Stats card ── */}
            {!isLoading && applications.length > 0 ? (
              <StatsRow applications={applications} />
            ) : null}

            {/* Loading */}
            {isLoading ? (
              <SkeletonList count={4} variant="card" />
            ) : null}

            {/* Section label */}
            {!isLoading && applications.length > 0 ? (
              <View style={styles.sectionHeader}>
                <AppText variant="h3">Your Applications</AppText>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <BriefcaseBusiness size={scale(52)} color={colors.border} />
              <AppText variant="bodyBold" style={styles.emptyTitle}>
                {isError ? 'Could not load applications' : 'No applications yet'}
              </AppText>
              <AppText variant="caption" color="textMuted" style={styles.emptySub}>
                {isError
                  ? 'Check your connection and pull down to retry.'
                  : 'Jobs you apply for will appear here.'}
              </AppText>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <ApplicationCard
              application={item}
              onPress={() => navigation.navigate('ApplicationTracker', { applicationId: item.applicationId })}
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

  /* Page header — peach gradient hero */
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FDEBD0',          // warm peach base
    paddingTop: vs(28),
    paddingLeft: spacing.lg,
    paddingRight: 0,
    paddingBottom: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: vs(16),
    overflow: 'hidden',
    minHeight: vs(180),
  },
  heroBubble1: {
    position: 'absolute',
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    backgroundColor: '#FAD5A5',
    top: -scale(60),
    right: -scale(40),
    opacity: 0.5,
  },
  heroBubble2: {
    position: 'absolute',
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: '#F5B86E',
    top: vs(10),
    right: scale(80),
    opacity: 0.25,
  },
  pageHeaderLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
    paddingBottom: vs(24),
    zIndex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: vs(6),
  },
  titleApplied: { flexShrink: 1, fontSize: font(28), fontWeight: '800', color: colors.text },
  titleJobs: { flexShrink: 1, fontSize: font(28), fontWeight: '800', color: colors.primary },
  heroSubtitle: { color: colors.textSecondary, fontSize: font(13) },
  illustration: {
    width: scale(150),
    height: vs(195),
    zIndex: 1,
    marginBottom: 0,
    alignSelf: 'flex-end',
  },

  /* Stats */
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: vs(0),
    marginBottom: vs(4),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: vs(16),
    paddingHorizontal: spacing.sm,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
    elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center', gap: vs(4) },
  statDivider: { width: 1, height: vs(40), backgroundColor: colors.border },
  statIconWrap: {
    width: scale(36), height: scale(36), borderRadius: scale(18),
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: font(18) },
  statLabel: { fontSize: font(10), textAlign: 'center' },

  /* Section */
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(20),
    paddingBottom: vs(10),
  },

  /* List */
  listItem: { paddingHorizontal: spacing.lg },

  /* Application card */
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.04,
    shadowRadius: scale(4),
    elevation: 2,
  },
  cardPressed: { opacity: 0.88 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: vs(12),
  },
  cardAvatar: {
    width: scale(48), height: scale(48),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1, borderColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitles: { flex: 1, gap: vs(2) },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: vs(4),
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: scale(3) },
  cardRight: {
    alignItems: 'flex-end',
    gap: vs(8),
    flexShrink: 0,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
    borderRadius: radius.pill,
  },
  statusText: { fontWeight: '700', fontSize: font(11) },
  arrowCircle: {
    width: scale(28), height: scale(28), borderRadius: scale(14),
    backgroundColor: colors.primaryLight,
    borderWidth: 1, borderColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  statusMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  statusMsgText: { flex: 1 },

  /* Misc */
  loaderWrap: { alignItems: 'center', paddingVertical: vs(40) },
  emptyWrap: { alignItems: 'center', paddingVertical: vs(48), paddingHorizontal: spacing.xl },
  emptyTitle: { marginTop: vs(12) },
  emptySub: { textAlign: 'center', marginTop: vs(6) },
});
