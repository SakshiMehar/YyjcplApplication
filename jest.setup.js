/* Mocks for native modules that don't exist in the Jest environment. */
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

/* Icons render as nothing in tests (lucide ships ESM .mjs files Jest doesn't transform). */
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

/* Firebase native modules don't exist in Jest – auth functions are plain mocks. */
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  getIdToken: jest.fn(() => Promise.resolve('test-id-token')),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  verifyPhoneNumber: jest.fn(),
  signInWithCredential: jest.fn(),
  linkWithCredential: jest.fn(),
  signOut: jest.fn(),
  PhoneAuthProvider: { credential: jest.fn() },
}));

/* Animation / graphics native modules (Reanimated, Skia, Lottie, Rive). */
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
// Reanimated 4.8's bundled mock crashes in Jest (setCSSEventHandler), so use a light manual one.
jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  const chain = new Proxy(function () {}, { get: () => () => chain, apply: () => chain });
  const identity = v => v;
  const animated = {
    View: RN.View,
    Text: RN.Text,
    Image: RN.Image,
    ScrollView: RN.ScrollView,
    createAnimatedComponent: c => c,
  };
  return {
    __esModule: true,
    default: animated,
    ...animated,
    useSharedValue: v => ({ value: v }),
    useDerivedValue: fn => ({ value: fn() }),
    useAnimatedStyle: fn => fn(),
    useAnimatedProps: fn => fn(),
    withTiming: identity,
    withSpring: identity,
    withDelay: (_, v) => v,
    withRepeat: identity,
    withSequence: (...v) => v[v.length - 1],
    interpolate: (_v, _input, output) => output[0],
    runOnJS: fn => fn,
    Easing: new Proxy({}, { get: () => () => identity }),
    FadeIn: chain,
    FadeOut: chain,
    FadeInDown: chain,
    FadeInUp: chain,
    ZoomIn: chain,
  };
});
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const component = () => () => null;
  return new Proxy(
    {
      rect: (x, y, width, height) => ({ x, y, width, height }),
      rrect: (r, rx, ry) => ({ rect: r, rx, ry }),
      vec: (x, y) => ({ x, y }),
      Canvas: ({ children }) => React.createElement(React.Fragment, null, children),
    },
    { get: (target, key) => (key in target ? target[key] : component()) },
  );
});
jest.mock('lottie-react-native', () => () => null);
jest.mock('rive-react-native', () => ({
  __esModule: true,
  default: () => null,
  Fit: { Contain: 'contain', Cover: 'cover' },
}));
