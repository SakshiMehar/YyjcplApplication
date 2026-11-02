/* eslint-disable react-native/no-inline-styles -- every size is computed from the `size` prop */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

type Props = {
  size: number;
  /** `onDark` = white logo for the orange splash background. */
  variant?: 'default' | 'onDark';
};

/** Briefcase logo badge drawn with Views – scales with `size`. */
export default function BrandLogo({ size: s, variant = 'default' }: Props) {
  const onDark = variant === 'onDark';
  const ink = onDark ? colors.textOnPrimary : colors.primary;
  const accent = onDark ? colors.primary : colors.primaryLight;

  return (
    <View
      style={[
        styles.center,
        {
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: onDark ? 'rgba(255,255,255,0.2)' : colors.primaryLight,
          borderWidth: onDark ? Math.max(1, s * 0.02) : 0,
          borderColor: 'rgba(255,255,255,0.65)',
        },
      ]}>
      {/* handle */}
      <View
        style={{
          width: s * 0.22,
          height: s * 0.1,
          borderWidth: s * 0.045,
          borderBottomWidth: 0,
          borderColor: ink,
          borderTopLeftRadius: s * 0.05,
          borderTopRightRadius: s * 0.05,
        }}
      />
      {/* body */}
      <View
        style={[
          styles.center,
          { width: s * 0.5, height: s * 0.33, borderRadius: s * 0.07, backgroundColor: ink },
        ]}>
        <View style={[styles.strap, { height: s * 0.035, top: s * 0.12, backgroundColor: accent }]} />
        <View
          style={{
            width: s * 0.09,
            height: s * 0.075,
            borderRadius: s * 0.015,
            backgroundColor: accent,
            marginTop: -s * 0.02,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  strap: { position: 'absolute', left: 0, right: 0 },
});
