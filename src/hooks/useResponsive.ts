import { useWindowDimensions } from 'react-native';

/** Live dimensions – use where rotation / foldables / split-screen matter. */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  return {
    width,
    height,
    isLandscape: width > height,
    isTablet: shortSide >= 600,
    isSmallDevice: shortSide < 360,
  };
}
