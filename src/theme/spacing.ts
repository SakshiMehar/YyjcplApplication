import { scale, vs } from './responsive';

export const spacing = {
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(24),
  xxl: scale(32),
} as const;

export const verticalSpacing = {
  xs: vs(4),
  sm: vs(8),
  md: vs(12),
  lg: vs(16),
  xl: vs(24),
} as const;

export const radius = {
  sm: scale(6),
  md: scale(10),
  lg: scale(16),
  pill: scale(999),
} as const;

export const sizes = {
  headerHeight: vs(56),
  footerHeight: vs(64),
  buttonHeight: vs(48),
  inputHeight: vs(48),
  iconSm: scale(18),
  iconMd: scale(24),
  iconLg: scale(32),
  avatar: scale(48),
} as const;
