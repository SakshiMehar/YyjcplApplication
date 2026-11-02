import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CalendarClock,
  CheckCircle2,
  CircleX,
  FileCheck2,
  FileText,
  RotateCw,
  UserRoundCheck,
} from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { colors, font, radius, scale, spacing } from '../../../theme';

const STATUS_META = {
  APPLIED: { label: 'Applied', color: colors.info, Icon: FileText },
  SHORTLISTED: { label: 'Shortlisted', color: colors.primary, Icon: UserRoundCheck },
  REJECTED: { label: 'Rejected', color: colors.danger, Icon: CircleX },
  INTERVIEW_SCHEDULED: { label: 'Interview scheduled', color: colors.warning, Icon: CalendarClock },
  NEXT_ROUND: { label: 'Next round', color: '#0F766E', Icon: RotateCw },
  SELECTED: { label: 'Selected', color: colors.success, Icon: CheckCircle2 },
  PLACED: { label: 'Placed', color: colors.success, Icon: CheckCircle2 },
  NOT_SELECTED: { label: 'Not selected', color: colors.textMuted, Icon: FileCheck2 },
} as const;

export default function ApplicationStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as keyof typeof STATUS_META] ?? {
    label: status.toLowerCase().replace(/(^|_)(\w)/g, (_, separator: string, letter: string) =>
      `${separator ? ' ' : ''}${letter.toUpperCase()}`,
    ),
    color: colors.textMuted,
    Icon: FileText,
  };
  const { Icon } = meta;

  return (
    <View style={[styles.badge, { backgroundColor: `${meta.color}18` }]}>
      <Icon size={scale(13)} color={meta.color} />
      <AppText variant="caption" style={[styles.label, { color: meta.color }]} numberOfLines={1}>
        {meta.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: scale(5),
  },
  label: { fontSize: font(11), fontWeight: '700' },
});
