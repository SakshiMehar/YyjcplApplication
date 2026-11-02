import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { AppText, UserAvatar } from '../../../../components/common';
import Pressable from '../../../../components/common/InteractivePressable';
import { colors, scale, sizes, spacing } from '../../../../theme';
import { greeting } from '../../../../utils/format';

type Props = {
  companyName?: string;
  logoUrl?: string;
  hasUnread?: boolean;
  onLogoPress?: () => void;
  onBellPress?: () => void;
};

/** "Good Morning," + company name, with company logo and notification bell. */
export default function DashboardHeader({
  companyName,
  logoUrl,
  hasUnread,
  onLogoPress,
  onBellPress,
}: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onLogoPress} hitSlop={scale(4)} accessibilityLabel="Company profile">
        <UserAvatar name={companyName} uri={logoUrl} size={scale(48)} />
      </Pressable>

      <View style={styles.text}>
        <AppText variant="caption" color="textSecondary">
          {greeting()},
        </AppText>
        <AppText variant="h2" color="primary" numberOfLines={1}>
          {companyName || 'Your Company'}
        </AppText>
      </View>

      <Pressable
        onPress={onBellPress}
        hitSlop={scale(8)}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        style={({ pressed }) => [styles.bell, pressed && styles.pressed]}>
        <Bell size={sizes.iconMd * 0.85} color={colors.text} />
        {hasUnread ? <View style={styles.dot} /> : null}
      </Pressable>
    </View>
  );
}

const BELL = scale(44);
const DOT = scale(9);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1 },
  bell: {
    width: BELL,
    height: BELL,
    borderRadius: BELL / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: { opacity: 0.7 },
  dot: {
    position: 'absolute',
    top: BELL * 0.24,
    right: BELL * 0.26,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
