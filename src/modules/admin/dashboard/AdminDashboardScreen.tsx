import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  IndianRupee,
  ShieldCheck,
  Users,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText, UserAvatar } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { AdminStackParamList, AdminTabParamList } from '../../../navigation/types';
import { useAppSelector } from '../../../store/hooks';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { greeting, timeAgo } from '../../../utils/format';
import { Panel, RowDivider, SectionTitle, StatusPill } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { PLATFORM_TOTALS } from '../data/sampleAdmin';
import { ADMIN_MODULES } from '../adminModules';
import { useAdminBadges, useOpenAdminModule } from '../useAdminModules';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const chunk = <T,>(list: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

const compact = (n: number) =>
  n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

/* ─── Sparkline (bar approximation, same as recruiter dashboard) ────────── */
function Sparkline({ color }: { color: string }) {
  const bars = [4, 8, 5, 10, 7, 12, 6];
  return (
    <View style={styles.sparkRow}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[styles.sparkBar, { height: vs(h), backgroundColor: color, opacity: 0.35 + i * 0.09 }]}
        />
      ))}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  change,
  onPress,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  change: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [styles.statCard, { backgroundColor: bg }, pressed && styles.pressed]}>
      <View style={styles.statTop}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Icon size={scale(20)} color={color} />
        </View>
        <AppText variant="caption" color="textSecondary">
          {label}
        </AppText>
      </View>
      <AppText style={styles.statValue}>{value}</AppText>
      <View style={styles.statBottom}>
        <AppText style={styles.statChange}>↑ {change}</AppText>
        <Sparkline color={color} />
      </View>
    </Pressable>
  );
}

