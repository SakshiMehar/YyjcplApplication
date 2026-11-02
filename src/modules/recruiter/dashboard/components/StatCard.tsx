import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText } from '../../../../components/common';
import Pressable from '../../../../components/common/InteractivePressable';
import { colors, ColorName, radius, scale, sizes, spacing, vs } from '../../../../theme';

type Props = {
  label: string;
  value?: number;
  icon: LucideIcon;
  tint: ColorName;
  onPress?: () => void;
};

/** Dashboard KPI tile: tinted icon, label and a big number. */
export default function StatCard({ label, value, icon: Icon, tint, onPress }: Props) {
  const color = colors[tint];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value ?? 'loading'}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <AppText variant="caption" color="textSecondary" style={styles.label} numberOfLines={1}>
          {label}
        </AppText>
        <View style={[styles.icon, { backgroundColor: `${color}1A` }]}>
          <Icon size={sizes.iconSm} color={color} />
        </View>
      </View>
      <AppText variant="h1" style={styles.value}>
        {value ?? '–'}
      </AppText>
      <View style={[styles.bar, { backgroundColor: color }]} />
    </Pressable>
  );
}

const ICON = scale(34);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: vs(14),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
    boxShadow: `0px ${scale(2)}px ${scale(8)}px rgba(28, 25, 23, 0.05)`,
  },
  pressed: { opacity: 0.8 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { flex: 1, marginRight: spacing.xs },
  icon: {
    width: ICON,
    height: ICON,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { marginTop: vs(10) },
  bar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '40%',
    height: vs(3),
    borderTopRightRadius: radius.sm,
  },
});
