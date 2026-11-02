module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Needed by Zod v4 (`export * as core from ...`)
    '@babel/plugin-transform-export-namespace-from',
    // Keep worklets/reanimated plugin LAST when you add Reanimated later:
    // 'react-native-worklets/plugin',
  ],
};
