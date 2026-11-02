export const colors = {
  primary: '#F97316',
  primaryDark: '#E25A0B',
  primaryLight: '#FFF1E6',
  primarySoft: '#FFD9BF',
  secondary: '#FDBA74',

  background: '#FFFFFF',
  surface: '#F8F8FA',
  border: '#ECE7E2',

  text: '#1C1917',
  textSecondary: '#6B6460',
  textMuted: '#A8A29E',
  textOnPrimary: '#FFFFFF',

  success: '#1F9D55',
  warning: '#D98E04',
  danger: '#D93025',
  info: '#2B7DE9',

  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;

/** CSS gradients – used with the `backgroundImage` style (built into React Native). */
export const gradients = {
  primary: 'linear-gradient(165deg, #FFA45C 0%, #F97316 52%, #E25A0B 100%)',
} as const;
