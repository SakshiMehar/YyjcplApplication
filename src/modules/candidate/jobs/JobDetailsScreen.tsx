import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle,
  ChevronLeft,
  Clock3,
  IndianRupee,
  MapPin,
  Users2,
} from 'lucide-react-native';
import { AppButton, AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, radius, scale, sizes, spacing, vs } from '../../../theme';
import { useApplyToJobMutation } from '../api/candidateApi';

/* ─── Detail row inside the info card ───────────────────────────────────── */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
}) {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailText}>
        <AppText variant="caption" color="textMuted" style={styles.detailLabel}>
          {label}
        </AppText>
        <AppText variant="body" style={styles.detailValue}>
          {String(value)}
        </AppText>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function JobDetailsScreen({
  route,
  navigation,
}: CandidateScreenProps<'JobDetails'>) {
  const { job } = route.params;
  const insets = useSafeAreaInsets();

  const [applyToJob, { isLoading: isApplying }] = useApplyToJobMutation();
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    try {
      await applyToJob({ jobId: job.id }).unwrap();
      setApplied(true);
      Alert.alert(
        'Application Submitted! 🎉',
        `You've successfully applied for ${job.role} at ${job.companyName}. Good luck!`,
        [{ text: 'OK' }],
      );
    } catch (e) {
      const err = e as { status?: number; data?: { message?: string } };
      if (err?.status === 409) {
        Alert.alert('Already Applied', 'You have already applied for this job.');
        setApplied(true);
      } else {
        Alert.alert(
          'Could not apply',
          err?.data?.message ?? 'Please check your connection and try again.',
        );
      }
    }
  };

  const initials = (job.companyName ?? '')
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>

      {/* ── Hero header ── */}
      <View style={[styles.hero, { paddingTop: insets.top + vs(10) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={scale(12)}
          accessibilityLabel="Go back">
          <ChevronLeft size={scale(22)} color={colors.textOnPrimary} />
        </Pressable>

        <View style={styles.heroAvatar}>
          <AppText style={styles.heroAvatarText}>{initials || '?'}</AppText>
        </View>

        <AppText variant="h2" style={styles.heroRole} numberOfLines={2}>
          {job.role}
        </AppText>
        <AppText variant="body" style={styles.heroCompany} numberOfLines={1}>
          {job.companyName}
        </AppText>

        {/* Status badge */}
        {job.approvalStatus === 'APPROVED' && (
          <View style={styles.heroBadge}>
            <AppText variant="caption" style={styles.heroBadgeText}>
              ✓  Actively Hiring
            </AppText>
          </View>
        )}
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Info card */}
        <View style={styles.card}>
          <AppText variant="bodyBold" style={styles.cardTitle}>
            Job Details
          </AppText>

          <DetailRow
            icon={<MapPin size={sizes.iconSm} color={colors.primary} />}
            label="Location"
            value={job.location}
          />
          <Divider />
          <DetailRow
            icon={<IndianRupee size={sizes.iconSm} color={colors.primary} />}
            label="Salary / CTC"
            value={job.salary}
          />
          <Divider />
          <DetailRow
            icon={<Clock3 size={sizes.iconSm} color={colors.primary} />}
            label="Experience Required"
            value={job.experience}
          />
          <Divider />
          <DetailRow
            icon={<Users2 size={sizes.iconSm} color={colors.primary} />}
            label="Openings"
            value={
              job.candidateVacancies
                ? `${job.candidateVacancies} position${job.candidateVacancies > 1 ? 's' : ''}`
                : undefined
            }
          />
          <Divider />
          <DetailRow
            icon={<Building2 size={sizes.iconSm} color={colors.primary} />}
            label="Company"
            value={job.companyName}
          />
        </View>

        {/* What you'll do — placeholder until API sends description */}
        <View style={styles.card}>
          <AppText variant="bodyBold" style={styles.cardTitle}>
            About the Role
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.aboutText}>
            {`We are looking for a talented ${job.role} to join our team at ${job.companyName}. `}
            {job.experience
              ? `The ideal candidate should have ${job.experience} of relevant experience. `
              : ''}
            {job.location
              ? `This is a ${job.location.toLowerCase() === 'remote' ? 'fully remote' : `${job.location}-based`} position.`
              : ''}
          </AppText>
        </View>

        <View style={{ height: vs(16) }} />
      </ScrollView>

      {/* ── Sticky Apply button ── */}
      <View style={styles.footer}>
        {applied ? (
          <View style={styles.appliedRow}>
            <CheckCircle size={scale(20)} color={colors.success} />
            <AppText variant="bodyBold" style={styles.appliedText}>
              Applied Successfully
            </AppText>
          </View>
        ) : (
          <AppButton
            title="Apply Now"
            onPress={handleApply}
            loading={isApplying}
          />
        )}
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  /* Hero */
  hero: {
    backgroundColor: colors.text,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(28),
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: vs(20),
  },
  backBtn: {
    position: 'absolute',
    top: vs(16),
    left: spacing.lg,
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatar: {
    width: scale(70),
    height: scale(70),
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(8),
    marginBottom: vs(12),
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  heroAvatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: scale(22),
  },
  heroRole: {
    color: colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: vs(4),
  },
  heroCompany: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: vs(10),
  },
  heroBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(4),
  },
  heroBadgeText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },

  /* Content */
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },

  /* Cards */
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: vs(14),
  },
  cardTitle: {
    marginBottom: vs(14),
    color: colors.text,
  },

  /* Detail rows */
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: vs(10),
  },
  detailIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: vs(1),
  },
  detailValue: {
    color: colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: scale(32) + spacing.md,
  },

  /* About */
  aboutText: {
    lineHeight: vs(22),
  },

  /* Footer */
  footer: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(12),
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: vs(12),
  },
  appliedText: {
    color: colors.success,
  },
});
