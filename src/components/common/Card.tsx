import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme';
import Pressable from './InteractivePressable';

type Props = ViewProps & { onPress?: () => void };

export default function Card({ style, onPress, children, ...rest }: Props) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.card, style]} {...rest}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    boxShadow: shadows.sm,
  },
});
