import { scale } from './responsive';

/** Reusable CSS-style shadows supported by the current React Native renderer. */
export const shadows = {
  sm: `0px ${scale(1)}px ${scale(4)}px rgba(28, 25, 23, 0.08)`,
  md: `0px ${scale(4)}px ${scale(12)}px rgba(28, 25, 23, 0.12)`,
  innerHighlight: `inset 0px ${scale(1)}px 0px rgba(255, 255, 255, 0.65)`,
  glow: (color = 'rgba(249, 115, 22, 0.32)') =>
    `0px ${scale(6)}px ${scale(14)}px ${color}`,
} as const;

/** Gradients for controls and elevated surfaces. Apply with `backgroundImage`. */
export const gradientPresets = {
  primary: 'linear-gradient(165deg, #FFA45C 0%, #F97316 52%, #E25A0B 100%)',
  surface: 'linear-gradient(180deg, #FFFFFF 0%, #F8F8FA 100%)',
} as const;

/** Semi-transparent surface treatments for navigation and overlays. */
export const glass = {
  light: {
    backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 248, 250, 0.92) 100%)',
    borderColor: 'rgba(255, 255, 255, 0.72)',
  },
} as const;
