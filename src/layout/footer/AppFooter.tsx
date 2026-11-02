import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, sizes, spacing } from '../../theme';

type Props = { children: React.ReactNode };

/** Sticky bottom area – action buttons (Apply, Save, Post Job, ...). */
export default function AppFooter({ children }: Props) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    minHeight: sizes.footerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
