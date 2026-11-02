import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, font, MAX_FONT_MULTIPLIER, radius, scale, sizes, spacing } from '../../theme';
import AppText from './AppText';

export type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  /** Helper text under the field (hidden while an error is shown). */
  hint?: string;
  /** Content inside the field on the left, e.g. an icon or "+91". */
  leftElement?: React.ReactNode;
  /** Content inside the field on the right, e.g. a show/hide password button. */
  rightElement?: React.ReactNode;
};

export default function AppInput({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  style,
  onFocus,
  onBlur,
  ...rest
}: AppInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="caption" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}>
        {leftElement ? <View style={styles.left}>{leftElement}</View> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          style={[styles.input, style]}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
      {error ? (
        <AppText variant="caption" color="danger" style={styles.helper}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textMuted" style={styles.helper}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.xs, fontWeight: '600' },
  field: {
    height: sizes.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
    boxShadow: `0px 0px 0px ${scale(3)}px rgba(249, 115, 22, 0.14)`,
  },
  fieldError: { borderColor: colors.danger },
  left: { marginRight: spacing.sm },
  right: { marginLeft: spacing.sm },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontSize: font(15),
    color: colors.text,
  },
  helper: { marginTop: spacing.xs },
});
