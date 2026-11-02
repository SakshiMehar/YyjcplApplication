import { TextStyle } from 'react-native';
import { font } from './responsive';

export const typography = {
  h1: { fontSize: font(28), lineHeight: font(34), fontWeight: '600' },
  h2: { fontSize: font(22), lineHeight: font(28), fontWeight: '600' },
  h3: { fontSize: font(18), lineHeight: font(24), fontWeight: '600' },
  body: { fontSize: font(15), lineHeight: font(22), fontWeight: '400' },
  bodyBold: { fontSize: font(15), lineHeight: font(22), fontWeight: '600' },
  caption: { fontSize: font(12), lineHeight: font(16), fontWeight: '400' },
  button: { fontSize: font(16), lineHeight: font(20), fontWeight: '600' },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
