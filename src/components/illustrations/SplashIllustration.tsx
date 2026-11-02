/* eslint-disable react-native/no-inline-styles -- every size is computed from the `size` prop */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import AppText from '../common/AppText';
import Avatar from './Avatar';
import BrandLogo from './BrandLogo';

/** Splash – job card with candidate & recruiter badges, on the orange gradient. */
export default function SplashIllustration({ size: s }: { size: number }) {
  const cardW = s * 0.64;
  const shadow = `0px ${s * 0.03}px ${s * 0.07}px rgba(120, 45, 0, 0.28)`;
  const t = (n: number) => ({ fontSize: s * n, lineHeight: s * n * 1.35 });

  return (
    <View style={{ width: s, height: s }}>
      <Ring d={s * 0.92} s={s} opacity={0.12} />
      <Ring d={s * 0.64} s={s} opacity={0.14} />

      {/* job card */}
      <View
        style={[
          styles.abs,
          styles.white,
          {
            width: cardW,
            left: (s - cardW) / 2,
            top: s * 0.27,
            padding: s * 0.045,
            borderRadius: s * 0.05,
            gap: s * 0.03,
            boxShadow: shadow,
          },
        ]}>
        <View style={[styles.row, { gap: s * 0.03 }]}>
          <BrandLogo size={s * 0.12} />
          <View style={styles.flex}>
            <AppText variant="bodyBold" numberOfLines={1} style={t(0.045)}>
              Frontend Developer
            </AppText>
            <AppText color="textSecondary" numberOfLines={1} style={t(0.034)}>
              Pune · Full-time
            </AppText>
          </View>
        </View>
        <View style={[styles.row, { gap: s * 0.02 }]}>
          {['₹6–9 LPA', '2+ yrs'].map(tag => (
            <View
              key={tag}
              style={{
                paddingHorizontal: s * 0.025,
                paddingVertical: s * 0.008,
                borderRadius: s * 0.03,
                backgroundColor: colors.primaryLight,
              }}>
              <AppText variant="bodyBold" color="primary" style={t(0.032)}>
                {tag}
              </AppText>
            </View>
          ))}
        </View>
        <View
          style={[
            styles.center,
            { height: s * 0.085, borderRadius: s * 0.03, backgroundColor: colors.primary },
          ]}>
          <AppText variant="bodyBold" color="textOnPrimary" style={t(0.038)}>
            Apply Now
          </AppText>
        </View>
      </View>

      {/* candidate badge */}
      <Badge s={s} label="Candidate" style={{ left: 0, top: s * 0.08, transform: [{ rotate: '-6deg' }] }} />
      {/* recruiter badge */}
      <Badge
        s={s}
        label="Recruiter"
        tone="soft"
        style={{ right: 0, bottom: s * 0.06, transform: [{ rotate: '5deg' }] }}
      />
    </View>
  );
}

function Ring({ d, s, opacity }: { d: number; s: number; opacity: number }) {
  return (
    <View
      style={[
        styles.abs,
        {
          width: d,
          height: d,
          borderRadius: d / 2,
          left: (s - d) / 2,
          top: (s - d) / 2,
          backgroundColor: `rgba(255,255,255,${opacity})`,
        },
      ]}
    />
  );
}

function Badge({
  s,
  label,
  tone,
  style,
}: {
  s: number;
  label: string;
  tone?: 'orange' | 'soft';
  style: object;
}) {
  return (
    <View
      style={[
        styles.abs,
        styles.white,
        styles.row,
        {
          gap: s * 0.022,
          padding: s * 0.025,
          paddingRight: s * 0.04,
          borderRadius: s * 0.06,
          boxShadow: `0px ${s * 0.02}px ${s * 0.05}px rgba(120, 45, 0, 0.25)`,
        },
        style,
      ]}>
      <Avatar size={s * 0.09} tone={tone} />
      <AppText variant="bodyBold" style={{ fontSize: s * 0.04, lineHeight: s * 0.055 }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  white: { backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});
