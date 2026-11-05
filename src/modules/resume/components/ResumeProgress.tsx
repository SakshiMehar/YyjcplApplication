import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/common';
import { colors, radius, spacing } from '../../../theme';

export default function ResumeProgress({ value }: { value: number }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <AppText variant="caption" color="textSecondary">
          Resume completeness
        </AppText>
        <AppText variant="caption" color="primary">
          {value}%
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  track: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
