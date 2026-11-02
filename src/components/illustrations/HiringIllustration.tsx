/* eslint-disable react-native/no-inline-styles -- every size is computed from the `size` prop */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import AppText from '../common/AppText';
import Avatar from './Avatar';
import Chip from './Chip';

/** Onboarding 2 – "For employers": laptop dashboard + shortlisted candidate card. */
export default function HiringIllustration({ size: s }: { size: number }) {
  const screenW = s * 0.56;
  const screenH = s * 0.37;
  const screenTop = s * 0.32;
  const baseW = s * 0.7;
  const bars = [0.45, 0.7, 0.55, 0.9];

  return (
    <View style={{ width: s, height: s }}>
      {/* background blob */}
      <View
        style={[
          styles.abs,
          {
            width: s * 0.86,
            height: s * 0.86,
            borderRadius: s * 0.43,
            left: s * 0.07,
            top: s * 0.07,
            backgroundColor: colors.primaryLight,
          },
        ]}
      />

      {/* laptop screen */}
      <View
        style={[
          styles.abs,
          {
            width: screenW,
            height: screenH,
            left: (s - screenW) / 2,
            top: screenTop,
            padding: s * 0.016,
            borderRadius: s * 0.03,
            backgroundColor: colors.text,
            boxShadow: `0px ${s * 0.03}px ${s * 0.06}px rgba(28, 25, 23, 0.22)`,
          },
        ]}>
        <View style={[styles.screen, { padding: s * 0.03, borderRadius: s * 0.015, gap: s * 0.022 }]}>
          <View style={[styles.row, { gap: s * 0.025 }]}>
            <Avatar size={s * 0.075} />
            <View style={{ gap: s * 0.012 }}>
              <Line w={s * 0.18} h={s * 0.02} color={colors.primarySoft} />
              <Line w={s * 0.11} h={s * 0.02} color={colors.border} />
            </View>
          </View>
          <View style={[styles.row, styles.bars, { gap: s * 0.025 }]}>
            {bars.map((h, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: `${h * 100}%`,
                  borderRadius: s * 0.01,
                  backgroundColor: i === bars.length - 1 ? colors.primary : colors.primarySoft,
                }}
              />
            ))}
          </View>
        </View>
      </View>

      {/* laptop base */}
      <View
        style={[
          styles.abs,
          {
            width: baseW,
            height: s * 0.035,
            left: (s - baseW) / 2,
            top: screenTop + screenH,
            borderBottomLeftRadius: s * 0.025,
            borderBottomRightRadius: s * 0.025,
            backgroundColor: '#3F3A36',
          },
        ]}
      />

      {/* candidate card */}
      <View
        style={[
          styles.abs,
          styles.card,
          {
            left: 0,
            top: s * 0.08,
            padding: s * 0.03,
            borderRadius: s * 0.04,
            gap: s * 0.02,
            boxShadow: `0px ${s * 0.015}px ${s * 0.04}px rgba(28, 25, 23, 0.12)`,
          },
        ]}>
        <View style={[styles.row, { gap: s * 0.022 }]}>
          <Avatar size={s * 0.08} tone="soft" />
          <View style={{ gap: s * 0.012 }}>
            <Line w={s * 0.15} h={s * 0.018} color={colors.text} />
            <Line w={s * 0.1} h={s * 0.018} color={colors.border} />
          </View>
        </View>
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: s * 0.025,
            paddingVertical: s * 0.008,
            borderRadius: s * 0.03,
            backgroundColor: colors.primaryLight,
          }}>
          <AppText variant="bodyBold" color="primary" style={{ fontSize: s * 0.034, lineHeight: s * 0.048 }}>
            Shortlisted
          </AppText>
        </View>
      </View>

      {/* check badge */}
      <View
        style={[
          styles.abs,
          styles.center,
          {
            width: s * 0.13,
            height: s * 0.13,
            borderRadius: s * 0.065,
            right: s * 0.06,
            top: s * 0.16,
            backgroundColor: colors.primary,
            boxShadow: `0px ${s * 0.02}px ${s * 0.04}px rgba(249, 115, 22, 0.4)`,
          },
        ]}>
        <AppText
          variant="bodyBold"
          color="textOnPrimary"
          style={{ fontSize: s * 0.07, lineHeight: s * 0.09 }}>
          ✓
        </AppText>
      </View>

      <Chip base={s} label="24 New Applicants" style={{ right: 0, bottom: s * 0.08 }} />
    </View>
  );
}

function Line({ w, h, color }: { w: number; h: number; color: string }) {
  return <View style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: color }} />;
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  bars: { flex: 1, alignItems: 'flex-end' },
  screen: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.background },
});
