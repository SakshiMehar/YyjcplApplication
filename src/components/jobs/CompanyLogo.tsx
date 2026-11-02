import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, font } from '../../theme';
import AppText from '../common/AppText';

type Props = { name: string; uri?: string; size: number };

/** Soft tints for companies without a logo – picked from the name so it never changes. */
const TINTS = [
  { bg: '#FFF1E6', fg: '#E25A0B' },
  { bg: '#E8F1FD', fg: '#2B7DE9' },
  { bg: '#E7F6EE', fg: '#1F9D55' },
  { bg: '#F3ECFD', fg: '#7C3AED' },
  { bg: '#FDECEC', fg: '#D93025' },
  { bg: '#FFF7E0', fg: '#B7791F' },
];

const tintFor = (name: string) =>
  TINTS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length];

/** Company logo in a rounded square; first letter on a tint when no logo exists. */
export default function CompanyLogo({ name, uri, size }: Props) {
  const box = { width: size, height: size, borderRadius: size * 0.28 };
  if (uri) {
    return (
      <View style={[styles.frame, box]}>
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      </View>
    );
  }
  const tint = tintFor(name || '?');
  return (
    <View style={[styles.letterBox, box, { backgroundColor: tint.bg }]}>
      <AppText style={[styles.letter, { color: tint.fg, fontSize: font(size * 0.42) }]}>
        {(name || '?').trim()[0]?.toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    padding: '12%',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  image: { width: '100%', height: '100%' },
  letterBox: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontWeight: '600' },
});
