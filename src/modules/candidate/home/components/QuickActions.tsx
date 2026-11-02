import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText } from '../../../../components/common';
import Pressable from '../../../../components/common/InteractivePressable';
import { colors, scale, spacing, vs } from '../../../../theme';

export type QuickAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
};

/** Row of round shortcut buttons (Saved Jobs, Applications, Profile, Career Services). */
export default function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <View style={styles.row}>
      {actions.map(({ key, label, icon: Icon, onPress }) => (
        <Pressable
          key={key}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
          <View style={styles.circle}>
            <Icon size={scale(22)} color={colors.primary} />
          </View>
          <AppText variant="caption" align="center" numberOfLines={2} style={styles.label}>
            {label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const CIRCLE = scale(56);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  item: { flex: 1, alignItems: 'center' },
  pressed: { opacity: 0.7 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  label: { marginTop: vs(8), fontWeight: '500', color: colors.text },
});
