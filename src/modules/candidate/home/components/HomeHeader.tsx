import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Bell, EllipsisVertical } from 'lucide-react-native';
import { AppText, UserAvatar } from '../../../../components/common';
import InteractivePressable from '../../../../components/common/InteractivePressable';
import { colors, radius, scale, sizes, spacing } from '../../../../theme';
import { firstName } from '../../../../utils/format';

type Props = {
  name?: string;
  avatarUrl?: string;
  hasUnread?: boolean;
  onAvatarPress?: () => void;
  onBellPress?: () => void;
  onMenuPress?: () => void;
};

/** A profile-first home greeting, with compact menu and notification controls. */
export default function HomeHeader({ name, avatarUrl, hasUnread, onAvatarPress, onBellPress, onMenuPress }: Props) {
  const first = firstName(name);
  return (
    <View style={styles.row}>
      <InteractivePressable
        onPress={onAvatarPress}
        hitSlop={scale(4)}
        accessibilityRole="button"
        accessibilityLabel="My profile"
        style={styles.profile}>
        <UserAvatar name={name} uri={avatarUrl} size={scale(48)} />
        <View style={styles.text}>
          <AppText variant="h3" numberOfLines={1}>
            Hello{first ? `, ${first}` : ''} 👋
          </AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={2}>
            Your dream job is closer than you think!
          </AppText>
        </View>
      </InteractivePressable>

      <InteractivePressable
        onPress={onMenuPress}
        hitSlop={scale(8)}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        style={styles.menu}>
        <EllipsisVertical size={scale(20)} color={colors.textSecondary} />
      </InteractivePressable>

      <InteractivePressable
        onPress={onBellPress}
        hitSlop={scale(8)}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        style={styles.bell}>
        <Bell size={sizes.iconMd * 0.85} color={colors.text} />
        {hasUnread ? <View style={styles.dot} /> : null}
      </InteractivePressable>
    </View>
  );
}

const BELL = scale(42);
const MENU = scale(32);
const DOT = scale(9);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  profile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { flex: 1 },
  menu: {
    width: MENU,
    height: MENU,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MENU / 2,
  },
  bell: {
    width: BELL,
    height: BELL,
    borderRadius: BELL / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primarySoft,
    backgroundColor: colors.background,
  },
  dot: {
    position: 'absolute',
    top: BELL * 0.2,
    right: BELL * 0.2,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
