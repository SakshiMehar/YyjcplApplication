import React, { useState } from 'react';
import { StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { colors, radius, scale, spacing, vs } from '../../theme';
import AppText from './AppText';

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
};

/**
 * One-time-code boxes. A single invisible TextInput covers the boxes,
 * so tapping, typing, pasting and SMS autofill all work naturally.
 */
export default function OtpInput({ value, onChange, length = 6, error, autoFocus = true }: Props) {
  const [focused, setFocused] = useState(false);
  const { width } = useWindowDimensions();

  // responsive: 6 boxes always fit the form width, max 52 each
  const gap = spacing.sm;
  const available = Math.min(width - spacing.xl * 2, scale(400));
  const box = Math.min((available - gap * (length - 1)) / length, scale(52));
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View>
      <View style={[styles.row, { gap }]}>
        {Array.from({ length }).map((_, i) => {
          const digit = value[i] ?? '';
          const isActive = focused && i === activeIndex;
          return (
            <View
              key={i}
              style={[
                styles.box,
                { width: box, height: box * 1.12 },
                !!digit && styles.filled,
                isActive && styles.active,
                !!error && styles.errorBox,
              ]}>
              {digit ? (
                <AppText variant="h2">{digit}</AppText>
              ) : isActive ? (
                <View style={styles.caret} />
              ) : null}
            </View>
          );
        })}
        <TextInput
          value={value}
          onChangeText={t => onChange(t.replace(/\D/g, '').slice(0, length))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={length}
          autoFocus={autoFocus}
          caretHidden
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.hiddenInput}
          accessibilityLabel="One-time password"
        />
      </View>
      {error ? (
        <AppText variant="caption" color="danger" align="center" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center' },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  filled: { borderColor: colors.primarySoft, backgroundColor: colors.background },
  active: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
    boxShadow: `0px 0px 0px ${scale(3)}px rgba(249, 115, 22, 0.14)`,
  },
  errorBox: { borderColor: colors.danger },
  caret: { width: 2, height: '40%', backgroundColor: colors.primary },
  // covers the boxes so a tap anywhere focuses it; invisible
  hiddenInput: { ...StyleSheet.absoluteFill, opacity: 0, color: 'transparent' },
  error: { marginTop: vs(10) },
});
