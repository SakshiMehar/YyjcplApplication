import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { AppText, UserAvatar } from '../../../../components/common';
import Pressable from '../../../../components/common/InteractivePressable';
import { colors, font, radius, scale, sizes, spacing, vs } from '../../../../theme';
import { RecruiterApplication } from '../../api/recruiterApi';
import { timeAgo } from '../../../../utils/format';

type Props = { application: RecruiterApplication; onPress?: () => void };

/* ─── Inline status badge ─────────────────────────────────────────────────── */
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  APPLIED:             { bg: '#DBEAFE', text: '#1D4ED8' },
  SHORTLISTED:         { bg: '#FFF1E6', text: colors.primary },
  INTERVIEW_SCHEDULED: { bg: '#FEF9C3', text: '#92400E' },
  SELECTED:            { bg: '#DCFCE7', text: colors.success },
  PLACED:              { bg: '#DCFCE7', text: colors.success },
  REJECTED:            { bg: '#FEE2E2', text: colors.danger },
  WITHDRAWN:           { bg: '#F3F4F6', text: colors.textMuted },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: '#F3F4F6', text: colors.textMuted };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <AppText style={[styles.badgeText, { color: s.text }]}>
        {status.replace(/_/g, ' ')}
      </AppText>
    </View>
  );
}

/** Applicant avatar, name, applied role, time ago and status. */
export default function RecentApplicationRow({ application, onPress }: Props) {
  const profile = application.jobSeekerProfile;
  const name = profile?.name ?? application.applicantName ?? application.jobSeekerName ?? `Job Seeker #${application.jobSeekerId}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <UserAvatar name={name} size={scale(46)} />

      <View style={styles.text}>
        <AppText variant="bodyBold" numberOfLines={1}>{name}</AppText>
        {application.job?.role ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {application.job.role}
          </AppText>
        ) : null}
        {profile?.headline ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {profile.headline}
          </AppText>
        ) : null}
        <AppText variant="caption" color="textMuted" style={styles.time}>
          {timeAgo(application.appliedAt)}
        </AppText>
      </View>

      <View style={styles.right}>
        <StatusBadge status={application.status} />
        <ChevronRight size={sizes.iconSm} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: vs(10),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: { opacity: 0.8 },
  text: { flex: 1 },
  time: { marginTop: vs(2) },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(2),
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: font(10),
    fontWeight: '700',
  },
});
