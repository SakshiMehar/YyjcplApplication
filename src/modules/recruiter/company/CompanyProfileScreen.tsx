import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  Globe,
  LogOut,
  MapPin,
  Pencil,
  Settings,
  TriangleAlert,
  Users2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, UserAvatar } from '../../../components/common';
import InteractivePressable from '../../../components/common/InteractivePressable';
import { RecruiterStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import { clearToken } from '../../../services/secureStorage';
import { colors, font, radius, scale, sizes, spacing, vs } from '../../../theme';
import { useGetRecruiterProfileQuery, useGetJobsCountQuery, useGetApplicationsCountQuery, useGetShortlistedCountQuery } from '../api/recruiterApi';

type Nav = NativeStackNavigationProp<RecruiterStackParamList>;

/* ─── Stat chip ──────────────────────────────────────────────────────────── */
function StatChip({ icon, value, label }: { icon: React.ReactNode; value?: number; label: string }) {
  return (
    <View style={styles.statChip}>
      <View style={styles.statChipIcon}>{icon}</View>
      <AppText style={styles.statChipValue}>{value ?? '–'}</AppText>
      <AppText variant="caption" color="textMuted" style={styles.statChipLabel}>{label}</AppText>
    </View>
  );
}

/* ─── Info pill ──────────────────────────────────────────────────────────── */
function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.pill}>
      {icon}
      <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.pillText}>
        {label}
      </AppText>
    </View>
  );
}

