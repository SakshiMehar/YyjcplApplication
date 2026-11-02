import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, scale, spacing } from '../../theme';

type Props = { total: number; active: number };

/** Onboarding pager indicator – active dot is a wider orange pill. */
export default function PageDots({ total, active }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === active && styles.active]} />
      ))}
    </View>
  );
}

const DOT = scale(8);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { width: DOT, height: DOT, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  active: { width: DOT * 2.75, backgroundColor: colors.primary },
});
