const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Rive animations (.riv) and Lottie archives (.lottie) are bundled as assets
    assetExts: [...defaultConfig.resolver.assetExts, 'riv', 'lottie'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