/* ─── Action row ─────────────────────────────────────────────────────────── */
function ActionRow({
  icon, label, onPress, destructive = false,
}: {
  icon: React.ReactNode; label: string; onPress: () => void; destructive?: boolean;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button">
      <View style={[styles.rowIcon, destructive && styles.rowIconDestructive]}>
        {icon}
      </View>
      <AppText variant="body" style={[styles.rowLabel, destructive && styles.rowLabelDestructive]} numberOfLines={1}>
        {label}
      </AppText>
      <ChevronRight size={scale(16)} color={destructive ? colors.danger : colors.textMuted} />
    </InteractivePressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function CompanyProfileScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const { data: company, isLoading, isError } = useGetRecruiterProfileQuery();
  const { data: totalJobs }       = useGetJobsCountQuery();
  const { data: appsCount }       = useGetApplicationsCountQuery();
  const { data: shortlistedCount } = useGetShortlistedCountQuery();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => { await clearToken(); dispatch(logout()); },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Hero card ── */}
        <View style={[styles.heroCard, { paddingTop: insets.top + vs(16) }]}>

          {/* Edit button */}
          <Pressable
            onPress={() => navigation.navigate('EditCompany')}
            style={styles.editBtn}
            accessibilityLabel="Edit company profile">
            <Pencil size={scale(14)} color={colors.textOnPrimary} />
          </Pressable>

          {/* Decorative bubbles */}
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <UserAvatar name={company?.companyName} uri={company?.profilePictureUrl} size={scale(84)} />
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.textOnPrimary} style={{ marginTop: vs(16) }} />
          ) : (
            <>
              {/* Name */}
              <AppText variant="h2" style={styles.heroName} numberOfLines={1}>
                {company?.companyName ?? 'Your Company'}
              </AppText>

              {/* Info pills */}
              {(company?.companyIndustry || company?.companyLocation || company?.companyWebsite) ? (
                <View style={styles.pills}>
                  {company?.companyIndustry && <InfoPill icon={<Building2 size={scale(11)} color="rgba(255,255,255,0.7)" />} label={company.companyIndustry} />}
                  {company?.companyLocation && <InfoPill icon={<MapPin    size={scale(11)} color="rgba(255,255,255,0.7)" />} label={company.companyLocation} />}
                  {company?.companyWebsite  && <InfoPill icon={<Globe     size={scale(11)} color="rgba(255,255,255,0.7)" />} label={company.companyWebsite} />}
                </View>
              ) : null}
            </>
          )}

          {isError && !isLoading ? (
            <View style={styles.errorRow}>
              <TriangleAlert size={scale(13)} color="rgba(255,255,255,0.7)" />
              <AppText variant="caption" style={styles.errorText}>Could not load company info</AppText>
            </View>
          ) : null}

          {/* Stats strip inside hero */}
          <View style={styles.statsStrip}>
            <View style={styles.statDividerV} />
            <StatChip icon={<BriefcaseBusiness size={scale(18)} color={colors.primary} />} value={totalJobs} label="Jobs" />
            <View style={styles.statDividerV} />
            <StatChip icon={<Users2 size={scale(18)} color="#A855F7" />} value={appsCount} label="Applications" />
            <View style={styles.statDividerV} />
            <StatChip icon={<BadgeCheck size={scale(18)} color={colors.success} />} value={shortlistedCount} label="Shortlisted" />
            <View style={styles.statDividerV} />
          </View>
        </View>

        {/* ── About ── */}
        {company?.companyDescription ? (
          <View style={styles.aboutCard}>
            <View style={styles.aboutHeader}>
              <View style={styles.aboutAccent} />
              <AppText variant="caption" color="textSecondary" style={styles.aboutLabel}>ABOUT</AppText>
            </View>
            <AppText variant="body" color="textSecondary" style={styles.aboutText}>
              {company.companyDescription}
            </AppText>
          </View>
        ) : null}

        {/* ── Account actions ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <AppText variant="caption" color="textSecondary" style={styles.sectionTitle}>ACCOUNT</AppText>
          </View>
          <View style={styles.card}>
            <ActionRow icon={<Pencil    size={sizes.iconSm} color={colors.primary}  />} label="Edit Company Profile"  onPress={() => navigation.navigate('EditCompany')} />
            <Divider />
            <ActionRow icon={<Bell      size={sizes.iconSm} color={colors.primary}  />} label="Notifications"         onPress={() => navigation.navigate('Notifications')} />
            <Divider />
            <ActionRow icon={<Settings  size={sizes.iconSm} color={colors.primary}  />} label="Settings"              onPress={() => navigation.navigate('Settings')} />
            <Divider />
            <ActionRow icon={<TriangleAlert size={sizes.iconSm} color={colors.primary} />} label="Raise a Complaint"  onPress={() => navigation.navigate('RaiseComplaint')} />
          </View>
        </View>

        {/* ── Logout ── */}
        <View style={[styles.section, { marginBottom: vs(8) }]}>
          <View style={styles.card}>
            <ActionRow icon={<LogOut size={sizes.iconSm} color={colors.danger} />} label="Logout" onPress={handleLogout} destructive />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FDF6EF' },
  scrollContent: { paddingBottom: vs(32) },

  /* Hero card */
  heroCard: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: vs(20),
    overflow: 'hidden',
  },
  bubble1: {
    position: 'absolute', width: scale(200), height: scale(200),
    borderRadius: scale(100), backgroundColor: 'rgba(255,255,255,0.07)',
    top: -scale(60), right: -scale(40),
  },
  bubble2: {
    position: 'absolute', width: scale(120), height: scale(120),
    borderRadius: scale(60), backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: scale(60), left: -scale(30),
  },
  editBtn: {
    position: 'absolute', top: vs(16), right: spacing.lg,
    width: scale(34), height: scale(34), borderRadius: scale(17),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  avatarWrap: { position: 'relative', marginBottom: vs(14) },
  verifiedDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: scale(22), height: scale(22), borderRadius: scale(11),
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.background,
  },
  heroName: {
    color: colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: vs(8),
  },
  verTag: {
    paddingHorizontal: spacing.md, paddingVertical: vs(4),
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: vs(12),
  },
  verTagPending: { backgroundColor: 'rgba(255,255,255,0.12)' },
  verTagText: { color: colors.textOnPrimary, fontWeight: '600' },
  pills: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: spacing.sm,
    marginBottom: vs(16),
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: scale(4),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: vs(4),
  },
  pillText: { color: 'rgba(255,255,255,0.85)', maxWidth: scale(100) },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: scale(6), marginTop: vs(12) },
  errorText: { color: 'rgba(255,255,255,0.7)' },

  /* Stats strip */
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    width: '100%',
    marginTop: vs(4),
    paddingVertical: vs(14),
  },
  statChip: { flex: 1, alignItems: 'center', gap: vs(4) },
  statChipIcon: {
    width: scale(36), height: scale(36), borderRadius: scale(18),
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: vs(2),
  },
  statChipValue: { fontSize: font(18), fontWeight: '800', color: colors.text },
  statChipLabel: { fontSize: font(10), textAlign: 'center' },
  statDividerV: { width: 1, height: vs(40), backgroundColor: colors.border },

  /* About */
  aboutCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: vs(16),
  },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: vs(8) },
  aboutAccent: { width: scale(3), height: scale(14), borderRadius: 2, backgroundColor: colors.primary },
  aboutLabel: { fontWeight: '700', letterSpacing: 0.8 },
  aboutText: { lineHeight: vs(20) },

  /* Sections */
  section: { marginHorizontal: spacing.lg, marginBottom: vs(12) },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: vs(8) },
  sectionAccent: { width: scale(3), height: scale(14), borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle: { fontWeight: '700', letterSpacing: 0.8 },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.04, shadowRadius: scale(6),
    elevation: 2,
  },

  /* Rows */
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: vs(14), paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  rowPressed: { backgroundColor: colors.surface },
  rowIcon: {
    width: scale(36), height: scale(36), borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  rowIconDestructive: { backgroundColor: '#FEE2E2' },
  rowLabel: { flex: 1 },
  rowLabelDestructive: { color: colors.danger },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + scale(36) + spacing.md,
  },
});
