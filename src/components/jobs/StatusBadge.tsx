import React from 'react';
import { StyleSheet, View } from 'react-native';
import { APPLICATION_STATUS_META, ApplicationStatus } from '../../constants/applicationStatus';
import { colors, radius, spacing } from '../../theme';
import AppText from '../common/AppText';

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = APPLICATION_STATUS_META[status];
  return (
    <View style={[styles.badge, { borderColor: colors[meta.color] }]}>
      <AppText variant="caption" color={meta.color}>
        {meta.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
});
