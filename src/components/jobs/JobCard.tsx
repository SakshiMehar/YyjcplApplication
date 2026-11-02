import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BadgeCheck, Bookmark, ChevronRight, MapPin } from 'lucide-react-native';
import { Job } from '../../types/models';
import { colors, radius, scale, sizes, spacing, vs } from '../../theme';
import { formatJobType, formatSalaryRange } from '../../utils/format';
import AppText from '../common/AppText';
import Pressable from '../common/InteractivePressable';
import CompanyLogo from './CompanyLogo';

type Props = {
  job: Job;
  onPress?: () => void;
  /** Shows a bookmark button instead of the chevron. */
  onSavePress?: () => void;
  saved?: boolean;
};

/**
 * Job row card (candidate Home, Job Search; recruiter "My Jobs").
 *  [logo]  Title                         [save / ›]
 *          Company ✓
 *          📍 City · Full Time
 *          ₹8L – ₹12L / year
 */
export default function JobCard({ job, onPress, onSavePress, saved }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <CompanyLogo name={job.company.name} uri={job.company.logoUrl} size={scale(48)} />

      <View style={styles.body}>
        <AppText variant="bodyBold" numberOfLines={1}>
          {job.title}
        </AppText>
        <View style={styles.inline}>
          <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.shrink}>
            {job.company.name}
          </AppText>
          {job.company.isVerified ? <BadgeCheck size={scale(13)} color={colors.info} /> : null}
        </View>
        <View style={[styles.inline, styles.meta]}>
          <MapPin size={scale(12)} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.shrink}>
            {job.location} · {formatJobType(job.jobType)}
          </AppText>
        </View>
        <AppText variant="caption" color="primary" style={styles.salary}>
          {formatSalaryRange(job.minSalary, job.maxSalary)}
          {job.minSalary || job.maxSalary ? ' / year' : ''}
        </AppText>
      </View>

      {onSavePress ? (
        <Pressable
          onPress={onSavePress}
          hitSlop={scale(10)}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved jobs' : 'Save job'}>
          <Bookmark
            size={sizes.iconSm}
            color={saved ? colors.primary : colors.textMuted}
            fill={saved ? colors.primary : 'transparent'}
          />
        </Pressable>
      ) : (
        <ChevronRight size={sizes.iconSm} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: vs(12),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    boxShadow: `0px ${scale(2)}px ${scale(8)}px rgba(28, 25, 23, 0.05)`,
  },
  pressed: { opacity: 0.85 },
  body: { flex: 1, gap: vs(2) },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  shrink: { flexShrink: 1 },
  meta: { marginTop: vs(2) },
  salary: { marginTop: vs(4), fontWeight: '600' },
});
