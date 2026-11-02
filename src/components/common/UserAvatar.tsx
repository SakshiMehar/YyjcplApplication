import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, font } from '../../theme';
import { initials } from '../../utils/format';
import AppText from './AppText';

type Props = { name?: string; uri?: string; size: number };

/** Profile photo, or the user's initials on a soft orange circle. */
export default function UserAvatar({ name, uri, size }: Props) {
  const circle = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image source={{ uri }} style={[styles.base, circle]} />;
  }
  return (
    <View style={[styles.base, styles.fallback, circle]}>
      <AppText color="primary" style={[styles.text, { fontSize: font(size * 0.36) }]}>
        {initials(name) || '?'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  text: { fontWeight: '600' },
});
