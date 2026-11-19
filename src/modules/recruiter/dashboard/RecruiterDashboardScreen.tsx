import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlignJustify,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Rocket,
  Star,
} from 'lucide-react-native';
import { AppText, UserAvatar } from '../../../components/common';
import { RecruiterStackParamList, RecruiterTabParamList } from '../../../navigation/types';
import { getPendingCompany } from '../../../services/secureStorage';
import { useAppSelector } from '../../../store/hooks';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { useGetNotificationsQuery } from '../../shared/api/sharedApi';
import {
  useGetActiveJobsCountQuery,
  useGetApplicationsCountQuery,
  useGetRecruiterProfileQuery,
  useGetJobApplicationsQuery,
  useGetJobsCountQuery,
  useGetShortlistedCountQuery,
  RecruiterApplication,
} from '../api/recruiterApi';
import { timeAgo } from '../../../utils/format';

type Nav = NativeStackNavigationProp<RecruiterStackParamList>;
const RECENT_COUNT = 5;

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS: Record<string, { label: string; bg: string; text: string }> = {
  APPLIED:             { label: 'APPLIED',      bg: '#DBEAFE', text: '#1D4ED8' },
  SHORTLISTED:         { label: 'SHORTLISTED',  bg: '#DCFCE7', text: colors.success },
  INTERVIEW_SCHEDULED: { label: 'INTERVIEW',    bg: '#FEF9C3', text: '#92400E' },
  NEXT_ROUND:          { label: 'NEXT ROUND',   bg: '#F3F0FF', text: '#7C3AED' },
  SELECTED:            { label: 'SELECTED',     bg: '#DCFCE7', text: colors.success },
  PLACED:              { label: 'PLACED',       bg: '#DCFCE7', text: colors.success },
  REJECTED:            { label: 'REJECTED',     bg: '#FEE2E2', text: colors.danger },
};
const getStatus = (s: string) =>
  STATUS[s?.toUpperCase()] ?? { label: s ?? 'APPLIED', bg: '#FFF1E6', text: colors.primary };

/* ─── Sparkline wave (pure SVG-less View approximation) ─────────────────── */
function Sparkline({ color }: { color: string }) {
  // Simple wave using absolute-positioned rounded bars
  const bars = [4, 8, 5, 10, 7, 12, 6];
  return (
    <View style={spark.row}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[spark.bar, { height: vs(h), backgroundColor: color, opacity: 0.35 + i * 0.09 }]}
        />
      ))}
    </View>
  );
}
const spark = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: vs(14) },
  bar: { width: scale(5), borderRadius: 2 },
});

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({
  label, value, icon, bg, iconColor, change, onPress,
}: {
  label: string; value?: number; icon: React.ReactNode;
  bg: string; iconColor: string; change?: string; onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.statCard, { backgroundColor: bg }]}
      accessibilityRole="button">
      <View style={styles.statTop}>
        <View style={[styles.statIconWrap, { backgroundColor: `${iconColor}20` }]}>
          {icon}
        </View>
        <AppText variant="caption" color="textSecondary">{label}</AppText>
      </View>
      <AppText style={styles.statValue}>{value ?? '–'}</AppText>
      <View style={styles.statBottom}>
        {change ? (
          <View style={styles.statChangeRow}>
            <AppText style={[styles.statChange, { color: colors.success }]}>↑ {change}</AppText>
          </View>
        ) : null}
        <Sparkline color={iconColor} />
      </View>
    </Pressable>
  );
}