function QuickAction({
  label,
  icon: Icon,
  color,
  badge,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  color: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.quick, pressed && styles.pressed]}>
      <View style={[styles.quickIcon, { backgroundColor: `${color}1A` }]}>
        <Icon size={scale(22)} color={color} />
        {badge ? (
          <View style={styles.quickBadge}>
            <AppText style={styles.quickBadgeText}>{badge}</AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption" align="center" numberOfLines={2} style={styles.quickLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const admin = useAppSelector(s => s.auth.user);
  const { users } = useAdminData();

  const badges = useAdminBadges();
  const openModule = useOpenAdminModule();
  const pendingJobs = badges.jobs ?? 0;
  const pendingVerifications = badges.verification ?? 0;
  const openComplaints = badges.complaints ?? 0;
  const attention = pendingJobs + pendingVerifications + openComplaints;
  const recentUsers = [...users]
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
    .slice(0, 4);

  const openTab = <K extends keyof AdminTabParamList>(screen: K, params?: AdminTabParamList[K]) =>
    navigation.navigate('AdminTabs', { screen, params } as never);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: vs(24) }]}>
        {/* ── Hero ── */}
        <View style={styles.heroCard}>
          <View style={styles.topBar}>
            <View style={styles.adminChip}>
              <ShieldCheck size={scale(14)} color={colors.primary} />
              <AppText variant="caption" style={styles.adminChipText}>
                Admin Panel
              </AppText>
            </View>
            <Pressable
              onPress={() => navigation.navigate('AdminNotifications')}
              style={styles.bellBtn}
              accessibilityRole="button"
              accessibilityLabel="Send notification">
              <Bell size={scale(20)} color={colors.text} />
              {attention > 0 ? <View style={styles.bellDot} /> : null}
            </Pressable>
          </View>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <AppText variant="caption" color="textSecondary" style={styles.greet}>
                {greeting()},
              </AppText>
              <AppText style={styles.heroName} numberOfLines={2}>
                {admin?.name || 'Admin'}
              </AppText>
              <View style={styles.underline} />
              <AppText variant="caption" color="textSecondary" style={styles.heroSub}>
                Here is what's happening on YYJCPL today
              </AppText>
            </View>
            <Image
              source={require('../../../assets/illustrations/dashboard.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── 2×2 stats ── */}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <StatCard
              label="Job Seekers"
              value={compact(PLATFORM_TOTALS.jobSeekers)}
              icon={Users}
              color="#4F6EF7"
              bg="#EEF2FF"
              change="+8%"
              onPress={() => openTab('AdminCandidates')}
            />
            <StatCard
              label="Recruiters"
              value={compact(PLATFORM_TOTALS.recruiters)}
              icon={Building2}
              color={colors.success}
              bg="#F0FFF4"
              change="+5%"
              onPress={() => openTab('AdminRecruiters')}
            />
          </View>
          <View style={styles.gridRow}>
            <StatCard
              label="Live Jobs"
              value={compact(PLATFORM_TOTALS.liveJobs)}
              icon={BriefcaseBusiness}
              color="#A855F7"
              bg="#FAF5FF"
              change="+12%"
              onPress={() => openTab('AdminJobs', { status: 'APPROVED' })}
            />
            <StatCard
              label="Revenue (Nov)"
              value={`₹${compact(PLATFORM_TOTALS.revenueThisMonth)}`}
              icon={IndianRupee}
              color="#F59E0B"
              bg="#FFFBEB"
              change="+18%"
              onPress={() => navigation.navigate('AdminPayments')}
            />
          </View>
        </View>

        {/* ── Needs attention banner ── */}
        <Pressable
          onPress={() => openTab('AdminJobs', { status: 'PENDING' })}
          accessibilityRole="button"
          accessibilityLabel="Review pending items"
          style={({ pressed }) => [styles.banner, pressed && styles.pressed]}>
          <View style={styles.bannerBubble} />
          <View style={styles.bannerLeft}>
            <ClipboardCheck size={scale(30)} color={colors.textOnPrimary} />
            <AppText style={styles.bannerTitle}>
              {attention > 0 ? `${attention} items need your review` : 'All caught up!'}
            </AppText>
            <AppText variant="caption" style={styles.bannerSub}>
              {pendingJobs} job approvals • {pendingVerifications} verifications • {openComplaints}{' '}
              complaints
            </AppText>
          </View>
          <View style={styles.bannerBtn}>
            <AppText style={styles.bannerBtnText}>Review</AppText>
            <ArrowRight size={scale(14)} color={colors.primary} />
          </View>
        </Pressable>

        {/* ── All sections ── */}
        <SectionTitle title="Admin Sections" />
        <Panel style={styles.quickPanel}>
          {chunk(ADMIN_MODULES.filter(m => m.key !== 'dashboard'), 4).map((row, i) => (
            <View key={i} style={styles.quickRow}>
              {row.map(m => (
                <QuickAction
                  key={m.key}
                  label={m.label}
                  icon={m.icon}
                  color={m.color}
                  badge={badges[m.key]}
                  onPress={() => openModule(m.key)}
                />
              ))}
              {Array.from({ length: 4 - row.length }).map((_, j) => (
                <View key={`pad${j}`} style={styles.quick} />
              ))}
            </View>
          ))}
        </Panel>

        {/* ── Recent registrations ── */}
        <SectionTitle title="Recent Registrations" onAction={() => openTab('AdminCandidates')} />
        <Panel>
          {recentUsers.map((u, i) => (
            <React.Fragment key={u.id}>
              {i > 0 ? <RowDivider /> : null}
              <Pressable
                onPress={() => navigation.navigate('AdminUserDetails', { userId: u.id })}
                accessibilityRole="button"
                style={({ pressed }) => [styles.userRow, pressed && styles.pressed]}>
                <UserAvatar name={u.name} size={scale(44)} />
                <View style={styles.userBody}>
                  <AppText variant="bodyBold" numberOfLines={1}>
                    {u.name}
                  </AppText>
                  <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                    {u.company ? `${u.headline} • ${u.company}` : u.headline}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {timeAgo(u.joinedAt)}
                  </AppText>
                </View>
                <View style={styles.userRight}>
                  <StatusPill
                    label={u.type === 'RECRUITER' ? 'RECRUITER' : 'JOB SEEKER'}
                    tone={u.type === 'RECRUITER' ? 'purple' : 'info'}
                  />
                  <View style={styles.arrowCircle}>
                    <ArrowRight size={scale(13)} color={colors.primary} />
                  </View>
                </View>
              </Pressable>
            </React.Fragment>
          ))}
        </Panel>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: vs(8) },
  pressed: { opacity: 0.82 },

  heroCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: vs(18),
    overflow: 'hidden',
    boxShadow: `0px ${scale(2)}px ${scale(10)}px rgba(0, 0, 0, 0.07)`,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(10) },
  adminChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: spacing.md,
    paddingVertical: vs(5),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  adminChipText: { color: colors.primary, fontWeight: '700' },
  bellBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  heroContent: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroText: { flex: 1, paddingRight: spacing.sm, paddingBottom: vs(6) },
  greet: { marginBottom: vs(4), fontSize: font(13) },
  heroName: { fontSize: font(24), fontWeight: '800', color: colors.text, lineHeight: vs(30), marginBottom: vs(8) },
  underline: { width: scale(56), height: vs(4), borderRadius: 2, backgroundColor: colors.primary },
  heroSub: { marginTop: vs(8) },
  heroImage: { width: scale(110), height: vs(110), marginBottom: -spacing.lg, marginRight: -spacing.sm },

  grid: { gap: spacing.md, marginBottom: vs(18) },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: `0px ${scale(2)}px ${scale(8)}px rgba(0, 0, 0, 0.06)`,
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(10) },
  statIcon: { width: scale(38), height: scale(38), borderRadius: scale(10), alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: font(26), fontWeight: '800', color: colors.text, marginBottom: vs(8) },
  statBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  statChange: { fontSize: font(12), fontWeight: '700', color: colors.success },
  sparkRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: vs(14) },
  sparkBar: { width: scale(5), borderRadius: 2 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: vs(18),
    overflow: 'hidden',
    backgroundColor: colors.primary,
    boxShadow: `0px ${scale(6)}px ${scale(14)}px rgba(249, 115, 22, 0.35)`,
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
  bannerLeft: { flex: 1, gap: vs(4) },
  bannerTitle: { fontSize: font(17), fontWeight: '800', color: colors.textOnPrimary },
  bannerSub: { color: 'rgba(255,255,255,0.88)' },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(9),
    marginLeft: spacing.md,
  },
  bannerBtnText: { color: colors.primary, fontWeight: '700', fontSize: font(13) },

  quickPanel: { gap: vs(14), paddingHorizontal: spacing.sm },
  quickRow: { flexDirection: 'row' },
  quick: { flex: 1, alignItems: 'center', gap: vs(6) },
  quickIcon: { width: scale(50), height: scale(50), borderRadius: scale(16), alignItems: 'center', justifyContent: 'center' },
  quickBadge: {
    position: 'absolute',
    top: -scale(5),
    right: -scale(5),
    minWidth: scale(18),
    height: scale(18),
    paddingHorizontal: scale(4),
    borderRadius: scale(9),
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadgeText: { color: colors.textOnPrimary, fontSize: font(10), fontWeight: '800' },
  quickLabel: { fontWeight: '600', color: colors.text, fontSize: font(11) },

  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  userBody: { flex: 1, gap: vs(1) },
  userRight: { alignItems: 'flex-end', gap: vs(8) },
  arrowCircle: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
