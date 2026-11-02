import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../theme';

type Props = {
  scroll?: boolean;
  padded?: boolean;
  backgroundColor?: string;
  children: React.ReactNode;
};

export default function MainContent({
  scroll = true,
  padded = true,
  backgroundColor = colors.surface,
  children,
}: Props) {
  const contentStyle = padded ? styles.padded : undefined;
  const bg = { backgroundColor };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, bg]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.grow, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  padded: { padding: spacing.lg },
});
