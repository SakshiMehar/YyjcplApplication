/**
 * PRIMARY RULE OF THIS PROJECT
 * ----------------------------
 * Every size (width, height, padding, margin, radius, icon, font) MUST go
 * through these helpers so the UI keeps the same proportions on every device.
 *
 *   scale(16)  -> horizontal sizes, padding, margins, icon sizes, radius
 *   vs(48)     -> vertical sizes (heights, vertical spacing)
 *   ms(16)     -> moderate scale, grows slower on tablets
 *   font(14)   -> font sizes
 *
 * BASE_WIDTH / BASE_HEIGHT = the frame size of your Figma/XD design.
 */
import { Dimensions, PixelRatio } from 'react-native';

export const BASE_WIDTH = 375;
export const BASE_HEIGHT = 812;

const { width, height } = Dimensions.get('window');
const SHORT_SIDE = Math.min(width, height);
const LONG_SIDE = Math.max(width, height);

export const scale = (size: number): number => (SHORT_SIDE / BASE_WIDTH) * size;

export const vs = (size: number): number => (LONG_SIDE / BASE_HEIGHT) * size;

export const ms = (size: number, factor = 0.5): number =>
  size + (scale(size) - size) * factor;

export const font = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(ms(size, 0.4)));

export const isTablet = SHORT_SIDE >= 600;
export const isSmallDevice = SHORT_SIDE < 360;

export const SCREEN = { width, height };

/** Cap for system font scaling so large accessibility fonts don't break layouts. */
export const MAX_FONT_MULTIPLIER = 1.2;
