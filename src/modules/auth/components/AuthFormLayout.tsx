import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenLayout } from '../../../layout';
import { colors, scale, spacing, vs } from '../../../theme';

/** White, scrollable, width-limited (tablet friendly) page for auth forms. */
export default function AuthFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScreenLayout showHeader={false} mainBackground={colors.background}>
      <View style={styles.container}>{children}</View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: scale(480),
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: vs(8),
    paddingBottom: vs(16),
  },
});
