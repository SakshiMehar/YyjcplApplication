import React from 'react';
import { ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, ColorName, gradientPresets, radius, shadows, sizes, spacing } from '../../theme';
import AppText from './AppText';
import Pressable from './InteractivePressable';

type Variant = 'primary' | 'outline' | 'ghost' | 'onDark';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

const TEXT_COLOR: Record<Variant, ColorName> = {
  primary: 'textOnPrimary',
  outline: 'primary',
  ghost: 'primary',
  onDark: 'textOnPrimary',
};

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: Props) {
  const textColor = TEXT_COLOR[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      radialFill
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors[textColor]} />
      ) : (
        <AppText variant="button" color={textColor}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.buttonHeight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
    backgroundImage: gradientPresets.primary,
    boxShadow: shadows.glow(),
  },
  outline: { borderWidth: 1, borderColor: colors.primary, backgroundColor: 'transparent' },
  ghost: { backgroundColor: 'transparent' },
  onDark: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