/* ─── Recent Application Row ─────────────────────────────────────────────── */
function AppRow({ app, onPress }: { app: RecruiterApplication; onPress: () => void }) {
  const profile = app.jobSeekerProfile;
  const name = profile?.name ?? app.applicantName ?? app.jobSeekerName ?? `#${app.jobSeekerId}`;
  const role = app.job?.role ?? profile?.headline ?? '—';
  const si = getStatus(app.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.appRow, pressed && { opacity: 0.8 }]}
      accessibilityRole="button">
      <UserAvatar name={name} size={scale(44)} />
      <View style={styles.appBody}>
        <AppText variant="bodyBold" numberOfLines={1}>{name}</AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>{role}</AppText>
        <View style={styles.appMeta}>
          <Clock size={scale(11)} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted">
            {timeAgo(app.appliedAt)}
          </AppText>
        </View>
      </View>
      <View style={styles.appRight}>
        <View style={[styles.statusBadge, { backgroundColor: si.bg }]}>
          <AppText style={[styles.statusText, { color: si.text }]}>{si.label}</AppText>
        </View>
        <View style={styles.arrowCircle}>
          <ArrowRight size={scale(13)} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function RecruiterDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const user = useAppSelector(s => s.auth.user);

  const [pendingName, setPendingName] = useState<string | null>(null);
  useEffect(() => {
    getPendingCompany()
      .then(p => p && setPendingName(p.companyName))
      .catch(() => {});
  }, []);

  const { data: recruiterProfile }                      = useGetRecruiterProfileQuery();
  const { data: totalJobs }                             = useGetJobsCountQuery();
  const { data: activeJobs }                            = useGetActiveJobsCountQuery();
  const { data: appsCount }                             = useGetApplicationsCountQuery();
  const { data: shortlistedCount }                      = useGetShortlistedCountQuery();
  const { data: applications = [], isLoading: appsLoading } = useGetJobApplicationsQuery();
  const { data: notifications }                         = useGetNotificationsQuery({ page: 1 });
  const hasUnread = !!notifications?.items?.some(n => !n.read);

  const companyName = recruiterProfile?.companyName ?? pendingName ?? 'Your Company';
  const recentApps = applications.slice(0, RECENT_COUNT);

  const openTab = (screen: keyof RecruiterTabParamList) =>
    navigation.navigate('RecruiterTabs', { screen });

  // Hour-based greeting
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good Morning,' : h < 17 ? 'Good Afternoon,' : 'Good Evening,';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + vs(24) }]}>

        {/* ── Hero ── */}
        <View style={styles.heroCard}>
          {/* Top bar inside the card */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => openTab('CompanyProfile')}
              style={styles.menuBtn}
              accessibilityLabel="Menu">
              <AlignJustify size={scale(20)} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Notifications')}
              style={styles.bellBtn}
              accessibilityLabel="Notifications">
              <Bell size={scale(20)} color={colors.text} />
              {hasUnread ? <View style={styles.bellDot} /> : null}
            </Pressable>
          </View>

          {/* Hero content: text left, image right */}
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <AppText variant="caption" color="textSecondary" style={styles.greetCaption}>
                {greet}
              </AppText>
              <AppText style={styles.companyName} numberOfLines={2}>
                {companyName}
              </AppText>
              <View style={styles.orangeUnderline} />
            </View>
            <Image
              source={require('../../../assets/illustrations/onboarding-employer.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── 2×2 Stat grid ── */}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <StatCard
              label="Total Jobs"
              value={totalJobs}
              icon={<BriefcaseBusiness size={scale(20)} color="#4F6EF7" />}
              bg="#EEF2FF"
              iconColor="#4F6EF7"
              change="+12%"
              onPress={() => openTab('MyJobs')}
            />
            <StatCard
              label="Active Jobs"
              value={activeJobs}
              icon={<CheckCircle2 size={scale(20)} color={colors.success} />}
              bg="#F0FFF4"
              iconColor={colors.success}
              change="+0%"
              onPress={() => openTab('MyJobs')}
            />
          </View>
          <View style={styles.gridRow}>
            <StatCard
              label="Applications"
              value={appsCount}
              icon={<FileText size={scale(20)} color="#A855F7" />}
              bg="#FAF5FF"
              iconColor="#A855F7"
              change="+50%"
              onPress={() => openTab('Applications')}
            />
            <StatCard
              label="Shortlisted"
              value={shortlistedCount}
              icon={<Star size={scale(20)} color="#F59E0B" fill="#F59E0B" />}
              bg="#FFFBEB"
              iconColor="#F59E0B"
              change="+0%"
              onPress={() => navigation.navigate('Shortlist')}
            />
          </View>
        </View>

        {/* ── Post Job banner ── */}
        <Pressable
          onPress={() => navigation.navigate('PostJob')}
          style={styles.postBanner}
          accessibilityRole="button"
          accessibilityLabel="Post a job">
          {/* Decorative circle */}
          <View style={styles.bannerBubble} />
          <View style={styles.bannerLeft}>
            <Rocket size={scale(32)} color={colors.textOnPrimary} style={{ marginBottom: vs(4) }} />
            <AppText style={styles.bannerTitle}>Hiring for a new role?</AppText>
            <AppText variant="caption" style={styles.bannerSub}>
              Post a job and start receiving{'\n'}applications today
            </AppText>
          </View>
          <View style={styles.postJobBtn}>
            <Plus size={scale(14)} color={colors.primary} />
            <AppText style={styles.postJobText}>Post Job</AppText>
            <ArrowRight size={scale(14)} color={colors.primary} />
          </View>
        </Pressable>

        {/* ── Recent Applications ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <UserAvatar name="R" size={scale(28)} />
              <AppText variant="h3" style={styles.sectionTitle}>Recent Applications</AppText>
            </View>
            <Pressable onPress={() => openTab('Applications')} accessibilityLabel="See all applications">
              <AppText variant="caption" style={styles.seeAll}>See all →</AppText>
            </Pressable>
          </View>

          <View style={styles.appCard}>
            {appsLoading ? (
              <ActivityIndicator color={colors.primary} style={{ margin: vs(20) }} />
            ) : recentApps.length === 0 ? (
              <View style={styles.emptyWrap}>
                <AppText variant="body" color="textMuted" style={{ textAlign: 'center' }}>
                  No applications yet. Post a job to get started.
                </AppText>
              </View>
            ) : (
              recentApps.map((app, i) => (
                <React.Fragment key={String(app.applicationId)}>
                  {i > 0 ? <View style={styles.appDivider} /> : null}
                  <AppRow
                    app={app}
                    onPress={() => navigation.navigate('ApplicantDetails', { application: app })}
                  />
                </React.Fragment>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: spacing.lg },

  /* Hero card */
  heroCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: vs(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.07,
    shadowRadius: scale(10),
    elevation: 3,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroText: {
    flex: 1,
    paddingRight: spacing.md,
    paddingBottom: vs(8),
  },
  menuBtn: {
    width: scale(40), height: scale(40), borderRadius: scale(10),
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  bellBtn: {
    width: scale(40), height: scale(40), borderRadius: scale(20),
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  bellDot: {
    position: 'absolute', top: scale(7), right: scale(7),
    width: scale(8), height: scale(8), borderRadius: scale(4),
    backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.background,
  },
  greetCaption: { marginBottom: vs(4), fontSize: font(13) },
  companyName: {
    fontSize: font(24),
    fontWeight: '800',
    color: colors.text,
    lineHeight: vs(30),
    marginBottom: vs(8),
  },
  orangeUnderline: {
    width: scale(56),
    height: vs(4),
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  heroImage: {
    width: scale(110),
    height: vs(120),
    marginBottom: -spacing.lg,
    marginRight: -spacing.lg,
  },

  /* Stats */
  grid: { gap: spacing.md, marginBottom: vs(20) },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.06,
    shadowRadius: scale(8),
    elevation: 3,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  statIconWrap: {
    width: scale(38), height: scale(38), borderRadius: scale(10),
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: font(28), fontWeight: '800', color: colors.text, marginBottom: vs(8) },
  statBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  statChangeRow: { flexDirection: 'row', alignItems: 'center' },
  statChange: { fontSize: font(12), fontWeight: '700' },

  /* Post Job banner */
  postBanner: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(24),
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.35,
    shadowRadius: scale(12),
    elevation: 6,
  },
  bannerBubble: {
    position: 'absolute',
    right: -scale(20),
    top: -scale(20),
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerLeft: { flex: 1 },
  bannerTitle: {
    fontSize: font(17),
    fontWeight: '800',
    color: colors.textOnPrimary,
    marginBottom: vs(4),
  },
  bannerSub: { color: 'rgba(255,255,255,0.85)', lineHeight: vs(18) },
  postJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: colors.textOnPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(9),
    marginLeft: spacing.md,
  },
  postJobText: { color: colors.primary, fontWeight: '700', fontSize: font(13) },

  /* Recent Applications */
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(14),
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { marginLeft: spacing.xs },
  seeAll: { color: colors.primary, fontWeight: '600' },
  appCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.04,
    shadowRadius: scale(6),
    elevation: 2,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(14),
  },
  appDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg,
  },
  appBody: { flex: 1, gap: vs(2) },
  appMeta: { flexDirection: 'row', alignItems: 'center', gap: scale(4), marginTop: vs(2) },
  appRight: { alignItems: 'flex-end', gap: vs(8) },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(3),
    borderRadius: radius.pill,
  },
  statusText: { fontSize: font(10), fontWeight: '700' },
  arrowCircle: {
    width: scale(28), height: scale(28), borderRadius: scale(14),
    backgroundColor: colors.primaryLight,
    borderWidth: 1, borderColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyWrap: { padding: spacing.xl, alignItems: 'center' },
});
