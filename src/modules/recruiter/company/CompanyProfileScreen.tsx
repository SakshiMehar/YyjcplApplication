import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BadgeCheck,
  Bell,
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
import Pressable from '../../../components/common/InteractivePressable';
import { RecruiterStackParamList } from '../../../navigation/types';
import { useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import { clearToken } from '../../../services/secureStorage';
import { colors, radius, scale, sizes, spacing, vs } from '../../../theme';
import { useGetCompanyQuery } from '../api/recruiterApi';

type Nav = NativeStackNavigationProp<RecruiterStackParamList>;

/* ─── Row item inside a section card ─────────────────────────────────────── */
function ActionRow({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={[styles.rowIcon, destructive && styles.rowIconDestructive]}>
        {icon}
      </View>
      <AppText
        variant="body"
        style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}
        numberOfLines={1}>
        {label}
      </AppText>
      <ChevronRight size={scale(16)} color={destructive ? colors.danger : colors.textMuted} />
    </Pressable>
  );
}

/* ─── Divider ────────────────────────────────────────────────────────────── */
function Divider() {
  return <View style={styles.divider} />;
}

/* ─── Info pill (industry / size / location / website) ──────────────────── */
function InfoPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.pill}>
      {icon}
      <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.pillText}>
        {label}
      </AppText>
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function CompanyProfileScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const { data: company, isLoading, isError } = useGetCompanyQuery();

  const handleLogout = async () => {
    await clearToken();
    dispatch(logout());
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Header ── */}
        <View style={[styles.hero, { paddingTop: insets.top + vs(16) }]}>
          {/* Edit button */}
          <Pressable
            onPress={() => navigation.navigate('EditCompany')}
            style={styles.editBtn}
            accessibilityLabel="Edit company profile">
            <Pencil size={scale(15)} color={colors.textOnPrimary} />
          </Pressable>

          {/* Logo / initials */}
          <UserAvatar
            name={company?.name}
            uri={company?.logoUrl}
            size={scale(80)}
          />

          {/* Loading skeleton */}
          {isLoading && (
            <ActivityIndicator
              color={colors.textOnPrimary}
              style={{ marginTop: vs(16) }}
            />
          )}

          {!isLoading && (
            <>
              {/* Company name */}
              <View style={styles.nameRow}>
                <AppText variant="h2" style={styles.heroName} numberOfLines={2}>
                  {company?.name ?? 'Your Company'}
                </AppText>
                {company?.isVerified && (
                  <BadgeCheck size={scale(20)} color={colors.primary} style={styles.verifiedIcon} />
                )}
              </View>

              {/* Verification tag */}
              <View
                style={[
                  styles.verifiedTag,
                  !company?.isVerified && styles.pendingTag,
                ]}>
                <AppText variant="caption" style={styles.verifiedTagText}>
                  {company?.isVerified ? '✓  Verified Company' : '⏳  Verification Pending'}
                </AppText>
              </View>

              {/* Info pills row */}
              {(company?.industry ||
                company?.size ||
                company?.location ||
                company?.website) && (
                <View style={styles.pills}>
                  {company?.industry && (
                    <InfoPill
                      icon={<Building2 size={scale(11)} color={colors.textMuted} />}
                      label={company.industry}
                    />
                  )}
                  {company?.size && (
                    <InfoPill
                      icon={<Users2 size={scale(11)} color={colors.textMuted} />}
                      label={company.size}
                    />
                  )}
                  {company?.location && (
                    <InfoPill
                      icon={<MapPin size={scale(11)} color={colors.textMuted} />}
                      label={company.location}
                    />
                  )}
                  {company?.website && (
                    <InfoPill
                      icon={<Globe size={scale(11)} color={colors.textMuted} />}
                      label={company.website}
                    />
                  )}
                </View>
              )}
            </>
          )}

          {isError && !isLoading && (
            <View style={styles.errorRow}>
              <TriangleAlert size={scale(14)} color="rgba(255,255,255,0.7)" />
              <AppText variant="caption" style={styles.errorText}>
                Could not load company info
              </AppText>
            </View>
          )}
        </View>

        {/* ── About section ── */}
        {company?.about ? (
          <View style={styles.aboutCard}>
            <AppText variant="caption" color="textSecondary" style={styles.aboutLabel}>
              ABOUT
            </AppText>
            <AppText variant="body" color="textSecondary" style={styles.aboutText}>
              {company.about}
            </AppText>
          </View>
        ) : null}

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <AppText variant="caption" color="textMuted" style={styles.sectionTitle}>
            ACCOUNT
          </AppText>
          <View style={styles.card}>
            <ActionRow
              icon={<Pencil size={sizes.iconSm} color={colors.primary} />}
              label="Edit Company Profile"
              onPress={() => navigation.navigate('EditCompany')}
            />
            <Divider />
            <ActionRow
              icon={<Bell size={sizes.iconSm} color={colors.primary} />}
              label="Notifications"
              onPress={() => navigation.navigate('Notifications')}
            />
            <Divider />
            <ActionRow
              icon={<Settings size={sizes.iconSm} color={colors.primary} />}
              label="Settings"
              onPress={() => navigation.navigate('Settings')}
            />
            <Divider />
            <ActionRow
              icon={<TriangleAlert size={sizes.iconSm} color={colors.primary} />}
              label="Raise a Complaint"
              onPress={() => navigation.navigate('RaiseComplaint')}
            />
          </View>
        </View>

        {/* ── Logout ── */}
        <View style={[styles.section, styles.lastSection]}>
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
const HERO_RADIUS = 24;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingBottom: vs(32),
  },

  /* Hero */
  hero: {
    backgroundColor: colors.text,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(32),
    borderBottomLeftRadius: HERO_RADIUS,
    borderBottomRightRadius: HERO_RADIUS,
    marginBottom: vs(20),
  },
  editBtn: {
    position: 'absolute',
    top: vs(16),
    right: spacing.lg,
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(14),
    paddingHorizontal: spacing.xl,
    gap: scale(6),
  },
  heroName: {
    color: colors.textOnPrimary,
    textAlign: 'center',
    flexShrink: 1,
  },
  verifiedIcon: {
    flexShrink: 0,
  },
  verifiedTag: {
    marginTop: vs(6),
    paddingHorizontal: spacing.md,
    paddingVertical: vs(3),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  pendingTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  verifiedTagText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: vs(12),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
  },
  pillText: {
    color: 'rgba(255,255,255,0.75)',
    maxWidth: scale(100),
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: vs(12),
  },
  errorText: {
    color: 'rgba(255,255,255,0.65)',
  },

  /* About */
  aboutCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: vs(20),
  },
  aboutLabel: {
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: vs(6),
  },
  aboutText: {
    lineHeight: vs(20),
  },

  /* Sections */
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: vs(12),
  },
  lastSection: {
    marginTop: vs(4),
    marginBottom: vs(8),
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: vs(8),
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  /* Rows */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(14),
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  rowIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDestructive: {
    backgroundColor: '#FEE2E2',
  },
  rowLabel: {
    flex: 1,
  },
  rowLabelDestructive: {
    color: colors.danger,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + scale(32) + spacing.md,
  },
});
