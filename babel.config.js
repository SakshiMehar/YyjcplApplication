module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Needed by Zod v4 (`export * as core from ...`)
    '@babel/plugin-transform-export-namespace-from',
    // Reanimated 4 / worklets – must stay LAST
    'react-native-worklets/plugin',
  ],
};
