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
  Camera,
  ChevronRight,
  LogOut,
  Pencil,
  Settings,
  TriangleAlert,
  Users2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, UserAvatar } from '../../../components/common';
import InteractivePressable from '../../../components/common/InteractivePressable';
import { RecruiterStackParamList } from '../../../navigation/types';
import { useAppLogout } from '../../auth/hooks/useAppLogout';
import { useAppSelector } from '../../../store/hooks';
import { colors, font, radius, scale, sizes, spacing, vs } from '../../../theme';
import {
  getProfilePictureHeaders,
  resolveProfilePictureUrl,
} from '../../candidate/utils/resume';
import { useGetRecruiterProfileQuery, useGetJobsCountQuery, useGetApplicationsCountQuery, useGetShortlistedCountQuery } from '../api/recruiterApi';

type Nav = NativeStackNavigationProp<RecruiterStackParamList>;

/* ─── Stat chip ──────────────────────────────────────────────────────────── */
function StatChip({
  icon,
  value,
  label,
  iconBackground,
}: {
  icon: React.ReactNode;
  value?: number;
  label: string;
  iconBackground: string;
}) {
  return (
    <View style={styles.statChip}>
      <View style={[styles.statChipIcon, { backgroundColor: iconBackground }]}>{icon}</View>
      <AppText style={styles.statChipValue}>{value ?? '–'}</AppText>
      <AppText variant="caption" color="textMuted" style={styles.statChipLabel}>{label}</AppText>
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

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function CompanyProfileScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const logout = useAppLogout();
  const token = useAppSelector(state => state.auth.token);

  const { data: company, isLoading, isError } = useGetRecruiterProfileQuery();
  const { data: totalJobs }       = useGetJobsCountQuery();
  const { data: appsCount }       = useGetApplicationsCountQuery();
  const { data: shortlistedCount } = useGetShortlistedCountQuery();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCard, { paddingTop: insets.top + vs(16) }]}>
          <Pressable
            onPress={() => navigation.navigate('EditCompany')}
            style={styles.editBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit company profile">
            <Pencil size={scale(14)} color={colors.textOnPrimary} />
          </Pressable>

          <View style={styles.bubble1} />
          <View style={styles.bubble2} />

          <Pressable
            onPress={() => navigation.navigate('EditCompany')}
            style={styles.avatarWrap}
            accessibilityRole="button"
            accessibilityLabel="Change company profile picture">
            <View style={styles.avatarFrame}>
              <UserAvatar
                name={company?.companyName}
                uri={
                  company?.profilePictureUrl
                    ? resolveProfilePictureUrl(company.profilePictureUrl)
                    : undefined
                }
                headers={getProfilePictureHeaders(company?.profilePictureUrl, token)}
                size={scale(108)}
              />
            </View>
            <View style={styles.cameraBadge}>
              <Camera size={scale(17)} color={colors.primary} />
            </View>
          </Pressable>

          {isLoading ? (
            <ActivityIndicator color={colors.textOnPrimary} style={styles.loadingIndicator} />
          ) : null}

          {isError && !isLoading ? (
            <View style={styles.errorRow}>
              <TriangleAlert size={scale(13)} color="rgba(255,255,255,0.7)" />
              <AppText variant="caption" style={styles.errorText}>Could not load company info</AppText>
            </View>
          ) : null}

          <AppText variant="h2" style={styles.heroName} numberOfLines={1}>
            {isLoading ? ' ' : company?.companyName ?? 'Your Company'}
          </AppText>
        </View>

        <View style={styles.statsCard}>
          <StatChip
            icon={<BriefcaseBusiness size={scale(20)} color={colors.primaryDark} />}
            value={totalJobs}
            label="Jobs"
            iconBackground="#FFF0E4"
          />
          <View style={styles.statDividerV} />
          <StatChip
            icon={<Users2 size={scale(21)} color="#7C3AED" />}
            value={appsCount}
            label="Applications"
            iconBackground="#F2EAFE"
          />
          <View style={styles.statDividerV} />
          <StatChip
            icon={<BadgeCheck size={scale(21)} color={colors.success} />}
            value={shortlistedCount}
            label="Shortlisted"
            iconBackground="#E8F7EE"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <AppText variant="caption" color="textSecondary" style={styles.sectionTitle}>ACCOUNT</AppText>
          </View>
          <View style={styles.card}>
            <ActionRow icon={<Pencil size={sizes.iconSm} color={colors.primary} />} label="Edit Company Profile" onPress={() => navigation.navigate('EditCompany')} />
            <View style={styles.divider} />
            <ActionRow icon={<Bell size={sizes.iconSm} color={colors.primary} />} label="Notifications" onPress={() => navigation.navigate('Notifications')} />
            <View style={styles.divider} />
            <ActionRow icon={<Settings size={sizes.iconSm} color={colors.primary} />} label="Settings" onPress={() => navigation.navigate('Settings')} />
            <View style={styles.divider} />
            <ActionRow icon={<TriangleAlert size={sizes.iconSm} color={colors.primary} />} label="Raise a Complaint" onPress={() => navigation.navigate('RaiseComplaint')} />
          </View>
        </View>

        <View style={[styles.section, styles.logoutSection]}>
          <View style={styles.card}>
            <ActionRow
              icon={<LogOut size={sizes.iconSm} color={colors.danger} />}
              label="Logout"
              onPress={handleLogout}
              destructive
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: vs(32) },

  /* Hero card */
  heroCard: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(76),
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    width: scale(42), height: scale(42), borderRadius: scale(21),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  avatarWrap: { position: 'relative', marginTop: vs(20), marginBottom: vs(14) },
  avatarFrame: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    borderWidth: scale(4),
    borderColor: colors.background,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraBadge: {
    position: 'absolute',
    right: -scale(2),
    bottom: -scale(2),
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: colors.background,
    borderWidth: scale(2),
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    color: colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: 0,
  },
  loadingIndicator: { marginVertical: vs(8) },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: scale(6), marginTop: vs(12) },
  errorText: { color: 'rgba(255,255,255,0.7)' },

  /* Stats strip */
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: -vs(48),
    marginBottom: vs(24),
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(14),
    borderRadius: scale(26),
    shadowColor: '#5B2C11',
    shadowOffset: { width: 0, height: vs(5) },
    shadowOpacity: 0.12,
    shadowRadius: scale(14),
    elevation: 5,
  },
  statChip: { flex: 1, alignItems: 'center', gap: vs(4) },
  statChipIcon: {
    width: scale(40), height: scale(40), borderRadius: scale(20),
    alignItems: 'center', justifyContent: 'center',
    marginBottom: vs(2),
  },
  statChipValue: { fontSize: font(18), fontWeight: '800', color: colors.text },
  statChipLabel: { fontSize: font(11), textAlign: 'center' },
  statDividerV: { width: 1, height: vs(56), backgroundColor: colors.border },

  section: { marginHorizontal: spacing.lg, marginBottom: vs(12) },
  logoutSection: { marginBottom: vs(8) },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: vs(8) },
  sectionAccent: { width: scale(3), height: scale(14), borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle: { fontWeight: '700', letterSpacing: 0.8 },
  card: {
    backgroundColor: colors.background,
    borderRadius: scale(24),
    overflow: 'hidden',
    shadowColor: '#5B2C11',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
    elevation: 4,
  },

  /* Rows */
  row: {
    flexDirection: 'row', alignItems: 'center',
    minHeight: vs(68),
    paddingVertical: vs(12), paddingHorizontal: spacing.lg,
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
    backgroundColor: '#EFEFF2',
    marginLeft: spacing.lg + scale(36) + spacing.md,
  },
});
