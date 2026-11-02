import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChevronRight, Crown } from 'lucide-react-native';
import { AppText } from '../../../../components/common';
import Pressable from '../../../../components/common/InteractivePressable';
import { colors, gradients, radius, scale, sizes, spacing, vs } from '../../../../theme';

type Props = { onPress?: () => void };

/** Orange gradient "Upgrade to Premium" card. */
export default function PremiumBanner({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {/* decorative circles */}
      <View style={[styles.bubble, styles.bubbleLarge]} />
      <View style={[styles.bubble, styles.bubbleSmall]} />

      <View style={styles.icon}>
        <Crown size={sizes.iconMd} color={colors.textOnPrimary} />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyBold" color="textOnPrimary">
          Upgrade to Premium
        </AppText>
        <AppText variant="caption" color="textOnPrimary" style={styles.sub}>
          Get more opportunities & stand out to recruiters
        </AppText>
      </View>
      <View style={styles.arrow}>
        <ChevronRight size={sizes.iconSm} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const ICON = scale(44);
const ARROW = scale(30);
const BUBBLE = scale(120);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    paddingVertical: vs(18),
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    backgroundImage: gradients.primary,
    boxShadow: `0px ${scale(6)}px ${scale(16)}px rgba(249, 115, 22, 0.28)`,
  },
  pressed: { opacity: 0.9 },
  bubble: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.12)' },
  bubbleLarge: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    top: -BUBBLE * 0.45,
    right: -BUBBLE * 0.2,
  },
  bubbleSmall: {
    width: BUBBLE * 0.5,
    height: BUBBLE * 0.5,
    borderRadius: BUBBLE * 0.25,
    bottom: -BUBBLE * 0.25,
    left: BUBBLE * 0.6,
  },
  icon: {
    width: ICON,
    height: ICON,
    borderRadius: ICON / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  text: { flex: 1 },
  sub: { opacity: 0.92, marginTop: vs(2) },
  arrow: {
    width: ARROW,
    height: ARROW,
    borderRadius: ARROW / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
