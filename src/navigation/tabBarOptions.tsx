import React from 'react';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';
import AnimatedTabIcon from '../components/animated/AnimatedTabIcon';
import { colors, font, glass, shadows, vs } from '../theme';

const BAR_HEIGHT = vs(60); // icon + label, without the phone's system navigation area
const PAD_TOP = vs(8);
const PAD_BOTTOM = vs(6);

/**
 * Shared, responsive bottom tab styling for candidate & recruiter apps.
 * The height includes the bottom safe-area inset (3-button / gesture bar),
 * so labels are never cut off on any phone.
 */
export function useTabScreenOptions(): BottomTabNavigationOptions {
  const { bottom } = useSafeAreaInsets();
  return {
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: { fontSize: font(11), lineHeight: font(14), fontWeight: '600' },
    tabBarStyle: {
      height: BAR_HEIGHT + bottom,
      paddingTop: PAD_TOP,
      paddingBottom: bottom + PAD_BOTTOM,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      backgroundImage: glass.light.backgroundImage,
      boxShadow: shadows.md,
    },
  };
}

/** Options for one tab: title + lucide icon that pops when selected. */
export const tabOptions = (title: string, Icon: LucideIcon): BottomTabNavigationOptions => ({
  title,
  tabBarIcon: ({ color, focused }) => <AnimatedTabIcon Icon={Icon} color={color} focused={focused} />,
});
